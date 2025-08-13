import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import serverlessExpress from '@vendia/serverless-express';

let cachedExpress: any;
let cachedServerless: any;

async function bootstrap() {
  if (!cachedExpress) {
    const app = await NestFactory.create(AppModule, { bodyParser: true });
    app.enableCors({
      origin: ["http://localhost:3000", "https://uscor-marketplace-2-0-front-ui.vercel.app"] ,
      credentials: true,
    });

    // Force Nest's GraphQLModule to mount at /graphql
    await app.init();
    cachedExpress = app.getHttpAdapter().getInstance();
    cachedServerless = serverlessExpress({ app: cachedExpress });
  }
  return { expressApp: cachedExpress, serverlessHandler: cachedServerless };
}

// For Vercel Node runtime (local dev & production if using Node serverless)
export default async function vercelHandler(req: any, res: any) {
  const { expressApp } = await bootstrap();
  return expressApp(req, res);
}

// For AWS Lambda-style runtime (if deployed to AWS Lambda)
export const handler = async (event: any, context: any, callback: any) => {
  const { serverlessHandler } = await bootstrap();
  return serverlessHandler(event, context, callback);
};
