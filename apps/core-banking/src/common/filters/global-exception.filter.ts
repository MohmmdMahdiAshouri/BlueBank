import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppException } from '../exceptions/app.exception';
import { resolveRequestId } from '../../logging/request-id';

export interface ValidationErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
  path: string;
  timestamp: string;
  requestId: string;
}

function formatHttpExceptionError(name: string): string {
  if (!name || name === 'HttpException') {
    return 'HTTP_EXCEPTION';
  }

  const base = name.endsWith('Exception') ? name.slice(0, -'Exception'.length) : name;
  if (!base) {
    return 'HTTP_EXCEPTION';
  }

  return base
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .toUpperCase();
}

function extractHttpExceptionPayload(exception: HttpException): {
  message: string;
  details?: unknown;
} {
  const response = exception.getResponse();

  if (typeof response === 'string') {
    return { message: response };
  }

  if (response && typeof response === 'object') {
    const record = response as Record<string, unknown>;
    if (typeof record.message === 'string') {
      return {
        message: record.message,
        ...(record.details !== undefined ? { details: record.details } : {}),
      };
    }

    if (Array.isArray(record.message)) {
      return {
        message: exception.message,
        details: record.message,
      };
    }

    if (record.details !== undefined) {
      return {
        message: exception.message,
        details: record.details,
      };
    }
  }

  return { message: exception.message };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<FastifyRequest>();
    const response = ctx.getResponse<FastifyReply>();

    const path = httpAdapter.getRequestUrl(request);
    const timestamp = new Date().toISOString();
    const requestId = request.id || resolveRequestId(request.headers?.['x-request-id']);

    const { statusCode, body } = this.buildErrorResponse(
      exception,
      response,
      path,
      timestamp,
      requestId,
    );

    if (!httpAdapter.isHeadersSent(response)) {
      httpAdapter.reply(response, body, statusCode);
    } else {
      httpAdapter.end(response);
    }
  }

  private buildErrorResponse(
    exception: unknown,
    response: FastifyReply,
    path: string,
    timestamp: string,
    requestId: string,
  ): { statusCode: number; body: ApiErrorResponse } {
    if (exception instanceof ZodError) {
      const details: ValidationErrorDetail[] = exception.issues.map((issue) => ({
        path: issue.path.map((segment) => String(segment)).join('.'),
        message: issue.message,
      }));

      return {
        statusCode: HttpStatus.BAD_REQUEST,
        body: {
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'VALIDATION_FAILED',
          message: 'Validation failed',
          details,
          path,
          timestamp,
          requestId,
        },
      };
    }

    if (exception instanceof AppException) {
      const statusCode = exception.getStatus();

      return {
        statusCode,
        body: {
          statusCode,
          error: exception.code,
          message: exception.message,
          ...(exception.details !== undefined ? { details: exception.details } : {}),
          path,
          timestamp,
          requestId,
        },
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const { message, details } = extractHttpExceptionPayload(exception);

      return {
        statusCode,
        body: {
          statusCode,
          error: formatHttpExceptionError(exception.name),
          message,
          ...(details !== undefined ? { details } : {}),
          path,
          timestamp,
          requestId,
        },
      };
    }

    this.logger.error({ err: exception, path, requestId }, 'Unhandled exception');

    if (response?.raw) {
      response.raw.err =
        exception instanceof Error
          ? exception
          : new Error(typeof exception === 'string' ? exception : 'Unhandled non-error exception');
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
        path,
        timestamp,
        requestId,
      },
    };
  }
}
