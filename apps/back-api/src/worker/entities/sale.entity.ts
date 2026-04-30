import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { ClientEntity } from "../../client/entities/client.entity";
import { StoreEntity } from "../../store/entities/store.entity";
import { SaleProductEntityWorker } from "./sale-product.entity";
import { WorkerEntity } from "./worker.entity";
import { PaymentMethod } from "../../payment-transaction/dto/create-payment-transaction.input";
import { SaleStatus } from "../../generated/prisma/enums";

registerEnumType(SaleStatus, {
	name: "SaleStatus",
});

@ObjectType()
export class SaleEntityWorker {
	@Field()
	id: string;

	@Field()
	storeId: string;

	@Field(() => StoreEntity, { nullable: true })
	store?: StoreEntity;

	@Field({ nullable: true })
	workerId?: string;

	@Field(() => WorkerEntity, { nullable: true })
	worker?: WorkerEntity;

	@Field({ nullable: true })
	clientId?: string;

	@Field(() => ClientEntity, { nullable: true })
	client?: ClientEntity;

	@Field()
	totalAmount: number;

	@Field({ nullable: true })
	discount?: number;

	@Field(() => PaymentMethod, { nullable: true })
	paymentMethod?: PaymentMethod;

	@Field(() => SaleStatus)
	status: SaleStatus;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field(() => [SaleProductEntityWorker], {
		nullable: true,
	})
	saleProducts?: SaleProductEntityWorker[];

	@Field(() => [SaleReturnEntity], {
		nullable: true,
	})
	returns?: SaleReturnEntity[];
}

@ObjectType()
export class SaleReturnEntity {
	@Field()
	id: string;

	@Field()
	saleId: string;

	@Field()
	reason: string;

	@Field()
	status: string;

	@Field()
	createdAt: Date;
}
