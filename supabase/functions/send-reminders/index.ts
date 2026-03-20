// @ts-nocheck - Deno edge function with Deno-specific types
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  next_billing_date: string;
  reminder_days_before: number;
  is_trial?: boolean;
  profiles?: UserProfile;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  notification_preferences: {
    email_reminders: boolean;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all active subscriptions with upcoming renewals
    const { data: subscriptions, error: subsError } = await supabase
      .from("subscriptions")
      .select("*, profiles!inner(id, email, full_name, notification_preferences)")
      .eq("status", "active")
      .not("next_billing_date", "is", null);

    if (subsError) {
      throw subsError;
    }

    const remindersToSend: Array<{
      subscription: Subscription;
      user: UserProfile;
      daysUntilRenewal: number;
    }> = [];

    // Check which subscriptions need reminders
    for (const sub of subscriptions || []) {
      const nextBillingDate = new Date(sub.next_billing_date);
      nextBillingDate.setHours(0, 0, 0, 0);

      const daysUntilRenewal = Math.ceil(
        (nextBillingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      const reminderDays = sub.reminder_days_before || 3;

      // Check if user has email reminders enabled
      const notificationPrefs = sub.profiles?.notification_preferences || {};
      const emailRemindersEnabled = notificationPrefs.email_reminders !== false;

      // Send reminder if it matches the reminder days setting
      if (daysUntilRenewal === reminderDays && emailRemindersEnabled) {
        remindersToSend.push({
          subscription: sub,
          user: sub.profiles,
          daysUntilRenewal,
        });
      }

      // Also send reminder for trial expiration
      if (sub.is_trial && daysUntilRenewal === 1 && emailRemindersEnabled) {
        remindersToSend.push({
          subscription: sub,
          user: sub.profiles,
          daysUntilRenewal,
        });
      }
    }

    // Send email reminders
    const emailResults: Array<{
      success: boolean;
      subscription: string;
      user: string;
      error?: string;
    }> = [];
    for (const reminder of remindersToSend) {
      try {
        const emailSent = await sendReminderEmail(
          reminder.user,
          reminder.subscription,
          reminder.daysUntilRenewal
        );

        if (emailSent) {
          // Create in-app notification
          await supabase.from("notifications").insert({
            user_id: reminder.user.id,
            title: `Upcoming Renewal: ${reminder.subscription.name}`,
            message: `Your ${reminder.subscription.name} subscription will renew in ${reminder.daysUntilRenewal} day${reminder.daysUntilRenewal > 1 ? "s" : ""} for ${reminder.subscription.currency} ${reminder.subscription.amount}`,
            type: "reminder",
            related_subscription_id: reminder.subscription.id,
          });

          emailResults.push({
            success: true,
            subscription: reminder.subscription.name,
            user: reminder.user.email,
          });
        }
      } catch (error) {
        console.error(
          `Failed to send reminder for ${reminder.subscription.name}:`,
          error
        );
        emailResults.push({
          success: false,
          subscription: reminder.subscription.name,
          user: reminder.user.email,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: emailResults.length,
        results: emailResults,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-reminders function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

async function sendReminderEmail(
  user: UserProfile,
  subscription: Subscription,
  daysUntilRenewal: number
): Promise<boolean> {
  try {
    // Get email service configuration
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.warn("RESEND_API_KEY not configured, skipping email");
      return false;
    }

    const emailSubject = subscription.is_trial
      ? `Trial Ending Soon: ${subscription.name}`
      : `Renewal Reminder: ${subscription.name}`;

    const emailBody = subscription.is_trial
      ? `
        <h2>Your trial is ending soon!</h2>
        <p>Hi ${user.full_name || "there"},</p>
        <p>Your free trial for <strong>${subscription.name}</strong> will end in ${daysUntilRenewal} day${daysUntilRenewal > 1 ? "s" : ""}.</p>
        <p>After the trial ends, you'll be charged <strong>${subscription.currency} ${subscription.amount}</strong> ${subscription.billing_cycle}.</p>
        <p>If you don't want to continue, make sure to cancel before ${new Date(subscription.next_billing_date).toLocaleDateString()}.</p>
        <p><a href="${Deno.env.get("APP_URL") || "https://beforecharge.com"}/subscriptions">Manage your subscriptions</a></p>
        <p>Best regards,<br>BeforeCharge Team</p>
      `
      : `
        <h2>Subscription Renewal Reminder</h2>
        <p>Hi ${user.full_name || "there"},</p>
        <p>Your subscription to <strong>${subscription.name}</strong> will renew in ${daysUntilRenewal} day${daysUntilRenewal > 1 ? "s" : ""}.</p>
        <p>Amount: <strong>${subscription.currency} ${subscription.amount}</strong></p>
        <p>Renewal Date: <strong>${new Date(subscription.next_billing_date).toLocaleDateString()}</strong></p>
        <p><a href="${Deno.env.get("APP_URL") || "https://beforecharge.com"}/subscriptions">Manage your subscriptions</a></p>
        <p>Best regards,<br>BeforeCharge Team</p>
      `;

    // Send email using Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "BeforeCharge <notifications@beforecharge.com>",
        to: [user.email],
        subject: emailSubject,
        html: emailBody,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
