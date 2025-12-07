import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { HttpExceptionFilter } from './exceptions/http.exception';
import { PrismaExceptionFilter } from './exceptions/prisma.exception';
import { ZodExceptionFilter } from './exceptions/zod.exception';
import { UncaughtExceptionFilter } from './exceptions/global.exception';
import { ConfigService } from '@nestjs/config';

BigInt.prototype.toJSON = function () {
  return this.toString();
};
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );
  app.useGlobalFilters(
    new UncaughtExceptionFilter(),
    new HttpExceptionFilter(),
    new ZodExceptionFilter(),
    new PrismaExceptionFilter(),
  );
  const port = Number(configService.get('PORT')) ?? 3000;

  await app.listen(port);
  console.log(' room reservation system is running on port ' + port);
  console.log('Node env: ' + process.env.NODE_ENV);
}
bootstrap();
