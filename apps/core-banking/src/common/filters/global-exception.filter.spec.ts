import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
} from '@nestjs/common';
import type { HttpAdapterHost } from '@nestjs/core';
import { z } from 'zod';
import { AppException } from '../exceptions/app.exception';
import { GlobalExceptionFilter, type ApiErrorResponse } from './global-exception.filter';

interface CapturedReply {
  statusCode: number;
  body: ApiErrorResponse;
}

function createFilterHarness(
  requestOverrides: { id?: string; headers?: Record<string, string>; url?: string } = {},
) {
  let capturedReply: CapturedReply | undefined;
  const rawResponse: { err?: Error } = {};
  const request = {
    id: 'req-test-123',
    headers: {},
    url: '/api/v1/test',
    ...requestOverrides,
  };
  const response = { raw: rawResponse };

  const httpAdapter = {
    getRequestUrl: () => request.url,
    isHeadersSent: () => false,
    reply: (_res: unknown, body: ApiErrorResponse, statusCode: number) => {
      capturedReply = { statusCode, body };
    },
    end: () => undefined,
  };

  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;

  const filter = new GlobalExceptionFilter({ httpAdapter } as unknown as HttpAdapterHost);

  return {
    filter,
    host,
    rawResponse,
    getCapturedReply: () => capturedReply,
  };
}

describe('GlobalExceptionFilter', () => {
  it('formats ZodError into 400 VALIDATION_FAILED with path/message details', () => {
    // Arrange
    const { filter, host, getCapturedReply } = createFilterHarness({
      id: 'req-zod-1',
      url: '/api/v1/accounts',
    });
    const parsed = z
      .object({
        user: z.object({ email: z.email() }),
        amount: z.number().positive(),
      })
      .safeParse({ user: { email: 'bad' }, amount: -1 });
    assert.equal(parsed.success, false);

    // Act
    filter.catch(parsed.error, host);
    const reply = getCapturedReply();

    // Assert
    assert.ok(reply);
    assert.equal(reply.statusCode, HttpStatus.BAD_REQUEST);
    assert.equal(reply.body.statusCode, HttpStatus.BAD_REQUEST);
    assert.equal(reply.body.error, 'VALIDATION_FAILED');
    assert.equal(reply.body.message, 'Validation failed');
    assert.deepEqual(reply.body.details, [
      { path: 'user.email', message: parsed.error.issues[0].message },
      { path: 'amount', message: parsed.error.issues[1].message },
    ]);
    assert.equal(reply.body.path, '/api/v1/accounts');
    assert.equal(reply.body.requestId, 'req-zod-1');
    assert.ok(!Number.isNaN(Date.parse(reply.body.timestamp)));
  });

  it('preserves AppException status, code, message, and optional details', () => {
    // Arrange
    const { filter, host, getCapturedReply } = createFilterHarness({ id: 'req-app-1' });
    const exception = new AppException(
      'INSUFFICIENT_FUNDS',
      HttpStatus.UNPROCESSABLE_ENTITY,
      'Account balance is too low',
      { available: 50 },
    );

    // Act
    filter.catch(exception, host);
    const reply = getCapturedReply();

    // Assert
    assert.ok(reply);
    assert.equal(reply.statusCode, HttpStatus.UNPROCESSABLE_ENTITY);
    assert.equal(reply.body.statusCode, HttpStatus.UNPROCESSABLE_ENTITY);
    assert.equal(reply.body.error, 'INSUFFICIENT_FUNDS');
    assert.equal(reply.body.message, 'Account balance is too low');
    assert.deepEqual(reply.body.details, { available: 50 });
    assert.equal(reply.body.requestId, 'req-app-1');
  });

  it('maps Nest HttpException status and derives error from its class name', () => {
    // Arrange
    const { filter, host, getCapturedReply } = createFilterHarness({ id: 'req-http-1' });
    const forbidden = new ForbiddenException('Access denied');
    const badRequestWithArray = new BadRequestException(['first issue', 'second issue']);
    const baseHttp = new HttpException('Teapot error', HttpStatus.I_AM_A_TEAPOT);

    // Act
    filter.catch(forbidden, host);
    const forbiddenReply = getCapturedReply();
    filter.catch(badRequestWithArray, host);
    const badRequestReply = getCapturedReply();
    filter.catch(baseHttp, host);
    const baseHttpReply = getCapturedReply();

    // Assert
    assert.equal(forbiddenReply?.statusCode, HttpStatus.FORBIDDEN);
    assert.equal(forbiddenReply?.body.error, 'FORBIDDEN');
    assert.equal(forbiddenReply?.body.message, 'Access denied');
    assert.equal('details' in (forbiddenReply?.body ?? {}), false);

    assert.equal(badRequestReply?.statusCode, HttpStatus.BAD_REQUEST);
    assert.equal(badRequestReply?.body.error, 'BAD_REQUEST');
    assert.deepEqual(badRequestReply?.body.details, ['first issue', 'second issue']);

    assert.equal(baseHttpReply?.statusCode, HttpStatus.I_AM_A_TEAPOT);
    assert.equal(baseHttpReply?.body.error, 'HTTP_EXCEPTION');
    assert.equal(baseHttpReply?.body.message, 'Teapot error');
  });

  it('logs the real error and returns a generic 500 INTERNAL_ERROR without leaking details', (t) => {
    // Arrange
    const { filter, host, rawResponse, getCapturedReply } = createFilterHarness({
      id: 'req-err-1',
      url: '/api/v1/boom',
    });
    const errorLogMock = mock.method(Logger.prototype, 'error', () => undefined);
    t.after(() => errorLogMock.mock.restore());
    const secretError = new Error('postgres://admin:supersecret@db.internal:5432/ledger');

    // Act
    filter.catch(secretError, host);
    const reply = getCapturedReply();

    // Assert
    assert.ok(reply);
    assert.equal(reply.statusCode, HttpStatus.INTERNAL_SERVER_ERROR);
    assert.equal(reply.body.statusCode, HttpStatus.INTERNAL_SERVER_ERROR);
    assert.equal(reply.body.error, 'INTERNAL_ERROR');
    assert.equal(reply.body.message, 'Internal server error');
    assert.equal('details' in reply.body, false);
    assert.equal(reply.body.path, '/api/v1/boom');
    assert.equal(reply.body.requestId, 'req-err-1');
    assert.equal(JSON.stringify(reply.body).includes('supersecret'), false);
    assert.equal(JSON.stringify(reply.body).includes('global-exception.filter'), false);
    assert.equal(rawResponse.err, secretError);
    assert.equal(errorLogMock.mock.callCount(), 1);
    assert.deepEqual(errorLogMock.mock.calls[0].arguments[0], {
      err: secretError,
      path: '/api/v1/boom',
      requestId: 'req-err-1',
    });
  });
});
