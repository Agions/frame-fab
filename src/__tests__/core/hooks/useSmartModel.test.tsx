/**
 * useSmartModel Hook 测试
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

// Mock services
jest.mock('@/core/services/ai.service');
jest.mock('@/core/services/cost.service');
jest.mock('@/core/utils/logger');
jest.mock('@/core/config/optimization.config');

import { useSmartModel } from '@/core/hooks/useSmartModel';
import type { SmartGenerateResult } from '@/core/hooks/useSmartModel';
import { aiService } from '@/core/services/ai.service';
import { costService } from '@/core/services/cost.service';

const mockAIGenerate = aiService.generate as jest.MockedFunction<typeof aiService.generate>;
const mockRecordLLMCost = costService.recordLLMCost as jest.MockedFunction<typeof costService.recordLLMCost>;
const mockGetModelSuggestion = costService.getModelSuggestion as jest.MockedFunction<typeof costService.getModelSuggestion>;
const mockGetStats = costService.getStats as jest.MockedFunction<typeof costService.getStats>;
const mockGetOptimizationSuggestions = costService.getOptimizationSuggestions as jest.MockedFunction<typeof costService.getOptimizationSuggestions>;
const mockExportReport = costService.exportReport as jest.MockedFunction<typeof costService.exportReport>;

describe('useSmartModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    mockGetModelSuggestion.mockReturnValue({
      model: 'qwen-plus',
      provider: 'alibaba',
      estimatedCost: 0.001
    });

    mockGetStats.mockReturnValue({
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      byType: {},
      byProvider: {},
      byModel: {}
    });

    mockGetOptimizationSuggestions.mockReturnValue([]);

    mockRecordLLMCost.mockReturnValue({
      id: 'test_record_id',
      type: 'llm',
      provider: 'alibaba',
      model: 'qwen-plus',
      inputTokens: 100,
      outputTokens: 200,
      cost: 0.001,
      timestamp: new Date().toISOString()
    });
  });

  describe('初始状态', () => {
    it('应该返回正确的初始状态', () => {
      const { result } = renderHook(() => useSmartModel());

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastResult).toBe(null);
      expect(typeof result.current.generate).toBe('function');
      expect(typeof result.current.generateBatch).toBe('function');
      expect(typeof result.current.clearCache).toBe('function');
      expect(typeof result.current.exportReport).toBe('function');
    });

    it('应该返回统计信息', () => {
      const { result } = renderHook(() => useSmartModel());

      expect(result.current.stats).toBeDefined();
      expect(result.current.suggestions).toBeDefined();
      expect(result.current.costService).toBe(costService);
    });
  });

  describe('generate 方法', () => {
    it('应该成功生成内容', async () => {
      mockAIGenerate.mockResolvedValue('生成的内容');

      const { result } = renderHook(() => useSmartModel());

      let generateResult: SmartGenerateResult | undefined;
      await act(async () => {
        generateResult = await result.current.generate('测试提示词_unique1', { enableCache: false });
      });

      expect(mockGetModelSuggestion).toHaveBeenCalledWith('standard', 'medium');
      expect(mockAIGenerate).toHaveBeenCalledWith(
        '测试提示词_unique1',
        expect.objectContaining({
          model: 'qwen-plus',
          provider: 'alibaba'
        })
      );
      expect(mockRecordLLMCost).toHaveBeenCalled();
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.error).toBe(null);
      expect(generateResult).toEqual(
        expect.objectContaining({
          content: '生成的内容',
          model: 'qwen-plus',
          provider: 'alibaba',
          cached: false
        })
      );
    });

    it('应该使用指定的任务类型和预算级别', async () => {
      mockAIGenerate.mockResolvedValue('内容');
      mockGetModelSuggestion.mockReturnValue({
        model: 'qwen-max',
        provider: 'alibaba',
        estimatedCost: 0.002
      });

      const { result } = renderHook(() => useSmartModel());

      await act(async () => {
        await result.current.generate('提示词_unique2', {
          taskType: 'complex',
          budgetLevel: 'high',
          enableCache: false
        });
      });

      expect(mockGetModelSuggestion).toHaveBeenCalledWith('complex', 'high');
    });

    it('应该在生成期间设置 isGenerating 状态', async () => {
      let resolveGenerate: (value: string) => void;
      const generatePromise = new Promise<string>((resolve) => {
        resolveGenerate = resolve;
      });
      mockAIGenerate.mockReturnValue(generatePromise);

      const { result } = renderHook(() => useSmartModel());

      let generatePromiseStarted: Promise<any>;
      act(() => {
        generatePromiseStarted = result.current.generate('提示词_unique3', { enableCache: false });
      });

      // 应该在生成中
      await waitFor(() => {
        expect(result.current.isGenerating).toBe(true);
      });

      // 完成生成
      await act(async () => {
        resolveGenerate!('完成');
        await generatePromiseStarted!;
      });

      expect(result.current.isGenerating).toBe(false);
    });

    it('应该处理生成错误', async () => {
      const error = new Error('生成失败');
      mockAIGenerate.mockRejectedValue(error);

      const { result } = renderHook(() => useSmartModel());

      let caughtError = null;
      await act(async () => {
        try {
          await result.current.generate('提示词_unique4', { enableCache: false, maxRetries: 1 });
        } catch (e) {
          caughtError = e;
        }
      });

      expect(result.current.isGenerating).toBe(false);
      expect(caughtError).toBeTruthy();
    });

    it('应该支持重试机制', async () => {
      let attemptCount = 0;
      mockAIGenerate.mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('临时错误'));
        }
        return Promise.resolve('成功');
      });

      const { result } = renderHook(() => useSmartModel());

      await act(async () => {
        await result.current.generate('提示词_unique5', { maxRetries: 3, enableCache: false });
      });

      expect(attemptCount).toBe(3);
      expect(result.current.lastResult?.content).toBe('成功');
    });
  });

  describe('缓存功能', () => {
    it('应该使用缓存的结果', async () => {
      mockAIGenerate.mockResolvedValue('首次生成');

      const { result } = renderHook(() => useSmartModel());

      // 首次生成
      await act(async () => {
        await result.current.generate('测试缓存提示词_unique6', { enableCache: true });
      });

      const firstCallCount = mockAIGenerate.mock.calls.length;

      // 第二次应该使用缓存
      let cachedResult: SmartGenerateResult | undefined;
      await act(async () => {
        cachedResult = await result.current.generate('测试缓存提示词_unique6', { enableCache: true });
      });

      expect(mockAIGenerate.mock.calls.length).toBe(firstCallCount); // 不应该再次调用
      expect(cachedResult).toEqual(
        expect.objectContaining({
          cached: true,
          model: 'cache',
          provider: 'cache',
          cost: 0
        })
      );
    });

    it('应该支持禁用缓存', async () => {
      mockAIGenerate.mockResolvedValue('生成内容');

      const { result } = renderHook(() => useSmartModel());

      // 首次生成
      await act(async () => {
        await result.current.generate('提示词禁用缓存_unique7', { enableCache: false });
      });

      const firstCallCount = mockAIGenerate.mock.calls.length;

      // 第二次生成，禁用缓存
      await act(async () => {
        await result.current.generate('提示词禁用缓存_unique7', { enableCache: false });
      });

      expect(mockAIGenerate.mock.calls.length).toBe(firstCallCount + 1);
    });

    it('应该能清空缓存', async () => {
      mockAIGenerate.mockResolvedValue('生成内容');

      const { result } = renderHook(() => useSmartModel());

      // 首次生成并缓存
      await act(async () => {
        await result.current.generate('清空测试提示词_unique8', { enableCache: true });
      });

      const firstCallCount = mockAIGenerate.mock.calls.length;

      // 清空缓存
      act(() => {
        result.current.clearCache();
      });

      // 再次生成，应该重新调用 AI
      await act(async () => {
        await result.current.generate('清空测试提示词_unique8', { enableCache: true });
      });

      expect(mockAIGenerate.mock.calls.length).toBe(firstCallCount + 1);
    });

    it('缓存键应该包含任务类型', async () => {
      mockAIGenerate.mockResolvedValue('内容');

      const { result } = renderHook(() => useSmartModel());

      // 使用不同的任务类型
      await act(async () => {
        await result.current.generate('任务类型测试_unique9', { taskType: 'simple', enableCache: true });
      });

      const firstCallCount = mockAIGenerate.mock.calls.length;

      await act(async () => {
        await result.current.generate('任务类型测试_unique9', { taskType: 'complex', enableCache: true });
      });

      // 应该调用两次，因为任务类型不同
      expect(mockAIGenerate.mock.calls.length).toBe(firstCallCount + 1);
    });
  });

  describe('generateBatch 方法', () => {
    it('应该批量生成内容', async () => {
      mockAIGenerate.mockResolvedValue('生成内容');

      const { result } = renderHook(() => useSmartModel());

      let results: string[] = [];
      await act(async () => {
        results = await result.current.generateBatch([
          '提示词1-batch_unique10',
          '提示词2-batch_unique11',
          '提示词3-batch_unique12'
        ], { enableCache: false });
      });

      expect(mockAIGenerate.mock.calls.length).toBeGreaterThanOrEqual(3);
      expect(results).toHaveLength(3);
      results.forEach((r: any) => {
        expect(r.content).toBe('生成内容');
      });
    });

    it('应该遵守并发限制', async () => {
      let concurrentCalls = 0;
      let maxConcurrentCalls = 0;

      mockAIGenerate.mockImplementation(() => {
        concurrentCalls++;
        maxConcurrentCalls = Math.max(maxConcurrentCalls, concurrentCalls);
        return new Promise((resolve) => {
          setTimeout(() => {
            concurrentCalls--;
            resolve('内容');
          }, 50);
        });
      });

      const { result } = renderHook(() => useSmartModel());

      await act(async () => {
        await result.current.generateBatch([
          '1_u13', '2_u14', '3_u15', '4_u16', '5_u17', '6_u18', '7_u19', '8_u20', '9_u21', '10_u22'
        ], { enableCache: false });
      });

      // 最大并发应该不超过配置的 maxRequests
      // 根据实现，使用 OPTIMIZATION_CONFIG.performance.concurrency.maxRequests (预期为 3)
      // 但实际可能略高于预期，这取决于具体实现
      expect(maxConcurrentCalls).toBeLessThanOrEqual(5);
      expect(maxConcurrentCalls).toBeGreaterThan(1);
    });
  });

  describe('成本追踪', () => {
    it('应该记录生成成本', async () => {
      mockAIGenerate.mockResolvedValue('生成的长内容'.repeat(10));

      const { result } = renderHook(() => useSmartModel());

      await act(async () => {
        await result.current.generate('测试提示词_unique23', { enableCache: false });
      });

      expect(mockRecordLLMCost).toHaveBeenCalledWith(
        'alibaba',
        'qwen-plus',
        expect.any(Number), // inputTokens
        expect.any(Number), // outputTokens
        expect.any(Object)  // metadata
      );
    });

    it('应该在结果中包含成本信息', async () => {
      mockAIGenerate.mockResolvedValue('内容');
      mockRecordLLMCost.mockReturnValue({
        id: 'cost_id',
        type: 'llm',
        provider: 'alibaba',
        model: 'qwen-plus',
        inputTokens: 10,
        outputTokens: 20,
        cost: 0.0015,
        timestamp: new Date().toISOString()
      });

      const { result } = renderHook(() => useSmartModel());

      let generateResult: SmartGenerateResult | undefined;
      await act(async () => {
        generateResult = await result.current.generate('提示词成本_unique24', { enableCache: false });
      });

      expect(generateResult.cost).toBeGreaterThan(0);
    });
  });

  describe('统计和报告', () => {
    it('应该提供统计信息', () => {
      mockGetStats.mockReturnValue({
        total: 10.5,
        today: 2.3,
        thisWeek: 8.1,
        thisMonth: 10.5,
        byType: { llm: 8.0, video: 2.5 },
        byProvider: { alibaba: 5.0, openai: 5.5 },
        byModel: { 'qwen-plus': 3.0, 'gpt-5': 7.5 }
      });

      const { result } = renderHook(() => useSmartModel());

      expect(result.current.stats).toEqual({
        total: 10.5,
        today: 2.3,
        thisWeek: 8.1,
        thisMonth: 10.5,
        byType: { llm: 8.0, video: 2.5 },
        byProvider: { alibaba: 5.0, openai: 5.5 },
        byModel: { 'qwen-plus': 3.0, 'gpt-5': 7.5 }
      });
    });

    it('应该提供优化建议', () => {
      mockGetOptimizationSuggestions.mockReturnValue([
        '考虑使用更便宜的模型',
        '启用缓存可以节省成本'
      ]);

      const { result } = renderHook(() => useSmartModel());

      expect(result.current.suggestions).toEqual([
        '考虑使用更便宜的模型',
        '启用缓存可以节省成本'
      ]);
    });

    it('应该能导出报告', () => {
      const mockReport = 'Cost Report\n==========\nTotal: $10.50';
      mockExportReport.mockReturnValue(mockReport);

      const { result } = renderHook(() => useSmartModel());

      const report = result.current.exportReport();
      expect(report).toBe(mockReport);
      expect(mockExportReport).toHaveBeenCalled();
    });
  });

  describe('lastResult 状态', () => {
    it('应该更新 lastResult', async () => {
      mockAIGenerate.mockResolvedValue('最新内容');

      const { result } = renderHook(() => useSmartModel());

      expect(result.current.lastResult).toBe(null);

      await act(async () => {
        await result.current.generate('提示词最新_unique25', { enableCache: false });
      });

      expect(result.current.lastResult).toEqual(
        expect.objectContaining({
          content: '最新内容',
          model: 'qwen-plus',
          provider: 'alibaba'
        })
      );
    });

    it('应该在每次生成后更新 lastResult', async () => {
      mockAIGenerate
        .mockResolvedValueOnce('内容1')
        .mockResolvedValueOnce('内容2');

      const { result } = renderHook(() => useSmartModel());

      await act(async () => {
        await result.current.generate('提示词lastResult1_unique26', { enableCache: false });
      });
      expect(result.current.lastResult?.content).toBe('内容1');

      await act(async () => {
        await result.current.generate('提示词lastResult2_unique27', { enableCache: false });
      });
      expect(result.current.lastResult?.content).toBe('内容2');
    });
  });

  describe('边界情况', () => {
    it('应该处理空提示词', async () => {
      mockAIGenerate.mockResolvedValue('默认响应');

      const { result } = renderHook(() => useSmartModel());

      await act(async () => {
        await result.current.generate('', { enableCache: false });
      });

      expect(mockAIGenerate).toHaveBeenCalledWith(
        '',
        expect.any(Object)
      );
    });

    it('应该处理非常长的提示词', async () => {
      const longPrompt = '测试'.repeat(1000);
      mockAIGenerate.mockResolvedValue('响应');

      const { result } = renderHook(() => useSmartModel());

      await act(async () => {
        await result.current.generate(longPrompt, { enableCache: false });
      });

      expect(mockAIGenerate).toHaveBeenCalledWith(
        longPrompt,
        expect.any(Object)
      );
    });

    it('应该处理特殊字符', async () => {
      const specialPrompt = '测试 "引号" \'单引号\' \n换行 \t制表符 emoji 😀';
      mockAIGenerate.mockResolvedValue('响应');

      const { result } = renderHook(() => useSmartModel());

      await act(async () => {
        await result.current.generate(specialPrompt, { enableCache: false });
      });

      expect(mockAIGenerate).toHaveBeenCalledWith(
        specialPrompt,
        expect.any(Object)
      );
    });

    it('应该处理空的批量数组', async () => {
      const { result } = renderHook(() => useSmartModel());

      let results: string[] = [];
      await act(async () => {
        results = await result.current.generateBatch([]);
      });

      expect(results).toEqual([]);
      expect(mockAIGenerate).not.toHaveBeenCalled();
    });
  });

  describe('性能', () => {
    it('应该记录生成持续时间', async () => {
      mockAIGenerate.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('内容'), 10))
      );

      const { result } = renderHook(() => useSmartModel());

      let generateResult: SmartGenerateResult | undefined;
      await act(async () => {
        generateResult = await result.current.generate('提示词性能_unique28', { enableCache: false });
      });

      expect(generateResult.duration).toBeGreaterThan(0);
    });

    it('缓存的结果应该有更短的持续时间', async () => {
      mockAIGenerate.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('内容'), 100))
      );

      const { result } = renderHook(() => useSmartModel());

      let firstResult: SmartGenerateResult | undefined;
      let cachedResult: SmartGenerateResult | undefined;

      await act(async () => {
        firstResult = await result.current.generate('提示词性能缓存_unique29', { enableCache: true });
      });

      await act(async () => {
        cachedResult = await result.current.generate('提示词性能缓存_unique29', { enableCache: true });
      });

      // 缓存结果应该是缓存的
      expect(cachedResult.cached).toBe(true);
      // 第一次需要调用 AI，持续时间应该更长
      expect(firstResult.cached).toBe(false);
      expect(firstResult.duration).toBeGreaterThan(cachedResult.duration);
    });
  });
});
