import express, { Router } from 'express';
import { NodeManager } from '../../application/use-cases/NodeManager';

export class RestController {
  public readonly router: Router;

  constructor(private readonly nodeManager: NodeManager) {
    this.router = express.Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/state', (_req, res) => {
      res.json(this.nodeManager.getState());
    });

    this.router.post('/events/internal', (req, res) => {
      const { eventName } = req.body;
      this.nodeManager.triggerInternalEvent(eventName);
      res.json({ ok: true });
    });

    this.router.post('/reset', (_req, res) => {
      this.nodeManager.triggerReset();
      res.json({ ok: true });
    });

    this.router.post('/messages', async (req, res) => {
      const { targetNodeId, content } = req.body;
      if (!targetNodeId) {
        return res.status(400).json({ error: 'targetNodeId obrigatório' });
      }
      try {
        await this.nodeManager.sendToPeer(targetNodeId, content || 'msg manual');
        res.json({ ok: true });
      } catch (error) {
        res.status(500).json({ error: (error as Error).message });
      }
    });

    this.router.post('/auto/start', (req, res) => {
      const { minMs, maxMs } = req.body;
      this.nodeManager.startAutoMode(minMs, maxMs);
      res.json({ ok: true, auto: true });
    });

    this.router.post('/auto/stop', (_req, res) => {
      this.nodeManager.stopAutoMode();
      res.json({ ok: true, auto: false });
    });
  }
}
