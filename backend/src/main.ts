import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Global prefix — `/v1` so it doesn't collide with Next.js `/api/auth/*`
  // (Better Auth) on the frontend. Frontend routes proxied as `/v1/*`.
  app.setGlobalPrefix('v1');

  // Cookie parser - required for reading Better Auth session cookies
  app.use(cookieParser());

  const frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  console.log(`CORS Origin: ${frontendUrl}`);

  // CORS - allow the Next.js frontend to send cookies cross-origin.
  // In Replit dev, the browser hits `/v1/*` on the same origin and Next.js
  // rewrites server-side to localhost:3001, so CORS rarely matters here, but
  // we keep this permissive for direct calls (Swagger docs, manual curl, etc.)
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Translate Prisma connection drops into clean 503 responses.
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Swagger API docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vaultix API')
    .setDescription('AI-powered security questionnaire autofill API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('PORT', 3001);
  try {
    await app.listen(port);
  } catch (error) {
    const e = error as { code?: string; message?: string };
    if (e?.code === 'EADDRINUSE') {
      console.error(
        `Port ${port} is already in use. Stop the running process on that port and restart the backend.`,
      );
    }
    throw error;
  }
  console.log(`Vaultix API running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
void bootstrap();
