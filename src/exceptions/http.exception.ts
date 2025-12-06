import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ApiErrorResponse } from 'src/types/unifiedType';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = exception.getStatus();

    const errResponse: ApiErrorResponse = {
      statusCode: status,
      success: false,
      timestamp: new Date().toISOString(),
      message: exception.message || 'Something went wrong',
      path: request.url,
    };
    response.status(status).json(errResponse);
    console.error('[UncaughtException]', exception);
  }
}
