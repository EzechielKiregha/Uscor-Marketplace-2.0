import { Field, ObjectType } from "@nestjs/graphql";
import { KycStatus } from "../../business/dto/update-business.input";
import { BusinessEntity } from "../../business/entities/business.entity";

@ObjectType()
export class KycSubmission {
	@Field()
	id: string;

	@Field()
	businessId: string;

	@Field()
	documentType: string;

	@Field()
	documentUrl: string;

	@Field(() => KycStatus)
	status: KycStatus;

	@Field({ nullable: true })
	rejectionReason?: string;

	@Field({ nullable: true })
	notes?: string;

	@Field()
	submittedAt: Date;

	@Field({ nullable: true })
	verifiedAt?: Date;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field(() => BusinessEntity)
	business: BusinessEntity;
}

@ObjectType()
export class KycSubmissionPagination {
	@Field(() => [KycSubmission])
	items: KycSubmission[];

	@Field()
	total: number;

	@Field()
	page: number;

	@Field()
	limit: number;
}
