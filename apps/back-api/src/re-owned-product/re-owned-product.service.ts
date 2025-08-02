import { Injectable } from '@nestjs/common';
import { ApproveReOwnedProductInput, CreateReOwnedProductInput } from './dto/create-re-owned-product.input';
import { UpdateReOwnedProductInput } from './dto/update-re-owned-product.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatService } from 'src/chat/chat.service';
import { NegotiationType } from 'src/chat/dto/create-chat.input';
import { KycStatus } from 'src/generated/prisma/enums';
import { CreateShippingInput } from './dto/create-shipping.input';

// Service
@Injectable()
export class ReOwnedProductService {
  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
  ) {}

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

  async create(createReOwnedProductInput: CreateReOwnedProductInput) {
    const { originalProductId, newOwnerId, quantity, newPrice, markupPercentage } = createReOwnedProductInput;

    // Check eligibility of new owner
    const isNewOwnerEligible = await this.checkBusinessEligibility(newOwnerId);
    if (!isNewOwnerEligible) {
      throw new Error('New owner is not eligible for re-ownership');
    }

    // Fetch original product and its owner
    const originalProduct = await this.prisma.product.findUnique({
      where: { id: originalProductId },
      include: { business: { select: { id: true, kycStatus: true, isB2BEnabled: true, totalProductsSold: true, hasAgreedToTerms: true } } },
    });
    if (!originalProduct) {
      throw new Error('Product not found');
    }
    if (originalProduct.quantity < quantity) {
      throw new Error('Insufficient quantity in stock');
    }

    // Check eligibility of original owner
    const isOriginalOwnerEligible = await this.checkBusinessEligibility(originalProduct.businessId);
    if (!isOriginalOwnerEligible) {
      throw new Error('Original owner is not eligible for re-ownership');
    }

    // Create secure chat for negotiation
    const chat = await this.chatService.create({
      productId: originalProductId,
      participantIds: [originalProduct.businessId, newOwnerId],
      isSecure: true,
      negotiationType: NegotiationType.REOWNERSHIP,
    });

    // Create new product for new owner (pending approval)
    const newProduct = await this.prisma.product.create({
      data: {
        business: { connect: { id: newOwnerId } },
        title: originalProduct.title,
        price: newPrice,
        quantity,
        isPhysical: originalProduct.isPhysical,
        category: { connect: { id: originalProduct.categoryId } },
      },
    });

    // Create ReOwnedProduct record
    const reOwnedProduct = await this.prisma.reOwnedProduct.create({
      data: {
        newProduct: { connect: { id: newProduct.id } },
        originalProduct: { connect: { id: originalProductId } },
        oldOwnerId: originalProduct.businessId,
        newOwnerId,
        quantity,
        oldPrice: originalProduct.price,
        newPrice,
        markupPercentage,
        agreedViaChatId: chat.id,
        agreementDate: new Date(),
        isOriginalApproved: false,
        isNewOwnerApproved: false,
      },
      include: {
        newProduct: { select: { id: true, title: true, price: true, quantity: true, businessId: true, isPhysical: true } },
        originalProduct: { select: { id: true, title: true, price: true, quantity: true, businessId: true, isPhysical: true } },
      },
    });

    // Create shipping record for physical products
    if (originalProduct.isPhysical) {
      await this.prisma.shipping.create({
        data: {
          reOwnedProduct: { connect: { id: reOwnedProduct.id } },
          status: 'PENDING',
        },
      });
    }

    return reOwnedProduct;
  }

  async approve(approveReOwnedProductInput: ApproveReOwnedProductInput, approvingBusinessId: string) {
    const { reOwnedProductId, chatId, isApproved } = approveReOwnedProductInput;

    const reOwnedProduct = await this.prisma.reOwnedProduct.findUnique({
      where: { id: reOwnedProductId },
      include: { originalProduct: true, newProduct: true, shipping: true },
    });
    if (!reOwnedProduct) {
      throw new Error('ReOwnedProduct not found');
    }

    // Verify chat ID
    if (reOwnedProduct.agreedViaChatId !== chatId) {
      throw new Error('Invalid chat ID for approval');
    }

    // Update approval status
    const isOriginalOwner = reOwnedProduct.oldOwnerId === approvingBusinessId;
    const isNewOwner = reOwnedProduct.newOwnerId === approvingBusinessId;
    if (!isOriginalOwner && !isNewOwner) {
      throw new Error('Only involved businesses can approve');
    }

    const updateData: any = {};
    if (isOriginalOwner) {
      updateData.isOriginalApproved = isApproved;
    } else {
      updateData.isNewOwnerApproved = isApproved;
    }

    // If both approve, finalize re-ownership
    const bothApproved = (isOriginalOwner ? isApproved : reOwnedProduct.isNewOwnerApproved) && (isNewOwner ? isApproved : reOwnedProduct.isOriginalApproved);
    if (bothApproved && isApproved) {
      // Decrement original product quantity
      await this.prisma.product.update({
        where: { id: reOwnedProduct.originalProductId },
        data: { quantity: { decrement: reOwnedProduct.quantity } },
      });

      // Release tokens (assuming 1 token per unit for simplicity)
      await this.prisma.tokenTransaction.create({
        data: {
          business: { connect: { id: reOwnedProduct.newOwnerId } },
          reOwnedProduct: { connect: { id: reOwnedProductId } },
          amount: reOwnedProduct.quantity,
          type: 'RELEASE',
        },
      });

      // Update shipping status if physical
      if (reOwnedProduct.originalProduct.isPhysical && reOwnedProduct.shippingId) {
        await this.prisma.shipping.update({
          where: { id: reOwnedProduct.shippingId },
          data: { status: 'PENDING_SHIPPING' },
        });
      }
    }

    return this.prisma.reOwnedProduct.update({
      where: { id: reOwnedProductId },
      data: updateData,
      include: {
        newProduct: { select: { id: true, title: true, price: true, quantity: true, businessId: true, isPhysical: true } },
        originalProduct: { select: { id: true, title: true, price: true, quantity: true, businessId: true, isPhysical: true } },
        shipping: true,
      },
    });
  }

  async createShipping(createShippingInput: CreateShippingInput, businessId: string) {
    const { reOwnedProductId, trackingNumber, carrier } = createShippingInput;

    const reOwnedProduct = await this.prisma.reOwnedProduct.findUnique({
      where: { id: reOwnedProductId },
      include: { originalProduct: true, shipping: true },
    });
    if (!reOwnedProduct) {
      throw new Error('ReOwnedProduct not found');
    }
    if (reOwnedProduct.newOwnerId !== businessId) {
      throw new Error('Only the new owner can create shipping details');
    }
    if (!reOwnedProduct.originalProduct.isPhysical) {
      throw new Error('Shipping details only apply to physical products');
    }
    if (!reOwnedProduct.isOriginalApproved || !reOwnedProduct.isNewOwnerApproved) {
      throw new Error('Both approvals required before shipping');
    }

    if (!reOwnedProduct.shippingId) return new Error("Shipping ID is missing")
      
    return this.prisma.shipping.update({
      where: { id: reOwnedProduct.shippingId },
      data: {
        trackingNumber,
        carrier,
        status: 'SHIPPED',
        shippedAt: new Date(),
      },
      include: {
        reOwnedProduct: { select: { id: true } },
      },
    });
  }

  async findAll(businessId: string) {
    return this.prisma.reOwnedProduct.findMany({
      where: {
        OR: [{ oldOwnerId: businessId }, { newOwnerId: businessId }],
      },
      include: {
        newProduct: { select: { id: true, title: true, price: true, quantity: true, businessId: true, isPhysical: true } },
        originalProduct: { select: { id: true, title: true, price: true, quantity: true, businessId: true, isPhysical: true } },
        shipping: true,
      },
    });
  }

  async findOne(id: string, businessId: string) {
    const reOwnedProduct = await this.prisma.reOwnedProduct.findUnique({
      where: { id },
      include: {
        newProduct: { select: { id: true, title: true, price: true, quantity: true, businessId: true, isPhysical: true } },
        originalProduct: { select: { id: true, title: true, price: true, quantity: true, businessId: true, isPhysical: true } },
        shipping: true,
      },
    });
    if (!reOwnedProduct) {
      throw new Error('ReOwnedProduct not found');
    }
    if (reOwnedProduct.oldOwnerId !== businessId && reOwnedProduct.newOwnerId !== businessId) {
      throw new Error('Access restricted to involved businesses');
    }
    return reOwnedProduct;
  }
}
