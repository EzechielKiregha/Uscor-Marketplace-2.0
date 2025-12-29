import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Marketplace {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
