import { Inject, UseGuards } from "@nestjs/common";
import {
    Args,
    Context,
    Int,
    Mutation,
    Query,
    Resolver,
    Subscription
} from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AccountRechargeService } from "./account-recharge.service";
import { CreateAccountRechargeInput } from "./dto/create-account-recharge.input";
import { UpdateAccountRechargeInput } from "./dto/update-account-recharge.input";
import {
    AccountBalanceEntity,
    AccountRechargeEntity,
    AccountRechargePageEntity,
} from "./entities/account-recharge.entity";

// Resolver
@Resolver(() => AccountRechargeEntity)
export class AccountRechargeResolver {
	constructor(
		private readonly accountRechargeService: AccountRechargeService,
		@Inject("PUB_SUB") private readonly pubSub: PubSub,
	) {}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business", "client")
	@Mutation(() => AccountRechargeEntity, {
		description: "Creates an account recharge.",
	})
	async createAccountRecharge(
		@Args("createAccountRechargeInput")
		createAccountRechargeInput: CreateAccountRechargeInput,
		@Context() context,
	) {
		const user = context.req.user;
		const created = await this.accountRechargeService.create(
			createAccountRechargeInput,
			user.id,
			user.role,
		);

		await this.pubSub.publish("ACCOUNT_RECHARGE_CREATED", {
			accountRechargeCreated: created,
		});

		const balance = await this.accountRechargeService.getBalance(
			user.id,
			user.role,
		);
		await this.pubSub.publish("ACCOUNT_BALANCE_UPDATED", {
			userId: user.id,
			accountBalanceUpdated: balance,
		});

		return created;
	}

	@Mutation(() => AccountRechargeEntity, {
		name: "createAccountRechargeFromUSSD",
		description: "Creates an account recharge from USSD without authentication.",
	})
	async createAccountRechargeFromUSSD(
		@Args("input")
		input: CreateAccountRechargeInput,
	) {
		const created = await this.accountRechargeService.createFromUSSD(
			input,
		);

		// Still publish events for real-time updates
		const userIdentifier = created.clientId || created.businessId;
		const userType = created.clientId ? "client" : "business";

		await this.pubSub.publish("ACCOUNT_RECHARGE_CREATED", {
			accountRechargeCreated: created,
		});

		const balance = await this.accountRechargeService.getBalance(
			userIdentifier!,
			userType,
		);
		await this.pubSub.publish("ACCOUNT_BALANCE_UPDATED", {
			userId: userIdentifier,
			accountBalanceUpdated: balance,
		});

		return created;
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business", "client")
	@Query(() => AccountRechargePageEntity, {
		name: "accountRecharges",
		description: "Retrieves account recharges for a user.",
	})
	async getAccountRecharges(
		@Args("userId", { type: () => String }) userId: string,
		@Args("userType", { type: () => String }) userType: string,
		@Args("method", { type: () => String, nullable: true }) method?: string,
		@Args("status", { type: () => String, nullable: true }) status?: string,
		@Args("origin", { type: () => String, nullable: true }) origin?: string,
		@Args("startDate", { type: () => Date, nullable: true }) startDate?: Date,
		@Args("endDate", { type: () => Date, nullable: true }) endDate?: Date,
		@Args("page", { type: () => Int, nullable: true }) page = 1,
		@Args("limit", { type: () => Int, nullable: true }) limit = 10,
		@Context() context?: any,
	) {
		const user = context.req.user;
		const normalizedType = userType?.toLowerCase();
		if (user.id !== userId || user.role !== normalizedType) {
			throw new Error("Unauthorized access to account recharge history");
		}
		return this.accountRechargeService.findAll(
			user.id,
			user.role,
			method as any,
			status,
			origin,
			startDate,
			endDate,
			page,
			limit,
		);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business", "client")
	@Query(() => AccountRechargeEntity, {
		name: "accountRecharge",
		description: "Retrieves a single account recharge by ID.",
	})
	async getAccountRecharge(
		@Args("id", { type: () => String })
		id: string,
	) {
		return this.accountRechargeService.findOne(id);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business", "client")
	@Mutation(() => AccountRechargeEntity, {
		description: "Updates an account recharge.",
	})
	async updateAccountRecharge(
		@Args("id", { type: () => String })
		id: string,
		@Args("updateAccountRechargeInput")
		updateAccountRechargeInput: UpdateAccountRechargeInput,
		@Context() context,
	) {
		const user = context.req.user;
		const updated = await this.accountRechargeService.update(
			id,
			updateAccountRechargeInput,
			user.id,
			user.role,
		);

		const balance = await this.accountRechargeService.getBalance(
			user.id,
			user.role,
		);
		await this.pubSub.publish("ACCOUNT_BALANCE_UPDATED", {
			userId: user.id,
			accountBalanceUpdated: balance,
		});

		return updated;
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business", "client")
	@Mutation(() => AccountRechargeEntity, {
		description: "Deletes an account recharge.",
	})
	async deleteAccountRecharge(
		@Args("id", { type: () => String })
		id: string,
		@Context() context,
	) {
		const user = context.req.user;
		const deleted = await this.accountRechargeService.remove(
			id,
			user.id,
			user.role,
		);

		const balance = await this.accountRechargeService.getBalance(
			user.id,
			user.role,
		);
		await this.pubSub.publish("ACCOUNT_BALANCE_UPDATED", {
			userId: user.id,
			accountBalanceUpdated: balance,
		});

		return deleted;
	}

	// @UseGuards(JwtAuthGuard, RolesGuard)
	// @Roles("business", "client")
	@Query(() => AccountBalanceEntity, {
		name: "accountBalance",
		description: "Retrieves the account balance for a user.",
	})
	async getAccountBalance(
		@Args("userId", { type: () => String }) userId: string,
		@Args("userType", { type: () => String }) userType: string,
		@Context() context,
	) {
		// const user = context.req.user;
		const normalizedType = userType?.toLowerCase();
		// if (user.id !== userId || user.role !== normalizedType) {
		// 	throw new Error("Unauthorized access to account balance");
		// }
		if (normalizedType === "business" ) {
			return this.accountRechargeService.getBalance(userId, normalizedType);
		} else if (normalizedType === "client") {
			return this.accountRechargeService.getBalance(userId, normalizedType);
		} else {
			throw new Error("Invalid user type");
		}
	}

	@Subscription(() => AccountRechargeEntity, {
		name: "accountRechargeCreated",
		filter: (payload, variables) => {
			const role = variables.userType?.toLowerCase();
			if (role === "business") {
				return payload.accountRechargeCreated.businessId === variables.userId;
			}
			if (role === "client") {
				return payload.accountRechargeCreated.clientId === variables.userId;
			}
			return false;
		},
	})
	accountRechargeCreated(
		@Args("userId", { type: () => String }) userId: string,
		@Args("userType", { type: () => String }) userType: string,
	) {
		return (this.pubSub as any).asyncIterator("ACCOUNT_RECHARGE_CREATED");
	}

	@Subscription(() => AccountBalanceEntity, {
		name: "accountBalanceUpdated",
		filter: (payload, variables) => {
			const role = variables.userType?.toLowerCase();
			return payload.accountBalanceUpdated && payload.userId === variables.userId;
		},
	})
	accountBalanceUpdated(
		@Args("userId", { type: () => String }) userId: string,
		@Args("userType", { type: () => String }) userType: string,
	) {
		return (this.pubSub as any).asyncIterator("ACCOUNT_BALANCE_UPDATED");
	}
}
