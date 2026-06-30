import { Field, Float, ObjectType, registerEnumType } from "@nestjs/graphql";

export enum LedgerEntryType {
	CREDIT = "CREDIT",
	DEBIT = "DEBIT",
}

registerEnumType(LedgerEntryType, { name: "LedgerEntryType" });

@ObjectType()
export class LedgerEntryEntity {
	@Field() id: string;
	@Field({ nullable: true }) businessId?: string;
	@Field({ nullable: true }) clientId?: string;
	@Field(() => LedgerEntryType) type: LedgerEntryType;
	@Field(() => Float) amount: number;
	@Field(() => Float) balanceAfter: number;
	@Field({ nullable: true }) reference?: string;
	@Field({ nullable: true }) referenceType?: string;
	@Field({ nullable: true }) referenceId?: string;
	@Field() description: string;
	@Field() createdAt: Date;
}

@ObjectType()
export class LedgerEntryListResponse {
	@Field(() => [LedgerEntryEntity]) items: LedgerEntryEntity[];
	@Field() total: number;
	@Field() page: number;
	@Field() limit: number;
}
