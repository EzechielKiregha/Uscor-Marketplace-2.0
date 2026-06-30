import { UseGuards } from "@nestjs/common";
import { Args, Context, Int, Query, Resolver } from "@nestjs/graphql";
import { JwtAuthGuard } from "../auth/guards/jwt-auth/jwt-auth.guard";
import {
	WalletAuditLogEntity,
	WalletAuditLogListResponse,
} from "./entities/wallet-audit-log.entity";
import {
	LedgerEntryEntity,
	LedgerEntryListResponse,
} from "./entities/ledger-entry.entity";
import { WalletSecurityService } from "./wallet-security.service";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
class WalletSecuritySummary {
	@Field() totalAuditLogs: number;
	@Field() totalLedgerEntries: number;
	@Field(() => [WalletAuditLogEntity]) recentActivity: WalletAuditLogEntity[];
}

@Resolver()
export class WalletSecurityResolver {
	constructor(private readonly walletSecurityService: WalletSecurityService) {}

	@UseGuards(JwtAuthGuard)
	@Query(() => WalletAuditLogListResponse, { name: "walletAuditLogs" })
	async getWalletAuditLogs(
		@Args("action", { type: () => String, nullable: true }) action: string,
		@Args("page", { type: () => Int, nullable: true }) page: number,
		@Args("limit", { type: () => Int, nullable: true }) limit: number,
		@Context() context: any,
	) {
		const user = context.req.user;
		return this.walletSecurityService.getAuditLogs(
			user.id,
			user.role,
			action,
			page,
			limit,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Query(() => LedgerEntryListResponse, { name: "ledgerEntries" })
	async getLedgerEntries(
		@Args("type", { type: () => String, nullable: true }) type: string,
		@Args("page", { type: () => Int, nullable: true }) page: number,
		@Args("limit", { type: () => Int, nullable: true }) limit: number,
		@Context() context: any,
	) {
		const user = context.req.user;
		return this.walletSecurityService.getLedgerEntries(
			user.id,
			user.role,
			type,
			page,
			limit,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Query(() => WalletSecuritySummary, { name: "walletSecuritySummary" })
	async getWalletSecuritySummary(@Context() context: any) {
		const user = context.req.user;
		return this.walletSecurityService.getWalletSecuritySummary(
			user.id,
			user.role,
		);
	}
}
