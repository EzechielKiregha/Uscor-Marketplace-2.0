import { Injectable } from '@nestjs/common';
import { CreatePaymentTransactionInput } from './dto/create-payment-transaction.input';
import { UpdatePaymentTransactionInput } from './dto/update-payment-transaction.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentMethod, PaymentStatus } from 'src/generated/prisma/enums';
import { AccountRechargeService } from 'src/account-recharge/account-recharge.service';
import { Country, RechargeMethod } from 'src/account-recharge/dto/create-account-recharge.input';

// Service
@Injectable()
export class PaymentTransactionService {
  constructor(
    private prisma: PrismaService,
    private accountRechargeService: AccountRechargeService,
  ) {}

  async validateTokenBalance(clientId: string, amount: number): Promise<boolean> {
    const balance = await this.accountRechargeService.getBalance(clientId, 'client');
    return balance >= amount;
  }

  async create(createPaymentTransactionInput: CreatePaymentTransactionInput, clientId: string) {
    const { orderId, method, amount, ...data } = createPaymentTransactionInput;

    // Check if PaymentTransaction already exists for the order
    const existingTransaction = await this.prisma.paymentTransaction.findUnique({
      where: { orderId },
    });
    if (existingTransaction) {
      throw new Error('Payment transaction already initialized for this order. Use update instead.');
    }

    // Validate token balance for TOKEN method
    if (method === PaymentMethod.TOKEN) {
      const hasEnoughTokens = await this.validateTokenBalance(clientId, amount);
      if (!hasEnoughTokens) {
        throw new Error('Insufficient token balance');
      }
    }

    return this.prisma.paymentTransaction.create({
      data: {
        ...data,
        amount,
        method,
        order: { connect: { id: orderId } },
      },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        transactionDate: true,
        qrCode: true,
        createdAt: true,
        order: { select: { id: true, deliveryFee: true, deliveryAddress: true, createdAt: true } },
        postTransactions: { select: { id: true, amount: true, status: true, createdAt: true } },
      },
    });
  }

  async update(id: string, updatePaymentTransactionInput: UpdatePaymentTransactionInput, clientId: string) {
    const { status, qrCode } = updatePaymentTransactionInput;
    const transaction = await this.findOne(id);
    if (!transaction) {
      throw new Error('Payment transaction not found');
    }

    // If status is changing to COMPLETED, validate and deduct balance
    if (status === PaymentStatus.COMPLETED && transaction.status !== PaymentStatus.COMPLETED) {
      if (transaction.method === PaymentMethod.TOKEN) {
        const hasEnoughTokens = await this.validateTokenBalance(clientId, transaction.amount);
        if (!hasEnoughTokens) {
          throw new Error('Insufficient token balance');
        }
        // Deduct balance by creating a negative AccountRecharge
        await this.accountRechargeService.create(
          {
            amount: -transaction.amount,
            method: RechargeMethod.MTN_MONEY, // Placeholder; adjust as needed
            origin: Country.DRC, // Placeholder; adjust as needed
            clientId,
            businessId: undefined,
          },
          clientId,
          'client',
        );
      }
    }

    return this.prisma.paymentTransaction.update({
      where: { id },
      data: { status, qrCode },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        transactionDate: true,
        qrCode: true,
        createdAt: true,
        order: { select: { id: true, deliveryFee: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.paymentTransaction.findMany({
      include: {
        order: { select: { id: true, deliveryFee: true, deliveryAddress: true, createdAt: true } },
        postTransactions: { select: { id: true, amount: true, status: true, createdAt: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.paymentTransaction.findUnique({
      where: { id },
      include: {
        order: { select: { id: true, deliveryFee: true, deliveryAddress: true, createdAt: true } },
        postTransactions: { select: { id: true, amount: true, status: true, createdAt: true } },
      },
    });
  }

  

  async remove(id: string) {
    return this.prisma.paymentTransaction.delete({
      where: { id },
      select: { id: true, amount: true },
    });
  }
}


