/**
 * ThemeProvider — 主题上下文提供者
 * 支持：浅色/深色切换、响应式设计、无障碍、多语言
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { theme, type ThemeMode, type Theme } from './tokens';

// ============================================
// Theme Context
// ============================================

interface ThemeContextValue {
  mode: ThemeMode;
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ============================================
// Provider
// ============================================

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
}

export function ThemeProvider({
  children,
  defaultMode = 'light',
  onModeChange,
}: ThemeProviderProps): React.ReactElement {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    // Persist preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('panel-flow-theme');
      if (stored === 'dark' || stored === 'light') return stored;
      // Respect system preference
      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return defaultMode;
  });

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('panel-flow-theme', newMode);
    onModeChange?.(newMode);
  }, [onModeChange]);

  const toggleMode = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  const isDark = mode === 'dark';
  const currentTheme = theme[mode];

  // Apply CSS vars to :root
  useEffect(() => {
    const root = document.documentElement;
    const vars = generateCSSVars(mode);
    root.setAttribute('data-theme', mode);
    vars.split(';\n').forEach((v) => {
      const [k, val] = v.split(': ');
      if (k && val) root.style.setProperty(k, val);
    });
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, theme: currentTheme, setMode, toggleMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================
// Hooks
// ============================================

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export function usePrefersDark(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

// ============================================
// CSS Variables Generator
// ============================================

function generateCSSVars(themeMode: ThemeMode): string {
  const t = theme[themeMode];
  const lines: string[] = [];

  // Colors
  const colorSections = [
    ['bg', t.colors.bg],
    ['text', t.colors.text],
    ['border', t.colors.border],
    ['interactive', t.colors.interactive],
    ['status', t.colors.status],
  ] as const;

  for (const [section, values] of colorSections) {
    for (const [key, value] of Object.entries(values)) {
      lines.push(`--color-${section}-${key}: ${value}`);
    }
  }

  // Shadows
  for (const [key, value] of Object.entries(t.shadows)) {
    lines.push(`--shadow-${key}: ${value}`);
  }

  // Tokens
  lines.push(`--radius-default: 8px`);
  lines.push(`--transition-base: 150ms cubic-bezier(0.4, 0, 0.2, 1)`);

  return lines.join(';\n');
}

export default ThemeProvider;