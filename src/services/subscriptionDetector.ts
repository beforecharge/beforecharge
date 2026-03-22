/**
 * BeforeCharge — Gmail Subscription Detection Engine
 * 
 * 7-layer detection system:
 * Layer 1: Known billing sender database (highest accuracy)
 * Layer 2: Email domain pattern matching
 * Layer 3: Subject line pattern matching
 * Layer 4: Price/amount extraction from subject + body
 * Layer 5: Billing cycle detection
 * Layer 6: Service name extraction
 * Layer 7: Negative filters (exclude non-subscriptions)
 */

// ─────────────────────────────────────────────
// LAYER 1 — KNOWN BILLING SENDERS DATABASE
// ─────────────────────────────────────────────

interface KnownSender {
  name: string;
  category: string;
  confidence: number;
}

export const KNOWN_SENDERS: Record<string, KnownSender> = {
  // ── STREAMING ──────────────────────────────
  'receipts@netflix.com': { name: 'Netflix', category: 'Streaming', confidence: 99 },
  'info@mailer.netflix.com': { name: 'Netflix', category: 'Streaming', confidence: 99 },
  'no-reply@spotify.com': { name: 'Spotify', category: 'Music', confidence: 99 },
  'billing@spotify.com': { name: 'Spotify', category: 'Music', confidence: 99 },
  'no-reply@hulu.com': { name: 'Hulu', category: 'Streaming', confidence: 99 },
  'billing@disneyplus.com': { name: 'Disney+', category: 'Streaming', confidence: 99 },
  'no-reply@disneyplus.com': { name: 'Disney+', category: 'Streaming', confidence: 99 },
  'hbomax@hbomax.com': { name: 'HBO Max', category: 'Streaming', confidence: 99 },
  'no-reply@max.com': { name: 'Max', category: 'Streaming', confidence: 99 },
  'info@primevideo.com': { name: 'Amazon Prime', category: 'Streaming', confidence: 99 },
  'digital-no-reply@amazon.com': { name: 'Amazon', category: 'Shopping', confidence: 90 },
  'no-reply@apple.com': { name: 'Apple', category: 'Tech', confidence: 85 },
  'receipt@apple.com': { name: 'Apple', category: 'Tech', confidence: 99 },
  'no_reply@youtube.com': { name: 'YouTube Premium', category: 'Streaming', confidence: 99 },
  'no-reply@youtubepremium.com': { name: 'YouTube Premium', category: 'Streaming', confidence: 99 },
  
  // ── MUSIC ──────────────────────────────────
  'no-reply@music.apple.com': { name: 'Apple Music', category: 'Music', confidence: 99 },
  'noreply@tidal.com': { name: 'Tidal', category: 'Music', confidence: 99 },
  
  // ── CLOUD STORAGE ──────────────────────────
  'no-reply@dropbox.com': { name: 'Dropbox', category: 'Storage', confidence: 99 },
  'noreply@dropbox.com': { name: 'Dropbox', category: 'Storage', confidence: 99 },
  'noreply@google.com': { name: 'Google One', category: 'Storage', confidence: 80 },
  'payments-noreply@google.com': { name: 'Google', category: 'Tech', confidence: 99 },
  'no-reply@icloud.com': { name: 'iCloud+', category: 'Storage', confidence: 99 },
  
  // ── PRODUCTIVITY ───────────────────────────
  'billing@notion.so': { name: 'Notion', category: 'Productivity', confidence: 99 },
  'noreply@notion.so': { name: 'Notion', category: 'Productivity', confidence: 95 },
  'billing@todoist.com': { name: 'Todoist', category: 'Productivity', confidence: 99 },
  'no-reply@evernote.com': { name: 'Evernote', category: 'Productivity', confidence: 99 },
  'billing@linear.app': { name: 'Linear', category: 'Productivity', confidence: 99 },
  'noreply@linear.app': { name: 'Linear', category: 'Productivity', confidence: 95 },
  'billing@clickup.com': { name: 'ClickUp', category: 'Productivity', confidence: 99 },
  'no-reply@asana.com': { name: 'Asana', category: 'Productivity', confidence: 99 },
  'noreply@monday.com': { name: 'Monday.com', category: 'Productivity', confidence: 99 },
  'billing@trello.com': { name: 'Trello', category: 'Productivity', confidence: 99 },
  
  // ── AI TOOLS ───────────────────────────────
  'receipts@openai.com': { name: 'ChatGPT Plus', category: 'AI Tools', confidence: 99 },
  'billing@openai.com': { name: 'ChatGPT Plus', category: 'AI Tools', confidence: 99 },
  'noreply@anthropic.com': { name: 'Claude Pro', category: 'AI Tools', confidence: 99 },
  'billing@anthropic.com': { name: 'Claude Pro', category: 'AI Tools', confidence: 99 },
  'billing@midjourney.com': { name: 'Midjourney', category: 'AI Tools', confidence: 99 },
  'billing@cursor.sh': { name: 'Cursor', category: 'AI Tools', confidence: 99 },
  
  // ── DESIGN ─────────────────────────────────
  'billing@figma.com': { name: 'Figma', category: 'Design', confidence: 99 },
  'noreply@figma.com': { name: 'Figma', category: 'Design', confidence: 90 },
  'billing@adobe.com': { name: 'Adobe Creative', category: 'Design', confidence: 99 },
  'adobeid@adobe.com': { name: 'Adobe Creative', category: 'Design', confidence: 95 },
  'billing@canva.com': { name: 'Canva Pro', category: 'Design', confidence: 99 },
  'noreply@sketch.com': { name: 'Sketch', category: 'Design', confidence: 99 },
  'billing@framer.com': { name: 'Framer', category: 'Design', confidence: 99 },
  
  // ── DEVELOPER TOOLS ────────────────────────
  'noreply@github.com': { name: 'GitHub', category: 'Dev Tools', confidence: 80 },
  'billing@github.com': { name: 'GitHub', category: 'Dev Tools', confidence: 99 },
  'noreply@vercel.com': { name: 'Vercel', category: 'Dev Tools', confidence: 85 },
  'billing@vercel.com': { name: 'Vercel', category: 'Dev Tools', confidence: 99 },
  'billing@supabase.io': { name: 'Supabase', category: 'Dev Tools', confidence: 99 },
  'billing@digitalocean.com': { name: 'DigitalOcean', category: 'Dev Tools', confidence: 99 },
  'aws-billing@amazon.com': { name: 'AWS', category: 'Dev Tools', confidence: 99 },
  'billing@cloudflare.com': { name: 'Cloudflare', category: 'Dev Tools', confidence: 99 },
  
  // ── COMMUNICATION ──────────────────────────
  'billing@slack.com': { name: 'Slack', category: 'Communication', confidence: 99 },
  'billing@zoom.us': { name: 'Zoom', category: 'Communication', confidence: 99 },
  'billing@discord.com': { name: 'Discord Nitro', category: 'Communication', confidence: 99 },
  
  // ── HEALTH & FITNESS ───────────────────────
  'noreply@calm.com': { name: 'Calm', category: 'Health', confidence: 99 },
  'billing@calm.com': { name: 'Calm', category: 'Health', confidence: 99 },
  'noreply@headspace.com': { name: 'Headspace', category: 'Health', confidence: 99 },
  'noreply@peloton.com': { name: 'Peloton', category: 'Health', confidence: 99 },
  'billing@strava.com': { name: 'Strava', category: 'Health', confidence: 99 },
  
  // ── NEWS & READING ─────────────────────────
  'billing@nytimes.com': { name: 'NY Times', category: 'News', confidence: 99 },
  'billing@medium.com': { name: 'Medium', category: 'News', confidence: 99 },
  'no-reply@audible.com': { name: 'Audible', category: 'Learning', confidence: 99 },
  
  // ── GAMING ─────────────────────────────────
  'billing@xbox.com': { name: 'Xbox Game Pass', category: 'Gaming', confidence: 99 },
  'billing@playstation.com': { name: 'PlayStation Plus', category: 'Gaming', confidence: 99 },
  
  // ── SECURITY ───────────────────────────────
  'billing@1password.com': { name: '1Password', category: 'Security', confidence: 99 },
  'receipts@expressvpn.com': { name: 'ExpressVPN', category: 'Security', confidence: 99 },
  'billing@nordvpn.com': { name: 'NordVPN', category: 'Security', confidence: 99 },
};

