/**
 * 项目导入导出服务 - Project Import/Export Service
 *
 * 合并自原 7 个子模块（types / validator / backup / exporter / importer /
 * compare / duplicator），保持对外 API 完全兼容。
 *
 * @module core/services/project/project-import-export-service
 */

import { v4 as uuidv4 } from 'uuid';

import type { ProjectData } from '@/shared/types';


/** 导出格式 */
export type ExportFormat = 'json' | 'zip';

/** 项目导出数据包 */
export interface ProjectExportData {
  version: string;
  exportedAt: string;
  project: ProjectData;
  metadata: {
    appVersion: string;
    format: ExportFormat;
    includesMedia: boolean;
  };
}

/** 导入选项 */
export interface ImportOptions {
  merge?: boolean;
  overwrite?: boolean;
  validate?: boolean;
}

/** 导出选项 */
export interface ExportOptions {
  format: ExportFormat;
  includeMedia?: boolean;
  compress?: boolean;
  includeHistory?: boolean;
}

/** 备份元信息 */
export interface BackupRecord {
  id: string;
  filename: string;
  projectId: string;
  projectName: string;
  createdAt: string;
  size: number;
}

/** 项目比较结果 */
export interface ProjectComparison {
  identical: boolean;
  differences: string[];
}

/** 验证结果 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** 当前导出格式版本 */
export const CURRENT_VERSION = '1.0.0';

import { STORAGE_KEYS } from '@/core/constants/app-config';

/** 最低支持版本 */
export const MIN_SUPPORTED_VERSION = '1.0.0';

/** 备份索引存储键 */
export const BACKUP_INDEX_KEY = STORAGE_KEYS.BACKUPS;

/** 单条备份内容存储键前缀 */
export const BACKUP_ITEM_PREFIX = 'storyweaver_backup_';

/** 备份最大保留数量 */
export const MAX_BACKUPS = 10;

/** 验证项目数据时的必需字段 */
export const REQUIRED_PROJECT_FIELDS = ['id', 'name', 'status'] as const;

/** 验证项目数据时的数组字段 */
export const ARRAY_PROJECT_FIELDS = ['videos', 'scripts'] as const;

/** 文件名中允许保留的字符 */
const FILENAME_SAFE_CHAR_REGEX = /[^a-zA-Z0-9一-龥]/g;

/** 把项目名规整为文件名安全字符串 */
export function sanitizeProjectName(name: string): string {
  return name.replace(FILENAME_SAFE_CHAR_REGEX, '_');
}

/** 生成导出文件名 */
export function generateExportFilename(projectName: string, format: ExportFormat): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `storyweaver_${sanitizeProjectName(projectName)}_${timestamp}.${format}`;
}

/** 生成备份文件名 */
export function generateBackupFilename(projectName: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `backup_${projectName}_${timestamp}.json`;
}

/** 解析版本号 */
export function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major: major ?? 0, minor: minor ?? 0, patch: patch ?? 0 };
}

/** 当前 ISO 时间戳 */
export function nowIso(): string {
  return new Date().toISOString();
}


/**
 * 验证项目数据合法性
 */
