/**
 * 视频导出/编辑选项常量
 */
export const VIDEO_FORMATS = [
  { value: 'mp4', label: 'MP4', ext: '.mp4' },
  { value: 'mov', label: 'MOV', ext: '.mov' },
  { value: 'webm', label: 'WebM', ext: '.webm' },
  { value: 'avi', label: 'AVI', ext: '.avi' },
] as const;

export const EXPORT_QUALITIES = [
  { value: 'low', label: '低质量', crf: 28 },
  { value: 'medium', label: '中等质量', crf: 23 },
  { value: 'high', label: '高质量', crf: 18 },
  { value: 'ultra', label: '超高质量', crf: 15 },
] as const;

export const RESOLUTION_OPTIONS = [
  { value: '720p', label: '720p HD', width: 1280, height: 720 },
  { value: '1080p', label: '1080p Full HD', width: 1920, height: 1080 },
  { value: '2k', label: '2K QHD', width: 2560, height: 1440 },
  { value: '4k', label: '4K UHD', width: 3840, height: 2160 },
] as const;

export const ASPECT_RATIOS = [
  {
    value: '9:16',
    label: '9:16',
    labelCn: '竖屏',
    desc: '抖音/快手/视频号',
    width: 1080,
    height: 1920,
    category: 'short',
  },
  {
    value: '16:9',
    label: '16:9',
    labelCn: '横屏',
    desc: '西瓜视频/YouTube',
    width: 1920,
    height: 1080,
    category: 'landscape',
  },
  {
    value: '1:1',
    label: '1:1',
    labelCn: '方屏',
    desc: '小红书/Instagram',
    width: 1080,
    height: 1080,
    category: 'square',
  },
  {
    value: '4:3',
    label: '4:3',
    labelCn: '传统',
    desc: '传统比例',
    width: 1440,
    height: 1080,
    category: 'legacy',
  },
  {
    value: '21:9',
    label: '21:9',
    labelCn: '超宽',
    desc: '电影宽屏',
    width: 2560,
    height: 1080,
    category: 'ultrawide',
  },
] as const;

export const SHORT_VIDEO_ASPECT_RATIOS = ASPECT_RATIOS.filter(
  (r) => r.category === 'short' || r.category === 'square'
);

/** 根据基准分辨率计算目标比例的尺寸 */
export const getAspectRatioDimensions = (
  aspectValue: string,
  baseResolution: string = '1080p'
): { width: number; height: number } => {
  const aspect = ASPECT_RATIOS.find((r) => r.value === aspectValue);
  const resolution = RESOLUTION_OPTIONS.find((r) => r.value === baseResolution);
  if (!aspect || !resolution) return { width: 1920, height: 1080 };
  const baseHeight = resolution.height;
  const width = Math.round(baseHeight * (aspect.width / aspect.height));
  return { width, height: baseHeight };
};

export const CROP_MODES = [
  { value: 'fit', label: '适应', labelEn: 'Fit', desc: '完整显示内容，保持比例，可能有黑边' },
  { value: 'fill', label: '填充', labelEn: 'Fill', desc: '填满整个画面，可能裁剪部分内容' },
  { value: 'stretch', label: '拉伸', labelEn: 'Stretch', desc: '拉伸填满画面，不保持比例' },
  { value: 'smart', label: '智能裁剪', labelEn: 'Smart Crop', desc: 'AI 自动识别主体并进行裁剪' },
  { value: 'manual', label: '手动裁剪', labelEn: 'Manual', desc: '手动调整裁剪区域' },
] as const;

export const CROP_ALIGNMENTS = [
  { value: 'center', label: '居中' },
  { value: 'top', label: '顶部' },
  { value: 'bottom', label: '底部' },
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
] as const;

export const TRANSITION_EFFECTS = [
  { value: 'fade', label: '淡入淡出', duration: 0.5 },
  { value: 'dissolve', label: '交叉溶解', duration: 0.5 },
  { value: 'wipe', label: '擦除效果', duration: 0.5 },
  { value: 'slide', label: '滑动效果', duration: 0.5 },
  { value: 'zoom', label: '缩放效果', duration: 0.5 },
  { value: 'none', label: '无效果', duration: 0 },
] as const;
