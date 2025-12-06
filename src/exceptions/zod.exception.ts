import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ApiErrorResponse } from 'src/types/unifiedType';
import { isDevelopment } from 'src/utils/env.util';
import { ZodError } from 'zod';
import { Request, Response } from 'express';

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = HttpStatus.BAD_REQUEST;
    const errResponse: ApiErrorResponse = {
      statusCode: status,
      success: false,
      timestamp: new Date().toISOString(),
      message: 'Validation failed',
      path: req.url,
      fields: exception.issues.map((iss) => ({
        field: iss.path.join('.'),
        message: isDevelopment ? iss.message : iss.code,
      })),
    };

    res.status(status).json(errResponse);
    console.error('[UncaughtException]', exception);
  }
}
