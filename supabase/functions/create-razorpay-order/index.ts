import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateRazorpayOrderRequest {
  planType: "free" | "premium" | "enterprise";
  currency: "INR";
  userId?: string;
  billingInterval?: "monthly" | "yearly";
  notes?: Record<string, string>;
}

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  key: string;
  order_id: string;
}

const PLAN_PRICES = {
  monthly: {
    free: 0,
    premium: 29900, // ₹299 in paise
    enterprise: 99900, // ₹999 in paise
  },
  yearly: {
    free: 0,
    premium: 299000, // ₹2990 in paise
    enterprise: 999000, // ₹9990 in paise
  },
};

const PLAN_NAMES = {
  free: "Free Plan",
  premium: "Personal Plan",
  enterprise: "Business / Teams Plan",
};

// Helper function to create Razorpay order
async function createRazorpayOrder(
  keyId: string,
  keySecret: string,
  amount: number,
  currency: string,
  receipt: string,
  notes: Record<string, string>,
) {
  const orderData = {
    amount,
    currency,
    receipt,
    notes,
  };

  const auth = btoa(`${keyId}:${keySecret}`);

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Razorpay API error: ${errorData.error?.description || "Unknown error"}`,
    );
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Razorpay credentials
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Require an authenticated user (prevents spoofing `userId` from the client)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuthed = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseAuthed.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request
    const {
      planType,
      currency,
      userId: bodyUserId,
      billingInterval = "monthly",
      notes = {},
    }: CreateRazorpayOrderRequest = await req.json();

    // Validate input
    if (!planType || !currency) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: planType, currency",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (bodyUserId && bodyUserId !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (planType === "free") {
      return new Response(
        JSON.stringify({ error: "Cannot create payment order for free plan" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!["premium", "enterprise"].includes(planType)) {
      return new Response(JSON.stringify({ error: "Invalid plan type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (currency !== "INR") {
      return new Response(
        JSON.stringify({
          error: "Only INR currency is supported for Razorpay",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Calculate amount
    const amount = PLAN_PRICES[billingInterval][planType];
    if (amount === undefined) {
      return new Response(
        JSON.stringify({
          error: "Invalid plan type or billing interval combination",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Generate unique receipt ID
    const receiptId = `sub_${user.id.slice(0, 8)}_${Date.now()}`;

    // Create Razorpay order
    const orderNotes = {
      userId: user.id,
      planType,
      billingInterval,
      userEmail: user.email || "",
      ...notes,
    };

    const razorpayOrder = await createRazorpayOrder(
      razorpayKeyId,
      razorpayKeySecret,
      amount,
      currency,
      receiptId,
      orderNotes,
    );

    // Store payment transaction record
    const { error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: user.id,
        payment_provider: "razorpay",
        order_id: razorpayOrder.id,
        amount,
        currency: currency,
        status: "pending",
        metadata: {
          planType,
          billingInterval,
          razorpay_order_id: razorpayOrder.id,
          receipt: receiptId,
        },
      });

    if (transactionError) {
      console.error("Error storing transaction:", transactionError);
      // Don't fail the request, but log the error
    }

    // Return order details for frontend
    const response: RazorpayOrderResponse = {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: razorpayKeyId,
      order_id: razorpayOrder.id,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
