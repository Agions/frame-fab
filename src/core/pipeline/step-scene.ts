/**
 * Step-Scene — 场景规划步骤
 *
 * 在角色和剧本确定之后，规划全局场景布局。
 * 输出场景列表，包含场景描述、氛围、色彩基调、时间地点等。
 */

import type { StepInput, StepOutput } from '../pipeline/pipeline.types';
import { PipelineStep, PipelineStepId, StepStatus, PipelineExecutionMode } from '../pipeline/pipeline.types';
import type { StepProgressEvent, RetryPolicy } from '../pipeline/pipeline.types';
import { aiService } from '../services/ai.service';
import { logger } from '../utils/logger';
import type { ScriptOutput } from './step-script';

export interface SceneOutput extends StepOutput {
  scenes: Array<{
    id: string;
    name: string;
    location: string;
    timeOfDay: string;
    weather: string;
    atmosphere: string;
    colorPalette: string[];
    characters: string[];
    description: string;
  }>;
  totalScenes: number;
}

export class SceneStep implements PipelineStep {
  readonly id = 'step-scene';
  readonly name = '场景规划';
  readonly stepId = 'scene' as PipelineStepId; // 虚拟 ID，不在枚举中
  readonly mode = PipelineExecutionMode.SEQUENCE;
  readonly retryPolicy: RetryPolicy = {
    maxRetries: 2,
    initialDelayMs: 1500,
    backoffMultiplier: 2,
    maxDelayMs: 8000,
  };
  readonly dependencies = [PipelineStepId.SCRIPT, PipelineStepId.CHARACTER];
  onProgress?: (event: StepProgressEvent) => void;

  private model: string;
  private provider: string;

  constructor(config?: { model?: string; provider?: string }) {
    this.model = config?.model ?? 'glm-5';
    this.provider = config?.provider ?? 'zhipu';
  }

  async execute(input: StepInput): Promise<StepOutput> {
    const startTime = Date.now();
    const context = input.context;

    logger.info(`[SceneStep] Planning scenes for workflow ${input.workflowId}`);

    try {
      const scriptOutput = context.getVariable<ScriptOutput>('scriptOutput');

      if (!scriptOutput?.scenes || scriptOutput.scenes.length === 0) {
        return {
          stepId: this.stepId,
          status: StepStatus.COMPLETED,
          data: { scenes: [], totalScenes: 0 },
          qualityGate: undefined,
          startTime,
          endTime: Date.now(),
          retryCount: 0,
        };
      }

      this.reportProgress(10, '正在分析剧本场景需求...');

      const prompt = this.buildScenePrompt(scriptOutput.scenes);

      this.reportProgress(40, '正在规划场景布局...');

      const response = await aiService.generate(prompt, {
        model: this.model,
        provider: this.provider,
        max_tokens: 8192,
        temperature: 0.7,
      });

      this.reportProgress(80, '正在解析场景规划结果...');

      const scenes = this.parseSceneOutput(response, scriptOutput.scenes);
      context.setVariable('sceneOutput', { scenes, totalScenes: scenes.length });

      this.reportProgress(95, '场景规划完成');

      logger.success(`[SceneStep] Scene planning complete: ${scenes.length} scenes`);

      return {
        stepId: this.stepId,
        status: StepStatus.COMPLETED,
        data: { scenes, totalScenes: scenes.length },
        metrics: { durationMs: Date.now() - startTime },
        qualityGate: undefined,
        startTime,
        endTime: Date.now(),
        retryCount: 0,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`[SceneStep] Scene planning failed: ${errorMsg}`);

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

  private buildScenePrompt(scriptScenes: ScriptOutput['scenes']): string {
    return `你是专业的影视场景设计师。请根据以下剧本场景，为每个场景规划详细的视觉呈现方案。

## 剧本场景列表

${scriptScenes
  .map((s) => `【场景 ${s.id}】${s.title}\n${s.description}`)
  .join('\n\n')}

## 输出要求

请为每个场景输出以下信息：
1. **场景名称**：简洁有辨识度的名称
2. **地点**：室内/室外，具体场所
3. **时间段**：早晨/上午/中午/下午/黄昏/夜晚/深夜
4. **天气**：晴朗/阴天/雨天/雪天/雾天/雷暴
5. **氛围**：如"温馨"、"紧张"、"神秘"、"浪漫"等
6. **色彩基调**：3-5 个主要颜色（如"暖橙色系"、"冷蓝灰色系"）
7. **出场人物**：列表形式
8. **场景描述**：一段 50-100 字的环境描写，作为 AI 生图的参考

## 输出格式

请严格按以下 JSON 格式输出：

{
  "scenes": [
    {
      "id": "场景ID",
      "name": "场景名称",
      "location": "地点",
      "timeOfDay": "时间段",
      "weather": "天气",
      "atmosphere": "氛围",
      "colorPalette": ["颜色1", "颜色2", "颜色3"],
      "characters": ["角色1", "角色2"],
      "description": "场景描述（50-100字）"
    }
  ]
}

请直接输出 JSON，不要包含任何其他内容。`;
  }

  private parseSceneOutput(
    response: string,
    originalScenes: ScriptOutput['scenes'],
  ): SceneOutput['scenes'] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as { scenes?: unknown[] };
        if (Array.isArray(parsed.scenes)) {
          return parsed.scenes.map((s: unknown, index: number) => {
            const obj = s as Record<string, unknown>;
            return {
              id: String(obj.id ?? originalScenes[index]?.id ?? `scene_${index}`),
              name: String(obj.name ?? `场景${index + 1}`),
              location: String(obj.location ?? '未知'),
              timeOfDay: String(obj.timeOfDay ?? '白天'),
              weather: String(obj.weather ?? '晴朗'),
              atmosphere: String(obj.atmosphere ?? '普通'),
              colorPalette: Array.isArray(obj.colorPalette)
                ? obj.colorPalette.map(String)
                : ['#FFFFFF'],
              characters: Array.isArray(obj.characters)
                ? obj.characters.map(String)
                : [],
              description: String(obj.description ?? ''),
            };
          });
        }
      }
    } catch (error) {
      logger.warn('[SceneStep] Failed to parse scene JSON:', error);
    }

    return originalScenes.map((s, index) => ({
      id: s.id,
      name: s.title || `场景${index + 1}`,
      location: '待定',
      timeOfDay: '白天',
      weather: '晴朗',
      atmosphere: '普通',
      colorPalette: ['#FFFFFF', '#F5F5F5', '#333333'],
      characters: [],
      description: s.description || '',
    }));
  }
}

export function createSceneStep(config?: { model?: string; provider?: string }): SceneStep {
  return new SceneStep(config);
}