// ─────────────────────────────────────────────
// LAYER 2 — DOMAIN PATTERNS
// ─────────────────────────────────────────────

interface DomainPattern {
  pattern: RegExp;
  confidence: number;
  category: string;
}

const SENDER_DOMAIN_PATTERNS: DomainPattern[] = [
  { pattern: /billing@(.+)\.com/i, confidence: 85, category: 'Unknown' },
  { pattern: /receipt[s]?@(.+)\.com/i, confidence: 90, category: 'Unknown' },
  { pattern: /invoice@(.+)\.com/i, confidence: 88, category: 'Unknown' },
  { pattern: /payment[s]?@(.+)\.com/i, confidence: 85, category: 'Unknown' },
  { pattern: /subscription[s]?@(.+)\.com/i, confidence: 90, category: 'Unknown' },
];

// ─────────────────────────────────────────────
// LAYER 3 — SUBJECT PATTERNS
// ─────────────────────────────────────────────

interface SubjectPattern {
  pattern: RegExp;
  type: string;
  confidence: number;
}

const SUBJECT_PATTERNS: SubjectPattern[] = [
  { pattern: /your (.*?) receipt/i, type: 'receipt', confidence: 90 },
  { pattern: /receipt for (.*)/i, type: 'receipt', confidence: 90 },
  { pattern: /subscription renewed/i, type: 'renewal', confidence: 95 },
  { pattern: /your (.*?) subscription/i, type: 'renewal', confidence: 88 },
  { pattern: /auto[- ]?renew/i, type: 'renewal', confidence: 90 },
  { pattern: /billing confirmation/i, type: 'renewal', confidence: 88 },
  { pattern: /payment confirmed/i, type: 'payment', confidence: 85 },
  { pattern: /upcoming (charge|renewal|payment)/i, type: 'upcoming', confidence: 95 },
  { pattern: /your (free )?trial (ends|is ending)/i, type: 'trial', confidence: 95 },
];

