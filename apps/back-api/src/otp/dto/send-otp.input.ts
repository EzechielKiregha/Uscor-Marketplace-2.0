import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEmail, IsEnum } from "class-validator";

export enum OtpPurposeEnum {
	EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
	PASSWORD_RESET = "PASSWORD_RESET",
	LOGIN_VERIFICATION = "LOGIN_VERIFICATION",
}

registerEnumType(OtpPurposeEnum, { name: "OtpPurpose" });

@InputType()
export class SendOtpInput {
	@Field()
	@IsEmail()
	email: string;

	@Field(() => OtpPurposeEnum)
	@IsEnum(OtpPurposeEnum)
	purpose: OtpPurposeEnum;
}
