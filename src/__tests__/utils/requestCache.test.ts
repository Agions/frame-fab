/**
 * RequestCache 工具测试
 */

import { RequestCache, withCache } from '@/core/utils/requestCache';

describe('RequestCache', () => {
  let cache: RequestCache;

  beforeEach(() => {
    cache = new RequestCache({ ttl: 1000, maxSize: 3 });
  });

  describe('constructor', () => {
    it('应该使用默认配置', () => {
      const defaultCache = new RequestCache();
      expect(defaultCache.size()).toBe(0);
    });

    it('应该使用自定义配置', () => {
      const customCache = new RequestCache({ ttl: 5000, maxSize: 50 });
      expect(customCache.size()).toBe(0);
    });
  });

  describe('get/set', () => {
    it('应该存储和获取缓存', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('应该返回 null 当键不存在', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('应该返回 null 当缓存过期', () => {
      const shortCache = new RequestCache({ ttl: 50 });
      shortCache.set('key1', 'value1');

      // 使用 fake timers 来模拟时间流逝
      jest.useFakeTimers();
      jest.advanceTimersByTime(100);
      
      expect(shortCache.get('key1')).toBeNull();
      jest.useRealTimers();
    });

    it('应该覆盖已存在的键', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });

    it('应该支持自定义 TTL', () => {
      const shortCache = new RequestCache({ ttl: 5000 });
      shortCache.set('key1', 'value1', 10); // 10ms TTL

      jest.useFakeTimers();
      jest.advanceTimersByTime(20);
      expect(shortCache.get('key1')).toBeNull();
      jest.useRealTimers();
    });
  });

  describe('delete', () => {
    it('应该删除指定键', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
    });

    it('应该返回 false 当键不存在', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('应该清空所有缓存', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe('deleteByPrefix', () => {
    it('应该删除匹配前缀的键', () => {
      cache.set('user:1', 'value1');
      cache.set('user:2', 'value2');
      cache.set('post:1', 'value3');
      cache.deleteByPrefix('user:');
      expect(cache.get('user:1')).toBeNull();
      expect(cache.get('user:2')).toBeNull();
      expect(cache.get('post:1')).toBe('value3');
    });
  });

  describe('size', () => {
    it('应该返回缓存条目数', () => {
      expect(cache.size()).toBe(0);
      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });
  });

  describe('has', () => {
    it('应该检查键是否存在（不检查过期）', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('has 不检查过期状态', () => {
      const shortCache = new RequestCache({ ttl: 50 });
      shortCache.set('key1', 'value1');

      jest.useFakeTimers();
      jest.advanceTimersByTime(100);
      // has 返回 true 因为它不检查过期
      expect(shortCache.has('key1')).toBe(true);
      // get 返回 null 因为它检查过期
      expect(shortCache.get('key1')).toBeNull();
      jest.useRealTimers();
    });
  });

  describe('maxSize eviction', () => {
    it('当超过 maxSize 时应该删除最早的条目', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4'); // 这应该驱逐 key1

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });
  });

  describe('generateKey', () => {
    it('应该生成唯一的键', () => {
      const key1 = cache['generateKey']('a', 1);
      const key2 = cache['generateKey']('a', 1);
      const key3 = cache['generateKey']('a', 2);

      expect(key1).toBe(key2); // 相同参数
      expect(key1).not.toBe(key3); // 不同参数
    });
  });
});

describe('withCache', () => {
  let cache: RequestCache;

  beforeEach(() => {
    cache = new RequestCache({ ttl: 5000 });
  });

  it('应该从缓存返回数据', async () => {
    cache.set('testKey', 'cachedData');
    const fetcher = jest.fn();

    const result = await withCache(cache, 'testKey', fetcher);

    expect(result).toBe('cachedData');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('当缓存不存在时应该调用 fetcher', async () => {
    const fetcher = jest.fn().mockResolvedValue('freshData');

    const result = await withCache(cache, 'newKey', fetcher);

    expect(result).toBe('freshData');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('应该将 fetcher 结果存入缓存', async () => {
    const fetcher = jest.fn().mockResolvedValue('freshData');

    await withCache(cache, 'newKey', fetcher);

    expect(cache.get('newKey')).toBe('freshData');
  });

  it('应该支持自定义 TTL', async () => {
    const shortCache = new RequestCache({ ttl: 5000 });
    const fetcher = jest.fn().mockResolvedValue('data');

    await withCache(shortCache, 'key', fetcher, 10);

    jest.useFakeTimers();
    jest.advanceTimersByTime(20);
    expect(shortCache.get('key')).toBeNull();
    jest.useRealTimers();
  });

  it('应该处理 fetcher 抛出错误', async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error('Network error'));

    await expect(withCache(cache, 'key', fetcher)).rejects.toThrow('Network error');
  });
});