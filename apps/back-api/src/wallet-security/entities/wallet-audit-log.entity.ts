import { Field, Float, ObjectType, registerEnumType } from "@nestjs/graphql";
import { GraphQLJSON } from "graphql-type-json";

export enum WalletAuditAction {
	REDEEM = "REDEEM",
	RELEASE = "RELEASE",
	RECHARGE = "RECHARGE",
	WITHDRAW = "WITHDRAW",
	CONVERT = "CONVERT",
	TRANSFER = "TRANSFER",
	ADJUSTMENT = "ADJUSTMENT",
}

registerEnumType(WalletAuditAction, { name: "WalletAuditAction" });

@ObjectType()
export class WalletAuditLogEntity {
	@Field() id: string;
	@Field({ nullable: true }) businessId?: string;
	@Field({ nullable: true }) clientId?: string;
	@Field(() => WalletAuditAction) action: WalletAuditAction;
	@Field(() => Float) amount: number;
	@Field(() => Float) balanceBefore: number;
	@Field(() => Float) balanceAfter: number;
	@Field(() => GraphQLJSON, { nullable: true }) metadata?: any;
	@Field({ nullable: true }) idempotencyKey?: string;
	@Field() createdAt: Date;
}

@ObjectType()
export class WalletAuditLogListResponse {
	@Field(() => [WalletAuditLogEntity]) items: WalletAuditLogEntity[];
	@Field() total: number;
	@Field() page: number;
	@Field() limit: number;
}
