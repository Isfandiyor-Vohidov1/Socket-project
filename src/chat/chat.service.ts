import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

interface IMessage {
  id: string;
  username: string;
  message: string;
  time: string;
}

@Injectable()
export class ChatService {
  private messages: IMessage[] = [];

  getAllMessages(): IMessage[] {
    return this.messages;
  }

  sendMessage(username: string, message: string): IMessage {
    const newMessage: IMessage = {
      id: uuidv4(),
      username,
      message,
      time: new Date().toLocaleTimeString(),
    };
    this.messages.push(newMessage);
    return newMessage;
  }

  updateMessage(messageId: string, updatedText: string): IMessage {
    const message = this.messages.find((msg) => msg.id === messageId);

    if (!message) {
      throw new NotFoundException(`Сообщение с ID "${messageId}" не найдено.`);
    }

    message.message = updatedText;
    message.time = `${new Date().toLocaleTimeString()} (изменено)`;

    return message;
  }

  deleteMessage(messageId: string): boolean {
    const index = this.messages.findIndex(
      (message) => message.id === messageId,
    );
    if (index !== -1) {
      this.messages.splice(index, 1);
      return true;
    }
    return false;
  }

  clearAllMessages(): void {
    this.messages = [];
  }
}