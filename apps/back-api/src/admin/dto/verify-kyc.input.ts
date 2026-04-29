import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType()
export class VerifyKycInput {
	@Field()
	@IsString()
	businessId: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	notes?: string;
}
