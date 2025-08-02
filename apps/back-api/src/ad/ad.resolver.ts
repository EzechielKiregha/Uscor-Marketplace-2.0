import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AdService } from './ad.service';
import { AdEntity } from './entities/ad.entity';
import { CreateAdInput } from './dto/create-ad.input';
import { UpdateAdInput } from './dto/update-ad.input';

@Resolver(() => AdEntity)
export class AdResolver {
  constructor(private readonly adService: AdService) {}
}
