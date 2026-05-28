import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ProductEntity } from "../../product/entities/product.entity";

@ObjectType()
export class StoreInventoryItem {
  @Field()
  id: string;

  @Field()
  productId: string;

  @Field(() => ProductEntity, { nullable: true})
  product?: ProductEntity;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  minQuantity: number;

  @Field()
  status: string;
}

@ObjectType()
export class StoreInventoryEntity {
  @Field(() => [StoreInventoryItem])
  items: StoreInventoryItem[];

  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  lowStockCount: number;

  @Field(() => Int)
  outOfStockCount: number;
}
