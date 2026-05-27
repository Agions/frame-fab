/**
 * Pipeline 步骤1：导入与解析 (Import & Parse)
 * 
 * 支持小说、剧本、AI提示词等多种格式导入
 * 自动识别编码、智能章节切分
 */

import { novelService } from '@/core/services/novel.service';
import { logger } from '@/core/utils/logger';

import type {
  PipelineStep,
  StepInput,
  StepOutput,
  StepProgressEvent,
  RetryPolicy,
} from './pipeline.types';
import { PipelineStepId, StepStatus, PipelineExecutionMode, QualityGateDecision } from './pipeline.types';

// ========== 导入步骤配置 ==========

export const IMPORT_STEP_CONFIG = {
  id: 'step-import',
  name: '导入与解析',
  stepId: PipelineStepId.IMPORT,
  mode: PipelineExecutionMode.SEQUENCE,
  retryPolicy: {
    maxRetries: 2,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
    maxDelayMs: 5000,
  },
};

// ========== 导入数据接口 ==========

export interface ImportInput {
  /** 原始内容（小说文本/剧本/提示词） */
  rawContent: string;
  /** 来源类型 */
  sourceType: 'novel' | 'script' | 'prompt';
  /** 文件名（可选） */
  filename?: string;
  /** 语言 */
  language?: 'zh' | 'en';
  /** Allow additional step data */
  [key: string]: unknown;
}

export interface ImportOutput {
  /** 解析后的章节列表 */
  chapters: Array<{
    id: string;
    title: string;
    content: string;
    wordCount: number;
  }>;
  /** 元数据 */
  metadata: {
    title: string;
    author?: string;
    wordCount: number;
    chapterCount: number;
    language: string;
  };
  /** 原始内容 */
  rawContent: string;
  [key: string]: unknown;
}

// ========== ImportStep 实现 ==========

export class ImportStep implements PipelineStep {
  readonly id: string;
  readonly name: string;
  readonly stepId: PipelineStepId;
  readonly mode: PipelineExecutionMode = PipelineExecutionMode.SEQUENCE;
  readonly retryPolicy: RetryPolicy;
  readonly dependencies?: PipelineStepId[];
  readonly parallelKeys?: string[];
  onProgress?: (event: StepProgressEvent) => void;

  constructor(config?: Partial<PipelineStep>) {
    this.id = config?.id ?? IMPORT_STEP_CONFIG.id;
    this.name = config?.name ?? IMPORT_STEP_CONFIG.name;
    this.stepId = config?.stepId ?? PipelineStepId.IMPORT;
    this.retryPolicy = config?.retryPolicy ?? IMPORT_STEP_CONFIG.retryPolicy;
    this.dependencies = config?.dependencies;
    this.parallelKeys = config?.parallelKeys;
  }

  async execute(input: StepInput): Promise<StepOutput> {
    const startTime = Date.now();
    const context = input.context;

    logger.info(`[ImportStep] Starting import for workflow ${input.workflowId}`);

    try {
      // 获取输入数据
      const importInput = input.prevStepOutputs?.get(this.stepId)?.data as ImportInput 
        ?? input.context.getVariable<ImportInput>('importInput');

      if (!importInput?.rawContent) {
        throw new Error('No content to import');
      }

      this.reportProgress(10, '正在识别内容格式...');

      // 检测内容类型
      const detectedType = this.detectContentType(importInput.rawContent);
      logger.debug(`[ImportStep] Detected type: ${detectedType}`);

      this.reportProgress(30, '正在解析内容结构...');

      let result: ImportOutput;

      if (importInput.sourceType === 'novel' || detectedType === 'novel') {
        // 调用小说解析服务
        const parseResult = await novelService.parseNovel(
          importInput.rawContent,
          {}
        );

        result = {
          chapters: parseResult.chapters.map((ch, idx) => ({
            id: ch.id ?? `ch-${idx}`,
            title: ch.title || `第${idx + 1}章`,
            content: ch.content,
            wordCount: ch.wordCount,
          })),
          metadata: {
            title: parseResult.title || importInput.filename || '未命名',
            author: parseResult.author,
            wordCount: parseResult.totalWords,
            chapterCount: parseResult.chapters.length,
            language: importInput.language || 'zh',
          },
          rawContent: importInput.rawContent,
        };
      } else {
        // 非小说格式：直接作为单章处理
        result = {
          chapters: [{
            id: 'ch-1',
            title: importInput.filename || '内容',
            content: importInput.rawContent,
            wordCount: importInput.rawContent.length,
          }],
          metadata: {
            title: importInput.filename || '未命名',
            wordCount: importInput.rawContent.length,
            chapterCount: 1,
            language: importInput.language || 'zh',
          },
          rawContent: importInput.rawContent,
        };
      }

      this.reportProgress(90, '解析完成');

      // 保存到上下文
      context.setVariable('chapters', result.chapters);
      context.setVariable('projectMetadata', result.metadata);
      context.setVariable('rawContent', result.rawContent);

      logger.success(`[ImportStep] Import completed: ${result.chapters.length} chapters`);

      return {
        stepId: this.stepId,
        status: StepStatus.COMPLETED,
        data: result,
        metrics: {
          durationMs: Date.now() - startTime,
          framesProcessed: result.chapters.length,
        },
        qualityGate: QualityGateDecision.PASS,
        startTime,
        endTime: Date.now(),
        retryCount: 0,
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[ImportStep] Import failed: ${errorMsg}`);

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
    this.onProgress?.({
      stepId: this.stepId,
      progress,
      message,
    });
  }

  /**
   * 检测内容类型
   */
  private detectContentType(content: string): 'novel' | 'script' | 'prompt' {
    const trimmed = content.trim();
    
    // 剧本特征：包含"第X场"、场景描述等
    if (/第[一二三四五六七八九十\d]+场|第\s*\d+\s*场/.test(trimmed)) {
      return 'script';
    }

    // 提示词特征：以"/"或"#"开头
    if (/^(\/|#)/.test(trimmed)) {
      return 'prompt';
    }

    // 默认小说
    return 'novel';
  }
}

// ========== 创建默认导入步骤工厂 ==========

export function createImportStep(config?: Partial<PipelineStep>): ImportStep {
  return new ImportStep(config);
}

export default ImportStep;
