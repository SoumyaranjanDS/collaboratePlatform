import nodemailer from 'nodemailer';
import dns from 'dns';
import { resolve4 } from 'dns/promises';

// Force IPv4 globally as a first line of defense
dns.setDefaultResultOrder('ipv4first');

let transporter = null;
let resolvedHost = null;

/**
 * Resolve SMTP host to an IPv4 address.
 * Render / Railway block IPv6 outbound, so we MUST connect via IPv4.
 */
const resolveHostIPv4 = async (hostname) => {
  try {
    const addresses = await resolve4(hostname);
    if (addresses.length > 0) {
      // DNS resolved
      return addresses[0];
    }
  } catch (err) {
    console.error(`[Mailer] ❌ DNS IPv4 resolve failed for ${hostname}:`, err.message);
  }
  return hostname; // fallback to hostname
};

/**
 * Create the nodemailer transporter.
 * Uses the IPv4 address directly to avoid Node.js 24 "happy eyeballs"
 * selecting an IPv6 address that is unreachable on cloud hosts.
 */
const createTransporter = async () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const originalHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE !== 'false'; // default true for 465

  if (!user || !pass) {
    console.warn('[Mailer] ⚠️  SMTP_USER or SMTP_PASS not set — email will not work.');
    return null;
  }

  // Resolve to IPv4 to bypass IPv6 blocks on Render
  const host = await resolveHostIPv4(originalHost);
  resolvedHost = host;

  const t = nodemailer.createTransport({
    host,
    port,
    secure,
    family: 4,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    auth: { user, pass },
    tls: {
      servername: originalHost,     // ← use original hostname for TLS cert validation
      rejectUnauthorized: false
    }
  });

  // Transporter ready
  return t;
};

/**
 * Get or create the transporter (lazy async init).
 */
export const getTransporter = async () => {
  if (!transporter) {
    transporter = await createTransporter();
  }
  return transporter;
};

/**
 * Verify the SMTP connection. Call from index.js at startup.
 */
export const verifyMailer = async () => {
  const t = await getTransporter();
  if (!t) return false;
  try {
    await t.verify();
    // SMTP connection verified successfully
    return true;
  } catch (err) {
    console.error('[Mailer] ❌ SMTP verification failed:', err.message);
    transporter = null; // reset so it retries next time
    return false;
  }
};

/**
 * Send an email. Never throws — errors are caught and logged.
 */
export const sendMail = async ({ to, subject, html }) => {
  const t = await getTransporter();
  if (!t) {
    console.error('[Mailer] ❌ Cannot send — transporter not initialised.');
    return null;
  }

  try {
    const info = await t.sendMail({
      from: `"Chatify" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    // Email sent
    return info;
  } catch (err) {
    console.error(`[Mailer] ❌ Failed to send to ${to}:`, err.message);
    if (['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENETUNREACH'].includes(err.code)) {
      console.warn('[Mailer] ⚠️  Resetting transporter due to connection error.');
      transporter = null;
    }
    return null;
  }
};
