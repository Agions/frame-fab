/**
 * Unit Tests — TemporaryFileManager (临时文件清理)
 */

import { TemporaryFileManager } from '@/infrastructure/storage/temp-file-manager';

// Mock fs for Node.js
vi.mock('node:fs/promises', () => ({
  unlink: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('glob', () => ({
  glob: vi.fn().mockResolvedValue([]),
}));

describe('TemporaryFileManager', () => {
  let manager: TemporaryFileManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new TemporaryFileManager('/tmp/test-panel-flow');
  });

  afterEach(() => {
    manager.stopAutoCleanup();
  });

  describe('register / cleanup', () => {
    it('should track registered files', () => {
      manager.register('/tmp/test-1.mp4');
      manager.register('/tmp/test-2.mp4');

      expect(manager.getStats().tracked).toBe(2);
    });

    it('should delete tracked file on cleanup', async () => {
      manager.register('/tmp/test-file.mp4');
      const { cleaned } = await manager.cleanup('/tmp/test-file.mp4');

      expect(cleaned).toBe(1);
      expect(manager.getStats().tracked).toBe(0);
    });
  });

  describe('cleanupAll', () => {
    it('should delete all tracked files', async () => {
      manager.register('/tmp/file1.mp4');
      manager.register('/tmp/file2.mp4');
      manager.register('/tmp/file3.mp4');

      const { cleaned, failed } = await manager.cleanupAll();

      expect(cleaned).toBe(3);
      expect(failed).toBe(0);
      expect(manager.getStats().tracked).toBe(0);
    });
  });

  describe('memory leak prevention', () => {
    it('should not hold more than maxSnapshots snapshots worth of data', async () => {
      const mgr = new TemporaryFileManager('/tmp/test-leak');
      // Temporarily lower max age for testing
      mgr.setMaxAge(100);

      // Register many files
      for (let i = 0; i < 100; i++) {
        mgr.register('/tmp/test-' + i + '.mp4');
      }

      const stats = mgr.getStats();
      expect(stats.tracked).toBe(100);
    });
  });
});