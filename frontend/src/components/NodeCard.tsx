import React from 'react';

interface Props {
  nodeId: string;
  machineId: string;
  time: number;
  isConnected: boolean;
  autoMode: boolean;
  peers: string[];
  minInterval: number;
  maxInterval: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
  onInternal: () => void;
  onSend: (target: string) => void;
  onToggleAuto: () => void;
  onReset: () => void;
}

export const NodeCard: React.FC<Props> = ({
  nodeId, machineId, time, isConnected, autoMode, peers,
  minInterval, maxInterval, onMinChange, onMaxChange,
  onInternal, onSend, onToggleAuto, onReset,
}) => {
  return (
    <div className="node" data-node={nodeId}>
      <div className="node-top">
        <div className="node-identity">
          <span className="node-name">{nodeId}</span>
          <span className={`machine-badge m${machineId}`}>Máquina {machineId}</span>
        </div>
        <span className={`status ${isConnected ? 'on' : 'off'}`}>
          {isConnected ? 'connected' : 'offline'}
        </span>
      </div>

      <div className="clock">
        <div className="clock-val">{time}</div>
        <div className="clock-lbl">Lamport Clock</div>
      </div>

      <div className="btns">
        <button className="btn" onClick={onInternal}>
          tick <span className="arrow">C + 1</span>
        </button>
        {peers.map((p) => (
          <button key={p} className="btn" onClick={() => onSend(p)}>
            send → {p} <span className="arrow">TCP</span>
          </button>
        ))}
        <button className="btn reset-btn" onClick={onReset}>
          reset <span className="arrow">C = 0</span>
        </button>
      </div>

      <div className="auto-section">
        <div className="auto-header">
          <span className="auto-section-label">auto</span>
          <button className={`toggle small ${autoMode ? 'active' : ''}`} onClick={onToggleAuto} />
        </div>
        <div className="interval-inputs">
          <label>
            <span>min</span>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="30"
              value={minInterval}
              onChange={(e) => onMinChange(parseFloat(e.target.value) || 0.5)}
              disabled={autoMode}
            />
            <span className="unit">s</span>
          </label>
          <label>
            <span>max</span>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="30"
              value={maxInterval}
              onChange={(e) => onMaxChange(parseFloat(e.target.value) || 1)}
              disabled={autoMode}
            />
            <span className="unit">s</span>
          </label>
        </div>
      </div>
    </div>
  );
};
