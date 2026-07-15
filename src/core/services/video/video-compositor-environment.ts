/**
 * 视频合成环境检测
 *
 * isTauri 实现位于 shared/utils/environment.ts（shared 层不依赖 core）。
 * isFFmpegWasmAvailable 保留在 core（涉及 SharedArrayBuffer 检测）。
 */

import { isTauri } from '@/shared/utils/environment';

/** 检测浏览器是否支持 FFmpeg.wasm（需 SharedArrayBuffer） */
export function isFFmpegWasmAvailable(): boolean {
  return typeof SharedArrayBuffer !== 'undefined';
}

/** 返回当前环境的"能力快照" */
export function getSupportedFeatures(): {
  ffmpegWasm: boolean;
  tauri: boolean;
  sharedArrayBuffer: boolean;
} {
  const sharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
  return {
    ffmpegWasm: sharedArrayBuffer,
    tauri: isTauri(),
    sharedArrayBuffer,
  };
}

export { isTauri };
