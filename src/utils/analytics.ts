/**
 * Utility for tracking Google Analytics events
 */

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', eventName, {
            ...params,
            send_to: 'G-MWJ1N43M5G',
        });
        console.log(`[Analytics] Tracked event: ${eventName}`, params);
    } else {
        // Falls back to logging in development if gtag isn't ready
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics-Mock] ${eventName}`, params);
        }
    }
};

/**
 * Common events for BeforeCharge
 */
export const ANALYTICS_EVENTS = {
    // Auth
    SIGN_UP_CLICK: 'sign_up_click',
    LOGIN_CLICK: 'login_click',
    GOOGLE_AUTH_CLICK: 'google_auth_click',
    GOOGLE_AUTH_SUCCESS: 'google_auth_success',

    // CTA
    HERO_CTA_CLICK: 'hero_cta_click',
    FOOTER_CTA_CLICK: 'footer_cta_click',
    START_FREE_CLICK: 'start_free_click',

    // Subscriptions
    ADD_SUBSCRIPTION_CLICK: 'add_subscription_click',
    AUTO_FETCH_CLICK: 'auto_fetch_click',
    SUB_DELETED: 'subscription_deleted',

    // Pricing
    PLAN_SELECT: 'plan_select',
    BILLING_TOGGLE: 'billing_interval_toggle',

    // Support
    CONTACT_US_CLICK: 'contact_us_click',
};
