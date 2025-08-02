import { InputType, Field } from '@nestjs/graphql';
import {IsString } from 'class-validator';

@InputType()
export class CreateShippingInput {
  @Field()
  @IsString()
  reOwnedProductId: string;

  @Field()
  @IsString()
  trackingNumber: string;

  @Field()
  @IsString()
  carrier: string;
}


