import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    console.warn(
      `[mailer] Missing SMTP configuration. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD in .env`
    );
    return null;
  }

  console.log(`[mailer] Creating transporter for ${user}@${host}:${port}`);

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    // Gmail-specific settings
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Verify connection works
  transporter.verify(function (error, success) {
    if (error) {
      console.error("[mailer] Connection verification failed:", error);
    } else {
      console.log("[mailer] ✅ SMTP server is ready to send emails");
    }
  });

  return transporter;
}

const FROM = process.env.EMAIL_FROM || "Vaultix <noreply@vaultix.io>";

interface SendOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: SendOptions): Promise<void> {
  const trans = getTransporter();
  if (!trans) {
    console.warn(`[mailer] SMTP not configured`, {
      to: opts.to,
      subject: opts.subject,
    });
    return;
  }

  try {
    const result = await trans.sendMail({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    console.log(`[mailer] Email sent successfully: ${result.messageId}`);
  } catch (error) {
    console.error(`[mailer] Failed to send email to ${opts.to}:`, error);
    // Don't throw the error, otherwise the API request fails and the user gets a generic 500 error on the frontend.
    // The console.log fallback will have already printed the reset link/OTP.
  }
}

// ─── Templates ───────────────────────────────────────────────

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background:#0b0f14; color:#f5f5f5; padding:32px 16px;
`;
const cardStyles = `
  max-width:480px; margin:0 auto; background:#0f1419;
  border:1px solid rgba(255,255,255,0.08); border-radius:16px;
  padding:32px;
`;
const brandStyles = `
  font-size:20px; font-weight:700; color:#f97316; margin-bottom:24px;
`;
const buttonStyles = `
  display:inline-block; background:#f97316; color:#fff !important;
  padding:12px 24px; border-radius:999px; text-decoration:none;
  font-weight:600; margin:16px 0;
`;
const codeStyles = `
  display:inline-block; background:#1a2030; color:#f97316;
  font-family: "JetBrains Mono", monospace; font-size:32px;
  letter-spacing:8px; padding:16px 24px; border-radius:12px;
  border:1px solid rgba(249,115,22,0.3); margin:16px 0;
`;
const mutedStyles = `color:#8a92a4; font-size:13px; margin-top:24px;`;

export function otpEmailTemplate(otp: string, type: string): { subject: string; html: string; text: string } {
  const purpose =
    type === "forget-password"
      ? "to reset your password"
      : type === "sign-in"
        ? "to sign in"
        : "to verify your email address";

  return {
    subject: `Your Vaultix verification code: ${otp}`,
    text: `Your Vaultix verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="${baseStyles}">
        <div style="${cardStyles}">
          <div style="${brandStyles}">Vaultix</div>
          <h2 style="margin:0 0 8px 0; font-size:20px;">Your verification code</h2>
          <p style="color:#c8ced9; line-height:1.5; margin:0 0 16px 0;">
            Use the code below ${purpose}. It expires in 10 minutes.
          </p>
          <div style="text-align:center;">
            <div style="${codeStyles}">${otp}</div>
          </div>
          <p style="${mutedStyles}">
            If you didn't request this, you can safely ignore this email — no action will be taken on your account.
          </p>
        </div>
      </div>
    `,
  };
}

export function passwordResetEmailTemplate(resetUrl: string): { subject: string; html: string; text: string } {
  return {
    subject: "Reset your Vaultix password",
    text: `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
    html: `
      <div style="${baseStyles}">
        <div style="${cardStyles}">
          <div style="${brandStyles}">Vaultix</div>
          <h2 style="margin:0 0 8px 0; font-size:20px;">Reset your password</h2>
          <p style="color:#c8ced9; line-height:1.5; margin:0 0 16px 0;">
            Click the button below to choose a new password. The link expires in 1 hour.
          </p>
          <div style="text-align:center;">
            <a href="${resetUrl}" style="${buttonStyles}">Reset password</a>
          </div>
          <p style="${mutedStyles}">
            Or copy this link into your browser:<br/>
            <a href="${resetUrl}" style="color:#f97316; word-break:break-all;">${resetUrl}</a>
          </p>
          <p style="${mutedStyles}">
            If you didn't request a reset, ignore this email — your password won't change.
          </p>
        </div>
      </div>
    `,
  };
}
