import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { useProject } from '@/core/hooks/useProject';
import {
  aiService,
  audioPipelineService,
  collaborationService,
  costService,
  reviewExportService,
  storyAnalysisService,
  tauriService,
} from '@/core/services';
import type { QualityGateIssue } from '@/core/services';
import { logger } from '@/core/utils/logger';
import type { ScriptImportMetadata } from '@/features/script/components/NovelImporter';
import { toast } from '@/shared/components/ui/toast';
import { useStoryboard } from '@/shared/stores/storyboard.store';
import type { Character, CompositionProject, StoryAnalysis } from '@/shared/types';
import type { AudioTrackConfig } from '@/shared/types/audio';
import type { StoryboardFrame } from '@/shared/types/storyboard';

import type { ProjectEditContextValue } from './project-edit-state';
import { initialProjectEditState } from './project-edit-state';

export const ProjectEditContext = createContext<ProjectEditContextValue | null>(null);

/** 在 ProjectEditProvider 内部使用，获取完整的 state + actions。 */
export function useProjectEdit(): ProjectEditContextValue {
  const ctx = useContext(ProjectEditContext);
  if (!ctx) {
    throw new Error('useProjectEdit must be used within ProjectEditProvider');
  }
  return ctx;
}

interface ProviderProps {
  children: React.ReactNode;
  /** 页面级只读值：名称 / 描述由 Header 中的 input 管理，但 handler 需要访问。 */
  projectMetadata: {
    name: string;
    description: string;
    exportPreset: '9:16' | '16:9' | '1:1';
    exportSettings: Record<string, unknown>;
  };
  /** 初始焦点 frame（URL 参数） */
  initialFocusFrameId?: string;
  /** 初始加载数据（来自 useProjectLoader） */
  initialData?: {
    content?: string;
    novelMetadata?: ScriptImportMetadata | null;
    storyAnalysis?: StoryAnalysis | null;
    audioConfig?: AudioTrackConfig;
    characters?: Character[];
    composition?: CompositionProject | null;
    script?: string;
  } | null;
}

