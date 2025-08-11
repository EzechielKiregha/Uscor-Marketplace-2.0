// apps/back-api/api/index.ts
import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@vendia/serverless-express';
import type { Handler, Context, Callback } from 'aws-lambda';
import { AppModule } from 'src/app.module';

let cachedHandler: Handler | null = null;

async function bootstrapHandler(): Promise<Handler> {
  if (cachedHandler) return cachedHandler;

  // Create the Nest app and initialize it (do NOT call `listen`)
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? '*',
    credentials: true,
  });

  // apply any global pipes/middlewares that you need (validation, etc)
  // do not call app.listen() here
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  cachedHandler = serverlessExpress({ app: expressApp });

  return cachedHandler;
}

export const handler = async (event: any, context: Context, callback: Callback) => {
  const h = await bootstrapHandler();
  return h(event, context, callback);
};