// ─────────────────────────────────────────────
// LAYER 4 — PRICE EXTRACTION
// ─────────────────────────────────────────────

const PRICE_PATTERNS = [
  /\$\s?(\d{1,4}(?:[,\.]\d{2})?)/g,
  /£\s?(\d{1,4}(?:[,\.]\d{2})?)/g,
  /€\s?(\d{1,4}(?:[,\.]\d{2})?)/g,
  /₹\s?(\d{1,6}(?:[,\.]\d{2})?)/g,
  /(?:INR|Rs\.?)\s?(\d{1,6}(?:[,\.]\d{2})?)/gi,
  /(\d{1,4}(?:[,\.]\d{2})?)\s?(?:USD|GBP|EUR|INR)/gi,
  /(?:amount|total|charged|paid):\s?(?:₹|Rs\.?|INR)?\s?(\d{1,6}(?:[,\.]\d{2})?)/gi,
];

const CURRENCY_DETECTORS = [
  { pattern: /\$/, currency: 'USD', symbol: '$' },
  { pattern: /£/, currency: 'GBP', symbol: '£' },
  { pattern: /€/, currency: 'EUR', symbol: '€' },
  { pattern: /₹/, currency: 'INR', symbol: '₹' },
];

// ─────────────────────────────────────────────
// LAYER 5 — BILLING CYCLE
// ─────────────────────────────────────────────

const BILLING_CYCLE_PATTERNS = [
  { pattern: /per month|\/month|monthly|every month/i, cycle: 'monthly' },
  { pattern: /per year|\/year|annually|annual|yearly/i, cycle: 'annual' },
  { pattern: /per week|\/week|weekly/i, cycle: 'weekly' },
  { pattern: /quarterly|every (3|three) months/i, cycle: 'quarterly' },
];

// ─────────────────────────────────────────────
// LAYER 7 — NEGATIVE FILTERS
// ─────────────────────────────────────────────

