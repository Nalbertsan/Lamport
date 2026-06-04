import net from 'net';
import { Message } from '../../domain/entities/Message';
import { TcpSender } from '../../application/ports/out/TcpSender';

export class TcpClient implements TcpSender {
  constructor(private readonly peerMap: Record<string, { host: string, port: number }>) {}

  public async sendMessage(targetNodeId: string, message: Message): Promise<void> {
    const peer = this.peerMap[targetNodeId];
    if (!peer) {
      throw new Error(`Nó destino ${targetNodeId} não encontrado nas configurações.`);
    }

    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      
      client.connect(peer.port, peer.host, () => {
        const payload = JSON.stringify(message);
        client.write(payload + '\n');
        client.end(); 
      });

      client.on('close', () => {
        resolve();
      });

      client.on('error', (err) => {
        reject(err);
      });
    });
  }
}
