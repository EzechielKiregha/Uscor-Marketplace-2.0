import { UseGuards } from "@nestjs/common";
import { Args, Context, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import {
	PaginatedSettlementsEntity,
	SettlementEntity,
	SettlementStatsEntity,
} from "./entities/settlement.entity";
import { SettlementService } from "./settlement.service";

@Resolver(() => SettlementEntity)
export class SettlementResolver {
	constructor(private readonly settlementService: SettlementService) {}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("admin")
	@Query(() => PaginatedSettlementsEntity, {
		name: "settlements",
		description: "List all settlements (admin only).",
	})
	async getSettlements(
		@Args("page", { type: () => Int, defaultValue: 1 }) page: number,
		@Args("limit", { type: () => Int, defaultValue: 20 }) limit: number,
		@Args("status", { nullable: true }) status?: string,
		@Args("businessId", { nullable: true }) businessId?: string,
	) {
		return this.settlementService.findAll(page, limit, status, businessId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business")
	@Query(() => PaginatedSettlementsEntity, {
		name: "businessSettlements",
		description: "List settlements for the current business.",
	})
	async getBusinessSettlements(
		@Args("businessId") businessId: string,
		@Args("page", { type: () => Int, defaultValue: 1 }) page: number,
		@Args("limit", { type: () => Int, defaultValue: 20 }) limit: number,
		@Args("status", { nullable: true }) status?: string,
		@Context() context?: any,
	) {
		return this.settlementService.findByBusiness(
			businessId,
			page,
			limit,
			status,
		);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("admin")
	@Query(() => SettlementStatsEntity, {
		name: "settlementStats",
		description: "Get settlement statistics (admin only).",
	})
	async getSettlementStats(
		@Args("businessId", { nullable: true }) businessId?: string,
	) {
		return this.settlementService.getStats(businessId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business")
	@Query(() => SettlementStatsEntity, {
		name: "businessSettlementStats",
		description: "Get settlement statistics for a business.",
	})
	async getBusinessSettlementStats(
		@Args("businessId") businessId: string,
	) {
		return this.settlementService.getStats(businessId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("admin")
	@Mutation(() => SettlementEntity, {
		description: "Distribute a settlement to a business.",
	})
	async distributeSettlement(
		@Args("id") id: string,
		@Context() context: any,
	) {
		const adminId = context.req.user.id;
		return this.settlementService.distribute(id, adminId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("admin")
	@Mutation(() => [SettlementEntity], {
		description: "Batch distribute settlements.",
	})
	async batchDistributeSettlements(
		@Args("ids", { type: () => [String] }) ids: string[],
		@Context() context: any,
	) {
		const adminId = context.req.user.id;
		return this.settlementService.batchDistribute(ids, adminId);
	}
}
