import { StepInput, StepOutput } from '../../../../core/pipeline/step.interface';
import { BasePipelineController } from '../../base/BasePipelineController';

import { analyzeNarrativeStructure, buildCharacterGraph, detectConflicts } from './analyzer';
import { evaluateScript } from './evaluator';
import { splitChapters, classifyParagraphs, extractEvents } from './parser';
import { generateCharacterCards, generateScenes, integrateScript } from './script-writer';
import { Script } from './types/script';

export interface ScriptGenerationInput {
  text: string;
  title?: string;
}

export interface ScriptGenerationResult {
  script: Script;
  metadata: {
    chaptersCount: number;
    eventsCount: number;
    charactersCount: number;
    scenesCount: number;
    evaluationScore: number;
    grade: string;
  };
}

/**
 * Refactored ScriptGenerationPipeline using BasePipelineController
 * - Progress reporting at each stage
 * - Pause/resume support
 * - Checkpoint on error for recovery
 */
export class ScriptGenerationPipeline extends BasePipelineController {
  id = 'script-generation';
  name = 'AI Script Generation';

  // Define sub-steps for progress reporting
  protected subSteps = [
    '解析文本',
    '分析叙事结构',
    '生成角色卡片',
    '生成场景',
    '整合剧本',
    '质量评估',
  ];

  protected async _doProcess(input: StepInput): Promise<StepOutput> {
    const { text, title = '未命名剧本' } = input as StepInput & ScriptGenerationInput;

    // Step 1: Parse text (0-15%)
    this.updateProgress(0, '解析文本');
    const { chapters } = splitChapters(text);
    const paragraphs = classifyParagraphs(text);
    const events = extractEvents(chapters, paragraphs);
    await this.pauseCheck();
    this.updateProgress(15, '解析文本');

    // Step 2: Analyze narrative (15-35%)
    this.updateProgress(20, '分析叙事结构');
    const narrative = analyzeNarrativeStructure(events, chapters.length);
    const characterGraph = buildCharacterGraph(events, paragraphs);
    detectConflicts(events, narrative);
    await this.pauseCheck();
    this.updateProgress(35, '分析叙事结构');

    // Step 3: Generate character cards (35-50%)
    this.updateProgress(40, '生成角色卡片');
    const characters = generateCharacterCards(text, characterGraph, events);
    await this.pauseCheck();
    this.updateProgress(50, '生成角色卡片');

    // Step 4: Generate scenes (50-70%)
    this.updateProgress(55, '生成场景');
    const scenes = generateScenes(events, narrative, characters);
    await this.pauseCheck();
    this.updateProgress(70, '生成场景');

    // Step 5: Integrate script (70-85%)
    this.updateProgress(75, '整合剧本');
    const script = integrateScript(scenes, characters, paragraphs, { title });
    this.checkpointOnError({ script, chapters, events, characters, scenes });
    await this.pauseCheck();
    this.updateProgress(85, '整合剧本');

    // Step 6: Evaluate (85-100%)
    this.updateProgress(90, '质量评估');
    const evaluation = evaluateScript(script);
    this.updateProgress(100, '质量评估');

    // Build result
    const result: ScriptGenerationResult = {
      script,
      metadata: {
        chaptersCount: chapters.length,
        eventsCount: events.length,
        charactersCount: characters.length,
        scenesCount: scenes.length,
        evaluationScore: evaluation.score,
        grade: evaluation.overallGrade,
      },
    };

    return { scriptGeneration: result } as StepOutput;
  }
}
