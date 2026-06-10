/**
 * 存储适配器
 */
import { isDesktop } from './platform-detection';

export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

class WebStorageAdapter implements StorageAdapter {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
  remove(key: string): void {
    localStorage.removeItem(key);
  }
  clear(): void {
    localStorage.clear();
  }
}

class DesktopStorageAdapter implements StorageAdapter {
  private storage = new WebStorageAdapter();
  get<T>(key: string): T | null {
    return this.storage.get<T>(key);
  }
  set<T>(key: string, value: T): void {
    this.storage.set(key, value);
  }
  remove(key: string): void {
    this.storage.remove(key);
  }
  clear(): void {
    this.storage.clear();
  }
}

export const getStorageAdapter = (): StorageAdapter => {
  return isDesktop ? new DesktopStorageAdapter() : new WebStorageAdapter();
};
