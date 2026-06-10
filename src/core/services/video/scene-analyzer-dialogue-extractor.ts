/**
 * 对话提取 + 旁白提取
 * @module core/services/video/scene-analyzer-dialogue-extractor
 *
 * 提取自原 SceneAnalyzer.extractDialogues。
 * 行为字节级一致：DIALOGUE_PATTERNS 3 类正则 + dialogueMap 聚合 + 角色匹配 + 旁白。
 */

import { DIALOGUE_PATTERNS } from '@/core/services/ai/text/novel-helpers';
import { type Character, type NovelScene } from '@/shared/types';

import { NARRATOR_MIN_PARAGRAPH_LENGTH } from './scene-analyzer-types';

/** 从单条 match 提取角色名 + 对话内容（按 pattern 类型分桶） */
function extractFromMatch(
  match: RegExpExecArray,
  pattern: RegExp
): { characterName: string; dialogueContent: string } {
  let characterName = '';
  let dialogueContent = '';

  if (pattern.source.includes('[A-Z]')) {
    characterName = match[1];
    dialogueContent = match[2];
  } else if (/[\u4e00-\u9fa5]{2,4}[：:]/.test(match[0])) {
    characterName = match[1];
    dialogueContent = match[2];
  } else {
    dialogueContent = match[1];
  }

  return { characterName, dialogueContent };
}

/** 在角色列表中查找与对话名匹配的角色（按 name 或 aliases） */
function findCharacterForDialogue(
  characterName: string,
  characters: Character[]
): Character | undefined {
  return characters.find(
    (c) => c.name === characterName || c.aliases?.includes(characterName)
  );
}

/** 把对话追加到角色对象的 dialogues 数组 */
function appendDialogueToCharacter(character: Character, content: string): void {
  character.dialogues ??= [];
  character.dialogues.push(content);
}

/**
 * 旁白提取：扫描段落，把"不在对话内容里 / 长度足够 / 非引号开头"的段落累加为旁白
 *
 * 行为与原 extractDialogues 末尾段落循环字节级一致。
 */
function extractNarrator(scene: NovelScene, dialogueContent: string): void {
  const paragraphs = scene.content.split(/\n/);
  for (const para of paragraphs) {
    if (para.trim() && !dialogueContent.includes(para.trim())) {
      if (para.length > NARRATOR_MIN_PARAGRAPH_LENGTH && !/^[「『""]/.test(para)) {
        scene.narrator = (scene.narrator ?? '') + para;
      }
    }
  }
}

/**
 * 从场景中提取对话 + 旁白，写入 scene.dialogues / scene.narrator
 *
 * 行为与原 `SceneAnalyzer.extractDialogues` 字节级一致。
 */
export function extractDialogues(scene: NovelScene, characters: Character[]): void {
  const dialogueMap = new Map<string, { content: string; position: number }[]>();

  for (const pattern of DIALOGUE_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(scene.content)) !== null) {
      const { characterName, dialogueContent } = extractFromMatch(match, pattern);
      if (dialogueContent) {
        const key = characterName || 'unknown';
        if (!dialogueMap.has(key)) {
          dialogueMap.set(key, []);
        }
        dialogueMap.get(key)!.push({
          content: dialogueContent.trim(),
          position: match.index,
        });
      }
    }
  }

  // 转换为 Dialogue 对象
  scene.dialogues = [];
  for (const [character, dialogues] of dialogueMap) {
    for (const dialog of dialogues) {
      const matchedCharacter = findCharacterForDialogue(character, characters);
      scene.dialogues.push({
        id: `dialogue_${scene.id}_${scene.dialogues.length}`,
        sceneId: scene.id,
        character: matchedCharacter?.name ?? character,
        content: dialog.content,
        position: dialog.position,
      });
      if (matchedCharacter) {
        appendDialogueToCharacter(matchedCharacter, dialog.content);
      }
    }
  }

  // 提取旁白
  const dialogueContent = scene.dialogues.map((d) => d.content).join(' ');
  extractNarrator(scene, dialogueContent);
}
