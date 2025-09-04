import { Injectable } from '@nestjs/common';
import { ChatStatus, CreateChatInput, CreateChatMessageInput, NegotiationType, SendMessageInput } from './dto/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedChatsResponse, PaginatedMessagesResponse, UnreadCountResponse } from './dto/chat-response.dto';
import { ChatEntity } from './entities/chat.entity';

// Service
@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async create(createChatInput: CreateChatInput) {
    const { productId, serviceId, participantIds, isSecure, negotiationType } = createChatInput;

    // Validate product or service
    if (productId && serviceId) {
      throw new Error('Chat can only be associated with a product or a service, not both');
    }
    if (negotiationType === 'REOWNERSHIP' && !productId) {
      throw new Error('REOWNERSHIP chats require a product');
    }
    if (negotiationType === 'FREELANCEORDER' && !serviceId) {
      throw new Error('FREELANCEORDER chats require a service');
    }
    if (negotiationType === 'PURCHASE' && !productId) {
      throw new Error('PURCHASE chats require a product');
    }

    if (productId) {
      const product = await this.prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');
      if (negotiationType === 'REOWNERSHIP' && product.isPhysical && !isSecure) {
        throw new Error('REOWNERSHIP chats for physical products must be secure');
      }
    }
    if (serviceId) {
      const service = await this.prisma.freelanceService.findUnique({ where: { id: serviceId } });
      if (!service) throw new Error('Service not found');
    }

    // Validate participants
    const participantsData = new Array<Object>;
    for (const id of participantIds) {
      const client = await this.prisma.client.findUnique({ where: { id } });
      const business = client ? null : await this.prisma.business.findUnique({ where: { id } });
      const worker = client || business ? null : await this.prisma.worker.findUnique({ where: { id } });
      if (!client && !business && !worker) {
        throw new Error(`Participant ${id} not found`);
      }
      participantsData.push({
        clientId: client ? id : undefined,
        businessId: business ? id : undefined,
        workerId: worker ? id : undefined,
      });
    }

    // Validate participant requirements
    if (negotiationType === 'REOWNERSHIP' && participantsData.length !== 2) {
      throw new Error('REOWNERSHIP chats require exactly two businesses');
    }
    if (negotiationType === 'PURCHASE' && participantsData.length !== 2) {
      throw new Error('PURCHASE chats require one client and one business');
    }

    // Ensure secure chats for negotiations
    if (negotiationType === 'REOWNERSHIP' && !isSecure) {
      throw new Error('REOWNERSHIP chats must be secure');
    }

    return this.prisma.chat.create({
      data: {
        product: productId ? { connect: { id: productId } } : undefined,
        service: serviceId ? { connect: { id: serviceId } } : undefined,
        status: ChatStatus.PENDING,
        isSecure,
        negotiationType,
        participants: { create: participantsData },
      },
      include: {
        product: productId ? { select: { id: true, title: true, businessId: true, isPhysical: true } } : false,
        service: serviceId ? { select: { id: true, title: true, businessId: true } } : false,
        participants: {
          include: {
            client: { select: { id: true, username: true, email: true, createdAt: true } },
            business: { select: { id: true, name: true, email: true, createdAt: true } },
            worker: { select: { id: true, fullName: true, email: true, role: true, createdAt: true } },
          },
        },
        messages: true,
      },
    });
  }

  async createMessage(createChatMessageInput: CreateChatMessageInput, senderId: string, senderRole: string) {
    const { chatId, message } = createChatMessageInput;

    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: { include: { client: true, business: true, worker: true } } },
    });
    if (!chat) {
      throw new Error('Chat not found');
    }

    // Validate sender
    const isParticipant = chat.participants.some(
      p => p.clientId === senderId || p.businessId === senderId || p.workerId === senderId,
    );
    if (!isParticipant) {
      throw new Error('Only chat participants can send messages');
    }

    // Enforce secure chat restrictions
    if (chat.isSecure && chat.negotiationType === 'REOWNERSHIP') {
      console.log(`Secure message logged for chat ${chatId}`);
    }

    return this.prisma.chatMessage.create({
      data: {
        chat: { connect: { id: chatId } },
        message,
        senderId,
      },
      include: {
        chat: { select: { id: true } },
      },
    });
  }

  async findAll(userId: string, userRole: string) {
    return this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            OR: [
              { clientId: userRole === 'client' ? userId : undefined },
              { businessId: userRole === 'business' ? userId : undefined },
              { workerId: userRole === 'worker' ? userId : undefined },
            ],
          },
        },
      },
      include: {
        product: { select: { id: true, title: true, businessId: true, isPhysical: true } },
        service: { select: { id: true, title: true, businessId: true } },
        participants: {
          include: {
            client: { select: { id: true, username: true, email: true, createdAt: true } },
            business: { select: { id: true, name: true, email: true, createdAt: true } },
            worker: { select: { id: true, fullName: true, email: true, role: true, createdAt: true } },
          },
        },
        messages: true,
      },
    });
  }

  // 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

  async findOne(id: string, userId?: string, userRole?: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, title: true, price: true } },
        service: { select: { id: true, title: true } },
        participants: {
          include: {
            client: { select: { id: true, fullName: true, avatar: true } },
            business: { select: { id: true, name: true, avatar: true } },
            worker: { select: { id: true, fullName: true, avatar: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            message: true,
            senderId: true,
            createdAt: true,
            isRead: true
          }
        },
      },
    });
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    // Only check participant access if userId is provided
    if (userId) {
      const isParticipant = chat.participants.some(
        p => p.clientId === userId || p.businessId === userId || p.workerId === userId,
      );
      if (!isParticipant) {
        throw new Error('Access restricted to chat participants');
      }
    }

    // Transform the data to match frontend expectations
    const client = chat.participants.find(p => p.client)?.client;
    const business = chat.participants.find(p => p.business)?.business;
    const worker = chat.participants.find(p => p.worker)?.worker;
    
    // Calculate unread count for the requesting user
    const unreadCount = userId ? chat.messages.filter(m => !m.isRead && m.senderId !== userId).length : 0;

    // Create a proper ChatEntity object
    const chatEntity: any = {
      id: chat.id,
      status: chat.status as ChatStatus,
      isSecure: chat.isSecure,
      negotiationType: chat.negotiationType as NegotiationType,
      productId: chat.productId,
      product: chat.product ? {
        id: chat.product.id,
        title: chat.product.title,
        price: chat.product.price
      } : undefined,
      serviceId: chat.serviceId,
      service: chat.service,
      clientId: client?.id,
      client: client ? {
        id: client.id,
        fullName: client.fullName,
        avatar: client.avatar
      } : undefined,
      businessId: business?.id,
      business: business ? {
        id: business.id,
        name: business.name,
        avatar: business.avatar
      } : undefined,
      workerId: worker?.id,
      worker: worker ? {
        id: worker.id,
        fullName: worker.fullName,
        avatar: worker.avatar
      } : undefined,
      participants: chat.participants,
      messages: chat.messages.map(msg => ({
        id: msg.id,
        chatId: chat.id,
        content: msg.message,
        senderType: this.determineSenderType(msg.senderId, chat.participants),
        senderId: msg.senderId,
        sender: this.getSenderInfo(msg.senderId, chat.participants),
        createdAt: msg.createdAt
      })),
      unreadCount,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    };

    return chatEntity;
  }

  async update(id: string, updateChatInput: UpdateChatInput, userId: string, userRole: string) {
    const { status, isSecure, negotiationType } = updateChatInput;
    const chat = await this.findOne(id, userId, userRole);

    if (chat.isSecure && (isSecure === false || negotiationType !== chat.negotiationType)) {
      throw new Error('Cannot modify secure chat properties');
    }

    return this.prisma.chat.update({
      where: { id },
      data: { status, isSecure, negotiationType },
      include: {
        product: { select: { id: true, title: true, businessId: true, isPhysical: true } },
        service: { select: { id: true, title: true, businessId: true } },
        participants: {
          include: {
            client: { select: { id: true, username: true, email: true, createdAt: true } },
            business: { select: { id: true, name: true, email: true, createdAt: true } },
            worker: { select: { id: true, fullName: true, email: true, role: true, createdAt: true } },
          },
        },
        messages: true,
      },
    });
  }

  async remove(id: string, userId: string, userRole: string) {
    const chat = await this.findOne(id, userId, userRole);
    if (chat.isSecure && chat.negotiationType === 'REOWNERSHIP') {
      throw new Error('Secure re-ownership chats cannot be deleted');
    }
    return this.prisma.chat.delete({
      where: { id },
      select: { id: true },
    });
  }

  // New methods to match frontend expectations
  async findChatsWithPagination(
    productId?: string,
    clientId?: string,
    businessId?: string,
    workerId?: string,
    status?: string,
    search?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedChatsResponse> {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    
    if (productId) whereClause.productId = productId;
    if (status) whereClause.status = status;
    
    // Handle participant filtering
    if (clientId || businessId || workerId) {
      whereClause.participants = {
        some: {
          OR: [
            clientId ? { clientId } : null,
            businessId ? { businessId } : null,
            workerId ? { workerId } : null,
          ].filter(Boolean)
        }
      };
    }

    // Handle search
    if (search) {
      whereClause.OR = [
        {
          participants: {
            some: {
              OR: [
                { client: { fullName: { contains: search, mode: 'insensitive' } } },
                { business: { name: { contains: search, mode: 'insensitive' } } },
                { worker: { fullName: { contains: search, mode: 'insensitive' } } }
              ]
            }
          }
        },
        {
          product: {
            title: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    const [chats, total] = await Promise.all([
      this.prisma.chat.findMany({
        where: whereClause,
        include: {
          product: { select: { id: true, title: true, price: true, businessId: true, isPhysical: true } },
          service: { select: { id: true, title: true } },
          participants: {
            include: {
              client: { select: { id: true, fullName: true, avatar: true } },
              business: { select: { id: true, name: true, avatar: true } },
              worker: { select: { id: true, fullName: true, avatar: true } },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              message: true,
              senderId: true,
              createdAt: true,
              isRead: true
            }
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.chat.count({ where: whereClause })
    ]);

    // Transform the data to match frontend expectations
    const transformedChats = chats.map(chat => {
      const client = chat.participants.find(p => p.client)?.client;
      const business = chat.participants.find(p => p.business)?.business;
      const worker = chat.participants.find(p => p.worker)?.worker;
      
      // Calculate unread count (simplified - you might want to track this per user)
      const unreadCount = chat.messages.filter(m => !m.isRead).length;

      // Create a proper ChatEntity object
      const chatEntity: any = {
        id: chat.id,
        status: chat.status as ChatStatus,
        isSecure: chat.isSecure,
        negotiationType: chat.negotiationType as NegotiationType,
        productId: chat.productId,
        product: chat.product ? {
          id: chat.product.id,
          title: chat.product.title,
          price: chat.product.price,
          businessId: chat.product.businessId,
          isPhysical: chat.product.isPhysical
        } : undefined,
        serviceId: chat.serviceId,
        service: chat.service,
        clientId: client?.id,
        client: client ? {
          id: client.id,
          fullName: client.fullName,
          avatar: client.avatar
        } : undefined,
        businessId: business?.id,
        business: business ? {
          id: business.id,
          name: business.name,
          avatar: business.avatar
        } : undefined,
        workerId: worker?.id,
        worker: worker ? {
          id: worker.id,
          fullName: worker.fullName,
          avatar: worker.avatar
        } : undefined,
        participants: chat.participants,
        messages: chat.messages.map(msg => ({
          id: msg.id,
          chatId: chat.id,
          content: msg.message,
          senderType: this.determineSenderType(msg.senderId, chat.participants),
          senderId: msg.senderId,
          sender: this.getSenderInfo(msg.senderId, chat.participants),
          createdAt: msg.createdAt
        })),
        unreadCount,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      };

      return chatEntity;
    });

    return {
      items: transformedChats,
      total,
      page,
      limit
    };
  }

  async sendMessage(input: SendMessageInput, currentUserId: string): Promise<any> {
    const { chatId, content, senderType, senderId } = input;

    // Validate that the current user is the sender
    if (currentUserId !== senderId) {
      throw new Error('You can only send messages as yourself');
    }

    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { participants: { include: { client: true, business: true, worker: true } } },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Validate sender is a participant
    const isParticipant = chat.participants.some(
      p => p.clientId === senderId || p.businessId === senderId || p.workerId === senderId,
    );
    if (!isParticipant) {
      throw new Error('Only chat participants can send messages');
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        chat: { connect: { id: chatId } },
        message: content,
        senderId,
      },
      include: {
        chat: { select: { id: true } },
      },
    });

    // Update chat's updatedAt timestamp
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    // Get sender info for the response
    const sender = this.getSenderInfo(senderId, chat.participants);

    return {
      id: message.id,
      chatId: message.chatId,
      content: message.message,
      senderType,
      senderId: message.senderId,
      sender,
      createdAt: message.createdAt
    };
  }

  async getChatMessages(
    chatId: string,
    after?: string,
    before?: string,
    limit: number = 20
  ): Promise<PaginatedMessagesResponse> {
    const whereClause: any = { chatId };
    
    if (after) {
      whereClause.createdAt = { gt: new Date(after) };
    }
    if (before) {
      whereClause.createdAt = { lt: new Date(before) };
    }

    const messages = await this.prisma.chatMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Take one extra to check if there are more
      include: {
        chat: {
          include: {
            participants: {
              include: {
                client: { select: { id: true, fullName: true, avatar: true } },
                business: { select: { id: true, name: true, avatar: true } },
                worker: { select: { id: true, fullName: true, avatar: true } },
              }
            }
          }
        }
      }
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, -1) : messages;
    const cursor = items.length > 0 ? items[items.length - 1].createdAt.toISOString() : undefined;

    const transformedMessages = items.map(msg => {
      const sender = this.getSenderInfo(msg.senderId, msg.chat.participants);
      return {
        id: msg.id,
        chatId: msg.chatId,
        content: msg.message,
        senderType: this.determineSenderType(msg.senderId, msg.chat.participants),
        senderId: msg.senderId,
        sender,
        createdAt: msg.createdAt
      };
    });

    return {
      items: transformedMessages,
      hasMore,
      cursor
    };
  }

  async getUnreadCount(userId: string): Promise<UnreadCountResponse> {
    // This is a simplified implementation
    // In a real app, you'd want to track read status per user
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            OR: [
              { clientId: userId },
              { businessId: userId },
              { workerId: userId }
            ]
          }
        }
      },
      include: {
        messages: {
          where: {
            isRead: false,
            senderId: { not: userId }
          }
        }
      }
    });

    const chatsWithUnread = chats
      .map(chat => ({
        chatId: chat.id,
        unreadCount: chat.messages.length
      }))
      .filter(chat => chat.unreadCount > 0);

    const totalUnread = chatsWithUnread.reduce((sum, chat) => sum + chat.unreadCount, 0);

    return {
      totalUnread,
      chatsWithUnread
    };
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<{ success: boolean; unreadCount: number }> {
    await this.prisma.chatMessage.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    // Get remaining unread count for this chat
    const unreadCount = await this.prisma.chatMessage.count({
      where: {
        chatId,
        senderId: { not: userId },
        isRead: false
      }
    });

    return {
      success: true,
      unreadCount
    };
  }

  async updateChatStatus(id: string, status: string): Promise<any> {
    return this.prisma.chat.update({
      where: { id },
      data: { status: status as ChatStatus },
      include: {
        product: { select: { id: true, title: true, price: true } },
        service: { select: { id: true, title: true } },
        participants: {
          include: {
            client: { select: { id: true, fullName: true, avatar: true } },
            business: { select: { id: true, name: true, avatar: true } },
            worker: { select: { id: true, fullName: true, avatar: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            message: true,
            senderId: true,
            createdAt: true
          }
        },
      },
    });
  }

  // Additional methods to match frontend expectations
  async getChatsByParticipant(participantId: string): Promise<any[]> {
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            OR: [
              { clientId: participantId },
              { businessId: participantId },
              { workerId: participantId }
            ]
          }
        }
      },
      include: {
        product: { select: { id: true, title: true } },
        service: { select: { id: true, title: true } },
        participants: {
          include: {
            client: { select: { id: true, fullName: true, avatar: true } },
            business: { select: { id: true, name: true, avatar: true } },
            worker: { select: { id: true, fullName: true, avatar: true } },
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            message: true,
            senderId: true,
            createdAt: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return chats.map(chat => {
      const client = chat.participants.find(p => p.client)?.client;
      const business = chat.participants.find(p => p.business)?.business;
      const worker = chat.participants.find(p => p.worker)?.worker;

      return {
        id: chat.id,
        status: chat.status,
        isSecure: chat.isSecure,
        negotiationType: chat.negotiationType,
        productId: chat.productId,
        serviceId: chat.serviceId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        product: chat.product,
        service: chat.service,
        participants: chat.participants.map(p => ({
          id: p.id,
          clientId: p.clientId,
          businessId: p.businessId,
          workerId: p.workerId
        })),
        messages: chat.messages.map(msg => ({
          id: msg.id,
          message: msg.message,
          senderId: msg.senderId,
          createdAt: msg.createdAt
        }))
      };
    });
  }

  async getChatNotifications(userId: string): Promise<any[]> {
    // This would typically be a separate table in a real app
    // For now, we'll simulate it with unread message counts
    const chats = await this.prisma.chat.findMany({
      where: {
        participants: {
          some: {
            OR: [
              { clientId: userId },
              { businessId: userId },
              { workerId: userId }
            ]
          }
        }
      },
      include: {
        messages: {
          where: {
            isRead: false,
            senderId: { not: userId }
          }
        }
      }
    });

    return chats.map(chat => ({
      id: `notification_${chat.id}`,
      chatId: chat.id,
      userId,
      lastReadAt: new Date(), // This would be tracked properly in a real app
      unreadCount: chat.messages.length,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }));
  }

  async startNegotiation(input: any): Promise<any> {
    // This would be a more complex negotiation flow
    // For now, we'll create a chat with negotiation type
    const { productId, serviceId, participantIds, negotiationType } = input;

    return this.create({
      productId,
      serviceId,
      participantIds,
      isSecure: true,
      negotiationType: negotiationType || NegotiationType.GENERAL
    });
  }

  async acceptNegotiation(negotiationId: string): Promise<any> {
    return this.prisma.chat.update({
      where: { id: negotiationId },
      data: { status: ChatStatus.ACTIVE },
      include: {
        product: { select: { id: true, title: true, price: true } },
        service: { select: { id: true, title: true } },
        participants: {
          include: {
            client: { select: { id: true, fullName: true, avatar: true } },
            business: { select: { id: true, name: true, avatar: true } },
            worker: { select: { id: true, fullName: true, avatar: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            message: true,
            senderId: true,
            createdAt: true
          }
        },
      },
    });
  }

  // Helper methods
  private determineSenderType(senderId: string | null, participants: any[]): string {
    const participant = participants.find(p => 
      p.clientId === senderId || p.businessId === senderId || p.workerId === senderId
    );
    
    if (participant?.clientId === senderId) return 'CLIENT';
    if (participant?.businessId === senderId) return 'BUSINESS';
    if (participant?.workerId === senderId) return 'WORKER';
    
    return 'UNKNOWN';
  }

  private getSenderInfo(senderId: string | null, participants: any[]): any {
    const participant = participants.find(p => 
      p.clientId === senderId || p.businessId === senderId || p.workerId === senderId
    );
    
    if (participant?.client) {
      return {
        id: participant.client.id,
        fullName: participant.client.fullName,
        avatar: participant.client.avatar
      };
    }
    if (participant?.business) {
      return {
        id: participant.business.id,
        name: participant.business.name,
        avatar: participant.business.avatar
      };
    }
    if (participant?.worker) {
      return {
        id: participant.worker.id,
        fullName: participant.worker.fullName,
        avatar: participant.worker.avatar
      };
    }
    
    return null;
  }
}


