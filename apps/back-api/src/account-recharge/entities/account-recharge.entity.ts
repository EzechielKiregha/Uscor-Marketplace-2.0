import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { BusinessEntity } from "../../business/entities/business.entity";
import { ClientEntity } from "../../client/entities/client.entity";
import { TokenTransactionEntity } from "../../token-transaction/entities/token-transaction.entity";
import { Country, RechargeMethod } from "../dto/create-account-recharge.input";

@ObjectType()
export class AccountRechargeEntity {
	@Field()
	id: string;

	@Field(() => Float)
	amount: number;

	@Field(() => RechargeMethod)
	method: RechargeMethod;

	@Field(() => Country)
	origin: Country;

	@Field({ nullable: true })
	businessId?: string;

	@Field(() => BusinessEntity, { nullable: true })
	business?: BusinessEntity;

	@Field({ nullable: true })
	clientId?: string;

	@Field(() => ClientEntity, { nullable: true })
	client?: ClientEntity;

	@Field({ nullable: true })
	tokenTransactionId?: string;

	@Field(() => TokenTransactionEntity, {
		nullable: true,
	})
	tokenTransaction?: TokenTransactionEntity;

	@Field()
	status: string;

	@Field()
	transactionDate: Date;

	@Field({ nullable: true })
	qrCode?: string;

	@Field()
	createdAt: Date;
}


@ObjectType()
export class TokensBalanceEntity {
	@Field(() => Float)
	totalTokens: number;

	@Field(() => Float)
	availableTokens: number;

	@Field(() => Float)
	pendingTokens: number;
}


@ObjectType()
export class AccountBalanceEntity {
	@Field(() => Float)
	totalAmount: number;

	@Field(() => Float)
	availableAmount: number;

	@Field(() => Float)
	pendingAmount: number;

	@Field(() => Float)
	reservedAmount: number;

	@Field(() => [AccountRechargeEntity])
	transactions: AccountRechargeEntity[];

    @Field(()=> TokensBalanceEntity, {nullable : true})
    tokenBalance?: TokensBalanceEntity
}

@ObjectType()
export class AccountRechargePageEntity {
	@Field(() => [AccountRechargeEntity])
	items: AccountRechargeEntity[];

	@Field(() => Int)
	total: number;

	@Field(() => Int)
	page: number;

	@Field(() => Int)
	limit: number;
}
