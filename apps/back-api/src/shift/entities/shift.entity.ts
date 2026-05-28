import { Field, Float, ObjectType, registerEnumType } from "@nestjs/graphql";
import { ShiftStatus } from "../../generated/prisma/enums";
import { StoreEntity } from "../../store/entities/store.entity";
import { WorkerEntity } from "../../worker/entities/worker.entity";

registerEnumType(ShiftStatus, {
    name: "ShiftStatus",
});

@ObjectType()
export class ShiftEntity {
    @Field({ nullable: true })
    id?: string;

    @Field({ nullable: true })
    workerId?: string;

    @Field(() => WorkerEntity, { nullable: true })
    worker?: WorkerEntity;

    @Field({ nullable: true })
    storeId?: string;

    @Field(() => StoreEntity, { nullable: true })
    store?: StoreEntity;

    @Field({ nullable: true })
    startTime?: Date;

    @Field({ nullable: true })
    endTime?: Date;

    @Field(() => ShiftStatus)
    status: ShiftStatus;

    @Field(() => Float, { nullable: true })
    sales?: number;

    @Field({ nullable: true })
    createdAt?: Date;

    @Field({ nullable: true })
    updatedAt?: Date;
}
