import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt } from "class-validator";
import { CreateSettingInput } from "./create-setting.input";

@InputType()
export class UpdateSettingInput extends PartialType(CreateSettingInput) {
	@Field(() => Int)
    @IsInt()
	id: number;
}
