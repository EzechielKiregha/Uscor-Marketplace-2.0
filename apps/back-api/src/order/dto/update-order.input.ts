import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'
import {
  InputType,
  Field,
  Float,
} from '@nestjs/graphql'

@InputType()
export class UpdateOrderInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  deliveryAddress?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  qrCode?: string

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number
}
