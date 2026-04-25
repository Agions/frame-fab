# 成本服务

LLM/视频生成成本追踪、预算管理和告警服务。

## 概述

`CostService` 监控项目在 AI 服务上的支出，支持按类型、提供商、模型多维统计和预算告警。

## 核心类型

```typescript
// 成本记录
interface CostRecord {
  id: string;
  type: 'llm' | 'video' | 'audio' | 'storage';
  provider: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  cost: number;       // USD
  duration?: number;  // ms
  timestamp: string;  // ISO 8601
  metadata?: Record<string, unknown>;
}

// 成本统计
interface CostStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byType: Record<string, number>;
  byProvider: Record<string, number>;
  byModel: Record<string, number>;
}

// 预算状态
interface BudgetStatus {
  daily: { used: number; limit: number; percent: number };
  weekly: { used: number; limit: number; percent: number };
  monthly: { used: number; limit: number; percent: number };
}

// 成本告警
interface CostAlert {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  percent: number;
  threshold: number;
  timestamp: string;
}

// 成本预算
interface CostBudget {
  daily: number;
  weekly: number;
  monthly: number;
  alerts: {
    daily: number;    // 百分比阈值
    weekly: number;
    monthly: number;
  };
}
```

## 模型成本配置（USD / 1K tokens）

| 提供商 | 模型 | Input | Output |
|--------|------|-------|--------|
| OpenAI | GPT-4o | $0.005 | $0.015 |
| OpenAI | GPT-4o-mini | $0.00015 | $0.0006 |
| MiniMax | glm-5 | $0.0001 | $0.0001 |
| MiniMax | glm-4 | $0.001 | $0.001 |

## 使用示例

```typescript
import { costService } from '@/core/services';

// 记录一次 API 调用
const record = costService.record({
  type: 'llm',
  provider: 'minimax',
  model: 'glm-5',
  inputTokens: 1500,
  outputTokens: 800,
  cost: 0.00023, // USD
  duration: 1200,
  metadata: { projectId: 'p1', step: 'script' },
});

// 获取统计
const stats = costService.getStats();
// { total: 4.56, today: 0.82, thisWeek: 2.10, thisMonth: 4.56, ... }

// 获取预算状态
const budget = costService.getBudgetStatus();
// { daily: { used: 0.8, limit: 5, percent: 16 }, ... }

// 设置预算
costService.setBudget({
  daily: 5,
  weekly: 20,
  monthly: 50,
  alerts: { daily: 80, weekly: 80, monthly: 80 },
});

// 查询记录
const records = costService.queryRecords({ type: 'llm', limit: 50 });
const todayRecords = costService.getRecords(); // 今日记录
```

## 方法

| 方法 | 说明 |
|------|------|
| `record(data)` | 记录一笔成本 |
| `getStats()` | 获取多维统计 |
| `getBudgetStatus()` | 获取预算使用状态 |
| `setBudget(budget)` | 设置预算限额 |
| `getRecords(options?)` | 查询成本记录 |
| `queryRecords(filter)` | 过滤查询 |
| `exportCSV(options?)` | 导出 CSV |

## 告警机制

当使用量超过阈值时自动触发告警：

```typescript
costService.addAlertListener((alert) => {
  if (alert.period === 'daily' && alert.percent >= alert.threshold) {
    console.warn(`日预算已使用 ${alert.percent}%！`);
  }
});
```

## 下一步

- [协同服务](./collaboration-service.md) - 协同评论与版本
- [评审导出](./review-export-service.md) - 成本数据整合导出
