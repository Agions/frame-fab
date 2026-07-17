/**
 * video-compositor-service.ts 单元测试
 * ====================================
 * 测试双模 compositor facade：环境检测 → 分支选择 → 错误传播。
 *
 * 策略：
 * - mock video-compositor-environment 控制 isTauri / isFFmpegWasmAvailable
 * - mock tauri / ffmpeg 子模块验证正确分支被调用
 * - 验证 error 路径和类型转换
 */

// Mock 环境检测模块
const mockIsTauri = jest.fn().mockReturnValue(false);
const mockIsFFmpegWasmAvailable = jest.fn().mockReturnValue(false);

jest.mock('@/core/services/video/video-compositor-environment', () => ({
  isTauri: () => mockIsTauri(),
  isFFmpegWasmAvailable: () => mockIsFFmpegWasmAvailable(),
  getSupportedFeatures: jest.fn().mockReturnValue({
    ffmpegWasm: false,
    tauri: false,
    sharedArrayBuffer: false,
  }),
}));

// Mock logger
jest.mock('@/core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock tauri 子模块
const mockTauriCompose = jest.fn().mockResolvedValue({
  outputPath: 'tauri://output.mp4',
  outputBlob: new Blob(['tauri-mp4']),
  duration: 10,
  width: 1920,
  height: 1080,
  fileSize: 1000,
});

const mockTauriAddSubtitles = jest.fn().mockResolvedValue({
  outputPath: 'tauri://subbed.mp4',
  outputBlob: new Blob(['tauri-subbed']),
  duration: 10,
  width: 1920,
  height: 1080,
  fileSize: 1200,
});

const mockTauriAddBackgroundMusic = jest.fn().mockResolvedValue({
  outputPath: 'tauri://with-music.mp4',
  outputBlob: new Blob(['tauri-music']),
  duration: 10,
  width: 1920,
  height: 1080,
  fileSize: 1500,
});

const mockTauriExportVideo = jest.fn().mockResolvedValue({
  outputPath: 'tauri://exported.mp4',
  outputBlob: new Blob(['tauri-exported']),
  duration: 10,
  width: 1920,
  height: 1080,
  fileSize: 2000,
});

const mockTauriConcatenateVideos = jest.fn().mockResolvedValue({
  outputPath: 'tauri://concat.mp4',
  outputBlob: new Blob(['tauri-concat']),
  duration: 20,
  width: 1920,
  height: 1080,
  fileSize: 3000,
});

jest.mock('@/core/services/video/video-compositor-tauri', () => ({
  tauriComposeVideo: (...args: unknown[]) => mockTauriCompose(...args),
  tauriAddSubtitles: (...args: unknown[]) => mockTauriAddSubtitles(...args),
  tauriAddBackgroundMusic: (...args: unknown[]) => mockTauriAddBackgroundMusic(...args),
  tauriExportVideo: (...args: unknown[]) => mockTauriExportVideo(...args),
  tauriConcatenateVideos: (...args: unknown[]) => mockTauriConcatenateVideos(...args),
}));

// Mock ffmpeg 子模块
const mockFfmpegCompose = jest.fn().mockResolvedValue({
  outputPath: 'ffmpeg://output.mp4',
  outputBlob: new Blob(['ffmpeg-mp4']),
  duration: 0,
  width: 1920,
  height: 1080,
  fileSize: 800,
});

const mockFfmpegAddSubtitles = jest.fn().mockResolvedValue({
  outputPath: 'ffmpeg://subbed.mp4',
  outputBlob: new Blob(['ffmpeg-subbed']),
  duration: 0,
  width: 1920,
  height: 1080,
  fileSize: 900,
});

const mockFfmpegAddBackgroundMusic = jest.fn().mockResolvedValue({
  outputPath: 'ffmpeg://music.mp4',
  outputBlob: new Blob(['ffmpeg-music']),
  duration: 0,
  width: 1920,
  height: 1080,
  fileSize: 1100,
});

const mockFfmpegExportVideo = jest.fn().mockResolvedValue({
  outputPath: 'ffmpeg://exported.mp4',
  outputBlob: new Blob(['ffmpeg-exported']),
  duration: 0,
  width: 1920,
  height: 1080,
  fileSize: 1800,
});

const mockFfmpegConcatenateVideos = jest.fn().mockResolvedValue({
  outputPath: 'ffmpeg://concat.mp4',
  outputBlob: new Blob(['ffmpeg-concat']),
  duration: 0,
  width: 1920,
  height: 1080,
  fileSize: 2500,
});

jest.mock('@/core/services/video/video-compositor-ffmpeg', () => ({
  ffmpegComposeVideo: (...args: unknown[]) => mockFfmpegCompose(...args),
  ffmpegAddSubtitles: (...args: unknown[]) => mockFfmpegAddSubtitles(...args),
  ffmpegAddBackgroundMusic: (...args: unknown[]) => mockFfmpegAddBackgroundMusic(...args),
  ffmpegExportVideo: (...args: unknown[]) => mockFfmpegExportVideo(...args),
  ffmpegConcatenateVideos: (...args: unknown[]) => mockFfmpegConcatenateVideos(...args),
}));

describe('video-compositor-service', () => {
  // 测试用数据
  const scenes = [
    { id: 's1', mediaPath: '/img/1.jpg', mediaType: 'image' as const, startTime: 0, duration: 5 },
    { id: 's2', mediaPath: '/img/2.jpg', mediaType: 'image' as const, startTime: 5, duration: 5 },
  ];

  const options = { format: 'mp4' as const, fps: 30, resolution: { width: 1920, height: 1080 } };

  const defaultResult = {
    outputPath: '',
    outputBlob: null,
    duration: 0,
    width: 1920,
    height: 1080,
    fileSize: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // 默认：既不是 Tauri 也没有 FFmpeg.wasm
    mockIsTauri.mockReturnValue(false);
    mockIsFFmpegWasmAvailable.mockReturnValue(false);

    // 重置 mock 实现（mockRejectedValue/mockResolvedValue 需要显式恢复）
    mockTauriCompose.mockResolvedValue({
      outputPath: 'tauri://output.mp4',
      outputBlob: new Blob(['tauri-mp4']),
      duration: 10,
      width: 1920,
      height: 1080,
      fileSize: 1000,
    });
    mockTauriAddSubtitles.mockResolvedValue({
      outputPath: 'tauri://subbed.mp4',
      outputBlob: new Blob(['tauri-subbed']),
      duration: 10,
      width: 1920,
      height: 1080,
      fileSize: 1200,
    });
    mockTauriAddBackgroundMusic.mockResolvedValue({
      outputPath: 'tauri://with-music.mp4',
      outputBlob: new Blob(['tauri-music']),
      duration: 10,
      width: 1920,
      height: 1080,
      fileSize: 1500,
    });
    mockTauriExportVideo.mockResolvedValue({
      outputPath: 'tauri://exported.mp4',
      outputBlob: new Blob(['tauri-exported']),
      duration: 10,
      width: 1920,
      height: 1080,
      fileSize: 2000,
    });
    mockTauriConcatenateVideos.mockResolvedValue({
      outputPath: 'tauri://concat.mp4',
      outputBlob: new Blob(['tauri-concat']),
      duration: 20,
      width: 1920,
      height: 1080,
      fileSize: 3000,
    });
    mockFfmpegCompose.mockResolvedValue({
      outputPath: 'ffmpeg://output.mp4',
      outputBlob: new Blob(['ffmpeg-mp4']),
      duration: 0,
      width: 1920,
      height: 1080,
      fileSize: 800,
    });
    mockFfmpegAddSubtitles.mockResolvedValue({
      outputPath: 'ffmpeg://subbed.mp4',
      outputBlob: new Blob(['ffmpeg-subbed']),
      duration: 0,
      width: 1920,
      height: 1080,
      fileSize: 900,
    });
    mockFfmpegAddBackgroundMusic.mockResolvedValue({
      outputPath: 'ffmpeg://music.mp4',
      outputBlob: new Blob(['ffmpeg-music']),
      duration: 0,
      width: 1920,
      height: 1080,
      fileSize: 1100,
    });
    mockFfmpegExportVideo.mockResolvedValue({
      outputPath: 'ffmpeg://exported.mp4',
      outputBlob: new Blob(['ffmpeg-exported']),
      duration: 0,
      width: 1920,
      height: 1080,
      fileSize: 1800,
    });
    mockFfmpegConcatenateVideos.mockResolvedValue({
      outputPath: 'ffmpeg://concat.mp4',
      outputBlob: new Blob(['ffmpeg-concat']),
      duration: 0,
      width: 1920,
      height: 1080,
      fileSize: 2500,
    });
  });

  describe('composeVideo', () => {
    it('Tauri 环境下应调用 tauriComposeVideo', async () => {
      mockIsTauri.mockReturnValue(true);
      const { composeVideo } = await import('@/core/services/video/video-compositor-service');

      const result = await composeVideo(scenes, options);

      expect(mockTauriCompose).toHaveBeenCalledTimes(1);
      expect(mockFfmpegCompose).not.toHaveBeenCalled();
      expect(result.outputPath).toBe('tauri://output.mp4');
    });

    it('FFmpeg.wasm 环境下应调用 ffmpegComposeVideo', async () => {
      mockIsFFmpegWasmAvailable.mockReturnValue(true);
      const { composeVideo } = await import('@/core/services/video/video-compositor-service');

      const result = await composeVideo(scenes, options);

      expect(mockFfmpegCompose).toHaveBeenCalledTimes(1);
      expect(mockTauriCompose).not.toHaveBeenCalled();
      expect(result.outputPath).toBe('ffmpeg://output.mp4');
    });

    it('无可用环境时应抛出错误', async () => {
      const { composeVideo } = await import('@/core/services/video/video-compositor-service');

      await expect(composeVideo(scenes, options)).rejects.toThrow(
        '视频合成需要 Tauri 环境或支持 SharedArrayBuffer 的浏览器'
      );
      expect(mockTauriCompose).not.toHaveBeenCalled();
      expect(mockFfmpegCompose).not.toHaveBeenCalled();
    });

    it('Tauri 优先级高于 FFmpeg.wasm（二者都为 true 时走 Tauri）', async () => {
      mockIsTauri.mockReturnValue(true);
      mockIsFFmpegWasmAvailable.mockReturnValue(true);
      const { composeVideo } = await import('@/core/services/video/video-compositor-service');

      await composeVideo(scenes, options);

      expect(mockTauriCompose).toHaveBeenCalledTimes(1);
      expect(mockFfmpegCompose).not.toHaveBeenCalled();
    });

    it('Tauri 分支失败时应抛出错误', async () => {
      mockIsTauri.mockReturnValue(true);
      mockTauriCompose.mockRejectedValue(new Error('Tauri invoke failed'));
      const { composeVideo } = await import('@/core/services/video/video-compositor-service');

      await expect(composeVideo(scenes, options)).rejects.toThrow('Tauri invoke failed');
    });

    it('FFmpeg.wasm 分支失败时应抛出错误', async () => {
      mockIsFFmpegWasmAvailable.mockReturnValue(true);
      mockFfmpegCompose.mockRejectedValue(new Error('WASM execution error'));
      const { composeVideo } = await import('@/core/services/video/video-compositor-service');

      await expect(composeVideo(scenes, options)).rejects.toThrow('WASM execution error');
    });
  });

  describe('addSubtitles', () => {
    const videoBlob = new Blob(['video-data']);
    const subtitles = { tracks: [] } as any;
    const style = {} as any;

    it('Tauri 环境下应调用 tauriAddSubtitles', async () => {
      mockIsTauri.mockReturnValue(true);
      const { addSubtitles } = await import('@/core/services/video/video-compositor-service');

      const result = await addSubtitles(videoBlob, subtitles, style, 'mp4');

      expect(mockTauriAddSubtitles).toHaveBeenCalledTimes(1);
      expect(result.outputPath).toBe('tauri://subbed.mp4');
    });

    it('FFmpeg.wasm 环境下应调用 ffmpegAddSubtitles', async () => {
      mockIsFFmpegWasmAvailable.mockReturnValue(true);
      const { addSubtitles } = await import('@/core/services/video/video-compositor-service');

      const result = await addSubtitles(videoBlob, subtitles, style, 'webm');

      expect(mockFfmpegAddSubtitles).toHaveBeenCalledTimes(1);
      expect(result.outputPath).toBe('ffmpeg://subbed.mp4');
    });

    it('无可用环境时应抛出错误', async () => {
      const { addSubtitles } = await import('@/core/services/video/video-compositor-service');

      await expect(addSubtitles(videoBlob, subtitles)).rejects.toThrow(
        '添加字幕需要 Tauri 环境或支持 SharedArrayBuffer 的浏览器'
      );
    });
  });

  describe('addBackgroundMusic', () => {
    const videoBlob = new Blob(['video-data']);
    const music = { filePath: '/music/bgm.mp3', volume: 0.8 } as any;

    it('Tauri 环境下应调用 tauriAddBackgroundMusic', async () => {
      mockIsTauri.mockReturnValue(true);
      const { addBackgroundMusic } = await import('@/core/services/video/video-compositor-service');

      const result = await addBackgroundMusic(videoBlob, music);

      expect(mockTauriAddBackgroundMusic).toHaveBeenCalledTimes(1);
      expect(result.outputPath).toBe('tauri://with-music.mp4');
    });

    it('FFmpeg.wasm 环境下应调用 ffmpegAddBackgroundMusic', async () => {
      mockIsFFmpegWasmAvailable.mockReturnValue(true);
      const { addBackgroundMusic } = await import('@/core/services/video/video-compositor-service');

      const result = await addBackgroundMusic(videoBlob, music, 'webm');

      expect(mockFfmpegAddBackgroundMusic).toHaveBeenCalledTimes(1);
      expect(result.outputPath).toBe('ffmpeg://music.mp4');
    });

    it('无可用环境时应抛出错误', async () => {
      const { addBackgroundMusic } = await import('@/core/services/video/video-compositor-service');

      await expect(addBackgroundMusic(videoBlob, music)).rejects.toThrow(
        '添加背景音乐需要 Tauri 环境或支持 SharedArrayBuffer 的浏览器'
      );
    });
  });

  describe('exportVideo', () => {
    const inputBlob = new Blob(['input-data']);
    const exportOptions = { bitrate: '5Mbps', fps: 30 };

    it('Tauri 环境下应调用 tauriExportVideo', async () => {
      mockIsTauri.mockReturnValue(true);
      const { exportVideo } = await import('@/core/services/video/video-compositor-service');

      const result = await exportVideo(inputBlob, 'mp4', exportOptions);

      expect(mockTauriExportVideo).toHaveBeenCalledTimes(1);
      expect(result.outputPath).toBe('tauri://exported.mp4');
    });

    it('FFmpeg.wasm 环境下应调用 ffmpegExportVideo', async () => {
      mockIsFFmpegWasmAvailable.mockReturnValue(true);
      const { exportVideo } = await import('@/core/services/video/video-compositor-service');

      const result = await exportVideo(inputBlob, 'webm', exportOptions);

      expect(mockFfmpegExportVideo).toHaveBeenCalledTimes(1);
      expect(result.outputPath).toBe('ffmpeg://exported.mp4');
    });

    it('无可用环境时应抛出错误', async () => {
      const { exportVideo } = await import('@/core/services/video/video-compositor-service');

      await expect(exportVideo(inputBlob, 'mp4')).rejects.toThrow(
        '导出视频需要 Tauri 环境或支持 SharedArrayBuffer 的浏览器'
      );
    });
  });

  describe('concatenateVideos', () => {
    const blobs = [new Blob(['part1']), new Blob(['part2'])];

    it('Tauri 环境下应调用 tauriConcatenateVideos', async () => {
      mockIsTauri.mockReturnValue(true);
      const { concatenateVideos } = await import('@/core/services/video/video-compositor-service');

      const result = await concatenateVideos(blobs, 'mp4');

      expect(mockTauriConcatenateVideos).toHaveBeenCalledTimes(1);
      expect(result.outputPath).toBe('tauri://concat.mp4');
    });

    it('FFmpeg.wasm 环境下应调用 ffmpegConcatenateVideos', async () => {
      mockIsFFmpegWasmAvailable.mockReturnValue(true);
      const { concatenateVideos } = await import('@/core/services/video/video-compositor-service');

      const result = await concatenateVideos(blobs, 'webm');

      expect(mockFfmpegConcatenateVideos).toHaveBeenCalledTimes(1);
      expect(result.outputPath).toBe('ffmpeg://concat.mp4');
    });

    it('无可用环境时应抛出错误', async () => {
      const { concatenateVideos } = await import('@/core/services/video/video-compositor-service');

      await expect(concatenateVideos(blobs, 'mp4')).rejects.toThrow(
        '合并视频需要 Tauri 环境或支持 SharedArrayBuffer 的浏览器'
      );
    });
  });

  describe('initializeVideoCompositor', () => {
    it('Tauri 环境下直接返回 true', async () => {
      mockIsTauri.mockReturnValue(true);
      const { initializeVideoCompositor } =
        await import('@/core/services/video/video-compositor-service');

      const result = await initializeVideoCompositor();

      expect(result).toBe(true);
    });

    it('无 FFmpeg.wasm 环境时应返回 false', async () => {
      mockIsTauri.mockReturnValue(false);
      mockIsFFmpegWasmAvailable.mockReturnValue(false);
      const { initializeVideoCompositor } =
        await import('@/core/services/video/video-compositor-service');

      const result = await initializeVideoCompositor();

      expect(result).toBe(false);
    });
  });

  describe('videoCompositorService 单例对象', () => {
    it('应包含所有公开方法', async () => {
      const { videoCompositorService } =
        await import('@/core/services/video/video-compositor-service');

      expect(typeof videoCompositorService.compose).toBe('function');
      expect(typeof videoCompositorService.addSubtitles).toBe('function');
      expect(typeof videoCompositorService.addBackgroundMusic).toBe('function');
      expect(typeof videoCompositorService.export).toBe('function');
      expect(typeof videoCompositorService.concatenate).toBe('function');
      expect(typeof videoCompositorService.getProgress).toBe('function');
      expect(typeof videoCompositorService.cancelExport).toBe('function');
      expect(typeof videoCompositorService.extractFrames).toBe('function');
      expect(typeof videoCompositorService.getVideoInfo).toBe('function');
      expect(typeof videoCompositorService.download).toBe('function');
      expect(typeof videoCompositorService.initialize).toBe('function');
    });

    it('compose 方法应与 composeVideo 函数行为一致', async () => {
      mockIsTauri.mockReturnValue(true);
      const { videoCompositorService } =
        await import('@/core/services/video/video-compositor-service');

      const result = await videoCompositorService.compose(scenes, options);

      expect(mockTauriCompose).toHaveBeenCalledTimes(1);
      expect(result.outputPath).toBe('tauri://output.mp4');
    });
  });
});
