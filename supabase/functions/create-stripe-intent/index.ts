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
  userId: string;
  metadata?: Record<string, string>;
}

const PLAN_PRICES = {
  monthly: {
    free: { usd: 0, inr: 0 },
    premium: { usd: 399, inr: 9900 }, // $3.99 / ₹99 in cents/paise
    enterprise: { usd: 699, inr: 19900 }, // $6.99 / ₹199 in cents/paise
  },
  yearly: {
    free: { usd: 0, inr: 0 },
    premium: { usd: 4499, inr: 109900 }, // $44.99 / ₹1099 in cents/paise
    enterprise: { usd: 7999, inr: 219900 }, // $79.99 / ₹2199 in cents/paise
  },
};

const PLAN_NAMES = {
  free: "Free Plan",
  premium: "Premium Plan",
  enterprise: "Enterprise Plan",
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

    // Parse request
    const {
      planType,
      currency,
      userId,
      metadata = {},
    }: CreatePaymentIntentRequest & {
      billingInterval?: "monthly" | "yearly";
    } = await req.json();

    // Validate input
    if (!planType || !currency || !userId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: planType, currency, userId",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
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

    // Get user details
    const { data: user, error: userError } =
      await supabase.auth.admin.getUserById(userId);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate amount
    const billingInterval =
      (req.body?.billingInterval as "monthly" | "yearly") || "monthly";
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
      currency: currency.toUpperCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
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
        user_id: userId,
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
