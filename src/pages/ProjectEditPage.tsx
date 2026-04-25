import {
  ArrowLeftOutlined,
  SaveOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  EditOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Spin,
  Result,
  Steps,
} from 'antd';
import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';

import CostDashboard from '@/components/business/CostDashboard';
import { aiService, tauriService , audioPipelineService, collaborationService, costService, qualityGateService, reviewExportService, storyAnalysisService } from '@/core/services';
import type { EvaluationScores, FrameComment, QualityGateIssue, StoryboardVersion, VersionDiffSummary } from '@/core/services';
import type { ExportSettings, StoryAnalysis, Character, CompositionProject } from '@/core/types';
import { runWhenIdle } from '@/core/utils/idle';
import { logger } from '@/core/utils/logger';
import type { AudioTrackConfig } from '@/features/audio/components/AudioEditor';
import type { NovelMetadata } from '@/features/script/components/NovelImporter';
import type { StoryboardFrame } from '@/features/storyboard/components/StoryboardEditor';


import {
  StepContentImport,
  StepContentAIAnalysis,
  StepContentScript,
  StepContentStoryboard,
  StepContentCharacter,
  StepContentRender,
  StepContentComposition,
  StepContentAudio,
  StepContentExport,
} from './ProjectEdit/components';
import styles from './ProjectEdit.module.less';


