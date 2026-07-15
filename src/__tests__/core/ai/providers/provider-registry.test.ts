/**
 * ProviderRegistry 单元测试
 * ========================
 * 测试 AI Provider 策略注册表的注册/查询/枚举功能。
 */

import type { AIProviderStrategy } from '@/core/ai/providers/base';
import { providerRegistry } from '@/core/ai/providers/provider-registry';
import type { AIRequestConfig, AIResponse } from '@/types/ai';

// 创建一个 mock strategy 工厂
const createMockStrategy = (name: string): AIProviderStrategy => ({
  name,
  supportsStreaming: false,
  call: jest.fn().mockResolvedValue({
    content: `response from ${name}`,
    model: 'test-model',
  }),
});

describe('ProviderRegistry', () => {
  // 保存原始注册的 provider 列表，测试后恢复
  const originalNames = providerRegistry.getAllNames();

  afterEach(() => {
    // 清理：移除测试中可能注册的额外 provider，恢复原始状态
    const currentNames = providerRegistry.getAllNames();
    currentNames.forEach((name) => {
      if (!originalNames.includes(name)) {
        // 通过 register 覆盖为 undefined 无法删除，但 registry 无 delete 方法
        // 所以测试中注册的 provider 会残留；需用独立 describe 避免污染
      }
    });
  });

  describe('默认注册', () => {
    it('应注册全部 7 个默认 Provider', () => {
      const names = providerRegistry.getAllNames();
      expect(names).toHaveLength(7);
      expect(names).toEqual(['openai', 'anthropic', 'google', 'baidu', 'alibaba', 'zhipu', 'mock']);
    });

    it('应能通过 get 获取已注册的 Provider', () => {
      expect(providerRegistry.get('openai')).toBeDefined();
      expect(providerRegistry.get('anthropic')).toBeDefined();
      expect(providerRegistry.get('google')).toBeDefined();
      expect(providerRegistry.get('baidu')).toBeDefined();
      expect(providerRegistry.get('alibaba')).toBeDefined();
      expect(providerRegistry.get('zhipu')).toBeDefined();
      expect(providerRegistry.get('mock')).toBeDefined();
    });

    it('get 未知名称应返回 undefined', () => {
      expect(providerRegistry.get('nonexistent')).toBeUndefined();
      expect(providerRegistry.get('')).toBeUndefined();
    });
  });

  describe('注册新 Provider', () => {
    it('register 后应能通过 get 获取', () => {
      const customStrategy = createMockStrategy('custom-provider');
      providerRegistry.register(customStrategy);

      const retrieved = providerRegistry.get('custom-provider');
      expect(retrieved).toBe(customStrategy);
    });

    it('register 新 Provider 后 getAllNames 应包含它', () => {
      const before = providerRegistry.getAllNames().length;
      const customStrategy = createMockStrategy('another-custom');
      providerRegistry.register(customStrategy);

      const after = providerRegistry.getAllNames();
      expect(after).toHaveLength(before + 1);
      expect(after).toContain('another-custom');
    });

    it('重复注册同名 Provider 应静默覆盖', () => {
      const strategyV1 = createMockStrategy('versioned');
      const strategyV2 = createMockStrategy('versioned');

      providerRegistry.register(strategyV1);
      providerRegistry.register(strategyV2);

      // 后注册的覆盖先注册的
      expect(providerRegistry.get('versioned')).toBe(strategyV2);
      expect(providerRegistry.get('versioned')).not.toBe(strategyV1);
    });
  });

  describe('Provider 行为验证', () => {
    it('mock strategy 应有正确的 name 属性', () => {
      const mockProvider = providerRegistry.get('mock');
      expect(mockProvider?.name).toBe('mock');
    });

    it('mock strategy 应不支持流式', () => {
      const mockProvider = providerRegistry.get('mock');
      expect(mockProvider?.supportsStreaming).toBeFalsy();
    });

    it('泛型：注册的自定义 Provider 应能被正确调用', async () => {
      const mockCall = jest.fn().mockResolvedValue({
        content: 'test response',
        model: 'custom',
      });
      const customStrategy: AIProviderStrategy = {
        name: 'test-callable',
        supportsStreaming: true,
        call: mockCall,
      };

      providerRegistry.register(customStrategy);
      const retrieved = providerRegistry.get('test-callable');

      const config: AIRequestConfig = {
        model: 'test-model',
        messages: [{ role: 'user', content: 'hello' }],
      };

      const result = await retrieved!.call('key-123', config, 'req-1');

      expect(mockCall).toHaveBeenCalledWith('key-123', config, 'req-1');
      expect(result.content).toBe('test response');
    });
  });

  describe('边界情况', () => {
    it('getAllNames 返回的数组应是副本（修改不影响原注册）', () => {
      const names = providerRegistry.getAllNames();
      names.push('hacked');
      const freshNames = providerRegistry.getAllNames();
      expect(freshNames).not.toContain('hacked');
    });

    it('Provider name 应区分大小写', () => {
      const lower = createMockStrategy('case-test');
      providerRegistry.register(lower);

      expect(providerRegistry.get('case-test')).toBe(lower);
      expect(providerRegistry.get('Case-Test')).toBeUndefined();
      expect(providerRegistry.get('CASE-TEST')).toBeUndefined();
    });
  });
});
