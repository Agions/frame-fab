/**
 * LLM 模型配置（2026年最新）
 */
export interface LLMModelConfig {
  provider: string;
  name: string;
  modelId: string;
  version: string;
  maxTokens: number;
  contextWindow: number;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  pricing: { input: number; output: number };
  capabilities: string[];
  recommended: boolean;
}

export interface LLMModels {
  [key: string]: LLMModelConfig;
}

export const LLM_MODELS: LLMModels = {
  BAIDU: {
    provider: 'baidu',
    name: 'ERNIE 5.0',
    modelId: 'ernie-5.0',
    version: '2025-01',
    maxTokens: 8192,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    pricing: { input: 0.008, output: 0.024 },
    capabilities: ['text', 'code', 'analysis', 'creative'],
    recommended: true,
  },
  ALIBABA: {
    provider: 'alibaba',
    name: 'Qwen 3.5',
    modelId: 'qwen-3.5',
    version: '2025-01',
    maxTokens: 8192,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    pricing: { input: 0.006, output: 0.018 },
    capabilities: ['text', 'code', 'analysis', 'creative', 'vision'],
    recommended: true,
  },
  MOONSHOT: {
    provider: 'moonshot',
    name: 'Kimi k2.5',
    modelId: 'kimi-k2.5',
    version: '2025-07',
    maxTokens: 8192,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    pricing: { input: 0.012, output: 0.036 },
    capabilities: ['text', 'code', 'analysis', 'creative', 'long-context'],
    recommended: true,
  },
  ZHIPU: {
    provider: 'zhipu',
    name: 'GLM-5',
    modelId: 'glm-5',
    version: '2025-01',
    maxTokens: 4096,
    contextWindow: 128000,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    pricing: { input: 0.005, output: 0.015 },
    capabilities: ['text', 'code', 'analysis'],
    recommended: true,
  },
  MINIMAX: {
    provider: 'minimax',
    name: 'MiniMax M2.5',
    modelId: 'minimax-m2.5',
    version: '2025-12',
    maxTokens: 4096,
    contextWindow: 100000,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    pricing: { input: 0.01, output: 0.03 },
    capabilities: ['text', 'creative'],
    recommended: false,
  },
  OPENAI: {
    provider: 'openai',
    name: 'GPT-4.5',
    modelId: 'gpt-4.5',
    version: '2025-01',
    maxTokens: 8192,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    pricing: { input: 0.01, output: 0.03 },
    capabilities: ['text', 'code', 'analysis', 'creative', 'vision'],
    recommended: false,
  },
  ANTHROPIC: {
    provider: 'anthropic',
    name: 'Claude 4',
    modelId: 'claude-4-sonnet',
    version: '2025-01',
    maxTokens: 8192,
    contextWindow: 200000,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    pricing: { input: 0.025, output: 0.075 },
    capabilities: ['text', 'code', 'analysis', 'creative'],
    recommended: false,
  },
  GOOGLE: {
    provider: 'google',
    name: 'Gemini 2.0 Pro',
    modelId: 'gemini-2.0-pro',
    version: '2025-01',
    maxTokens: 8192,
    contextWindow: 2000000,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    pricing: { input: 0.0035, output: 0.0105 },
    capabilities: ['text', 'code', 'analysis', 'creative', 'vision', 'video'],
    recommended: false,
  },
} as const;

export const DEFAULT_LLM_MODEL = LLM_MODELS.BAIDU;

export const MODEL_RECOMMENDATIONS = {
  scriptGeneration: [LLM_MODELS.BAIDU, LLM_MODELS.ALIBABA, LLM_MODELS.MOONSHOT],
  videoAnalysis: [LLM_MODELS.ALIBABA, LLM_MODELS.BAIDU],
  longContext: [LLM_MODELS.MOONSHOT, LLM_MODELS.OPENAI],
  costEffective: [LLM_MODELS.ZHIPU, LLM_MODELS.ALIBABA, LLM_MODELS.BAIDU],
  highQuality: [LLM_MODELS.OPENAI, LLM_MODELS.MOONSHOT, LLM_MODELS.BAIDU],
} as const;
