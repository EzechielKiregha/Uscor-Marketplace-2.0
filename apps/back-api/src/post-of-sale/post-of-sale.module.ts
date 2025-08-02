import { Module } from '@nestjs/common';
import { PostOfSaleService } from './post-of-sale.service';
import { PostOfSaleResolver } from './post-of-sale.resolver';

@Module({
  providers: [PostOfSaleResolver, PostOfSaleService],
})
export class PostOfSaleModule {}
