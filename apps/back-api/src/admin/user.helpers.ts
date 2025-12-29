import { Prisma } from "../generated/prisma/client";

export function getPagination(page = 1, limit = 10) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));

  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
    page: safePage,
    limit: safeLimit
  };
}

export function buildSearchWhere(search?: string) {
  if (!search) return undefined;

  return {
    OR: [
      {
        name: {
          contains: search,
          mode: Prisma.QueryMode.insensitive
        }
      },
      {
        email: {
          contains: search,
          mode: Prisma.QueryMode.insensitive
        }
      },
      {
        phone: {
          contains: search,
          mode: Prisma.QueryMode.insensitive
        }
      },
      {
        fullName: {
          contains: search,
          mode: Prisma.QueryMode.insensitive
        }
      }
    ]
  };
}
