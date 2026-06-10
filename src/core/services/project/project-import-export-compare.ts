/**
 * 项目比较
 * @module core/services/project/project-import-export-compare
 *
 * 提取自原 `ProjectImportExportService.compareProjects`。
 * 把"逐字段差分"拆为独立纯函数 + 通用数组长度比较 helper。
 */

import type { ProjectData } from '@/shared/types';

import type { ProjectComparison } from './project-import-export-types';

/** 单条字段差分构造器签名 */
type DiffBuilder = (a: ProjectData, b: ProjectData) => string | null;

/** 名称不同 */
const diffName: DiffBuilder = (a, b) =>
  a.name !== b.name ? `名称: "${a.name}" -> "${b.name}"` : null;

/** 状态不同 */
const diffStatus: DiffBuilder = (a, b) =>
  a.status !== b.status ? `状态: "${a.status}" -> "${b.status}"` : null;

/** 描述修改 */
const diffDescription: DiffBuilder = (a, b) =>
  a.description !== b.description ? '描述已修改' : null;

/** 视频数量不同 */
const diffVideoCount: DiffBuilder = (a, b) =>
  a.videos!.length !== b.videos!.length
    ? `视频数量: ${a.videos!.length} -> ${b.videos!.length}`
    : null;

/** 脚本数量不同 */
const diffScriptCount: DiffBuilder = (a, b) =>
  a.scripts!.length !== b.scripts!.length
    ? `脚本数量: ${a.scripts!.length} -> ${b.scripts!.length}`
    : null;

/** 全部差分构造器（按顺序求值） */
const DIFF_BUILDERS: DiffBuilder[] = [
  diffName,
  diffStatus,
  diffDescription,
  diffVideoCount,
  diffScriptCount,
];

/**
 * 比较两个项目的差异
 *
 * 行为与原 `ProjectImportExportService.compareProjects` 字节级一致。
 */
export function compareProjects(
  project1: ProjectData,
  project2: ProjectData
): ProjectComparison {
  const differences: string[] = [];

  for (const builder of DIFF_BUILDERS) {
    const diff = builder(project1, project2);
    if (diff) {
      differences.push(diff);
    }
  }

  return {
    identical: differences.length === 0,
    differences,
  };
}
