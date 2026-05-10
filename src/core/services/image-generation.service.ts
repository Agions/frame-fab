/**
 * 图像生成服务 - 统一入口
 * 支持：字节 Seedream、快手可灵、生数 Vidu
 */

// Re-export types
export type {
  ImageModel,
  ImageSize,
  ImageGenerationOptions,
  ImageGenerationResult,
  VideoGenerationOptions,
  VideoGenerationResult,
} from './image-generation/types';

// Re-export providers
export { generateWithSeedream } from './image-generation/providers/seedream';
export { generateWithKling, generateVideoWithKling } from './image-generation/providers/kling';
export { generateWithVidu, generateVideoWithVidu } from './image-generation/providers/vidu';
export { generateVideoWithSeedance } from './image-generation/providers/seedance';

// Import from providers for unified API
import axios from 'axios';

import { generateWithKling, generateVideoWithKling } from './image-generation/providers/kling';
import { generateVideoWithSeedance } from './image-generation/providers/seedance';
import { generateWithSeedream } from './image-generation/providers/seedream';
import { generateWithVidu, generateVideoWithVidu } from './image-generation/providers/vidu';
import type {
  ImageGenerationOptions,
  ImageGenerationResult,
  VideoGenerationOptions,
  VideoGenerationResult,
} from './image-generation/types';
import { getAPIKey } from './image-generation/utils';

/**
 * 图像生成 - 统一入口
 */
export async function generateImage(
  prompt: string,
  options: ImageGenerationOptions = {}
): Promise<ImageGenerationResult> {
  const model = options.model ?? 'seedream-5.0';

  switch (model) {
    case 'seedream-5.0':
      return generateWithSeedream(prompt, options);
    case 'kling-1.6':
      return generateWithKling(prompt, options);
    case 'vidu-2.0':
      return generateWithVidu(prompt, options);
    default:
      return generateWithSeedream(prompt, options);
  }
}

/**
 * 视频生成 - 统一入口
 */
export async function generateVideo(
  prompt: string,
  options: VideoGenerationOptions = {}
): Promise<VideoGenerationResult> {
  const model = options.model ?? 'seedance-2.0';

  switch (model) {
    case 'seedance-2.0':
      return generateVideoWithSeedance(prompt, options);
    case 'kling-1.6':
      return generateVideoWithKling(prompt, options);
    case 'vidu-2.0':
      return generateVideoWithVidu(prompt, options);
    default:
      return generateVideoWithSeedance(prompt, options);
  }
}

/**
 * 查询视频生成状态
 */
export async function getVideoStatus(
  taskId: string,
  model: string = 'seedance-2.0'
): Promise<VideoGenerationResult> {
  let url = '';
  let apiKey = '';

  switch (model) {
    case 'seedance-2.0':
      url = `https://ark.cn-beijing.volces.com/api/v3/video/tasks/${taskId}`;
      apiKey = await getAPIKey('seedance');
      break;
    case 'kling-1.6':
      url = `https://api.klingai.com/v1/videos/tasks/${taskId}`;
      apiKey = await getAPIKey('kling');
      break;
    case 'vidu-2.0':
      url = `https://api.vidu.cn/v1/videos/tasks/${taskId}`;
      apiKey = await getAPIKey('vidu');
      break;
  }

  const response = await axios({
    method: 'get',
    url,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  const videoData = response.data?.data ?? response.data;

  return {
    url: videoData?.url ?? '',
    coverUrl: videoData?.cover_url ?? videoData?.cover_image_url,
    duration: videoData?.duration ?? 5,
    width: videoData?.width ?? 1920,
    height: videoData?.height ?? 1080,
    model,
    taskId,
    status:
      videoData?.status === 'completed'
        ? 'completed'
        : videoData?.status === 'failed'
          ? 'failed'
          : 'processing',
  };
}

// ========== 服务导出（向后兼容）==========

export const imageGenerationService = {
  generateImage,
  generateVideo,
  getVideoStatus,
  // 单独服务
  seedream: generateWithSeedream,
  kling: {
    image: generateWithKling,
    video: generateVideoWithKling,
  },
  vidu: {
    image: generateWithVidu,
    video: generateVideoWithVidu,
  },
  seedance: generateVideoWithSeedance,
};

export default imageGenerationService;
