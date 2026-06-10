/**
 * 项目导入
 * @module core/services/project/project-import-export-importer
 *
 * 提取自原 ProjectImportExportService.importProject / 私有 processImportedProject。
 *
 * 注意：原 importProject 内对 `validate` 字段检查了两次（一次校验版本，一次校验数据），
 * 本模块保留此行为——通过 `validateFlag` 一次传入即可。
 */

import { v4 as uuidv4 } from 'uuid';

import type { ProjectData } from '@/shared/types';

import {
  nowIso,
  type ImportOptions,
  type ProjectExportData,
} from './project-import-export-types';
import {
  validateProjectData,
  validateVersion,
} from './project-import-export-validator';

/** 解析失败的统一错误（与原 importProject 内联 throw '无效的项目文件格式' 字节级一致） */
const INVALID_FORMAT_ERROR = '无效的项目文件格式';

/**
 * 从 string 解析导出数据（解析失败抛错）
 */
export function parseImportText(text: string): ProjectExportData {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(INVALID_FORMAT_ERROR);
  }
}

/**
 * 从 File 对象解析导出数据（异步读取 + 解析）
 */
export async function parseImportFile(file: File): Promise<ProjectExportData> {
  return parseImportText(await file.text());
}

/**
 * 处理导入的项目数据
 *
 * 行为与原 processImportedProject 字节级一致：
 *   - merge=false → id 重新生成
 *   - merge=true → 保留原 id
 *   - createdAt 缺失时补当前时间
 *   - videos.path 全部重置为 ''
 */
export function processImportedProject(
  project: ProjectData,
  options: ImportOptions
): ProjectData {
  const now = nowIso();

  return {
    ...project,
    id: options.merge ? project.id : uuidv4(),
    createdAt: project.createdAt || now,
    updatedAt: now,
    videos: (project.videos ?? []).map((v) => ({
      ...v,
      path: '',
    })),
  };
}

/** 解析导入选项（与原 importProject 内联 defaultOptions 字节级一致） */
export function resolveImportOptions(
  options: ImportOptions = {}
): ImportOptions {
  return {
    merge: false,
    overwrite: false,
    validate: true,
    ...options,
  };
}

/**
 * 导入项目
 *
 * 编排：解析 string/File → 校验版本 → 校验数据 → 处理项目
 */
export async function importProject(
  data: string | File,
  options: ImportOptions = {}
): Promise<ProjectData> {
  const resolved = resolveImportOptions(options);

  const exportData =
    typeof data === 'string' ? parseImportText(data) : await parseImportFile(data);

  if (resolved.validate) {
    validateVersion(exportData.version);
    validateProjectData(exportData.project);
  }

  return processImportedProject(exportData.project, resolved);
}
