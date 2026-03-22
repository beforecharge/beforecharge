import type { NextApiRequest, NextApiResponse } from 'next';

// Gmail API configuration
const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

interface ScanRequest {
  accessToken: string;
  userId: string;
}

interface ScanResponse {
  success: boolean;
  subscriptions?: any[];
  emailsScanned?: number;
  totalDetected?: number;
  withPrices?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScanResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { accessToken, userId } = req.body as ScanRequest;

    if (!accessToken || !userId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Note: We don't need Supabase in the API route since we're just proxying Gmail API calls
    // The client already verified the user's session before calling this endpoint

    // Import the detection logic
    const subscriptionDetector = await import('../../../src/services/subscriptionDetector');
    const { analyseEmail, deduplicateSubscriptions, buildGmailQueries } = subscriptionDetector;

    // Build search queries
    const queries = buildGmailQueries();
    const allMessageIds = new Set<string>();

    // Step 1: Collect message IDs
    for (const query of queries.slice(0, 5)) {
      try {
        const url = new URL(`${GMAIL_API_BASE}/messages`);
        url.searchParams.set('q', query);
        url.searchParams.set('maxResults', '100');

        const response = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) continue;

        const data = await response.json();
        (data.messages || []).forEach((m: any) => allMessageIds.add(m.id));
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    }

    const messageIdArray = Array.from(allMessageIds);
    const detectedSubscriptions: any[] = [];

    // Step 2: Fetch and analyze emails (in batches with rate limiting)
    const BATCH_SIZE = 5; // Reduced for rate limiting
    const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay
    
    for (let i = 0; i < messageIdArray.length; i += BATCH_SIZE) {
      const batch = messageIdArray.slice(i, i + BATCH_SIZE);
      
      // Add delay between batches (except first batch)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
      
      const results = await Promise.allSettled(
        batch.map(async (messageId) => {
          try {
            // Fetch full message directly (includes headers + body)
            const fullRes = await fetch(
              `${GMAIL_API_BASE}/messages/${messageId}?format=full`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            if (!fullRes.ok) return null;

            const full = await fullRes.json();
            const headers = full.payload?.headers || [];
            const from = getHeader(headers, 'From');
            const subject = getHeader(headers, 'Subject');
            const date = getHeader(headers, 'Date');
            const snippet = full.snippet || '';
            const body = extractEmailBody(full.payload);

            // Analyze with full body for better price extraction
            return analyseEmail({
              from,
              subject,
              body: body || snippet,
              date,
              messageId,
            });
          } catch (err) {
            return null;
          }
        })
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value !== null) {
          detectedSubscriptions.push(result.value);
        }
      }
    }

    // Step 3: Deduplicate and filter
    const finalSubscriptions = deduplicateSubscriptions(detectedSubscriptions);
    const highConfidence = finalSubscriptions.filter(s => s.confidence >= 60);
    
    // Filter out subscriptions without prices (can't save them)
    const withPrices = highConfidence.filter(s => s.amount && s.amount > 0);

    // Return only the processed results (no email content)
    return res.status(200).json({
      success: true,
      subscriptions: withPrices,
      emailsScanned: messageIdArray.length,
      totalDetected: highConfidence.length,
      withPrices: withPrices.length,
    });

  } catch (error: any) {
    console.error('Gmail scan error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to scan Gmail'
    });
  }
}

// Helper function
function getHeader(headers: any[], name: string): string {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || '';
}

// Helper to extract email body from Gmail payload
function extractEmailBody(payload: any): string {
  if (!payload) return '';

  // Handle multipart emails
  if (payload.parts) {
    // Try to find text/plain first
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        try {
          return Buffer.from(part.body.data, 'base64')
            .toString('utf-8')
            .slice(0, 5000); // Increased to 5000 chars for better price extraction
        } catch (e) {
          // Continue to next part
        }
      }
    }
    
    // If no text/plain, try text/html
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        try {
          const html = Buffer.from(part.body.data, 'base64').toString('utf-8');
          // Strip HTML tags for text extraction
          const text = html
            .replace(/<style[^>]*>.*?<\/style>/gis, '')
            .replace(/<script[^>]*>.*?<\/script>/gis, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          return text.slice(0, 5000);
        } catch (e) {
          // Continue
        }
      }
    }
    
    // Recursively check nested parts
    for (const part of payload.parts) {
      if (part.parts) {
        const nested = extractEmailBody(part);
        if (nested) return nested;
      }
    }
  }

  // Single part email
  if (payload.body?.data) {
    try {
      const decoded = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      
      // Check if it's HTML
      if (payload.mimeType === 'text/html') {
        const text = decoded
          .replace(/<style[^>]*>.*?<\/style>/gis, '')
          .replace(/<script[^>]*>.*?<\/script>/gis, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        return text.slice(0, 5000);
      }
      
      return decoded.slice(0, 5000);
    } catch (e) {
      return '';
    }
  }

  return '';
}
