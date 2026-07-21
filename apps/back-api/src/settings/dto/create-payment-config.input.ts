import { Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString } from "class-validator";

@InputType()
export class CreatePaymentConfigInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mtnCode?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  airtelCode?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  orangeCode?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mpesaCode?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bankAccount?: string

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  mobileMoneyEnabled?: boolean
}
