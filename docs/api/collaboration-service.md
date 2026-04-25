# 协同服务

分镜评论、版本快照与回滚管理服务。

## 概述

`CollaborationService`（D3）提供项目协同评审能力，支持分镜评论、版本历史和差异对比。

## 核心类型

```typescript
// 分镜评论
interface FrameComment {
  id: string;
  projectId: string;
  frameId: string;
  content: string;
  author: string;
  createdAt: string;  // ISO 8601
}

// 分镜版本快照
interface StoryboardVersion {
  id: string;
  projectId: string;
  label: string;
  createdAt: string;
  createdBy: string;
  payload: unknown;  // 完整的分镜数据快照
}

// 版本差异摘要
interface VersionDiffSummary {
  leftVersionId: string;
  rightVersionId: string;
  changedKeys: string[];
  changeCount: number;
}
```

## 使用示例

```typescript
import { collaborationService } from '@/core/services';

// 添加评论
const comment = collaborationService.addComment({
  projectId: 'project-123',
  frameId: 'frame-001',
  content: '这个场景的色调可以更暖一些',
  author: 'Alice',
});

// 列出某帧所有评论
const frameComments = collaborationService.listComments('project-123', 'frame-001');

// 列出项目所有评论
const allComments = collaborationService.listComments('project-123');

// 保存版本快照
const version = collaborationService.saveVersion({
  projectId: 'project-123',
  label: 'v2.1 - 色调调整后',
  createdBy: 'Alice',
  payload: currentStoryboard,
});

// 列出版本历史
const versions = collaborationService.listVersions('project-123');

// 对比两个版本
const diff = collaborationService.diffVersions('version-001', 'version-002');
// { leftVersionId: 'version-001', rightVersionId: 'version-002',
//   changedKeys: ['frames[0].color', 'frames[1].lighting'], changeCount: 2 }
```

## 方法

| 方法 | 说明 |
|------|------|
| `addComment(input)` | 添加评论 |
| `listComments(projectId, frameId?)` | 列出评论 |
| `deleteComment(commentId)` | 删除评论 |
| `saveVersion(input)` | 保存版本快照 |
| `listVersions(projectId)` | 列出版本历史 |
| `getVersion(versionId)` | 获取指定版本 |
| `diffVersions(leftId, rightId)` | 对比两个版本 |
| `rollbackToVersion(versionId)` | 回滚到指定版本 |

## 下一步

- [评审导出](./review-export-service.md) - 导出评审记录
- [成本服务](./cost-service.md) - 成本追踪
