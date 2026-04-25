import { Script, DialogueLine, ScriptScene } from '../../step1-script-generation/types/script';

import { VoiceAssignment } from './voice-assigner';

export interface DialogueSegment {
  id: string;
  sceneId: string;
  sceneNumber: number;
  character: string;
  characterId: string;
  text: string;
  emotion: string;
  voiceId: string;
  startTime: number;    // 秒
  endTime: number;      // 秒
  audioUrl?: string;     // 生成后填充
  status: 'pending' | 'generating' | 'done' | 'failed';
}

export interface TTSGenerationResult {
  segments: DialogueSegment[];
  totalDuration: number;  // 秒
}

/**
 * 为对话生成 TTS 配音序列
 */
export function generateDialogueTTS(
  script: Script,
  voiceAssignments: VoiceAssignment[]
): TTSGenerationResult {
  const segments: DialogueSegment[] = [];
  let currentTime = 0;
  let segmentId = 1;

  const voiceMap = new Map(
    voiceAssignments.map(v => [v.characterId, v])
  );

  for (const scene of script.scenes) {
    // 跳过无内容的场景
    if (!scene.content || scene.content.trim().length === 0) {
      currentTime += 3; // 默认 3 秒沉默
      continue;
    }

    // 从场景内容提取对话
    const dialogueLines = extractDialogueFromScene(scene);
    
    for (const line of dialogueLines) {
      // 查找角色音色分配
      const characterId = findCharacterId(line.character, script.characters);
      const voiceAssignment = characterId 
        ? voiceMap.get(characterId) 
        : voiceAssignments[0]; // 默认第一个音色
      
      if (!voiceAssignment) continue;

      // 估算朗读时长（中文约 5 字/秒）
      const textDuration = Math.max(estimateTextDuration(line.text), 2);
      
      segments.push({
        id: `tts_${segmentId++}`,
        sceneId: scene.id,
        sceneNumber: scene.sceneNumber,
        character: line.character,
        characterId: characterId || 'unknown',
        text: line.text,
        emotion: line.emotion,
        voiceId: voiceAssignment.voiceId,
        startTime: currentTime,
        endTime: currentTime + textDuration,
        status: 'pending',
      });

      currentTime += textDuration + 0.5; // 添加 0.5 秒间隔
    }

    // 场景间添加间隔
    currentTime += 1;
  }

  return {
    segments,
    totalDuration: currentTime,
  };
}

function extractDialogueFromScene(scene: ScriptScene): { character: string; text: string; emotion: string }[] {
  const lines: { character: string; text: string; emotion: string }[] = [];
  
  // 从 scene.content 中提取对话
  // 格式：角色：对话内容
  const dialoguePattern = /([^\s：]+)：([^。！？\n]+[。！？]?)/g;
  let match;
  
  while ((match = dialoguePattern.exec(scene.content)) !== null) {
    lines.push({
      character: match[1],
      text: match[2].trim(),
      emotion: scene.emotion,
    });
  }

  // 如果没有提取到，使用场景描述作为旁白
  if (lines.length === 0 && scene.content.trim()) {
    lines.push({
      character: '旁白',
      text: scene.content.slice(0, 50),
      emotion: scene.emotion,
    });
  }

  return lines;
}

function findCharacterId(characterName: string, characters: Script['characters']): string | undefined {
  return characters.find(c => c.name === characterName)?.id;
}

function estimateTextDuration(text: string): number {
  // 中文约 5 字/秒，英文约 3 words/秒
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  
  const duration = chineseChars / 5 + englishWords / 3;
  return Math.ceil(duration);
}