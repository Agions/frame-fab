/**
 * export.slice.ts — 导出历史切片
 *
 * 【v3.3 代码审查 — 类型收窄】
 * 原 SetState = (...args: any[]) => void / (s: any) 削弱类型安全。
 * 改为精确的 ExportSliceFields + ExportRecord[] 推断。
 */

import type { ExportRecord } from '@/shared/types';

type ExportSliceFields = {
  exportHistory: ExportRecord[];
};

type ExportSetState = (
  partial: Partial<ExportSliceFields> | ((state: ExportSliceFields) => Partial<ExportSliceFields>)
) => void;

export function createExportSlice(set: ExportSetState) {
  return {
    addExportRecord: (record: ExportRecord) =>
      set((s) => ({ exportHistory: [...s.exportHistory, record] })),

    clearExportHistory: () => set({ exportHistory: [] }),
  };
}
