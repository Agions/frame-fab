/**
 * 桌面快捷键控制器
 *
 * 集中所有快捷键的注册 / 注销 / 匹配逻辑。
 *
 * 单一职责：管理 document.keydown 事件监听与快捷键匹配。
 * 注意事项（原代码注释保留）：
 *   Tauri 1.x 的全局快捷键需要在 Rust 端注册，
 *   这里提供的是"前端快捷键监听"——仅在 webview 获焦时生效。
 *
 * 状态管理：
 *   - shortcuts: ShortcutDefinition → 用于查询 + 触发 action
 *   - shortcutHandlers: 组合键字符串 → addEventListener 注册的 handler
 *     （注销时需要同一引用，所以两边 Map 都保留）
 */

import type { ShortcutDefinition } from './desktop-app-types';

/** 快捷键 key → 组合键字符串 */
const shortcuts: Map<string, ShortcutDefinition> = new Map();

/** 组合键字符串 → document.keydown handler 引用（注销需要同一引用） */
const shortcutHandlers: Map<string, (event: KeyboardEvent) => void> = new Map();

/**
 * 把 (key + modifiers) 序列化为统一标识字符串。
 * 例：{key:'s', modifiers:['ctrl']} → 'ctrl+s'
 */
export function generateShortcutKey(key: string, modifiers?: string[]): string {
  const mods = modifiers ? modifiers.sort().join('+') : '';
  return `${mods}${mods ? '+' : ''}${key}`.toLowerCase();
}

/**
 * 把 event.getModifierState 与目标 modifier 对比。
 * 浏览器 event.ctrlKey 对应 modifier 'ctrl'——需要做别名映射。
 */
function isModifierActive(event: KeyboardEvent, modifier: string): boolean {
  const eventMod = modifier === 'ctrl' ? 'control' : modifier;
  return event.getModifierState(eventMod);
}

/**
 * 匹配 KeyboardEvent 是否对应某个快捷键定义。
 *
 * 匹配规则：
 *   - key 必须相等（忽略大小写）
 *   - 所有 required modifiers 必须按下
 *   - 非 required modifiers 中，除 shift 外都不能按下
 *     （shift 经常被意外按下，故意排除）
 */
export function matchShortcut(event: KeyboardEvent, shortcut: ShortcutDefinition): boolean {
  const key = event.key.toLowerCase();
  const targetKey = shortcut.key.toLowerCase();

  if (key !== targetKey) {
    return false;
  }

  const modifiers = shortcut.modifiers || [];
  const requiredModifiers = ['ctrl', 'shift', 'alt', 'meta'];

  for (const mod of requiredModifiers) {
    const isRequired = modifiers.includes(mod as 'ctrl' | 'shift' | 'alt' | 'meta');
    const isPressed = isModifierActive(event, mod);

    if (isRequired && !isPressed) {
      return false;
    }
    if (!isRequired && isPressed && mod !== 'shift') {
      return false;
    }
  }

  return true;
}

/**
 * 注册一个快捷键。重复注册同一组合键会覆盖旧的（先 unregister 旧 handler）。
 */
export function registerShortcut(shortcut: ShortcutDefinition): void {
  const key = generateShortcutKey(shortcut.key, shortcut.modifiers);
  shortcuts.set(key, shortcut);

  const handler = (event: KeyboardEvent) => {
    if (matchShortcut(event, shortcut)) {
      event.preventDefault();
      shortcut.action();
    }
  };

  // 同一组合键再次注册：先解绑旧 handler，避免内存泄漏
  const previousHandler = shortcutHandlers.get(key);
  if (previousHandler) {
    document.removeEventListener('keydown', previousHandler);
  }

  shortcutHandlers.set(key, handler);
  document.addEventListener('keydown', handler);
}

/**
 * 注销一个快捷键（按 key + modifiers 匹配）
 */
export function unregisterShortcut(key: string, modifiers?: string[]): void {
  const shortcutKey = generateShortcutKey(key, modifiers);
  const handler = shortcutHandlers.get(shortcutKey);

  if (handler) {
    document.removeEventListener('keydown', handler);
    shortcutHandlers.delete(shortcutKey);
    shortcuts.delete(shortcutKey);
  }
}

/** 注销全部已注册快捷键 */
export function unregisterAllShortcuts(): void {
  shortcutHandlers.forEach((handler) => {
    document.removeEventListener('keydown', handler);
  });
  shortcutHandlers.clear();
  shortcuts.clear();
}
