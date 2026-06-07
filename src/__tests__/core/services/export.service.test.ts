/**
 * Export Service Tests
 */

import { exportService, ExportService, FORMAT_MIME_TYPES, EXPORT_PRESETS, FORMAT_INFO } from '@/core/services/project/export.service';

// Mock Tauri invoke
jest.mock('@tauri-apps/api/core', () => ({
  invoke: jest.fn(),
}));

// Mock logger
jest.mock('@/core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { invoke } from '@tauri-apps/api/core';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ExportService();
  });

  describe('constructor', () => {
    it('should initialize with null config', () => {
      expect(service.getConfig()).toBeNull();
    });
  });

  describe('setConfig', () => {
    it('should set the export configuration', () => {
      service.setConfig({
        format: 'mp4',
        quality: 'high',
        resolution: '1080p',
      });

      const config = service.getConfig();
      expect(config).not.toBeNull();
      expect(config!.format).toBe('mp4');
      expect(config!.quality).toBe('high');
      expect(config!.resolution).toBe('1080p');
    });

    it('should apply preset defaults for quality', () => {
      service.setConfig({ quality: 'low' });

      const config = service.getConfig();
      expect(config).not.toBeNull();
      expect(config!.quality).toBe('low');
      expect(config!.frameRate).toBeDefined();
    });
  });

  describe('_buildConfig (via setConfig and exportVideo)', () => {
    it('should merge overrides with instance config', () => {
      service.setConfig({ format: 'webm', quality: 'medium' });

      // exportVideo calls _buildConfig internally with overrides
      const config = (service as any)._buildConfig({ quality: 'high' }, true);

      expect(config.format).toBe('webm');
      expect(config.quality).toBe('high');
    });

    it('should use preset defaults when no config exists', () => {
      const config = (service as any)._buildConfig({ quality: 'low' }, false);

      expect(config.quality).toBe('low');
      expect(config.frameRate).toBeDefined();
      expect(config.resolution).toBeDefined();
    });

    it('should handle partial config overrides', () => {
      service.setConfig({ format: 'mp4', resolution: '720p' });

      const config = (service as any)._buildConfig({ frameRate: 60 }, true);

      expect(config.format).toBe('mp4');
      expect(config.resolution).toBe('720p');
      expect(config.frameRate).toBe(60);
    });
  });

  describe('getConfig', () => {
    it('should return null when no config is set', () => {
      expect(service.getConfig()).toBeNull();
    });

    it('should return the current config', () => {
      service.setConfig({ format: 'mkv' });
      expect(service.getConfig()!.format).toBe('mkv');
    });
  });

  describe('exportVideo', () => {
    it('should call invoke with correct parameters', async () => {
      (invoke as jest.Mock).mockResolvedValue({
        outputPath: '/output/video.mp4',
        duration: 120,
        fileSize: 1024000,
      });

      service.setConfig({ format: 'mp4' });

      const result = await service.exportVideo(
        '/input/video.mp4',
        '/output/video.mp4',
        {}
      );

      expect(invoke).toHaveBeenCalledWith('export_video', expect.objectContaining({
        inputPath: '/input/video.mp4',
        outputPath: '/output/video.mp4',
        format: 'mp4',
      }));

      expect(result).toEqual({
        outputPath: '/output/video.mp4',
        duration: 120,
        fileSize: 1024000,
        format: 'mp4',
      });
    });

    it('should apply config overrides', async () => {
      (invoke as jest.Mock).mockResolvedValue({
        outputPath: '/output/video.webm',
        duration: 60,
        fileSize: 512000,
      });

      const result = await service.exportVideo(
        '/input/video.mp4',
        '/output/video.webm',
        { format: 'webm', resolution: '1080p', frameRate: 30 }
      );

      expect(invoke).toHaveBeenCalledWith('export_video', expect.objectContaining({
        format: 'webm',
        resolution: '1080p',
        frameRate: 30,
      }));

      expect(result.format).toBe('webm');
    });

    it('should propagate errors from invoke', async () => {
      (invoke as jest.Mock).mockRejectedValue(new Error('Export failed'));

      await expect(
        service.exportVideo('/input/video.mp4', '/output/video.mp4', {})
      ).rejects.toThrow('Export failed');
    });

    it('should clear currentExportId after completion', async () => {
      (invoke as jest.Mock).mockResolvedValue({
        outputPath: '/output/video.mp4',
        duration: 120,
        fileSize: 1024000,
      });

      await service.exportVideo('/input/video.mp4', '/output/video.mp4', {});

      // After completion, currentExportId should be cleared
      expect((service as any).currentExportId).toBeNull();
    });

    it('should call onProgress callback during export', async () => {
      (invoke as jest.Mock).mockResolvedValue({
        outputPath: '/output/video.mp4',
        duration: 120,
        fileSize: 1024000,
      });

      const onProgress = jest.fn();
      await service.exportVideo('/input/video.mp4', '/output/video.mp4', {}, onProgress);

      expect(onProgress).toHaveBeenCalled();
    });
  });

  describe('cancelExport', () => {
    it('should call invoke with cancel_export when there is an active export', async () => {
      (invoke as jest.Mock).mockResolvedValue(undefined);

      // Simulate an ongoing export by directly setting currentExportId
      (service as any).currentExportId = 'test-export-id';

      await service.cancelExport();

      expect(invoke).toHaveBeenCalledWith('cancel_export', { exportId: 'test-export-id' });
      expect((service as any).currentExportId).toBeNull();
    });

    it('should not call invoke when there is no active export', async () => {
      (invoke as jest.Mock).mockResolvedValue(undefined);

      await service.cancelExport();

      expect(invoke).not.toHaveBeenCalledWith('cancel_export', expect.anything());
    });

    it('should handle cancel errors gracefully', async () => {
      (invoke as jest.Mock)
        .mockResolvedValueOnce(undefined) // for cancel_export
        .mockRejectedValueOnce(new Error('Cancel failed'));

      (service as any).currentExportId = 'test-export-id';

      await service.cancelExport();

      // Should not throw, just warn
      expect((service as any).currentExportId).toBeNull();
    });
  });

  describe('getExportPresets', () => {
    it('should return EXPORT_PRESETS', () => {
      const presets = service.getExportPresets();

      expect(presets).toBe(EXPORT_PRESETS);
      expect(presets).toHaveProperty('low');
      expect(presets).toHaveProperty('medium');
      expect(presets).toHaveProperty('high');
    });
  });

  describe('getFormatInfo', () => {
    it('should return format info for valid format', () => {
      const info = service.getFormatInfo('mp4');

      expect(info).toBeDefined();
      expect(info).toEqual(FORMAT_INFO['mp4']);
    });

    it('should return undefined for invalid format', () => {
      const info = service.getFormatInfo('invalid' as any);

      expect(info).toBeUndefined();
    });
  });
});

describe('FORMAT_MIME_TYPES', () => {
  it('should have correct MIME types for all formats', () => {
    expect(FORMAT_MIME_TYPES.mp4).toBe('video/mp4');
    expect(FORMAT_MIME_TYPES.webm).toBe('video/webm');
    expect(FORMAT_MIME_TYPES.mov).toBe('video/quicktime');
    expect(FORMAT_MIME_TYPES.mkv).toBe('video/x-matroska');
  });
});

describe('exportService singleton', () => {
  it('should be an instance of ExportService', () => {
    expect(exportService).toBeInstanceOf(ExportService);
  });
});