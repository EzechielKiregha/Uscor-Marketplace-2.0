import { Module } from '@nestjs/common'
import { AdService } from './ad.service'
import { AdResolver } from './ad.resolver'

@Module({
  providers: [AdResolver, AdService],
})
export class AdModule {}
