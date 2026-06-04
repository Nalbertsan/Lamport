import net from 'net';
import { NodeManager } from '../../application/use-cases/NodeManager';
import { Message } from '../../domain/entities/Message';

export class TcpServer {
  private server: net.Server;

  constructor(
    private readonly port: number,
    private readonly nodeManager: NodeManager
  ) {
    this.server = net.createServer((socket) => {
      let dataBuffer = '';

      socket.on('data', (data) => {
        dataBuffer += data.toString();

        const lines = dataBuffer.split('\n');
        dataBuffer = lines.pop() || ''; 

        for (const line of lines) {
          if (line.trim()) {
            try {
              const message = JSON.parse(line) as Message;
              this.nodeManager.receiveFromPeer(message);
            } catch (err) {
              console.error('Erro ao fazer parse da mensagem TCP recebida:', err);
            }
          }
        }
      });

      socket.on('error', (err) => {
        console.error('Erro no Socket TCP:', err);
      });
    });
  }

  public start(): void {
    this.server.listen(this.port, '0.0.0.0', () => {
      console.log(`[TCP Server] Aguardando mensagens na porta ${this.port}`);
    });
  }
}
