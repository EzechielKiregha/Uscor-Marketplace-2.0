import { Injectable } from '@nestjs/common';
import { CreateTokenTransactionInput } from './dto/create-token-transaction.input';
import { RedeemTokenTransactionInput } from './dto/redeem-token-transaction.input';
import { PrismaService } from '../prisma/prisma.service';
import { ReleaseTokenTransactionInput } from './dto/release-token-transaction.input';
import { AccountRechargeService } from '../account-recharge/account-recharge.service';
import { Country, RechargeMethod } from '../account-recharge/dto/create-account-recharge.input';

// Service
@Injectable()
export class TokenTransactionService {
  constructor(
    private prisma: PrismaService,
    private accountRechargeService: AccountRechargeService,
  ) {}

  async create(createTokenTransactionInput: CreateTokenTransactionInput) {
    const { businessId, reOwnedProductId, repostedProductId, amount, type } = createTokenTransactionInput;

    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
      throw new Error('Business not found');
    }

    if (reOwnedProductId && repostedProductId) {
      throw new Error('Token transaction can only be linked to one of reOwnedProduct or repostedProduct');
    }
    if (reOwnedProductId) {
      const reOwnedProduct = await this.prisma.reOwnedProduct.findUnique({ where: { id: reOwnedProductId } });
      if (!reOwnedProduct) {
        throw new Error('ReOwnedProduct not found');
      }
    }
    if (repostedProductId) {
      const repostedProduct = await this.prisma.repostedProduct.findUnique({ where: { id: repostedProductId } });
      if (!repostedProduct) {
        throw new Error('RepostedProduct not found');
      }
    }

