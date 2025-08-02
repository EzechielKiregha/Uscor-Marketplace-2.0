import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { AdEntity } from 'src/ad/entities/ad.entity';
import { BusinessEntity } from 'src/business/entities/business.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { ChatEntity } from 'src/chat/entities/chat.entity';
import { MediaEntity } from 'src/media/entities/media.entity';
import { OrderProductEntity } from 'src/order-product/entities/order-product.entity';
import { ReOwnedProductEntity } from 'src/re-owned-product/entities/re-owned-product.entity';
import { RepostedProductEntity } from 'src/reposted-product/entities/reposted-product.entity';
import { ReviewEntity } from 'src/review/entities/review.entity';

@ObjectType()
export class ProductEntity {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock: number;

  @Field(() => Int)
  quantity: number;

  @Field()
  businessId: string;

  @Field()
  isPhysical: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => [MediaEntity]) // Media associated with the product
  medias: MediaEntity[];

  @Field(() => BusinessEntity, { nullable: true })
  business?: BusinessEntity;
  
  @Field(() => CategoryEntity, { nullable: true })
  category?: CategoryEntity;

  @Field(() => [ReviewEntity]) // Reviews for the product
  reviews: ReviewEntity[];

  @Field(() => [OrderProductEntity]) // Orders containing the product
  orders: OrderProductEntity[];

  @Field(() => [ChatEntity]) // Chats related to the product
  chats: ChatEntity[];

  @Field(() => [RepostedProductEntity]) // Reposted versions of the product
  reposts: RepostedProductEntity[];

  @Field(() => [ReOwnedProductEntity]) // Reowned versions of the product
  reowns: ReOwnedProductEntity[];

  @Field(() => [AdEntity]) // Ads for the product
  ads: AdEntity[];
}
