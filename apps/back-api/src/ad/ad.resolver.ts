import { Resolver } from '@nestjs/graphql';
import { AdService } from './ad.service';
import { AdEntity } from './entities/ad.entity';

@Resolver(() => AdEntity)
export class AdResolver {
  constructor(private readonly adService: AdService) {}
}
