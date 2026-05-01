# 服务

PanelFlow 中的核心服务实现。

## 服务架构

```
┌─────────────────────────────────────────────────────────┐
│                    应用层                                 │
├─────────────────────────────────────────────────────────┤
│  features/  →  功能特定的业务逻辑                         │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    核心服务层                            │
├─────────────────────────────────────────────────────────┤
│  ai.service.ts          - 统一 AI 提供商接口             │
│  image-generation.service.ts - 图片生成                  │
│  tts.service.ts         - 文本转语音                    │
│  lip-sync.service.ts    - 唇音同步                      │
│  manga-pipeline.service.ts - 端到端流水线               │
│  storyboard.service.ts  - 分镜管理                      │
│  character.service.ts   - 角色管理                      │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    基础设施层                            │
├─────────────────────────────────────────────────────────┤
│  apiClient.ts           - HTTP 客户端                    │
│  storageService.ts      - 本地/云存储                    │
└─────────────────────────────────────────────────────────┘
```

## AI 服务

AI 文本生成的统一接口。

```typescript
// src/core/services/ai.service.ts
class AIService {
  async generate(prompt: string, options?: GenerationOptions): Promise<GenerationResult>;
  async analyze(content: string, options?: AnalysisOptions): Promise<AnalysisResult>;
}
```

**用法:**
```typescript
import { aiService } from '@/core/services';

const result = await aiService.generate(
  '写一个两个角色之间的戏剧性场景',
  { provider: 'alibaba', model: 'qwen-3.5' }
);
```

## 图片生成服务

多提供商图片生成。

```typescript
// src/core/services/image-generation.service.ts
class ImageGenerationService {
  async generateImage(
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<ImageResult>;

  async generateCharacterImage(
    character: Character,
    prompt: string,
    options?: ImageGenerationOptions
  ): Promise<ImageResult>;
}
```

**支持的提供商:**
| 提供商 | 模型 | 适用场景 |
|--------|------|----------|
| MiniMax | Seedream 5.0 | 动漫、插画 |
| Replicate | FLUX | 写实、多样性 |
| OpenAI | DALL-E 3 | 创意、艺术 |

## TTS 服务

文本转语音合成。

```typescript
// src/core/services/tts.service.ts
class TTSService {
  async synthesize(text: string, config: TTSConfig): Promise<TTSResult>;
  async synthesizeBatch(texts: string[], config: TTSConfig): Promise<TTSResult[]>;
}
```

**提供商:**
| 提供商 | 质量 | 费用 |
|--------|------|------|
| Edge TTS | 良好 | 免费 |
| ElevenLabs | 优秀 | 付费 |
| 阿里巴巴 | 良好 | 付费 |

## 唇音同步服务

角色唇音同步。

```typescript
// src/core/services/lip-sync.service.ts
class LipSyncService {
  async syncLip(
    imageUrl: string,
    audioUrl: string,
    options?: LipSyncOptions
  ): Promise<LipSyncResult>;
}
```

## 漫画流水线服务

端到端漫画/视频生成流水线。

```typescript
// src/core/services/manga-pipeline.service.ts
class MangaPipelineService {
  async processSequence(
    scenes: Scene[],
    options?: PipelineOptions
  ): Promise<PipelineResult>;

  async generateFromNovel(
    novelContent: string,
    scenes: Scene[],
    options?: PipelineOptions
  ): Promise<PipelineResult>;
}
```

**流水线流程:**
```
输入 → 解析 → 生成脚本 → 创建分镜
      → 生成图片 → 唇音同步 → 合成 → 输出
```

## 分镜服务

分镜 CRUD 和 AI 生成。

```typescript
// src/core/services/storyboard.service.ts
class StoryboardService {
  // CRUD 操作
  createFrame(frame: Partial<StoryboardFrame>): StoryboardFrame;
  updateFrame(id: string, updates: Partial<StoryboardFrame>): StoryboardFrame;
  deleteFrame(id: string): void;
  getFrames(): StoryboardFrame[];

  // AI 生成
  generateFromScript(script: Script): Promise<StoryboardFrame[]>;
  generateFrameImage(frameId: string): Promise<string>;
  generateAllFrameImages(progress?: ProgressCallback): Promise<string[]>;

  // 导出
  exportToJSON(): string;
  exportToPDF(): Promise<Blob>;
}
```

## 存储服务

文件存储抽象。

```typescript
// src/shared/services/storage/storage.service.ts
class StorageService {
  async save(key: string, data: any): Promise<void>;
  async load<T>(key: string): Promise<T | null>;
  async remove(key: string): Promise<void>;
  async list(): Promise<string[]>;
}
```

**后端:**
- **本地**: 浏览器 localStorage/IndexedDB
- **云端**: (未来) 云存储提供商

## 服务注册

服务在 `src/core/services/index.ts` 中注册:

```typescript
// src/core/services/index.ts
export const aiService = AIService.getInstance();
export const imageGenerationService = ImageGenerationService.getInstance();
export const ttsService = TTSService.getInstance();
export const lipSyncService = LipSyncService.getInstance();
export const mangaPipelineService = MangaPipelineService.getInstance();
export const storyboardService = StoryboardService.getInstance();
export const characterService = CharacterService.getInstance();
export const storageService = StorageService.getInstance();
```

## 创建新服务

1. 在适当位置创建服务文件
2. 实现单例模式
3. 从 index.ts 导出实例
4. 为公开 API 添加 TypeScript 类型

```typescript
// src/core/services/example.service.ts
class ExampleService {
  private static instance: ExampleService;

  static getInstance(): ExampleService {
    if (!ExampleService.instance) {
      ExampleService.instance = new ExampleService();
    }
    return ExampleService.instance;
  }

  // ... 实现
}

export const exampleService = ExampleService.getInstance();
```
