import { Field, InputType, PartialType } from "@nestjs/graphql";
import { CreateWorkerInput } from "./create-worker.input";
import { IsOptional } from "class-validator";

@InputType()
export class UpdateWorkerInput extends PartialType(CreateWorkerInput) {
	@Field({ nullable: true })
	@IsOptional()
	id?: string;
}
