import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

type ErrorLike = {
  code?: string;
  name?: string;
  message?: string;
  status?: number;
  getStatus?: () => number;
  getResponse?: () => unknown;
  meta?: {
    driverAdapterError?: {
      cause?: {
        kind?: string;
      };
    };
  };
};

function isDbConnectionError(exception: unknown): boolean {
  const err = exception as ErrorLike | undefined;
  const code = err?.code;
  const name = (err?.name || '').toLowerCase();
  const normalized = (err?.message || '').toLowerCase();
  const causeKind = err?.meta?.driverAdapterError?.cause?.kind;

  return (
    code === 'P1017' ||
    code === 'P1001' ||
    code === 'P1008' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNREFUSED' ||
    code === 'ECONNRESET' ||
    name.includes('prismaclientinitializationerror') ||
    causeKind === 'ConnectionClosed' ||
    normalized.includes('can\'t reach database server') ||
    normalized.includes('connection terminated unexpectedly') ||
    normalized.includes('server has closed the connection') ||
    normalized.includes('connection closed') ||
    normalized.includes('connection refused') ||
    normalized.includes('timed out')
  );
}

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const err = exception as ErrorLike;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json(exception.getResponse());
      return;
    }

    if (isDbConnectionError(exception)) {
      this.logger.warn(
        `Database connection issue (${err?.code ?? 'UNKNOWN'}): ${err?.message ?? 'No error message'}`,
      );
      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'Service Unavailable',
        message:
          'Database is temporarily unavailable. Please retry in a moment.',
      });
      return;
    }

    if (err?.code === 'P2002') {
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: 'A unique constraint was violated.',
      });
      return;
    }

    this.logger.error(
      `Unhandled exception in global filter: ${err?.name ?? 'UnknownError'} ${err?.message ?? ''}`,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'An unexpected server error occurred. Please try again.',
    });
  }
}
