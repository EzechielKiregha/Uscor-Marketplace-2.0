import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { AdEntity } from '../../ad/entities/ad.entity';
import { BusinessEntity } from '../../business/entities/business.entity';
import { CategoryEntity } from '../../category/entities/category.entity';
import { ChatEntity } from '../../chat/entities/chat.entity';
import { MediaEntity } from '../../media/entities/media.entity';
import { OrderProductEntity } from '../../order-product/entities/order-product.entity';
import { ReOwnedProductEntity } from '../../re-owned-product/entities/re-owned-product.entity';
import { RepostedProductEntity } from '../../reposted-product/entities/reposted-product.entity';
import { ReviewEntity } from '../../review/entities/review.entity';
import { StoreEntity } from '../../store/entities/store.entity';

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
  quantity: number;

  @Field()
  businessId: string;

  @Field({nullable : true})
  storeId: string;

  @Field()
  isPhysical: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Boolean)
  featured: boolean;

  @Field(() => Boolean)
  approvedForSale: boolean;

  // Relations
  @Field(() => [MediaEntity], {nullable: true}) // Media associated with the product
  medias?: MediaEntity[];

  @Field(() => BusinessEntity, { nullable: true })
  business?: BusinessEntity;
  
  @Field(() => StoreEntity, { nullable: true })
  store?: StoreEntity;
  
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
