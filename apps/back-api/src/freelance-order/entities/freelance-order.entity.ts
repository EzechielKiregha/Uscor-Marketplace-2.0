import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { BusinessEntity } from 'src/business/entities/business.entity';
import { ClientEntity } from 'src/client/entities/client.entity';
import { FreelanceServiceEntity } from 'src/freelance-service/entities/freelance-service.entity';
import { PaymentTransactionEntity } from 'src/payment-transaction/entities/payment-transaction.entity';
import { EscrowStatus, FreelanceStatus } from '../dto/create-freelance-order.input';

@ObjectType()
export class FreelanceOrderEntity {
  @Field()
  id: string;

  @Field(() => FreelanceStatus)
  status: FreelanceStatus;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Float)
  escrowAmount: number;

  @Field(() => Float)
  commissionPercent: number;

  @Field(() => EscrowStatus, { nullable: true })
  escrowStatus?: EscrowStatus;

  @Field()
  createdAt: Date;

  @Field()
  escrowReleasedAt: Date;

  @Field(() => ClientEntity)
  client: ClientEntity;

  @Field(() => FreelanceServiceEntity)
  service: FreelanceServiceEntity;

  @Field(() => [FreelanceOrderBusinessEntity])
  freelanceOrderBusiness: FreelanceOrderBusinessEntity[];

  @Field(() => PaymentTransactionEntity, { nullable: true })
  payment?: PaymentTransactionEntity;
}


@ObjectType()
export class FreelanceOrderBusinessEntity {
  @Field()
  id: string;

  @Field(() => BusinessEntity)
  business: BusinessEntity;

  @Field()
  role?: string;

  @Field()
  assignedAt: Date;
}
