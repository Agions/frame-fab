/**
 * Step Import — 导入步骤实现
 * 展示：另一个 IPipelineStep 实现（文件导入/资源获取）
 */

import { BasePipelineStep, StepStatus, type StepResult, type PipelineContext } from '../engine/step.interface';

/**
 * StepImportConfig — 导入步骤配置
 */
export interface StepImportConfig {
  sourceType: 'novel' | 'video' | 'image';
  sourcePath?: string;
}

/**
 * StepImport — 导入步骤
 * 负责从各种来源导入内容到流水线上下文
 */
export class StepImport extends BasePipelineStep {
  readonly id = 'import';
  readonly name = '导入';
  readonly stepType = 'import';
  readonly dependencies: string[] = [];

  private config: StepImportConfig;

  constructor(config: StepImportConfig) {
    super();
    this.config = config;
  }

  async execute(ctx: PipelineContext): Promise<StepResult> {
    this.reportProgress(0, `正在导入 ${this.config.sourceType} 内容`);

    await this.checkPause();
    this.checkCancelled();

    let data: unknown;

    switch (this.config.sourceType) {
      case 'novel':
        data = await this.importNovel();
        break;
      case 'video':
        data = await this.importVideo();
        break;
      case 'image':
        data = await this.importImages();
        break;
      default:
        throw new Error(`Unknown source type: ${this.config.sourceType}`);
    }

    ctx.set('importedData', data);
    ctx.set('sourceType', this.config.sourceType);

    this.reportProgress(100, '导入完成');

    return {
      stepId: this.id,
      status: StepStatus.COMPLETED,
      data: { importedData: data, sourceType: this.config.sourceType },
      metrics: { durationMs: 0 },
    };
  }

  canResume(): boolean {
    return true;
  }

  private async importNovel(): Promise<{ text: string; title: string }> {
    // In production, read from file system or parse uploaded file
    const text = this.config.sourcePath
      ? await this.readFile(this.config.sourcePath)
      : '';

    return { text, title: '未命名小说' };
  }

  private async importVideo(): Promise<{ url: string; duration: number }> {
    return { url: this.config.sourcePath ?? '', duration: 0 };
  }

  private async importImages(): Promise<{ urls: string[] }> {
    return { urls: [] };
  }

  private async readFile(path: string): Promise<string> {
    // Placeholder: in production, use Tauri fs API or fetch
    return '';
  }
}

/**
 * StepImportFactory — 导入步骤工厂
 */
export class StepImportFactory {
  create(config: StepImportConfig): StepImport {
    return new StepImport(config);
  }
}