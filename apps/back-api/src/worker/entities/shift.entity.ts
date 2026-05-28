import { Field, ObjectType } from "@nestjs/graphql";
import { ShiftStatus } from "../../generated/prisma/enums";
import { StoreEntity } from "../../store/entities/store.entity";
import { WorkerEntity } from "./worker.entity";

@ObjectType()
export class ShiftEntityWorker {
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

    @Field(() => ShiftStatus)
    status: ShiftStatus;

    @Field({ nullable: true })
    sales?: number;

    @Field({ nullable: true })
    transactionCount?: number;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
