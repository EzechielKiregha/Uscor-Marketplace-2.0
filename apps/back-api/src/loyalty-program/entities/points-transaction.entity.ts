import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { ClientEntity } from "../../client/entities/client.entity";
import { LoyaltyProgramEntity } from "./loyalty-program.entity";

@ObjectType()
export class PointsTransactionEntity {
	@Field()
	id: string;

	@Field()
	clientId: string;

	@Field(() => ClientEntity)
	client: ClientEntity;

	@Field()
	loyaltyProgramId: string;

	@Field(() => LoyaltyProgramEntity)
	loyaltyProgram: LoyaltyProgramEntity;

	@Field(() => Float)
	points: number;

	@Field()
	type: string;

	@Field()
	createdAt: Date;
}

@ObjectType()
export class PointsTransactionsConnectionEntity {
	@Field(() => [PointsTransactionEntity])
	items: PointsTransactionEntity[];

	@Field(() => Int)
	total: number;

	@Field(() => Int)
	page: number;

	@Field(() => Int)
	limit: number;
}
