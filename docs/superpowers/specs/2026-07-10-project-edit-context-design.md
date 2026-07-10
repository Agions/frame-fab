# P0-1: ProjectEditContext — 消除 53-prop 穿透

> **状态**: 设计已确认  
> **日期**: 2026-07-10  
> **范围**: `src/pages/project-edit/` 内的状态管理与组件通信

---

## 1. 问题陈述

`ProjectEditPage.tsx` 持有 **20+ useState** 和 **15+ handler 函数**，通过 `StepContentSwitcher` 以 **53 个 props** 透传给 9 个 step 子组件。

`StepScript` 实际只使用 4 个 prop，却被迫声明接收 53 个。每次新增 page-level 状态，都要穿透 3 层（Page → Switcher → Step），导致：

- 修改 prop 接口需改 3 个文件
- 任意 step 可直接修改任意 page-level 状态（无封装）
- `StepContentSwitcher` 成为 302 行的纯透传壳（违反 SRP）

---

## 2. 目标

| 指标                         | 当前 | 目标                                                        |
| ---------------------------- | ---- | ----------------------------------------------------------- |
| StepContentSwitcher props 数 | 53   | **1** (currentStep)                                         |
| ProjectEditPage useState 数  | 20+  | **< 5** (仅保留 name/description/currentStep/error/loading) |
| 新增 page 级状态需改文件数   | 3    | **1** (context 内部)                                        |
| 子组件直接访问的 state 范围  | 全部 | **仅自己 step 的 selector**                                 |

---

## 3. 设计方案

### 3.1 新增文件结构

```
src/pages/project-edit/
├── context/
│   ├── ProjectEditContext.tsx    — Context 定义 + Provider + useProjectEdit() hook
│   ├── project-edit-state.ts     — State 类型 + Actions 类型 + 初始值
│   └── selectors.ts              — 按 step 拆分的 selector hooks
```

### 3.2 Context 边界

**纳入 Context 的 state**（从 ProjectEditPage useState 移入）：

| 分组       | 字段                                                         |
| ---------- | ------------------------------------------------------------ |
| 项目元数据 | `content`, `novelMetadata`, `storyAnalysis`, `analysisState` |
| 分析       | `analysisDraft`, `analysisState`                             |
| 分镜 UI    | `commentDraft`, `versionLabel`, `focusFrameId`               |
| 音频       | `audioConfig`, `audioEditorKey`, `audioGenerating`           |
| 自定义     | `characters`, `composition`                                  |

**不纳入 Context 的 state**（保持原有位置）：

| 字段                                        | 原因                              |
| ------------------------------------------- | --------------------------------- |
| `scriptText`                                | 已由 `useScriptStep` hook 管理    |
| `exportPreset`, `exportSettings`            | 已由 `useProjectExport` hook 管理 |
| `storyboard.*` (frames/comments/versions)   | 已由 `useStoryboard` store 管理   |
| `currentStep`, `project`, `saving`, `error` | 已由 `useProject` reducer 管理    |
| `name`, `description`                       | 仅 Header 使用，留在 page         |
| `initialLoading`, `isNewProject`            | page 生命周期标记，留在 page      |

### 3.3 Actions 设计

Context value 暴露一个 `actions` 对象，封装所有 handler 函数：

```typescript
interface ProjectEditActions {
  // 内容
  loadContent: (content: string, metadata: ScriptImportMetadata) => void;
  removeContent: () => void;
  // AI
  analyzeContent: () => Promise<void>;
  acceptAnalysis: () => Promise<void>;
  setAnalysisDraft: (draft: string) => void;
  // 分镜
  addFrameComment: () => void;
  saveStoryboardVersion: () => void;
  compareVersions: () => void;
  rollbackVersion: () => void;
  buildStoryboardDraft: () => void;
  setCommentDraft: (draft: string) => void;
  // 音频
  generateVoices: () => Promise<void>;
  setAudioConfig: (config: AudioTrackConfig) => void;
  // 导出
  saveProject: () => Promise<void>;
  exportReviewNotes: () => Promise<void>;
  locateIssueFrame: (issue: QualityGateIssue) => void;
  // 剧本
  saveScriptFromSegments: (segments: VideoSegment[]) => void;
  exportScript: (format: string) => void;
  // 导航/自定义
  setCharacters: (characters: Character[]) => void;
  setComposition: (composition: CompositionProject) => void;
}
```

### 3.4 Selectors（各 step 的 context 子集）

```typescript
// selectors.ts
export function useStepImportContext() {
  const { state, actions } = useProjectEdit();
  return {
    content: state.content,
    loading: state.loading,
    onLoadContent: actions.loadContent,
    onRemoveContent: actions.removeContent,
    onAnalyze: actions.analyzeContent,
  };
}

export function useStepAnalysisContext() { ... }
export function useStepStoryboardContext() { ... }
export function useStepAudioContext() { ... }
export function useStepExportContext() { ... }
// ... 每个 step 一个 selector
```

### 3.5 Provider 位置

```tsx
// ProjectEditPage.tsx (改造后)
const ProjectEdit = () => {
  // 仅保留必要的 page 级 state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <ProjectEditProvider>
      <PageHeader name={name} ... />
      <StepNavigation currentStep={currentStep} onStepChange={setCurrentStep} />
      <StepContentSwitcher currentStep={currentStep} />
    </ProjectEditProvider>
  );
};
```

---

## 4. 实施批次

### Batch 1: Context 骨架 + 全局状态迁移

- 创建 `project-edit-state.ts`（类型 + 初始值）
- 创建 `ProjectEditContext.tsx`（Context + Provider）
- 将 content/novelMetadata/storyAnalysis/analysisDraft/analysisState 移入 Context
- 迁移 StepImport + StepAnalysis 消费 context

### Batch 2: 分镜相关

- 将 commentDraft/versionLabel/focusFrameId 移入 Context
- 迁移 StepStoryboard 消费 context
- 封装 collaboration 相关 handlers

### Batch 3: 音频 + 导出

- 将 audioConfig/audioEditorKey/audioGenerating 移入 Context
- 迁移 StepAudio + StepExport 消费 context
- 封装 saveProject handler

### Batch 4: 收尾

- 将 characters/composition 移入 Context
- 迁移 StepCharacter + StepRender + StepComposition
- 删除 StepContentSwitcher 的 52 个冗余 props
- 验证 tsc + build 通过

---

## 5. 验证标准

- [ ] `npx tsc --noEmit` 无错误
- [ ] `npx vite build` 构建成功
- [ ] StepContentSwitcher 接口仅剩 `currentStep: number` 一个 prop
- [ ] ProjectEditPage 无超过 5 个直接 useState 声明
- [ ] 各 step 组件通过 `useStep*Context()` 获取状态，不从 props 接
- [ ] 现有功能行为不变（AI 分析、分镜操作、音频生成、保存导出）

---

## 6. 风险与缓解

| 风险                                 | 缓解                                                                    |
| ------------------------------------ | ----------------------------------------------------------------------- |
| Context value 频繁更新导致全量重渲染 | 按 state 分组拆分子 context，或使用 selector pattern（shallow compare） |
| 迁移中途功能损坏                     | 每 batch 一个 commit，可单独回滚                                        |
| 与现有 hooks 冲突                    | Context 内部调用已有 hooks，不重复实现逻辑                              |
