import { Field, ObjectType } from "@nestjs/graphql";
import { BusinessEntity } from "../../business/entities/business.entity";
import { ClientEntity } from "../../client/entities/client.entity";
import { ChatMessageEntityV2 } from "./chat-message.entity";

@ObjectType()
export class ChatEntityWorker {
	@Field()
	id: string;

	@Field()
	status: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field(() => [ChatMessageEntityV2], {
		nullable: true,
	})
	messages?: ChatMessageEntityV2[];

	@Field(() => BusinessEntity, { nullable: true })
	business?: BusinessEntity;

	@Field(() => ClientEntity, { nullable: true })
	client?: ClientEntity;
}
