import { Resolver, Query, Mutation, Args, Int, Context, Subscription } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { ChatEntity, chatNotification } from './entities/chat.entity';
import { CreateChatInput, CreateChatMessageInput, SendMessageInput, StartNegotiationInput } from './dto/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ChatMessageEntity } from '../chat/entities/chat-nessage.entity';
import { PaginatedChatsResponse, PaginatedMessagesResponse, UnreadCountResponse, MarkAsReadResponse } from './dto/chat-response.dto';
import { PubSub } from 'graphql-subscriptions';

// Resolver
@Resolver(() => ChatEntity)
export class ChatResolver {
  private pubSub = new PubSub();
  
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Mutation(() => ChatEntity, { description: 'Creates a new chat with dynamic participants.' })
  async createChat(
    @Args('createChatInput') createChatInput: CreateChatInput,
    @Context() context,
  ) {
    const user = context.req.user;
    if (!createChatInput.participantIds.includes(user.id)) {
      throw new Error('Users must include themselves as a participant');
    }
    return this.chatService.create(createChatInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Mutation(() => ChatMessageEntity, { description: 'Sends a message in a chat.' })
  async createChatMessage(
    @Args('createChatMessageInput') createChatMessageInput: CreateChatMessageInput,
    @Context() context,
  ) {
    const user = context.req.user;
    return this.chatService.createMessage(createChatMessageInput, user.id, user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Query(() => PaginatedChatsResponse, { name: 'chats', description: 'Retrieves chats for the user with pagination.' })
  async getChats(
    @Args('productId', { type: () => String, nullable: true }) productId?: string,
    @Args('clientId', { type: () => String, nullable: true }) clientId?: string,
    @Args('businessId', { type: () => String, nullable: true }) businessId?: string,
    @Args('workerId', { type: () => String, nullable: true }) workerId?: string,
    @Args('status', { type: () => String, nullable: true }) status?: string,
    @Args('search', { type: () => String, nullable: true }) search?: string,
    @Args('page', { type: () => Number, defaultValue: 1 }) page: number = 1,
    @Args('limit', { type: () => Number, defaultValue: 20 }) limit: number = 20,
    @Context() context?: any
  ) {
    return this.chatService.findChatsWithPagination(
      productId, clientId, businessId, workerId, status, search, page, limit
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Query(() => ChatEntity, { name: 'chat', description: 'Retrieves a single chat by ID.' })
  async getChat(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    return this.chatService.findOne(id, user.id, user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Mutation(() => ChatEntity, { description: 'Updates a chat’s status or properties.' })
  async updateChat(
    @Args('id', { type: () => String }) id: string,
    @Args('updateChatInput') updateChatInput: UpdateChatInput,
    @Context() context,
  ) {
    const user = context.req.user;
    return this.chatService.update(id, updateChatInput, user.id, user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Mutation(() => ChatEntity, { description: 'Deletes a chat.' })
  async deleteChat(@Args('id', { type: () => String }) id: string, @Context() context) {
    const user = context.req.user;
    return this.chatService.remove(id, user.id, user.role);
  }

  // New resolvers to match frontend expectations
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Mutation(() => ChatMessageEntity, { description: 'Sends a message in a chat.' })
  async sendMessage(
    @Args('input') input: SendMessageInput,
    @Context() context
  ) {
    const user = context.req.user;
    const message = await this.chatService.sendMessage(input, user.id);
    
    // Publish the message to subscribers
    this.pubSub.publish('messageReceived', { 
      messageReceived: message,
      chatId: input.chatId 
    });
    
    return message;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Query(() => PaginatedMessagesResponse, { name: 'chatMessages', description: 'Retrieves messages for a chat.' })
  async getChatMessages(
    @Args('chatId', { type: () => String }) chatId: string,
    @Args('after', { type: () => String, nullable: true }) after?: string,
    @Args('before', { type: () => String, nullable: true }) before?: string,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number = 20
  ) {
    return this.chatService.getChatMessages(chatId, after, before, limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Query(() => UnreadCountResponse, { name: 'unreadChatCount', description: 'Gets unread message count for user.' })
  async getUnreadCount(
    @Args('userId', { type: () => String }) userId: string
  ) {
    return this.chatService.getUnreadCount(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Mutation(() => MarkAsReadResponse, { description: 'Marks messages as read.' })
  async markMessagesAsRead(
    @Args('chatId', { type: () => String }) chatId: string,
    @Args('userId', { type: () => String }) userId: string
  ) {
    return this.chatService.markMessagesAsRead(chatId, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Mutation(() => ChatEntity, { description: 'Updates chat status.' })
  async updateChatStatus(
    @Args('id', { type: () => String }) id: string,
    @Args('status', { type: () => String }) status: string
  ) {
    const updatedChat = await this.chatService.updateChatStatus(id, status);
    
    // Publish status update to subscribers
    this.pubSub.publish('chatStatusUpdated', { 
      chatStatusUpdated: updatedChat 
    });
    
    return updatedChat;
  }

  // Subscriptions
  @Subscription(() => ChatMessageEntity, {
    filter: (payload, variables) => {
      return payload.chatId === variables.chatId;
    },
  })
  messageReceived(@Args('chatId', { type: () => String }) chatId: string) {
    return this.pubSub.asyncIterableIterator('messageReceived');
  }

  @Subscription(() => ChatEntity)
  chatCreated(@Args('userId', { type: () => String }) userId: string) {
    return this.pubSub.asyncIterableIterator('chatCreated');
  }

  @Subscription(() => ChatEntity)
  chatStatusUpdated(@Args('userId', { type: () => String }) userId: string) {
    return this.pubSub.asyncIterableIterator('chatStatusUpdated');
  }

  // Additional resolvers to match frontend expectations
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Query(() => [ChatEntity], { name: 'chatsByParticipant', description: 'Gets chats by participant ID.' })
  async getChatsByParticipant(
    @Args('participantId', { type: () => String }) participantId: string
  ) {
    return this.chatService.getChatsByParticipant(participantId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Query(() => [chatNotification], { name: 'chatNotifications', description: 'Gets chat notifications for user.' })
  async getChatNotifications(
    @Args('userId', { type: () => String }) userId: string
  ) {
    return this.chatService.getChatNotifications(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Mutation(() => ChatEntity, { description: 'Starts a negotiation chat.' })
  async startNegotiation(
    @Args('input') input: StartNegotiationInput,
    @Context() context
  ) {
    const user = context.req.user;
    if (!input.participantIds.includes(user.id)) {
      throw new Error('Users must include themselves as a participant');
    }
    
    const chat = await this.chatService.startNegotiation(input);
    
    // Publish to subscribers
    this.pubSub.publish('chatCreated', { 
      chatCreated: chat 
    });
    
    return chat;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client', 'business', 'worker')
  @Mutation(() => ChatEntity, { description: 'Accepts a negotiation.' })
  async acceptNegotiation(
    @Args('negotiationId', { type: () => String }) negotiationId: string,
    @Context() context
  ) {
    const updatedChat = await this.chatService.acceptNegotiation(negotiationId);
    
    // Publish status update to subscribers
    this.pubSub.publish('chatStatusUpdated', { 
      chatStatusUpdated: updatedChat 
    });
    
    return updatedChat;
  }
}
