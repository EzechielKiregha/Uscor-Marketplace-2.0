import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class RequestOfflineAccessInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	deviceId: string;

	@Field(() => String, { nullable: true })
	deviceName?: string;
}
