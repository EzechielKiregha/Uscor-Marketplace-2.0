import { hash } from "argon2";
import { UpdateClientInput } from "./dto/update-client.input";
import { CreateClientInput } from "./dto/create-client.input";
import { PrismaService } from "../prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(createClientInput: CreateClientInput) {
    const { password, ...clientData } = createClientInput;
    const hashedPassword = await hash(password);

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
    });
  }

  async findAll() {
    return this.prisma.client.findMany({
      include: {
        orders: {
          where: { payment: { status: 'COMPLETED' } },
          select: { id: true, createdAt: true, deliveryFee: true },
        },
        recharges: { select: { id: true, amount: true, method: true } },
        chatParticipants: { select: {chat : { select: { id: true, status: true, createdAt: true, updatedAt: true } } } },
        reviews: { select: { id: true, rating: true, comment: true } },
        freelanceOrders: { select: { id: true, status: true, totalAmount: true } },
        referralsMade: { select: { id: true, verifiedPurchase: true } },
        referralsReceived: { select: { id: true, verifiedPurchase: true } },
        kyc: { select: { id: true, status: true, submittedAt: true } },
        postTransactions: { select: { id: true, status: true, amount: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
      include: {
        orders: { select: { id: true, createdAt: true, deliveryFee: true } },
        recharges: { select: { id: true, amount: true, method: true } },
        chatParticipants: { select: {chat : { select: { id: true, status: true, createdAt: true, updatedAt: true } } } },
        reviews: { select: { id: true, rating: true, comment: true } },
        freelanceOrders: { select: { id: true, status: true, totalAmount: true } },
        referralsMade: { select: { id: true, verifiedPurchase: true } },
        referralsReceived: { select: { id: true, verifiedPurchase: true } },
        kyc: { select: { id: true, status: true, submittedAt: true } },
        postTransactions: { select: { id: true, status: true, amount: true } },
      },
    });
  }

  async update(id: string, updateClientInput: UpdateClientInput) {
    const { password, kycId, ...clientData } = updateClientInput;
    const data: any = { ...clientData };

    if (password) {
      data.password = await hash(password);
    }
    if (kycId) {
      data.kyc = { connect: { id: kycId } };
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
        kyc: { select: { id: true, status: true } },
      },
    });
  }

  async remove(id: string) {
    return this.prisma.client.delete({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
  }
}