/**
 * useEditor Hook 测试
 */

import { renderHook, act } from '@testing-library/react';

import { useEditor, TimelineClip } from '@/core/hooks/useEditor';

// Mock toast
jest.mock('@/shared/components/ui', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

describe('useEditor Hook', () => {
  describe('初始状态', () => {
    it('应该返回正确的初始状态', () => {
      const { result } = renderHook(() => useEditor());

      expect(result.current.state.projectId).toBeNull();
      expect(result.current.state.projectName).toBe('未命名项目');
      expect(result.current.state.currentTime).toBe(0);
      expect(result.current.state.duration).toBe(0);
      expect(result.current.state.zoom).toBe(1);
      expect(result.current.state.isPlaying).toBe(false);
      expect(result.current.state.playbackRate).toBe(1);
      expect(result.current.state.selectedClipId).toBeNull();
      expect(result.current.state.clips).toEqual([]);
      expect(result.current.state.history).toEqual([[]]);
      expect(result.current.state.historyIndex).toBe(0);
    });

    it('应该包含所有必要的操作方法', () => {
      const { result } = renderHook(() => useEditor());

      expect(result.current.operations).toHaveProperty('seek');
      expect(result.current.operations).toHaveProperty('setZoom');
      expect(result.current.operations).toHaveProperty('play');
      expect(result.current.operations).toHaveProperty('pause');
      expect(result.current.operations).toHaveProperty('togglePlay');
      expect(result.current.operations).toHaveProperty('setPlaybackRate');
      expect(result.current.operations).toHaveProperty('addClip');
      expect(result.current.operations).toHaveProperty('removeClip');
      expect(result.current.operations).toHaveProperty('updateClip');
      expect(result.current.operations).toHaveProperty('splitClip');
      expect(result.current.operations).toHaveProperty('selectClip');
      expect(result.current.operations).toHaveProperty('undo');
      expect(result.current.operations).toHaveProperty('redo');
      expect(result.current.operations).toHaveProperty('saveHistory');
      expect(result.current.operations).toHaveProperty('loadProject');
      expect(result.current.operations).toHaveProperty('exportProject');
    });
  });

  describe('时间轴操作', () => {
    it('seek 应该正确设置当前时间', () => {
      const { result } = renderHook(() => useEditor());

      act(() => {
        result.current.operations.loadProject('p1', 'Test', [
          { id: 'clip1', name: 'Clip 1', startTime: 0, endTime: 50, duration: 50, type: 'video' as const },
        ]);
      });

      act(() => {
        result.current.operations.seek(10);
      });

      expect(result.current.state.currentTime).toBe(10);
    });

    it('seek 应该限制时间在有效范围内', () => {
      const { result } = renderHook(() => useEditor());

      act(() => {
        result.current.operations.seek(-5);
      });
      expect(result.current.state.currentTime).toBe(0);

      act(() => {
        result.current.operations.seek(100);
      });
      expect(result.current.state.currentTime).toBe(0);
    });

    it('seek 应该在设置 duration 后限制在 duration 范围内', () => {
      const { result } = renderHook(() => useEditor());

      act(() => {
        result.current.operations.loadProject('p1', 'Test', [
          { id: 'clip1', name: 'Clip 1', startTime: 0, endTime: 50, duration: 50, type: 'video' as const },
        ]);
      });

      act(() => {
        result.current.operations.seek(100);
      });

      expect(result.current.state.currentTime).toBe(50);
    });

    it('setZoom 应该正确设置缩放级别', () => {
      const { result } = renderHook(() => useEditor());

      act(() => {
        result.current.operations.setZoom(5);
      });

      expect(result.current.state.zoom).toBe(5);
    });

    it('setZoom 应该限制在有效范围内 (0.1 - 10)', () => {
      const { result } = renderHook(() => useEditor());

      act(() => {
        result.current.operations.setZoom(0.01);
      });
      expect(result.current.state.zoom).toBe(0.1);

      act(() => {
        result.current.operations.setZoom(15);
      });
      expect(result.current.state.zoom).toBe(10);
    });
  });

  describe('播放控制', () => {
    it('play 应该设置 isPlaying 为 true', () => {
      const { result } = renderHook(() => useEditor());

      act(() => {
        result.current.operations.play();
      });

      expect(result.current.state.isPlaying).toBe(true);
    });

    it('pause 应该设置 isPlaying 为 false', () => {
      const { result } = renderHook(() => useEditor());

      act(() => {
        result.current.operations.play();
      });

      act(() => {
        result.current.operations.pause();
      });

      expect(result.current.state.isPlaying).toBe(false);
    });

    it('togglePlay 应该切换播放状态', () => {
      const { result } = renderHook(() => useEditor());

      expect(result.current.state.isPlaying).toBe(false);

      act(() => {
        result.current.operations.togglePlay();
      });
      expect(result.current.state.isPlaying).toBe(true);

      act(() => {
        result.current.operations.togglePlay();
      });
      expect(result.current.state.isPlaying).toBe(false);
    });

    it('setPlaybackRate 应该正确设置播放速率', () => {
      const { result } = renderHook(() => useEditor());

      act(() => {
        result.current.operations.setPlaybackRate(2);
      });

      expect(result.current.state.playbackRate).toBe(2);
    });
  });

  describe('剪辑操作', () => {
    const createMockClip = (overrides: Partial<TimelineClip> = {}): TimelineClip => ({
      id: 'clip-' + Math.random().toString(36).substr(2, 9),
      name: 'Test Clip',
      startTime: 0,
      endTime: 10,
      duration: 10,
      type: 'video',
      ...overrides,
    });

    it('addClip 应该添加剪辑到时间轴', () => {
      const { result } = renderHook(() => useEditor());
      const clip = createMockClip({ id: 'clip1', startTime: 0, endTime: 10, duration: 10 });

      act(() => {
        result.current.operations.addClip(clip);
      });

      expect(result.current.state.clips).toHaveLength(1);
      expect(result.current.state.clips[0].id).toBe('clip1');
      expect(result.current.state.duration).toBe(10);
    });

    it('addClip 应该更新 duration 为最大 endTime', () => {
      const { result } = renderHook(() => useEditor());
      const clip1 = createMockClip({ id: 'clip1', startTime: 0, endTime: 10, duration: 10 });
      const clip2 = createMockClip({ id: 'clip2', startTime: 5, endTime: 20, duration: 15 });

      act(() => {
        result.current.operations.addClip(clip1);
      });
      expect(result.current.state.duration).toBe(10);

      act(() => {
        result.current.operations.addClip(clip2);
      });
      expect(result.current.state.duration).toBe(20);
    });

    it('addClip 应该保存历史记录', () => {
      const { result } = renderHook(() => useEditor());
      const clip = createMockClip({ id: 'clip1' });

      act(() => {
        result.current.operations.addClip(clip);
      });

      expect(result.current.state.history).toHaveLength(2);
      expect(result.current.state.historyIndex).toBe(1);
    });

    it('removeClip 应该从时间轴移除剪辑', () => {
      const { result } = renderHook(() => useEditor());
      const clip = createMockClip({ id: 'clip1' });

      act(() => {
        result.current.operations.addClip(clip);
      });

      act(() => {
        result.current.operations.removeClip('clip1');
      });

      expect(result.current.state.clips).toHaveLength(0);
    });

    it('removeClip 应该清除选中状态如果删除的是选中的剪辑', () => {
      const { result } = renderHook(() => useEditor());
      const clip = createMockClip({ id: 'clip1' });

      act(() => {
        result.current.operations.addClip(clip);
        result.current.operations.selectClip('clip1');
      });

      act(() => {
        result.current.operations.removeClip('clip1');
      });

      expect(result.current.state.selectedClipId).toBeNull();
    });

    it('removeClip 不应该影响其他剪辑的选中状态', () => {
      const { result } = renderHook(() => useEditor());
      const clip1 = createMockClip({ id: 'clip1' });
      const clip2 = createMockClip({ id: 'clip2' });

      act(() => {
        result.current.operations.addClip(clip1);
        result.current.operations.addClip(clip2);
        result.current.operations.selectClip('clip1');
      });

      act(() => {
        result.current.operations.removeClip('clip2');
      });

      expect(result.current.state.selectedClipId).toBe('clip1');
    });

    it('updateClip 应该更新剪辑属性', () => {
      const { result } = renderHook(() => useEditor());
      const clip = createMockClip({ id: 'clip1', name: 'Original Name' });

      act(() => {
        result.current.operations.addClip(clip);
      });

      act(() => {
        result.current.operations.updateClip('clip1', { name: 'Updated Name', speed: 2 });
      });

      expect(result.current.state.clips[0].name).toBe('Updated Name');
      expect(result.current.state.clips[0].speed).toBe(2);
    });

    it('updateClip 应该保存历史记录', () => {
      const { result } = renderHook(() => useEditor());
      const clip = createMockClip({ id: 'clip1' });

      act(() => {
        result.current.operations.addClip(clip);
        result.current.operations.updateClip('clip1', { name: 'Updated' });
      });

      expect(result.current.state.historyIndex).toBe(2);
    });

    it('splitClip 应该在指定时间点分割剪辑', () => {
      const { result } = renderHook(() => useEditor());
      const clip = createMockClip({ id: 'clip1', startTime: 0, endTime: 20, duration: 20 });

      act(() => {
        result.current.operations.addClip(clip);
      });

      act(() => {
        result.current.operations.splitClip('clip1', 10);
      });

      expect(result.current.state.clips).toHaveLength(2);

      const updatedClip = result.current.state.clips.find(c => c.id === 'clip1');
      const newClip = result.current.state.clips.find(c => c.id !== 'clip1');

      expect(updatedClip?.endTime).toBe(10);
      expect(updatedClip?.duration).toBe(10);
      expect(newClip?.startTime).toBe(10);
      expect(newClip?.endTime).toBe(20);
      expect(newClip?.duration).toBe(10);
    });

    it('splitClip 应该拒绝无效的分割时间', () => {
      const { result } = renderHook(() => useEditor());
      const clip = createMockClip({ id: 'clip1', startTime: 0, endTime: 20, duration: 20 });

      act(() => {
        result.current.operations.addClip(clip);
      });

      act(() => {
        result.current.operations.splitClip('clip1', 0);
      });
      expect(result.current.state.clips).toHaveLength(1);

      act(() => {
        result.current.operations.splitClip('clip1', 25);
      });
      expect(result.current.state.clips).toHaveLength(1);

      act(() => {
        result.current.operations.splitClip('clip1', -1);
      });
      expect(result.current.state.clips).toHaveLength(1);
    });

    it('splitClip 应该拒绝不存在的剪辑', () => {
      const { result } = renderHook(() => useEditor());

      act(() => {
        result.current.operations.splitClip('nonexistent', 10);
      });

      expect(result.current.state.clips).toHaveLength(0);
    });

    it('splitClip 应该保存历史记录', () => {
      const { result } = renderHook(() => useEditor());
      const clip = createMockClip({ id: 'clip1', startTime: 0, endTime: 20, duration: 20 });

      act(() => {
        result.current.operations.addClip(clip);
      });

      act(() => {
        result.current.operations.splitClip('clip1', 10);
      });

      expect(result.current.state.historyIndex).toBe(2);
    });
  });

  describe('选中操作', () => {
    it('selectClip 应该设置选中的剪辑ID', () => {
      const { result } = renderHook(() => useEditor());

      act(() => {
        result.current.operations.selectClip('clip1');
      });

      expect(result.current.state.selectedClipId).toBe('clip1');
    });

    it('selectClip 应该允许取消选中 (传 null)', () => {
      const { result } = renderHook(() => useEditor());

      act(() => {
        result.current.operations.selectClip('clip1');
      });

      act(() => {
        result.current.operations.selectClip(null);
      });

      expect(result.current.state.selectedClipId).toBeNull();
    });
  });

  describe('历史操作', () => {
    it('saveHistory 应该保存当前状态到历史记录', () => {
      const { result } = renderHook(() => useEditor());

      act(() => {
        result.current.operations.saveHistory();
      });

      expect(result.current.state.history).toHaveLength(2);
      expect(result.current.state.historyIndex).toBe(1);
    });

    it('saveHistory 应该限制历史记录长度为 50', () => {
      const { result } = renderHook(() => useEditor());
      const clip = { id: 'clip', name: 'Clip', startTime: 0, endTime: 10, duration: 10, type: 'video' as const };

      for (let i = 0; i < 60; i++) {
        act(() => {
          result.current.operations.addClip({ ...clip, id: `clip-${i}` });
        });
      }

      expect(result.current.state.history.length).toBeLessThanOrEqual(50);
    });

    it('undo 应该恢复到上一个状态', () => {
      const { result } = renderHook(() => useEditor());
      const clip1 = { id: 'clip1', name: 'Clip 1', startTime: 0, endTime: 10, duration: 10, type: 'video' as const };
      const clip2 = { id: 'clip2', name: 'Clip 2', startTime: 10, endTime: 20, duration: 10, type: 'video' as const };

      act(() => {
        result.current.operations.addClip(clip1);
      });
      act(() => {
        result.current.operations.addClip(clip2);
      });

      expect(result.current.state.clips).toHaveLength(2);

      act(() => {
        result.current.operations.undo();
      });

      expect(result.current.state.clips).toHaveLength(1);
      expect(result.current.state.clips[0].id).toBe('clip1');
    });

    it('undo 在历史记录开头时不应该改变状态', () => {
      const { result } = renderHook(() => useEditor());
      const clip = { id: 'clip1', name: 'Clip 1', startTime: 0, endTime: 10, duration: 10, type: 'video' as const };

      act(() => {
        result.current.operations.addClip(clip);
      });
      expect(result.current.state.historyIndex).toBe(1);
      expect(result.current.state.clips).toHaveLength(1);

      act(() => {
        result.current.operations.undo();
      });
      // First undo restores to initial empty state
      expect(result.current.state.historyIndex).toBe(0);
      expect(result.current.state.clips).toHaveLength(0);

      // Second undo should not change anything since we're at index 0
      act(() => {
        result.current.operations.undo();
      });

      expect(result.current.state.clips).toHaveLength(0);
      expect(result.current.state.historyIndex).toBe(0);
    });

    it('redo 应该恢复到下一个状态', () => {
      const { result } = renderHook(() => useEditor());
      const clip1 = { id: 'clip1', name: 'Clip 1', startTime: 0, endTime: 10, duration: 10, type: 'video' as const };
      const clip2 = { id: 'clip2', name: 'Clip 2', startTime: 10, endTime: 20, duration: 10, type: 'video' as const };

      act(() => {
        result.current.operations.addClip(clip1);
      });
      act(() => {
        result.current.operations.addClip(clip2);
      });

      act(() => {
        result.current.operations.undo();
      });
      expect(result.current.state.clips).toHaveLength(1);

      act(() => {
        result.current.operations.redo();
      });

      expect(result.current.state.clips).toHaveLength(2);
    });

    it('redo 在历史记录末尾时不应该改变状态', () => {
      const { result } = renderHook(() => useEditor());
      const clip = { id: 'clip1', name: 'Clip 1', startTime: 0, endTime: 10, duration: 10, type: 'video' as const };

      act(() => {
        result.current.operations.addClip(clip);
      });

      act(() => {
        result.current.operations.redo();
      });

      expect(result.current.state.clips).toHaveLength(1);
      expect(result.current.state.historyIndex).toBe(1);
    });

    it('undo 应该正确更新 duration', () => {
      const { result } = renderHook(() => useEditor());
      const clip1 = { id: 'clip1', name: 'Clip 1', startTime: 0, endTime: 10, duration: 10, type: 'video' as const };
      const clip2 = { id: 'clip2', name: 'Clip 2', startTime: 10, endTime: 30, duration: 20, type: 'video' as const };

      act(() => {
        result.current.operations.addClip(clip1);
      });
      expect(result.current.state.duration).toBe(10);

      act(() => {
        result.current.operations.addClip(clip2);
      });
      expect(result.current.state.duration).toBe(30);

      act(() => {
        result.current.operations.undo();
      });
      expect(result.current.state.duration).toBe(10);
    });
  });

  describe('项目操作', () => {
    it('loadProject 应该加载项目状态', () => {
      const { result } = renderHook(() => useEditor());
      const clips = [
        { id: 'clip1', name: 'Clip 1', startTime: 0, endTime: 10, duration: 10, type: 'video' as const },
        { id: 'clip2', name: 'Clip 2', startTime: 10, endTime: 20, duration: 10, type: 'audio' as const },
      ];

      act(() => {
        result.current.operations.loadProject('project-123', '我的项目', clips);
      });

      expect(result.current.state.projectId).toBe('project-123');
      expect(result.current.state.projectName).toBe('我的项目');
      expect(result.current.state.clips).toHaveLength(2);
      expect(result.current.state.currentTime).toBe(0);
      expect(result.current.state.isPlaying).toBe(false);
      expect(result.current.state.history).toEqual([clips]);
      expect(result.current.state.historyIndex).toBe(0);
    });

    it('loadProject 应该显示 toast 提示', () => {
      const { result } = renderHook(() => useEditor());
      const toast = require('@/shared/components/ui').toast;

      act(() => {
        result.current.operations.loadProject('project-1', '测试项目');
      });

      expect(toast.success).toHaveBeenCalledWith('已加载项目: 测试项目');
    });

    it('loadProject 应该计算正确的 duration', () => {
      const { result } = renderHook(() => useEditor());
      const clips = [
        { id: 'clip1', name: 'Clip 1', startTime: 0, endTime: 15, duration: 15, type: 'video' as const },
        { id: 'clip2', name: 'Clip 2', startTime: 5, endTime: 25, duration: 20, type: 'video' as const },
      ];

      act(() => {
        result.current.operations.loadProject('project-1', 'Test', clips);
      });

      expect(result.current.state.duration).toBe(25);
    });

    it('exportProject 应该返回当前所有剪辑', () => {
      const { result } = renderHook(() => useEditor());
      const clips = [
        { id: 'clip1', name: 'Clip 1', startTime: 0, endTime: 10, duration: 10, type: 'video' as const },
      ];

      act(() => {
        result.current.operations.loadProject('project-1', 'Test', clips);
      });

      const exported = result.current.operations.exportProject();

      expect(exported).toEqual(clips);
    });

    it('loadProject 应该支持空 clips 数组', () => {
      const { result } = renderHook(() => useEditor());

      act(() => {
        result.current.operations.loadProject('project-1', '空项目', []);
      });

      expect(result.current.state.clips).toEqual([]);
      expect(result.current.state.duration).toBe(0);
    });

    it('loadProject 应该重置播放状态', () => {
      const { result } = renderHook(() => useEditor());

      act(() => {
        result.current.operations.play();
      });

      act(() => {
        result.current.operations.loadProject('project-1', 'New Project');
      });

      expect(result.current.state.isPlaying).toBe(false);
      expect(result.current.state.playbackRate).toBe(1);
      expect(result.current.state.selectedClipId).toBeNull();
    });
  });
});