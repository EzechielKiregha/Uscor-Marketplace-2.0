import { Field, InputType, PartialType } from "@nestjs/graphql";
import { CreateWorkerInput } from "./create-worker.input";

@InputType()
export class UpdateWorkerInput extends PartialType(CreateWorkerInput) {
	@Field(() => String)
	id: string;
}
