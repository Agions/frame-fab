# 图像生成服务

支持角色一致性的多提供商图像合成。

## 概述

ImageGenerationService 提供对多种 AI 图像生成提供商的统一访问，包括 Seedream（MiniMax）、FLUX（Replicate）和 DALL-E（OpenAI）。

## 导入

```typescript
import { imageGenerationService } from '@/core/services';
```

## 方法

### generateImage()

从文本提示生成单个图像。

```typescript
async generateImage(
  prompt: string,
  options?: ImageGenerationOptions
): Promise<ImageResult>
```

**参数：**

| 参数 | 类型 | 描述 |
|-------|------|-------------|
| `prompt` | `string` | 图像描述 |
| `options.model` | `string` | 使用的模型 |
| `options.resolution` | `string` | 输出分辨率 |
| `options.quality` | `string` | 质量：standard/hd |
| `options.characterId` | `string` | 用于角色一致性 |

**返回：**

```typescript
interface ImageResult {
  imageUrl: string;         // 生成的图像 URL
  thumbnailUrl: string;     // 缩略图预览
  prompt: string;           // 原始提示词
  model: string;            // 使用的模型
  generationId: string;      // 提供商的 ID
  metadata?: {
    seed?: number;
    steps?: number;
    guidance?: number;
  };
}
```

**示例：**

```typescript
const result = await imageGenerationService.generateImage(
  '一位武士站在传统日式寺庙前，日落时分，电影级灯光，4K',
  {
    model: 'seedream-5.0',
    resolution: '16:9',
    quality: 'hd',
  }
);

console.log(result.imageUrl);
// "https://cdn.PanelFlow.app/images/abc123.png"
```

### generateCharacterImage()

生成具有角色一致性的图像。

```typescript
async generateCharacterImage(
  character: Character,
  prompt: string,
  options?: ImageGenerationOptions
): Promise<ImageResult>
```

**示例：**

```typescript
import type { Character } from '@/shared/types';

const character: Character = {
  id: 'char_001',
  name: '英雄',
  consistency: {
    seed: 12345,
    referenceImages: ['https://example.com/ref1.png'],
  },
};

const result = await imageGenerationService.generateCharacterImage(
  character,
  '英雄站在森林中',
  { model: 'seedream-5.0' }
);
// 生成的图像保持视觉一致性
```

### generateBatch()

批量生成多个图像。

```typescript
async generateBatch(
  prompts: string[],
  options?: ImageGenerationOptions
): Promise<ImageResult[]>
```

**示例：**

```typescript
const results = await imageGenerationService.generateBatch(
  [
    '场景 1：角色进入房间',
    '场景 2：角色发现线索',
    '场景 3：角色做出反应',
  ],
  { model: 'seedream-5.0' }
);
```

## 支持的模型

| 模型 | 提供商 | 适用场景 | 分辨率 |
|-------|----------|----------|------------|
| `seedream-5.0` | MiniMax | 动漫、插画 | 1024×1024 |
| `flux` | Replicate | 写实、多样化 | 1024×1024 |
| `dalle-3` | OpenAI | 创意、艺术 | 1024×1024 |
| `sdxl` | Stability | 稳定、可靠 | 1024×1024 |
| `playground` | Playground | 鲜艳色彩 | 1024×1024 |

## 分辨率预设

| 预设 | 尺寸 | 宽高比 |
|--------|------------|--------------|
| `1:1` | 1024×1024 | 正方形 |
| `16:9` | 1280×720 | 宽屏 |
| `9:16` | 720×1280 | 竖屏 |
| `4:3` | 1024×768 | 标准 |
| `3:2` | 1152×768 | 照片 |

## 角色一致性

为保持角色外观一致：

```typescript
// 1. 设置角色一致性种子
character.consistency = {
  seed: Math.floor(Math.random() * 999999),
  referenceImages: [uploadedRefUrl],
};

// 2. 在生成时使用 characterId
imageGenerationService.generateCharacterImage(
  character,
  '角色执行动作',
  { model: 'seedream-5.0' }
);
```

## 错误处理

```typescript
try {
  const result = await imageGenerationService.generateImage(prompt);
} catch (error) {
  if (error.code === 'PROMPT_TOO_LONG') {
    // 缩短提示词
    return imageGenerationService.generateImage(shortenPrompt(prompt));
  }
  if (error.code === 'NSFW_CONTENT') {
    // 使用安全的提示词
    return imageGenerationService.generateImage(makeSafePrompt(prompt));
  }
  if (error.code === 'MODEL_UNAVAILABLE') {
    // 回退到其他模型
    return imageGenerationService.generateImage(prompt, { model: 'sdxl' });
  }
}
```

## 成本估算

| 模型 | 单张图像成本 |
|-------|----------------|
| seedream-5.0 | ~$0.05 |
| dalle-3 | ~$0.04 |
| flux | ~$0.02 |
| sdxl | 免费（本地） |

## 最佳实践

1. **提示词工程**
   - 明确指定风格（动漫、写实）
   - 包含灯光、构图细节
   - 提及情绪/氛围

2. **角色一致性**
   - 始终使用相同的 characterId
   - 提供参考图像
   - 锁定种子数

3. **性能**
   - 多张相似图像使用批量生成
   - 缓存生成的图像
   - 使用较低分辨率进行预览

4. **质量**
   - 最终输出使用 HD 质量
   - 生成多张并选择最佳
   - 使用负面提示词排除不需要的元素
