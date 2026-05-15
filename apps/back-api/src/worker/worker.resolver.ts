import { Inject, UseGuards } from "@nestjs/common";
import {
	Args,
	Field,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Subscription,
} from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AddSaleProductInput } from "./dto/add-sale-product.input";
import { CreateInventoryAdjustmentInput } from "./dto/create-inventory-adjustment.input";
import { CreateSaleInput } from "./dto/create-sale.input";
import { CreateWorkerInput } from "./dto/create-worker.input";
import { EndWorkerShiftInput } from "./dto/end-shift.input";
import { ProcessMobileMoneyPaymentInput } from "./dto/process-mobile-money.input";
import { SendChatMessageInput } from "./dto/send-chat-message.input";
import { StartShiftInput } from "./dto/start-shift.input";
import { UpdateSaleProductInput } from "./dto/update-sale-product.input";
import { UpdateWorkerInput } from "./dto/update-worker.input";
import { ChatEntityWorker } from "./entities/chat.entity";
import { ChatMessageEntityV2 } from "./entities/chat-message.entity";
import {
	MobileMoneyPaymentResponseEntity,
	WorkerDashboardEntity,
	WorkerDashboardStatsEntity,
} from "./entities/dashboard.entity";
import { InventoryAdjustmentEntityWorker } from "./entities/inventory-adjustment.entity";
import { SaleEntityWorker } from "./entities/sale.entity";
import { SaleProductEntityWorker } from "./entities/sale-product.entity";
import { ShiftEntityWorker } from "./entities/shift.entity";
import { WorkerEntity } from "./entities/worker.entity";
import { WorkerService } from "./worker.service";

@ObjectType()
class SalesPagedResult {
	@Field(() => [SaleEntityWorker])
	items: SaleEntityWorker[];

	@Field(() => Int)
	total: number;

	@Field(() => Int)
	page: number;

	@Field(() => Int)
	limit: number;
}

@ObjectType()
class ShiftsPagedResult {
	@Field(() => [ShiftEntityWorker])
	items: ShiftEntityWorker[];

	@Field(() => Int)
	total: number;

	@Field(() => Int)
	page: number;

	@Field(() => Int)
	limit: number;
}

@ObjectType()
class InventoryPagedResult {
	@Field(() => [InventoryAdjustmentEntityWorker])
	items: InventoryAdjustmentEntityWorker[];

	@Field(() => Int)
	total: number;

	@Field(() => Int)
	page: number;

	@Field(() => Int)
	limit: number;
}

@ObjectType()
class ChatsPagedResult {
	@Field(() => [ChatEntityWorker])
	items: ChatEntityWorker[];

	@Field(() => Int)
	total: number;

	@Field(() => Int)
	page: number;

	@Field(() => Int)
	limit: number;
}

@Resolver(() => WorkerEntity)
export class WorkerResolver {
	constructor(
		private readonly workerService: WorkerService,
		@Inject("PUB_SUB") private pubSub: PubSub,
	) {}

