import { Field, InputType } from "@nestjs/graphql";
import { IsEmail, IsEnum, IsString, Length } from "class-validator";
import { OtpPurposeEnum } from "./send-otp.input";

@InputType()
export class VerifyOtpInput {
	@Field()
	@IsEmail()
	email: string;

	@Field()
	@IsString()
	@Length(6, 6)
	code: string;

	@Field(() => OtpPurposeEnum)
	@IsEnum(OtpPurposeEnum)
	purpose: OtpPurposeEnum;
}
