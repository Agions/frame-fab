# 模块系统

> 分层边界 + ESLint 强制规则

## 目录结构

```
src/
├── components/          ← UI 组件层
│   ├── ai/              ← AI 生成组件
│   ├── media/           ← 视频/音频/字幕
│   ├── pipeline/        ← 流水线 UI
│   ├── project/         ← 项目管理
│   ├── home/            ← 首页视图
│   └── common/          ← 跨域共享
├── hooks/               ← 逻辑复用层
├── services/            ← 业务服务层
├── types/               ← 类型定义层
└── utils/               ← 工具函数层
```

## 层级边界（ESLint 强制）

| 层             | 禁止导入      |
| -------------- | ------------- |
| `components/`  | `services/`   |
| `hooks/`       | `components/` |
| `types/utils/` | 任何上层      |

```javascript
// eslint.config.js
rules: {
  'no-restricted-imports': ['warn', {
    patterns: [{
      group: ['@/core/*', '@/features/*', '@/app/*'],
      message: 'shared 层不允许导入上层模块。',
    }],
  }],
}
```

## 命名约定

| 类型      | 命名规则   | 示例                |
| --------- | ---------- | ------------------- |
| 组件文件  | PascalCase | `ErrorBoundary.tsx` |
| 服务/工具 | kebab-case | `video.service.ts`  |
| 类型/接口 | PascalCase | `AIResponse`        |
| 常量      | SNAKE_CASE | `DEFAULT_FPS`       |
| 函数/变量 | camelCase  | `getVideoInfo`      |

[下一步：Pipeline 引擎 →](/developer-guide/pipeline-engine)
