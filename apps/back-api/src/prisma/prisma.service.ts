// apps/back-api/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../src/generated/prisma/client';

declare global {
  // allow a global var so we can persist the client across hot reloads / serverless instances
  // eslint-disable-next-line no-var
  var __prismaService__: PrismaService | undefined;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // call super() first (required for derived classes)
    super({
      log: process.env.NODE_ENV !== 'production' ? ['query', 'info', 'warn', 'error'] : undefined,
    });

    // If we're in development, reuse a global instance (avoids multiple connections on hot reload)
    if (process.env.NODE_ENV !== 'production') {
      if (!global.__prismaService__) {
        global.__prismaService__ = this;
      } else {
        // If there's already an instance, return it to reuse the same client
        return global.__prismaService__ as unknown as PrismaService;
      }
    }
    // In production we just use this new instance (no global reuse)
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      // optionally log; don't throw to avoid breaking serverless cold start flow
      console.warn('Prisma connect error (ignored):', err);
    }
  }

  async onModuleDestroy() {
    // Optionally disconnect in non-serverless environments
    try {
      if (process.env.NODE_ENV === 'production') {
        await this.$disconnect();
      }
    } catch (err) {
      // ignore
    }
  }
}
