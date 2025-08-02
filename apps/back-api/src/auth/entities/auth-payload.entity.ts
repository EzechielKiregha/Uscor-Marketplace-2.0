import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AuthPayloadClient {

  @Field(() => String)
  id : string;

  @Field(() => String)
  email : string;

  @Field(() => String)
  fullname : string;

  @Field(() => String)
  phone : string;

  @Field(() => String, {nullable:true})
  avatar? : string;

  @Field(() => String)
  accessToken: string;
  
  @Field(() => String)
  refreshToken: string;
}
@ObjectType()
export class AuthPayloadWorker {

  @Field(() => String)
  id : string;

  @Field(() => String)
  email : string;

  @Field(() => String)
  fullname : string;

  @Field(() => String)
  phone : string;

  @Field(() => String)
  accessToken: string;
  
  @Field(() => String)
  refreshToken: string;
}

@ObjectType()
export class AuthPayloadBusiness {
  @Field(() => String)
  id : string;

  @Field(() => String)
  email : string;

  @Field(() => String)
  name : string;

  @Field(() => String)
  phone : string;

  @Field(() => String, { nullable: true })
  avatar? : string;

  @Field(() => String, { nullable: true })
  coverImage? : string;

  @Field(() => String)
  accessToken: string;
  
  @Field(() => String)
  refreshToken: string;
}
