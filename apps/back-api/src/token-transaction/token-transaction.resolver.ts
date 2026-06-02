import { Inject, UseGuards } from "@nestjs/common";
import {
    Args,
    Context,
    Int,
    Mutation,
    Query,
    Resolver,
    Subscription,
} from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateTokenTransactionInput } from "./dto/create-token-transaction.input";
import { RedeemTokenTransactionInput } from "./dto/redeem-token-transaction.input";
import { ReleaseTokenTransactionInput } from "./dto/release-token-transaction.input";
import {
    TokenBalanceEntity,
    TokenTransactionEntity,
    TokenTransactionPageEntity,
} from "./entities/token-transaction.entity";
import { TokenTransactionService } from "./token-transaction.service";
// Resolver
@Resolver(() => TokenTransactionEntity)
export class TokenTransactionResolver {
	constructor(
		private readonly tokenTransactionService: TokenTransactionService,
		@Inject("PUB_SUB") private readonly pubSub: PubSub,
	) {}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business")
	@Mutation(() => TokenTransactionEntity, {
		description: "Creates a token transaction.",
	})
	async createTokenTransaction(
		@Args("createTokenTransactionInput")
		createTokenTransactionInput: CreateTokenTransactionInput,
		@Context() context,
	) {
		const user = context.req.user;
		if (user.id !== createTokenTransactionInput.businessId) {
			throw new Error(
				"Businesses can only create token transactions for themselves",
			);
		}
		const created = await this.tokenTransactionService.create(
			createTokenTransactionInput,
		);
		await this.pubSub.publish("TOKEN_TRANSACTION_CREATED", {
			tokenTransactionCreated: created,
		});
		return created;
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business")
	@Mutation(() => TokenTransactionEntity, {
		description: "Redeems a token transaction.",
	})
	async redeemTokenTransaction(
		@Args("redeemTokenTransactionInput")
		redeemTokenTransactionInput: RedeemTokenTransactionInput,
		@Context() context,
	) {
		const user = context.req.user;
		return this.tokenTransactionService.redeem(
			redeemTokenTransactionInput,
			user.id,
		);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business")
	@Mutation(() => TokenTransactionEntity, {
		description: "Releases a token transaction.",
	})
	async releaseTokenTransaction(
		@Args("releaseTokenTransactionInput")
		releaseTokenTransactionInput: ReleaseTokenTransactionInput,
		@Context() context,
	) {
		const user = context.req.user;
		return this.tokenTransactionService.release(
			releaseTokenTransactionInput,
			user.id,
		);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business")
	@Query(() => TokenTransactionPageEntity, {
		name: "tokenTransactions",
		description: "Retrieves token transactions for a business.",
	})
	async getTokenTransactions(
		@Args("businessId", { type: () => String }) businessId: string,
		@Args("type", { type: () => String, nullable: true }) type?: string,
		@Args("isRedeemed", { type: () => Boolean, nullable: true }) isRedeemed?: boolean,
		@Args("isReleased", { type: () => Boolean, nullable: true }) isReleased?: boolean,
		@Args("startDate", { type: () => Date, nullable: true }) startDate?: Date,
		@Args("endDate", { type: () => Date, nullable: true }) endDate?: Date,
		@Args("page", { type: () => Int, nullable: true }) page = 1,
		@Args("limit", { type: () => Int, nullable: true }) limit = 10,
		@Context() context?: any,
	) {
		const user = context.req.user;
		if (user.id !== businessId) {
			throw new Error("Businesses can only query their own token transactions");
		}
		return this.tokenTransactionService.findAll(
			businessId,
			type,
			isRedeemed,
			isReleased,
			startDate,
			endDate,
			page,
			limit,
		);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business")
	@Query(() => TokenBalanceEntity, {
		name: "tokenBalance",
		description: "Retrieves the token balance for a business.",
	})
	async getTokenBalance(
		@Args("businessId", { type: () => String }) businessId: string,
		@Context() context,
	) {
		const user = context.req.user;
		if (user.id !== businessId) {
			throw new Error("Businesses can only query their own token balance");
		}
		return this.tokenTransactionService.getBalance(businessId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business")
	@Subscription(() => TokenTransactionEntity, {
		name: "tokenTransactionCreated",
		filter: (payload, variables) => {
			return payload.tokenTransactionCreated.businessId === variables.businessId;
		},
	})
	tokenTransactionCreated(
		@Args("businessId", { type: () => String }) businessId: string,
	) {
		return (this.pubSub as any).asyncIterator("TOKEN_TRANSACTION_CREATED");
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("business")
	@Query(() => TokenTransactionEntity, {
		name: "tokenTransaction",
		description: "Retrieves a single token transaction by ID.",
	})
	async getTokenTransaction(
		@Args("id", { type: () => String })
		id: string,
		@Context() context,
	) {
		const user = context.req.user;
		return this.tokenTransactionService.findOne(id, user.id);
	}
}
