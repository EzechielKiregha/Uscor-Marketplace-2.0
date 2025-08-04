import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Shift {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
