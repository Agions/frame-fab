/**
 * 环境检测工具
 * shared 层自建，不依赖 core（core 反从 shared 导入）
 */

/** 检测是否在 Tauri 桌面环境运行 */
export function isTauri(): boolean {
  if (typeof window === 'undefined') return false;
  return '__TAURI__' in window;
}
