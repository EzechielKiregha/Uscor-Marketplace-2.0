import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsString, Length } from "class-validator";

@InputType()
export class VerifyEmailInput {
	@Field()
	@IsEmail()
	email: string;

	@Field()
	@IsString()
	@Length(6, 6)
	otp: string;
}