const NEGATIVE_PATTERNS = [
  /unsubscribe from (our )?newsletter/i,
  /promotional email/i,
  /sale|% off|discount|coupon|promo code/i,
  /tracking number|your order has shipped/i,
  /password reset|verify your email/i,
  /welcome to|getting started/i,
  /flight (booking|confirmation|ticket)/i,
  /hotel (booking|reservation|confirmation)/i,
  /GST invoice|tax invoice|purchase invoice/i,
  /order confirmation|order placed|order received/i,
  /delivery (scheduled|confirmed|update)/i,
  /booking (confirmed|reference|id)/i,
  /PNR|booking reference/i,
  /ICICI Bank|HDFC Bank|SBI|Axis Bank/i, // Indian banks (usually one-time transactions)
];

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface DetectedSubscription {
  messageId: string;
  serviceName: string;
  category: string;
  amount: number | null;
  currency: string;
  currencySymbol: string;
  billingCycle: string;
  nextChargeDate: string | null;
  confidence: number;
  detectionLayers: string[];
  rawFrom: string;
  rawSubject: string;
  rawDate: string;
}

interface EmailData {
  from: string;
  subject: string;
  body?: string;
  date: string;
  messageId: string;
}

// ─────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────

function extractPrice(text: string): { amount: number; currency: string; symbol: string } | null {
  for (const pattern of PRICE_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = Array.from(text.matchAll(pattern));
    
    for (const match of matches) {
      if (match && match[1]) {
        // Remove commas and parse
        const cleanAmount = match[1].replace(/,/g, '');
        const amount = parseFloat(cleanAmount);
        
        // Filter out unrealistic amounts
        if (amount < 0.5 || amount > 9999) continue;
        
        const currency = detectCurrency(text);
        return { amount, ...currency };
      }
    }
  }
  return null;
}

function detectCurrency(text: string): { currency: string; symbol: string } {
  for (const { pattern, currency, symbol } of CURRENCY_DETECTORS) {
    if (pattern.test(text)) return { currency, symbol };
  }
  return { currency: 'USD', symbol: '$' };
}

