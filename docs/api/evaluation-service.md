# 评测服务

视频生成质量评测与回归测试服务。

## 概述

`EvaluationService`（D2）提供生成结果的自动化评测能力，基于内置基准故事集评估一致性、节奏、可读性和成本表现。

## 核心类型

```typescript
// 基准测试样本
interface BenchmarkSample {
  id: string;
  title: string;
  genre: string;
  text: string;
  targetDurationSec: number;
  targetCostUSD: number;
}

// 单个样本评测结果
interface EvaluationCaseResult {
  sampleId: string;
  generatedDurationSec: number;
  generatedCostUSD: number;
  shotCount: number;
  characterConsistency: number;  // 0-100
  subtitleReadability: number;  // 0-100
  pacing: number;               // 0-100
}

// 各项评分
interface EvaluationScores {
  consistency: number;
  pacing: number;
  readability: number;
  cost: number;
  overall: number;
}

// 单个样本评测报告
interface EvaluationItemReport {
  sampleId: string;
  title: string;
  scores: EvaluationScores;
  notes: string[];
}

// 完整评测报告
interface EvaluationReport {
  generatedAt: string;
  summary: EvaluationScores;
  items: EvaluationItemReport[];
  failedSampleIds: string[];
}
```

## 内置基准集

内置 `benchmark-stories.zh-CN.json`，包含多个中文基准故事样本，涵盖不同类型和时长要求。

## 使用示例

```typescript
import { evaluationService } from '@/core/services';

// 获取所有基准样本
const samples = evaluationService.getBenchmarkSamples();

// 评测一批生成结果
const results: EvaluationCaseResult[] = [
  {
    sampleId: 'sample-001',
    generatedDurationSec: 32,
    generatedCostUSD: 0.45,
    shotCount: 8,
    characterConsistency: 92,
    subtitleReadability: 88,
    pacing: 85,
  },
];

const report = evaluationService.evaluate(results);

// 报告结构
// {
//   generatedAt: '2026-04-25T06:00:00.000Z',
//   summary: { consistency: 92, pacing: 85, readability: 88, cost: 87, overall: 88 },
//   items: [{ sampleId: 'sample-001', title: '...', scores: {...}, notes: ['...'] }],
//   failedSampleIds: [],
// }
```

## 评分计算

评分基于以下维度加权综合：

| 维度 | 权重 | 说明 |
|------|------|------|
| `consistency` | 35% | 角色一致性 |
| `pacing` | 25% | 视频节奏 |
| `readability` | 20% | 字幕可读性 |
| `cost` | 20% | 成本效率 |

## 方法

| 方法 | 说明 |
|------|------|
| `getBenchmarkSamples()` | 获取所有基准样本 |
| `evaluate(results[])` | 批量评测并生成报告 |
| `compareWithBaseline(result, sampleId)` | 与基准目标对比 |

## 下一步

- [质量门禁](./quality-gate-service.md) - 质量自动检测
- [评审导出](./review-export-service.md) - 导出评测报告
