import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreatePlatformInput } from "./create-platform.input";

@InputType()
export class UpdatePlatformInput extends PartialType(CreatePlatformInput) {
	@Field(() => Int)
	id: number;
}