function capitalise(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function cleanServiceName(name: string): string {
  return name
    .replace(/\b(subscription|membership|plan|account|premium|plus|pro)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(capitalise)
    .join(' ');
}

function calculateNextCharge(dateString: string, billingCycle: string): string | null {
  try {
    const lastCharge = new Date(dateString);
    const next = new Date(lastCharge);
    
    switch (billingCycle) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'annual':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        next.setMonth(next.getMonth() + 1);
    }
    
    const now = new Date();
    while (next < now) {
      switch (billingCycle) {
        case 'weekly':
          next.setDate(next.getDate() + 7);
          break;
        case 'monthly':
          next.setMonth(next.getMonth() + 1);
          break;
        case 'quarterly':
          next.setMonth(next.getMonth() + 3);
          break;
        case 'annual':
          next.setFullYear(next.getFullYear() + 1);
          break;
        default:
          next.setMonth(next.getMonth() + 1);
      }
    }
    
    return next.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// MAIN DETECTION ENGINE
// ─────────────────────────────────────────────

export function analyseEmail(email: EmailData): DetectedSubscription | null {
  const { from, subject, body = '', date, messageId } = email;
  const fromLower = (from || '').toLowerCase().trim();
  const subjectLower = (subject || '').toLowerCase().trim();
  const bodyLower = (body || '').toLowerCase();
  const fullText = `${subjectLower} ${bodyLower}`;
  
  // Negative filter
  for (const pattern of NEGATIVE_PATTERNS) {
    if (pattern.test(subject) || pattern.test(body.slice(0, 500))) {
      return null;
    }
  }
  
  const result: DetectedSubscription = {
    messageId,
    serviceName: '',
    category: 'Other',
    amount: null,
    currency: 'USD',
    currencySymbol: '$',
    billingCycle: 'monthly',
    nextChargeDate: null,
    confidence: 0,
    detectionLayers: [],
    rawFrom: from,
    rawSubject: subject,
    rawDate: date,
  };
  
  // Layer 1: Known sender
  const knownSender = KNOWN_SENDERS[fromLower];
  if (knownSender) {
    result.serviceName = knownSender.name;
    result.category = knownSender.category;
    result.confidence = knownSender.confidence;
    result.detectionLayers.push('known_sender');
  }
  
  // Layer 2: Domain pattern
  if (!result.serviceName) {
    for (const { pattern, confidence, category } of SENDER_DOMAIN_PATTERNS) {
      const match = fromLower.match(pattern);
      if (match) {
        const emailParts = fromLower.split('@');
        if (emailParts.length === 2) {
          const domain = emailParts[1].split('.')[0];
          result.serviceName = capitalise(domain);
          result.category = category;
          result.confidence = Math.max(result.confidence, confidence);
          result.detectionLayers.push('domain_pattern');
        }
        break;
      }
    }
  }
  
  // Layer 3: Subject pattern
  let subjectBoost = 0;
  for (const { pattern, type, confidence } of SUBJECT_PATTERNS) {
    if (pattern.test(subject)) {
      subjectBoost = Math.max(subjectBoost, confidence - 50);
      result.detectionLayers.push(`subject_${type}`);
      break;
    }
  }
  result.confidence = Math.min(99, result.confidence + subjectBoost * 0.3);
  
  // Layer 4: Price extraction
  const priceData = extractPrice(fullText);
  if (priceData) {
    result.amount = priceData.amount;
    result.currency = priceData.currency;
    result.currencySymbol = priceData.symbol;
    result.confidence = Math.min(99, result.confidence + 8);
    result.detectionLayers.push('price_found');
  }
  
  // Layer 5: Billing cycle
  for (const { pattern, cycle } of BILLING_CYCLE_PATTERNS) {
    if (pattern.test(fullText)) {
      result.billingCycle = cycle;
      result.confidence = Math.min(99, result.confidence + 5);
      result.detectionLayers.push('cycle_found');
      break;
    }
  }
  
  // Calculate next charge date
  if (result.billingCycle && date) {
    result.nextChargeDate = calculateNextCharge(date, result.billingCycle);
  }
  
  // Discard if confidence too low or no service name
  if (result.confidence < 60 || !result.serviceName) {
    return null;
  }
  
  return result;
}

// ─────────────────────────────────────────────
// DEDUPLICATION
// ─────────────────────────────────────────────

export function deduplicateSubscriptions(detectedList: DetectedSubscription[]): DetectedSubscription[] {
  const map = new Map<string, DetectedSubscription & { occurrences: number }>();
  
  for (const sub of detectedList) {
    const key = sub.serviceName.toLowerCase().trim();
    
    if (map.has(key)) {
      const existing = map.get(key)!;
      const occurrences = existing.occurrences + 1;
      const freqBoost = occurrences >= 3 ? 10 : occurrences === 2 ? 5 : 0;
      
      map.set(key, {
        ...existing,
        amount: sub.amount || existing.amount,
        nextChargeDate: sub.nextChargeDate || existing.nextChargeDate,
        confidence: Math.min(99, Math.max(existing.confidence, sub.confidence) + freqBoost),
        occurrences,
      });
    } else {
      map.set(key, { ...sub, occurrences: 1 });
    }
  }
  
  return Array.from(map.values()).sort((a, b) => b.confidence - a.confidence);
}

// ─────────────────────────────────────────────
// GMAIL QUERY BUILDER
// ─────────────────────────────────────────────

export function buildGmailQueries(): string[] {
  const senderList = Object.keys(KNOWN_SENDERS);
  const batches: string[] = [];
  const batchSize = 30;
  
  for (let i = 0; i < senderList.length; i += batchSize) {
    const batch = senderList.slice(i, i + batchSize);
    batches.push(batch.map(s => `from:${s}`).join(' OR '));
  }
  
  // Add keyword-based queries
  batches.push([
    'subject:(receipt OR invoice OR "subscription renewed" OR "billing confirmation")',
    'subject:("auto-renew" OR "membership renewed")',
    'subject:("payment confirmed" OR "successfully charged")',
    'subject:("trial ending" OR "upcoming charge")',
  ].join(' OR '));
  
  return batches;
}
