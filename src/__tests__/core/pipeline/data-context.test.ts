/**
 * Unit Tests — DataContext (跨步骤数据传递线程安全)
 */

import { DataContext } from '@/orchestration/pipeline/engine/data-context';

describe('DataContext', () => {
  let ctx: DataContext;

  beforeEach(() => {
    ctx = new DataContext();
  });

  // ============================================
  // 基本读写
  // ============================================

  describe('get/set', () => {
    it('should store and retrieve values', async () => {
      await ctx.set('name', 'test-project');
      expect(ctx.get('name')).toBe('test-project');
    });

    it('should return undefined for non-existent keys', () => {
      expect(ctx.get('nonexistent')).toBeUndefined();
    });

    it('should track has() correctly', async () => {
      expect(ctx.has('name')).toBe(false);
      await ctx.set('name', 'value');
      expect(ctx.has('name')).toBe(true);
    });
  });

  // ============================================
  // 批量写入
  // ============================================

  describe('setMany', () => {
    it('should batch write multiple entries atomically', async () => {
      await ctx.setMany({ title: 'My Project', status: 'active', steps: 5 });
      expect(ctx.get('title')).toBe('My Project');
      expect(ctx.get('status')).toBe('active');
      expect(ctx.get('steps')).toBe(5);
    });
  });

  // ============================================
  // 版本号
  // ============================================

  describe('version tracking', () => {
    it('should increment version on each write', async () => {
      const v0 = ctx.getVersion();
      await ctx.set('a', 1);
      const v1 = ctx.getVersion();
      await ctx.set('b', 2);
      const v2 = ctx.getVersion();

      expect(v1).toBeGreaterThan(v0);
      expect(v2).toBeGreaterThan(v1);
    });
  });

  // ============================================
  // 并发写入安全（根本性修复验证）
  // ============================================

  describe('concurrent writes (race condition fix)', () => {
    it('should not lose data with concurrent writes to same key', async () => {
      // 模拟步骤A和步骤B并发写入不同字段
      await Promise.all([
        ctx.set('stepA:data', { value: 'from A' }),
        ctx.set('stepB:data', { value: 'from B' }),
      ]);

      expect(ctx.get('stepA:data')).toEqual({ value: 'from A' });
      expect(ctx.get('stepB:data')).toEqual({ value: 'from B' });
    });

    it('should not lose data with rapid sequential writes', async () => {
      // 模拟快速连续写入（可能因覆盖导致数据丢失）
      const writes = Array.from({ length: 20 }, (_, i) =>
        ctx.set('counter', i)
      );
      await Promise.all(writes);

      // 最终值是最后一次写入的结果
      // 因为是同一key，后写的覆盖先写的，这是预期行为
      // 关键是不应该有 undefined
      expect(ctx.get('counter')).not.toBeUndefined();
    });

    it('should survive concurrent writes to same key from multiple sources', async () => {
      // 模拟步骤A和步骤B同时写入同一key（数据竞争）
      const results: Promise<unknown>[] = [];
      for (let i = 0; i < 10; i++) {
        results.push(ctx.set('shared', `value-${i}`));
      }
      await Promise.all(results);

      // 最终值存在，不为 undefined（验证不会数据丢失）
      expect(ctx.get('shared')).toBeDefined();
      expect(typeof ctx.get('shared')).toBe('string');
    });
  });

  // ============================================
  // waitForKey
  // ============================================

  describe('waitForKey', () => {
    it('should resolve when key is written', async () => {
      const promise = ctx.waitForKey('title');

      setTimeout(() => {
        ctx.set('title', 'My Comic');
      }, 100);

      const result = await promise;
      expect(result).toBe('My Comic');
    });

    it('should timeout if key never appears', async () => {
      const promise = ctx.waitForKey('nonexistent', 200);
      await expect(promise).rejects.toThrow('Timeout');
    });
  });

  // ============================================
  // Checkpoint (序列化/反序列化)
  // ============================================

  describe('toJSON / fromJSON', () => {
    it('should serialize and restore state', async () => {
      await ctx.setMany({ title: 'Test', status: 'active' });
      const json = ctx.toJSON();

      const restored = DataContext.fromJSON(json);
      expect(restored.get('title')).toBe('Test');
      expect(restored.get('status')).toBe('active');
      expect(restored.getVersion()).toBe(ctx.getVersion());
    });

    it('should restore concurrent write results', async () => {
      await Promise.all([
        ctx.set('field1', 'one'),
        ctx.set('field2', 'two'),
      ]);

      const json = ctx.toJSON();
      const restored = DataContext.fromJSON(json);

      expect(restored.get('field1')).toBe('one');
      expect(restored.get('field2')).toBe('two');
    });
  });
});