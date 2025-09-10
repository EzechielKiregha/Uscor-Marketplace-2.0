import { hash } from 'argon2'
import { UpdateClientInput } from './dto/update-client.input'
import {
  CreateClientInput,
  CreateClientForPOSInput,
} from './dto/create-client.input'
import { PrismaService } from '../prisma/prisma.service'
import { Injectable } from '@nestjs/common'

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
    const tempPassword = Math.random()
      .toString(36)
      .slice(-8)
    const hashedPassword =
      await hash(tempPassword)
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
        orders: {
          where: {
            payment: { status: 'COMPLETED' },
          },
          select: {
            id: true,
            createdAt: true,
            deliveryFee: true,
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
      },
    })
  }

  async findOne(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
      include: {
        orders: {
          select: {
            id: true,
            createdAt: true,
            deliveryFee: true,
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
      },
    })
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
}
