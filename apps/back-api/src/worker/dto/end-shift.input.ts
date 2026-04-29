import { Field, InputType } from "@nestjs/graphql";
import { IsNumber, IsString } from "class-validator";

@InputType()
export class EndShiftInput {
	@Field()
	@IsString()
	id: string;

	@Field()
	@IsNumber()
	sales: number;
}
