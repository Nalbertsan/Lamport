export interface NodeState {
  nodeId: string;
  machineId: string;
  time: number;
}

export interface EventPublisher {
  publishStateUpdate(state: NodeState): void;
  publishEventLog(log: string): void;
  publishAutoMode(active: boolean): void;
}
