/**
 * 分镜订阅器
 * @module core/services/storyboard-subscriber
 *
 * 封装原 StoryboardService.listeners 数组 + subscribe / notifyChange。
 * 提供工厂创建独立实例，便于多项目场景共享。
 */

import type { StoryboardFrame } from './storyboard-types';

/** 订阅者回调签名 */
export type StoryboardListener = (storyboards: StoryboardFrame[]) => void;

/** 订阅器接口 */
export interface StoryboardSubscriber {
  /** 订阅变更，返回取消订阅函数 */
  subscribe: (listener: StoryboardListener) => () => void;
  /** 通知所有订阅者 */
  notify: (frames: StoryboardFrame[]) => void;
}

/**
 * 创建一个分镜订阅器实例
 */
export function createStoryboardSubscriber(): StoryboardSubscriber {
  let listeners: StoryboardListener[] = [];

  return {
    subscribe(listener) {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter((l) => l !== listener);
      };
    },
    notify(frames) {
      for (const listener of listeners) {
        listener(frames);
      }
    },
  };
}
