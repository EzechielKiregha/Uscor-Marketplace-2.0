import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class StoreSuccessResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
