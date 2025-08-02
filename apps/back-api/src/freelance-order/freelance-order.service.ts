import { Injectable } from '@nestjs/common';
import { CreateFreelanceOrderInput, EscrowStatus, FreelanceStatus } from './dto/create-freelance-order.input';
import { AssignBusinessesInput, UpdateFreelanceOrderInput } from './dto/update-freelance-order.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentTransactionService } from 'src/payment-transaction/payment-transaction.service';
import { AccountRechargeService } from 'src/account-recharge/account-recharge.service';
import { PaymentMethod, PaymentStatus } from 'src/payment-transaction/dto/create-payment-transaction.input';
import { Country, RechargeMethod } from 'src/account-recharge/dto/create-account-recharge.input';
// Service
@Injectable()
export class FreelanceOrderService {
  constructor(
    private prisma: PrismaService,
    private paymentTransactionService: PaymentTransactionService,
    private accountRechargeService: AccountRechargeService,
  ) {}

  async validateBalance(clientId: string, amount: number): Promise<boolean> {
    const balance = await this.accountRechargeService.getBalance(clientId, 'client');
    return balance >= amount;
  }

  async create(createFreelanceOrderInput: CreateFreelanceOrderInput, clientId: string) {
    const { serviceId, clientId: inputClientId, quantity, businessIds, paymentMethod } = createFreelanceOrderInput;
    if (inputClientId !== clientId) {
      throw new Error('Clients can only create orders for themselves');
    }

    const service = await this.prisma.freelanceService.findUnique({
      where: { id: serviceId },
      select: { id: true, rate: true, isHourly: true, businessId: true },
    });
    if (!service) {
      throw new Error('Freelance service not found');
    }

    const totalAmount = service.isHourly ? service.rate * quantity : service.rate;
    const commissionPercent = 0.1; // Platform fee, configurable
    const escrowAmount = totalAmount;

    // Validate balance for TOKEN payments
    if (paymentMethod === PaymentMethod.TOKEN) {
      const hasEnoughBalance = await this.validateBalance(clientId, escrowAmount);
      if (!hasEnoughBalance) {
        throw new Error('Insufficient balance for this service');
      }
    }

    // Create FreelanceOrder and PaymentTransaction
    return this.prisma.$transaction(async (prisma) => {
      const freelanceOrder = await prisma.freelanceOrder.create({
        data: {
          client: { connect: { id: clientId } },
          service: { connect: { id: serviceId } },
          status: FreelanceStatus.PENDING,
          quantity,
          totalAmount,
          escrowAmount,
          commissionPercent,
          escrowStatus: EscrowStatus.HELD,
          freelanceOrderBusiness: {
            create: businessIds?.map(businessId => ({
              business: { connect: { id: businessId } },
            })),
          },
        },
        include: {
          client: { select: { id: true, username: true, email: true, createdAt: true } },
          service: { select: { id: true, title: true, rate: true, isHourly: true, businessId: true } },
          freelanceOrderBusiness: { include: { business: true } },
        },
      });

      // Create PaymentTransaction
      // const payment = await this.paymentTransactionService.create(
      //   {
      //     orderId: undefined, // No Order relation
      //     amount: escrowAmount,
      //     method: paymentMethod,
      //     status: PaymentStatus.PENDING,
      //   },
      //   clientId,
      // );
      
      const payment = this.prisma.paymentTransaction.create({
        data: {
          freelanceOrderId : freelanceOrder.id,
          amount : escrowAmount,
          method : paymentMethod,
          status: PaymentStatus.PENDING,
        },
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          transactionDate: true,
          qrCode: true,
          createdAt: true,
          // order: { select: { id: true, deliveryFee: true, deliveryAddress: true, createdAt: true } },
          postTransactions: { select: { id: true, amount: true, status: true, createdAt: true } },
        },
      });

      // // Link PaymentTransaction to FreelanceOrder
      // await prisma.freelanceOrder.update({
      //   where: { id: freelanceOrder.id },
      //   data: { payment: { connect: { id: payment.id } } },
      // });

      return { ...freelanceOrder, payment };
    });
  }

  async findAll(userId: string, userRole: string) {
    return this.prisma.freelanceOrder.findMany({
      where: {
        OR: [
          { clientId: userRole === 'client' ? userId : undefined },
          { service: { businessId: userRole === 'business' ? userId : undefined } },
          { freelanceOrderBusiness: { some: { businessId: userRole === 'business' ? userId : undefined } } },
        ],
      },
      include: {
        client: { select: { id: true, username: true, email: true, createdAt: true } },
        service: { select: { id: true, title: true, rate: true, isHourly: true, businessId: true } },
        freelanceOrderBusiness: { include: { business: true } },
        payment: true,
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.freelanceOrder.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, username: true, email: true, createdAt: true } },
        service: { select: { id: true, title: true, rate: true, isHourly: true, businessId: true } },
        freelanceOrderBusiness: { include: { business: true } },
        payment: true,
      },
    });
    if (!order) {
      throw new Error('Freelance order not found');
    }
    return order;
  }

  async update(id: string, updateFreelanceOrderInput: UpdateFreelanceOrderInput, userId: string, userRole: string) {
    const { status, escrowStatus, commissionPercent } = updateFreelanceOrderInput;
    const order = await this.findOne(id);

    // Restrict updates based on role
    if (userRole === 'client' && order.clientId !== userId) {
      throw new Error('Clients can only update their own orders');
    }
    if (
      userRole === 'business' &&
      order.service.businessId !== userId &&
      !order.freelanceOrderBusiness.some(b => b.businessId === userId)
    ) {
      throw new Error('Businesses can only update orders for their services or assigned orders');
    }

    if (!order) return new Error("Freelance order was not found")
      
    // Handle escrow release and payment on COMPLETED status
    if (status === FreelanceStatus.COMPLETED && order.status !== FreelanceStatus.COMPLETED) {
        
        if (!order.payment) return new Error("Freelance order payment was not found")

        if (order.payment.method === PaymentMethod.TOKEN) {
        const hasEnoughBalance = await this.validateBalance(order.clientId, order.escrowAmount);
        if (!hasEnoughBalance) {
          throw new Error('Insufficient balance for this service');
        }
      }

      return this.prisma.$transaction(async (prisma) => {
        // Update PaymentTransaction to COMPLETED
        if (!order.payment) return new Error("Freelance order payment was not found")

        await this.paymentTransactionService.update(
          order.payment.id,
          { status: PaymentStatus.COMPLETED },
          order.clientId,
        );

        // Deduct client balance and pay business
        const businessAmount = order.totalAmount * (1 - (commissionPercent || order.commissionPercent));
        await this.accountRechargeService.create(
          {
            amount: -order.escrowAmount,
            method: RechargeMethod.MTN_MONEY,
            origin: Country.DRC,
            clientId: order.clientId,
            businessId: undefined,
          },
          order.clientId,
          'client',
        );
        await this.accountRechargeService.create(
          {
            amount: businessAmount,
            method: RechargeMethod.MTN_MONEY,
            origin: Country.DRC,
            clientId: undefined,
            businessId: order.service.businessId,
          },
          order.service.businessId,
          'business',
        );

        // Update FreelanceOrder
        return prisma.freelanceOrder.update({
          where: { id },
          data: {
            status,
            escrowStatus: escrowStatus || EscrowStatus.RELEASED,
            escrowReleasedAt: escrowStatus === EscrowStatus.RELEASED ? new Date() : undefined,
            commissionPercent: commissionPercent || order.commissionPercent,
          },
          include: {
            client: { select: { id: true, username: true, email: true } },
            service: { select: { id: true, title: true, rate: true, isHourly: true, businessId: true } },
            freelanceOrderBusiness: { include: { business: true } },
            payment: true,
          },
        });
      });
    }

    return this.prisma.freelanceOrder.update({
      where: { id },
      data: { status, escrowStatus, commissionPercent },
      include: {
        client: { select: { id: true, username: true, email: true } },
        service: { select: { id: true, title: true, rate: true, isHourly: true, businessId: true } },
        freelanceOrderBusiness: { include: { business: true } },
        payment: true,
      },
    });
  }

  async assignBusinesses(assignBusinessesInput: AssignBusinessesInput, userId: string) {
    const { orderId, businessIds } = assignBusinessesInput;
    const order = await this.findOne(orderId);
    if (order.clientId !== userId) {
      throw new Error('Only the client can assign businesses to their order');
    }
    return this.prisma.freelanceOrder.update({
      where: { id: orderId },
      data: {
        freelanceOrderBusiness: {
          deleteMany: {},
          create: businessIds.map(businessId => ({
            business: { connect: { id: businessId } },
          })),
        },
      },
      include: {
        client: { select: { id: true, username: true, email: true } },
        service: { select: { id: true, title: true, rate: true, isHourly: true, businessId: true } },
        freelanceOrderBusiness: { include: { business: true } },
        payment: true,
      },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const order = await this.findOne(id);
    if (userRole === 'client' && order.clientId !== userId) {
      throw new Error('Clients can only delete their own orders');
    }
    if (
      userRole === 'business' &&
      order.service.businessId !== userId &&
      !order.freelanceOrderBusiness.some(b => b.businessId === userId)
    ) {
      throw new Error('Businesses can only delete orders for their services or assigned orders');
    }
    return this.prisma.freelanceOrder.delete({
      where: { id },
      select: { id: true },
    });
  }
}