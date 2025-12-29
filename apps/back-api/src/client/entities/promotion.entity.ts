import { ObjectType, Field } from '@nestjs/graphql'
import { BusinessEntity } from '../../business/entities/business.entity'

@ObjectType()
export class PromotionEntity {
  @Field()
  id: string

  @Field()
  title: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  type?: string

  @Field({ nullable: true })
  value?: number
  
  @Field({ nullable: true })
  discountPercentage?: number
  
  @Field({ nullable: true })
  code?: string

  @Field({ nullable: true })
  startDate?: Date

  @Field({ nullable: true })
  endDate?: Date

  @Field(() => [BusinessEntity], { nullable: true })
  applicableBusinesses?: BusinessEntity[]

  @Field(() => [String], { nullable: true })
  applicableCategories?: string[]

  @Field({ nullable: true })
  minimumPurchase?: number

  @Field({ nullable: true })
  isRedeemed?: boolean
}
