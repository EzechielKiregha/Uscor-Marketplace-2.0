import { ObjectType, Field, Int } from "@nestjs/graphql";

@ObjectType()
export class BulkImportResultEntity {
  @Field()
  success: boolean;

  @Field(() => Int)
  count: number;
}