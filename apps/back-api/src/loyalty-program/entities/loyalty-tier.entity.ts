import { Field, Float, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class LoyaltyTierBenefitEntity {
	@Field()
	id: string;

	@Field()
	description: string;
}

@ObjectType()
export class LoyaltyTierEntity {
	@Field()
	id: string;

	@Field()
	name: string;

	@Field(() => Float)
	minPoints: number;

	@Field(() => [LoyaltyTierBenefitEntity], { nullable: true })
	benefits?: LoyaltyTierBenefitEntity[];
}
