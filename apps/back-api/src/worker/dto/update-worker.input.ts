import { Field, InputType, PartialType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { CreateWorkerInput } from "./create-worker.input";

@InputType()
export class UpdateWorkerInput extends PartialType(CreateWorkerInput) {
	@Field({ nullable: true })
	@IsOptional()
	id?: string;
}
