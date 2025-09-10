import {
  ObjectType,
  Field,
  Int,
  Float,
} from '@nestjs/graphql'
import { ClientEntity } from '../../client/entities/client.entity'

@ObjectType()
export class ClientPointsBalanceEntity {
  @Field()
  clientId: string

  @Field(() => ClientEntity)
  client: ClientEntity

  @Field(() => Float)
  totalPoints: number
}
