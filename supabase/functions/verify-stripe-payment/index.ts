import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type PlanType = "free" | "premium" | "enterprise";

function computeExpiry(billingInterval: "monthly" | "yearly"): string {
  const expires = new Date();
  if (billingInterval === "yearly") {
    expires.setFullYear(expires.getFullYear() + 1);
  } else {
    expires.setMonth(expires.getMonth() + 1);
  }
  return expires.toISOString();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ verified: false, error: "Unauthorized" }), {
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
      return new Response(JSON.stringify({ verified: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const paymentIntentId = body.paymentIntentId || body.paymentId;
    if (!paymentIntentId) {
      return new Response(JSON.stringify({ verified: false, error: "Missing paymentIntentId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return new Response(
        JSON.stringify({ verified: false, status: paymentIntent.status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const metadataUserId = paymentIntent.metadata?.userId;
    if (metadataUserId && metadataUserId !== user.id) {
      return new Response(JSON.stringify({ verified: false, error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planType = (paymentIntent.metadata?.planType as PlanType | undefined) || "free";
    const billingInterval =
      (paymentIntent.metadata?.billingInterval as "monthly" | "yearly" | undefined) || "monthly";

    if (planType === "free") {
      return new Response(JSON.stringify({ verified: false, error: "Invalid planType" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expiresAt = computeExpiry(billingInterval);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Update profile plan
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        plan_type: planType,
        plan_expires_at: expiresAt,
        plan_provider: "stripe",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      throw profileError;
    }

    // Mark transaction succeeded (best effort)
    await supabaseAdmin
      .from("payment_transactions")
      .update({ status: "succeeded", updated_at: new Date().toISOString() })
      .eq("payment_intent_id", paymentIntentId);

    return new Response(
      JSON.stringify({ verified: true, planType, expiresAt }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error verifying Stripe payment:", error);
    return new Response(
      JSON.stringify({ verified: false, error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

