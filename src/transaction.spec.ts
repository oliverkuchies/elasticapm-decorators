import { describe, it, expect, vi, beforeEach } from 'vitest';
import apm, { Transaction } from 'elastic-apm-node';
import { ElasticTransaction } from './transaction';

class TestClass {
  @ElasticTransaction('test-transaction', 'custom')
  async testMethod(val: string) {
    if (val === 'error') throw new Error('Test error');
    return `Hello ${val}`;
  }
}

describe('ElasticTransaction', () => {
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

  it('starts a transaction and returns result', async () => {
    vi.spyOn(apm, 'isStarted').mockReturnValue(true);
    const startTransaction = vi.fn().mockReturnValue({
      setOutcome: vi.fn(),
      addLabels: vi.fn(),
      end: vi.fn(),
    });
    vi.spyOn(apm, 'startTransaction').mockImplementation(startTransaction);
    const result = await instance.testMethod('world');
    expect(result).toBe('Hello world');
    expect(startTransaction).toHaveBeenCalledWith('test-transaction', 'custom');
  });

  it('handles errors and sets transaction outcome', async () => {
    vi.spyOn(apm, 'isStarted').mockReturnValue(true);
    const setOutcome = vi.fn();
    const addLabels = vi.fn();
    const end = vi.fn();
    vi.spyOn(apm, 'startTransaction').mockReturnValue({ setOutcome, addLabels, end } as unknown as Transaction);
    await expect(instance.testMethod('error')).rejects.toThrow('Test error');
    expect(setOutcome).toHaveBeenCalledWith('failure');
    expect(addLabels).toHaveBeenCalled();
    expect(end).toHaveBeenCalled();
  });
});
