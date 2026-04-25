# 评审导出服务

将协同评审数据（评论、版本、成本、评测）组装为 Markdown 格式导出文件。

## 概述

`ReviewExportService` 将项目协同数据整合为可读的 Markdown 报告，便于存档和分享。

## 核心类型

```typescript
interface ReviewExportProjectMeta {
  id: string;
  name: string;
  storyboardFrameCount: number;
}

interface ReviewExportInput {
  project: ReviewExportProjectMeta;
  comments: FrameComment[];
  versions: StoryboardVersion[];
  costStats: CostStats;
  costRecords: CostRecord[];
  evaluationSummary?: EvaluationScores;
  generatedAt?: Date;
}

type ReviewExportSource = 'project_edit' | 'project_detail' | 'unknown';
type ReviewExportStatus = 'success' | 'cancelled' | 'failed';

interface ReviewExportActivity {
  id: string;
  projectId?: string;
  projectName?: string;
  source: ReviewExportSource;
  status: ReviewExportStatus;
  fileName?: string;
  filePath?: string;
  errorMessage?: string;
  createdAt: string;
}

interface SaveReviewMarkdownOptions {
  projectId?: string;
  projectName?: string;
  source?: ReviewExportSource;
}
```

## Markdown 报告结构

导出的 Markdown 包含以下章节：

```
# PlotCraft 评审报告

## 项目信息
## 成本统计
## 评测评分
## 评论记录
## 版本历史
## 帧详情
```

## 使用示例

```typescript
import { reviewExportService } from '@/core/services';

// 方式1：生成 Markdown 字符串
const markdown = reviewExportService.toMarkdown({
  project: { id: 'p1', name: '我的视频', storyboardFrameCount: 12 },
  comments: collaborationService.listComments('p1'),
  versions: collaborationService.listVersions('p1'),
  costStats: costService.getStats(),
  costRecords: costService.getRecords(),
  evaluationSummary: { consistency: 88, pacing: 82, readability: 90, cost: 85, overall: 86 },
});

// 方式2：保存到本地文件（桌面端）
const activity = await reviewExportService.saveReviewMarkdown({
  projectId: 'p1',
  projectName: '我的视频',
  source: 'project_detail',
});

// 监听导出活动
reviewExportService.addListener((activities) => {
  const latest = activities[activities.length - 1];
  console.log(`导出状态: ${latest.status}`);
});
```

## 方法

| 方法 | 说明 |
|------|------|
| `toMarkdown(input)` | 生成 Markdown 文本 |
| `saveReviewMarkdown(options)` | 保存到本地文件（桌面端） |
| `getActivities()` | 获取导出历史 |
| `addListener(listener)` | 监听导出活动变化 |
| `removeListener(listener)` | 移除监听器 |

## 下一步

- [协同服务](./collaboration-service.md) - 评论与版本管理
- [成本服务](./cost-service.md) - 成本追踪
