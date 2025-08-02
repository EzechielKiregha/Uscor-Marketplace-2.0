import { CreateReferralInput } from './create-referral.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateReferralInput extends PartialType(CreateReferralInput) {
  @Field(() => Int)
  id: number;
}
