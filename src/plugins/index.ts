/**
 * Plugins Layer — 插件系统导出
 */

export { PluginHost, pluginHost, type IPluginHost } from './plugin-host';
export type {
  IStylePlugin,
  IFormatPlugin,
  StyleParams,
  ExportOptions,
  EncodingOptions,
  ValidationResult,
  Frame,
  AudioTrack,
  QualityGateThresholds,
} from './types/plugin.types';