    return this.prisma.tokenTransaction.create({
      data: {
        business: { connect: { id: businessId } },
        reOwnedProduct: reOwnedProductId ? { connect: { id: reOwnedProductId } } : undefined,
        repostedProduct: repostedProductId ? { connect: { id: repostedProductId } } : undefined,
        amount,
        type,
        isRedeemed: false,
        isReleased: false,
      },
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
        reOwnedProduct: reOwnedProductId ? { select: { id: true, newProductId: true, originalProductId: true, oldOwnerId: true, newOwnerId: true, quantity: true, oldPrice: true, newPrice: true, createdAt: true } } : false,
        repostedProduct: repostedProductId ? { select: { id: true, productId: true, businessId: true, createdAt: true } } : false,
      },
    });
  }

  async redeem(redeemTokenTransactionInput: RedeemTokenTransactionInput, businessId: string) {
    const { tokenTransactionId, isRedeemed } = redeemTokenTransactionInput;

    const tokenTransaction = await this.prisma.tokenTransaction.findUnique({
      where: { id: tokenTransactionId },
      include: { reOwnedProduct: true, repostedProduct: true },
    });
    if (!tokenTransaction) {
      throw new Error('TokenTransaction not found');
    }
    if (tokenTransaction.businessId !== businessId) {
      throw new Error('Only the beneficial business can redeem tokens');
    }
    if (tokenTransaction.isRedeemed && isRedeemed) {
      throw new Error('Tokens already redeemed');
    }

    const updatedTransaction = await this.prisma.tokenTransaction.update({
      where: { id: tokenTransactionId },
      data: { isRedeemed },
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
        reOwnedProduct: { select: { id: true, newProductId: true, originalProductId: true, oldOwnerId: true, newOwnerId: true, quantity: true, oldPrice: true, newPrice: true, createdAt: true } },
        repostedProduct: { select: { id: true, productId: true, businessId: true, createdAt: true } },
      },
    });

    if (!tokenTransaction.reOwnedProduct?.oldOwnerId) throw new Error("Product Owner is missing")

    // If both redeemed and released, create AccountRecharge
    if (isRedeemed && updatedTransaction.isReleased) {
      await this.accountRechargeService.create(
        {
          businessId,
          amount: tokenTransaction.amount,
          method: RechargeMethod.MTN_MONEY,
          origin: Country.DRC,
          tokenTransactionId: tokenTransaction.id,
        },
        businessId,
        'business',
      );

      await this.accountRechargeService.create(
        {
          businessId: tokenTransaction.reOwnedProduct?.oldOwnerId,
          amount: -tokenTransaction.amount,
          method: RechargeMethod.TOKEN,
          origin: Country.DRC,
          tokenTransactionId: tokenTransaction.id,
        },
        tokenTransaction.reOwnedProduct?.oldOwnerId,
        'business',
      );
    }

    return updatedTransaction;
  }

  async release(releaseTokenTransactionInput: ReleaseTokenTransactionInput, businessId: string) {
    const { tokenTransactionId, isReleased } = releaseTokenTransactionInput;

    const tokenTransaction = await this.prisma.tokenTransaction.findUnique({
      where: { id: tokenTransactionId },
      include: { reOwnedProduct: true, repostedProduct: true },
    });
    if (!tokenTransaction) {
      throw new Error('TokenTransaction not found');
    }

    // Verify the releasing business is the product owner
    let productOwnerId: string | null = null;
    if (tokenTransaction.reOwnedProduct) {
      productOwnerId = tokenTransaction.reOwnedProduct.newOwnerId;
    } else if (tokenTransaction.repostedProduct) {
      const product = await this.prisma.product.findUnique({
        where: { id: tokenTransaction.repostedProduct.productId },
        select: { businessId: true },
      });
      productOwnerId = product?.businessId || null;
    }
    if (!productOwnerId || productOwnerId !== businessId) {
      throw new Error('Only the product owner can release tokens');
    }
    if (tokenTransaction.isReleased && isReleased) {
      throw new Error('Tokens already released');
    }

    const updatedTransaction = await this.prisma.tokenTransaction.update({
      where: { id: tokenTransactionId },
      data: { isReleased },
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
        reOwnedProduct: { select: { id: true, newProductId: true, originalProductId: true, oldOwnerId: true, newOwnerId: true, quantity: true, oldPrice: true, newPrice: true, createdAt: true } },
        repostedProduct: { select: { id: true, productId: true, businessId: true, createdAt: true } },
      },
    });

    // If both redeemed and released, create AccountRecharge for debit
    if (isReleased && updatedTransaction.isRedeemed) {
      await this.accountRechargeService.create(
        {
          businessId: productOwnerId,
          amount: -tokenTransaction.amount,
          method: RechargeMethod.TOKEN,
          origin: Country.DRC,
          tokenTransactionId: tokenTransaction.id,
        },
        productOwnerId,
        'business',
      );

      await this.accountRechargeService.create(
        {
          businessId,
          amount: tokenTransaction.amount,
          method: RechargeMethod.MTN_MONEY,
          origin: Country.DRC,
          tokenTransactionId: tokenTransaction.id,
        },
        businessId,
        'business',
      );
    }

    return updatedTransaction;
  }

  async findAll(businessId: string) {
    return this.prisma.tokenTransaction.findMany({
      where: { businessId },
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
        reOwnedProduct: { select: { id: true, newProductId: true, originalProductId: true, oldOwnerId: true, newOwnerId: true, quantity: true, oldPrice: true, newPrice: true, createdAt: true } },
        repostedProduct: { select: { id: true, productId: true, businessId: true, createdAt: true } },
      },
    });
  }

  async findOne(id: string, businessId: string) {
    const tokenTransaction = await this.prisma.tokenTransaction.findUnique({
      where: { id },
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
        reOwnedProduct: { select: { id: true, newProductId: true, originalProductId: true, oldOwnerId: true, newOwnerId: true, quantity: true, oldPrice: true, newPrice: true, createdAt: true } },
        repostedProduct: { select: { id: true, productId: true, businessId: true, createdAt: true } },
      },
    });
    if (!tokenTransaction) {
      throw new Error('TokenTransaction not found');
    }
    if (tokenTransaction.businessId !== businessId) {
      throw new Error('Access restricted to the associated business');
    }
    return tokenTransaction;
  }
}

