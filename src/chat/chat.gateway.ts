// Файл: src/chat/chat.gateway.ts

import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dto/message.dto';
import { ChatService } from './chat.service';

class UpdateMessageDto {
  id: string;
  message: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) { }

  @SubscribeMessage('send-message')
  handleSendMessage(@MessageBody() data: MessageDto): void {
    const newMessage = this.chatService.sendMessage(data.username, data.message);
    this.server.emit('new-message', newMessage);
  }

  @SubscribeMessage('delete-message')
  handleDeleteMessage(@MessageBody() messageId: string): void {
    const isDeleted = this.chatService.deleteMessage(messageId);
    if (isDeleted) {
      this.server.emit('message-deleted', messageId);
    }
  }

  @SubscribeMessage('update-message')
  handleUpdateMessage(@MessageBody() data: UpdateMessageDto): void {
    try {
      const updatedMessage = this.chatService.updateMessage(data.id, data.message);
      this.server.emit('message-updated', updatedMessage);
    } catch (error) {
      console.error(error);
    }
  }

  @SubscribeMessage('clear-chat')
  handleClearChat(): void {
    this.chatService.clearAllMessages();
    this.server.emit('chat-cleared');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const allMessages = this.chatService.getAllMessages();
    client.emit('message-history', allMessages);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
