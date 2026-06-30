import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { BusinessEntity } from "../../business/entities/business.entity";
import { ProductEntity } from "../../product/entities/product.entity";

@ObjectType()
export class B2BOrderItemEntity {
    @Field() id: string;
    @Field() orderId: string;
    @Field() productId: string;
    @Field(() => Int) quantity: number;
    @Field(() => Float) unitPrice: number;
    @Field(() => Float) totalPrice: number;
    @Field({ nullable: true }) notes?: string;
    @Field() createdAt: Date;

    @Field(() => ProductEntity, { nullable: true }) product?: any;
}

@ObjectType()
export class B2BOrderEntity {
    @Field() id: string;
    @Field() orderNumber: string;
    @Field() buyerId: string;
    @Field() sellerId: string;
    @Field() status: string;
    @Field() paymentTerms: string;
    @Field({ nullable: true }) notes?: string;
    @Field({ nullable: true }) rejectionReason?: string;
    @Field(() => Float) subtotal: number;
    @Field(() => Float) tax: number;
    @Field(() => Float) total: number;
    @Field({ nullable: true }) shippingAddress?: string;
    @Field(() => [B2BOrderItemEntity]) items: B2BOrderItemEntity[];
    @Field() createdAt: Date;
    @Field() updatedAt: Date;
    @Field({ nullable: true }) submittedAt?: Date;
    @Field({ nullable: true }) approvedAt?: Date;
    @Field({ nullable: true }) shippedAt?: Date;
    @Field({ nullable: true }) deliveredAt?: Date;
    @Field({ nullable: true }) cancelledAt?: Date;

    @Field(() => BusinessEntity, { nullable: true }) buyer?: any;
    @Field(() => BusinessEntity, { nullable: true }) seller?: any;
}

@ObjectType()
export class B2BOrderListResponse {
    @Field(() => [B2BOrderEntity]) items: B2BOrderEntity[];
    @Field(() => Int) total: number;
    @Field(() => Int) page: number;
    @Field(() => Int) limit: number;
}
