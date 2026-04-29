import { Field, InputType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";

@InputType()
export class UpdateStoreInput {
	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	name?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	address?: string;
}
