import { InputType, Field } from '@nestjs/graphql'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

@InputType()
export class AddressInput {
  @Field()
  @IsString()
  street: string

  @Field()
  @IsString()
  city: string

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  country?: string

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  postalCode?: string

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean
}
