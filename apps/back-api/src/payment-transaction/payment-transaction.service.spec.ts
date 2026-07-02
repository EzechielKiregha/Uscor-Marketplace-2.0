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

import { PrismaService } from '../prisma/prisma.service'
import { PaymentTransactionService } from './payment-transaction.service'

describe('PaymentTransactionService', () => {
  let service: PaymentTransactionService
  let prisma: jest.Mocked<PrismaService>

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          PaymentTransactionService,
          {
            provide: PrismaService,
            useValue: {
              paymentConfig: {
                findUnique: jest.fn(),
              },
              paymentTransaction: {
                create: jest.fn(),
              },
            },
          },
        ],
      }).compile()

    service =
      module.get<PaymentTransactionService>(
        PaymentTransactionService,
      )
    prisma = module.get<PrismaService>(
      PrismaService,
    ) as jest.Mocked<PrismaService>
  })

  it('should generate correct MTN USSD code for Rwanda', async () => {
    prisma.paymentConfig.findUnique.mockResolvedValue(
      {
        mtnCode: '*182*1*{amount}*{phone}#',
      } as any,
    )

    const result = await service.generateUssdCode(
      'MTN',
      5000,
      '+250788123456',
      'RWANDA',
    )
    expect(result).toBe(
      '*182*1*5000*250788123456#',
    )
  })

  it('should handle offline payment storage when network is down', async () => {
    const input = {
      amount: 10000,
      method: 'AIRTEL',
      phone: '+250789000000',
      isOffline: true,
    }
    prisma.paymentTransaction.create.mockResolvedValue(
      { status: 'PENDING_SYNC' } as any,
    )

    const result =
      await service.processPayment(input)
    expect(result.status).toBe('PENDING_SYNC')
  })
})
