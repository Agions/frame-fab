/**
 * Script Domain Service — 剧本领域服务
 * 展示：领域服务只依赖抽象接口，不引用具体实现
 */

import { logger } from '@/core/utils/logger';
import { eventBus, IEventBus } from '@/infrastructure/queue/event-bus';
import type { AIProvider } from '@/infrastructure/ai/providers/ai-provider.interface';
import type { IStorage } from '@/infrastructure/storage/storage.interface';
import {
  ScriptGeneratedEvent,
  ScriptParsedEvent,
} from '@/domain/shared/events/domain-events';

/**
 * 剧本领域服务接口
 */
export interface IScriptService {
  generateScript(prompt: string, options?: GenerateOptions): Promise<ScriptResult>;
  parseScript(content: string): Promise<ParsedScript>;
  validateScript(script: ParsedScript): ValidationResult;
}

export interface GenerateOptions {
  style?: 'dramatic' | 'comedic' | 'documentary' | 'horror';
  length?: 'short' | 'medium' | 'long';
  targetAudience?: 'general' | 'children' | 'adult';
}

export interface ScriptResult {
  content: string;
  metadata: {
    wordCount: number;
    estimatedDuration: number;
    scenes: number;
  };
}

export interface ParsedScript {
  title: string;
  scenes: Scene[];
  characters: Character[];
  dialogues: Dialogue[];
}

export interface Scene {
  id: string;
  location: string;
  time: string;
  description: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  role: 'protagonist' | 'antagonist' | 'supporting';
}

export interface Dialogue {
  id: string;
  characterId: string;
  sceneId: string;
  content: string;
  emotion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 剧本领域服务实现
 */
export class ScriptService implements IScriptService {
  private aiProvider: AIProvider;
  private storage: IStorage;
  private eventBus: IEventBus;

  constructor(
    aiProvider: AIProvider,
    storage: IStorage,
    eventBusInstance: IEventBus = eventBus
  ) {
    this.aiProvider = aiProvider;
    this.storage = storage;
    this.eventBus = eventBusInstance;
  }

  async generateScript(prompt: string, options?: GenerateOptions): Promise<ScriptResult> {
    logger.info('[ScriptService] Generating script...');

    const systemPrompt = this.buildSystemPrompt(options);
    const result = await this.aiProvider.complete({
      prompt,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 2048,
    });

    const scriptResult: ScriptResult = {
      content: result.content,
      metadata: this.extractMetadata(result.content),
    };

    // Publish domain event
    this.eventBus.publish(new ScriptGeneratedEvent('ScriptService', crypto.randomUUID(), prompt.slice(0, 50), 1));

    return scriptResult;
  }

  async parseScript(content: string): Promise<ParsedScript> {
    logger.info('[ScriptService] Parsing script...');

    // Simple parsing logic - in real implementation, this would be more sophisticated
    const scenes = this.extractScenes(content);
    const characters = this.extractCharacters(content);
    const dialogues = this.extractDialogues(content);

    const parsedScript: ParsedScript = {
      title: this.extractTitle(content),
      scenes,
      characters,
      dialogues,
    };

    // Publish domain event
    this.eventBus.publish(new ScriptParsedEvent('ScriptService', crypto.randomUUID(), []));

    return parsedScript;
  }

  validateScript(script: ParsedScript): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate title
    if (!script.title) {
      errors.push('剧本标题不能为空');
    }

    // Validate scenes
    if (script.scenes.length === 0) {
      errors.push('剧本必须包含至少一个场景');
    }

    // Validate characters
    if (script.characters.length === 0) {
      warnings.push('剧本没有定义角色');
    }

    // Validate dialogues
    const sceneIds = new Set(script.scenes.map((s) => s.id));
    const characterIds = new Set(script.characters.map((c) => c.id));

    for (const dialogue of script.dialogues) {
      if (!sceneIds.has(dialogue.sceneId)) {
        errors.push(`对话引用了不存在的场景: ${dialogue.sceneId}`);
      }
      if (!characterIds.has(dialogue.characterId)) {
        errors.push(`对话引用了不存在的角色: ${dialogue.characterId}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private buildSystemPrompt(options?: GenerateOptions): string {
    let prompt = '你是一位专业的剧本作家。请根据用户的要求生成剧本。';

    if (options?.style) {
      prompt += `\n风格：${options.style}`;
    }
    if (options?.length) {
      prompt += `\n长度：${options.length}`;
    }
    if (options?.targetAudience) {
      prompt += `\n目标受众：${options.targetAudience}`;
    }

    return prompt;
  }

  private extractMetadata(content: string): ScriptResult['metadata'] {
    const wordCount = content.length;
    const estimatedDuration = Math.ceil(wordCount / 100); // 粗略估计
    const scenes = (content.match(/场景/g) || []).length || 1;

    return {
      wordCount,
      estimatedDuration,
      scenes,
    };
  }

  private extractTitle(content: string): string {
    const titleMatch = content.match(/^#\s*(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : '未命名剧本';
  }

  private extractScenes(content: string): Scene[] {
    const scenes: Scene[] = [];
    const sceneRegex = /场景\s*(\d+)[：:]\s*(.+?)(?:\n|$)/g;
    let match;

    while ((match = sceneRegex.exec(content)) !== null) {
      scenes.push({
        id: `scene-${match[1]}`,
        location: match[2].trim(),
        time: '未知',
        description: '',
      });
    }

    return scenes;
  }

  private extractCharacters(content: string): Character[] {
    const characters: Character[] = [];
    const characterRegex = /角色[：:]\s*(.+?)(?:\n|$)/g;
    let match;

    while ((match = characterRegex.exec(content)) !== null) {
      const name = match[1].trim();
      characters.push({
        id: `char-${characters.length + 1}`,
        name,
        description: '',
        role: 'supporting',
      });
    }

    return characters;
  }

  private extractDialogues(content: string): Dialogue[] {
    const dialogues: Dialogue[] = [];
    const dialogueRegex = /(.+?)[：:]\s*(.+?)(?:\n|$)/g;
    let match;

    while ((match = dialogueRegex.exec(content)) !== null) {
      const characterName = match[1].trim();
      const dialogueContent = match[2].trim();

      // Skip scene descriptions
      if (characterName.startsWith('场景') || characterName.startsWith('第')) {
        continue;
      }

      dialogues.push({
        id: `dialogue-${dialogues.length + 1}`,
        characterId: `char-${characterName}`,
        sceneId: 'scene-1',
        content: dialogueContent,
      });
    }

    return dialogues;
  }
}

export default ScriptService;
