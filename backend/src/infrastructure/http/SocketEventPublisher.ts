import { Server } from 'socket.io';
import { EventPublisher, NodeState } from '../../application/ports/out/EventPublisher';

export class SocketEventPublisher implements EventPublisher {
  constructor(private readonly io: Server) {}

  public publishStateUpdate(state: NodeState): void {
    this.io.emit('state-update', state);
  }

  public publishEventLog(log: string): void {
    this.io.emit('event-log', log);
  }

  public publishAutoMode(active: boolean): void {
    this.io.emit('auto-mode', { active });
  }
}
