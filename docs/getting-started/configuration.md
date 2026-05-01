# 配置

PanelFlow 的所有配置选项。

## 环境变量

在项目根目录创建 `.env.local`：

### 文字生成模型

```bash
# 智谱 GLM-5（默认）
VITE_ALIBABA_API_KEY=your-key
VITE_ALIBABA_API_URL=https://dashscope.aliyuncs.com/api/v1

# MiniMax M2.5
VITE_MINIMAX_API_KEY=your-key
VITE_MINIMAX_API_URL=https://api.minimax.chat/v1

# OpenAI GPT（可选）
VITE_OPENAI_API_KEY=your-key
VITE_OPENAI_API_URL=https://api.openai.com/v1

# 月之暗面 Kimi K2.5
VITE_KIMI_API_KEY=your-key

# 字节 Doubao 2.0
VITE_DOUBAO_API_KEY=your-key

# 阿里 Qwen 2.5
VITE_QWEN_API_KEY=your-key

# 百度 ERNIE 4.0
VITE_ERNIE_API_KEY=your-key
```

### 图像生成

```bash
# 字节 Seedream 5.0（默认，推荐）
VITE_SEEDDREAM_API_KEY=your-key
VITE_SEEDDREAM_API_URL=https://api.minimax.chat/v1

# 快手 Kling 1.6
VITE_KLING_API_KEY=your-key

# 生数 Vidu 2.0
VITE_VIDU_API_KEY=your-key
```

### 视频生成

```bash
# 字节 Seedance 2.0
VITE_SEEDANCE_API_KEY=your-key

# 快手 Kling 1.6
VITE_KLING_API_KEY=your-key
```

### 语音合成

```bash
# Edge TTS（免费，默认）
VITE_TTS_PROVIDER=edge

# 阿里云 CosyVoice 2.0
VITE_COSYVOICE_API_KEY=your-key

# 阿里云 KAN-TTS
VITE_KANTTS_API_KEY=your-key

# 百度 TTS
VITE_BAIDU_TTS_API_KEY=your-key

# 科大讯飞 TTS
VITE_XUNFEI_TTS_API_KEY=your-key
```

### 应用配置

```bash
# 应用模式
VITE_APP_MODE=web|desktop

# API 基础 URL（用于 Web 部署）
VITE_API_BASE_URL=https://api.PanelFlow.example.com
```

## 配置文件

对于高级设置，创建 `src/core/config/app.config.ts`：

```typescript
export const appConfig = {
  app: {
    name: 'PanelFlow',
    version: '3.0.0',
    mode: import.meta.env.VITE_APP_MODE || 'web',
  },

  // AI 提供商
  ai: {
    defaultProvider: 'minimax',
    defaultModel: 'glm-5',
    fallbackProviders: ['minimax', 'openai', 'kimi'],
  },

  // 图像生成
  image: {
    defaultModel: 'seedream-5.0',
    defaultResolution: '16:9',
    defaultQuality: 'high',
  },

  // 视频生成
  video: {
    defaultModel: 'seedance-2.0',
    defaultFormat: 'mp4',
    defaultFps: 30,
  },

  // 语音合成
  tts: {
    defaultProvider: 'edge',
    defaultVoice: 'zh-CN-XiaoxiaoNeural',
  },

  // 视频导出
  videoExport: {
    defaultFormat: 'mp4',
    defaultResolution: '1080p',
    defaultFps: 30,
  },

  // 功能开关
  features: {
    workflowAutomation: true,
    collaboration: false,
    cloudSync: false,
  },
};
```

## 支持的模型一览（v3.0.0 · 2026年）

### 文字生成

| 模型 | 提供商 | 上下文 | 发布日期 |
|------|--------|--------|----------|
| GLM-5 | 智谱 AI | 128k | 2026年2月 |
| M2.5 | MiniMax | 128k | 2026年2月 |
| Kimi K2.5 | 月之暗面 | 200k | 2026年 |
| Doubao 2.0 | 字节跳动 | 128k | 2026年 |
| Qwen 2.5 | 阿里云 | 128k | 2026年 |
| ERNIE 4.0 | 百度 | 128k | 2026年 |

### 图像生成

| 模型 | 提供商 | 特性 | 发布日期 |
|------|--------|------|----------|
| Seedream 5.0 | 字节跳动 | 2K直出、AI 4K增强、控制笔刷 | 2026年2月10日 |
| Kling 1.6 | 快手 | 图像+视频生成 | 2026年 |
| Vidu 2.0 | 生数科技 | 图像+视频生成、高一致性 | 2026年 |

### 视频生成

| 模型 | 提供商 | 特性 | 发布日期 |
|------|--------|------|----------|
| Seedance 2.0 | 字节跳动 | 文/图/视频输入、镜头一致 | 2026年2月12日 |
| Kling 1.6 | 快手 | AI视频生成 | 2026年 |
| Vidu 2.0 | 生数科技 | AI视频生成 | 2026年 |

### 语音合成

| 模型/服务 | 提供商 | 特性 |
|-----------|--------|------|
| CosyVoice 2.0 | 阿里云 | 开源、3秒克隆、方言/情感 |
| KAN-TTS | 阿里云 | 神经网络+领域知识、多语言 |
| TTS | 百度 | 中文优化、多语言 |
| TTS | 科大讯飞 | 多语言支持 |

## 下一步

- [快速开始](./quick-start.md)
- [工作流程概述](../user-guide/workflow-overview.md)
