import { Injectable } from '@nestjs/common';
import { CreateChatNessageInput } from './dto/create-chat-nessage.input';
import { UpdateChatNessageInput } from './dto/update-chat-nessage.input';

@Injectable()
export class ChatNessageService {
  create(createChatNessageInput: CreateChatNessageInput) {
    return 'This action adds a new chatNessage';
  }

  findAll() {
    return `This action returns all chatNessage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatNessage`;
  }

  update(id: number, updateChatNessageInput: UpdateChatNessageInput) {
    return `This action updates a #${id} chatNessage`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatNessage`;
  }
}
