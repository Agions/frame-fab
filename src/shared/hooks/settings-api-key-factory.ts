/**
 * API Key Hook 工厂
 * ================
 * 把 6 个完全重复的 24 行 API key hook（useOpenAIAPIKey / useClaudeAPIKey / ...）
 * 抽成工厂函数 `createApiKeyHook(provider)`.
 *
 * 生成的 hook 行为：
 * - useState 初始化
 * - useEffect 从安全存储加载
 * - updateApiKey 写入安全存储
 * - 返回 [apiKey, updateApiKey] as const
 *
 * 消除 6×24=144 行重复，替换为 6×1=6 行工厂调用。
 */
import { useState, useCallback, useEffect } from 'react';

import { logger } from '@/core/utils/logger';

import {
  getSecureStoredApiKey,
  setSecureStoredApiKey,
  type ApiKeyState,
} from './settings-api-key-storage';

/**
 * 创建 API key hook。
 *
 * @param provider provider 名（openai / anthropic / iflytek / zhipu / baidu）
 * @returns [apiKey, updateApiKey] tuple hook
 */
export function createApiKeyHook(provider: string) {
  const storageKey = `${provider}_api_key`;

  return function useApiKeyHook() {
    const [apiKey, setApiKey] = useState<ApiKeyState>({
      value: '',
      isValid: null,
      isTesting: false,
    });

    // 初始化时从安全存储加载
    useEffect(() => {
      getSecureStoredApiKey(storageKey)
        .then(setApiKey)
        .catch((err) => logger.error(`[useSettings] 加载 ${storageKey} 失败:`, err));
    }, []);

    const updateApiKey = useCallback(async (newApiKey: Partial<ApiKeyState>) => {
      setApiKey((prev) => {
        const updated = { ...prev, ...newApiKey };
        setSecureStoredApiKey(storageKey, updated);
        return updated;
      });
    }, []);

    return [apiKey, updateApiKey] as const;
  };
}
