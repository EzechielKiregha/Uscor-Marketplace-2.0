import { Injectable } from '@nestjs/common';
import { CreateBusinessInput } from './dto/create-business.input';
import { UpdateBusinessInput } from './dto/update-business.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async create(createBusinessInput: CreateBusinessInput) {
    const { password, ...businessData } = createBusinessInput;
    const hashedPassword = await hash(password);

    return this.prisma.business.create({
      data: {
        ...businessData,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        description: true,
        avatar: true,
        coverImage: true,
        address: true,
        phone: true,
        isVerified: true,
        isB2BEnabled:true,
        kycStatus:true,
        hasAgreedToTerms:true,
        totalProductsSold:true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.business.findMany({
      include: {
        products: { select: { id: true, title: true, price: true, stock: true, createdAt: true } },
        workers: { select: { id: true, email: true, fullName: true, role: true, createdAt: true } },
        repostedItems: { select: { id: true, markupPercentage: true, createdAt: true } },
        reownedItems: { select: { id: true, oldPrice: true, newPrice: true, markupPercentage: true, createdAt: true } },
        recharges: { select: { id: true, amount: true, method: true, createdAt: true } },
        ads: { select: { id: true, price: true, periodDays: true, createdAt: true, endedAt: true } },
        freelanceServices: { select: { id: true, title: true, isHourly: true, rate: true, createdAt: true } },
        referralsMade: { select: { id: true, verifiedPurchase: true, createdAt: true } },
        referralsReceived: { select: { id: true, verifiedPurchase: true, createdAt: true } },
        chatParticipants: { select: {chat : { select: { id: true, status: true, createdAt: true, updatedAt: true } } } },
        postOfSales: { select: { id: true, title: true, price: true, status: true, createdAt: true } },
        kyc: { select: { id: true, status: true, submittedAt: true, verifiedAt: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.business.findUnique({
      where: { id },
      include: {
        products: { select: { id: true, title: true, price: true, stock: true, createdAt: true } },
        workers: { select: { id: true, email: true, fullName: true, role: true, createdAt: true } },
        repostedItems: { select: { id: true, markupPercentage: true, createdAt: true } },
        reownedItems: { select: { id: true, oldPrice: true, newPrice: true, markupPercentage: true, createdAt: true } },
        recharges: { select: { id: true, amount: true, method: true, createdAt: true } },
        ads: { select: { id: true, price: true, periodDays: true, createdAt: true, endedAt: true } },
        freelanceServices: { select: { id: true, title: true, isHourly: true, rate: true, createdAt: true } },
        referralsMade: { select: { id: true, verifiedPurchase: true, createdAt: true } },
        referralsReceived: { select: { id: true, verifiedPurchase: true, createdAt: true } },
        chatParticipants: { select: {chat : { select: { id: true, status: true, createdAt: true, updatedAt: true } } } },
        postOfSales: { select: { id: true, title: true, price: true, status: true, createdAt: true } },
        kyc: { select: { id: true, status: true, submittedAt: true, verifiedAt: true } },
      },
    });
  }

  async update(id: string, updateBusinessInput: UpdateBusinessInput) {
    const { password, kycId, ...businessData } = updateBusinessInput;
    const data: any = { ...businessData };

    if (password) {
      data.password = await hash(password);
    }
    if (kycId) {
      data.kyc = { connect: { id: kycId } };
    }

    return this.prisma.business.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        description: true,
        avatar: true,
        coverImage: true,
        address: true,
        phone: true,
        isVerified: true,
        isB2BEnabled:true,
        kycStatus:true,
        hasAgreedToTerms:true,
        totalProductsSold:true,
        createdAt: true,
        updatedAt: true,
        kyc: { select: { id: true, status: true } },
      },  
    });
  }

  async remove(id: string) {
    return this.prisma.business.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
}
