import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateAdInput } from "./create-ad.input";

@InputType()
export class UpdateAdInput extends PartialType(CreateAdInput) {
	@Field(() => Int)
	id: number;
}
