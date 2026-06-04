import React, { useState, useMemo } from 'react';
import { NodeCard } from './components/NodeCard';
import { SpaceTimeDiagram } from './components/SpaceTimeDiagram';
import { useNode, LogEntry } from './hooks/useNode';
import './index.css';

const NODES = [
  { id: 'P1', url: import.meta.env.VITE_URL_P1 || 'http://localhost:3001', peers: ['P2', 'P3', 'P4', 'P5', 'P6'], machine: '1' },
  { id: 'P2', url: import.meta.env.VITE_URL_P2 || 'http://localhost:3002', peers: ['P1', 'P3', 'P4', 'P5', 'P6'], machine: '1' },
  { id: 'P3', url: import.meta.env.VITE_URL_P3 || 'http://localhost:3003', peers: ['P1', 'P2', 'P4', 'P5', 'P6'], machine: '1' },
  { id: 'P4', url: import.meta.env.VITE_URL_P4 || 'http://localhost:3004', peers: ['P1', 'P2', 'P3', 'P5', 'P6'], machine: '2' },
  { id: 'P5', url: import.meta.env.VITE_URL_P5 || 'http://localhost:3005', peers: ['P1', 'P2', 'P3', 'P4', 'P6'], machine: '2' },
  { id: 'P6', url: import.meta.env.VITE_URL_P6 || 'http://localhost:3006', peers: ['P1', 'P2', 'P3', 'P4', 'P5'], machine: '2' },
];

const PROCESS_MACHINE: Record<string, string> = {
  P1: '1', P2: '1', P3: '1',
  P4: '2', P5: '2', P6: '2',
};

function isSameMachine(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  return PROCESS_MACHINE[a] === PROCESS_MACHINE[b];
}

function formatLog(e: LogEntry): React.ReactNode {
  const tag = <span className={`log-tag ${e.nodeId.toLowerCase()}`}>{e.nodeId}</span>;
  const t = <span className="log-time">T={e.time ?? '?'}</span>;

  switch (e.type) {
    case 'init':
      return <>{t} {tag} <span className="log-msg">inicializado</span></>;
    case 'internal':
      return <>{t} {tag} <span className="log-msg">tick interno</span></>;
    case 'send': {
      const same = isSameMachine(e.nodeId, e.targetNodeId);
      return (
        <>
          {t} {tag}
          <span className={`log-arrow ${same ? 'intra' : 'inter'}`}>→</span>
          <span className={`log-tag ${e.targetNodeId?.toLowerCase()}`}>{e.targetNodeId}</span>
          <span className={`log-route ${same ? 'intra' : 'inter'}`}>
            {same ? 'intra-nó' : 'inter-nó'}
          </span>
          <span className="log-msg">mensagem enviada</span>
        </>
      );
    }
    case 'receive': {
      const same = isSameMachine(e.nodeId, e.fromNodeId);
      return (
        <>
          {t} {tag}
          <span className={`log-arrow ${same ? 'intra' : 'inter'}`}>←</span>
          <span className={`log-tag ${e.fromNodeId?.toLowerCase()}`}>{e.fromNodeId}</span>
          <span className={`log-route ${same ? 'intra' : 'inter'}`}>
            {same ? 'intra-nó' : 'inter-nó'}
          </span>
          <span className="log-msg">
            recebeu (msg T={e.msgTime}, local era {e.oldTime})
          </span>
        </>
      );
    }
    case 'error':
      return <>{tag} <span className="log-msg" style={{ color: '#ef4444' }}>{e.detail}</span></>;
    default:
      return <>{tag} <span className="log-msg">{JSON.stringify(e)}</span></>;
  }
}

