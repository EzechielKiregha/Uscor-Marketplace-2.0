import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TokenService } from './token.service';
import { TokenEntity } from './entities/token.entity';
import { CreateTokenInput } from './dto/create-token.input';
import { UpdateTokenInput } from './dto/update-token.input';

@Resolver(() => TokenEntity)
export class TokenResolver {
  constructor(private readonly tokenService: TokenService) {}
}