export function validateProjectData(project: unknown): ValidationResult {
  const errors: string[] = [];
  const p = project as Record<string, unknown>;

  if (!p.id || typeof p.id !== 'string') {
    errors.push('缺少项目 ID');
  }
  if (!p.name || typeof p.name !== 'string') {
    errors.push('缺少项目名称');
  }
  if (!p.status) {
    errors.push('缺少项目状态');
  }

  for (const field of ARRAY_PROJECT_FIELDS) {
    if (!Array.isArray(p[field])) {
      errors.push(`字段 ${field} 应该是数组`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 验证版本兼容性
 */
export function validateVersion(version: string): void {
  const { major, minor } = parseVersion(version);
  const { major: minMajor, minor: minMinor } = parseVersion(MIN_SUPPORTED_VERSION);

  if (major < minMajor || (major === minMajor && minor < minMinor)) {
    throw new Error(`项目文件版本 ${version} 不被支持。最低支持版本为 ${MIN_SUPPORTED_VERSION}`);
  }
}


/** 构造单条备份内容 key */
function buildBackupItemKey(backupId: string): string {
  return `${BACKUP_ITEM_PREFIX}${backupId}`;
}

/** 读取备份索引列表 */
function readBackupIndex(): BackupRecord[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(BACKUP_INDEX_KEY);
  return raw ? JSON.parse(raw) : [];
}

/** 写入整个备份索引 */
function writeBackupIndex(backups: BackupRecord[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(BACKUP_INDEX_KEY, JSON.stringify(backups));
}

/** 追加一条备份索引（自动按 MAX_BACKUPS 截断最早一条） */
function appendBackupRecord(record: BackupRecord): BackupRecord[] {
  const backups = readBackupIndex();
  backups.push(record);
  if (backups.length > MAX_BACKUPS) {
    backups.shift();
  }
  writeBackupIndex(backups);
  return backups;
}

/** 从索引中移除指定 id 的备份条目 */
function removeBackupRecord(backupId: string): BackupRecord[] {
  const backups = readBackupIndex().filter((b) => b.id !== backupId);
  writeBackupIndex(backups);
  return backups;
}

/** 读取单条备份内容 */
function readBackupContent(backupId: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(buildBackupItemKey(backupId));
}

/** 写入单条备份内容 */
function writeBackupContent(backupId: string, content: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(buildBackupItemKey(backupId), content);
}

/** 删除单条备份内容 */
function removeBackupContent(backupId: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(buildBackupItemKey(backupId));
}

/** 构造一条备份索引条目 */
function buildBackupRecord(
  id: string,
  filename: string,
  projectId: string,
  projectName: string,
  content: string
): BackupRecord {
  return {
    id,
    filename,
    projectId,
    projectName,
    createdAt: nowIso(),
    size: content.length,
  };
}


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

/** 全部差分构造器 */
const DIFF_BUILDERS: DiffBuilder[] = [
  diffName,
  diffStatus,
  diffDescription,
  diffVideoCount,
  diffScriptCount,
];

/**
 * 比较两个项目的差异
 */
function compareProjects(project1: ProjectData, project2: ProjectData): ProjectComparison {
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


/** 深拷贝视频数组（仅顶层 spread） */
function cloneVideos(project: ProjectData) {
  return (project.videos ?? []).map((v) => ({ ...v }));
}

/** 复制 scripts 数组 + 重新生成每条 id / 时间戳 */
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
 */
function duplicateProject(project: ProjectData, newName?: string): ProjectData {
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


/** 把项目数据中的视频 path 标记为已移除 */
function prepareProjectForExport(project: ProjectData): ProjectData {
  return {
    ...project,
    videos: (project.videos ?? []).map((v) => ({
      ...v,
      path: v.path ? '[导出时移除]' : v.path,
    })),
  };
}

/** 构造完整的导出数据包 */
function buildProjectExportData(project: ProjectData, options: Partial<ExportOptions> = {}): ProjectExportData {
  return {
    version: CURRENT_VERSION,
    exportedAt: nowIso(),
    project: prepareProjectForExport(project),
    metadata: {
      appVersion: CURRENT_VERSION,
      format: 'json',
      includesMedia: options.includeMedia || false,
    },
  };
}

/** 解析导出选项 */
function resolveExportOptions(options: Partial<ExportOptions> = {}): ExportOptions {
  return {
    format: 'json',
    includeMedia: false,
    compress: false,
    includeHistory: false,
    ...options,
  };
}

/**
 * 导出项目为 JSON 字符串
 */
export function exportToJSON(project: ProjectData, options: Partial<ExportOptions> = {}): string {
  return JSON.stringify(buildProjectExportData(project, options), null, 2);
}

/**
 * 导出项目（统一入口：JSON / ZIP）
 */
async function exportProject(project: ProjectData, options: Partial<ExportOptions> = {}): Promise<{ filename: string; content: string | Blob }> {
  const resolved = resolveExportOptions(options);
  const filename = generateExportFilename(project.name, resolved.format);

  if (resolved.format === 'json') {
    return {
      filename,
      content: exportToJSON(project, resolved),
    };
  }

  // ZIP 格式需要额外处理
  return {
    filename,
    content: exportToJSON(project, resolved),
  };
}


/** 解析失败的统一错误 */
const INVALID_FORMAT_ERROR = '无效的项目文件格式';

/**
 * 从 string 解析导出数据
 */
export function parseImportText(text: string): ProjectExportData {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(INVALID_FORMAT_ERROR);
  }
}

/**
 * 从 File 对象解析导出数据
 */
export async function parseImportFile(file: File): Promise<ProjectExportData> {
  return parseImportText(await file.text());
}

/**
 * 处理导入的项目数据
 */
export function processImportedProject(project: ProjectData, options: ImportOptions): ProjectData {
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

/** 解析导入选项 */
function resolveImportOptions(options: ImportOptions = {}): ImportOptions {
  return {
    merge: false,
    overwrite: false,
    validate: true,
    ...options,
  };
}

/**
 * 导入项目
 */
export async function importProject(data: string | File, options: ImportOptions = {}): Promise<ProjectData> {
  const resolved = resolveImportOptions(options);

  const exportData =
    typeof data === 'string' ? parseImportText(data) : await parseImportFile(data);

  if (resolved.validate) {
    validateVersion(exportData.version);
    validateProjectData(exportData.project);
  }

  return processImportedProject(exportData.project, resolved);
}


/**
 * 项目导入导出服务
 */
class ProjectImportExportService {
  // ========== 子流程方法（类字段绑定，保持 API 兼容） ==========

  /** 导出项目为 JSON 字符串 */
  exportToJSON = exportToJSON;

  /** 导出项目（统一入口：JSON / ZIP） */
  exportProject = exportProject;

  /** 导入项目 */
  importProject = importProject;

  /** 验证项目数据 */
  validateProjectData = validateProjectData;

  /** 验证版本兼容性 */
  validateVersion = validateVersion;

  /** 复制项目 */
  duplicateProject = duplicateProject;

  /** 比较两个项目 */
  compareProjects = compareProjects;

  // ========== 备份管理 ==========

  async backupProject(project: ProjectData): Promise<string> {
    const backupData: ProjectExportData = {
      version: CURRENT_VERSION,
      exportedAt: new Date().toISOString(),
      project,
      metadata: {
        appVersion: CURRENT_VERSION,
        format: 'json',
        includesMedia: false,
      },
    };

    const content = JSON.stringify(backupData, null, 2);
    const backupId = uuidv4();
    const filename = generateBackupFilename(project.name);

    writeBackupContent(backupId, content);
    appendBackupRecord(buildBackupRecord(backupId, filename, project.id, project.name, content));

    return backupId;
  }

  /** 读取所有备份索引 */
  getBackupList(): BackupRecord[] {
    return readBackupIndex();
  }

  /** 从 localStorage 恢复备份 */
  async restoreBackup(backupId: string): Promise<ProjectData | null> {
    const content = readBackupContent(backupId);
    if (!content) return null;
    try {
      const exportData: ProjectExportData = JSON.parse(content);
      return exportData.project;
    } catch {
      return null;
    }
  }

  /** 删除指定备份 */
  deleteBackup(backupId: string): void {
    removeBackupContent(backupId);
    removeBackupRecord(backupId);
  }
}


export const projectImportExportService = new ProjectImportExportService();
export default projectImportExportService;
