# Panel-Flow 重构进度报告

## ✅ 已完成

### TypeScript 编译（0 错误）
- 从 93 个 TS 错误降至 **0 个**
- 修复了 CheckpointManager、PipelineContext、StepImport/StepScript 等模块的路径和类型问题
- 安装缺失的 `jspdf` 依赖
- 创建 `src/shared/types/preview.ts`、`src/pages/ProjectEdit/components/index.ts`

### ESLint 清理
- Dashboard: 修复冗余 ARIA roles、floating promise、import order
- PreviewPanel: 修复 floating promise、移除未使用变量
- Orchestration: 移除未使用的 QualityGateFailedEvent、auto-fix import order
- 所有 orchestration 模块：0 errors, 27 warnings（仅 warning，无 error）

### Jest 测试（1485 passed）
- 80 passed, 10 failed（失败的是 pipeline 核心测试，存在 `step.execute is not a function` 问题）
- 移除空的 `test_import_check.ts`

### 架构改进
- FSD 目录结构初步建立（`src/app/`, `src/pages/`, `src/shared/`, `src/features/`）
- UI 组件统一到 `src/shared/ui/`
- 移除 antd 相关配置，更新 Vite manualChunks

## ⚠️ 仍需处理

### 测试失败（10 个 suite 失败）
主要是 `pipeline.test.ts` 相关 - `step.execute is not a function`：
- `src/core/pipeline/` 的 step 类型 vs `src/orchestration/pipeline/` 的 step 类型不一致
- 旧代码 (`src/core/pipeline/`) 使用 `IPipelineStep`，新代码 (`src/orchestration/pipeline/`) 使用 `IPipelineStep`
- 两个系统并存导致测试 mock 不匹配

### 架构遗留问题
1. **双 pipeline 系统**：旧 `src/core/pipeline/` 与新的 `src/orchestration/pipeline/` 并存
2. **双 UI 库**：旧的 `@/components/ui/*` 与新的 `@/shared/ui/*` 并存
3. **Domain events 分散**：`@/domain/shared/events/domain-events` 事件定义与使用位置可能需要整合

### 建议后续工作
1. 统一 pipeline 系统（废弃旧 `core/pipeline` 或废弃新 `orchestration/pipeline`）
2. 完成 UI 组件迁移（`@/components/ui` → `@/shared/ui`）
3. 修复 pipeline 测试 mock
