/**
 * PDF 导出（漫画书）
 *
 * 从 export.service.ts 抽离 exportAsPDF。
 * 通过 jsPDF 动态导入生成漫画风格 PDF。
 */

import { saveAs } from 'file-saver';

import {
  ProjectExportFormat,
  type ProjectExportOptions,
  type ProgressCallback,
  type StoryboardData,
} from './export-types';
import { generateFileName } from './export-utils';

/** PDF 页边距（mm） */
const PDF_MARGIN_MM = 10;
/** PDF 起始 Y 坐标（mm） */
const PDF_INITIAL_Y_MM = 30;
/** PDF 标题字号 */
const PDF_TITLE_FONT_SIZE = 24;
/** PDF 场景字号 */
const PDF_SCENE_FONT_SIZE = 12;
/** PDF 对话字号 */
const PDF_DIALOGUE_FONT_SIZE = 10;
/** PDF 页脚字号 */
const PDF_FOOTER_FONT_SIZE = 8;
/** 场景段落行高（mm） */
const SCENE_LINE_HEIGHT_MM = 6;
/** 段落间距（mm） */
const SCENE_PARAGRAPH_SPACING_MM = 10;
/** 对话行高（mm） */
const DIALOGUE_LINE_HEIGHT_MM = 5;
/** 对话段落间距（mm） */
const DIALOGUE_PARAGRAPH_SPACING_MM = 5;
/** PDF 页面底部安全区（mm）——超过则换页 */
const PAGE_BOTTOM_SAFE_AREA_MM = 60;

/**
 * 把分镜导出为 PDF 漫画书。
 *
 * 行为与原 exportAsPDF 完全一致：
 * - A4 纵向、mm 单位
 * - 标题居中 24pt
 * - 场景段落 12pt + 对话 10pt 缩进 5mm
 * - 底部空间不足时换页
 * - 页脚显示导出日期
 */
export async function exportAsPDF(
  storyboard: StoryboardData,
  options: ProjectExportOptions,
  _onProgress?: ProgressCallback
): Promise<Blob> {
  // 动态导入 jsPDF（懒加载）
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PDF_MARGIN_MM * 2;

  // 标题
  doc.setFontSize(PDF_TITLE_FONT_SIZE);
  doc.setTextColor(33, 33, 33);
  doc.text(storyboard.title, pageWidth / 2, 30, { align: 'center' });

  // 场景
  let y = 50;
  for (let i = 0; i < storyboard.scenes.length; i++) {
    const scene = storyboard.scenes[i];

    if (y > pageHeight - PAGE_BOTTOM_SAFE_AREA_MM) {
      doc.addPage();
      y = PDF_INITIAL_Y_MM;
    }

    // 场景描述
    doc.setFontSize(PDF_SCENE_FONT_SIZE);
    doc.setTextColor(66, 66, 66);
    const sceneText = `${i + 1}. ${scene.description || '场景 ' + (i + 1)}`;
    const splitText = doc.splitTextToSize(sceneText, contentWidth);
    doc.text(splitText, PDF_MARGIN_MM, y);
    y += splitText.length * SCENE_LINE_HEIGHT_MM + SCENE_PARAGRAPH_SPACING_MM;

    // 对话
    if (scene.dialogue) {
      doc.setFontSize(PDF_DIALOGUE_FONT_SIZE);
      doc.setTextColor(100, 100, 100);
      const dialogueText = `"${scene.dialogue}"`;
      const splitDialogue = doc.splitTextToSize(dialogueText, contentWidth - 10);
      doc.text(splitDialogue, PDF_MARGIN_MM + 5, y);
      y += splitDialogue.length * DIALOGUE_LINE_HEIGHT_MM + DIALOGUE_PARAGRAPH_SPACING_MM;
    }

    y += SCENE_PARAGRAPH_SPACING_MM;
  }

  // 页脚
  doc.setFontSize(PDF_FOOTER_FONT_SIZE);
  doc.setTextColor(150, 150, 150);
  doc.text(`导出于 ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 5, {
    align: 'center',
  });

  const blob = doc.output('blob');
  const fileName = options.fileName || generateFileName(storyboard.title, ProjectExportFormat.PDF);
  saveAs(blob, fileName);
  return blob;
}
