import { ObjectType, Field } from '@nestjs/graphql';
import { BusinessEntity } from '../../business/entities/business.entity';
import { ClientEntity } from '../../client/entities/client.entity';
import { WorkerEntity } from '../../worker/entities/worker.entity';

@ObjectType()
export class KnowYourCustomerEntity {
  @Field()
  id: string;

  @Field()
  status: string; // KycStatus (e.g., PENDING, VERIFIED, REJECTED)

  @Field()
  documentUrl: string;

  @Field()
  submittedAt: Date;

  @Field({ nullable: true })
  verifiedAt?: Date;

  @Field({ nullable: true })
  businessId?: string;

  @Field({ nullable: true })
  clientId?: string;

  @Field({ nullable: true })
  workerId?: string;

  // Relations
  @Field(() => BusinessEntity, { nullable: true }) // Business associated with the KYC
  business: BusinessEntity;

  @Field(() => ClientEntity, { nullable: true }) // Client associated with the KYC
  client: ClientEntity;

  @Field(() => WorkerEntity, { nullable: true }) // Worker associated with the KYC
  worker: WorkerEntity;
}
