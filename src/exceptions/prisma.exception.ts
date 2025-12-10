import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { ApiErrorResponse } from 'src/types/unifiedType';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const errResponse: ApiErrorResponse = {
      statusCode: HttpStatus.BAD_REQUEST,
      success: false,
      timestamp: new Date().toISOString(),
      message: 'Invalid data or operation. Please check your input',
      path: req.url,
    };

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          errResponse.statusCode = HttpStatus.CONFLICT;
          errResponse.message = exception.message;

          if (exception.meta && exception.meta.target) {
            if (typeof exception.meta.target === 'string') {
              errResponse.message = `Unique constraint failed on the field: ${exception.meta.target}`;
              errResponse.fields = [
                {
                  field: exception.meta.target,
                  message: errResponse.message,
                },
              ];
            } else if (Array.isArray(exception.meta.target)) {
              const fields = exception.meta.target.join(', ');
              errResponse.message = `Unique constraint failed on the fields: ${fields}`;
              errResponse.fields = exception.meta.target.map((field) => ({
                field: String(field),
                message: `Unique constraint failed on: ${String(field)}`,
              }));
            }
          }
          break;

        case 'P2025':
          errResponse.statusCode = HttpStatus.NOT_FOUND;
          errResponse.message = 'Record not found';
          break;

        case 'P2003':
          errResponse.statusCode = HttpStatus.CONFLICT;
          errResponse.message = 'Invalid relation reference';
          break;

        case 'P2000':
          errResponse.statusCode = HttpStatus.BAD_REQUEST;
          errResponse.message = 'Value too long for column';
          break;

        case 'P2014':
          errResponse.statusCode = HttpStatus.CONFLICT;
          errResponse.message = 'Relation constraint failed';
          break;

        case 'P2024':
          errResponse.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
          errResponse.message = 'Database connection timeout';
          break;

        default:
          errResponse.message = exception.message;
      }
    }
    console.error('[UncaughtException]', exception);
    return res.status(errResponse.statusCode).json(errResponse);
  }
}
