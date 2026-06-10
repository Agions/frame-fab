/**
 * 标签页状态 Hook
 */
import { useState, useCallback } from 'react';

export interface UseTabsOptions {
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
}

export interface UseTabsReturn {
  activeKey: string;
  setActiveKey: (key: string) => void;
  changeActiveKey: (key: string) => void;
}

export const useTabs = (options?: UseTabsOptions): UseTabsReturn => {
  const [activeKey, setActiveKey] = useState(options?.defaultActiveKey || '1');

  const changeActiveKey = useCallback(
    (key: string) => {
      setActiveKey(key);
      options?.onChange?.(key);
    },
    [options]
  );

  return { activeKey, setActiveKey, changeActiveKey };
};
