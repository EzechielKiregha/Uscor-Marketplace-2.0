// apps/back-api/api/index.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import serverlessExpress from '@vendia/serverless-express';
import type { Handler, Context, Callback } from 'aws-lambda';

let cachedHandler: Handler | null = null;

async function bootstrapHandler(): Promise<Handler> {
  if (cachedHandler) return cachedHandler;
  try {
    const app = await NestFactory.create(AppModule, { bodyParser: true });
    app.enableCors({
      origin: process.env.CORS_ORIGIN ?? '*',
      credentials: true,
    });
    // apply global pipes if you want (validation, etc.)
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    cachedHandler = serverlessExpress({ app: expressApp });
    return cachedHandler;
  } catch (err: any) {
    console.error('Bootstrap error in serverless handler:', err && (err.stack || err));
    throw err; // rethrow so Vercel shows a 500 and logs the error
  }
}

export const handler = async (event: any, context: Context, callback: Callback) => {
  try {
    const h = await bootstrapHandler();
    return h(event, context, callback);
  } catch (err: any) {
    console.error('Handler error:', err && (err.stack || err));
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Server error', message: (err && err.message) || 'unknown' }),
    };
  }
};
