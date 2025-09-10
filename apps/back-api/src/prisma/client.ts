import { PrismaClient } from '../generated/prisma/client'

declare global {
  var __prismaClient: PrismaClient
}

export const prisma =
  globalThis.__prismaClient ??
  new PrismaClient({
    log:
      process.env.NODE_ENV !== 'production'
        ? ['query', 'info', 'warn', 'error']
        : [],
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaClient = prisma
}
