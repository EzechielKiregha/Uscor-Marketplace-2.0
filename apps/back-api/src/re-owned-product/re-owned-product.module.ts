import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReOwnedProductResolver } from './re-owned-product.resolver';
import { ReOwnedProductService } from './re-owned-product.service';
import { ChatService } from 'src/chat/chat.service';
import { ChatModule } from 'src/chat/chat.module';



// Module
@Module({
  providers: [ReOwnedProductResolver, ReOwnedProductService, ChatService, PrismaService],
  imports: [ChatModule],
})
export class ReOwnedProductModule {}