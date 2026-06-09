/**
 * 字幕文本预处理
 *
 * 把"清洗/格式化字幕文本"这一小职责独立出来，
 * 供多个生成器复用。
 */

/**
 * 压缩连续空白 + 去首尾空白。
 *
 * 注：原实现里"末尾无标点自动加句号"的逻辑是空操作（已注释掉），
 * 这里只保留真实生效的清理逻辑，保持行为一致。
 */
export function processSubtitleText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}
