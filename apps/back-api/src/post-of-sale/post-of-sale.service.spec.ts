import {
  Test,
  TestingModule,
} from '@nestjs/testing'
import { PostOfSaleService } from './post-of-sale.service'

describe('PostOfSaleService', () => {
  let service: PostOfSaleService

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [PostOfSaleService],
      }).compile()

    service = module.get<PostOfSaleService>(
      PostOfSaleService,
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
