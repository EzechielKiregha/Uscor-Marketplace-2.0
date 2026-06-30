import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsString } from "class-validator";

@InputType()
export class ResendOtpInput {
	@Field()
	@IsEmail()
	email: string;

	@Field()
	@IsString()
	purpose: string;
}
