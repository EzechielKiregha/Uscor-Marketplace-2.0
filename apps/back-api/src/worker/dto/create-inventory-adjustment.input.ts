import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { AdjustmentType } from "../../generated/prisma/enums";

registerEnumType(AdjustmentType, {
	name: "AdjustmentType",
});

@InputType()
export class CreateInventoryAdjustmentInput {
	@Field()
	@IsString()
	productId: string;

	@Field()
	@IsString()
	storeId: string;

	@Field(() => AdjustmentType)
	@IsEnum(AdjustmentType)
	adjustmentType: AdjustmentType;

	@Field()
	@IsNumber()
	@Min(1)
	quantity: number;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	reason?: string;
}
