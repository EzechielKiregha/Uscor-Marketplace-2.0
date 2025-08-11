import 'tsconfig-paths/register';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  })); // Enable validation for incoming requests
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true, // if you're using cookies or auth headers
  });

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
