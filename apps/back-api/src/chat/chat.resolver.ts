import { UseGuards } from "@nestjs/common";
import {
	Args,
	Context,
	Int,
	Mutation,
	Query,
	Resolver,
	Subscription,
} from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ChatMessageEntity } from "../chat/entities/chat-nessage.entity";
import { ChatService } from "./chat.service";
import {
	MarkAsReadResponse,
	PaginatedChatsResponse,
	PaginatedMessagesResponse,
	UnreadCountResponse,
} from "./dto/chat-response.dto";
import {
	CreateChatInput,
	CreateChatMessageInput,
	SendMessageInput,
	StartNegotiationInput,
} from "./dto/create-chat.input";
import { UpdateChatInput } from "./dto/update-chat.input";
import { ChatEntity, chatNotification } from "./entities/chat.entity";
import { PusherService } from "./pusher.service";

// Resolver
@Resolver(() => ChatEntity)
export class ChatResolver {
	private pubSub = new PubSub();

	constructor(
		private readonly chatService: ChatService,
		private readonly pusherService: PusherService,
	) {}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Mutation(() => ChatEntity, {
		description: "Creates a new chat with dynamic participants.",
	})
	async createChat(
		@Args("createChatInput")
		createChatInput: CreateChatInput,
		@Context() context,
	) {
		const user = context.req.user;
		if (!createChatInput.participantIds.includes(user.id)) {
			throw new Error("Users must include themselves as a participant");
		}
		return this.chatService.create(createChatInput);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Mutation(() => ChatMessageEntity, {
		description: "Sends a message in a chat.",
	})
	async createChatMessage(
		@Args("createChatMessageInput")
		createChatMessageInput: CreateChatMessageInput,
		@Context() context,
	) {
		const user = context.req.user;
		return this.chatService.createMessage(
			createChatMessageInput,
			user.id,
			user.role,
		);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Query(() => PaginatedChatsResponse, {
		name: "chats",
		description: "Retrieves chats for the user with pagination.",
	})
	async getChats(
		@Args("productId", {
			type: () => String,
			nullable: true,
		})
		productId?: string,
		@Args("clientId", {
			type: () => String,
			nullable: true,
		})
		clientId?: string,
		@Args("businessId", {
			type: () => String,
			nullable: true,
		})
		businessId?: string,
		@Args("workerId", {
			type: () => String,
			nullable: true,
		})
		workerId?: string,
		@Args("status", {
			type: () => String,
			nullable: true,
		})
		status?: string,
		@Args("search", {
			type: () => String,
			nullable: true,
		})
		search?: string,
		@Args("page", {
			type: () => Number,
			defaultValue: 1,
		})
		page: number = 1,
		@Args("limit", {
			type: () => Number,
			defaultValue: 20,
		})
		limit: number = 20,
		@Context() _context?: any,
	) {
		return this.chatService.findChatsWithPagination(
			productId,
			clientId,
			businessId,
			workerId,
			status,
			search,
			page,
			limit,
		);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Query(() => ChatEntity, {
		name: "chat",
		description: "Retrieves a single chat by ID.",
	})
	async getChat(
		@Args("id", { type: () => String })
		id: string,
		@Context() context,
	) {
		const user = context.req.user;
		return this.chatService.findOne(id, user.id, user.role);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Mutation(() => ChatEntity, {
		description: "Updates a chat’s status or properties.",
	})
	async updateChat(
		@Args("id", { type: () => String })
		id: string,
		@Args("updateChatInput")
		updateChatInput: UpdateChatInput,
		@Context() context,
	) {
		const user = context.req.user;
		return this.chatService.update(id, updateChatInput, user.id, user.role);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Mutation(() => ChatEntity, {
		description: "Deletes a chat.",
	})
	async deleteChat(
		@Args("id", { type: () => String })
		id: string,
		@Context() context,
	) {
		const user = context.req.user;
		return this.chatService.remove(id, user.id, user.role);
	}

	// New resolvers to match frontend expectations
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Mutation(() => ChatMessageEntity, {
		description: "Sends a message in a chat.",
	})
	async sendMessage(
		@Args("input") input: SendMessageInput,
		@Context() context,
	) {
		const user = context.req.user;
		console.log("[Chat Resolver] sendMessage called:", {
			chatId: input.chatId,
			userId: user.id,
			userRole: user.role,
		});

		const message = await this.chatService.sendMessage(input, user.id);
		console.log("[Chat Resolver] Message saved to DB:", {
			messageId: message.id,
			chatId: input.chatId,
		});

		// Publish via GraphQL subscriptions (for connected WebSocket clients)
		console.log("[Chat Resolver] Publishing GraphQL PubSub event for chat:", message);
		this.pubSub.publish("messageReceived", {
			messageReceived: message,
			chatId: input.chatId,
		});
		console.log("[Chat Resolver] ✓ GraphQL PubSub published");

		// Trigger Pusher event (for scalability and cross-connection reliability)
		// const pusherPayload = {
		// 	id: message.id,
		// 	chatId: input.chatId,
		// 	message: message.content,
		// 	content: message.content,
		// 	senderId: message.senderId,
		// 	createdAt: message.createdAt,
		// 	senderType: this.determineSenderType(user.role),
		// 	sender: message.sender
		// 		? {
		// 			id: message.sender.id,
		// 			fullName: message.sender.fullName,
		// 			avatar: message.sender.avatar,
		// 		}
		// 		: null,
		// };

		// console.log("[Chat Resolver] Triggering Pusher event:", {
		// 	channel: `chat-${input.chatId}`,
		// 	event: "message",
		// 	payload: pusherPayload,
		// });

		// try {
		// 	await this.pusherService.trigger(`chat-${input.chatId}`, "message", pusherPayload);
		// 	console.log("[Chat Resolver] ✓ Pusher event triggered successfully");
		// } catch (error) {
		// 	console.error("[Chat Resolver] ✗ Pusher trigger failed:", error);
		// }

		return message;
	}

	/**
	 * Helper to determine sender type from user role
	 */
	private determineSenderType(role: string): string {
		const roleMap = {
			client: "CLIENT",
			business: "BUSINESS",
			worker: "WORKER",
			admin: "ADMIN",
		};
		return roleMap[role] || role.toUpperCase();
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Query(() => PaginatedMessagesResponse, {
		name: "chatMessages",
		description: "Retrieves messages for a chat.",
	})
	async getChatMessages(
		@Args("chatId", { type: () => String })
		chatId: string,
		@Args("after", {
			type: () => String,
			nullable: true,
		})
		after?: string,
		@Args("before", {
			type: () => String,
			nullable: true,
		})
		before?: string,
		@Args("limit", {
			type: () => Int,
			defaultValue: 20,
		})
		limit: number = 20,
	) {
		return this.chatService.getChatMessages(chatId, after, before, limit);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Query(() => UnreadCountResponse, {
		name: "unreadChatCount",
		description: "Gets unread message count for user.",
	})
	async getUnreadCount(
		@Args("userId", { type: () => String })
		userId: string,
	) {
		return this.chatService.getUnreadCount(userId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Mutation(() => MarkAsReadResponse, {
		description: "Marks messages as read.",
	})
	async markMessagesAsRead(
		@Args("chatId", { type: () => String })
		chatId: string,
		@Args("userId", { type: () => String })
		userId: string,
	) {
		return this.chatService.markMessagesAsRead(chatId, userId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Mutation(() => ChatEntity, {
		description: "Updates chat status.",
	})
	async updateChatStatus(
		@Args("id", { type: () => String })
		id: string,
		@Args("status", { type: () => String })
		status: string,
	) {
		const updatedChat = await this.chatService.updateChatStatus(id, status);

		// Publish status update to subscribers
		this.pubSub.publish("chatStatusUpdated", {
			chatStatusUpdated: updatedChat,
		});

		return updatedChat;
	}

	// Subscriptions
	@Subscription(() => ChatMessageEntity, {
		filter: (payload, variables) => {
			const result = payload?.chatId === variables.chatId;
			console.log("[Chat Resolver] subscription filter messageReceived:", {
				payload,
				variables,
				result,
			});
			return result;
		},
		resolve: (payload) => {
			console.log("[Chat Resolver] subscription resolve messageReceived payload:", payload);
			return payload?.messageReceived;
		},
	})
	messageReceived(
		@Args("chatId", { type: () => String })
		_chatId: string,
	) {
		return this.pubSub.asyncIterableIterator("messageReceived");
	}

	@Subscription(() => ChatEntity)
	chatCreated(
		@Args("userId", { type: () => String })
		_userId: string,
	) {
		return this.pubSub.asyncIterableIterator("chatCreated");
	}

	@Subscription(() => ChatEntity)
	chatStatusUpdated(
		@Args("userId", { type: () => String })
		_userId: string,
	) {
		return this.pubSub.asyncIterableIterator("chatStatusUpdated");
	}

	// Additional resolvers to match frontend expectations
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Query(() => [ChatEntity], {
		name: "chatsByParticipant",
		description: "Gets chats by participant ID.",
	})
	async getChatsByParticipant(
		@Args("participantId", { type: () => String })
		participantId: string,
	) {
		return this.chatService.getChatsByParticipant(participantId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Query(() => [chatNotification], {
		name: "chatNotifications",
		description: "Gets chat notifications for user.",
	})
	async getChatNotifications(
		@Args("userId", { type: () => String })
		userId: string,
	) {
		return this.chatService.getChatNotifications(userId);
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Mutation(() => ChatEntity, {
		description: "Starts a negotiation chat.",
	})
	async startNegotiation(
		@Args("input") input: StartNegotiationInput,
		@Context() context,
	) {
		const user = context.req.user;
		if (!input.participantIds.includes(user.id)) {
			throw new Error("Users must include themselves as a participant");
		}

		const chat = await this.chatService.startNegotiation(input);

		// Publish to subscribers
		this.pubSub.publish("chatCreated", {
			chatCreated: chat,
		});

		return chat;
	}

	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("client", "business", "worker")
	@Mutation(() => ChatEntity, {
		description: "Accepts a negotiation.",
	})
	async acceptNegotiation(
		@Args("negotiationId", { type: () => String })
		negotiationId: string,
		@Context() _context,
	) {
		const updatedChat = await this.chatService.acceptNegotiation(negotiationId);

		// Publish status update to subscribers
		this.pubSub.publish("chatStatusUpdated", {
			chatStatusUpdated: updatedChat,
		});

		return updatedChat;
	}
}
