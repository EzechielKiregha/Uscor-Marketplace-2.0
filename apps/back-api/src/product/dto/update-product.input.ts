import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { CreateProductInput } from './create-product.input'
import {
  InputType,
  Field,
  Int,
  PartialType,
  Float,
} from '@nestjs/graphql'

@InputType()
export class UpdateProductInput {
  @Field()
    @IsString()
    title: string
  
    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    description?: string
  
    @Field(() => Float)
    @IsNumber()
    @Min(0)
    price: number
  
    @Field(() => Int)
    @IsNumber()
    @Min(1)
    quantity: number
  
    @Field({ nullable: true })
    @IsOptional()
    storeId: string
  
    @Field()
    @IsBoolean()
    isPhysical: boolean
  
    @Field()
    @IsString()
    businessId: string
  
    @Field()
    @IsString()
    categoryId: string
  
    @Field(() => Boolean, { defaultValue: false })
    @IsOptional()
    featured?: boolean
  
    @Field(() => Boolean, { defaultValue: true })
    @IsOptional()
    approvedForSale?: boolean
}
