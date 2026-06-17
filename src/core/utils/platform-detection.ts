/**
 * 平台检测
 */
export type Platform = 'web' | 'desktop';

const getPlatform = (): Platform => {
  if (typeof window !== 'undefined' && '__TAURI__' in window) return 'desktop';
  return 'web';
};

export const platform = getPlatform();
export const isDesktop = platform === 'desktop';
