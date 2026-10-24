import { Injectable, Logger } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly from: string;
  private readonly hasSmtpConfig: boolean;

  constructor(private readonly mailerService: NestMailerService) {
    this.from = process.env.EMAIL_FROM || 'Vaultix <noreply@vaultix.io>';
    this.hasSmtpConfig = Boolean(
      process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASSWORD,
    );
  }

  async sendInviteEmail(to: string, workspaceName: string, inviterName: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const loginUrl = `${appUrl}/login`;

    if (!this.hasSmtpConfig) {
      this.logger.warn(`\n=========================================`);
      this.logger.warn(`[@nestjs-modules/mailer] SMTP not configured. Simulated invitation email to: ${to}`);
      this.logger.warn(`[@nestjs-modules/mailer] Workspace: ${workspaceName}`);
      this.logger.warn(`[@nestjs-modules/mailer] Link: ${loginUrl}`);
      this.logger.warn(`=========================================\n`);
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
      await this.mailerService.sendMail({
        from: this.from,
        to,
        subject: `You have been invited to ${workspaceName} on Vaultix`,
        html,
      });
      this.logger.log(`Invite email sent to ${to} via @nestjs-modules/mailer`);
    } catch (err: any) {
      this.logger.error(`Failed to send invite email to ${to}: ${err?.message || err}`);
    }
  }

  /**
   * General purpose email sender via @nestjs-modules/mailer
   */
  async sendMail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }) {
    return this.mailerService.sendMail({
      from: this.from,
      ...options,
    });
  }
}
