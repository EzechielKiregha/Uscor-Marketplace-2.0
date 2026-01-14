import { hash } from 'argon2'
import { UpdateClientInput } from './dto/update-client.input'
import {
  CreateClientInput,
  CreateClientForPOSInput,
} from './dto/create-client.input'
import { PrismaService } from '../prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { AddressInput } from './dto/address.input'
import { PaymentMethodInput } from './dto/payment-method.input'
import { PaymentMethod, RechargeMethod } from '../generated/prisma/enums'
import { da } from '@faker-js/faker/.'

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(
    createClientInput: CreateClientInput,
  ) {
    const { password, ...clientData } =
      createClientInput
    const hashedPassword = await hash(password)

    return this.prisma.client.create({
      data: {
        ...clientData,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        address: true,
        phone: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async createForPOS(
    createClientInput: CreateClientForPOSInput,
  ) {
    // Generate a temporary password and username for POS clients
    // const tempPassword = Math.random()
    //   .toString(36)
    //   .slice(-8)
    const tempPassword = 'password123' // In production, generate a secure random password
    const hashedPassword = await hash(tempPassword) 
    const username =
      createClientInput.email.split('@')[0] +
      '_' +
      Date.now()

    return this.prisma.client.create({
      data: {
        username,
        email: createClientInput.email,
        fullName:
          createClientInput.fullName || '',
        phone: createClientInput.phone || '',
        address: createClientInput.address || '',
        password: hashedPassword,
        isVerified: false, // POS clients start unverified
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        address: true,
        phone: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async findAll() {
    return this.prisma.client.findMany({
      include: {
        addresses: true,
        paymentMethods: true,
        orders: {
          where: {
            payment: { status: 'COMPLETED' },
          },
          select: {
            id: true,
            createdAt: true,
            deliveryFee: true,
            totalAmount: true,
          },
        },
        recharges: {
          select: {
            id: true,
            amount: true,
            method: true,
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
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
          },
        },
        freelanceOrders: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
          },
        },
        referralsMade: {
          select: {
            id: true,
            verifiedPurchase: true,
          },
        },
        referralsReceived: {
          select: {
            id: true,
            verifiedPurchase: true,
          },
        },
        kyc: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
          },
        },
        postTransactions: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
      } as any,
    })
  }

  async findOne(id: string) {
    const client: any = await this.prisma.client.findUnique({
      where: { id },
      include: {
        addresses: true,
        paymentMethods: true,
        orders: {
          select: {
            id: true,
            createdAt: true,
            deliveryFee: true,
            deliveryAddress: true,
            totalAmount: true,
            payment: {
              select: {
                status: true,
                method: true,
              },
            },
            products: {
              select: {
                id: true,
                quantity: true,
                createdAt: true,
                product: {
                  select: {
                    id: true,
                    businessId: true,
                    title: true,
                    price: true,
                    createdAt: true,
                    medias: { select: { url: true }, take: 1 },
                    business: { select: { id: true, name: true, avatar: true } },
                    store: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
        recharges: {
          select: {
            id: true,
            amount: true,
            method: true,
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
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
          },
        },
        freelanceOrders: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
          },
        },
        referralsMade: {
          select: {
            id: true,
            verifiedPurchase: true,
          },
        },
        referralsReceived: {
          select: {
            id: true,
            verifiedPurchase: true,
          },
        },
        kyc: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
          },
        },
        postTransactions: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
      } as any,
    })

    // Normalize orders to include business/store/items and nested deliveryAddress object
    if (client && client.orders) {
      const businessIds = new Set<string>()
      for (const o of client.orders) {
        for (const op of o.products || []) {
          const bId = op.product?.businessId || op.product?.business?.id
          if (bId) businessIds.add(bId)
        }
      }
      const businesses = businessIds.size
        ? await this.prisma.business.findMany({ where: { id: { in: Array.from(businessIds) } }, select: { id: true, name: true, avatar: true } })
        : []
      const businessMap: Record<string, any> = {}
      for (const b of businesses) businessMap[b.id] = b

      client.orders = client.orders.map((order: any) => {
        const firstProduct = order.products?.find((p: any) => !!p.product)
        const bizId = firstProduct?.product?.businessId
        const business = firstProduct?.product?.business || (bizId ? businessMap[bizId] : null)
        const store = firstProduct?.product?.store || null

        const items = (order.products || []).map((op: any) => ({
          id: op.product?.id || op.id,
          name: op.product?.title || op.product?.name || '',
          price: op.product?.price || 0,
          quantity: op.quantity || 0,
          media: op.product?.medias?.[0] ? { url: op.product.medias[0].url } : null,
        }))

        let deliveryAddress: any = null
        if (order.deliveryAddress) {
          try {
            const parsed = JSON.parse(order.deliveryAddress)
            deliveryAddress = { street: parsed.street || order.deliveryAddress, city: parsed.city || null }
          } catch (e) {
            const parts = (order.deliveryAddress || '').split(',')
            deliveryAddress = { street: parts.slice(0, -1).join(',').trim() || order.deliveryAddress, city: parts.slice(-1)[0]?.trim() || null }
          }
        }

        return {
          id: order.id,
          orderNumber: order.id,
          status: order.payment?.status || 'PENDING',
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          items,
          business,
          store,
          paymentMethod: order.payment ? { type: order.payment.method, last4: null } : null,
          deliveryAddress,
        }
      })
    }

    return client
  }

  async findByEmail(email: string) {
    return this.prisma.client.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        address: true,
        phone: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async getClientReviews(clientId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit
        const items = await this.prisma.review.findMany({
          where: { clientId },
          include: {
            client: true,
            product: {
              select: {
                id: true,
                title: true,
                business: { select: { id: true, name: true, avatar: true } },
                medias: { select: { url: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        })
        const total = await this.prisma.review.count({ where: { clientId } })
        return { items, total, page, limit }
  }


  async getClientRecommendations(clientId: string){
    // Simple logic: return latest products from businesses the client has ordered from
        const orders = await this.prisma.order.findMany({ 
          where: { clientId }, 
          select: { id: true, products: { select: { product: { select: { businessId: true } } } } } })
        
          const businessIds = [...new Set(orders.map(o => o.products?.[0]?.product?.businessId).filter(Boolean))]
    
        if (!businessIds.length) return []
    
        const items = await this.prisma.product.findMany({ 
          where: { businessId: { in: businessIds } }, 
          take: 10, 
          orderBy: { createdAt: 'desc' }, 
          include: { medias: { select: { url: true } }, 
          business: { select: { id: true, name: true } } } 
        })
        
        const recs = items.map(it => ({ 
          id: it.id, type: 'product', 
          title: it.title, description: it.description, 
          items: [{ 
            id: it.id, 
            name: it.title, 
            price: it.price, 
            mediaUrl: it.medias?.[0]?.url,
            business: it.business
          }], 
          reason: 'Based on your orders', 
          createdAt: it.createdAt 
        }))
        return recs
  }

  async searchClients(query: string) {
    return this.prisma.client.findMany({
      where: {
        OR: [
          {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            fullName: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            username: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            phone: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        address: true,
        phone: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      take: 10, // Limit results
    })
  }

  async update(
    id: string,
    updateClientInput: UpdateClientInput,
  ) {
    const { password, kycId, ...clientData } =
      updateClientInput
    const data: any = { ...clientData }

    if (password) {
      data.password = await hash(password)
    }
    if (kycId) {
      data.kyc = { connect: { id: kycId } }
    }

    return this.prisma.client.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        address: true,
        phone: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        kyc: {
          select: { id: true, status: true },
        },
      },
    })
  }

  async remove(id: string) {
    return this.prisma.client.delete({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
      },
    })
  }

  // Addresses
  async addAddress(clientId: string, input: AddressInput) {
    if (input.isDefault) {
      // unset other defaults
      await this.prisma.address.updateMany({ where: { clientId, isDefault: true }, data: { isDefault: false } })
    }
    return this.prisma.address.create(
      { 
        data: {
          street: input.street,
          city: input.city,
          country: input.country,
          postalCode: input.postalCode,
          isDefault: input.isDefault ?? false,
          client: { connect: { id: clientId } }
        } 
      })
  }

  async updateAddress(addressId: string, input: { street?: string; city?: string; country?: string; postalCode?: string; isDefault?: boolean; }) {
    if (input.isDefault) {
      const addr = await this.prisma.address.findUnique({ where: { id: addressId } })
      if (addr) {
        await this.prisma.address.updateMany({ where: { clientId: addr.clientId, isDefault: true }, data: { isDefault: false } })
      }
    }
    return this.prisma.address.update({ where: { id: addressId }, data: input })
  }

  async deleteAddress(addressId: string) {
    return this.prisma.address.delete({ where: { id: addressId } })
  }

  // Payment methods
  async addPaymentMethod(clientId: string, input: PaymentMethodInput) {
    if (input.isDefault) {
      await this.prisma.clientPaymentMethod.updateMany({ where: { clientId, isDefault: true }, data: { isDefault: false } })
    }

    let dataClause: any = {}

    if (clientId) {
      dataClause.client = { connect: { id: clientId } }
    }

    if (input.type) {
      dataClause.type = input.type === 'MOBILE_MONEY' ? PaymentMethod.MOBILE_MONEY
        : input.type === 'CARD' ? PaymentMethod.CARD
        : input.type === 'DEBIT_CARD' ? PaymentMethod.CASH
        : PaymentMethod.TOKEN
    }
    if (input.provider) {
      dataClause.provider = input.provider === 'MTN_MOMO' ? RechargeMethod.MTN_MONEY
        : input.type === 'AIRTEL_MONEY' ? RechargeMethod.AIRTEL_MONEY
        : input.type === 'ORANGE_MONEY' ? RechargeMethod.ORANGE_MONEY
        : input.type === 'MPESA' ? RechargeMethod.MPESA
        : RechargeMethod.TOKEN
    }
    if (input.accountNumber) {
      dataClause.accountNumber = input.accountNumber
    }
    if (input.expiryMonth) {
      dataClause.expiryMonth = input.expiryMonth
    }
    if (input.last4) {
      dataClause.last4 = input.last4
    }
    if (input.cardToken) {
      dataClause.cardToken = input.cardToken
    }
    if (input.expiryYear) {
      dataClause.expiryYear = input.expiryYear
    }
    if (input.isDefault !== undefined) {
      dataClause.isDefault = input.isDefault
    }
    if (input.isDefault === null) {
      dataClause.isDefault = true
    }

    return this.prisma.clientPaymentMethod.create({ data: dataClause})
  }

  async setDefaultPaymentMethod(paymentMethodId: string) {
    const pm = await this.prisma.clientPaymentMethod.findUnique({ where: { id: paymentMethodId } })
    if (!pm) throw new Error('Payment method not found')
    await this.prisma.clientPaymentMethod.updateMany({ where: { clientId: pm.clientId, isDefault: true }, data: { isDefault: false } })
    return this.prisma.clientPaymentMethod.update({ where: { id: paymentMethodId }, data: { isDefault: true } })
  }

  // Computed loyalty/stats
  async getLoyaltyPoints(clientId: string) {
    const res = await this.prisma.pointsTransaction.aggregate({ where: { clientId }, _sum: { points: true } })
    return res._sum.points || 0
  }

  async getTotalSpent(clientId: string) {
    const res = await this.prisma.order.aggregate({ where: { clientId, payment: { status: 'COMPLETED' } }, _sum: { totalAmount: true } })
    return res._sum.totalAmount || 0
  }

  async getTotalOrders(clientId: string) {
    const res = await this.prisma.order.count({ where: { clientId, payment: { status: 'COMPLETED' } } })
    return res
  }

  async getLoyaltyTier(clientId: string) {
    // Naive implementation: choose the highest tier across all programs where minPoints <= points
    const points = await this.getLoyaltyPoints(clientId)
    const tiers = await this.prisma.loyaltyTier.findMany({ orderBy: { minPoints: 'desc' } })
    const tier = tiers.find(t => points >= t.minPoints)
    return tier ? tier.name : null
  }
}
