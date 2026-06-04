import { Clock } from '../../domain/entities/Clock';
import { Message } from '../../domain/entities/Message';
import { EventPublisher } from '../ports/out/EventPublisher';
import { TcpSender } from '../ports/out/TcpSender';

export class NodeManager {
  private clock: Clock;
  private autoInterval: ReturnType<typeof setTimeout> | null = null;
  private autoRunning: boolean = false;

  constructor(
    private readonly nodeId: string,
    private readonly machineId: string,
    private readonly peerIds: string[],
    private readonly eventPublisher: EventPublisher,
    private readonly tcpSender: TcpSender
  ) {
    this.clock = new Clock(nodeId);
    this.publishCurrentState();
    this.eventPublisher.publishEventLog(
      JSON.stringify({ type: 'init', nodeId: this.nodeId, machineId: this.machineId, time: 0 })
    );
  }

  public triggerInternalEvent(eventName: string = 'evento interno'): void {
    this.clock.tick();
    this.eventPublisher.publishEventLog(
      JSON.stringify({
        type: 'internal',
        nodeId: this.nodeId,
        machineId: this.machineId,
        time: this.clock.time,
        detail: eventName,
      })
    );
    this.publishCurrentState();
  }

  public triggerReset(): void {
    this.clock.reset();
    this.eventPublisher.publishEventLog(
      JSON.stringify({
        type: 'internal',
        nodeId: this.nodeId,
        machineId: this.machineId,
        time: this.clock.time,
        detail: 'relógio resetado',
      })
    );
    this.publishCurrentState();
  }

  public async sendToPeer(targetNodeId: string, content: string): Promise<void> {
    this.clock.tick();

    const message: Message = {
      id: Math.random().toString(36).substring(7),
      senderId: this.nodeId,
      receiverId: targetNodeId,
      timestamp: this.clock.time,
      content,
    };

    this.eventPublisher.publishEventLog(
      JSON.stringify({
        type: 'send',
        nodeId: this.nodeId,
        machineId: this.machineId,
        targetNodeId,
        msgId: message.id,
        time: this.clock.time,
      })
    );
    this.publishCurrentState();

    try {
      await this.tcpSender.sendMessage(targetNodeId, message);
    } catch (error) {
      this.eventPublisher.publishEventLog(
        JSON.stringify({
          type: 'error',
          nodeId: this.nodeId,
          machineId: this.machineId,
          detail: `Falha ao enviar para ${targetNodeId}: ${(error as Error).message}`,
        })
      );
    }
  }

  public receiveFromPeer(message: Message): void {
    const oldTime = this.clock.time;
    this.clock.update(message.timestamp);
    this.eventPublisher.publishEventLog(
      JSON.stringify({
        type: 'receive',
        nodeId: this.nodeId,
        machineId: this.machineId,
        fromNodeId: message.senderId,
        msgId: message.id,
        msgTime: message.timestamp,
        oldTime,
        time: this.clock.time,
      })
    );
    this.publishCurrentState();
  }

  public startAutoMode(minMs: number = 1500, maxMs: number = 4000): void {
    if (this.autoRunning) return;
    this.autoRunning = true;
    this.eventPublisher.publishAutoMode(true);
    this.scheduleNext(minMs, maxMs);
  }

  public stopAutoMode(): void {
    this.autoRunning = false;
    if (this.autoInterval) {
      clearTimeout(this.autoInterval);
      this.autoInterval = null;
    }
    this.eventPublisher.publishAutoMode(false);
  }

  public isAutoMode(): boolean {
    return this.autoRunning;
  }

  private scheduleNext(minMs: number, maxMs: number): void {
    if (!this.autoRunning) return;
    const delay = Math.floor(Math.random() * (maxMs - minMs)) + minMs;

    this.autoInterval = setTimeout(async () => {
      if (!this.autoRunning) return;

      const doInternal = Math.random() < 0.4;

      if (doInternal) {
        this.triggerInternalEvent('processamento local');
      } else {
        const target = this.peerIds[Math.floor(Math.random() * this.peerIds.length)];
        await this.sendToPeer(target, 'msg automática');
      }

      this.scheduleNext(minMs, maxMs);
    }, delay);
  }

  private publishCurrentState(): void {
    this.eventPublisher.publishStateUpdate({
      nodeId: this.nodeId,
      machineId: this.machineId,
      time: this.clock.time,
    });
  }

  public getState() {
    return { nodeId: this.nodeId, machineId: this.machineId, time: this.clock.time, auto: this.autoRunning };
  }
}
