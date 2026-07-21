import {
    Inject,
    Injectable,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateBusinessInput } from './dto/update-business.input'
import { UpdateHardwareConfigInput } from './dto/update-hardware-config.input'
import { UpdatePaymentConfigInput } from './dto/update-payment-config.input'

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    @Inject('PUB_SUB') private pubSub: any,
  ) {}

  async getBusinessSettings(businessId: string) {
    const business =
      await this.prisma.business.findUnique({
        where: { id: businessId },
        include: {
          products: {
            select: {
              id: true,
              title: true,
              price: true,
              stock: true,
              createdAt: true,
            },
          },
          workers: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              createdAt: true,
            },
          },
          repostedItems: {
            select: {
              id: true,
              markupPercentage: true,
              createdAt: true,
            },
          },
          reownedItems: {
            select: {
              id: true,
              oldPrice: true,
              newPrice: true,
              markupPercentage: true,
              createdAt: true,
            },
          },
          recharges: {
            select: {
              id: true,
              amount: true,
              method: true,
              createdAt: true,
            },
          },
          ads: {
            select: {
              id: true,
              price: true,
              periodDays: true,
              createdAt: true,
              endedAt: true,
            },
          },
          freelanceServices: {
            select: {
              id: true,
              title: true,
              isHourly: true,
              rate: true,
              createdAt: true,
            },
          },
          referralsMade: {
            select: {
              id: true,
              verifiedPurchase: true,
              createdAt: true,
            },
          },
          referralsReceived: {
            select: {
              id: true,
              verifiedPurchase: true,
              createdAt: true,
            },
          },
          chatParticipants: {
            select: {
              chat: {
                select: {
                  id: true,
                  status: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
          // Include payment & hardware config for frontend settings
          paymentConfig: true,
          hardwareConfig: true,
          // Include KYC documents (multiple) as frontend expects 'kyc' list
          kycDocuments: {
            select: {
              id: true,
              documentUrl: true,
              documentType: true,
              status: true,
              submittedAt: true,
              verifiedAt: true,
            },
          },
          // Include stores with nested products and product medias
          stores: {
            select: {
              id: true,
              name: true,
              address: true,
              products: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  medias: {
                    select: { url: true },
                  },
                },
              },
            },
          },
          postOfSales: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
              createdAt: true,
            },
          },
          kyc: {
            select: {
              id: true,
              status: true,
              submittedAt: true,
              verifiedAt: true,
            },
          },
        } as any,
      })

    return business
  }

  async updateBusinessProfile(
    businessId: string,
    input: UpdateBusinessInput,
  ) {
    const updated =
      await this.prisma.business.update({
        where: { id: businessId },
        data: { ...input },
        include: {
          products: {
            select: {
              id: true,
              title: true,
              price: true,
              stock: true,
              createdAt: true,
            },
          },
          workers: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              createdAt: true,
            },
          },
          repostedItems: {
            select: {
              id: true,
              markupPercentage: true,
              createdAt: true,
            },
          },
          reownedItems: {
            select: {
              id: true,
              oldPrice: true,
              newPrice: true,
              markupPercentage: true,
              createdAt: true,
            },
          },
          recharges: {
            select: {
              id: true,
              amount: true,
              method: true,
              createdAt: true,
            },
          },
          ads: {
            select: {
              id: true,
              price: true,
              periodDays: true,
              createdAt: true,
              endedAt: true,
            },
          },
          freelanceServices: {
            select: {
              id: true,
              title: true,
              isHourly: true,
              rate: true,
              createdAt: true,
            },
          },
          referralsMade: {
            select: {
              id: true,
              verifiedPurchase: true,
              createdAt: true,
            },
          },
          referralsReceived: {
            select: {
              id: true,
              verifiedPurchase: true,
              createdAt: true,
            },
          },
          chatParticipants: {
            select: {
              chat: {
                select: {
                  id: true,
                  status: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
          // Include payment & hardware config for frontend settings
          paymentConfig: true,
          hardwareConfig: true,
          // Include KYC documents (multiple) as frontend expects 'kyc' list
          kycDocuments: {
            select: {
              id: true,
              documentUrl: true,
              documentType: true,
              status: true,
              submittedAt: true,
              verifiedAt: true,
            },
          },
          // Include stores with nested products and product medias
          stores: {
            select: {
              id: true,
              name: true,
              address: true,
              products: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  medias: {
                    select: { url: true },
                  },
                },
              },
            },
          },
          postOfSales: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
              createdAt: true,
            },
          },
          kyc: {
            select: {
              id: true,
              status: true,
              submittedAt: true,
              verifiedAt: true,
            },
          },
        } as any,
      })
    await this.pubSub.publish(
      'SETTINGS_UPDATED',
      { settingsUpdated: updated },
    )
    return updated
  }

  async updatePaymentConfig(
    businessId: string,
    input: UpdatePaymentConfigInput,
  ) {
    const client = this.prisma as any
    const existing =
      await client.paymentConfig.findUnique({
        where: { businessId },
      })
    let result
    if (existing) {
      result = await client.paymentConfig.update({
        where: { businessId },
        data: { ...input },
      })
    } else {
      result = await client.paymentConfig.create({
        data: { ...input, businessId },
      })
    }
    const business =
      await this.prisma.business.findUnique({
        where: { id: businessId },
        include: {
          products: {
            select: {
              id: true,
              title: true,
              price: true,
              stock: true,
              createdAt: true,
            },
          },
          workers: {
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              createdAt: true,
            },
          },
          repostedItems: {
            select: {
              id: true,
              markupPercentage: true,
              createdAt: true,
            },
          },
          reownedItems: {
            select: {
              id: true,
              oldPrice: true,
              newPrice: true,
              markupPercentage: true,
              createdAt: true,
            },
          },
          recharges: {
            select: {
              id: true,
              amount: true,
              method: true,
              createdAt: true,
            },
          },
          ads: {
            select: {
              id: true,
              price: true,
              periodDays: true,
              createdAt: true,
              endedAt: true,
            },
          },
          freelanceServices: {
            select: {
              id: true,
              title: true,
              isHourly: true,
              rate: true,
              createdAt: true,
            },
          },
          referralsMade: {
            select: {
              id: true,
              verifiedPurchase: true,
              createdAt: true,
            },
          },
          referralsReceived: {
            select: {
              id: true,
              verifiedPurchase: true,
              createdAt: true,
            },
          },
          chatParticipants: {
            select: {
              chat: {
                select: {
                  id: true,
                  status: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
          // Include payment & hardware config for frontend settings
          paymentConfig: true,
          hardwareConfig: true,
          // Include KYC documents (multiple) as frontend expects 'kyc' list
          kycDocuments: {
            select: {
              id: true,
              documentUrl: true,
              documentType: true,
              status: true,
              submittedAt: true,
              verifiedAt: true,
            },
          },
          // Include stores with nested products and product medias
          stores: {
            select: {
              id: true,
              name: true,
              address: true,
              products: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  medias: {
                    select: { url: true },
                  },
                },
              },
            },
          },
          postOfSales: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true,
              createdAt: true,
            },
          },
          kyc: {
            select: {
              id: true,
              status: true,
              submittedAt: true,
              verifiedAt: true,
            },
          },
        } as any,
      })
    if (business)
      await this.pubSub.publish(
        'SETTINGS_UPDATED',
        {
          settingsUpdated: business,
        },
      )
    return business
  }

  async updateHardwareConfig(
    businessId: string,
    input: UpdateHardwareConfigInput,
  ) {
    const client = this.prisma as any
    const existing =
      await client.hardwareConfig.findUnique({
        where: { businessId },
      })
    let result
    if (existing) {
      result = await client.hardwareConfig.update(
        {
          where: { businessId },
          data: { ...input },
        },
      )
    } else {
      result = await client.hardwareConfig.create(
        {
          data: { ...input, businessId },
        },
      )
    }
    const business =
      await this.prisma.business.findUnique({
        where: { id: businessId },
      })
    if (business)
      await this.pubSub.publish(
        'SETTINGS_UPDATED',
        {
          settingsUpdated: business,
        },
      )
    return result
  }

  async agreeToTerms(businessId: string) {
    const updated =
      await this.prisma.business.update({
        where: { id: businessId },
        data: {
          hasAgreedToTerms: true,
          termsAgreedAt: new Date(),
        },
      })
    await this.pubSub.publish(
      'SETTINGS_UPDATED',
      { settingsUpdated: updated },
    )
    return updated
  }
}
