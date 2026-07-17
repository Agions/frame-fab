# Story-Weaver v3 架构重构设计

> **日期**: 2026-07-17
> **分支**: refactor/v3-architecture-upgrade
> **状态**: 已批准

---

## 1. 项目现状分析

### 1.1 架构概览

Story-Weaver 是一个基于 Tauri 2.1 + React 19 的 AI 漫剧创作平台，采用严格的分层架构：

```
┌──────────────────────────────────────────────────────┐
│  pages/            Page components (route shells)    │
│  features/         Vertical feature slices           │
├──────────────────────────────────────────────────────┤
│  core/             Business logic, pure, no React    │
│  infrastructure/   External system adapters          │
├──────────────────────────────────────────────────────┤
│  shared/           Base: UI primitives, types, utils │
└──────────────────────────────────────────────────────┘
```

依赖方向：UI → core → shared（单向，无反向）。通过 ESLint `no-restricted-imports` 和 `dependency-cruiser` 强制 enforcement。

### 1.2 核心系统

| 系统 | 位置 | 说明 |
|------|------|------|
| **Pipeline 引擎** | `core/pipeline/` | 9 步流水线（IMPORT → ANALYSIS → SCRIPT → CHARACTER → STORYBOARD → RENDER → VIDEO_EDITING → AUDIO_SYNTHESIS → COMPOSITION），Symbol-keyed context，checkpoint/resume |
| **AI Provider** | `core/ai/providers/` | Strategy 模式，7+ providers（OpenAI, Anthropic, Google, Alibaba, Baidu, Zhipu, Mock） |
| **视频处理** | `core/services/video/` | FFmpeg.wasm + Tauri，视频分析/合成/字幕 |
| **音频处理** | `core/services/audio/` | TTS（Edge TTS + stubs），唇同步 |
| **状态管理** | `shared/stores/` | Zustand（project, settings, storyboard, app） |

### 1.3 识别的核心问题

#### P1 — 死代码与废弃 Shim

| 问题 | 详情 | 影响 |
|------|------|------|
| 废弃 `infrastructure/ai/providers/` | `dependency-cruiser` 标记为 P2 死代码，无调用方 | 可删除 |
| 废弃 `shared/utils/general.ts` | 0 消费者，`dependency-cruiser` 禁止导入 | 需迁移 barrel 导出后删除 |
| 74 文件含注释块死代码 | 子模块合并遗留的 `// ========== 原 xxx.ts ==========` 分隔块 | 纯删除，无风险 |
| `pipeline-types.ts` service shim | 不兼容的类型定义（`PipelineStatus` 缺少 `'cancelled'`），72 个外部调用方 | 渐进标记 `@deprecated` |

#### P2 — 命名混乱

| 问题 | 详情 |
|------|------|
| `uuid` vs `uuidv4` | 18 文件用 `uuid`，18 文件用 `uuidv4` |
| toast 导入 8 种模式 | `sonner` / `@/shared/components/ui/sonner` / `@/shared/components/ui/toast` 等 |
| 双重服务层 | `src/services/`（应用层）vs `src/core/services/`（纯业务层） |

#### P3 — 重复代码

| 重复 | 详情 |
|------|------|
| StepActions/StepNavigation | 两个目录各有一份完全重复的实现 |
| 两个 logger | `core/utils/logger.ts`（完整版）和 `shared/utils/logger.ts`（轻量版） |
| SubtitleStyle | `components/media/subtitle/types/` 和 `core/services/video/subtitle/types/` 双定义 |
| Reducer 模式 | 6 文件复制粘贴相同的 Action+reducer+setter 模式 |

---

## 2. 重构方案

### 2.1 阶段划分

采用渐进式重构，分 3 个独立 PR，每阶段可单独发布：

#### Phase 1: 安全清理（PR #1）— 零风险

**目标**: 消除死代码，标记废弃 shim，统一命名常量

**任务清单**:
1. 删除 `infrastructure/ai/providers/` 目录（已确认无调用方）
2. 删除 `shared/utils/general.ts`（迁移 barrel 导出后删除）
3. 清理 10 个核心文件中的注释块死代码
4. 统一 `uuid` / `uuidv4` 导入命名（全项目搜索替换）
5. 集中 localStorage key 到 `core/constants/app-config.ts`
6. 标记 `core/services/pipeline/pipeline-types.ts` shim 为 `@deprecated`
7. 重命名 `createExportStep` 冲突（service 层 → `createSimpleExportStep`）

**验证**: `pnpm test` 零回归

#### Phase 2: 消除重复（PR #2）

**目标**: DRY 原则落地，消除逻辑重复

**任务清单**:
1. 合并重复的 StepActions / StepNavigation
2. 统一 logger 实现（保留 core 版，shared 版改为 re-export）
3. 合并 SubtitleStyle 双定义
4. 提取 6 个 reducer 的公共模式为 `createFieldUpdater` 工具函数
5. 统一 toast 导入路径

#### Phase 3: 架构升级（PR #3）

**目标**: 改善可维护性与扩展性

**任务清单**:
1. 拆分 8 个 500+ 行大文件
2. 统一双重服务层（`src/services/` → `src/core/services/`）
3. 迁移 `src/types/` 到 `shared/types/`
4. 更新架构文档

### 2.2 约束与原则

| 约束 | 规则 |
|------|------|
| **向后兼容** | Phase 1 保留所有导出路径，只加 `@deprecated` 注释 |
| **零功能回归** | 每步完成后运行 `pnpm test` |
| **命名规范** | 变量/函数：camelCase；常量：UPPER_SNAKE_CASE；类型/类：PascalCase |
| **依赖方向** | 严格遵守 UI → core → shared，ESLint + dependency-cruiser  enforcement |
| **YAGNI** | 不添加任何非必要抽象或功能 |

---

## 3. 技术栈确认

| 层 | 技术 | 版本 |
|----|------|------|
| 前端 | React + TypeScript | 19 + 5.4 |
| 构建 | Vite | 6 |
| CSS | Tailwind CSS | 4 |
| 桌面 | Tauri | 2.1 |
| 测试 | Jest + Testing Library | 30+ |
| 状态 | Zustand | 4 |
| 包管理 | pnpm | workspace |

---

## 4. 实施顺序

```
Phase 1（本 PR）: 死代码清理 + 废弃 Shim 标记
    ↓
Phase 2: 重复代码消除
    ↓
Phase 3: 架构升级 + 大文件拆分
```

每阶段独立提交、独立测试、独立发布。
