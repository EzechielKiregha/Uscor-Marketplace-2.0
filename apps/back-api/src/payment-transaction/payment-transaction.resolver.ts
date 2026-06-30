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
	@Mutation(() => PaymentTransactionEntity, {
		description: "Creates a new payment transaction.",
        nullable: true
	})
	async createPaymentTransactionForAccountRecharge(
		@Args("input")
		input: CreatePaymentTransactionInput,
		@Context() context,
	) {
		const user = context.req.user;
		return this.paymentTransactionService.createRechargePayment(
			input,
            user
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
		nullable: true,
	})
	async getLatestPaymentTransaction(
        @Args("phone",{type: () => String}) phone: string,
        @Args("status",{type: () => String, nullable: true}) status?: string
    ) {
		return this.paymentTransactionService.findLatest(phone, status);
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
    
	@Mutation(() => PaymentTransactionEntity, {
		description: "Updates a payment transaction’s status or QR code.",
        nullable: true
	})
	async cancelPaymentTransaction(
		@Context() context,
		@Args("id", { type: () => String })
		id: string,
	) {
		// const user = context.req.user;
		return this.paymentTransactionService.cancelPaymentTransaction(id);
	}
    
	@Query(() => PaymentTransactionEntity, {
		description: "check a payment transaction’s status or QR code.",
	})
	async checkPaymentTransactionStatus(
		@Context() context,
		@Args("id", { type: () => String })
		id: string,
	) {
		// const user = context.req.user;
		return this.paymentTransactionService.checkPaymentTransactionStatus(id);
	}
	@Mutation(() => PaymentTransactionEntity, {
		description: "Updates a payment transaction’s status or QR code.",
        nullable: true
	})
	async updatePaymentTransactionForAccountRecharge(
		@Context() context,
		@Args("input")
		input: UpdatePaymentTransactionInput,
		@Args("id", { type: () => String })
		id: string,
		@Args("phone", { type: () => String, nullable: true }) phone?: string,
	) {
		// const user = context.req.user;
		try {
			return await this.paymentTransactionService.updateRechargePayment(
				input,
				id,
				phone,
			);
		} catch (err: any) {
			console.error('Error in updatePaymentTransactionForAccountRecharge:', {
				error: err?.message ?? err,
				id,
				phone,
				stack: err?.stack,
			});
			throw err;
		}
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

