import { Field, InputType } from "@nestjs/graphql";
import { IsDateString, IsString } from "class-validator";

@InputType()
export class StartShiftInput {
	@Field()
	@IsString()
	workerId: string;

	@Field()
	@IsString()
	storeId: string;

	@Field()
	@IsDateString()
	startTime: Date;
}
