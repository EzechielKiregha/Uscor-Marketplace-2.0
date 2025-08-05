import { Injectable } from '@nestjs/common';
import { CreateLoyaltyProgramInput, CreatePointsTransactionInput } from './dto/loyalty-program.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { BusinessService } from 'src/business/business.service';
import { ClientService } from 'src/client/client.service';
import { UpdateLoyaltyProgramInput } from './dto/update-loyalty-program.input';


// Service
@Injectable()
export class LoyaltyService {
  constructor(
    private prisma: PrismaService,
    private businessService: BusinessService,
    private clientService: ClientService,
  ) {}

  async createLoyaltyProgram(input: CreateLoyaltyProgramInput, user: { id: string; role: string }) {
    const { businessId, name, pointsPerPurchase } = input;

    if (user.role !== 'business') {
      throw new Error('Only business owners can create loyalty programs');
    }
    await this.businessService.verifyBusinessAccess(businessId, user);

    return this.prisma.loyaltyProgram.create({
      data: {
        business: { connect: { id: businessId } },
        name,
        pointsPerPurchase,
      },
      include: {
        business: { select: { id: true, name: true, createdAt: true } },
      },
    });
  }

  async updateLoyaltyProgram(id: string, input: UpdateLoyaltyProgramInput, user: { id: string; role: string }) {
    const loyaltyProgram = await this.prisma.loyaltyProgram.findUnique({
      where: { id },
      include: { business: true },
    });
    if (!loyaltyProgram) {
      throw new Error('Loyalty program not found');
    }
    if (user.role !== 'business') {
      throw new Error('Only business owners can update loyalty programs');
    }
    await this.businessService.verifyBusinessAccess(loyaltyProgram.businessId, user);

    return this.prisma.loyaltyProgram.update({
      where: { id },
      data: {
        name: input.name,
        pointsPerPurchase: input.pointsPerPurchase,
      },
      include: {
        business: { select: { id: true, name: true, createdAt: true } },
      },
    });
  }

  async createPointsTransaction(input: CreatePointsTransactionInput, user: { id: string; role: string }) {
    const { clientId, loyaltyProgramId, points } = input;

    const loyaltyProgram = await this.prisma.loyaltyProgram.findUnique({
      where: { id: loyaltyProgramId },
      include: { business: true },
    });
    if (!loyaltyProgram) {
      throw new Error('Loyalty program not found');
    }
    await this.businessService.verifyBusinessAccess(loyaltyProgram.businessId, user);

    const client = await this.clientService.findOne(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    return this.prisma.pointsTransaction.create({
      data: {
        client: { connect: { id: clientId } },
        loyaltyProgram: { connect: { id: loyaltyProgramId } },
        points,
      },
      include: {
        client: { select: { id: true, fullName: true, createdAt: true } },
        loyaltyProgram: { select: { id: true, name: true, pointsPerPurchase: true, createdAt: true } },
      },
    });
  }

  async getPointsTransactionsByClient(clientId: string, user: { id: string; role: string }) {
    const client = await this.clientService.findOne(clientId);
    if (!client) {
      throw new Error('Client not found');
    }
    await this.businessService.verifyBusinessAccess(null, user);

    return this.prisma.pointsTransaction.findMany({
      where: { clientId },
      include: {
        client: { select: { id: true, fullName: true, createdAt: true } },
        loyaltyProgram: { select: { id: true, name: true, pointsPerPurchase: true, createdAt: true } },
      },
    });
  }

  async getPointsTransactionsByProgram(loyaltyProgramId: string, user: { id: string; role: string }) {
    const loyaltyProgram = await this.prisma.loyaltyProgram.findUnique({
      where: { id: loyaltyProgramId },
      include: { business: true },
    });
    if (!loyaltyProgram) {
      throw new Error('Loyalty program not found');
    }
    await this.businessService.verifyBusinessAccess(loyaltyProgram.businessId, user);

    return this.prisma.pointsTransaction.findMany({
      where: { loyaltyProgramId },
      include: {
        client: { select: { id: true, fullName: true, createdAt: true } },
        loyaltyProgram: { select: { id: true, name: true, pointsPerPurchase: true, createdAt: true } },
      },
    });
  }

  async getClientPointsBalance(clientId: string, user: { id: string; role: string }) {
    const client = await this.clientService.findOne(clientId);
    if (!client) {
      throw new Error('Client not found');
    }
    await this.businessService.verifyBusinessAccess(null, user);

    const balance = await this.prisma.pointsTransaction.aggregate({
      where: { clientId },
      _sum: { points: true },
    });

    return {
      clientId,
      client: { id: client.id, name: client.fullName, createdAt: client.createdAt },
      totalPoints: balance._sum.points || 0,
    };
  }
}