export function ProjectEditProvider({
  children,
  projectMetadata,
  initialFocusFrameId,
  initialData,
}: ProviderProps) {
  const { project, setSaving, setCurrentStep, updateProject } = useProject();

  const storyboard = useStoryboard();

  // --- 页面级 state ---

  const [content, setContent] = useState(initialData?.content ?? initialProjectEditState.content);
  const [novelMetadata, setNovelMetadata] = useState<ScriptImportMetadata | null>(
    initialData?.novelMetadata ?? initialProjectEditState.novelMetadata
  );
  const [loading, setLoading] = useState(initialProjectEditState.loading);
  const [storyAnalysis, setStoryAnalysis] = useState<StoryAnalysis | null>(
    initialData?.storyAnalysis ?? initialProjectEditState.storyAnalysis
  );
  const [analysisDraft, setAnalysisDraft] = useState(
    (initialData?.storyAnalysis ? JSON.stringify(initialData.storyAnalysis, null, 2) : '') ||
      initialProjectEditState.analysisDraft
  );
  const [analysisState, setAnalysisState] = useState<'idle' | 'generated' | 'accepted'>(
    initialData?.storyAnalysis ? 'accepted' : initialProjectEditState.analysisState
  );
  const [focusFrameId, setFocusFrameId] = useState<string | undefined>(
    initialFocusFrameId ?? initialProjectEditState.focusFrameId
  );
  const [commentDraft, setCommentDraft] = useState(initialProjectEditState.commentDraft);
  const [versionLabel, setVersionLabel] = useState(initialProjectEditState.versionLabel);
  const [audioConfig, setAudioConfig] = useState<AudioTrackConfig>(
    initialData?.audioConfig ?? initialProjectEditState.audioConfig
  );
  const [audioEditorKey, setAudioEditorKey] = useState(
    initialData?.audioConfig ? `audio-${Date.now()}` : 'audio-init'
  );
  const [audioGenerating, setAudioGenerating] = useState(initialProjectEditState.audioGenerating);
  const [characters, setCharacters] = useState<Character[]>(
    initialData?.characters ?? initialProjectEditState.characters
  );
  const [composition, setComposition] = useState<CompositionProject | null>(
    initialData?.composition ?? initialProjectEditState.composition
  );

  // scriptText 由 useScriptStep 在外层管理，这里通过 ref 桥接
  const scriptTextRef = useRef('');

  const setScriptTextBridge = useCallback((text: string) => {
    scriptTextRef.current = text;
  }, []);

  // --- actions ---

  const handleContentLoad = useCallback(
    (newContent: string, metadata: ScriptImportMetadata) => {
      setContent(newContent);
      setNovelMetadata(metadata);
      setStoryAnalysis(null);
      storyboard.setFrames([]);
      setAnalysisDraft('');
      setAnalysisState('idle');
      storyboard.selectFrame(null);
      storyboard.setComments([]);
      storyboard.setVersions([]);
      setCommentDraft('');
      setVersionLabel('');
      storyboard.setCompareLeft(undefined);
      storyboard.setCompareRight(undefined);
      storyboard.setVersionDiff(null);
    },
    [storyboard]
  );

  const handleContentRemove = useCallback(() => {
    setContent('');
    setNovelMetadata(null);
    setStoryAnalysis(null);
    storyboard.setFrames([]);
    setAnalysisDraft('');
    setAnalysisState('idle');
    setAudioConfig(initialProjectEditState.audioConfig);
    scriptTextRef.current = '';
  }, [storyboard]);

  const buildStoryboardDraft = useCallback((analysis: StoryAnalysis): StoryboardFrame[] => {
    const draft = analysis.chapters.slice(0, 20).map((chapter, index) => ({
      id: `frame_${Date.now()}_${index}`,
      title: chapter.title ?? `分镜 ${index + 1}`,
      sceneDescription: chapter.summary ?? '',
      composition: index % 2 === 0 ? '三分法' : '中心构图',
      cameraType: index % 3 === 0 ? 'wide' : index % 3 === 1 ? 'medium' : 'closeup',
      dialogue: chapter.keyEvents?.[0] ?? '',
      duration: 5,
    }));
    return draft.length > 0
      ? draft
      : [
          {
            id: `frame_${Date.now()}_0`,
            title: '分镜 1',
            sceneDescription: analysis.summary ?? '',
            composition: '三分法',
            cameraType: 'medium',
            dialogue: '',
            duration: 5,
          },
        ];
  }, []);

  const handleApplyRenderedFrame = useCallback(
    (frameId: string, imageUrl: string) => {
      storyboard.setFrames((prev: StoryboardFrame[]) =>
        prev.map((frame) => (frame.id === frameId ? { ...frame, imageUrl } : frame))
      );
    },
    [storyboard.setFrames]
  );

  const handleAnalyzeContent = useCallback(async () => {
    if (!content) {
      toast.error('请先导入小说/剧本内容');
      return;
    }
    try {
      setLoading(true);
      toast.info('正在结构化分析内容，请稍候...');
      const analyzed = await storyAnalysisService.analyze(content, {
        provider: 'alibaba',
        model: 'qwen-3.5',
        maxRetries: 2,
        projectId: project?.id,
      });
      setStoryAnalysis(analyzed);
      setAnalysisDraft(JSON.stringify(analyzed, null, 2));
      setAnalysisState('generated');
      toast.success('结构化解析完成，请确认结果后继续');
    } catch (error) {
      logger.error('AI解析失败:', error);
      toast.error('AI解析失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  }, [content, project?.id]);

  const handleAcceptAnalysis = useCallback(async () => {
    if (!analysisDraft.trim()) {
      toast.error('请先生成解析结果');
      return;
    }
    try {
      const parsed = JSON.parse(analysisDraft) as StoryAnalysis;
      setStoryAnalysis(parsed);
      setAnalysisState('accepted');
      if (storyboard.frames.length === 0) {
        storyboard.setFrames(buildStoryboardDraft(parsed));
      }
      setLoading(true);
      toast.info('正在根据解析结果生成剧本...');
      const generatedScript = await aiService.generate(
        `请基于以下故事结构生成适合视频脚本制作的剧本：\n\n${JSON.stringify(parsed, null, 2)}\n\n要求：按场景输出，包含旁白、对白、动作描述。`,
        { model: 'gpt-4', provider: 'openai' }
      );
      setScriptTextBridge(generatedScript);
      toast.success('剧本生成完成');
      setCurrentStep(2);
    } catch (error) {
      logger.error('接受解析结果失败:', error);
      const msg = error instanceof Error ? error.message : '未知错误';
      if (msg.includes('JSON') || msg.includes('parse')) {
        toast.error('解析 JSON 格式无效，请修正后重试');
      } else {
        toast.error(`生成剧本失败: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }, [analysisDraft, storyboard, buildStoryboardDraft, setCurrentStep, setScriptTextBridge]);

  const handleAddFrameComment = useCallback(() => {
    if (!project?.id || !storyboard.selectedFrame || !commentDraft.trim()) return;
    collaborationService.addComment({
      projectId: project.id,
      frameId: storyboard.selectedFrame.id,
      content: commentDraft.trim(),
      author: 'current-user',
    });
    storyboard.setComments(collaborationService.listComments(project.id));
    setCommentDraft('');
  }, [project?.id, storyboard, commentDraft]);

  const handleSaveStoryboardVersion = useCallback(() => {
    if (!project?.id) return;
    collaborationService.saveVersion({
      projectId: project.id,
      label: versionLabel.trim() ?? `版本-${new Date().toLocaleString()}`,
      createdBy: 'current-user',
      payload: storyboard.frames,
    });
    const versions = collaborationService.listVersions(project.id);
    storyboard.setVersions(versions);
    setVersionLabel('');
    storyboard.setCompareLeft(versions[versions.length - 1]?.id);
    toast.success('已保存分镜版本快照');
  }, [project?.id, versionLabel, storyboard]);

  const handleCompareVersions = useCallback(() => {
    if (!storyboard.compareLeftVersionId || !storyboard.compareRightVersionId) {
      toast.warning('请选择两个版本进行对比');
      return;
    }
    const diff = collaborationService.diffVersions(
      storyboard.compareLeftVersionId,
      storyboard.compareRightVersionId
    );
    storyboard.setVersionDiff(diff);
  }, [storyboard]);

  const handleRollbackVersion = useCallback(() => {
    if (!project?.id || !storyboard.compareLeftVersionId) {
      toast.warning('请选择要回滚的版本');
      return;
    }
    const payload = collaborationService.rollback(project.id, storyboard.compareLeftVersionId);
    if (Array.isArray(payload)) {
      storyboard.setFrames(payload as StoryboardFrame[]);
      toast.success('已回滚到所选版本');
      return;
    }
    toast.error('回滚失败，未找到对应版本');
  }, [project?.id, storyboard]);

  const handleGenerateVoices = useCallback(async () => {
    const currentScriptText = scriptTextRef.current;
    if (!currentScriptText.trim()) {
      toast.warning('请先完成剧本生成');
      return;
    }
    try {
      setAudioGenerating(true);
      toast.info('正在生成配音轨道，请稍候...');
      const result = await audioPipelineService.generateVoiceTracks(
        currentScriptText,
        storyAnalysis,
        { maxLines: 20, projectId: project?.id }
      );
      setAudioConfig((prev) => ({
        ...prev,
        voiceTracks: result.voiceTracks as AudioTrackConfig['voiceTracks'],
      }));
      setAudioEditorKey(`audio-${Date.now()}`);
      if (result.failedLines.length > 0) {
        toast.warning(
          `已生成 ${result.voiceTracks.length} 条配音，${result.failedLines.length} 条失败`
        );
      } else {
        toast.success(`已生成 ${result.voiceTracks.length} 条配音`);
      }
    } catch (error) {
      logger.error('自动生成配音失败:', error);
      toast.error('自动生成配音失败');
    } finally {
      setAudioGenerating(false);
    }
  }, [storyAnalysis, project?.id]);

  const handleSaveProject = useCallback(async () => {
    try {
      if (!projectMetadata.name.trim()) {
        toast.error('请填写项目名称');
        return;
      }
      if (!content) {
        toast.error('请先导入小说/剧本内容');
        return;
      }
      setSaving(true);
      const now = new Date().toISOString();
      const projectData = {
        id: project?.id ?? uuid(),
        name: projectMetadata.name.trim(),
        description: projectMetadata.description.trim(),
        content: content,
        createdAt: project?.createdAt ?? now,
        updatedAt: now,
        novelMetadata: novelMetadata ?? undefined,
        storyAnalysis: storyAnalysis ?? undefined,
        storyboardFrames: storyboard.frames.length > 0 ? storyboard.frames : undefined,
        storyboardComments: storyboard.comments.length > 0 ? storyboard.comments : undefined,
        storyboardVersions: storyboard.versions.length > 0 ? storyboard.versions : undefined,
        characters: characters.length > 0 ? characters : undefined,
        composition: composition ?? undefined,
        audioConfig: audioConfig,
        exportPreset: projectMetadata.exportPreset,
        exportSettings: projectMetadata.exportSettings,
        script: scriptTextRef.current || undefined,
      };
      await tauriService.saveProjectFile(projectData.id, JSON.stringify(projectData));
      toast.success('项目保存成功');
      updateProject(projectData as Parameters<typeof updateProject>[0]);
    } catch (error) {
      logger.error('保存项目失败:', error);
      toast.error('保存项目失败，请稍后再试');
    } finally {
      setSaving(false);
    }
  }, [
    content,
    project,
    projectMetadata,
    novelMetadata,
    storyAnalysis,
    storyboard,
    characters,
    composition,
    audioConfig,
    setSaving,
    updateProject,
  ]);

  const handleExportReviewNotes = useCallback(async () => {
    if (!project?.id) {
      toast.warning('请先加载项目后再导出评审记录');
      return;
    }
    try {
      const projectComments = collaborationService.listComments(project.id);
      const projectVersions = collaborationService.listVersions(project.id);
      const projectCostStats = costService.getProjectStats(project.id);
      const projectCostRecords = costService.getRecords(project.id).slice(0, 30);
      const mdContent = reviewExportService.toMarkdown({
        project: {
          id: project.id,
          name: projectMetadata.name || project.name || '未命名项目',
          storyboardFrameCount: storyboard.frames.length,
        },
        comments: projectComments,
        versions: projectVersions,
        costStats: projectCostStats,
        costRecords: projectCostRecords,
        evaluationSummary: undefined,
      });
      const saved = await reviewExportService.saveMarkdownToFile(
        `${project.name}_评审记录.md`,
        mdContent,
        {
          projectId: project.id,
          projectName: projectMetadata.name || project.name || '未命名项目',
          source: 'project_edit',
        }
      );
      if (saved) toast.success('评审记录导出成功');
    } catch (error) {
      logger.error('导出评审记录失败:', error);
      toast.error('导出评审记录失败');
    }
  }, [project, projectMetadata.name, storyboard.frames.length]);

  const handleLocateIssueFrame = useCallback(
    (issue: QualityGateIssue) => {
      if (!issue.frameId) {
        toast.info('该问题暂无具体分镜定位信息');
        return;
      }
      const exists = storyboard.frames.some((frame) => frame.id === issue.frameId);
      if (!exists) {
        toast.warning('定位分镜不存在，可能已被删除');
        return;
      }
      setCurrentStep(3);
      setFocusFrameId(issue.frameId);
      const frameIndex = typeof issue.frameIndex === 'number' ? issue.frameIndex + 1 : undefined;
      toast.success(`已定位到${frameIndex ? `第 ${frameIndex} 镜` : '目标分镜'}`);
    },
    [storyboard.frames, setCurrentStep]
  );

  const state = {
    content,
    novelMetadata,
    loading,
    storyAnalysis,
    analysisDraft,
    analysisState,
    focusFrameId,
    commentDraft,
    versionLabel,
    audioConfig,
    audioEditorKey,
    audioGenerating,
    characters,
    composition,
  };

  const actions = {
    loadContent: handleContentLoad,
    removeContent: handleContentRemove,
    analyzeContent: handleAnalyzeContent,
    acceptAnalysis: handleAcceptAnalysis,
    setAnalysisDraft,
    addFrameComment: handleAddFrameComment,
    saveStoryboardVersion: handleSaveStoryboardVersion,
    compareVersions: handleCompareVersions,
    rollbackVersion: handleRollbackVersion,
    buildStoryboardDraft: () => {
      if (storyAnalysis) {
        storyboard.setFrames(buildStoryboardDraft(storyAnalysis));
      }
    },
    setCommentDraft,
    setVersionLabel,
    setFocusFrameId,
    applyRenderedFrame: handleApplyRenderedFrame,
    generateVoices: handleGenerateVoices,
    setAudioConfig,
    saveProject: handleSaveProject,
    exportReviewNotes: handleExportReviewNotes,
    locateIssueFrame: handleLocateIssueFrame,
    exportScript: (format: string) => {
      toast.info(`导出脚本为 ${format.toUpperCase()} 格式`);
    },
    setCharacters,
    setComposition,
  };

  const value = useMemo(() => ({ state, actions }), [state, actions, handleLocateIssueFrame]);

  return <ProjectEditContext.Provider value={value}>{children}</ProjectEditContext.Provider>;
}
