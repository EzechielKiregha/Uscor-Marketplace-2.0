import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateSettingInput } from "./create-setting.input";

@InputType()
export class UpdateSettingInput extends PartialType(CreateSettingInput) {
	@Field(() => Int)
	id: number;
}
