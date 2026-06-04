import { Message } from '../../../domain/entities/Message';

export interface TcpSender {
  sendMessage(targetNodeId: string, message: Message): Promise<void>;
}
