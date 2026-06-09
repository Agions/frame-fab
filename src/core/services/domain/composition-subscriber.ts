/**
 * Composition 监听器集合
 *
 * 把 add/remove/notify 三件套从 CompositionService 类剥离。
 * 使用数组 + filter 实现，与原行为一致：
 * - subscribe 返回的 unsubscribe 通过 filter 删除自己
 * - notify 用 forEach 同步分发
 */

import type { CompositionListener, CompositionProject } from './composition-types';

export class CompositionSubscriber {
  private listeners: CompositionListener[] = [];

  /**
   * 注册一个监听器，返回 unsubscribe 函数。
   * 行为与原 CompositionService.subscribe 完全一致。
   */
  subscribe(listener: CompositionListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * 同步通知所有监听器。
   */
  notify(composition: CompositionProject | null): void {
    this.listeners.forEach((listener) => listener(composition));
  }

  /** 当前监听器数量（仅供调试） */
  get size(): number {
    return this.listeners.length;
  }
}
