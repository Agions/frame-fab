# TTS 服务

用于语音音频生成的文本转语音合成。

## 概述

TTSService 使用多个提供商（Edge TTS、ElevenLabs、阿里云）将文本转换为自然语音。

## 导入

```typescript
import { ttsService } from '@/core/services';
```

## 方法

### synthesize()

将文本转换为语音。

```typescript
async synthesize(
  text: string,
  config?: TTSConfig
): Promise<TTSResult>
```

**参数：**

| 参数 | 类型 | 描述 |
|-------|------|-------------|
| `text` | `string` | 要合成的文本 |
| `config.provider` | `string` | TTS 提供商 |
| `config.voice` | `string` | 语音 ID |
| `config.speed` | `number` | 语速 (0.5-2.0) |
| `config.pitch` | `number` | 音调调整 (-50 到 50) |

**返回：**

```typescript
interface TTSResult {
  audioUrl: string;         // 生成的音频 URL
  duration: number;         // 时长（秒）
  format: string;           // 音频格式 (mp3/wav)
  provider: string;         // 使用的提供商
  voiceId: string;          // 使用的语音
}
```

**示例：**

```typescript
const result = await ttsService.synthesize(
  '你好，欢迎来到 PanelFlow。让我带你参观一下。',
  {
    provider: 'edge',
    voice: 'zh-CN-XiaoxiaoNeural',
    speed: 1.0,
    pitch: 0,
  }
);

console.log(result.audioUrl);
// "https://cdn.PanelFlow.app/audio/abc123.mp3"
console.log(result.duration);
// 3.5
```

### synthesizeBatch()

将多个文本转换为语音。

```typescript
async synthesizeBatch(
  texts: TTSItem[],
  config?: TTSConfig
): Promise<TTSResult[]>
```

**示例：**

```typescript
const results = await ttsService.synthesizeBatch([
  { id: '1', text: '第一句对话。' },
  { id: '2', text: '第二句对话。' },
  { id: '3', text: '第三句对话。' },
], { provider: 'edge', voice: 'zh-CN-XiaoxiaoNeural' });
```

## 提供商

### Edge TTS（默认，免费）

```typescript
// 中文语音
'zh-CN-XiaoxiaoNeural'  // 女声，友好
'zh-CN-YunxiNeural'      // 男声，富有表现力
'zh-CN-YunyangNeural'    // 男声，新闻风格

// 英文语音
'en-US-JennyNeural'      // 女声，休闲
'en-US-GuyNeural'        // 男声，专业
```

### ElevenLabs（高级）

```typescript
{
  provider: 'elevenlabs',
  voice: 'your-voice-id',
  apiKey: process.env.ELEVENLABS_API_KEY,
}
```

### 阿里云

```typescript
{
  provider: 'alibaba',
  voice: 'xiaoyun',
}
```

## 语音配置

### 语速

| 值 | 描述 |
|-------|-------------|
| 0.5 | 半速 |
| 1.0 | 正常速度 |
| 1.5 | 1.5 倍速 |
| 2.0 | 双倍速度 |

### 音调

| 值 | 描述 |
|-------|-------------|
| -50 | 非常低 |
| 0 | 正常 |
| +50 | 非常高 |

## SSML 支持

使用 SSML 进行高级控制：

```typescript
const result = await ttsService.synthesize(
  `<speak>
    <break time="500ms"/>
    你好 <emphasis level="moderate">世界</emphasis>。
    <prosody rate="slow">这是慢速。</prosody>
  </speak>`,
  { provider: 'edge', format: 'ssml' }
);
```

## 音频格式

| 格式 | 质量 | 大小 | 使用场景 |
|--------|---------|------|----------|
| `mp3` | 高 | 小 | Web、通用 |
| `wav` | 无损 | 大 | 剪辑 |
| `ogg` | 高 | 小 | WebRTC |

## 错误处理

```typescript
try {
  const result = await ttsService.synthesize(text, config);
} catch (error) {
  if (error.code === 'TEXT_TOO_LONG') {
    // 拆分为较小的块
    const chunks = splitText(text, 500);
    return ttsService.synthesizeBatch(chunks, config);
  }
  if (error.code === 'VOICE_NOT_FOUND') {
    // 使用默认语音
    return ttsService.synthesize(text, { ...config, voice: 'default' });
  }
  if (error.code === 'PROVIDER_ERROR') {
    // 回退到其他提供商
    return ttsService.synthesize(text, { ...config, provider: 'edge' });
  }
}
```

## 唇形同步集成

TTS 输出通常与唇形同步配合使用：

```typescript
// 1. 生成语音
const audio = await ttsService.synthesize(
  '你好，今天怎么样？',
  { provider: 'edge', voice: 'zh-CN-XiaoxiaoNeural' }
);

// 2. 生成图像
const images = await imageGenerationService.generateCharacterImage(
  character,
  '角色微笑',
  { model: 'seedream-5.0' }
);

// 3. 同步唇形
const lipSyncResult = await lipSyncService.syncLip(
  images.imageUrl,
  audio.audioUrl
);
```

## 成本

| 提供商 | 每 1000 字符成本 |
|----------|---------------------|
| Edge TTS | 免费 |
| ElevenLabs | ~$0.30 |
| 阿里云 | ~$0.10 |

## 最佳实践

1. **文本准备**
   - 如果不使用 SSML，请移除 SSML 特殊字符
   - 将长文本拆分为段落
   - 在句子之间添加停顿

2. **语音选择**
   - 使语音个性与内容匹配
   - 测试多种语音以获得最佳效果
   - 同一角色使用一致的语音

3. **性能**
   - 批量合并多行
   - 缓存音频文件
   - 预览使用较低质量

4. **质量**
   - 后期制作使用 WAV
   - 适当的语速/音调避免削波
   - 最终渲染前预览
