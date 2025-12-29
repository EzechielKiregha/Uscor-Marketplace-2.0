import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RejectKycInput } from './dto/reject-kyc.input';
import { UpdateUserStatusInput } from './dto/update-user-status.input';
import { PubSub } from 'graphql-subscriptions';
import { GetUsersInput } from './dto/get-users.input';
import { VerifyKycInput } from './dto/verify-kyc.input';
import { buildSearchWhere, getPagination } from './user.helpers';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @Inject('PUB_SUB') private pubSub: PubSub
  ) {}

  async getBusinesses(input: GetUsersInput) {
    const { search, status, kycStatus, businessType, page, limit } = input;
    const { skip, take, page: safePage, limit: safeLimit } =
      getPagination(page, limit);

    const where = {
      ...buildSearchWhere(search),
      ...(kycStatus && { kycStatus }),
      ...(businessType && { businessType })
    };

    const [items, total] = await Promise.all([
      this.prisma.business.findMany({
        where,
        skip,
        take,
        include: {
          stores: true,
          workers: { include: { kyc: true } },
          kyc: true
        }
      }),
      this.prisma.business.count({ where })
    ]);

    return { items, total, page: safePage, limit: safeLimit };
  }

  async getClients(input: GetUsersInput) {
    const { search, page, limit } = input;
    const { skip, take, page: safePage, limit: safeLimit } =
      getPagination(page, limit);

    const where = {
      ...buildSearchWhere(search)
    };

    const [items, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take,
        include: {
          addresses: true,
          paymentMethods: true
        }
      }),
      this.prisma.client.count({ where })
    ]);

    return { items, total, page: safePage, limit: safeLimit };
  }

  async getWorkers(input: GetUsersInput) {
    const { search, status, kycStatus, businessType, page, limit } = input;
    const { skip, take, page: safePage, limit: safeLimit } =
      getPagination(page, limit);

    const where = {
      ...buildSearchWhere(search),
      ...(status && { isVerified: status === 'VERIFIED' }),
      ...(kycStatus && { kyc: { status: kycStatus } }),
      ...(businessType && { business: { businessType } })
    };

    const [items, total] = await Promise.all([
      this.prisma.worker.findMany({
        where,
        skip,
        take,
        include: {
          business: {
            select: { name: true, businessType: true, kycStatus: true }
          },
          kyc: true
        }
      }),
      this.prisma.worker.count({ where })
    ]);

    return { items, total, page: safePage, limit: safeLimit };
  }

  async getAdmins(input: GetUsersInput) {
    const { search, status, page, limit } = input;
    const { skip, take, page: safePage, limit: safeLimit } =
      getPagination(page, limit);

    const where = {
      ...buildSearchWhere(search),
      ...(status && { isActive: status === 'ACTIVE' })
    };

    const [items, total] = await Promise.all([
      this.prisma.admin.findMany({ where, skip, take }),
      this.prisma.admin.count({ where })
    ]);

    return { items, total, page: safePage, limit: safeLimit };
  }

  // async getUsers(input: GetUsersInput) {
  //   const { 
  //     search, 
  //     userType, 
  //     status, 
  //     kycStatus, 
  //     businessType,
  //     page = 1,
  //     limit = 10 
  //   } = input;

  //   const safePage = Math.max(1, page);
  //   const safeLimit = Math.min(100, Math.max(1, limit));
  //   const skip = (safePage - 1) * safeLimit;

  //   // Common where conditions
  //   const commonWhere = search
  //     ? {
  //         OR: [
  //           { name: { contains: search, mode: 'insensitive' } },
  //           { email: { contains: search, mode: 'insensitive' } },
  //           { phone: { contains: search, mode: 'insensitive' } },
  //           { fullName: { contains: search, mode: 'insensitive' } }
  //         ]
  //       }
  //     : {};

  //   // Business-specific query
  //   if (userType === 'BUSINESS' || !userType) {
  //     const businessWhere: any = {
  //       ...commonWhere,
  //       ...(status && { kycStatus: status }),
  //       ...(kycStatus && { kycStatus }),
  //       ...(businessType && { businessType })
  //     };

  //     const [businesses, total] = await Promise.all([
  //       this.prisma.business.findMany({
  //         where: businessWhere,
  //         skip,
  //         take: safeLimit,
  //         include: {
  //           stores: true,
  //           workers: {
  //             include: {
  //               kyc: true
  //             }
  //           },
  //           kyc: true
  //         }
  //       }),
  //       this.prisma.business.count({ where: businessWhere })
  //     ]);

  //     return {
  //       businesses,
  //       total,
  //       page: safePage,
  //       limit: safeLimit
  //     };
  //   }

  //   // Client-specific query
  //   if (userType === 'CLIENT' || !userType) {
  //     const clientWhere: any = {
  //       ...commonWhere,
  //       ...(status && { /* Client status logic */ })
  //     };

  //     const [clients, total] = await Promise.all([
  //       this.prisma.client.findMany({
  //         where: clientWhere,
  //         skip,
  //         take: safeLimit,
  //         include: {
  //           addresses: true,
  //           paymentMethods: true
  //         }
  //       }),
  //       this.prisma.client.count({ where: clientWhere })
  //     ]);

  //     return {
  //       clients,
  //       total,
  //       page: safePage,
  //       limit: safeLimit
  //     };
  //   }

  //   // Worker-specific query
  //   if (userType === 'WORKER' || !userType) {
  //     const workerWhere: any = {
  //       ...commonWhere,
  //       ...(status && { isVerified: status === 'VERIFIED' }),
  //       ...(kycStatus && { 
  //         kyc: {
  //           status: kycStatus
  //         }
  //       }),
  //       ...(businessType && {
  //         business: {
  //           businessType: businessType
  //         }
  //       })
  //     };

  //     const [workers, total] = await Promise.all([
  //       this.prisma.worker.findMany({
  //         where: workerWhere,
  //         skip,
  //         take: safeLimit,
  //         include: {
  //           business: {
  //             select: {
  //               name: true,
  //               businessType: true,
  //               kycStatus: true
  //             }
  //           },
  //           kyc: true
  //         }
  //       }),
  //       this.prisma.worker.count({ where: workerWhere })
  //     ]);

  //     return {
  //       workers,
  //       total,
  //       page: safePage,
  //       limit: safeLimit
  //     };
  //   }

  //   // Admin-specific query
  //   if (userType === 'ADMIN' || !userType) {
  //     const adminWhere: any = {
  //       ...commonWhere,
  //       ...(status && { isActive: status === 'ACTIVE' })
  //     };

  //     const [admins, total] = await Promise.all([
  //       this.prisma.admin.findMany({
  //         where: adminWhere,
  //         skip,
  //         take: safeLimit
  //       }),
  //       this.prisma.admin.count({ where: adminWhere })
  //     ]);

  //     return {
  //       admins,
  //       total,
  //       page: safePage,
  //       limit: safeLimit
  //     };
  //   }

  //   // If no userType matches, return empty response
  //   return {
  //     businesses: [],
  //     clients: [],
  //     workers: [],
  //     admins: [],
  //     total: 0,
  //     page: safePage,
  //     limit: safeLimit
  //   };
  // }

  async getBusiness(id: string) {
    return this.prisma.business.findUnique({
      where: { id },
      include: {
        stores: true,
        workers: {
          include: {
            kyc: true
          }
        },
        kyc: true
      }
    });
  }

  async getClient(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
      include: {
        addresses: true,
        paymentMethods: true
      }
    });
  }

  async getWorker(id: string) {
    return this.prisma.worker.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            name: true,
            businessType: true,
            kycStatus: true
          }
        },
        kyc: true
      }
    });
  }

  async getAdmin(id: string) {
    return this.prisma.admin.findUnique({
      where: { id }
    });
  }

  async verifyKyc(input: VerifyKycInput) {
    const business = await this.prisma.business.update({
      where: { id: input.businessId },
      data: {
        kycStatus: 'VERIFIED',
        kyc: {
          update: {
            status: 'VERIFIED',
            verifiedAt: new Date(),
            documentUrl: input.notes
          }
        }
      },
      include: {
        kyc: true
      }
    });

    // Publish event
    await this.pubSub.publish('KYC_VERIFIED', { kycVerified: business });

    return business;
  }

  async rejectKyc(input: RejectKycInput) {
    const business = await this.prisma.business.update({
      where: { id: input.businessId },
      data: {
        kycStatus: 'REJECTED',
        kyc: {
          update: {
            status: 'REJECTED',
            rejectionReason: input.rejectionReason
          }
        }
      },
      include: {
        kyc: true
      }
    });

    // Publish event
    await this.pubSub.publish('KYC_REJECTED', { kycRejected: business });

    return business;
  }

  async updateUserStatus(input: UpdateUserStatusInput) {
    switch (input.userType) {
      case 'BUSINESS':
        return this.prisma.business.update({
          where: { id: input.id },
          data: {
            kycStatus: input.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING'
          }
        });

      case 'CLIENT':
        // In your schema, Client doesn't have a status field
        // You might need to add one or handle differently
        return this.prisma.client.update({
          where: { id: input.id },
          data: {
            // No status field in current schema
          }
        });

      case 'WORKER':
        return this.prisma.worker.update({
          where: { id: input.id },
          data: {
            isVerified: input.status === 'VERIFIED'
          }
        });

      case 'ADMIN':
        return this.prisma.admin.update({
          where: { id: input.id },
          data: {
            isActive: input.status === 'ACTIVE'
          }
        });

      default:
        throw new Error('Invalid user type');
    }
  }
}