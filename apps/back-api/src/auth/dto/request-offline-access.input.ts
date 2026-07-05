import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

@InputType()
export class RequestOfflineAccessInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	deviceId: string;

	@Field(() => String, { nullable: true })
    @IsString()
    @IsOptional()
	deviceName?: string;
}
