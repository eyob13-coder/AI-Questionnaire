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

  // Global prefix
  app.setGlobalPrefix('api');

  // Cookie parser - required for reading Better Auth session cookies
  app.use(cookieParser());

  const frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  console.log(`CORS Origin: ${frontendUrl}`);

  // CORS - allow the Next.js frontend to send cookies cross-origin
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // In development, allow any origin to make debugging easier
      // In production, you should be more restrictive
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1') || origin.match(/^http:\/\/192\.168\.\d+\.\d+$/)) {
        callback(null, true);
      } else {
        callback(null, true); // Still allow for now to debug
      }
    },
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
