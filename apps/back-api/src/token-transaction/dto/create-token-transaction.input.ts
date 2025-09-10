import {
  InputType,
  Int,
  Field,
  registerEnumType,
  Float,
} from '@nestjs/graphql'
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'

// Enums
export enum TokenTransactionType {
  RELEASE = 'RELEASE',
  PROFIT_SHARE = 'PROFIT_SHARE',
  REPOST_COMMISSION = 'REPOST_COMMISSION',
}

registerEnumType(TokenTransactionType, {
  name: 'TokenTransactionType',
})

// DTOs
@InputType()
export class CreateTokenTransactionInput {
  @Field()
  @IsString()
  businessId: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reOwnedProductId?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  repostedProductId?: string

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number

  @Field(() => TokenTransactionType)
  @IsEnum(TokenTransactionType)
  type: TokenTransactionType
}
