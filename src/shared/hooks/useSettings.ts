/**
 * 应用设置相关的自定义钩子（重构版）
 * ==================================
 * 提供了一系列钩子用于管理应用设置和API密钥
 *
 * 重构思路：
 * - 6 个完全重复的 24 行 API key hook → `createApiKeyHook` 工厂（6×1 行）
 * - getSecureStoredApiKey / setSecureStoredApiKey → settings-api-key-storage.ts
 * - ApiKeyState 类型 → settings-api-key-storage.ts
 * - 主 hook useSettingsStore + 子 hooks 保持不变
 */
import { useState, useCallback, useEffect } from 'react';

import { logger } from '@/core/utils/logger';

import { createApiKeyHook } from './settings-api-key-factory';
import {
  getSecureStoredApiKey,
  setSecureStoredApiKey,
  type ApiKeyState,
} from './settings-api-key-storage';
import { getStoredValue, setStoredValue } from './settings-helpers';

// Re-export 类型（保持旧 import 路径）
export type { ApiKeyState } from './settings-api-key-storage';

// 启用调试模式
const DEBUG = false;

// 完整的应用设置类型
export interface AppSettings {
  autoSave: boolean;
  autoUpdate: boolean;
  highQualityExport: boolean;
  enableTranscode: boolean;
  showLineNumbers: boolean;
  defaultModelIndex: number;
  preferredAIProvider: string;
  preferredAICategory: string;
  language: 'zh' | 'en';
  theme: 'light' | 'dark' | 'auto';
  ffmpegPath?: string;
  lastExportFormat?: string;
  recentProjects?: string[];
}

// 默认设置
const DEFAULT_SETTINGS: AppSettings = {
  autoSave: true,
  autoUpdate: true,
  highQualityExport: true,
  enableTranscode: false,
  showLineNumbers: true,
  defaultModelIndex: 0,
  preferredAIProvider: 'openai',
  preferredAICategory: 'all',
  language: 'zh',
  theme: 'auto',
  recentProjects: [],
};

// ========== 应用设置钩子 ==========

export const useSettingsStore = () => {
  const [settings, setSettings] = useState<AppSettings>(() =>
    getStoredValue('app_settings', DEFAULT_SETTINGS)
  );

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      setStoredValue('app_settings', updated);
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setStoredValue('app_settings', DEFAULT_SETTINGS);
    if (DEBUG) logger.info('[useSettings] 重置所有设置为默认值');
  }, []);

  const addRecentProject = useCallback((projectId: string) => {
    setSettings((prev) => {
      const recentProjects = prev.recentProjects || [];
      const filtered = recentProjects.filter((id) => id !== projectId);
      const updated = [projectId, ...filtered].slice(0, 10);
      const newSettings = { ...prev, recentProjects: updated };
      setStoredValue('app_settings', newSettings);
      return newSettings;
    });
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    addRecentProject,
  };
};

// ========== API密钥相关钩子（工厂生成，消除 6×24 行重复） ==========

/** OpenAI API密钥 */
export const useOpenAIAPIKey = createApiKeyHook('openai');

/** Claude API密钥 */
export const useClaudeAPIKey = createApiKeyHook('anthropic');

/** 讯飞 API密钥 */
export const useXFAPIKey = createApiKeyHook('iflytek');

/** 智谱 API密钥 */
export const useZhipuAPIKey = createApiKeyHook('zhipu');

/** Anthropic API密钥 (与Claude相同) */
export const useAnthropic = createApiKeyHook('anthropic');

/** 百度 API密钥 */
export const useBaiduAPIKey = createApiKeyHook('baidu');

// ========== 通用API密钥设置钩子 ==========

export const useApiKey = (provider: string) => {
  const storageKey = `${provider}_api_key`;

  const [apiKey, setApiKey] = useState<ApiKeyState>({
    value: '',
    isValid: null,
    isTesting: false,
  });

  useEffect(() => {
    getSecureStoredApiKey(storageKey)
      .then(setApiKey)
      .catch((err) => logger.error(`[useSettings] 加载 ${storageKey} 失败:`, err));
  }, [storageKey]);

  const updateApiKey = useCallback(
    async (newApiKey: Partial<ApiKeyState>) => {
      setApiKey((prev) => {
        const updated = { ...prev, ...newApiKey };
        setSecureStoredApiKey(storageKey, updated);
        return updated;
      });
    },
    [storageKey]
  );

  const validateApiKey = useCallback(async () => {
    if (!apiKey.value) {
      updateApiKey({ isValid: false });
      return false;
    }

    updateApiKey({ isTesting: true });

    try {
      const valid = await new Promise<boolean>((resolve) => {
        setTimeout(() => {
          if (provider === 'openai' && !apiKey.value.startsWith('sk-')) {
            resolve(false);
          } else if (provider === 'anthropic' && !apiKey.value.startsWith('sk-ant-')) {
            resolve(false);
          } else {
            resolve(apiKey.value.length >= 10);
          }
        }, 800);
      });

      updateApiKey({ isValid: valid, isTesting: false });
      return valid;
    } catch (error) {
      logger.error(`[useSettings] 验证${provider} API密钥时发生错误:`, error);
      updateApiKey({ isValid: false, isTesting: false });
      return false;
    }
  }, [apiKey.value, provider, updateApiKey]);

  return { apiKey, updateApiKey, validateApiKey };
};

// ========== 设置子钩子 ==========

export const useAutoSave = () => {
  const { settings, updateSettings } = useSettingsStore();

  const toggleAutoSave = useCallback(() => {
    updateSettings({ autoSave: !settings.autoSave });
  }, [settings.autoSave, updateSettings]);

  return [settings.autoSave, toggleAutoSave] as const;
};

export const usePreferredModel = () => {
  const { settings, updateSettings } = useSettingsStore();

  const updateDefaultModelIndex = useCallback(
    (index: number) => {
      updateSettings({ defaultModelIndex: index });
    },
    [updateSettings]
  );

  return [settings.defaultModelIndex, updateDefaultModelIndex] as const;
};

export const usePreferredAIProvider = () => {
  const { settings, updateSettings } = useSettingsStore();

  const updatePreferredProvider = useCallback(
    (provider: string) => {
      updateSettings({ preferredAIProvider: provider });
    },
    [updateSettings]
  );

  return [settings.preferredAIProvider, updatePreferredProvider] as const;
};

export const usePreferredAICategory = () => {
  const { settings, updateSettings } = useSettingsStore();

  const updatePreferredCategory = useCallback(
    (category: string) => {
      updateSettings({ preferredAICategory: category });
    },
    [updateSettings]
  );

  return [settings.preferredAICategory, updatePreferredCategory] as const;
};
