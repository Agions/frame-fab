import { saveCheckpoint, loadCheckpoint, clearCheckpoint } from '../../core/pipeline/checkpoint';

describe('Checkpoint', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load checkpoint', async () => {
    await saveCheckpoint('step1', { data: 'test' });
    const result = await loadCheckpoint('step1');
    expect(result).not.toBeNull();
    expect(result!.data).toEqual({ data: 'test' });
    expect(result!.completed).toBe(true);
  });

  it('should return null for non-existent checkpoint', async () => {
    const result = await loadCheckpoint('nonexistent');
    expect(result).toBeNull();
  });

  it('should clear checkpoint', async () => {
    await saveCheckpoint('step1', { data: 'test' });
    await clearCheckpoint('step1');
    const result = await loadCheckpoint('step1');
    expect(result).toBeNull();
  });
});
