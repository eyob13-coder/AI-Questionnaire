import { Module, Global } from '@nestjs/common';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';

@Global()
@Module({
  imports: [
    NestMailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('SMTP_HOST') || process.env.SMTP_HOST;
        const port = parseInt(config.get<string>('SMTP_PORT') || process.env.SMTP_PORT || '587', 10);
        const user = config.get<string>('SMTP_USER') || process.env.SMTP_USER;
        const pass = config.get<string>('SMTP_PASSWORD') || process.env.SMTP_PASSWORD;
        const from = config.get<string>('EMAIL_FROM') || process.env.EMAIL_FROM || 'Vaultix <noreply@vaultix.io>';

        if (!host || !user || !pass) {
          // Dev fallback when SMTP credentials are not configured
          return {
            transport: {
              jsonTransport: true,
            },
            defaults: {
              from,
            },
          };
        }

        return {
          transport: {
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
          },
          defaults: {
            from,
          },
        };
      },
    }),
  ],
  providers: [MailerService],
  exports: [MailerService, NestMailerModule],
})
export class MailerModule {}
