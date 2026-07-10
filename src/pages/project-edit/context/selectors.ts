import { useStoryboard } from '@/shared/stores/storyboard.store';

import { useProjectExport } from '../hooks/useProjectExport';
import { useScriptStep } from '../hooks/useScriptStep';

import { useProjectEdit } from './ProjectEditContext';

/** Step 0: 导入小说/剧本 所需的 context 子集。 */
export function useStepImportContext() {
  const { state, actions } = useProjectEdit();
  return {
    content: state.content,
    loading: state.loading,
    onContentLoad: actions.loadContent,
    onRemove: actions.removeContent,
  };
}

/** Step 1: AI 解析内容 所需的 context 子集。 */
export function useStepAnalysisContext() {
  const { state, actions } = useProjectEdit();
  return {
    content: state.content,
    novelMetadata: state.novelMetadata,
    loading: state.loading,
    storyAnalysis: state.storyAnalysis,
    analysisDraft: state.analysisDraft,
    analysisState: state.analysisState,
    onContentLoad: actions.loadContent,
    onRemove: actions.removeContent,
    onAnalyze: actions.analyzeContent,
    onAccept: actions.acceptAnalysis,
    onDraftChange: actions.setAnalysisDraft,
  };
}

/** Step 2: 编辑剧本 所需的 context 子集。 */
export function useStepScriptContext() {
  const { scriptText, saveScriptFromSegments } = useScriptStep();
  const { actions } = useProjectEdit();
  return {
    scriptText,
    onExportScript: actions.exportScript,
    onSaveScript: saveScriptFromSegments,
  };
}

/** Step 3: 分镜设计 所需的 context 子集。 */
export function useStepStoryboardContext() {
  const { state, actions } = useProjectEdit();
  const storyboard = useStoryboard();
  return {
    frames: storyboard.frames,
    selectedFrame: storyboard.selectedFrame,
    commentDraft: state.commentDraft,
    versionLabel: state.versionLabel,
    compareLeftVersionId: storyboard.compareLeftVersionId,
    compareRightVersionId: storyboard.compareRightVersionId,
    versionDiff: storyboard.versionDiff,
    versions: storyboard.versions,
    onFramesChange: storyboard.setFrames,
    onFrameSelect: storyboard.selectFrame,
    onBuildDraft: actions.buildStoryboardDraft,
    onAddComment: actions.addFrameComment,
    onSaveVersion: actions.saveStoryboardVersion,
    onCompareVersions: actions.compareVersions,
    onRollback: actions.rollbackVersion,
    onCommentDraftChange: actions.setCommentDraft,
    onLeftVersionChange: storyboard.setCompareLeft,
    onRightVersionChange: storyboard.setCompareRight,
    onVersionLabelChange: actions.setVersionLabel,
  };
}

/** Step 4: 角色设计 所需的 context 子集。 */
export function useStepCharacterContext() {
  const { state, actions } = useProjectEdit();
  return {
    characters: state.characters,
    onChange: actions.setCharacters,
  };
}

/** Step 5: 场景渲染 所需的 context 子集。 */
export function useStepRenderContext() {
  const storyboard = useStoryboard();
  const { actions } = useProjectEdit();
  return {
    frames: storyboard.frames,
    onApplyRenderedFrame: actions.applyRenderedFrame,
  };
}

/** Step 6: 动态合成 所需的 context 子集。 */
export function useStepCompositionContext() {
  const storyboard = useStoryboard();
  const { actions } = useProjectEdit();
  return {
    frames: storyboard.frames,
    onCompositionChange: actions.setComposition,
  };
}

/** Step 7: 配音配乐 所需的 context 子集。 */
export function useStepAudioContext() {
  const { state, actions } = useProjectEdit();
  const storyboard = useStoryboard();
  return {
    audioConfig: state.audioConfig,
    audioGenerating: state.audioGenerating,
    frames: storyboard.frames,
    onConfigChange: actions.setAudioConfig,
    onGenerateVoices: actions.generateVoices,
  };
}

/** Step 8: 视频导出 所需的 context 子集。 */
export function useStepExportContext() {
  const { actions } = useProjectEdit();
  const storyboard = useStoryboard();
  const { exportPreset, exportSettings, setExportPreset, mergeExportSettings } = useProjectExport();
  return {
    exportPreset,
    exportSettings,
    framesCount: storyboard.frames.length,
    onPresetChange: setExportPreset,
    onExportSettingsChange: mergeExportSettings,
    onSaveProject: actions.saveProject,
    onLocateIssue: actions.locateIssueFrame,
  };
}
