import { Field, Float, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

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

@InputType()
export class UpdateOrderStatusInput {
	@Field()
	@IsNotEmpty()
	@IsString()
	businessGroupId: string;

	@Field()
	@IsNotEmpty()
	@IsString()
	status: string;
}
