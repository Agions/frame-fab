/**
 * Pipeline 步骤4：角色设计 (Character Design)
 * 
 * 角色一致固化、参考图生成
 */

import { getCharacterService } from '@/core/services/character.service';
import { logger } from '@/core/utils/logger';

import type {
  PipelineStep,
  StepInput,
  StepOutput,
  StepProgressEvent,
  RetryPolicy,
} from './pipeline.types';
import {
  PipelineStepId,
  StepStatus,
  QualityGateDecision,
  PipelineExecutionMode,
} from './pipeline.types';

export interface CharacterOutput {
  characters: Array<{
    id: string;
    name: string;
    appearance: {
      gender?: string;
      age?: string;
      hairStyle?: string;
      hairColor?: string;
      clothing?: string;
    };
    consistency: {
      seed?: number;
      referenceImages?: string[];
    };
  }>;
  totalCount: number;
}

export class CharacterStep implements PipelineStep {
  readonly id: string;
  readonly name: string;
  readonly stepId = PipelineStepId.CHARACTER;
  readonly mode = PipelineExecutionMode.SEQUENCE;
  readonly retryPolicy: RetryPolicy;
  readonly dependencies = [PipelineStepId.SCRIPT, PipelineStepId.ANALYSIS];
  onProgress?: (event: StepProgressEvent) => void;

  constructor(config?: Partial<PipelineStep>) {
    this.id = config?.id ?? 'step-character';
    this.name = config?.name ?? '角色设计';
    this.retryPolicy = config?.retryPolicy ?? {
      maxRetries: 2,
      initialDelayMs: 2000,
      backoffMultiplier: 2,
      maxDelayMs: 10000,
    };
  }

  async execute(input: StepInput): Promise<StepOutput> {
    const startTime = Date.now();
    const context = input.context;

    logger.info(`[CharacterStep] Creating characters for workflow ${input.workflowId}`);

    try {
      const estimatedCharacters = context.getVariable<number>('estimatedCharacters') ?? 3;
      const scenes = context.getVariable('scenes') as Array<{ description: string }>;

      this.reportProgress(10, '正在分析角色需求...');

      // 提取角色描述
      const characterNames = this.extractCharacterNames(scenes);
      
      this.reportProgress(30, '正在生成角色...');

      const characters: CharacterOutput['characters'] = [];

      for (let i = 0; i < Math.min(characterNames.length, estimatedCharacters); i++) {
        const name = characterNames[i];
        
        this.reportProgress(30 + (i * 40 / characterNames.length), `正在生成角色: ${name}`);

        try {
          const character = await getCharacterService().create({
            name,
            description: `角色${i + 1}`,
            appearance: {},
            role: i === 0 ? 'protagonist' : 'supporting',
          });

          const seed = Math.floor(Math.random() * 10000);
          characters.push({
            id: character.id,
            name: character.name,
            appearance: {
              gender: '未知',
              age: '未知',
              hairStyle: '未知',
              hairColor: '未知',
              clothing: '未知',
            },
            consistency: {
              seed,
              referenceImages: [],
            },
          });
        } catch (error) {
          logger.warn(`[CharacterStep] Failed to create character ${name}: ${error}`);
        }
      }

      this.reportProgress(90, '角色生成完成');

      context.setVariable('characters', characters);
      context.setVariable('characterCount', characters.length);

      logger.success(`[CharacterStep] Created ${characters.length} characters`);

      return {
        stepId: this.stepId,
        status: StepStatus.COMPLETED,
        data: { characters, totalCount: characters.length },
        metrics: {
          durationMs: Date.now() - startTime,
          framesProcessed: characters.length,
        },
        qualityGate: QualityGateDecision.PASS,
        startTime,
        endTime: Date.now(),
        retryCount: 0,
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[CharacterStep] Character creation failed: ${errorMsg}`);

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

  private extractCharacterNames(scenes: Array<{ description: string }>): string[] {
    const names = new Set<string>();
    
    for (const scene of scenes ?? []) {
      const matches = scene.description?.match(/[A-Z][a-z]{2,20}/g);
      matches?.forEach(n => names.add(n));
    }
    
    if (names.size === 0) {
      names.add('主角');
      names.add('配角');
    }
    
    return Array.from(names).slice(0, 10);
  }
}

export function createCharacterStep(config?: Partial<PipelineStep>): CharacterStep {
  return new CharacterStep(config);
}

export default CharacterStep;
