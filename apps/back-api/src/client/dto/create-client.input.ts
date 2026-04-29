import { Field, InputType } from "@nestjs/graphql";
import { IsBoolean, IsEmail, IsOptional, IsString } from "class-validator";

@InputType()
export class CreateClientInput {
	@Field()
	@IsString()
	username: string;

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
	address?: string;

	@Field({ nullable: true })
	@IsOptional()
	phone?: string;

	@Field()
	@IsString()
	password: string;

	@Field()
	@IsBoolean()
	isVerified: boolean;
}

@InputType()
export class CreateClientForPOSInput {
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
	phone?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	address?: string;
}
