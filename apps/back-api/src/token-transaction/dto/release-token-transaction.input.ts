import { IsBoolean, IsString } from 'class-validator';
import { CreateTokenTransactionInput } from './create-token-transaction.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class ReleaseTokenTransactionInput {
  @Field()
  @IsString()
  tokenTransactionId: string;

  @Field(() => Boolean)
  @IsBoolean()
  isReleased: boolean;
}
