import { Field, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
import { CreateClientInput } from "./create-client.input";

@InputType()
export class UpdateClientInput extends PartialType(CreateClientInput) {
	@Field()
	@IsString()
	id: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	kycId?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	avatar?: string;
}
