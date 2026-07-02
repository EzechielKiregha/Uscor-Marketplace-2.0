import {
    beforeEach,
    describe,
    expect,
    it,
    jest,
} from '@jest/globals'
import {
    Test,
    TestingModule,
} from '@nestjs/testing'
import { AuthPayload } from '../auth/entities/auth-payload.entity'
import { PrismaService } from '../prisma/prisma.service'
import { SaleService } from './sale.service'

describe('SaleService', () => {
  let service: SaleService
  let prisma: jest.Mocked<PrismaService>

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          SaleService,
          {
            provide: PrismaService,
            useValue: {
              sale: {
                create: jest.fn(),
                findMany: jest.fn(),
              },
              product: {
                update: jest.fn(),
                findUnique: jest.fn(),
              },
              shift: { update: jest.fn() },
            },
          },
        ],
      }).compile()

    service = module.get<SaleService>(SaleService)
    prisma = module.get<PrismaService>(
      PrismaService,
    ) as jest.Mocked<PrismaService>
  })

  it('should create sale, deduct product, and update shift totals', async () => {
    const input = {
      businessId: 'biz-1',
      workerId: 'worker-1',
      storeId: 'store-1',
      items: [
        {
          productId: 'prod-1',
          quantity: 2,
          price: 5000,
        },
      ],
      isOffline: false,
    }

    prisma.product.findUnique.mockResolvedValue(
      { quantity: 10 } as any,
    )
    prisma.sale.create.mockResolvedValue({
      id: 'sale-1',
      status: 'COMPLETED',
    } as any)

    const user : AuthPayload = {
        id: "00001",
        role: "worker",
        email: "worker@gmail"
    }

    const result = await service.create(input, user)

    expect(result.id).toBe('sale-1')
    expect(
      prisma.product.update,
    ).toHaveBeenCalledTimes(1)
    expect(
      prisma.shift.update,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          salesToday: expect.any(Number),
        }),
      }),
    )
  })

  it('should flag transaction for sync when isOffline is true', async () => {
    const input = {
      businessId: 'biz-1',
      workerId: 'worker-1',
      storeId: 'store-1',
      items: [
        {
          productId: 'prod-1',
          quantity: 1,
          price: 3000,
        },
      ],
      isOffline: true,
    }

    prisma.product.findUnique.mockResolvedValue(
      { quantity: 5 } as any,
    )
    prisma.sale.create.mockResolvedValue({
      id: 'sale-offline',
      syncStatus: 'PENDING_SYNC',
    } as any)

        const user: AuthPayload = {
          id: '00001',
          role: 'worker',
          email: 'worker@gmail',
        }

    const result = await service.create(input, user)

    expect(result.syncStatus).toBe('PENDING_SYNC')
  })
})
