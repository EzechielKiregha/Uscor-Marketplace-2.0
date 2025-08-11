import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { ChatEntity } from './entities/chat.entity';
import { CreateChatInput, CreateChatMessageInput } from './dto/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ChatMessageEntity } from '../chat/entities/chat-nessage.entity';

// Resolver
@Resolver(() => ChatEntity)
export class ChatResolver {
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
  @Query(() => [ChatEntity], { name: 'chats', description: 'Retrieves chats for the user.' })
  async getChats(@Context() context) {
    const user = context.req.user;
    return this.chatService.findAll(user.id, user.role);
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
}
