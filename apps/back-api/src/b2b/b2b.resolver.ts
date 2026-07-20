import { UseGuards } from "@nestjs/common";
import { Args, Context, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { JwtAuthGuard } from "../auth/guards/jwt-auth/jwt-auth.guard";
import { B2BService } from "./b2b.service";
import { WholesalePriceEntity } from "./entities/wholesale-price.entity";
import { B2BOrderEntity, B2BOrderListResponse } from "./entities/b2b-order.entity";
import { CreateWholesalePriceInput, UpdateWholesalePriceInput } from "./dto/create-wholesale-price.input";
import { CreateB2BOrderInput, UpdateB2BOrderStatusInput } from "./dto/create-b2b-order.input";

@Resolver()
export class B2BResolver {
	constructor(private readonly b2bService: B2BService) {}

	// ─── Wholesale Pricing ──────────────────────────────────

	@Mutation(() => WholesalePriceEntity)
	@UseGuards(JwtAuthGuard)
	async createWholesalePrice(
		@Context() context: any,
		@Args("input") input: CreateWholesalePriceInput,
	) {
		const user = context.req.user;
		return this.b2bService.createWholesalePrice(user.id, input);
	}

	@Mutation(() => WholesalePriceEntity)
	@UseGuards(JwtAuthGuard)
	async updateWholesalePrice(
		@Context() context: any,
		@Args("input") input: UpdateWholesalePriceInput,
	) {
		const user = context.req.user;
		return this.b2bService.updateWholesalePrice(user.id, input);
	}

	@Mutation(() => WholesalePriceEntity)
	@UseGuards(JwtAuthGuard)
	async deleteWholesalePrice(
		@Context() context: any,
		@Args("id") id: string,
	) {
		const user = context.req.user;
		return this.b2bService.deleteWholesalePrice(user.id, id);
	}

	@Query(() => [WholesalePriceEntity])
	async wholesalePrices(
		@Args("productId") productId: string,
	) {
		return this.b2bService.getWholesalePrices(productId);
	}

	@Query(() => [WholesalePriceEntity])
	@UseGuards(JwtAuthGuard)
	async myWholesalePrices(@Context() context: any) {
		const user = context.req.user;
		return this.b2bService.getBusinessWholesalePrices(user.id);
	}

	// ─── B2B Orders ─────────────────────────────────────────

	@Mutation(() => B2BOrderEntity)
	@UseGuards(JwtAuthGuard)
	async createB2BOrder(
		@Context() context: any,
		@Args("input") input: CreateB2BOrderInput,
	) {
		const user = context.req.user;
		return this.b2bService.createB2BOrder(user.id, input);
	}

	@Mutation(() => B2BOrderEntity)
	@UseGuards(JwtAuthGuard)
	async submitB2BOrder(
		@Context() context: any,
		@Args("orderId") orderId: string,
	) {
		const user = context.req.user;
		return this.b2bService.submitB2BOrder(user.id, orderId);
	}

	@Mutation(() => B2BOrderEntity)
	@UseGuards(JwtAuthGuard)
	async updateB2BOrderStatus(
		@Context() context: any,
		@Args("input") input: UpdateB2BOrderStatusInput,
	) {
		const user = context.req.user;
		return this.b2bService.updateB2BOrderStatus(user.id, input);
	}

	@Query(() => B2BOrderListResponse)
	@UseGuards(JwtAuthGuard)
	async b2bOrders(
		@Context() context: any,
		@Args("role", { defaultValue: "all" }) role: string,
		@Args("status", { nullable: true }) status?: string,
		@Args("page", { type: () => Int, defaultValue: 1 }) page?: number,
		@Args("limit", { type: () => Int, defaultValue: 20 }) limit?: number,
	) {
		const user = context.req.user;
		return this.b2bService.getB2BOrders(
			user.id,
			role as "buyer" | "seller" | "all",
			status,
			page,
			limit,
		);
	}

	@Query(() => B2BOrderEntity)
	@UseGuards(JwtAuthGuard)
	async b2bOrder(
		@Context() context: any,
		@Args("orderId") orderId: string,
	) {
		const user = context.req.user;
		return this.b2bService.getB2BOrder(user.id, orderId);
	}

	// ─── Vendor Discovery ───────────────────────────────────

	@Query(() => B2BOrderListResponse, { description: "List B2B-enabled vendors" })
	async b2bVendors(
		@Args("page", { type: () => Int, defaultValue: 1 }) page?: number,
		@Args("limit", { type: () => Int, defaultValue: 20 }) limit?: number,
		@Args("businessType", { nullable: true }) businessType?: string,
	) {
		return this.b2bService.getB2BVendors(page, limit, businessType);
	}

	// ─── B2B Payment ───────────────────────────────────────

	@Mutation(() => B2BOrderEntity, { description: "Pay for a B2B order" })
	@UseGuards(JwtAuthGuard)
	async payB2BOrder(
		@Context() context: any,
		@Args("orderId") orderId: string,
		@Args("method", { defaultValue: "MOBILE_MONEY" }) method: string,
	) {
		const user = context.req.user;
		return this.b2bService.payB2BOrder(user.id, orderId, method);
	}

	// ─── Phone-based B2B orders (for USSD) ─────────────────

	@Query(() => B2BOrderListResponse, { description: "Get B2B orders by phone number" })
	async b2bOrdersByPhone(
		@Args("phone") phone: string,
		@Args("role", { defaultValue: "buyer" }) role: string,
	) {
		return this.b2bService.getB2BOrdersByPhone(phone, role as "buyer" | "seller" | "all");
	}
}
