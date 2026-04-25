import { Resend } from "resend";

let cached: Resend | null = null;

function getResend(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}

const FROM = process.env.EMAIL_FROM || "Vaultix <onboarding@resend.dev>";

interface SendOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: SendOptions): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn(
      `[mailer] RESEND_API_KEY not set — would have sent: ${opts.subject} → ${opts.to}`,
    );
    return;
  }

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    if (result.error) {
      console.error("[mailer] Resend rejected send:", result.error);
    }
  } catch (err) {
    console.error("[mailer] sendEmail failed:", err);
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
