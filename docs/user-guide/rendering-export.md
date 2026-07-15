# 渲染与导出

> 第 6-9 步：渲染 → 剪辑 → 配音 → 合成导出

## 场景渲染 (RENDER)

基于分镜脚本逐帧生成关键帧图像：

- 支持 Seedance / Kling / vidu 多个生成模型
- 角色一致性保持（VLM 比对 ≥ 0.85）
- 失败自动重试 ≤ 3 次

## 视频剪辑 (VIDEO_EDITING)

- 镜头拼接（按分镜顺序）
- 转场效果添加
- 字幕叠加（SRT/VTT/ASS）
- 时间线编辑（裁剪/变速）

## 配音合成 (AUDIO_SYNTHESIS)

- TTS 配音（Edge TTS / 自定义声音）
- 唇形同步（SadTalker / 同类技术）
- 背景音乐混合
- 字幕时间轴对齐

## 合成导出 (COMPOSITION)

```typescript
// 导出配置
const exportConfig = {
  format: 'mp4', // mp4 / webm / mov
  quality: '1080p', // 720p / 1080p / 4K
  fps: 30, // 24 / 30 / 60
  codec: 'h264', // h264 / h265 / vp9
  bitrate: '10Mbps', // 自动 / 指定
};
```

### 导出格式对比

| 格式 | 兼容性   | 体积 | 推荐场景   |
| ---- | -------- | ---- | ---------- |
| MP4  | 最优     | 中   | 通用分享   |
| WebM | 浏览器优 | 小   | Web 嵌入   |
| MOV  | Apple 优 | 大   | macOS 编辑 |

[下一步：开发者指南 →](/developer-guide/architecture)
