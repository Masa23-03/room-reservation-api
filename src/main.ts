import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const portEnv = process.env.PORT;
  const port = portEnv ? Number(portEnv) : 3000;

  await app.listen(port);
  console.log(' room reservation system is running on port ' + port);
}
bootstrap();
