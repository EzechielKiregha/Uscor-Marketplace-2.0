import { Field, Float, InputType } from "@nestjs/graphql";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

@InputType()
export class UpdateOrderInput {
	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	deliveryAddress?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	qrCode?: string;

	@Field(() => Float, { nullable: true })
	@IsOptional()
	@IsNumber()
	@Min(0)
	deliveryFee?: number;
}
