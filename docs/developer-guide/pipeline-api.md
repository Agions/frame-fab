# Pipeline API

## 核心类型

### StepChain

`StepChain` 是流水线中的最小责任单元，代表一个可独立执行、可复用的处理步骤。

```typescript
interface StepChain {
  id: string;
  stepId: PipelineStepId;
  name: string;
  phase: StepPhase; // PRE | EXEC | POST
  direction: ChainDirection; // FORWARD | BRANCH | ROLLBACK

  /** 前置校验（可选）：返回 true 继续，false 跳过，抛 Error 中断 */
  preCondition?: PreCondition;

  /** 主执行器（必需） */
  executor: StepExecutor;

  /** 后置处理器（可选）：无论主执行成功/失败都调用 */
  postHandler?: PostHandler;

  /** 条件分支选择器（DAG 模式） */
  branchSelector?: BranchSelector;

  /** 并行分组键（用于 PARALLEL 模式） */
  parallelKeys?: string[];

  /** 最大重试次数（默认 0） */
  maxRetries: number;

  /** 重试间隔（ms，默认 1000） */
  retryDelayMs: number;
}
```

### AsyncStepChain

`StepChain` 的异步实现，封装三阶段执行逻辑、重试策略、指标收集。

```typescript
class AsyncStepChain implements StepChain {
  // 链式组合
  setNext(step: StepChain): this;
  addBranch(branchId: string, step: StepChain): this;
  setRollback(step: StepChain): this;

  // 执行完整三阶段链路
  execute(input: StepInput, context: StepChainContext): Promise<StepResult>;

  // 从现有 PipelineStep 适配为 StepChain（向后兼容）
  static fromPipelineStep(step: PipelineStep, phase?: StepPhase): AsyncStepChain;
}
```

### StepChainBuilder

Fluent API，用于构建 StepChain 实例。

```typescript
const chain = new StepChainBuilder()
  .id('import')
  .stepId(PipelineStepId.IMPORT)
  .name('导入阶段')
  .phase(StepPhase.EXEC)
  .preCondition(async (input) => !!input.url)
  .executor(async (input, ctx) => {
    const result = await doImport(input);
    return { imported: result };
  })
  .postHandler(async (result) => {
    metrics.record('import', result.durationMs);
  })
  .maxRetries(2)
  .retryDelayMs(1000)
  .build();
```

### StepPhase

```typescript
enum StepPhase {
  PRE = 'pre', // 前置校验
  EXEC = 'exec', // 主执行
  POST = 'post', // 后置处理
}
```

### StepChainContext

跨阶段共享的上下文对象。

```typescript
interface StepChainContext {
  workflowId: string;
  stepId: string;
  engine?: {
    pause: () => boolean;
    cancel: () => void;
    getStatus: () => unknown;
  };
  metrics: {
    startTime: number;
    preDurationMs: number;
    execDurationMs: number;
    postDurationMs: number;
    retryCount: number;
  };
  shared: Map<string, unknown>; // 跨步骤数据传递
}
```

### StepResult

步骤执行结果。

```typescript
interface StepResult {
  stepId: string;
  phase: StepPhase;
  status: StepStatus; // PENDING | RUNNING | COMPLETED | FAILED | SKIPPED | RETRYING
  output: StepOutput;
  durationMs: number;
  error?: string;
}
```

## 执行流程

```
输入 StepInput
    ↓
[PRE PHASE]
  preCondition(input) → true  继续
                    → false 返回 { status: 'skipped' }
                    → throw    返回 { status: 'failed', error: ... }
    ↓
[EXEC PHASE]  (带重试)
  for attempt in 0..maxRetries:
    executor(input, context) → 成功 break
                            → 失败 wait(retryDelay * 2^attempt) 重试
    ↓
  状态 = 'completed' | 'failed'
    ↓
[POST PHASE]  (无论成功/失败都执行)
  postHandler(result, input)
    ↓
[ROLLBACK PHASE]  (仅在 EXEC 失败时执行)
  rollbackStep.execute(input, context)
    ↓
返回 StepResult
```

## 向后兼容

`AsyncStepChain.fromPipelineStep()` 允许将现有 `PipelineStep` 实现包装为 `StepChain`，无需重构原有代码：

```typescript
const existingStep = createImportStep();
const chain = AsyncStepChain.fromPipelineStep(existingStep, StepPhase.EXEC);
chain.setNext(createAnalysisStepChain());
```

## 与 PipelineEngine 的关系

- `PipelineEngine` 管理整个流水线的生命周期（启动、暂停、恢复、取消）
- `StepChain` 是流水线中每个步骤的执行单元
- 两者通过 `PipelineContext` 共享数据和状态

`PipelineEngine` 可以直接运行 `StepChain`，也可以继续运行原有的 `PipelineStep`（两者通过 `execute()` 方法兼容）。
