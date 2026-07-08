## Story Weaver 全面系统重构

### Phase 1: 修复关键 Bug + 类型统一

**1.1 修无限递归 Bug**

- `ProjectDetailPage.tsx:153` — `handleDeleteProject` 函数内调用自身导致栈溢出，改为具名方法引用

**1.2 统一类型定义（去重）**

- `VideoSegment`: `ScriptDetailPage.tsx` 内的本地定义改为从 `@/shared/types/script` 导入
- `ProjectData`: `ProjectEditPage.tsx` 内的本地定义改为从 `@/shared/types/project` 导入（补 `script` 字段）
- `SubtitleItem`/`SubtitleStyle`/`SubtitleTrack`: 三处定义统一为 `shared/types/subtitle.ts` 单一来源，其他文件 re-export 或重定向
- `BackgroundMusic`: 删除 `video-composition.types.ts` 中的重复定义，统一从 `audio.ts` 导入

**1.3 简化 step.interface.ts**

- 合并 `pipeline.types.ts` 与 `step.interface.ts` 为单一文件，保留 strict/loose 双 API（为向后兼容不破坏外部消费者）

### Phase 2: 死代码清理

- 删除 `createIncrementalStorage` 和 `createCompressedStorage`（无人使用）
- 删除 `SimpleTimeline.tsx`（308 行死代码）
- 删除 `src/features/video-export/` 空壳目录
- 清理 `src/core/services/index.ts` barrel（只保留实际被导入的导出项）

### Phase 3: God File 拆分

**3.1 ProjectEditPage.tsx (759行)**

- 提取 `useScriptStep` hook: 管理 segments + onSave
- 提取 `useProjectExport` hook: 管理 export preset + settings
- 主体保留路由/数据加载逻辑（~300行）

**3.2 ScriptEditor.tsx (484行)**

- 提取 `SegmentTable` 组件（表格 + 行操作）
- 提取 `ExportMenu` 组件（内联绝对定位下拉）
- 主体保留 Dialog + 状态协调

### Phase 4: 清理过度设计

**4.1 清理 `_`-前缀无用参数**

- 7 个文件的 12 处 `_`-前缀 prop: 移除无用 prop（保持 API 签名简洁）

**4.2 PropertyPanel.tsx (464行)**

- 将 `subtitle`/`audio`/`video` 三个 tab 改为 controlled inputs（接入 `useState`）

**4.3 SettingsPage.tsx (447行)**

- 删除假数据（`calls: '1,234'`, `tokens: '567K'`）
- uncontrollled inputs → controlled

**4.4 配置清理**

- `tailwind.config.ts`: 删除无用的 `content` 数组（v4 不读此字段）
- `jest.config.cjs`: 删除历史遗留注释和 dead config markers，尝试重新启用被禁用的测试
- `vite.config.ts`: 简化 `manualChunks` + 消除重复 vendor split

**4.5 合并 tailwind 配置**

- `tailwind.config.ts` 改为 CSS-first (`@theme {}`) 或完全删除（依赖 v4 默认配置 + CSS vars）

### Phase 5: 验证

- `npx tsc --noEmit` → 0 errors
- `npx jest --passWithNoTests --no-coverage` → all suites pass
- `git push origin main`

### 原则

- 每个 commit 一个逻辑单元
- 不引入新依赖
- 不破坏现有测试通过状态
- 不重复代码
