import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsString, Length, MinLength } from "class-validator";

@InputType()
export class ResetPasswordInput {
	@Field()
	@IsEmail()
	email: string;

	@Field()
	@IsString()
	@Length(6, 6)
	otp: string;

	@Field()
	@IsString()
	@MinLength(6)
	newPassword: string;
}
