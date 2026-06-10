/**
 * 桌面通知控制器
 *
 * 集中所有 Tauri Notification API 操作。
 *
 * 重复模式识别：
 *   原代码 notifySuccess/notifyError/notifyInfo 三个方法体字面相同，
 *   只差默认 title 文案。用 createNotifyFactory(defaultTitle) 工厂
 *   一行生成，行为 1:1 保留（测试 / 调用方零影响）。
 *
 * 单一职责：通知权限检查 + 发送。无快捷键 / 窗口相关代码。
 */

import {
  sendNotification,
  isPermissionGranted,
  requestPermission,
} from '@tauri-apps/plugin-notification';

import { logger } from '@/core/utils/logger';

import type { NotificationOptions } from './desktop-app-types';

/** 检查通知权限 */
export async function checkNotificationPermission(): Promise<boolean> {
  return await isPermissionGranted();
}

/** 请求通知权限（返回是否被授权） */
export async function requestNotificationPermission(): Promise<boolean> {
  const permission = await requestPermission();
  return permission === 'granted';
}

/**
 * 发送通知（自动处理权限检查和申请）
 */
export async function sendDesktopNotification(options: NotificationOptions): Promise<void> {
  const hasPermission = await checkNotificationPermission();

  if (!hasPermission) {
    const granted = await requestNotificationPermission();
    if (!granted) {
      logger.warn('通知权限被拒绝');
      return;
    }
  }

  await sendNotification({
    title: options.title,
    body: options.body,
  });
}

/**
 * 构造带默认 title 的便捷通知函数。
 *
 * 原代码 notifySuccess/notifyError/notifyInfo 三个方法体完全一致，
 * 只差默认 title 文案——用工厂消除重复。
 */
function createNotifyShortcut(defaultTitle: string) {
  return async function notifyByType(message: string, title: string = defaultTitle): Promise<void> {
    await sendDesktopNotification({ title, body: message });
  };
}

/** 发送成功通知（默认 title：操作成功） */
export const notifySuccess = createNotifyShortcut('操作成功');

/** 发送错误通知（默认 title：操作失败） */
export const notifyError = createNotifyShortcut('操作失败');

/** 发送信息通知（默认 title：提示） */
export const notifyInfo = createNotifyShortcut('提示');
