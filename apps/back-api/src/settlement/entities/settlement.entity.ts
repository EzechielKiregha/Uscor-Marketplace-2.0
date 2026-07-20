import { Field, Float, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SettlementBusinessEntity {
	@Field()
	id: string;

	@Field()
	name: string;

	@Field({ nullable: true })
	avatar?: string;
}

@ObjectType()
export class SettlementEntity {
	@Field()
	id: string;

	@Field()
	orderId: string;

	@Field()
	businessGroupId: string;

	@Field()
	businessId: string;

	@Field(() => SettlementBusinessEntity, { nullable: true })
	business?: SettlementBusinessEntity;

	@Field(() => Float)
	grossAmount: number;

	@Field(() => Float)
	platformFee: number;

	@Field(() => Float)
	deliveryFee: number;

	@Field(() => Float)
	netAmount: number;

	@Field()
	status: string;

	@Field({ nullable: true })
	distributedAt?: Date;

	@Field({ nullable: true })
	distributedBy?: string;

	@Field()
	createdAt: Date;
}

@ObjectType()
export class SettlementStatsEntity {
	@Field(() => Float)
	totalPending: number;

	@Field(() => Float)
	totalDistributed: number;

	@Field(() => Float)
	totalPlatformFees: number;

	@Field(() => Float)
	totalDeliveryFees: number;

	@Field()
	pendingCount: number;

	@Field()
	distributedCount: number;
}

@ObjectType()
export class PaginatedSettlementsEntity {
	@Field(() => [SettlementEntity])
	items: SettlementEntity[];

	@Field()
	total: number;

	@Field()
	page: number;

	@Field()
	limit: number;
}
