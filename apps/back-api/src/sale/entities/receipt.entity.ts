import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { SaleStatus } from "../../generated/prisma/enums";

// Enums
registerEnumType(SaleStatus, {
	name: "SaleStatus",
});

@ObjectType()
export class ReceiptEntity {
	@Field(() => String, { nullable: true })
	@IsOptional()
	filePath: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	receiptUrl: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	mediaId: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	fileName?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	fileSize?: string;

	@Field(() => String, { nullable: true })
	@IsOptional()
	createdAt: Date;

	@Field({ nullable: true })
	emailSent?: boolean;
}
