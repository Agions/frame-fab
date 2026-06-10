/**
 * 折叠面板 Hook
 */
import { useState, useCallback } from 'react';

export interface UseCollapseOptions {
  defaultExpandedKeys?: string[];
}

export interface UseCollapseReturn {
  expandedKeys: string[];
  toggle: (key: string) => void;
  expand: (key: string) => void;
  collapse: (key: string) => void;
  expandAll: (keys: string[]) => void;
  collapseAll: () => void;
  isExpanded: (key: string) => boolean;
}

export const useCollapse = (options?: UseCollapseOptions): UseCollapseReturn => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>(options?.defaultExpandedKeys || []);

  const toggle = useCallback((key: string) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const expand = useCallback((key: string) => {
    setExpandedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const collapse = useCallback((key: string) => {
    setExpandedKeys((prev) => prev.filter((k) => k !== key));
  }, []);

  const expandAll = useCallback((keys: string[]) => setExpandedKeys(keys), []);
  const collapseAll = useCallback(() => setExpandedKeys([]), []);
  const isExpanded = useCallback((key: string) => expandedKeys.includes(key), [expandedKeys]);

  return { expandedKeys, toggle, expand, collapse, expandAll, collapseAll, isExpanded };
};
