import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface LogEntry {
  type: 'init' | 'internal' | 'send' | 'receive' | 'error';
  nodeId: string;
  machineId?: string;
  time?: number;
  targetNodeId?: string;
  fromNodeId?: string;
  msgId?: string;
  msgTime?: number;
  oldTime?: number;
  detail?: string;
  ts: number;
}

export function useNode(apiUrl: string, initialId: string) {
  const [time, setTime] = useState(0);
  const [nodeId, setNodeId] = useState(initialId);
  const [machineId, setMachineId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(apiUrl);
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('state-update', (state: { nodeId: string; machineId: string; time: number }) => {
      setNodeId(state.nodeId);
      setMachineId(state.machineId);
      setTime(state.time);
    });

    socket.on('event-log', (raw: string) => {
      try {
        const entry: LogEntry = { ...JSON.parse(raw), ts: Date.now() };
        setLogs((prev) => {
          if (entry.detail === 'relógio resetado') {
            return [entry];
          }
          return [entry, ...prev].slice(0, 80);
        });
      } catch {
        console.error('Erro ao processar o log!');
      }
    });

    socket.on('auto-mode', (data: { active: boolean }) => {
      setAutoMode(data.active);
    });

    return () => { socket.disconnect(); };
  }, [apiUrl]);

  const triggerInternal = () =>
    fetch(`${apiUrl}/api/events/internal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }).catch(console.error);

  const sendToPeer = (target: string) =>
    fetch(`${apiUrl}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetNodeId: target }),
    }).catch(console.error);

  const startAuto = (minMs: number, maxMs: number) =>
    fetch(`${apiUrl}/api/auto/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minMs, maxMs }),
    }).catch(console.error);

  const stopAuto = () =>
    fetch(`${apiUrl}/api/auto/stop`, { method: 'POST' }).catch(console.error);

  const reset = () => {
    fetch(`${apiUrl}/api/reset`, { method: 'POST' }).catch(console.error);
    setLogs([]);
  };

  return { time, nodeId, machineId, logs, isConnected, autoMode, triggerInternal, sendToPeer, startAuto, stopAuto, reset };
}
