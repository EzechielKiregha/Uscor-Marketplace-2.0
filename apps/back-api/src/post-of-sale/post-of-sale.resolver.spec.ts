import {
  Test,
  TestingModule,
} from '@nestjs/testing'
import { PostOfSaleResolver } from './post-of-sale.resolver'
import { PostOfSaleService } from './post-of-sale.service'

describe('PostOfSaleResolver', () => {
  let resolver: PostOfSaleResolver

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          PostOfSaleResolver,
          PostOfSaleService,
        ],
      }).compile()

    resolver = module.get<PostOfSaleResolver>(
      PostOfSaleResolver,
    )
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
