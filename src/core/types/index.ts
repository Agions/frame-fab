/**
 * @core/types - Backward compatibility re-export from shared/types
 * @deprecated Use @shared/types instead
 */
export * from '@/shared/types';

// Re-export local types (not yet migrated to shared/types)
// Use named exports to avoid conflict with AI types already in shared/types
export type { ProjectData, ProjectSettings, VideoInfo } from './ai-model.types';
export type { StoryboardFrame } from '../../features/storyboard/components/StoryboardEditor';

// Legacy type alias
export type { Script as ScriptData } from '@/shared/types';

// Explicitly re-export novel types from shared to replace local duplicate
export {
  EmotionType,
  type NovelMetadata,
  type Chapter,
  type NovelScene,
  type Character,
  type CharacterRelationship,
  type Dialogue,
  type SceneEmotion,
  type AnalyzeConfig,
  type AnalyzeResult,
  type NovelStatistics,
  type SceneDescription,
  type VisualElement,
  type ExportOptions,
  type ScriptSourceType,
  type ScriptFileFormat,
  type ScriptSource,
  type ScriptChapter,
  type ScriptValidationIssue,
  type ScriptValidationResult,
  type StoryAnalysisCharacter,
  type StoryAnalysisChapter,
  type StoryAnalysis,
} from '@/shared/types/novel';
// Novel.types.ts also has ScriptFormat - re-export it
export type { ScriptFormat } from '@/shared/types/novel';

// ========== Additional types used by hooks/stores (not in shared/types yet) ==========

export type TaskStatus = {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
};

// Export settings
export interface ExportSettings {
  format: string;
  resolution: string;
  frameRate: number;
  quality: string;
  filename: string;
  [key: string]: unknown;
}

export interface UserPreferences {
  [key: string]: unknown;
}

export interface ExportRecord {
  [key: string]: unknown;
}

export interface ScriptTemplate {
  id: string;
  name: string;
  description?: string;
  content?: string;
}
