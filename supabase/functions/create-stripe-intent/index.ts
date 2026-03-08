import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreatePaymentIntentRequest {
  planType: "free" | "premium" | "enterprise";
  currency: "usd" | "inr";
  userId?: string;
  billingInterval?: "monthly" | "yearly";
  metadata?: Record<string, string>;
}

const PLAN_PRICES = {
  monthly: {
    free: { usd: 0, inr: 0 },
    premium: { usd: 699, inr: 29900 }, // $6.99 / ₹299 in cents/paise
    enterprise: { usd: 1999, inr: 99900 }, // $19.99 / ₹999 in cents/paise
  },
  yearly: {
    free: { usd: 0, inr: 0 },
    premium: { usd: 6999, inr: 299000 }, // $69.99 / ₹2990 in cents/paise
    enterprise: { usd: 19900, inr: 999000 }, // $199.00 / ₹9990 in cents/paise
  },
};

const PLAN_NAMES = {
  free: "Free Plan",
  premium: "Personal Plan",
  enterprise: "Business / Teams Plan",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

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
      metadata = {},
    }: CreatePaymentIntentRequest = await req.json();

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
        JSON.stringify({ error: "Cannot create payment intent for free plan" }),
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

    if (!["usd", "inr"].includes(currency)) {
      return new Response(JSON.stringify({ error: "Invalid currency" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate amount
    const amount = PLAN_PRICES[billingInterval][planType][currency];
    if (amount === undefined) {
      return new Response(
        JSON.stringify({
          error: "Invalid plan, currency, or billing interval combination",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: user.id,
        planType,
        billingInterval,
        userEmail: user.email || "",
        ...metadata,
      },
      description: `${PLAN_NAMES[planType]} (${billingInterval}) - Subscription Manager`,
    });

    // Store payment transaction record
    const { error: transactionError } = await supabase
      .from("payment_transactions")
      .insert({
        user_id: user.id,
        payment_provider: "stripe",
        payment_intent_id: paymentIntent.id,
        amount,
        currency: currency.toUpperCase(),
        status: "pending",
        metadata: {
          planType,
          billingInterval,
          stripe_payment_intent_id: paymentIntent.id,
        },
      });

    if (transactionError) {
      console.error("Error storing transaction:", transactionError);
      // Don't fail the request, but log the error
    }

    // Return client secret and payment details
    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount,
        currency: currency.toUpperCase(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);

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
