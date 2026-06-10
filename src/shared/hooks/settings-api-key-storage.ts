/**
 * API Key 安全存储工具
 * ====================
 * 把 6 个完全重复的 24 行 API key hook（useOpenAIAPIKey / useClaudeAPIKey / ...）
 * 抽成工厂函数 `createApiKeyHook` + 通用安全存储 helper。
 *
 * 单一职责：API key 读写，不含 React 状态。
 */
import { secureStorage } from '@/core/services/project/secure-storage.service';
import { logger } from '@/core/utils/logger';

/** 安全存储 key 映射：provider 名 → secureStorage 内部 key */
export const API_KEY_SECURE_KEYS: Record<string, string> = {
  openai_api_key: 'openai_api_key',
  anthropic_api_key: 'anthropic_api_key',
  iflytek_api_key: 'iflytek_api_key',
  zhipu_api_key: 'zhipu_api_key',
  baidu_api_key: 'baidu_api_key',
};

/** API 密钥状态类型 */
export interface ApiKeyState {
  value: string;
  isValid: boolean | null;
  isTesting: boolean;
}

/** 默认 API key 状态 */
const DEFAULT_API_KEY_STATE: ApiKeyState = {
  value: '',
  isValid: null,
  isTesting: false,
};

/** 从安全存储读取 API key */
export async function getSecureStoredApiKey(key: string): Promise<ApiKeyState> {
  try {
    const secureKey = API_KEY_SECURE_KEYS[key];
    if (secureKey) {
      const value = await secureStorage.getSecureConfig(secureKey);
      if (value) {
        return JSON.parse(value);
      }
    }
  } catch (error) {
    logger.error(`[useSettings] 读取安全存储 ${key} 时发生错误:`, error);
  }
  return { ...DEFAULT_API_KEY_STATE };
}

/** 写入 API key 到安全存储 */
export async function setSecureStoredApiKey(key: string, state: ApiKeyState): Promise<void> {
  try {
    const secureKey = API_KEY_SECURE_KEYS[key];
    if (secureKey) {
      await secureStorage.saveSecureConfig(secureKey, JSON.stringify(state));
    }
  } catch (error) {
    logger.error(`[useSettings] 保存安全存储 ${key} 时发生错误:`, error);
  }
}
