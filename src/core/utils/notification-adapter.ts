/**
 * 通知 + 剪贴板适配器
 */
import { isDesktop } from './platform-detection';

export interface NotificationAdapter {
  show(options: { title: string; body?: string; icon?: string }): void;
  requestPermission(): Promise<boolean>;
}

class WebNotificationAdapter implements NotificationAdapter {
  show(options: { title: string; body?: string; icon?: string }): void {
    if (Notification.permission === 'granted')
      new Notification(options.title, { body: options.body, icon: options.icon });
  }
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;
    return (await Notification.requestPermission()) === 'granted';
  }
}

class DesktopNotificationAdapter implements NotificationAdapter {
  show(options: { title: string; body?: string; icon?: string }): void {
    if (!options.title) return;
    void getTauriNotification().then(({ notify }) => notify(options.title, options.body));
  }
  async requestPermission(): Promise<boolean> {
    const { isPermissionGranted, requestPermission } =
      await import('@tauri-apps/plugin-notification');
    let granted = await isPermissionGranted();
    if (!granted) granted = (await requestPermission()) === 'granted';
    return granted;
  }
}

async function getTauriNotification() {
  const { sendNotification } = await import('@tauri-apps/plugin-notification');
  return { notify: (title: string, body?: string) => sendNotification({ title, body }) };
}

export const getNotificationAdapter = (): NotificationAdapter => {
  return isDesktop ? new DesktopNotificationAdapter() : new WebNotificationAdapter();
};

// ========== 剪贴板适配 ==========
export interface ClipboardAdapter {
  read(): Promise<string>;
  write(text: string): Promise<void>;
}

class WebClipboardAdapter implements ClipboardAdapter {
  async read(): Promise<string> {
    return await navigator.clipboard.readText();
  }
  async write(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
  }
}

export const getClipboardAdapter = (): ClipboardAdapter => new WebClipboardAdapter();
