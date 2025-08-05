import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { ClientEntity } from 'src/client/entities/client.entity';
import { LoyaltyProgramEntity } from './loyalty-program.entity';

@ObjectType()
export class PointsTransactionEntity {
  @Field()
  id: string;

  @Field()
  clientId: string;

  @Field(() => ClientEntity)
  client: ClientEntity;

  @Field()
  loyaltyProgramId: string;

  @Field(() => LoyaltyProgramEntity)
  loyaltyProgram: LoyaltyProgramEntity;

  @Field(() => Float)
  points: number;

  @Field()
  createdAt: Date;
}



