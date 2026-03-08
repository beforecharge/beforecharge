import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type PlanType = "free" | "premium" | "enterprise";

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpaySecret) {
      throw new Error("Razorpay secret not configured");
    }

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

    const razorpay_payment_id = body.razorpay_payment_id || body.paymentId;
    const razorpay_order_id = body.razorpay_order_id;
    const razorpay_signature = body.razorpay_signature;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({
          verified: false,
          error: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const expected = await hmacSha256Hex(
      razorpaySecret,
      `${razorpay_order_id}|${razorpay_payment_id}`,
    );

    if (expected !== razorpay_signature) {
      return new Response(JSON.stringify({ verified: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Load transaction metadata (planType/billingInterval) from our DB
    const { data: txn, error: txnError } = await supabaseAdmin
      .from("payment_transactions")
      .select("metadata")
      .eq("order_id", razorpay_order_id)
      .eq("user_id", user.id)
      .single();

    if (txnError) {
      throw txnError;
    }

    const planType = (txn?.metadata?.planType as PlanType | undefined) || "free";
    const billingInterval =
      (txn?.metadata?.billingInterval as "monthly" | "yearly" | undefined) || "monthly";

    if (planType === "free") {
      return new Response(JSON.stringify({ verified: false, error: "Invalid planType" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expiresAt = computeExpiry(billingInterval);

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        plan_type: planType,
        plan_expires_at: expiresAt,
        plan_provider: "razorpay",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      throw profileError;
    }

    await supabaseAdmin
      .from("payment_transactions")
      .update({ status: "succeeded", updated_at: new Date().toISOString() })
      .eq("order_id", razorpay_order_id);

    return new Response(
      JSON.stringify({ verified: true, planType, expiresAt }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    return new Response(
      JSON.stringify({ verified: false, error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

