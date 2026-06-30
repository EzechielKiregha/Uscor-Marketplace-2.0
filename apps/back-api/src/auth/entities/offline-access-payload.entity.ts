import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class OfflineWorkerProfile {
    @Field(() => String)
    id: string;

    @Field(() => String)
    email: string;

    @Field(() => String, { nullable: true })
    fullName?: string | null;

    @Field(() => String, { nullable: true })
    avatar?: string | null;

    @Field(() => String)
    role: string;
}

@ObjectType()
export class OfflineBusinessInfo {
    @Field(() => String)
    id: string;

    @Field(() => String)
    name: string;

    @Field(() => String, { nullable: true })
    businessType?: string | null;

    @Field(() => [String])
    storeIds: string[];

    @Field(() => [String])
    storeNames: string[];
}

@ObjectType()
export class OfflineAccessPayload {
    @Field(() => String)
    offlineToken: string;

    @Field(() => Date)
    expiresAt: Date;

    @Field(() => [String])
    permissions: string[];

    @Field(() => OfflineWorkerProfile)
    workerProfile: OfflineWorkerProfile;

    @Field(() => OfflineBusinessInfo)
    businessInfo: OfflineBusinessInfo;
}
