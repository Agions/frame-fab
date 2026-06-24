/**
 * Hooks 统一导出
 */

export { useModel, useModelCost } from './useModel';
export { useProject } from './useProject';
export { useProjectList } from './useProjectList';
export type { UseProjectListReturn } from './useProjectList';
export { useVideo } from './useVideo';
export { useSmartModel } from './useSmartModel';
export { useWorkflow } from './useWorkflow';
export { useEditor } from './useEditor';

// 8 交互反馈 Hooks (useLoading/useAsync/usePolling/useMessage/useModalConfirm/
// useTabs/useCollapse/useStepper) 已删除——它们是 0 prod 消费者的孤儿 hook。
// 详见 commit: refactor(hooks): drop 8 orphan interaction hooks + 8 types

export type { WorkflowStep, WorkflowState, WorkflowData, UseWorkflowReturn } from './useWorkflow';
export type { EditorState, EditorOperations, TimelineClip } from './useEditor';

// 重新导出便于使用
export type { UseModelReturn } from './useModel';
export type { UseProjectReturn } from './useProject';
export type { UseVideoReturn } from './useVideo';
export type { SmartGenerateResult, SmartGenerateOptions } from './useSmartModel';
