/**
 * Design Tokens — 设计令牌
 * 统一管理所有设计变量：颜色、间距、字体、阴影、动画
 * 支持浅色/深色主题切换
 */

export const tokens = {
  colors: {
    // Primary palette
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },
    // Neutral palette
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    // Semantic colors
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
    // Accent palette
    accent: {
      purple: '#8B5CF6',
      cyan: '#06B6D4',
      pink: '#EC4899',
      orange: '#F97316',
    },
  },

  spacing: {
    0: '0px',
    0.5: '2px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },

  typography: {
    fontFamily: {
      sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      mono: "'SF Mono', 'Fira Code', 'Roboto Mono', monospace",
      display: "'Inter', system-ui, sans-serif",
    },
    fontSize: {
      '2xs': '10px',
      xs: '12px',
      sm: '13px',
      base: '14px',
      md: '15px',
      lg: '16px',
      xl: '18px',
      '2xl': '20px',
      '3xl': '24px',
      '4xl': '30px',
      '5xl': '38px',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },

  borderRadius: {
    none: '0px',
    sm: '4px',
    base: '6px',
    default: '8px',
    md: '10px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px',
  },

  shadows: {
    none: 'none',
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  transitions: {
    duration: {
      instant: '50ms',
      fast: '100ms',
      base: '150ms',
      slow: '200ms',
      slower: '300ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  layout: {
    headerHeight: '64px',
    siderWidth: '240px',
    siderCollapsedWidth: '72px',
    contentMaxWidth: '1280px',
    containerPadding: '24px',
  },

  breakpoints: {
    xs: '480px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    '2xl': '1536px',
  },
} as const;

// ============================================
// Theme: Light & Dark
// ============================================

export type ThemeMode = 'light' | 'dark';

export const theme = {
  light: {
    mode: 'light' as ThemeMode,
    colors: {
      bg: {
        base: '#FFFFFF',
        elevated: '#FFFFFF',
        container: '#F9FAFB',
        surface: '#F3F4F6',
        overlay: 'rgba(0, 0, 0, 0.5)',
      },
      text: {
        primary: '#111827',
        secondary: '#4B5563',
        tertiary: '#9CA3AF',
        disabled: '#D1D5DB',
        inverse: '#FFFFFF',
      },
      border: {
        default: '#E5E7EB',
        secondary: '#F3F4F6',
        focused: '#3B82F6',
      },
      interactive: {
        primary: '#3B82F6',
        primaryHover: '#2563EB',
        primaryActive: '#1D4ED8',
        secondary: '#6B7280',
        secondaryHover: '#4B5563',
      },
      status: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
    },
    shadows: {
      card: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      focus: '0 0 0 3px rgba(59, 130, 246, 0.3)',
    },
  },

  dark: {
    mode: 'dark' as ThemeMode,
    colors: {
      bg: {
        base: '#0F172A',
        elevated: '#1E293B',
        container: '#1E293B',
        surface: '#334155',
        overlay: 'rgba(0, 0, 0, 0.7)',
      },
      text: {
        primary: '#F9FAFB',
        secondary: '#CBD5E1',
        tertiary: '#94A3B8',
        disabled: '#64748B',
        inverse: '#0F172A',
      },
      border: {
        default: '#334155',
        secondary: '#1E293B',
        focused: '#60A5FA',
      },
      interactive: {
        primary: '#60A5FA',
        primaryHover: '#3B82F6',
        primaryActive: '#2563EB',
        secondary: '#94A3B8',
        secondaryHover: '#CBD5E1',
      },
      status: {
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',
        info: '#60A5FA',
      },
    },
    shadows: {
      card: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
      dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      modal: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      focus: '0 0 0 3px rgba(96, 165, 250, 0.3)',
    },
  },
} as const;

export type Theme = typeof theme.light | typeof theme.dark;
export type ThemeDark = typeof theme.dark;

// ============================================
// CSS Custom Properties Generator
// ============================================

/**
 * Generate CSS custom properties string for a theme
 */
export function generateCSSVars(themeMode: ThemeMode): string {
  const t = theme[themeMode];
  const vars: string[] = [];

  // Colors
  for (const [key, value] of Object.entries(t.colors.bg)) {
    vars.push(`--color-bg-${key}: ${value}`);
  }
  for (const [key, value] of Object.entries(t.colors.text)) {
    vars.push(`--color-text-${key}: ${value}`);
  }
  for (const [key, value] of Object.entries(t.colors.border)) {
    vars.push(`--color-border-${key}: ${value}`);
  }
  for (const [key, value] of Object.entries(t.colors.interactive)) {
    vars.push(`--color-interactive-${key}: ${value}`);
  }
  for (const [key, value] of Object.entries(t.colors.status)) {
    vars.push(`--color-status-${key}: ${value}`);
  }

  // Shadows
  for (const [key, value] of Object.entries(t.shadows)) {
    vars.push(`--shadow-${key}: ${value}`);
  }

  // Global tokens
  vars.push(`--radius-default: ${tokens.borderRadius.default}`);
  vars.push(`--transition-base: ${tokens.transitions.duration.base} ${tokens.transitions.easing.inOut}`);

  return vars.join(';\n');
}

// ============================================
// Type exports
// ============================================

export type Colors = typeof tokens.colors;
export type Spacing = typeof tokens.spacing;
export type Typography = typeof tokens.typography;
export type BorderRadius = typeof tokens.borderRadius;
export type Shadows = typeof tokens.shadows;
export type Transitions = typeof tokens.transitions;
export type Layout = typeof tokens.layout;
export type Breakpoints = typeof tokens.breakpoints;