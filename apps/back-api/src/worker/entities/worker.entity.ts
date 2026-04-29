import { Field, ObjectType } from "@nestjs/graphql";
import { AuditLogEntity } from "../../audit/entities/audit-log.entity";
import { BusinessEntity } from "../../business/entities/business.entity";
import { WorkerServiceAssignmentEntity } from "../../freelance-service/entities/freelance-service.entity";
import { KnowYourCustomerEntity } from "../../know-your-customer/entities/know-your-customer.entity";
import { MediaEntity } from "../../media/entities/media.entity";
import { ChatEntity } from "./chat.entity";
import { SaleEntity } from "./sale.entity";
import { ShiftEntity } from "./shift.entity";

@ObjectType()
export class WorkerEntity {
	@Field({ nullable: true })
	id?: string;

	@Field({ nullable: true })
	email?: string;

	@Field({ nullable: true })
	fullName?: string;

	@Field({ nullable: true })
	avatar?: string;

	@Field({ nullable: true })
	phone?: string;

	@Field({ nullable: true })
	role?: string;

	@Field({ nullable: true })
	isVerified?: boolean;

	@Field({ nullable: true })
	lastLogin?: Date;

	@Field({ nullable: true })
	createdAt?: Date;

	@Field({ nullable: true })
	updatedAt?: Date;

	@Field(() => BusinessEntity, { nullable: true })
	business?: BusinessEntity;

	@Field(() => KnowYourCustomerEntity, {
		nullable: true,
	})
	kyc?: KnowYourCustomerEntity;

	@Field(() => [SaleEntity], { nullable: true })
	sales?: SaleEntity[];

	@Field(() => [ShiftEntity], { nullable: true })
	shifts?: ShiftEntity[];

	@Field(() => [WorkerServiceAssignmentEntity], {
		nullable: true,
	})
	workerServiceAssignments?: WorkerServiceAssignmentEntity[];

	@Field(() => [ChatEntity], { nullable: true })
	chats?: ChatEntity[];

	@Field(() => [MediaEntity], { nullable: true })
	medias?: MediaEntity[];

	@Field(() => [AuditLogEntity], {
		nullable: true,
	})
	auditLogs?: AuditLogEntity[];
}
