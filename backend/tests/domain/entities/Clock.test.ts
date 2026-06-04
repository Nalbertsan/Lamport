import { Clock } from '../../../src/domain/entities/Clock';

describe('Lamport Logical Clock Entity', () => {
  it('should initialize with time 0 and given nodeId', () => {
    const clock = new Clock('A');
    expect(clock.time).toBe(0);
    expect(clock.nodeId).toBe('A');
  });

  it('tick() should increment the time by 1', () => {
    const clock = new Clock('B');
    clock.tick();
    expect(clock.time).toBe(1);
    clock.tick();
    expect(clock.time).toBe(2);
  });

  it('update(receivedTime) should correctly calculate the new time', () => {
    const clock = new Clock('C');
    
    clock.tick(); 
    clock.tick(); 
    expect(clock.time).toBe(2);

    clock.update(5);
    expect(clock.time).toBe(6);

    clock.update(3);
    expect(clock.time).toBe(7);
  });
});
