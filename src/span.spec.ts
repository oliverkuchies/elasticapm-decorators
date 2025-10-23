import { describe, it, expect, vi, beforeEach } from 'vitest';
import apm, { Span } from 'elastic-apm-node';
import { ElasticSpan } from './span';

class TestClass {
  @ElasticSpan('test-span', 'custom', 'sub')
  async testMethod(val: string) {
    if (val === 'error') throw new Error('Test error');
    return `Hello ${val}`;
  }
}

describe('ElasticSpan', () => {
  let instance: TestClass;

  beforeEach(() => {
    instance = new TestClass();
    vi.clearAllMocks();
  });

  it('returns null if apm is not started', async () => {
    vi.spyOn(apm, 'isStarted').mockReturnValue(false);
    const result = await instance.testMethod('world');
    expect(result).toBeNull();
  });

  it('starts a span and returns result', async () => {
    vi.spyOn(apm, 'isStarted').mockReturnValue(true);
    const startSpan = vi.fn().mockReturnValue({
      setOutcome: vi.fn(),
      addLabels: vi.fn(),
      end: vi.fn(),
    });
    vi.spyOn(apm, 'startSpan').mockImplementation(startSpan);
    const result = await instance.testMethod('world');
    expect(result).toBe('Hello world');
    expect(startSpan).toHaveBeenCalledWith('test-span', 'custom', 'sub');
  });

  it('handles errors and sets span outcome', async () => {
    vi.spyOn(apm, 'isStarted').mockReturnValue(true);
    const setOutcome = vi.fn();
    const addLabels = vi.fn();
    const end = vi.fn();
    vi.spyOn(apm, 'startSpan').mockReturnValue({ setOutcome, addLabels, end } as unknown as Span);
    await expect(instance.testMethod('error')).rejects.toThrow('Test error');
    expect(setOutcome).toHaveBeenCalledWith('failure');
    expect(addLabels).toHaveBeenCalled();
    expect(end).toHaveBeenCalled();
  });
});
