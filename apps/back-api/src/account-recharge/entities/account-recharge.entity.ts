import { Field, Float, ObjectType } from "@nestjs/graphql";
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

	// New fields to match frontend expectations
	@Field()
	status: string;

	@Field()
	transactionDate: Date;

	@Field({ nullable: true })
	qrCode?: string;

	@Field()
	createdAt: Date;
}
