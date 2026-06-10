/**
 * 项目复制
 * @module core/services/project/project-import-export-duplicator
 *
 * 提取自原 `ProjectImportExportService.duplicateProject`。
 * 把 scripts 的深拷贝 + 重新生成 id 抽为子函数，保持主函数可读。
 */

import { v4 as uuidv4 } from 'uuid';

import type { ProjectData } from '@/shared/types';

import { nowIso } from './project-import-export-types';

/**
 * 深拷贝视频数组（仅顶层 spread，与原 `(v) => ({ ...v })` 字节级一致）
 */
function cloneVideos(project: ProjectData) {
  return (project.videos ?? []).map((v) => ({ ...v }));
}

/**
 * 复制 scripts 数组 + 重新生成每条 id / 时间戳
 *
 * 行为与原 `duplicateProject` 内联 `.map((s) => ({ ...s, id: uuidv4(), createdAt: now, updatedAt: now }))` 字节级一致。
 */
function cloneScriptsWithNewIds(project: ProjectData, now: string) {
  return (project.scripts ?? []).map((s) => ({
    ...s,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  }));
}

/**
 * 复制项目
 *
 * 行为与原 `duplicateProject` 字节级一致：
 *   - id: 新 uuidv4()
 *   - name: newName ?? "<原名> (副本)"
 *   - createdAt / updatedAt: 当前时间
 *   - videos: 浅拷贝
 *   - scripts: 浅拷贝 + 新 id + 新时间戳
 */
export function duplicateProject(
  project: ProjectData,
  newName?: string
): ProjectData {
  const now = nowIso();

  return {
    ...project,
    id: uuidv4(),
    name: newName || `${project.name} (副本)`,
    createdAt: now,
    updatedAt: now,
    videos: cloneVideos(project),
    scripts: cloneScriptsWithNewIds(project, now),
  };
}
