# Pipeline 引擎

> 9 步流水线的核心调度引擎

## 核心概念

```typescript
export interface PipelineStep {
  readonly stepId: PipelineStepId;
  readonly dependencies: PipelineStepId[];
  execute(input: StepInput, context: PipelineContext): Promise<StepOutput>;
}

export enum PipelineStepId {
  IMPORT = 'import',
  ANALYSIS = 'analysis',
  SCRIPT = 'script',
  CHARACTER = 'character',
  STORYBOARD = 'storyboard',
  RENDER = 'render',
  VIDEO_EDITING = 'video-editing',
  AUDIO_SYNTHESIS = 'audio-synthesis',
  COMPOSITION = 'composition',
}
```

## 执行流程

```typescript
class PipelineEngine {
  async run(input: StepInput): Promise<PipelineResult> {
    for (const step of this.steps) {
      // 1. 检查依赖
      this.checkDependencies(step);
      // 2. 构建上下文
      const context = this.buildContext();
      // 3. 执行步骤（带重试）
      const output = await this.executeWithRetry(step, input, context);
      // 4. 质量门控
      const gateResult = await this.evaluateQualityGate(output);
      if (gateResult === 'fail' && step.retryCount < step.maxRetries) {
        continue; // 重试
      }
      // 5. 保存 Checkpoint
      this.saveCheckpoint(step, output);
    }
  }
}
```

## 步骤生命周期

```
步骤开始
   ↓
onProgress 回调 → UI 更新
   ↓
构建 StepInput（含 Symbol-keyed Context）
   ↓
执行 step.execute()
   ↓
异常处理 → 重试（指数退避）
   ↓
Quality Gate 评分
   ↓
保存 Checkpoint（30s 间隔）
   ↓
步骤完成
```

## 质量门控 + 自修复

```typescript
// Quality Gate 维度
const qualityGate = {
  characterConsistency: { threshold: 0.85, weight: 0.3 },
  visualQuality: { threshold: 0.8, weight: 0.3 },
  scriptAlignment: { threshold: 0.9, weight: 0.2 },
  completeness: { threshold: 1.0, weight: 0.2 },
};

// Self-Review Loop
async function selfReview(step, input, context, retryCount = 0) {
  const output = await step.execute(input, context);
  const score = await evaluateQualityGate(output);
  if (score < threshold && retryCount < 3) {
    const optimizedPrompt = await optimizePrompt(step.failureReason);
    return selfReview(step, { ...input, prompt: optimizedPrompt }, context, retryCount + 1);
  }
  return output;
}
```

[下一步：AI Provider →](/developer-guide/ai-providers)
