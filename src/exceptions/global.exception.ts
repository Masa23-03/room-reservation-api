import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from 'src/types/unifiedType';

@Catch()
export class UncaughtExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const errResponse: ApiErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      timestamp: new Date().toISOString(),
      message: 'Internal server error',
      path: req.url,
    };

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errResponse);
    console.error('[UncaughtException]', exception);
  }
}
