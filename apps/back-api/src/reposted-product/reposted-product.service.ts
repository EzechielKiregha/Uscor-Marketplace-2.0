import { Injectable } from '@nestjs/common';
import { CreateRepostedProductInput } from './dto/create-reposted-product.input';
import { PrismaService } from '../prisma/prisma.service';

// Service
@Injectable()
export class RepostedProductService {
  constructor(private prisma: PrismaService) {}

  async checkBusinessEligibility(businessId: string): Promise<boolean> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { kycStatus: true, isB2BEnabled: true, totalProductsSold: true, hasAgreedToTerms: true },
    });
    if (!business) {
      throw new Error('Business not found');
    }
    return (
      business.kycStatus === 'VERIFIED' &&
      business.isB2BEnabled &&
      business.totalProductsSold >= 100 &&
      business.hasAgreedToTerms
    );
  }

  async create(createRepostedProductInput: CreateRepostedProductInput) {
    const { productId, businessId, markupPercentage } = createRepostedProductInput;

    // Check eligibility of reposting business
    const isEligible = await this.checkBusinessEligibility(businessId);
    if (!isEligible) {
      throw new Error('Business is not eligible for reposting');
    }

    // Fetch product and its owner
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { business: { select: { id: true, kycStatus: true, isB2BEnabled: true, totalProductsSold: true, hasAgreedToTerms: true } } },
    });
    if (!product) {
      throw new Error('Product not found');
    }

    // Check eligibility of original business
    const isOriginalEligible = await this.checkBusinessEligibility(product.businessId);
    if (!isOriginalEligible) {
      throw new Error('Original business is not eligible for reposting');
    }

    // Check if product exists
    const prod = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true, price: true, businessId: true, createdAt: true },
    });
    if (!prod) {
      throw new Error('Product not found');
    }

    // Check for duplicate repost
    const existingRepost = await this.prisma.repostedProduct.findUnique({
      where: { productId, businessId },
    });
    if (existingRepost) {
      throw new Error('Business has already reposted this product');
    }

    return this.prisma.repostedProduct.create({
      data: {
        product: { connect: { id: productId } },
        business: { connect: { id: businessId } },
        markupPercentage,
      },
      include: {
        product: { select: { id: true, title: true, price: true, businessId: true, createdAt: true } },
        business: { select: { id: true, name: true, email: true, createdAt: true } },
      },
    });
  }

  async findAll(businessId: string) {
    return this.prisma.repostedProduct.findMany({
      where: { businessId },
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
        product: { select: { id: true, title: true, price: true, businessId: true } },
      },
    });
  }

  async findOne(id: string, businessId: string) {
    const repostedProduct = await this.prisma.repostedProduct.findUnique({
      where: { id },
      include: {
        business: { select: { id: true, name: true, email: true, createdAt: true } },
        product: { select: { id: true, title: true, price: true, businessId: true } },
      },
    });
    if (!repostedProduct) {
      throw new Error('RepostedProduct not found');
    }
    if (repostedProduct.businessId !== businessId) {
      throw new Error('Access restricted to reposting business');
    }
    return repostedProduct;
  }

  async remove(id: string, businessId: string) {
    const repostedProduct = await this.findOne(id, businessId);
    return this.prisma.repostedProduct.delete({
      where: { id },
      select: { id: true },
    });
  }
}
