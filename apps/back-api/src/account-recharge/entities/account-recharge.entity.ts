import { ObjectType, Field, Float, registerEnumType } from '@nestjs/graphql';
import { BusinessEntity } from '../../business/entities/business.entity';
import { ClientEntity } from '../../client/entities/client.entity';
import { Country, RechargeMethod } from '../dto/create-account-recharge.input';
import { TokenTransactionEntity } from '../../token-transaction/entities/token-transaction.entity';

@ObjectType()
export class AccountRechargeEntity {
  @Field()
  id: string;

  @Field(() => Float)
  amount: number;

  @Field(() => RechargeMethod)
  method: RechargeMethod;

  @Field(() => Country)
  origin: Country;

  @Field({ nullable: true })
  businessId?: string;

  @Field(() => BusinessEntity, { nullable: true })
  business?: BusinessEntity;

  @Field({ nullable: true })
  clientId?: string;

  @Field(() => ClientEntity, { nullable: true })
  client?: ClientEntity;

  @Field({ nullable: true })
  tokenTransactionId?: string;

  @Field(() => TokenTransactionEntity, { nullable: true })
  tokenTransaction?: TokenTransactionEntity;

  @Field()
  createdAt: Date;
}
