/**
 * 场景分析服务 - Scene Analyzer（facade）
 *
 * 历史背景：本文件原为 256 行单类，承担 3 大功能（角色提取 / 对话旁白提取 / 场景
 * 描述生成）+ 配置 + 单例 + static 委托。第 23 轮重构拆为 5 个子模块（types /
 * prompt-builder / character-extractor / dialogue-extractor / description-generator），
 * 本 facade 保留所有对外公开 API 签名（sceneAnalyzer 单例 + SceneAnalyzer 类 +
 * 3 个公共方法 + 1 个 static 委托）以保证 1 个外部调用方（novel-analyze.service）
 * 零改动。
 *
 * 拆分思路：
 * 1. 类型 / 默认值 / 字段映射常量集中在 types（含 createCharacterFromAiResponse 工厂）
 * 2. Prompt 模板集中到 prompt-builder（2 个 prompt 字面量 → 2 个 buildXxxPrompt 函数）
 * 3. 角色提取剥离到 character-extractor（纯函数 + AI 注入）
 * 4. 对话 + 旁白提取剥离到 dialogue-extractor（DIALOGUE_PATTERNS 走 novel-helpers）
 * 5. 场景描述批量生成剥离到 description-generator（并发控制 + 容错 fallback）
 * 6. 类主流程只剩"路由"——持有 config + 转发到对应子模块
 */

import { aiService } from '@/core/services/ai/text/ai.service';
import { type Character, type NovelScene, type SceneDescription } from '@/shared/types';

import { extractCharacters as runExtractCharacters } from './scene-analyzer-character-extractor';
import { extractDialogues as runExtractDialogues } from './scene-analyzer-dialogue-extractor';
import { generateSceneDescriptions as runGenerateSceneDescriptions } from './scene-analyzer-description-generator';
import {
  DEFAULT_SCENE_ANALYZER_CONFIG,
  type SceneAnalyzerConfig,
} from './scene-analyzer-types';

// 重导出公共类型，保持 `@/core/services/video/scene-analyzer.service` 一站式导入
export type { SceneAnalyzerConfig } from './scene-analyzer-types';

/**
 * 场景分析器
 *
 * 内部维护：
 *   - config: provider / model 默认值
 */
export class SceneAnalyzer {
  private config: Required<SceneAnalyzerConfig>;

  constructor(config: SceneAnalyzerConfig = {}) {
    this.config = {
      ...DEFAULT_SCENE_ANALYZER_CONFIG,
      ...config,
    };
  }

  /**
   * 提取角色（AI 驱动）
   *
   * 行为与原 `SceneAnalyzer.extractCharacters` 字节级一致。
   */
  extractCharacters(content: string): Promise<Character[]> {
    return runExtractCharacters(content, this.config.provider, this.config.model, aiService);
  }

  /**
   * 提取对话 + 旁白（纯本地正则）
   *
   * 行为与原 `SceneAnalyzer.extractDialogues` 字节级一致。
   */
  extractDialogues(scene: NovelScene, characters: Character[]): void {
    runExtractDialogues(scene, characters);
  }

  /**
   * 批量生成场景描述（AI 驱动 + 并发控制）
   *
   * 行为与原 `SceneAnalyzer.generateSceneDescriptions` 字节级一致。
   */
  generateSceneDescriptions(scenes: NovelScene[]): Promise<SceneDescription[]> {
    return runGenerateSceneDescriptions(scenes, this.config.provider, this.config.model);
  }

  /**
   * 静态委托：供外部无实例调用
   *
   * 行为与原 `SceneAnalyzer.extractDialoguesStatic` 字节级一致。
   */
  static extractDialoguesStatic(scene: NovelScene, characters: Character[]): void {
    const instance = new SceneAnalyzer();
    instance.extractDialogues(scene, characters);
  }
}

// 导出单例
export const sceneAnalyzer = new SceneAnalyzer();
