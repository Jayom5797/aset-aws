/**
 * OTP Service — Email-based password reset
 * Uses Nodemailer with Gmail SMTP — no sandbox, no AWS SES complexity
 */

const nodemailer = require('nodemailer');

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (not account password)
  }
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp) {
  await transporter.sendMail({
    from: `"ASET" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your ASET verification code',
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #0a0a0a; color: #fff; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #00ffaa; font-size: 28px; margin: 0;">ASET</h1>
          <p style="color: rgba(255,255,255,0.5); margin: 8px 0 0;">Academic Safety & Evidencing Truth</p>
        </div>
        <p style="color: rgba(255,255,255,0.8); font-size: 16px;">Your password reset code is:</p>
        <div style="background: rgba(0,255,170,0.1); border: 1px solid rgba(0,255,170,0.3); border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0;">
          <span style="font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #00ffaa;">${otp}</span>
        </div>
        <p style="color: rgba(255,255,255,0.5); font-size: 14px;">Expires in <strong style="color: #fff;">10 minutes</strong>. Do not share this code.</p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;">
        <p style="color: rgba(255,255,255,0.3); font-size: 12px; text-align: center;">If you didn't request this, ignore this email.</p>
      </div>
    `,
    text: `Your ASET verification code: ${otp}\n\nExpires in 10 minutes.`
  });
}

async function initOTPTable(db) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch())
    )
  `);
  await db.execute('CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email)');
}

async function createAndSendOTP(db, email) {
  const otp = generateOTP();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  await db.execute({ sql: 'DELETE FROM otp_codes WHERE email = ? AND used = 0', args: [email] });
  await db.execute({ sql: 'INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)', args: [email, otp, expiresAt] });
  await sendOTPEmail(email, otp);

  return { success: true, expiresIn: 600 };
}

async function verifyOTP(db, email, code) {
  const result = await db.execute({
    sql: 'SELECT id, expires_at, used FROM otp_codes WHERE email = ? AND code = ? ORDER BY created_at DESC LIMIT 1',
    args: [email, code]
  });

  if (!result.rows.length) return { valid: false, reason: 'Invalid code' };
  const row = result.rows[0];
  if (row.used) return { valid: false, reason: 'Code already used' };
  if (Date.now() > row.expires_at) return { valid: false, reason: 'Code expired' };

  await db.execute({ sql: 'UPDATE otp_codes SET used = 1 WHERE id = ?', args: [row.id] });
  return { valid: true };
}

module.exports = { initOTPTable, createAndSendOTP, verifyOTP };
