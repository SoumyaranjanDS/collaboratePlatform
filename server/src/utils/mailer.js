import nodemailer from 'nodemailer';
import dns from 'dns';

// Force IPv4 to avoid ETIMEDOUT on hosting providers (Render, Railway, etc.)
// that block IPv6 outbound connections to Gmail SMTP
dns.setDefaultResultOrder('ipv4first');

let transporter = null;

const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false'; // default true for port 465

  if (!user || !pass) {
    console.warn('[Mailer] ⚠️  SMTP_USER or SMTP_PASS not set — email will not work.');
    return null;
  }

  const t = nodemailer.createTransport({
    host,
    port,
    secure,                   // true = TLS on connect (port 465)
    family: 4,                // ← force IPv4 socket — fixes ETIMEDOUT on Render
    connectionTimeout: 10000, // 10s to establish TCP connection
    greetingTimeout: 10000,   // 10s for SMTP greeting
    socketTimeout: 30000,     // 30s idle socket timeout
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false // allow self-signed certs in dev
    }
  });

  console.log(`[Mailer] ✅ Transporter ready → ${host}:${port} (secure=${secure}, IPv4-forced)`);
  return t;
};

export const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

/**
 * Verify the SMTP connection on server startup.
 * Call this once from index.js so you know immediately if credentials are wrong.
 */
export const verifyMailer = async () => {
  const t = getTransporter();
  if (!t) return false;
  try {
    await t.verify();
    console.log('[Mailer] ✅ SMTP connection verified successfully');
    return true;
  } catch (err) {
    console.error('[Mailer] ❌ SMTP verification failed:', err.message);
    // Reset so next call recreates the transporter
    transporter = null;
    return false;
  }
};

/**
 * Send an email. Returns the nodemailer info object on success, or null on failure.
 * Never throws — errors are caught and logged so callers don't crash.
 *
 * @param {{ to: string, subject: string, html: string }} options
 */
export const sendMail = async ({ to, subject, html }) => {
  const t = getTransporter();
  if (!t) {
    console.error('[Mailer] ❌ Cannot send email — transporter not initialised.');
    return null;
  }

  try {
    const info = await t.sendMail({
      from: `"Chatify" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    console.log(`[Mailer] ✅ Email sent → ${to} (messageId: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error(`[Mailer] ❌ Failed to send to ${to}:`, err.message);
    // If the connection was killed, reset transporter so it reconnects next time
    if (['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED'].includes(err.code)) {
      console.warn('[Mailer] ⚠️  Resetting transporter due to connection error.');
      transporter = null;
    }
    return null;
  }
};
