import nodemailer from 'nodemailer';

let transporter;

export const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
    console.log('[Mailer] Transporter initialized using SMTP credentials');
  } else {
    // Fallback log
    console.warn('[Mailer] Warning: No SMTP credentials found in .env. Mailer functions will fail.');
  }

  return transporter;
};

export const sendMail = async (options) => {
  try {
    const mailTransporter = getTransporter();
    if (!mailTransporter) {
      console.error('[Mailer] Cannot send mail: Transporter not initialized.');
      return null;
    }
    const info = await mailTransporter.sendMail({
      from: `"Chatify" <${process.env.SMTP_USER}>`,
      ...options
    });
    console.log(`[Mailer] Email sent successfully to: ${options.to}`);
    return info;
  } catch (err) {
    console.error('[Mailer] Failed to send email:', err);
    throw err;
  }
};
