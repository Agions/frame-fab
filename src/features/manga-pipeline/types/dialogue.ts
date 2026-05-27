/**
 * 漫剧管道共享类型定义
 * 所有跨步骤共享的接口统一放这里，避免相对路径导入问题
 */

export interface DialogueSegment {
  id: string;
  sceneId: string;
  sceneNumber: number;
  character: string;
  characterId: string;
  text: string;
  emotion: string;
  voiceId: string;
  startTime: number; // 秒
  endTime: number; // 秒
  audioUrl?: string; // 生成后填充 (blob URL)
  audioData?: ArrayBuffer; // 原始音频数据
  duration?: number; // 实际生成的音频时长
  status: 'pending' | 'generating' | 'done' | 'failed';
  error?: string;
}

export interface TTSGenerationResult {
  segments: DialogueSegment[];
  totalDuration: number; // 秒
}
