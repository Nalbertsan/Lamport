import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { SocketEventPublisher } from './infrastructure/http/SocketEventPublisher';
import { TcpClient } from './infrastructure/tcp/TcpClient';
import { NodeManager } from './application/use-cases/NodeManager';
import { TcpServer } from './infrastructure/tcp/TcpServer';
import { RestController } from './infrastructure/http/RestController';

const NODE_ID = process.env.NODE_ID || 'P1';
const MACHINE_ID = process.env.MACHINE_ID || '1';
const HTTP_PORT = parseInt(process.env.HTTP_PORT || '3001', 10);
const TCP_PORT = parseInt(process.env.TCP_PORT || '5001', 10);

const PEERS_STR = process.env.PEERS || 'P2:127.0.0.1:5002,P3:127.0.0.1:5003';
const peerMap: Record<string, { host: string; port: number }> = {};
const peerIds: string[] = [];

PEERS_STR.split(',').forEach((peerDef) => {
  if (peerDef) {
    const [id, host, portStr] = peerDef.split(':');
    if (id && host && portStr) {
      peerMap[id] = { host, port: parseInt(portStr, 10) };
      peerIds.push(id);
    }
  }
});

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

const eventPublisher = new SocketEventPublisher(io);
const tcpClient = new TcpClient(peerMap);
const nodeManager = new NodeManager(NODE_ID, MACHINE_ID, peerIds, eventPublisher, tcpClient);

const restController = new RestController(nodeManager);
app.use('/api', restController.router);

const tcpServer = new TcpServer(TCP_PORT, nodeManager);
tcpServer.start();

httpServer.listen(HTTP_PORT, () => {
  console.log(`[Máquina ${MACHINE_ID} · Processo ${NODE_ID}] HTTP :${HTTP_PORT}  TCP :${TCP_PORT}`);
});

io.on('connection', (socket) => {
  socket.emit('state-update', nodeManager.getState());
  socket.emit('auto-mode', { active: nodeManager.isAutoMode() });
});