	@Mutation(() => WorkerEntity)
	async createWorker(
		@Args("createWorkerInput")
		createWorkerInput: CreateWorkerInput,
	) {
		return await this.workerService.create(createWorkerInput);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker", "business", "client")
	@Query(() => [WorkerEntity], {
		name: "workers",
	})
	async getWorkers(
		@Args("storeId", {
			type: () => String,
			nullable: true,
		})
		storeId?: string,
	) {
		return this.workerService.findAll(storeId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker", "business", "client")
	@Query(() => WorkerEntity, { name: "worker" })
	async getWorker(
		@Args("id", { type: () => String })
		id: string,
	) {
		return this.workerService.findOne(id);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker", "business")
	@Mutation(() => WorkerEntity)
	async updateWorker(
		@Args("id", { type: () => String })
		id: string,
		@Args("updateWorkerInput")
		updateWorkerInput: UpdateWorkerInput,
	) {
		return this.workerService.update(id, updateWorkerInput);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker", "business")
	@Mutation(() => WorkerEntity)
	async deleteWorker(
		@Args("id", { type: () => String })
		id: string,
	) {
		return this.workerService.remove(id);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker", "business")
	@Mutation(() => WorkerEntity)
	async updateWorkerProfile(
		@Args("id", { type: () => String })
		id: string,
		@Args("input") input: UpdateWorkerInput,
	) {
		return this.workerService.update(id, input);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker", "business")
	@Query(() => WorkerDashboardEntity, {
		name: "workerDashboard",
	})
	async getWorkerDashboard(
		@Args("workerId") workerId: string,
		@Args("storeId") storeId: string,
	) {
		return this.workerService.getDashboard(workerId, storeId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker", "business")
	@Query(() => WorkerDashboardStatsEntity, {
		name: "workerDashboardStats",
	})
	async getWorkerDashboardStats(
		@Args("workerId") workerId: string,
		@Args("storeId") storeId: string,
	) {
		return this.workerService.getDashboardStats(workerId, storeId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker", "business")
	@Mutation(() => SaleEntityWorker)
	async createSale(@Args("input") input: CreateSaleInput) {
		const sale = await this.workerService.createSale(input);
		await this.pubSub.publish("saleCreated", {
			saleCreated: sale,
		});
		return sale;
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Query(() => SalesPagedResult, {
		name: "workerSales",
	})
	async getWorkerSales(
		@Args("workerId") workerId: string,
		@Args("storeId", { nullable: true })
		storeId?: string,
		@Args("status", { nullable: true })
		status?: string,
		@Args("startDate", { nullable: true })
		startDate?: Date,
		@Args("endDate", { nullable: true })
		endDate?: Date,
		@Args("page", {
			type: () => Int,
			defaultValue: 1,
		})
		page?: number,
		@Args("limit", {
			type: () => Int,
			defaultValue: 20,
		})
		limit?: number,
	) {
		return this.workerService.getSalesByWorker(
			workerId,
			storeId,
			status,
			startDate,
			endDate,
			page,
			limit,
		);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Query(() => SaleEntityWorker, {
		name: "workerCurrentSale",
		nullable: true,
	})
	async getWorkerCurrentSale(
		@Args("workerId") workerId: string,
		@Args("storeId") storeId: string,
	) {
		return this.workerService.getCurrentSale(workerId, storeId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Mutation(() => SaleProductEntityWorker)
	async addSaleProduct(@Args("input") input: AddSaleProductInput) {
		return this.workerService.addSaleProduct(input);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Mutation(() => SaleProductEntityWorker)
	async updateSaleProduct(
		@Args("id") id: string,
		@Args("input") input: UpdateSaleProductInput,
	) {
		return this.workerService.updateSaleProduct(id, input);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Mutation(() => SaleProductEntityWorker)
	async removeSaleProduct(@Args("id") id: string) {
		return this.workerService.removeSaleProduct(id);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Mutation(() => SaleEntityWorker)
	async completeWorkerSale(
		@Args("id") id: string,
		@Args("paymentMethod") paymentMethod: string,
	) {
		const sale = await this.workerService.completeSale({
			id,
			paymentMethod: paymentMethod as any,
		});
		await this.pubSub.publish("saleUpdated", {
			saleUpdated: sale,
		});
		return sale;
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Query(() => InventoryPagedResult, {
		name: "workerInventory",
	})
	async getWorkerInventory(
		@Args("storeId") storeId: string,
		@Args("productId", { nullable: true })
		productId?: string,
		@Args("lowStockOnly", {
			type: () => Boolean,
			nullable: true,
		})
		lowStockOnly?: boolean,
		@Args("page", {
			type: () => Int,
			defaultValue: 1,
		})
		page?: number,
		@Args("limit", {
			type: () => Int,
			defaultValue: 20,
		})
		limit?: number,
	) {
		return this.workerService.getInventory(
			storeId,
			productId,
			lowStockOnly,
			page,
			limit,
		);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Mutation(() => InventoryAdjustmentEntityWorker)
	async createInventoryAdjustment(
		@Args("input")
		input: CreateInventoryAdjustmentInput,
	) {
		const adjustment =
			await this.workerService.createInventoryAdjustment(input);
		await this.pubSub.publish("inventoryUpdated", {
			inventoryUpdated: adjustment,
		});
		return adjustment;
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Mutation(() => ShiftEntityWorker)
	async startShift(@Args("input") input: StartShiftInput) {
		const shift = await this.workerService.startShift(input);
		await this.pubSub.publish("shiftStarted", {
			shiftStarted: shift,
		});
		return shift;
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Mutation(() => ShiftEntityWorker)
	async endWorkerShift(@Args("input") input: EndWorkerShiftInput) {
		const shift = await this.workerService.endShift(input);
		await this.pubSub.publish("shiftEnded", {
			shiftEnded: shift,
		});
		return shift;
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Query(() => ShiftsPagedResult, {
		name: "workerShifts",
	})
	async getWorkerShifts(
		@Args("workerId") workerId: string,
		@Args("storeId", { nullable: true })
		storeId?: string,
		@Args("startDate", { nullable: true })
		startDate?: Date,
		@Args("endDate", { nullable: true })
		endDate?: Date,
		@Args("page", {
			type: () => Int,
			defaultValue: 1,
		})
		page?: number,
		@Args("limit", {
			type: () => Int,
			defaultValue: 20,
		})
		limit?: number,
	) {
		return this.workerService.getShiftsByWorker(
			workerId,
			storeId,
			startDate,
			endDate,
			page,
			limit,
		);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Query(() => ShiftEntityWorker, {
		name: "workerCurrentShift",
		nullable: true,
	})
	async getWorkerCurrentShift(
		@Args("workerId") workerId: string,
		@Args("storeId") storeId: string,
	) {
		return this.workerService.getCurrentShift(workerId, storeId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Query(() => ChatsPagedResult, {
		name: "workerChats",
	})
	async getWorkerChats(
		@Args("workerId") workerId: string,
		@Args("page", {
			type: () => Int,
			defaultValue: 1,
		})
		page?: number,
		@Args("limit", {
			type: () => Int,
			defaultValue: 20,
		})
		limit?: number,
	) {
		return this.workerService.getChatsByWorker(workerId, page, limit);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Mutation(() => ChatMessageEntityV2)
	async sendMessage(@Args("input") input: SendChatMessageInput) {
		const message = await this.workerService.sendChatMessage(input);
		await this.pubSub.publish("newChatMessage", {
			newChatMessage: message,
		});
		return message;
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("worker")
	@Mutation(() => MobileMoneyPaymentResponseEntity)
	async processMobileMoneyPayment(
		@Args("input")
		input: ProcessMobileMoneyPaymentInput,
	) {
		return this.workerService.processMobileMoneyPayment(input);
	}

	@Subscription(() => SaleEntityWorker, {
		filter: (payload, variables) =>
			payload.saleCreated.storeId === variables.storeId,
	})
	saleCreated(@Args("storeId") _storeId: string) {
		return this.pubSub.asyncIterableIterator(["saleCreated"]);
	}

	@Subscription(() => SaleEntityWorker, {
		filter: (payload, variables) =>
			payload.saleUpdated.storeId === variables.storeId,
	})
	saleUpdated(@Args("storeId") _storeId: string) {
		return this.pubSub.asyncIterableIterator(["saleUpdated"]);
	}

	@Subscription(() => ChatMessageEntityV2)
	newChatMessage(@Args("workerId") _workerId: string) {
		return this.pubSub.asyncIterableIterator(["newChatMessage"]);
	}

	@Subscription(() => InventoryAdjustmentEntityWorker, {
		filter: (payload, variables) =>
			payload.inventoryUpdated.storeId === variables.storeId,
	})
	inventoryUpdated(@Args("storeId") _storeId: string) {
		return this.pubSub.asyncIterableIterator(["inventoryUpdated"]);
	}

	@Subscription(() => ShiftEntityWorker, {
		filter: (payload, variables) =>
			payload.shiftStarted.workerId === variables.workerId,
	})
	newShiftStarted(@Args("workerId") _workerId: string) {
		return this.pubSub.asyncIterableIterator(["shiftStarted"]);
	}

	@Subscription(() => ShiftEntityWorker, {
		filter: (payload, variables) =>
			payload.shiftEnded.workerId === variables.workerId,
	})
	shiftEnded(@Args("workerId") _workerId: string) {
		return this.pubSub.asyncIterableIterator(["shiftEnded"]);
	}
}
