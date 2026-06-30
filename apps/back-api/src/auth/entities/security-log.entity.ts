import { Field, ObjectType } from "@nestjs/graphql";
import GraphQLJSON from "graphql-type-json";

@ObjectType()
export class SecurityLogEntity {
    @Field(() => String)
    id: string;

    @Field(() => String)
    userId: string;

    @Field(() => String)
    userRole: string;

    @Field(() => String)
    action: string;

    @Field(() => String, { nullable: true })
    ipAddress?: string | null;

    @Field(() => String, { nullable: true })
    userAgent?: string | null;

    @Field(() => String, { nullable: true })
    deviceId?: string | null;

    @Field(() => GraphQLJSON, { nullable: true })
    metadata?: any;

    @Field(() => Date)
    createdAt: Date;
}
