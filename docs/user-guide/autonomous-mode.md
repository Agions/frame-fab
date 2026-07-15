# Autonomous 模式

> 全自动创作模式 — 导入小说，等待成片

## 适用场景

- 批量生产：一次配置，多部小说自动处理
- 快速成片：不关心中间过程，只要最终结果
- 无人值守：挂机运行，完成后通知

## 执行流程

```
导入小说 → 自动分析 → 自动生成 → 自动审核 → 自动修复 → ... → 成片输出
```

每一步自动执行，Quality Gate 失败时触发 Self-Review Loop（最多 3 次自动重试）。

## 配置参数

```typescript
const autonomousConfig = {
  provider: 'openai', // 主 Provider
  fallback: ['anthropic', 'zhipu', 'mock'], // 降级链
  qualityThreshold: 0.85, // 质量阈值
  maxRetries: 3, // 最大重试次数
  autoCheckpoint: true, // 自动断点续传
  checkpointInterval: 30000, // 30s 间隔
};
```

## 断点续传（Checkpoint）

```
[t=0s]   开始 Step 1 IMPORT
[t=30s]  Checkpoint 1 saved
[t=60s]  Checkpoint 2 saved
[t=90s]  💥 应用崩溃
[t=0s]  重启 → 自动恢复 → 从 Checkpoint 2 继续
```

::: tip 手动恢复
如需从特定步骤重新开始，可在编辑器中点击「从 Checkpoint 恢复」选择时间点。
:::

## 监控进度

在编辑器顶部可以看到：

- 当前步骤（如 "Step 3: SCRIPT"）
- 进度百分比
- 已用时间 / 预估剩余时间
- Quality Gate 评分历史

[下一步：Manual 模式 →](/user-guide/manual-mode)
