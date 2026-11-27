import { HttpException, type HttpExceptionOptions } from '@nestjs/common';

export class AppException extends HttpException {
  readonly code: string;
  readonly details?: unknown;

  constructor(
    code: string,
    statusCode: number,
    message: string,
    details?: unknown,
    options?: HttpExceptionOptions,
  ) {
    super(message, statusCode, options);
    this.code = code;
    this.details = details;
  }
}
