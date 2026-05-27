/**
 * PluginHost — 插件宿主
 * 负责插件的注册、激活、查询、匹配
 * 遵循开闭原则：新增风格/格式只需写插件文件并注册
 */

import { logger } from '@/core/utils/logger';
import { eventBus, EventBus } from '@/infrastructure/queue/event-bus';
import type {
  IStylePlugin,
  IFormatPlugin,
  StyleParams,
} from './types/plugin.types';
import {
  PluginRegisteredEvent,
  PluginActivatedEvent,
} from '@/domain/shared/events/domain-events';

/**
 * IPluginHost — 插件宿主接口
 */
export interface IPluginHost {
  registerStyle(plugin: IStylePlugin): void;
  registerFormat(plugin: IFormatPlugin): void;
  activateStyle(pluginId: string): void;
  activateFormat(pluginId: string): void;
  getStylePlugin(id: string): IStylePlugin | undefined;
  getFormatPlugin(id: string): IFormatPlugin | undefined;
  matchStyle(prompt: string): IStylePlugin | undefined;
  getActiveStyle(): IStylePlugin | undefined;
  getActiveFormat(): IFormatPlugin | undefined;
  getAllStyles(): IStylePlugin[];
  getAllFormats(): IFormatPlugin[];
  unregister(pluginId: string): void;
}

/**
 * PluginHost — 插件宿主实现
 */
export class PluginHost implements IPluginHost {
  private stylePlugins = new Map<string, IStylePlugin>();
  private formatPlugins = new Map<string, IFormatPlugin>();
  private activeStyleId: string | null = null;
  private activeFormatId: string | null = null;
  private bus: EventBus;

  constructor(bus: EventBus = eventBus) {
    this.bus = bus;
  }

  /** 注册风格插件 */
  registerStyle(plugin: IStylePlugin): void {
    if (this.stylePlugins.has(plugin.id)) {
      logger.warn(`[PluginHost] Style plugin already registered: ${plugin.id}`);
      return;
    }
    this.stylePlugins.set(plugin.id, plugin);
    this.bus.publish(new PluginRegisteredEvent('PluginHost', 'style', plugin.id, plugin.name));
    logger.info(`[PluginHost] Registered style plugin: ${plugin.id} (${plugin.name})`);
  }

  /** 注册格式插件 */
  registerFormat(plugin: IFormatPlugin): void {
    if (this.formatPlugins.has(plugin.id)) {
      logger.warn(`[PluginHost] Format plugin already registered: ${plugin.id}`);
      return;
    }
    this.formatPlugins.set(plugin.id, plugin);
    this.bus.publish(new PluginRegisteredEvent('PluginHost', 'format', plugin.id, plugin.name));
    logger.info(`[PluginHost] Registered format plugin: ${plugin.id} (${plugin.name})`);
  }

  /** 激活风格插件 */
  activateStyle(pluginId: string): void {
    const plugin = this.stylePlugins.get(pluginId);
    if (!plugin) throw new Error(`Style plugin not found: ${pluginId}`);
    this.activeStyleId = pluginId;
    this.bus.publish(new PluginActivatedEvent('PluginHost', 'style', pluginId));
    logger.info(`[PluginHost] Activated style plugin: ${pluginId}`);
  }

  /** 激活格式插件 */
  activateFormat(pluginId: string): void {
    const plugin = this.formatPlugins.get(pluginId);
    if (!plugin) throw new Error(`Format plugin not found: ${pluginId}`);
    this.activeFormatId = pluginId;
    this.bus.publish(new PluginActivatedEvent('PluginHost', 'format', pluginId));
    logger.info(`[PluginHost] Activated format plugin: ${pluginId}`);
  }

  /** 根据 prompt 匹配合适的风格插件 */
  matchStyle(prompt: string): IStylePlugin | undefined {
    let best: IStylePlugin | undefined;
    let bestScore = -1;

    for (const plugin of this.stylePlugins.values()) {
      const score = plugin.matches(prompt);
      if (score > bestScore) {
        bestScore = score;
        best = plugin;
      }
    }

    return bestScore > 0.3 ? best : undefined;
  }

  /** 获取指定风格插件 */
  getStylePlugin(id: string): IStylePlugin | undefined {
    return this.stylePlugins.get(id);
  }

  /** 获取指定格式插件 */
  getFormatPlugin(id: string): IFormatPlugin | undefined {
    return this.formatPlugins.get(id);
  }

  /** 获取当前激活的风格插件 */
  getActiveStyle(): IStylePlugin | undefined {
    return this.activeStyleId ? this.stylePlugins.get(this.activeStyleId) : undefined;
  }

  /** 获取当前激活的格式插件 */
  getActiveFormat(): IFormatPlugin | undefined {
    return this.activeFormatId ? this.formatPlugins.get(this.activeFormatId) : undefined;
  }

  /** 获取所有已注册的风格插件（按优先级排序） */
  getAllStyles(): IStylePlugin[] {
    return Array.from(this.stylePlugins.values()).sort(
      (a, b) => a.priority - b.priority
    );
  }

  /** 获取所有已注册的格式插件 */
  getAllFormats(): IFormatPlugin[] {
    return Array.from(this.formatPlugins.values());
  }

  /** 销毁插件 */
  unregister(pluginId: string): void {
    const removedStyle = this.stylePlugins.delete(pluginId);
    const removedFormat = this.formatPlugins.delete(pluginId);
    if (this.activeStyleId === pluginId) this.activeStyleId = null;
    if (this.activeFormatId === pluginId) this.activeFormatId = null;
    if (removedStyle || removedFormat) {
      logger.info(`[PluginHost] Unregistered plugin: ${pluginId}`);
    }
  }
}

// Global singleton
export const pluginHost = new PluginHost();
export default pluginHost;