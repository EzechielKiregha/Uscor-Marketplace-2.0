import { Field, ObjectType } from "@nestjs/graphql";
import { StoreEntity } from "../../store/entities/store.entity";
import { WorkerEntity } from "./worker.entity";

@ObjectType()
export class ShiftEntity {
	@Field()
	id: string;

	@Field()
	workerId: string;

	@Field(() => WorkerEntity, { nullable: true })
	worker?: WorkerEntity;

	@Field()
	storeId: string;

	@Field(() => StoreEntity, { nullable: true })
	store?: StoreEntity;

	@Field()
	startTime: Date;

	@Field({ nullable: true })
	endTime?: Date;

	@Field({ nullable: true })
	sales?: number;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
