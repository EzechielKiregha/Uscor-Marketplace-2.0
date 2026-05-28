import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import {
    IsBoolean,
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
} from "class-validator";

export enum WorkerRole {
	ADMIN = "ADMIN",
	STAFF = "STAFF",
	MANAGER = "MANAGER",
	FREELANCER = "FREELANCER",
}

registerEnumType(WorkerRole, {
	name: "WorkerRole",
});

@InputType()
export class CreateWorkerInput {
	@Field()
	@IsEmail()
	email: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	fullName?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	avatar?: string;

	@Field(() => WorkerRole)
	@IsEnum(WorkerRole)
	role: WorkerRole;

    @Field({ defaultValue: false })
	@IsOptional()
    @IsString()
    bio?: string;

    @Field({ defaultValue: false })
    @IsOptional()
    @IsString()
    phone?: string;

	@Field()
	@IsString()
	password: string;

	@Field({ defaultValue: false })
	@IsBoolean()
	isVerified: boolean;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	businessId?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	kycId?: string;

    @Field(() => Boolean, { nullable: true })
    @IsOptional()
    @IsBoolean()
    createNewWorker?: boolean;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    storeId?: string;
}
