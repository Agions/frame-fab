/**
 * Pipeline 步骤2：AI分析与结构化 (AI Analysis)
 * 
 * 识别章节结构、角色、场景
 */

import { logger } from '@/core/utils/logger';

import type {
  PipelineStep,
  StepInput,
  StepOutput,
  StepProgressEvent,
  RetryPolicy,
} from './pipeline.types';
import { PipelineStepId, StepStatus, QualityGateDecision , PipelineExecutionMode } from './pipeline.types';
import type { ImportOutput } from './step-import';

export class AnalysisStep implements PipelineStep {
  readonly id: string;
  readonly name: string;
  readonly stepId: PipelineStepId;
  readonly mode = PipelineExecutionMode.SEQUENCE;
  readonly retryPolicy: RetryPolicy;
  readonly dependencies = [PipelineStepId.IMPORT];
  onProgress?: (event: StepProgressEvent) => void;

  constructor(config?: Partial<PipelineStep>) {
    this.id = config?.id ?? 'step-analysis';
    this.name = config?.name ?? 'AI分析';
    this.stepId = PipelineStepId.ANALYSIS;
    this.retryPolicy = config?.retryPolicy ?? {
      maxRetries: 2,
      initialDelayMs: 1500,
      backoffMultiplier: 2,
      maxDelayMs: 8000,
    };
  }

  async execute(input: StepInput): Promise<StepOutput> {
    const startTime = Date.now();
    const context = input.context;

    logger.info(`[AnalysisStep] Analyzing content for workflow ${input.workflowId}`);

    try {
      const chapters = context.getVariable<ImportOutput['chapters']>('chapters');
      const metadata = context.getVariable<ImportOutput['metadata']>('projectMetadata');

      if (!chapters || chapters.length === 0) {
        throw new Error('No chapters to analyze');
      }

      this.reportProgress(20, '正在识别角色...');
      
      const characterCount = await this.estimateCharacterCount(chapters);
      
      this.reportProgress(50, '正在识别场景...');
      
      const sceneCount = this.estimateSceneCount(chapters);
      
      this.reportProgress(80, '正在生成分析报告...');

      const analysisResult = {
        totalChapters: chapters.length,
        estimatedCharacters: characterCount,
        estimatedScenes: sceneCount,
        chaptersSummary: chapters.map(ch => ({
          id: ch.id,
          title: ch.title,
          wordCount: ch.wordCount,
        })),
        genre: metadata?.title || '通用',
        language: metadata?.language || 'zh',
      };

      context.setVariable('analysisResult', analysisResult);
      context.setVariable('estimatedCharacters', characterCount);
      context.setVariable('estimatedScenes', sceneCount);

      logger.success(`[AnalysisStep] Analysis completed: ${characterCount} characters, ${sceneCount} scenes`);

      return {
        stepId: this.stepId,
        status: StepStatus.COMPLETED,
        data: analysisResult,
        metrics: {
          durationMs: Date.now() - startTime,
          framesProcessed: sceneCount,
        },
        qualityGate: QualityGateDecision.PASS,
        startTime,
        endTime: Date.now(),
        retryCount: 0,
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[AnalysisStep] Analysis failed: ${errorMsg}`);

      return {
        stepId: this.stepId,
        status: StepStatus.FAILED,
        data: undefined,
        error: errorMsg,
        startTime,
        endTime: Date.now(),
        retryCount: 0,
      };
    }
  }

  private reportProgress(progress: number, message: string): void {
    this.onProgress?.({ stepId: this.stepId, progress, message });
  }

  private estimateCharacterCount(chapters: ImportOutput['chapters']): number {
    const allContent = chapters.map(ch => ch.content).join('');
    const namePatterns = [
      /[A-Z][a-z]{1,20}/g,
      /[\u4e00-\u9fa5]{2,4}/g,
    ];
    
    const names = new Set<string>();
    for (const pattern of namePatterns) {
      const matches = allContent.match(pattern);
      if (matches) {
        matches.forEach(n => names.add(n));
      }
    }
    
    return Math.min(names.size, 20);
  }

  private estimateSceneCount(chapters: ImportOutput['chapters']): number {
    return chapters.reduce((sum, ch) => {
      const sceneMarkers = ch.content.match(/第.*?(章|节|幕)/g);
      return sum + (sceneMarkers?.length || 1);
    }, 0);
  }
}

export function createAnalysisStep(config?: Partial<PipelineStep>): AnalysisStep {
  return new AnalysisStep(config);
}

export default AnalysisStep;
