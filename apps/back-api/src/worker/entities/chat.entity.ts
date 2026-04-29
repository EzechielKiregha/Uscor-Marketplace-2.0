import { Field, ObjectType } from "@nestjs/graphql";
import { BusinessEntity } from "../../business/entities/business.entity";
import { ClientEntity } from "../../client/entities/client.entity";
import { ChatMessageEntity } from "./chat-message.entity";

@ObjectType()
export class ChatEntity {
	@Field()
	id: string;

	@Field()
	status: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field(() => [ChatMessageEntity], {
		nullable: true,
	})
	messages?: ChatMessageEntity[];

	@Field(() => BusinessEntity, { nullable: true })
	business?: BusinessEntity;

	@Field(() => ClientEntity, { nullable: true })
	client?: ClientEntity;
}
