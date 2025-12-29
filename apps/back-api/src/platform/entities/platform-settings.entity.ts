import { ObjectType, Field, Float } from '@nestjs/graphql'

@ObjectType()
export class PlatformSettings {
  @Field() id: string
  @Field(() => Float) platformFeePercentage: number
  @Field(() => Float, { nullable: true }) minTransactionAmount?: number
  @Field(() => Float, { nullable: true }) maxTransactionAmount?: number
  @Field() currency: string
  @Field(() => Float, { nullable: true }) tokenValue?: number
  @Field({ nullable: true }) tokenSymbol?: string
  @Field() kycRequired: boolean
  @Field() b2bEnabled: boolean
  @Field() marketplaceEnabled: boolean
  @Field() createdAt: Date
  @Field() updatedAt: Date
}