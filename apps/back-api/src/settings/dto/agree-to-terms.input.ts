import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class AgreeToTermsInput {
	@Field()
	businessId: string;
}
