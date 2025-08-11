import { PrismaClient } from "src/generated/prisma/client";


declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient;
}

export const prisma =
  globalThis.__prismaClient ??
  new PrismaClient({
    log: process.env.NODE_ENV !== 'production' ? ['query', 'info', 'warn', 'error'] : [],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaClient = prisma;
}
