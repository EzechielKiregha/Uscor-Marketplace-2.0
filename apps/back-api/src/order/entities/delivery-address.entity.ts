import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DeliveryAddressEntity {
	@Field({ nullable: true })
	createdAt?: Date;
	@Field({ nullable: true })
	id?: string;
	@Field({ nullable: true })
	clientId?: string;
	@Field({ nullable: true })
	updatedAt?: Date;
	@Field({ nullable: true })
	street?: string;
	@Field({ nullable: true })
	city?: string;
	@Field({ nullable: true })
	country?: string;
	@Field({ nullable: true })
	postalCode?: string;
	@Field({ nullable: true })
	isDefault?: boolean;
}
