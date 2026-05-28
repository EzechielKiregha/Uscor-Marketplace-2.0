import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreatePaymentTransactionInput } from "./dto/create-payment-transaction.input";
import { UpdatePaymentTransactionInput } from "./dto/update-payment-transaction.input";
import { PaymentTransactionEntity } from "./entities/payment-transaction.entity";
import { PaymentTransactionService } from "./payment-transaction.service";

// Resolver
@Resolver(() => PaymentTransactionEntity)
export class PaymentTransactionResolver {
	constructor(
		private readonly paymentTransactionService: PaymentTransactionService,
	) {}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business")
	@Mutation(() => PaymentTransactionEntity, {
		description: "Creates a new payment transaction.",
	})
	async createPaymentTransaction(
		@Args("createPaymentTransactionInput")
		createPaymentTransactionInput: CreatePaymentTransactionInput,
		@Context() context,
	) {
		const user = context.req.user;
		return this.paymentTransactionService.create(
			createPaymentTransactionInput,
			user.id,
		);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business")
	@Query(() => [PaymentTransactionEntity], {
		name: "paymentTransactions",
		description: "Retrieves payment transactions based on user role.",
	})
	async getPaymentTransactions(@Context() context) {
		const user = context.req.user;
		return this.paymentTransactionService.findAllByUser(user.id, user.role);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business")
	@Query(() => PaymentTransactionEntity, {
		name: "paymentTransaction",
		description: "Retrieves a single payment transaction by ID.",
	})
	async getPaymentTransaction(
		@Args("id", { type: () => String })
		id: string,
		@Context() context,
	) {
		const user = context.req.user;
		return this.paymentTransactionService.findOneByUser(id, user.id, user.role);
	}

	// @UseGuards(JwtAuthGuard, RolesGuard)
	// @Roles("client", "business")
	@Query(() => PaymentTransactionEntity, {
		name: "latestPaymentTransaction",
		description: "Retrieves the latest pending payment transaction for the user.",
		nullable: true,
	})
	async getLatestPaymentTransaction(@Context() context, @Args("phone",) phone: string) {
		// const user = context.req.user;
		return this.paymentTransactionService.findLatest(phone);
	}

	// @UseGuards(JwtAuthGuard, RolesGuard)
	// @Roles("client", "business")
	@Mutation(() => PaymentTransactionEntity, {
		description: "Updates a payment transaction’s status or QR code.",
	})
	async updatePaymentTransaction(
		@Context() context,
		@Args("input")
		input: UpdatePaymentTransactionInput,
		@Args("id", { type: () => String })
		id: string,
		@Args("phone", { type: () => String, nullable: true }) phone?: string,
	) {
		// const user = context.req.user;
		return this.paymentTransactionService.update(input, id, phone);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business")
	@Mutation(() => PaymentTransactionEntity, {
		description: "Deletes a payment transaction.",
	})
	async deletePaymentTransaction(
		@Args("id", { type: () => String })
		id: string,
		@Context() context,
	) {
		const user = context.req.user;
		return this.paymentTransactionService.removeByUser(id, user.id);
	}
}

