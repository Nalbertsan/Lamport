export class Clock {
  private _time: number;
  private readonly _nodeId: string;

  constructor(nodeId: string, initialTime: number = 0) {
    this._nodeId = nodeId;
    this._time = initialTime;
  }

  get time(): number {
    return this._time;
  }

  get nodeId(): string {
    return this._nodeId;
  }

  tick(): void {
    this._time += 1;
  }

  reset(): void {
    this._time = 0;
  }

  update(receivedTime: number): void {
    this._time = Math.max(this._time, receivedTime) + 1;
  }
}
