import { IsOptional, IsString } from 'class-validator';
import { CreateClientInput } from './create-client.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateClientInput extends PartialType(CreateClientInput) {
  @Field(() => Int)
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  kycId?: string; 
}
