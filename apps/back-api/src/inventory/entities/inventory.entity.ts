import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Inventory {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
