import { Injectable } from '@nestjs/common';
import { ChatStatus, CreateChatInput, CreateChatMessageInput } from './dto/create-chat.input';
import { UpdateChatInput } from './dto/update-chat.input';
import { PrismaService } from 'src/prisma/prisma.service';

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

  async findOne(id: string, userId: string, userRole: string) {
    const chat = await this.prisma.chat.findUnique({
      where: { id },
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
    if (!chat) {
      throw new Error('Chat not found');
    }
    const isParticipant = chat.participants.some(
      p => p.clientId === userId || p.businessId === userId || p.workerId === userId,
    );
    if (!isParticipant) {
      throw new Error('Access restricted to chat participants');
    }
    return chat;
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
}


