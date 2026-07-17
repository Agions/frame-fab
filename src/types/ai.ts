/**
 * @deprecated Legacy types directory.
 *
 * Types defined here have been migrated to canonical locations:
 * - AI types (AIResponse, AIRequestConfig, StreamCallbacks, MockConfig)
 *   → @/shared/types/ai-core.ts
 * - Shared analysis/model types (AIModel, Script, VideoAnalysis, etc.)
 *   → @/shared/types/ (various modules)
 *
 * New code should import from @/shared/types/ directly.
 * This shim will be removed in a future PR after all callers migrate.
 */

// Re-export shared AI model / analysis types (canonical source: @/shared/types)
export type {
  AIModel,
  AIModelSettings,
  Script,
  VideoAnalysis,
  ScriptSegment,
  VideoScene,
  Keyframe,
} from '@/shared/types';

// API response type
export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

// Streaming response callbacks
export interface StreamCallbacks {
  onChunk: (content: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

// AI request config (distinct from core/api/client.ts HTTP RequestConfig)
export interface AIRequestConfig {
  model: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

// Mock configuration options
export interface MockConfig {
  delay?: number;
  content?: string;
  shouldFail?: boolean;
  errorMessage?: string;
}
