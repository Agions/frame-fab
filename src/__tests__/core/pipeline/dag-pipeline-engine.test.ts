/**
 * Integration Tests — DAGPipelineEngine (完整流水线)
 */

import { DAGPipelineEngine } from '@/orchestration/pipeline/engine/dag-pipeline-engine';
import { PluginHost } from '@/plugins/plugin-host';
import { eventBus } from '@/infrastructure/queue/event-bus';
import { CheckpointManager } from '@/orchestration/pipeline/engine/checkpoint-manager';
import type { IPipelineStep, PipelineContext } from '@/orchestration/pipeline/engine/step.interface';
import { StepStatus } from '@/orchestration/pipeline/engine/step.interface';

// ============================================
// Mock Steps
// ============================================

function makeMockStep(
  id: string,
  executionMode: 'sequential' | 'parallel' = 'sequential'
): IPipelineStep {
  return {
    id,
    name: id,
    stepType: 'mock',
    executionMode,
    dependencies: [],
    retryPolicy: { maxRetries: 0 },
    enableCheckpoint: false,
    async execute() {
      return {
        stepId: id,
        status: StepStatus.COMPLETED,
        data: { result: id + '-result' },
        metrics: { durationMs: 10 },
      };
    },
    canResume: () => false,
  };
}

// ============================================
// Tests
// ============================================

describe('DAGPipelineEngine', () => {
  let engine: DAGPipelineEngine;
  let pluginHost: PluginHost;
  let checkpointManager: CheckpointManager;

  beforeEach(() => {
    pluginHost = new PluginHost();
    checkpointManager = new CheckpointManager();
    engine = new DAGPipelineEngine({
      projectId: 'test-project',
      pluginHost,
      eventBus,
      checkpointManager,
    });
  });

  describe('basic execution', () => {
    it('should execute a single step', async () => {
      const step = makeMockStep('step1');
      engine.addStep(step);

      const result = await engine.execute();

      expect(result.status).toBe('completed');
      expect(result.completedSteps).toBe(1);
      expect(result.results.get('step1')).toBeDefined();
    });

    it('should execute multiple sequential steps in order', async () => {
      const executionOrder: string[] = [];

      const step1 = {
        ...makeMockStep('step1'),
        async execute() {
          executionOrder.push('step1');
          return { stepId: 'step1', status: StepStatus.COMPLETED, data: {}, metrics: { durationMs: 10 } };
        },
      };
      const step2 = {
        ...makeMockStep('step2'),
        dependencies: ['step1'],
        async execute() {
          executionOrder.push('step2');
          return { stepId: 'step2', status: StepStatus.COMPLETED, data: {}, metrics: { durationMs: 10 } };
        },
      };

      engine.addStep(step1);
      engine.addStep(step2);

      const result = await engine.execute();

      expect(result.status).toBe('completed');
      expect(executionOrder).toEqual(['step1', 'step2']);
    });
  });

  describe('parallel execution', () => {
    it('should execute steps with same depth in parallel', async () => {
      let step1Done = false;
      let step2Done = false;

      const step1 = {
        ...makeMockStep('step1', 'parallel'),
        async execute() {
          await new Promise((r) => setTimeout(r, 50));
          step1Done = true;
          return { stepId: 'step1', status: StepStatus.COMPLETED, data: {}, metrics: { durationMs: 50 } };
        },
      };
      const step2 = {
        ...makeMockStep('step2', 'parallel'),
        async execute() {
          await new Promise((r) => setTimeout(r, 50));
          step2Done = true;
          return { stepId: 'step2', status: StepStatus.COMPLETED, data: {}, metrics: { durationMs: 50 } };
        },
      };
      const step3 = {
        ...makeMockStep('step3'),
        dependencies: ['step1', 'step2'],
        async execute() {
          return { stepId: 'step3', status: StepStatus.COMPLETED, data: {}, metrics: { durationMs: 10 } };
        },
      };

      engine.addStep(step1);
      engine.addStep(step2);
      engine.addStep(step3);

      const start = Date.now();
      await engine.execute();
      const duration = Date.now() - start;

      // 如果串行，step1(50) + step2(50) + step3(10) = 110ms
      // 如果并行，max(50, 50) + step3(10) = 60ms
      expect(duration).toBeLessThan(90);
      expect(step1Done).toBe(true);
      expect(step2Done).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should mark step as failed and propagate error', async () => {
      const failingStep: IPipelineStep = {
        ...makeMockStep('failing'),
        async execute() {
          throw new Error('AI generation timeout');
        },
      };

      engine.addStep(failingStep);

      const result = await engine.execute();

      expect(result.status).toBe('failed');
      expect(result.failedSteps).toContain('failing');
      expect(result.errors.size).toBeGreaterThan(0);
    });
  });

  describe('cancel', () => {
    it('should cancel running pipeline', async () => {
      const longStep: IPipelineStep = {
        ...makeMockStep('long-step'),
        async execute() {
          await new Promise((r) => setTimeout(r, 10000));
          return { stepId: 'long-step', status: StepStatus.COMPLETED, data: {}, metrics: { durationMs: 10000 } };
        },
        canResume: () => false,
        pause: async () => {},
        resume: () => {},
        cancel: () => {},
      };

      engine.addStep(longStep);

      const execPromise = engine.execute();
      engine.cancel();

      const result = await execPromise;

      expect(result.status).toBe('cancelled');
    });
  });
});