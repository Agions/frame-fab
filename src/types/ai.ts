/**
 * AI Service Canonical Types
 *
 * Single source of truth for the AI request/response contract types
 * (AIResponse, StreamCallbacks, AIRequestConfig, MockConfig) and the
 * shared analysis/model types consumed across the AI layer.
 *
 * The shared types below are re-exported from @/shared/types — the
 * canonical source of truth for those interfaces.
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
