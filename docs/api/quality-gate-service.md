# 质量门禁

自动化质量检查服务，在关键节点拦截低质量输出。

## 概述

`QualityGateService` 在流水线各环节自动执行质量检查，不合格则暂停并输出问题报告。

## 核心类型

```typescript
// 问题级别
type QualityGateIssueLevel = 'error' | 'warning' | 'info';

// 单个质量问题
interface QualityGateIssue {
  level: QualityGateIssueLevel;
  code: string;
  message: string;
  location?: string;
  suggestedFix?: string;
}

// 质量门禁输入
interface QualityGateInput {
  step: PipelineStepId;
  data: unknown;
}

// 质量指标
interface QualityGateMetrics {
  scriptLength?: number;       // 脚本字数
  shotCount?: number;          // 镜头数
  characterMentions?: number;   // 角色出现次数
  dialogueRatio?: number;       // 对话占比
  actionDescriptionRatio?: number;  // 动作描述占比
  consistencyScore?: number;    // 一致性得分
  pacingScore?: number;         // 节奏得分
}

// 质量门禁结果
interface QualityGateResult {
  passed: boolean;
  issues: QualityGateIssue[];
  metrics?: QualityGateMetrics;
  score?: number;  // 0-100
}
```

## 质量检查规则

| 规则 | 阈值 | 说明 |
|------|------|------|
| 脚本字数 | 200-5000 字 | 超出范围触发 warning |
| 镜头数 | 5-50 | 太少或太多触发 warning |
| 角色一致性 | ≥ 70 分 | 低于阈值触发 error |
| 节奏得分 | ≥ 60 分 | 低于阈值触发 error |
| 对话占比 | 20%-80% | 偏离触发 warning |
| 动作描述 | ≥ 10% | 过低触发 warning |

## 使用示例

```typescript
import { qualityGateService } from '@/core/services';

// 在流水线中嵌入质量检查
const result = await qualityGateService.check({
  step: 'script',
  data: { script, storyboard },
});

// 检查结果
if (!result.passed) {
  for (const issue of result.issues) {
    console.log(`[${issue.level}] ${issue.code}: ${issue.message}`);
    if (issue.suggestedFix) {
      console.log(`  建议修复: ${issue.suggestedFix}`);
    }
  }
}

// 完整报告
console.log(`质量得分: ${result.score}/100`);
console.log(`指标:`, result.metrics);
```

## 阈值配置

```typescript
import type { QualityGateThresholds } from '@/core/services';

const customThresholds: QualityGateThresholds = {
  minScriptLength: 300,
  maxScriptLength: 3000,
  minShotCount: 8,
  maxShotCount: 40,
  minConsistencyScore: 75,
  minPacingScore: 65,
  minDialogueRatio: 0.2,
  minActionRatio: 0.15,
};
```

## 方法

| 方法 | 说明 |
|------|------|
| `check(input)` | 执行质量检查 |
| `checkScript(script)` | 专门检查脚本 |
| `checkStoryboard(storyboard)` | 专门检查分镜 |
| `setThresholds(thresholds)` | 自定义阈值 |
| `getThresholds()` | 获取当前阈值 |

## 下一步

- [评测服务](./evaluation-service.md) - 质量量化评估
- [流水线引擎](./pipeline-service.md) - 集成质量检查
