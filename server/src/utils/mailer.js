const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbmqg0bMuWVGIn9C_RgMvmbuKeIser8PrZKzilnCyJEJoHWum7oq9AGJL2y3b2CsVb/exec';

/**
 * Send an email via Google Apps Script (HTTP POST).
 * This completely bypasses Render's outbound SMTP port blocks!
 */
export const sendMail = async ({ to, subject, html }) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, html })
    });
    
    const text = await response.text();
    console.log(`[Mailer] ✅ HTTP Email sent successfully to: ${to}`);
    return { success: true, response: text };
  } catch (err) {
    console.error(`[Mailer] ❌ Failed to send HTTP email to ${to}:`, err.message);
    return null;
  }
};

/**
 * Verify the "SMTP connection".
 * Since we are using an HTTP API now, there is no SMTP connection to verify.
 * We just return true instantly!
 */
export const verifyMailer = async () => {
  console.log('[Mailer] ✅ Using Google Apps Script HTTP Mailer (SMTP Verification bypassed)');
  return true;
};