function App() {
  const node1 = useNode(NODES[0].url, NODES[0].id);
  const node2 = useNode(NODES[1].url, NODES[1].id);
  const node3 = useNode(NODES[2].url, NODES[2].id);
  const node4 = useNode(NODES[3].url, NODES[3].id);
  const node5 = useNode(NODES[4].url, NODES[4].id);
  const node6 = useNode(NODES[5].url, NODES[5].id);
  const nodes = [node1, node2, node3, node4, node5, node6];

  const [intervals, setIntervals] = useState(
    NODES.map(() => ({ min: 1.5, max: 4 }))
  );

  const setInterval_ = (idx: number, field: 'min' | 'max', val: number) => {
    setIntervals((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const allLogs = useMemo(() => {
    const merged = nodes.flatMap((n) => n.logs);
    const seen = new Set<string>();
    const unique = merged.filter((l) => {
      const key = `${l.ts}-${l.nodeId}-${l.type}-${l.time}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return unique.sort((a, b) => b.ts - a.ts).slice(0, 80);
  }, [node1.logs, node2.logs, node3.logs, node4.logs, node5.logs, node6.logs]);

  const anyAuto = nodes.some((n) => n.autoMode);

  const handleToggleAll = () => {
    if (anyAuto) {
      nodes.forEach((n) => n.stopAuto());
    } else {
      nodes.forEach((n, i) =>
        n.startAuto(intervals[i].min * 1000, intervals[i].max * 1000)
      );
    }
  };

  const handleToggleOne = (idx: number) => {
    const n = nodes[idx];
    if (n.autoMode) {
      n.stopAuto();
    } else {
      n.startAuto(intervals[idx].min * 1000, intervals[idx].max * 1000);
    }
  };

  const handleResetAll = () => {
    nodes.forEach(n => n.reset());
  };

  const handleResetMachine = (indices: number[]) => {
    indices.forEach(idx => nodes[idx].reset());
  };

  const machine1Indices = [0, 1, 2];
  const machine2Indices = [3, 4, 5];

  return (
    <div className="app">
      <div className="topbar">
        <div>
          <h1>Lamport Clock</h1>
          <span>2 máquinas · 6 processos · TCP · tempo lógico</span>
        </div>
        <button className="btn reset-all-btn" onClick={handleResetAll}>
          Reset All Clocks
        </button>
      </div>

      <div className="auto-bar">
        <span className="auto-label">{anyAuto ? '● Auto ativo' : 'Modo automático'}</span>
        <span>Eventos e mensagens em intervalos aleatórios</span>
        <button className={`toggle ${anyAuto ? 'active' : ''}`} onClick={handleToggleAll} />
      </div>

      <div className="topology-legend">
        <div className="legend-item">
          <span className="legend-dot intra" />
          <span>Comunicação intra-nó (mesma máquina)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot inter" />
          <span>Comunicação inter-nó (máquinas diferentes)</span>
        </div>
      </div>

      <div className="machines">
        <div className="machine-group m1">
          <div className="machine-header">
            <span className="machine-icon">🖥️</span>
            <div className="machine-title-group">
              <span className="machine-title">Máquina 1</span>
            </div>
            <button className="btn reset-machine-btn" onClick={() => handleResetMachine(machine1Indices)}>
              Reset Máquina 1
            </button>
          </div>
          <div className="machine-nodes">
            {machine1Indices.map((i) => (
              <NodeCard
                key={NODES[i].id}
                nodeId={nodes[i].nodeId}
                machineId={NODES[i].machine}
                time={nodes[i].time}
                isConnected={nodes[i].isConnected}
                autoMode={nodes[i].autoMode}
                peers={NODES[i].peers}
                minInterval={intervals[i].min}
                maxInterval={intervals[i].max}
                onMinChange={(v) => setInterval_(i, 'min', v)}
                onMaxChange={(v) => setInterval_(i, 'max', v)}
                onInternal={nodes[i].triggerInternal}
                onSend={nodes[i].sendToPeer}
                onToggleAuto={() => handleToggleOne(i)}
                onReset={() => nodes[i].reset()}
              />
            ))}
          </div>
        </div>

        <div className="machine-connector">
          <div className="connector-line" />
          <span className="connector-label">TCP / rede</span>
          <div className="connector-line" />
        </div>

        <div className="machine-group m2">
          <div className="machine-header">
            <span className="machine-icon">🖥️</span>
            <div className="machine-title-group">
              <span className="machine-title">Máquina 2</span>
            </div>
            <button className="btn reset-machine-btn" onClick={() => handleResetMachine(machine2Indices)}>
              Reset Máquina 2
            </button>
          </div>
          <div className="machine-nodes">
            {machine2Indices.map((i) => (
              <NodeCard
                key={NODES[i].id}
                nodeId={nodes[i].nodeId}
                machineId={NODES[i].machine}
                time={nodes[i].time}
                isConnected={nodes[i].isConnected}
                autoMode={nodes[i].autoMode}
                peers={NODES[i].peers}
                minInterval={intervals[i].min}
                maxInterval={intervals[i].max}
                onMinChange={(v) => setInterval_(i, 'min', v)}
                onMaxChange={(v) => setInterval_(i, 'max', v)}
                onInternal={nodes[i].triggerInternal}
                onSend={nodes[i].sendToPeer}
                onToggleAuto={() => handleToggleOne(i)}
                onReset={() => nodes[i].reset()}
              />
            ))}
          </div>
        </div>
      </div>

      <SpaceTimeDiagram logs={allLogs} />

      <div className="terminal">
        <div className="terminal-bar">
          <div className="terminal-dot" />
          <div className="terminal-dot" />
          <div className="terminal-dot" />
          <span className="terminal-title">event log</span>
        </div>
        <div className="terminal-body">
          {allLogs.length === 0 && (
            <div className="log-line">
              <span className="log-msg">aguardando eventos...</span>
            </div>
          )}
          {allLogs.map((entry, i) => (
            <div className="log-line" key={i}>
              {formatLog(entry)}
            </div>
          ))}
        </div>
      </div>

      <div className="info">
        <strong>Regras de Lamport:</strong>{' '}
        Evento local → <code>C = C + 1</code> ·{' '}
        Envio de mensagem → <code>C = C + 1</code>, carimba <code>(msg, C)</code> ·{' '}
        Recebimento → <code>C = max(C, T_msg) + 1</code>
      </div>
    </div>
  );
}

export default App;
