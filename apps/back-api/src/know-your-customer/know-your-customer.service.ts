import {
  Inject,
  Injectable,
} from '@nestjs/common'
import { KycStatus } from '../generated/prisma/enums'
import { PrismaService } from '../prisma/prisma.service'
import { UploadKycDocumentInput } from './dto/upload-kyc-document.input'

@Injectable()
export class KnowYourCustomerService {
  constructor(
    private prisma: PrismaService,
    @Inject('PUB_SUB') private pubSub: any,
  ) {}

  async getBusinessGetKycDocuments(
    businessId: string,
  ) {
    const kycDocuments =
      await this.prisma.kycDocument.findMany({
        where: { businessId },
        select: {
          id: true,
          businessId: true,
          documentUrl: true,
          documentType: true,
          status: true,
          rejectionReason: true,
          submittedAt: true,
          verifiedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      })

    return kycDocuments
  }

  async uploadKycDocument(
    input: UploadKycDocumentInput,
  ) {
    const client = this.prisma as any
    const doc = await client.kycDocument.create({
      data: { ...input },
    })
    const business =
      await this.prisma.business.findUnique({
        where: { id: input.businessId },
      })
    if (business)
      await this.pubSub.publish('KYC_UPDATED', {
        kycUpdated: {
          id: business.id,
          kycStatus: business.kycStatus,
          kyc: [doc],
        },
      })
    return doc
  }

  async submitKyc(businessId: string) {
    const updated =
      await this.prisma.business.update({
        where: { id: businessId },
        data: {
          kycStatus: 'PENDING',
          kyc: {
            create: {
              status: KycStatus.PENDING,
              notes:
                'All Required Documents were submitted',
              documentUrl: 'NO URL',
            },
          },
        },
        include: {
          kyc: true,
        },
      })
    await this.pubSub.publish('KYC_UPDATED', {
      kycUpdated: {
        id: updated.id,
        kycStatus: updated.kycStatus,
      },
    })
    // also publish kycSubmitted for frontend compatibility
    await this.pubSub.publish('KYC_SUBMITTED', {
      kycSubmitted: {
        id: updated.id,
        name: updated.name,
        kycStatus: updated.kycStatus,
      },
    })
    return updated
  }

  async verifyKyc(
    businessId: string,
    notes?: string,
    documentUrl?: string,
  ) {
    const client = this.prisma
    // update business status
    const business = await client.business.update(
      {
        where: { id: businessId },
        data: {
          kycStatus: 'VERIFIED',
          isVerified: true,
        },
        include: { kyc: true },
      },
    )

    const updated = await client.kYC.update({
      where: { id: business?.kyc?.id },
      data: {
        status: KycStatus.VERIFIED,
        verifiedAt: new Date(),
        documentUrl,
      },
      include: {
        business: true,
      },
    })
    // update most recent KYC document if exists
    const doc =
      await client.kycDocument.findFirst({
        where: { businessId },
        orderBy: { submittedAt: 'desc' },
      })
    if (doc) {
      await client.kycDocument.updateMany({
        where: { businessId },
        data: {
          status: 'VERIFIED',
          verifiedAt: new Date(),
        },
      })
    }
    // create audit log
    await client.auditLog.create({
      data: {
        action: 'VERIFY_KYC',
        entityType: 'Business',
        entityId: businessId,
        details: { notes: notes || '' },
      },
    })
    if (!updated)
      throw Error('Failed to update KYC')
    await this.pubSub.publish('KYC_UPDATED', {
      kycUpdated: {
        id: updated.id,
        kycStatus: updated.status,
      },
    })
    await this.pubSub.publish('KYC_VERIFIED', {
      kycVerified: updated,
    })
    return updated
  }

  async updateKyc(
    businessId: string,
    documentUrl: string,
  ) {
    const client = this.prisma

    const business =
      await client.business.findUnique({
        where: { id: businessId },
        include: { kyc: true },
      })

    let updated

    if (business)
      updated = await client.kYC.update({
        where: { id: business?.kyc?.id },
        data: { documentUrl },
        include: {
          business: true,
        },
      })

    // create audit log
    await client.auditLog.create({
      data: {
        action: 'VERIFY_KYC',
        entityType: 'Busineess',
        entityId: businessId,
        details: {
          notes:
            'Uploading USCOR KYC Certificate',
        },
      },
    })
    await this.pubSub.publish('KYC_UPDATED', {
      kycUpdated: {
        id: updated.id,
        documentUrl: updated.documentUrl,
      },
    })
    return updated
  }

  async rejectKyc(
    businessId: string,
    rejectionReason: string,
    documentUrl?: string,
  ) {
    const client = this.prisma
    const business = await client.business.update(
      {
        where: { id: businessId },
        data: {
          kycStatus: 'REJECTED',
          isVerified: false,
        },
        include: { kyc: true },
      },
    )

    if (!business)
      throw Error('business not found')

    const updated = await client.kYC.update({
      where: { id: business?.kyc?.id! },
      data: {
        status: KycStatus.REJECTED,
        verifiedAt: new Date(),
        documentUrl,
      },
      include: {
        business: true,
      },
    })
    if (!updated)
      throw Error('Failed to update KYC')
    // mark most recent doc rejected
    const doc =
      await client.kycDocument.findFirst({
        where: { businessId },
        orderBy: { submittedAt: 'desc' },
      })
    if (doc) {
      await client.kycDocument.update({
        where: { id: doc.id },
        data: {
          status: 'REJECTED',
          rejectionReason,
        },
      })
    }
    await client.auditLog.create({
      data: {
        action: 'REJECT_KYC',
        entityType: 'Business',
        entityId: businessId,
        details: { rejectionReason },
      },
    })
    await this.pubSub.publish('KYC_UPDATED', {
      kycUpdated: {
        id: updated.id,
        kycStatus: updated.status,
      },
    })
    await this.pubSub.publish('KYC_REJECTED', {
      kycRejected: updated,
    })
    return updated
  }
}
