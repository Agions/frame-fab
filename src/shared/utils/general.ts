/**
 * frame-fab Shared Utils - General Utilities (facade)
 *
 * 按职责拆分为 6 个子模块，本文件仅做 re-export 保持向后兼容。
 */

// 计时工具：防抖、节流、延迟、重试
export { debounce, throttle, delay, retry, PROCESSING_DELAY_MS } from './timing';

// 数据工具：深拷贝、ID 生成、安全解析、哈希
export {
  deepClone,
  generateId,
  generatePrefixedId,
  generateSceneId,
  generateFrameId,
  generateCharId,
  generateCompId,
  generateProjectId,
  generateItemId,
  safeJSONParse,
  computeHash,
} from './data';

// 字符串工具：截断、大小写、命名风格、校验
export {
  truncateText,
  capitalize,
  camelToKebab,
  kebabToCamel,
  isValidEmail,
  isValidURL,
} from './string';

// 集合工具：数组分块/去重/排序、对象过滤/映射
export { chunkArray, uniqueArray, sortBy } from './collection';

// 颜色工具：随机颜色、对比度
export { randomColor, getContrastColor } from './color';

// 文件工具：下载、读取、剪贴板、类型检测
export {
  downloadFile,
  readFileAsDataURL,
  readFileAsText,
  copyToClipboard,
  readFromClipboard,
  detectFileType,
} from './file';
