/**
 * 字节 Seedance 视频生成服务
 */

import axios from 'axios';

import type { VideoGenerationOptions, VideoGenerationResult } from '../types';
import { getAPIKey } from '../utils';

/**
 * Seedance 视频生成 (字节)
 */
export async function generateVideoWithSeedance(
  prompt: string,
  options: VideoGenerationOptions = {}
): Promise<VideoGenerationResult> {
  const { duration = 5, referenceImage, negativePrompt, aspectRatio = '16:9', signal } = options;

  const apiKey = await getAPIKey('seedance');

  const response = await axios({
    method: 'post',
    url: 'https://ark.cn-beijing.volces.com/api/v3/video/generations',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    data: {
      model: 'seedance-2-0-250212',
      prompt,
      negative_prompt: negativePrompt,
      duration,
      image_url: referenceImage,
      aspect_ratio: aspectRatio,
    },
    signal,
  });

  const videoData = response.data?.data?.[0];

  return {
    url: videoData?.url ?? '',
    coverUrl: videoData?.cover_image_url,
    duration,
    width: videoData?.width ?? 1920,
    height: videoData?.height ?? 1080,
    model: 'seedance-2.0',
    taskId: videoData?.task_id,
    status: 'processing',
  };
}
