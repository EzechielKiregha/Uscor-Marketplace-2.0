import { Resolver } from '@nestjs/graphql'
import { TokenService } from './token.service'
import { TokenEntity } from './entities/token.entity'

@Resolver(() => TokenEntity)
export class TokenResolver {
  constructor(
    private readonly tokenService: TokenService,
  ) {}
}
