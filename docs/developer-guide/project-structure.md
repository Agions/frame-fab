# 项目结构

PanelFlow 的详细文件组织。

## 根目录结构

```
PanelFlow/
├── .github/                    # GitHub 工作流和模板
│   ├── workflows/              # CI/CD 流水线
│   ├── ISSUES_TEMPLATE/       # Issue 模板
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── FUNDING.yml
├── public/                     # 静态资源
├── src/                        # 源代码
├── docs/                       # 文档 (docsify)
├── scripts/                    # 构建脚本
├── tests/                      # 测试文件
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── SPEC.md
```

## 源代码结构 (`src/`)

```
src/
├── app/
│   ├── App.tsx               # 根组件
│   ├── router.tsx            # React Router 配置
│   └── main.tsx              # 入口文件
│
├── pages/                     # 路由级组件
│   ├── HomePage.tsx
│   ├── WorkflowPage.tsx
│   └── SettingsPage.tsx
│
├── features/                  # 领域模块
│   ├── workflow/
│   │   ├── components/
│   │   │   ├── WorkflowEditor.tsx
│   │   │   ├── NodePalette.tsx
│   │   │   └── NodeConfig.tsx
│   │   ├── hooks/
│   │   │   └── useWorkflow.ts
│   │   ├── services/
│   │   │   └── workflow.service.ts
│   │   └── index.ts
│   │
│   ├── storyboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.ts
│   │
│   ├── character/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── index.ts
│   │
│   └── ... (其他功能)
│
├── shared/                    # 共享基础设施
│   ├── components/
│   │   ├── ui/               # 基础 UI 组件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/           # 布局组件
│   │   └── common/           # 通用组件
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useClickOutside.ts
│   │
│   ├── services/
│   │   ├── api/              # HTTP 客户端
│   │   │   └── apiClient.ts
│   │   ├── storage/          # 存储抽象
│   │   │   └── storage.service.ts
│   │   └── ai/               # AI 服务层
│   │       └── ai.service.ts
│   │
│   ├── stores/               # Zustand 存储
│   │   ├── app.store.ts
│   │   ├── project.store.ts
│   │   └── workflow.store.ts
│   │
│   ├── types/                # 共享类型
│   │   ├── index.ts
│   │   ├── storyboard.types.ts
│   │   └── workflow.types.ts
│   │
│   └── utils/                # 工具函数
│       ├── format.ts
│       └── validate.ts
│
├── core/                      # 核心服务 (遗留)
│   ├── config/
│   │   ├── app.config.ts
│   │   └── models.config.ts
│   │
│   ├── services/
│   │   ├── ai.service.ts
│   │   ├── image-generation.service.ts
│   │   ├── lip-sync.service.ts
│   │   ├── tts.service.ts
│   │   ├── manga-pipeline.service.ts
│   │   ├── storyboard.service.ts
│   │   ├── character.service.ts
│   │   └── index.ts
│   │
│   └── stores/
│
├── styles/
│   ├── global.less
│   └── variables.less
│
└── locales/                   # 国际化 (未来)
```

## 功能模块模式

每个功能应遵循此模式:

```
features/[名称]/
├── components/
│   ├── FeatureName.tsx       # 主组件
│   ├── SubComponent.tsx      # 子组件
│   └── FeatureName.module.less
├── hooks/
│   └── useFeatureName.ts     # 自定义 Hooks
├── services/
│   └── feature.service.ts    # 业务逻辑
├── types/
│   └── types.ts              # 功能特定类型
├── utils/
│   └── helpers.ts            # 功能辅助函数
└── index.ts                  # 公开 API (桶导出)
```

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `WorkflowEditor.tsx` |
| Hooks | camelCase 带 `use` 前缀 | `useWorkflow.ts` |
| 服务 | camelCase | `workflow.service.ts` |
| 类型 | PascalCase | `WorkflowState.ts` |
| 存储 | camelCase 带 `store` 后缀 | `workflowStore.ts` |
| 工具函数 | camelCase | `formatDate.ts` |
| 常量 | SCREAMING_SNAKE | `MAX_FILE_SIZE` |
| CSS 模块 | 匹配组件名称 | `Button.module.less` |

## 导入路径

```typescript
// 绝对导入 (在 vite.config.ts 中配置)
import { Button } from '@/shared/components/ui/Button';
import { workflowService } from '@/features/workflow';
import type { StoryboardFrame } from '@/shared/types';

// 相对导入 (用于近邻文件)
import { useState } from 'react';
import './styles.css';
```

## 关键文件

| 文件 | 用途 |
|------|------|
| `src/app/App.tsx` | 根组件,路由配置 |
| `src/app/router.tsx` | 路由定义 |
| `src/main.tsx` | 入口文件,提供者 |
| `src/shared/stores/*.ts` | Zustand 状态存储 |
| `src/core/services/*.ts` | 核心服务实现 |
| `src/features/*/index.ts` | 功能公开 API |
