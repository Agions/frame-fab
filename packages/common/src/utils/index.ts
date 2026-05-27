/**
 * 工具函数库 — DRY 抽取所有散落的工具函数
 * 来源：原来是散落在各 feature 目录中的重复实现
 */

// ============================================
// ID 生成
// ============================================

/**
 * 生成唯一 ID — 使用 crypto API，替代 Math.random()
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${randomPart}`;
}

/**
 * 生成带前缀的唯一ID
 * @example generatePrefixedId('scene') => 'scene_1a2b3c4d_x5y6z7'
 */
export function generatePrefixedId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}_${randomPart}`;
}

export const generateSceneId = () => generatePrefixedId('scene');
export const generateFrameId = () => generatePrefixedId('frame');
export const generateCharId = () => generatePrefixedId('char');
export const generateCompId = () => generatePrefixedId('comp');
export const generateProjectId = () => generatePrefixedId('proj');
export const generateItemId = () => generatePrefixedId('item');

// ============================================
// 日期格式化
// ============================================

export interface FormatDateOptions {
  format?: 'date' | 'datetime' | 'time' | 'iso';
  locale?: string;
 补零?: boolean;
}

/**
 * 统一日期格式化 — 一个函数覆盖所有格式需求
 * @example formatDate(new Date())           => '2026-01-15'
 * @example formatDate(new Date(), 'datetime')=> '2026-01-15 14:30:00'
 */
export function formatDate(
  date: Date | string | number,
  options: FormatDateOptions = {}
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const { format = 'date', 补零 = true } = options;
  const pad = (n: number) =>补零 ? String(n).padStart(2, '0') : String(n);

  if (format === 'iso') return d.toISOString();

  const YYYY = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const DD = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());

  if (format === 'date') return `${YYYY}-${MM}-${DD}`;
  if (format === 'time') return `${HH}:${mm}:${ss}`;
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`;
}

/**
 * 相对时间格式化
 * @example formatRelativeTime(Date.now() - 60000) => '刚刚'
 * @example formatRelativeTime(Date.now() - 3600000) => '1小时前'
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = Date.now();
  const d = new Date(date).getTime();
  const diff = now - d;

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
  return formatDate(d, { format: 'date' });
}

// ============================================
// 校验
// ============================================

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidURL(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

export function isValidPhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 限制字符串长度（中文按2字符算）
 */
export function truncate(str: string, maxBytes: number, suffix = '...'): string {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    len += code > 0x7f ? 2 : 1;
    if (len > maxBytes) return str.slice(0, i) + suffix;
  }
  return str;
}

// ============================================
// 文件操作
// ============================================

export function detectFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    mp4: 'video', mov: 'video', avi: 'video', mkv: 'video', webm: 'video',
    mp3: 'audio', wav: 'audio', flac: 'audio', aac: 'audio',
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', svg: 'image',
    pdf: 'document', doc: 'document', docx: 'document',
    txt: 'text', json: 'code', js: 'code', ts: 'code',
    srt: 'subtitle', vtt: 'subtitle', ass: 'subtitle',
  };
  return map[ext] ?? 'unknown';
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function downloadFile(content: string | Blob, filename: string, mimeType?: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType ?? 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================
// 通用工具
// ============================================

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, i)));
    }
  }
  throw lastError!;
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as unknown as T;
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
  return chunks;
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const cmp = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
    return order === 'asc' ? cmp : -cmp;
  });
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

// ============================================
// 异步
// ============================================

/**
 * 延迟（Promise 版本的 setTimeout）
 * @example await delay(1000) // 等待 1 秒
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}