import { Field, Float, ObjectType } from "@nestjs/graphql";
import { BusinessEntity } from "../../business/entities/business.entity";
import { ReOwnedProductEntity } from "../../re-owned-product/entities/re-owned-product.entity";
import { RepostedProductEntity } from "../../reposted-product/entities/reposted-product.entity";
import { TokenTransactionType } from "../dto/create-token-transaction.input";

@ObjectType()
export class TokenTransactionEntity {
	@Field()
	id: string;

	@Field()
	businessId: string;

	@Field(() => BusinessEntity)
	business: BusinessEntity;

	@Field({ nullable: true })
	reOwnedProductId?: string;

	@Field(() => ReOwnedProductEntity, {
		nullable: true,
	})
	reOwnedProduct?: ReOwnedProductEntity;

	@Field({ nullable: true })
	repostedProductId?: string;

	@Field(() => RepostedProductEntity, {
		nullable: true,
	})
	repostedProduct?: RepostedProductEntity;

	@Field(() => Float)
	amount: number;

	@Field(() => TokenTransactionType)
	type: TokenTransactionType;

	@Field()
	isRedeemed: boolean;

	@Field()
	isReleased: boolean;

	@Field()
	createdAt: Date;
}
