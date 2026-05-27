/**
 * Formatters — 格式化工具（日期、时间、文件大小等）
 * 统一所有格式化逻辑，杜绝散落各处
 */

import { formatDate, formatRelativeTime } from '../utils';

// ============================================
// 时间格式化
// ============================================

export interface FormatDurationOptions {
  hours?: 'never' | 'if-nonzero' | 'always';
  ms?: 0 | 1 | 2 | 3;
  separator?: string;
  decimalMark?: string;
}

/**
 * 统一时间格式化（秒 → H:MM:SS）
 * @example formatDuration(90)              => '01:30'
 * @example formatDuration(90.5, { ms: 1 })  => '01:30.5'
 */
export function formatDuration(seconds: number, opts: FormatDurationOptions = {}): string {
  const { hours = 'never', ms = 0, separator = ':', decimalMark = '.' } = opts;
  if (isNaN(seconds) || seconds < 0) {
    return `00:00${ms > 0 ? decimalMark + '0'.repeat(ms) : ''}`;
  }

  const totalSecs = Math.floor(seconds);
  const s = totalSecs % 60;
  const totalMins = Math.floor(totalSecs / 60);
  const h = Math.floor(totalMins / 60);
  const m = hours === 'never' ? totalMins : totalMins % 60;
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  const hourStr = hours === 'always' ? `${pad(h)}${separator}` :
                  hours === 'if-nonzero' && h > 0 ? `${h}${separator}` : '';

  let msStr = '';
  if (ms > 0) {
    const base = ms === 3 ? 1000 : ms === 2 ? 100 : 10;
    const frac = Math.floor((seconds - totalSecs) * base);
    msStr = decimalMark + String(frac).padStart(ms, '0').slice(0, ms);
  }

  return `${hourStr}${pad(m)}${separator}${pad(s)}${msStr}`;
}

/**
 * 帧时间格式化（帧 → MM:SS:FF）
 * @param frame 帧号
 * @param fps 每秒帧数
 */
export function formatFrameTime(frame: number, fps = 24): string {
  const totalSeconds = frame / fps;
  return formatDuration(totalSeconds);
}

// ============================================
// 文件大小格式化
// ============================================

export type FileSizeUnit = 'auto' | 'B' | 'KB' | 'MB' | 'GB';

/**
 * 格式化文件大小
 * @example formatFileSize(1024)        => '1.0 KB'
 * @example formatFileSize(1048576)      => '1.0 MB'
 * @example formatFileSize(1024, 'auto') => '1.0 KB'
 */
export function formatFileSize(bytes: number, unit: FileSizeUnit = 'auto'): string {
  const units: Array<{ threshold: number; label: string; divisor: number }> = [
    { threshold: 1024 * 1024 * 1024, label: 'GB', divisor: 1024 * 1024 * 1024 },
    { threshold: 1024 * 1024, label: 'MB', divisor: 1024 * 1024 },
    { threshold: 1024, label: 'KB', divisor: 1024 },
    { threshold: 0, label: 'B', divisor: 1 },
  ];

  if (unit !== 'auto') {
    const target = units.find((u) => u.label === unit);
    if (target) return `${(bytes / target.divisor).toFixed(1)} ${unit}`;
  }

  for (const { threshold, label, divisor } of units) {
    if (bytes >= threshold) {
      return `${(bytes / divisor).toFixed(1)} ${label}`;
    }
  }
  return `${bytes} B`;
}

// ============================================
// 数字格式化
// ============================================

/**
 * 数字千分位分隔符
 * @example formatNumber(1234567) => '1,234,567'
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 百分比格式化
 * @example formatPercent(0.1234) => '12%'
 * @example formatPercent(0.1234, 1) => '12.3%'
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// ============================================
// 文本格式化
// ============================================

/**
 * 脱敏处理（手机号、身份证等）
 * @example maskPhone('13812345678') => '138****5678'
 */
export function maskString(str: string, startVisible = 3, endVisible = 4, maskChar = '*'): string {
  if (str.length <= startVisible + endVisible) return str;
  const start = str.slice(0, startVisible);
  const end = str.slice(-endVisible);
  const mask = maskChar.repeat(str.length - startVisible - endVisible);
  return `${start}${mask}${end}`;
}

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 驼峰转短横线
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

// ============================================
// 导出汇总
// ============================================

export const formatters = {
  date: formatDate,
  relativeTime: formatRelativeTime,
  duration: formatDuration,
  frameTime: formatFrameTime,
  fileSize: formatFileSize,
  number: formatNumber,
  percent: formatPercent,
  mask: maskString,
  capitalize,
  camelToKebab,
};

export default formatters;