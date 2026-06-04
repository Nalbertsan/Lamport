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
    
    // Simula eventos locais
    clock.tick(); 
    clock.tick(); 
    expect(clock.time).toBe(2);

    // Recebe uma mensagem com tempo maior
    clock.update(5);
    expect(clock.time).toBe(6); // max(2, 5) + 1 = 6

    // Recebe uma mensagem com tempo menor
    clock.update(3);
    expect(clock.time).toBe(7); // max(6, 3) + 1 = 7
  });
});