export interface ProjectData {
  id: string;
  name: string;
  description: string;
  content: string;
  novelMetadata?: NovelMetadata;
  storyAnalysis?: StoryAnalysis;
  storyboardFrames?: StoryboardFrame[];
  storyboardComments?: FrameComment[];
  storyboardVersions?: StoryboardVersion[];
  characters?: Character[];
  composition?: CompositionProject;
  audioConfig?: AudioTrackConfig;
  exportPreset?: '9:16' | '16:9' | '1:1';
  exportSettings?: Partial<ExportSettings>;
  evaluationSummary?: EvaluationScores;
  evaluationReport?: { summary?: EvaluationScores };
  script?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 项目编辑页面
 * 支持创建新项目或编辑现有项目
 */
const ProjectEdit: React.FC = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [content, setContent] = useState<string>('');
  const [novelMetadata, setNovelMetadata] = useState<NovelMetadata | null>(null);
  const [scriptText, setScriptText] = useState<string>('');
  const [storyAnalysis, setStoryAnalysis] = useState<StoryAnalysis | null>(null);
  const [storyboardFrames, setStoryboardFrames] = useState<StoryboardFrame[]>([]);
  const [analysisDraft, setAnalysisDraft] = useState<string>('');
  const [analysisState, setAnalysisState] = useState<'idle' | 'generated' | 'accepted'>('idle');
  const [selectedFrame, setSelectedFrame] = useState<StoryboardFrame | null>(null);
  const [storyboardComments, setStoryboardComments] = useState<FrameComment[]>([]);
  const [storyboardVersions, setStoryboardVersions] = useState<StoryboardVersion[]>([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [versionLabel, setVersionLabel] = useState('');
  const [compareLeftVersionId, setCompareLeftVersionId] = useState<string | undefined>(undefined);
  const [compareRightVersionId, setCompareRightVersionId] = useState<string | undefined>(undefined);
  const [versionDiff, setVersionDiff] = useState<VersionDiffSummary | null>(null);
  const [focusFrameId, setFocusFrameId] = useState<string | undefined>(undefined);
  const [audioConfig, setAudioConfig] = useState<AudioTrackConfig>({
    voiceTracks: [],
    backgroundMusic: null,
    soundEffects: [],
    masterVolume: 80,
    voiceVolume: 80,
    musicVolume: 50,
    effectVolume: 70,
  });
  const [audioEditorKey, setAudioEditorKey] = useState('audio-init');
  const [audioGenerating, setAudioGenerating] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [composition, setComposition] = useState<CompositionProject | null>(null);
  const [exportPreset, setExportPreset] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [exportSettings, setExportSettings] = useState<Partial<ExportSettings>>({
    format: 'mp4',
    quality: 'high',
    resolution: '1080p',
    frameRate: 30,
  });
  const [isNewProject, setIsNewProject] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluationSummary: EvaluationScores | undefined = project?.evaluationReport?.summary || project?.evaluationSummary;

  const exportQualityGate = useMemo(
    () =>
      qualityGateService.evaluate({
        storyboardFrames,
        evaluationSummary,
      }),
    [storyboardFrames, evaluationSummary]
  );

  const preloadByStep: Record<number, Array<() => Promise<unknown>>> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
  };

  const preloadStepModules = (step: number) => {
    const tasks = preloadByStep[step] || [];
    tasks.forEach(task => { void task(); });
  };

  useEffect(() => {
    const tasks = preloadByStep[currentStep] || [];
    if (tasks.length === 0) return;
    const warmup = () => preloadStepModules(currentStep);
    return runWhenIdle(warmup, { timeoutMs: 120 });
  }, [currentStep]);

  // 初始化 - 加载项目数据（如果是编辑现有项目）
  useEffect(() => {
    if (projectId) {
      setInitialLoading(true);
      setIsNewProject(false);

      tauriService.readText(projectId).then(projectText => {
          const projectData = JSON.parse(projectText) as ProjectData;
          setProject(projectData);
          form.setFieldsValue({
            name: projectData.name,
            description: projectData.description
          });

          if (projectData.content) setContent(projectData.content);
          if (projectData.novelMetadata) setNovelMetadata(projectData.novelMetadata);
          if (projectData.storyAnalysis) {
            setStoryAnalysis(projectData.storyAnalysis);
            setAnalysisDraft(JSON.stringify(projectData.storyAnalysis, null, 2));
            setAnalysisState('accepted');
          }
          if (Array.isArray(projectData.storyboardFrames)) setStoryboardFrames(projectData.storyboardFrames);
          if (Array.isArray(projectData.storyboardComments) || Array.isArray(projectData.storyboardVersions)) {
            collaborationService.hydrate(
              projectData.id,
              projectData.storyboardComments || [],
              projectData.storyboardVersions || []
            );
            setStoryboardComments(collaborationService.listComments(projectData.id));
            setStoryboardVersions(collaborationService.listVersions(projectData.id));
          }
          if (projectData.audioConfig) {
            setAudioConfig(projectData.audioConfig);
            setAudioEditorKey(`audio-${Date.now()}`);
          }
          if (Array.isArray(projectData.characters)) setCharacters(projectData.characters);
          if (projectData.composition) setComposition(projectData.composition);
          if (projectData.exportPreset) setExportPreset(projectData.exportPreset);
          if (projectData.exportSettings) setExportSettings(projectData.exportSettings);
          if (projectData.script) {
            setScriptText(projectData.script);
            setCurrentStep(2);
          } else if (projectData.content) {
            setCurrentStep(1);
          }

          const search = new URLSearchParams(location.search);
          const frameId = search.get('frameId');
          const stepValue = search.get('step');
          if (frameId) {
            setCurrentStep(3);
            setFocusFrameId(frameId);
          } else if (stepValue) {
            const nextStep = Number(stepValue);
            if (Number.isInteger(nextStep) && nextStep >= 0 && nextStep <= 8) {
              setCurrentStep(nextStep);
            }
          }

          setError(null);
        })
        .catch(err => {
          logger.error('加载项目失败:', err);
          setError('加载项目失败，请确认项目文件是否存在');
          message.error('加载项目失败');
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [projectId, form, location.search]);

  // --- 事件处理函数 ---

  const handleContentLoad = (newContent: string, metadata: NovelMetadata) => {
    setContent(newContent);
    setNovelMetadata(metadata);
    setStoryAnalysis(null);
    setStoryboardFrames([]);
    setAnalysisDraft('');
    setAnalysisState('idle');
    setSelectedFrame(null);
    setStoryboardComments([]);
    setStoryboardVersions([]);
    setCommentDraft('');
    setVersionLabel('');
    setCompareLeftVersionId(undefined);
    setCompareRightVersionId(undefined);
    setVersionDiff(null);
    if (currentStep === 0) setCurrentStep(1);
  };

  const handleContentRemove = () => {
    setContent('');
    setNovelMetadata(null);
    setScriptText('');
    setStoryAnalysis(null);
    setStoryboardFrames([]);
    setAnalysisDraft('');
    setAnalysisState('idle');
    setAudioConfig({
      voiceTracks: [],
      backgroundMusic: null,
      soundEffects: [],
      masterVolume: 80,
      voiceVolume: 80,
      musicVolume: 50,
      effectVolume: 70,
    });
  };

  const buildStoryboardDraft = (analysis: StoryAnalysis): StoryboardFrame[] => {
    const draft = analysis.chapters.slice(0, 20).map((chapter, index) => ({
      id: `frame_${Date.now()}_${index}`,
      title: chapter.title || `分镜 ${index + 1}`,
      sceneDescription: chapter.summary || '',
      composition: index % 2 === 0 ? '三分法' : '中心构图',
      cameraType: index % 3 === 0 ? 'wide' : index % 3 === 1 ? 'medium' : 'closeup',
      dialogue: chapter.keyEvents?.[0] || '',
      duration: 5,
    }));
    return draft.length > 0 ? draft : [{
      id: `frame_${Date.now()}_0`,
      title: '分镜 1',
      sceneDescription: analysis.summary || '',
      composition: '三分法',
      cameraType: 'medium',
      dialogue: '',
      duration: 5,
    }];
  };

  const handleApplyRenderedFrame = (frameId: string, imageUrl: string) => {
    setStoryboardFrames(prev =>
      prev.map(frame => (frame.id === frameId ? { ...frame, imageUrl } : frame))
    );
  };

  const handleAddFrameComment = () => {
    if (!project?.id || !selectedFrame || !commentDraft.trim()) return;
    collaborationService.addComment({
      projectId: project.id,
      frameId: selectedFrame.id,
      content: commentDraft.trim(),
      author: 'current-user',
    });
    setStoryboardComments(collaborationService.listComments(project.id));
    setCommentDraft('');
  };

  const handleSaveStoryboardVersion = () => {
    if (!project?.id) return;
    collaborationService.saveVersion({
      projectId: project.id,
      label: versionLabel.trim() || `版本-${new Date().toLocaleTimeString()}`,
      createdBy: 'current-user',
      payload: storyboardFrames,
    });
    const versions = collaborationService.listVersions(project.id);
    setStoryboardVersions(versions);
    setVersionLabel('');
    setCompareLeftVersionId(versions[versions.length - 1]?.id);
    message.success('已保存分镜版本快照');
  };

  const handleCompareVersions = () => {
    if (!compareLeftVersionId || !compareRightVersionId) {
      message.warning('请选择两个版本进行对比');
      return;
    }
    const diff = collaborationService.diffVersions(compareLeftVersionId, compareRightVersionId);
    setVersionDiff(diff);
  };

  const handleRollbackVersion = () => {
    if (!project?.id || !compareLeftVersionId) {
      message.warning('请选择要回滚的版本');
      return;
    }
    const payload = collaborationService.rollback(project.id, compareLeftVersionId);
    if (Array.isArray(payload)) {
      setStoryboardFrames(payload as StoryboardFrame[]);
      message.success('已回滚到所选版本');
      return;
    }
    message.error('回滚失败，未找到对应版本');
  };

  const handleGenerateVoices = async () => {
    if (!scriptText.trim()) {
      message.warning('请先完成剧本生成');
      return;
    }
    try {
      setAudioGenerating(true);
      message.info('正在生成配音轨道，请稍候...');
      const result = await audioPipelineService.generateVoiceTracks(scriptText, storyAnalysis, {
        maxLines: 20,
        projectId: project?.id,
      });
      setAudioConfig(prev => ({
        ...prev,
        voiceTracks: result.voiceTracks as AudioTrackConfig['voiceTracks'],
      }));
      setAudioEditorKey(`audio-${Date.now()}`);
      if (result.failedLines.length > 0) {
        message.warning(`已生成 ${result.voiceTracks.length} 条配音，${result.failedLines.length} 条失败`);
      } else {
        message.success(`已生成 ${result.voiceTracks.length} 条配音`);
      }
    } catch (error) {
      logger.error('自动生成配音失败:', error);
      message.error('自动生成配音失败');
    } finally {
      setAudioGenerating(false);
    }
  };

  const handleAnalyzeContent = async () => {
    if (!content) {
      message.error('请先导入小说/剧本内容');
      return;
    }
    try {
      setLoading(true);
      message.info('正在结构化分析内容，请稍候...');
      const analyzed = await storyAnalysisService.analyze(content, {
        provider: 'alibaba',
        model: 'qwen-3.5',
        maxRetries: 2,
        projectId: project?.id,
      });
      setStoryAnalysis(analyzed);
      setAnalysisDraft(JSON.stringify(analyzed, null, 2));
      setAnalysisState('generated');
      message.success('结构化解析完成，请确认结果后继续');
    } catch (error) {
      logger.error('AI解析失败:', error);
      message.error('AI解析失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAnalysis = async () => {
    if (!analysisDraft.trim()) {
      message.error('请先生成解析结果');
      return;
    }
    try {
      const parsed = JSON.parse(analysisDraft) as StoryAnalysis;
      setStoryAnalysis(parsed);
      setAnalysisState('accepted');
      if (storyboardFrames.length === 0) {
        setStoryboardFrames(buildStoryboardDraft(parsed));
      }
      setLoading(true);
      message.info('正在根据解析结果生成剧本...');
      const generatedScript = await aiService.generate(
        `请基于以下故事结构生成适合视频脚本制作的剧本：\n\n${JSON.stringify(parsed, null, 2)}\n\n要求：按场景输出，包含旁白、对白、动作描述。`,
        { model: 'gpt-4', provider: 'openai' }
      );
      setScriptText(generatedScript);
      message.success('剧本生成完成');
      setCurrentStep(2);
    } catch (error) {
      logger.error('接受解析结果失败:', error);
      message.error('解析 JSON 格式无效，请修正后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    try {
      await form.validateFields();
      if (!content) {
        message.error('请先导入小说/剧本内容');
        return;
      }
      setSaving(true);
      const formData = form.getFieldsValue();
      const now = new Date().toISOString();
      const projectData: ProjectData = {
        id: project?.id || uuid(),
        name: formData.name,
        description: formData.description,
        content: content,
        createdAt: project?.createdAt || now,
        updatedAt: now,
        novelMetadata: novelMetadata || undefined,
        storyAnalysis: storyAnalysis || undefined,
        storyboardFrames: storyboardFrames.length > 0 ? storyboardFrames : undefined,
        storyboardComments: storyboardComments.length > 0 ? storyboardComments : undefined,
        storyboardVersions: storyboardVersions.length > 0 ? storyboardVersions : undefined,
        characters: characters.length > 0 ? characters : undefined,
        composition: composition || undefined,
        audioConfig: audioConfig,
        exportPreset,
        exportSettings,
        script: scriptText || undefined
      };
      await tauriService.writeText(projectData.id, JSON.stringify(projectData));
      message.success('项目保存成功');
      setProject(projectData);
      if (isNewProject) {
        navigate(`/project/${projectData.id}`);
      }
    } catch (error) {
      logger.error('保存项目失败:', error);
      message.error('保存项目失败，请稍后再试');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => navigate(-1);

  const handleExportScript = (format: string) => {
    message.info(`导出脚本为 ${format.toUpperCase()} 格式`);
  };

  const handleExportReviewNotes = async () => {
    if (!project?.id) {
      message.warning('请先加载项目后再导出评审记录');
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
          name: form.getFieldValue('name') || project.name || '未命名项目',
          storyboardFrameCount: storyboardFrames.length,
        },
        comments: projectComments,
        versions: projectVersions,
        costStats: projectCostStats,
        costRecords: projectCostRecords,
        evaluationSummary,
      });
      const saved = await reviewExportService.saveMarkdownToFile(
        `${project.name}_评审记录.md`,
        mdContent,
        {
          projectId: project.id,
          projectName: form.getFieldValue('name') || project.name || '未命名项目',
          source: 'project_edit',
        },
      );
      if (saved) message.success('评审记录导出成功');
    } catch (error) {
      logger.error('导出评审记录失败:', error);
      message.error('导出评审记录失败');
    }
  };

  const handleLocateIssueFrame = (issue: QualityGateIssue) => {
    if (!issue.frameId) {
      message.info('该问题暂无具体分镜定位信息');
      return;
    }
    const exists = storyboardFrames.some((frame) => frame.id === issue.frameId);
    if (!exists) {
      message.warning('定位分镜不存在，可能已被删除');
      return;
    }
    setCurrentStep(3);
    setFocusFrameId(issue.frameId);
    const frameIndex = typeof issue.frameIndex === 'number' ? issue.frameIndex + 1 : undefined;
    message.success(`已定位到${frameIndex ? `第 ${frameIndex} 镜` : '目标分镜'}`);
  };

  const handleBuildStoryboardDraft = () => {
    if (storyAnalysis) {
      setStoryboardFrames(buildStoryboardDraft(storyAnalysis));
    }
  };

  // --- 渲染步骤内容 ---
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepContentImport
            content={content}
            loading={loading}
            onContentLoad={handleContentLoad}
            onRemove={handleContentRemove}
            onNext={() => setCurrentStep(1)}
          />
        );

      case 1:
        return (
          <StepContentAIAnalysis
            content={content}
            novelMetadata={novelMetadata}
            analysisDraft={analysisDraft}
            analysisState={analysisState}
            loading={loading}
            onContentLoad={handleContentLoad}
            onRemove={handleContentRemove}
            onAnalyze={handleAnalyzeContent}
            onAccept={handleAcceptAnalysis}
            onDraftChange={setAnalysisDraft}
            onPrev={() => setCurrentStep(0)}
          />
        );

      case 2:
        return (
          <StepContentScript
            onExport={handleExportScript}
            onSave={(segments) => setScriptText(segments as unknown as string)}
            onPrev={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        );

      case 3:
        return (
          <StepContentStoryboard
            storyboardFrames={storyboardFrames}
            storyAnalysis={storyAnalysis}
            selectedFrame={selectedFrame}
            focusFrameId={focusFrameId}
            commentDraft={commentDraft}
            versionLabel={versionLabel}
            compareLeftVersionId={compareLeftVersionId}
            compareRightVersionId={compareRightVersionId}
            versionDiff={versionDiff}
            storyboardVersions={storyboardVersions}
            projectId={project?.id}
            onFramesChange={setStoryboardFrames}
            onFrameSelect={setSelectedFrame}
            onBuildDraft={handleBuildStoryboardDraft}
            onAddComment={handleAddFrameComment}
            onSaveVersion={handleSaveStoryboardVersion}
            onCompareVersions={handleCompareVersions}
            onRollback={handleRollbackVersion}
            onCommentDraftChange={setCommentDraft}
            onLeftVersionChange={setCompareLeftVersionId}
            onRightVersionChange={setCompareRightVersionId}
            onVersionLabelChange={setVersionLabel}
            onPrev={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        );

      case 4:
        return (
          <StepContentCharacter
            characters={characters}
            projectId={project?.id}
            onChange={setCharacters}
            onPrev={() => setCurrentStep(3)}
            onNext={() => setCurrentStep(5)}
          />
        );

      case 5:
        return (
          <StepContentRender
            storyboardFrames={storyboardFrames}
            projectId={project?.id}
            onApplyRenderedFrame={handleApplyRenderedFrame}
            onPrev={() => setCurrentStep(4)}
            onNext={() => setCurrentStep(6)}
          />
        );

      case 6:
        return (
          <StepContentComposition
            storyboardFrames={storyboardFrames}
            projectId={project?.id}
            onCompositionChange={setComposition}
            onPrev={() => setCurrentStep(5)}
            onNext={() => setCurrentStep(7)}
          />
        );

      case 7:
        return (
          <StepContentAudio
            audioConfig={audioConfig}
            audioEditorKey={audioEditorKey}
            audioGenerating={audioGenerating}
            scriptText={scriptText}
            storyboardFrames={storyboardFrames}
            onConfigChange={setAudioConfig}
            onGenerateVoices={handleGenerateVoices}
            onPrev={() => setCurrentStep(6)}
            onNext={() => setCurrentStep(8)}
          />
        );

      case 8:
        return (
          <StepContentExport
            exportPreset={exportPreset}
            exportSettings={exportSettings}
            projectId={project?.id}
            projectName={form.getFieldValue('name') || '未命名项目'}
            storyboardFrameCount={storyboardFrames.length}
            qualityGateIssues={exportQualityGate.issues}
            qualityGatePassed={exportQualityGate.passed}
            saving={saving}
            onPresetChange={setExportPreset}
            onExport={setExportSettings}
            onLocateIssue={handleLocateIssueFrame}
            onSave={handleSaveProject}
            onPrev={() => setCurrentStep(7)}
          />
        );

      default:
        return null;
    }
  };

  // --- 渲染 ---
  if (error) {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={error}
        extra={[
          <Button key="back" onClick={handleBack}>
            返回
          </Button>
        ]}
      />
    );
  }

  return (
    <div className={styles.container}>
      <Spin spinning={initialLoading} tip="加载项目中...">
        {/* 顶部 Header */}
        <div className={styles.header}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回
          </Button>
          <h3 style={{ margin: 0 }}>
            {isNewProject ? '创建新项目' : '编辑项目'}
          </h3>
          <Space>
            <Button
              icon={<FileTextOutlined />}
              onClick={handleExportReviewNotes}
              disabled={!project?.id}
            >
              导出评审记录
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveProject}
              loading={saving}
            >
              保存项目
            </Button>
          </Space>
        </div>

        {/* 项目基本信息 */}
        <Card className={styles.card}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{ name: '', description: '' }}
          >
            <Form.Item
              name="name"
              label="项目名称"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="请输入项目名称" maxLength={100} />
            </Form.Item>
            <Form.Item name="description" label="项目描述">
              <Input.TextArea placeholder="请输入项目描述（选填）" rows={2} maxLength={500} />
            </Form.Item>
          </Form>
        </Card>

        {/* 成本面板 */}
        <Suspense fallback={<Spin style={{ width: '100%' }} />}>
          <CostDashboard projectId={project?.id} />
        </Suspense>

        {/* 步骤导航 */}
        <div className={styles.stepsContainer}>
          <Steps
            current={currentStep}
            onChange={setCurrentStep}
            items={[
              { title: '导入', icon: <FileTextOutlined />, description: '小说/剧本' },
              { title: 'AI解析', icon: <ThunderboltOutlined />, description: '智能分析' },
              { title: '剧本', icon: <EditOutlined />, description: '生成剧本' },
              { title: '分镜', icon: <PictureOutlined />, description: '漫画分镜' },
              { title: '角色', icon: <UserOutlined />, description: '角色形象' },
              { title: '渲染', icon: <CheckCircleOutlined />, description: '场景渲染' },
              { title: '合成', icon: <PlayCircleOutlined />, description: '动态效果' },
              { title: '配音', icon: <SoundOutlined />, description: '配音配乐' },
              { title: '导出', icon: <ExportOutlined />, description: '视频导出' },
            ]}
          />
        </div>

        {/* 步骤内容 */}
        <div className={styles.stepsContent}>
          <Suspense fallback={<Spin style={{ width: '100%' }} tip="加载模块中..." />}>
            {renderStepContent()}
          </Suspense>
        </div>
      </Spin>
    </div>
  );
};

export default ProjectEdit;
