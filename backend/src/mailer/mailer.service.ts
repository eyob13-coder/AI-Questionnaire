import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly from: string;

  constructor() {
    this.from = process.env.EMAIL_FROM || 'Vaultix <noreply@vaultix.io>';
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !user || !pass) {
      this.logger.warn('SMTP configuration missing. Emails will not be sent.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendInviteEmail(to: string, workspaceName: string, inviterName: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const loginUrl = `${appUrl}/login`;

    if (!this.transporter) {
      this.logger.warn(`\n=========================================`);
      this.logger.warn(`[mailer] SMTP not configured. Simulated invitation email to: ${to}`);
      this.logger.warn(`[mailer] Workspace: ${workspaceName}`);
      this.logger.warn(`[mailer] Link: ${loginUrl}`);
      this.logger.warn(`=========================================\n`);
      return;
    }

    const html = `
      <div style="font-family: sans-serif; padding: 20px; background: #0b0f14; color: #f5f5f5;">
        <div style="max-width: 480px; margin: 0 auto; background: #0f1419; padding: 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
          <h2 style="color: #f97316; margin-top: 0;">You've been invited!</h2>
          <p>Hi there,</p>
          <p><strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on Vaultix.</p>
          <p>Vaultix helps you complete security questionnaires 10x faster using AI.</p>
          <a href="${loginUrl}" style="display: inline-block; background: #f97316; color: #fff; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold; margin-top: 16px;">
            Accept Invitation & Sign In
          </a>
          <p style="color: #8a92a4; font-size: 13px; margin-top: 24px;">
            If you don't have an account yet, you can sign up with this email address and you'll automatically be added to the workspace.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: `You have been invited to ${workspaceName} on Vaultix`,
        html,
      });
      this.logger.log(`Invite email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send invite email to ${to}`, err);
    }
  }
}
