import {
  ObjectType,
  Field,
  Int,
} from '@nestjs/graphql'
import { ProductEntity } from '../../product/entities/product.entity'

@ObjectType()
export class CategoryEntity {
  @Field()
  id: string

  @Field()
  name: string

  @Field({ nullable: true })
  description?: string

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date

  @Field(() => [ProductEntity], {
    nullable: true,
  })
  products?: ProductEntity[]
}
