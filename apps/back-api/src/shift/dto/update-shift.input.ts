import { Field, InputType } from "@nestjs/graphql";
import { IsDate, IsOptional } from "class-validator";

@InputType()
export class UpdateShiftInput {
	@Field({ nullable: true })
	@IsOptional()
	@IsDate()
	startTime?: Date;

	@Field({ nullable: true })
	@IsOptional()
	@IsDate()
	endTime?: Date;
}
