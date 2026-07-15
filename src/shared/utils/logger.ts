/**
 * shared 层轻量日志（不依赖 core）
 * 提供与 core/utils/logger 一致的接口，shared 消费者可直接使用
 */

export const logger = {
  info: (...args: unknown[]) => console.info('[Shared]', ...args),
  warn: (...args: unknown[]) => console.warn('[Shared]', ...args),
  error: (...args: unknown[]) => console.error('[Shared]', ...args),
  debug: (...args: unknown[]) => console.debug('[Shared]', ...args),
  success: (...args: unknown[]) => console.info('[Shared:success]', ...args),
};
