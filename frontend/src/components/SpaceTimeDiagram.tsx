import React, { useMemo, useState, useRef, useEffect } from 'react';
import { LogEntry } from '../hooks/useNode';

interface SpaceTimeDiagramProps {
  logs: LogEntry[];
}

const PROCESSES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];

const X_SPACING = 60;
const Y_SPACING = 50; 
const MARGIN_X = 50;
const MARGIN_Y = 30;

const getY = (nodeId: string) => {
  const index = PROCESSES.indexOf(nodeId);
  return MARGIN_Y + (index !== -1 ? index : 0) * Y_SPACING;
};

export const SpaceTimeDiagram: React.FC<SpaceTimeDiagramProps> = ({ logs }) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const sortedEvents = useMemo(() => {
    const validEvents = logs.filter(
      (l) => l.type === 'internal' || l.type === 'send' || l.type === 'receive'
    );

    return validEvents.sort((a, b) => {
      if (a.time !== b.time) {
        return a.time - b.time;
      }
      return a.ts - b.ts;
    });
  }, [logs]);

  const { eventCoords, messages } = useMemo(() => {
    const coords: Record<string, { x: number; y: number; log: LogEntry }> = {};
    const msgs: { start: {x: number, y: number}, end: {x: number, y: number}, senderNodeId: string }[] = [];
    
    sortedEvents.forEach((log, index) => {
      const x = MARGIN_X + index * X_SPACING;
      const y = getY(log.nodeId);
      const eventKey = `${log.ts}-${log.nodeId}-${log.type}`;
      coords[eventKey] = { x, y, log };
    });

    const sends = sortedEvents.filter((l) => l.type === 'send' && l.msgId);
    const receives = sortedEvents.filter((l) => l.type === 'receive' && l.msgId);

    sends.forEach((send) => {
      const receive = receives.find((r) => r.msgId === send.msgId);
      if (receive) {
        const sendKey = `${send.ts}-${send.nodeId}-send`;
        const recvKey = `${receive.ts}-${receive.nodeId}-receive`;
        
        if (coords[sendKey] && coords[recvKey]) {
          msgs.push({
            start: { x: coords[sendKey].x, y: coords[sendKey].y },
            end: { x: coords[recvKey].x, y: coords[recvKey].y },
            senderNodeId: send.nodeId
          });
        }
      }
    });

    return { eventCoords: Object.values(coords), messages: msgs };
  }, [sortedEvents]);

  const width = Math.max(800, MARGIN_X * 2 + sortedEvents.length * X_SPACING);
  const height = MARGIN_Y * 2 + (PROCESSES.length - 1) * Y_SPACING;

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [width, autoScroll]);

  return (
    <div className="diagram-container">
      <div className="diagram-header">
        <div>
          <h3>Diagrama de Espaço-Tempo</h3>
          <span className="diagram-subtitle">O tempo flui da esquerda para a direita</span>
        </div>
        <div className="diagram-header-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="auto-label">Auto-scroll</span>
          <button 
            className={`toggle small ${autoScroll ? 'active' : ''}`} 
            onClick={() => setAutoScroll(!autoScroll)} 
          />
        </div>
      </div>
      
      <div 
        className={`diagram-scroll ${autoScroll ? 'hide-scrollbar' : ''}`} 
        ref={containerRef}
      >
        <svg width={width} height={height} className="space-time-svg">
          <defs>
            {PROCESSES.map((p) => (
              <marker key={p} id={`arrow-${p.toLowerCase()}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill={`var(--node-${p.toLowerCase()})`} />
              </marker>
            ))}
          </defs>

          {PROCESSES.map((p) => {
            const y = getY(p);
            return (
              <g key={p}>
                <line x1={0} y1={y} x2={width} y2={y} stroke="var(--border)" strokeWidth="2" />
                <text x={10} y={y - 8} fill="var(--text-dim)" fontSize="12" fontFamily="var(--mono)" fontWeight="bold">
                  {p}
                </text>
              </g>
            );
          })}

          {messages.map((msg, i) => (
            <line
              key={i}
              x1={msg.start.x}
              y1={msg.start.y}
              x2={msg.end.x}
              y2={msg.end.y}
              stroke={`var(--node-${msg.senderNodeId.toLowerCase()})`}
              strokeWidth="2"
              markerEnd={`url(#arrow-${msg.senderNodeId.toLowerCase()})`}
            />
          ))}

          {eventCoords.map((coord, i) => {
            const nodeColor = `var(--node-${coord.log.nodeId.toLowerCase()})`;
            
            return (
              <g key={i}>
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={5}
                  fill={nodeColor}
                  stroke="var(--bg)"
                  strokeWidth="2"
                />
                <text
                  x={coord.x}
                  y={coord.y - 12}
                  fill="var(--text)"
                  fontSize="11"
                  fontFamily="var(--mono)"
                  textAnchor="middle"
                >
                  {coord.log.time}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
