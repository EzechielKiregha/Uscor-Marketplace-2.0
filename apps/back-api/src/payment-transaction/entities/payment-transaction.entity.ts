import { Field, Float, ObjectType } from "@nestjs/graphql";
import { OrderEntity } from "../../order/entities/order.entity";

@ObjectType()
export class PostTransactionEntity {
    @Field()
    id: string;

    @Field(() => Float)
    amount: number;

    @Field()
    status: string;

    @Field()
    createdAt: Date;
}

@ObjectType()
export class PaymentTransactionEntity {
    @Field()
    id: string;

    @Field(() => Float)
    amount: number;

    @Field(() => String) // ← explicit enum
    method: string;

    @Field(() => String) // ← explicit enum
    status: string;

    @Field()
    transactionDate: Date;

    @Field(() => String,{ nullable: true })
    qrCode?: string | null;

    @Field()
    createdAt: Date;

    @Field(() => OrderEntity, { nullable: true })
    order?: OrderEntity;

    @Field(() => [PostTransactionEntity], { nullable: true })
    postTransaction?: PostTransactionEntity[];
}
