# Panel-Flow 架构重构方案

## 当前问题分析

### 1. 目录结构混乱
- 多个顶层目录职责不清：`core/`、`features/`、`components/`、`presentation/`、`orchestration/`、`domain/`、`infrastructure/`
- 同类代码分散在不同位置

### 2. 代码重复
- Store 文件重复：`src/shared/stores/autoPipelineStore.ts` 和 `src/features/auto-pipeline/stores/autoPipelineStore.ts`
- UI 组件分散：`components/ui/` 和 `packages/common/src/components/ui/`

### 3. 配置过时
- `vite.config.ts` 还在引用 antd 相关配置，但 `package.json` 已无 antd 依赖

### 4. 测试结构不一致
- `__tests__/` 目录结构与 `src/` 不对应

---

## 重构方案：采用 Feature-Sliced Design (FSD)

### 目标架构

```
src/
├── app/                    # 应用级配置
│   ├── providers/          # 全局 providers
│   ├── router/             # 路由配置
│   ├── components/         # 应用级组件
│   └── index.tsx           # App 入口
│
├── pages/                  # 页面组件（路由级）
│   ├── Home/
│   ├── Workflow/
│   ├── ProjectEdit/
│   ├── ProjectDetail/
│   ├── Settings/
│   ├── AutoPipeline/
│   └── VideoEditor/
│
├── widgets/                # 页面区块（组合 features 和 entities）
│   ├── CompositionStudio/
│   ├── CostDashboard/
│   ├── RenderCenter/
│   └── WorkflowEditor/
│
├── features/               # 用户交互功能
│   ├── auto-pipeline/
│   ├── script/
│   ├── video/
│   ├── audio/
│   ├── character/
│   └── video-export/
│
├── entities/               # 业务实体
│   ├── Character/
│   ├── Scene/
│   ├── Script/
│   ├── Project/
│   └── Pipeline/
│
├── shared/                 # 共享资源
│   ├── ui/                 # 基础 UI 组件 (shadcn/ui)
│   ├── components/         # 业务共享组件
│   │   ├── ui/             # 业务 UI 组件
│   │   ├── layout/         # 布局组件
│   │   └── pipeline/       # 流水线组件
│   ├── hooks/              # 通用 hooks
│   ├── utils/              # 工具函数
│   ├── stores/             # 全局状态
│   ├── types/              # 类型定义
│   ├── services/           # 共享服务
│   └── assets/             # 静态资源
│
├── core/                   # 核心功能（保留）
│   ├── services/           # 核心服务
│   ├── hooks/              # 核心 hooks
│   ├── utils/              # 核心工具
│   ├── config/             # 配置
│   ├── autonomous/         # 自主流水线
│   └── pipeline/           # 流水线步骤
│
└── processes/              # 复杂业务流程
    └── pipeline/           # 视频制作流水线
```

---

## 已完成的重构工作

### Phase 1: 清理和准备 ✅
- [x] 清理 vite.config.ts 过时配置（antd 相关）
- [x] 创建新的目录结构
- [x] 更新 tsconfig.json 路径别名

### Phase 2: 迁移 app 层 ✅
- [x] 创建 `src/app/index.tsx` 作为应用入口
- [x] 迁移 Providers 到 `src/app/providers/`
- [x] 迁移路由配置到 `src/app/router/`
- [x] 迁移 ErrorBoundary 到 `src/app/components/`

### Phase 3: 迁移 pages 层 ✅
- [x] 重组页面目录结构
- [x] 迁移页面组件到对应子目录

### Phase 4: 统一 UI 组件 ✅
- [x] 创建 `src/shared/ui/` 存放基础 UI 组件
- [x] 更新组件导入路径
- [x] 保留 `packages/common` 中的跨项目共享组件

### Phase 5: 清理重复代码 ✅
- [x] 合并重复的 store 文件
- [x] 删除 `src/shared/stores/autoPipelineStore.ts`

### Phase 6: 清理依赖 ✅
- [x] 移除未使用的依赖：i18next、react-i18next、dayjs
- [x] 更新 package.json

---

## 关键原则

1. **单向依赖**：上层可以导入下层，下层不能导入上层
2. **公共 API**：每个模块都有 `index.ts` 导出公共接口
3. **低耦合**：通过接口和类型解耦模块间依赖
4. **高内聚**：相关代码集中在同一模块内

---

## 目录职责说明

| 目录 | 职责 | 示例 |
|------|------|------|
| `app/` | 应用级配置 | 路由、Providers、全局样式 |
| `pages/` | 页面组件 | HomePage、SettingsPage |
| `widgets/` | 页面区块 | CompositionStudio、CostDashboard |
| `features/` | 用户交互功能 | auto-pipeline、script、video |
| `entities/` | 业务实体 | Character、Scene、Script |
| `shared/` | 共享资源 | UI 组件、hooks、utils |
| `core/` | 核心功能 | services、config、pipeline |
| `processes/` | 复杂业务流程 | 视频制作流水线 |

---

## 后续优化建议

1. **完善 entities 层**：将业务实体从 core/domain 迁移到 entities
2. **优化 widgets 层**：将页面区块组件迁移到 widgets
3. **测试目录重构**：将测试文件移动到对应源代码目录
4. **完善 FSD 规范**：添加 Steiger lint 规则检查依赖方向

---

## 参考资料

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Tauri 2.x Project Structure](https://v2.tauri.app/start/project-structure/)
- [React Clean Architecture](https://dev.to/daslaf/clean-architecture-for-react-apps-3g3m)
