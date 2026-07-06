/**
 * 音频领域类型 — 唯一 source of truth
 */
export interface VoiceTrack {
  id: string;
  name: string;
  filePath: string;
  fileUrl?: string;
  duration: number;
  startTime: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  type: 'dubbing' | 'voiceover';
}

export interface BackgroundMusic {
  id: string;
  name: string;
  filePath: string;
  fileUrl?: string;
  duration: number;
  volume: number;
  fadeIn: number;
  fadeOut: number;
  loop: boolean;
  startTime: number;
}

export interface SoundEffect {
  id: string;
  name: string;
  filePath: string;
  fileUrl?: string;
  duration: number;
  volume: number;
  startTime: number;
  category: string;
}

export interface AudioTrackConfig {
  voiceTracks: VoiceTrack[];
  backgroundMusic: BackgroundMusic | null;
  soundEffects: SoundEffect[];
  masterVolume: number;
  voiceVolume: number;
  musicVolume: number;
  effectVolume: number;
}
