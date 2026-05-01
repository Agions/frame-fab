# 环境变量

PanelFlow 所有环境变量说明。

## 变量命名

| 前缀 | 用途 |
|------|------|
| `VITE_` | 客户端侧（暴露给浏览器） |
| `TAURI_` | Tauri 桌面应用 |

## AI 提供商

### 阿里巴巴（默认）

```bash
VITE_ALIBABA_API_KEY=***
VITE_ALIBABA_API_URL=https://dashscope.aliyuncs.com/api/v1
```

### OpenAI

```bash
VITE_OPENAI_API_KEY=***
VITE_OPENAI_API_URL=https://api.openai.com/v1
```

### Azure OpenAI

```bash
VITE_AZURE_OPENAI_KEY=xxxxxxxxxxxx
VITE_AZURE_OPENAI_ENDPOINT=https://resource.openai.azure.com
VITE_AZURE_OPENAI_DEPLOYMENT=gpt-4
```

### DeepSeek

```bash
VITE_DEEPSEEK_API_KEY=***
```

## 图片生成

### Seedream (MiniMax)

```bash
VITE_SEEDDREAM_API_KEY=***
VITE_SEEDDREAM_API_URL=https://api.minimax.chat/v1
```

### Replicate (FLUX, SDXL)

```bash
VITE_REPLICATE_API_KEY=***
```

### OpenAI DALL-E

```bash
VITE_DALLE_API_KEY=***
```

## 语音合成

### 提供商选择

```bash
VITE_TTS_PROVIDER=edge  # 选项: edge, elevenlabs, alibaba
```

### ElevenLabs

```bash
VITE_ELEVENLABS_API_KEY=***
VITE_ELEVENLABS_VOICE_ID=xxxxxxxxxxxx
```

## 唇形同步

```bash
VITE_LIPSYNC_PROVIDER=wav2lip
VITE_LIPSYNC_API_URL=https://api.example.com
```

## 应用配置

```bash
# 应用模式
VITE_APP_MODE=web              # web | desktop
VITE_APP_NAME=PanelFlow
VITE_APP_VERSION=3.0.0

# API 基础地址（用于 web，可选后端代理）
VITE_API_BASE_URL=https://api.PanelFlow.example.com

# 功能开关
VITE_FEATURE_WORKFLOW_AUTOMATION=true
VITE_FEATURE_COLLABORATION=false
VITE_FEATURE_CLOUD_SYNC=false

# 分析（可选）
VITE_GA_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

## Tauri 桌面

```bash
# Tauri 应用标识符
TAURI_APP_ID=com.PanelFlow.app

# 包标识符
TAURI_BUNDLE_ID=com.PanelFlow.app

# 签名
TAURI_SIGNING_PRIVATE_KEY=path/to/key
TAURI_SIGNING_PUBLIC_KEY=path/to/cert
```

## .env 文件

### 开发环境 (.env.development)

```bash
VITE_APP_MODE=web
VITE_ALIBABA_API_KEY=***
```

### 生产环境 (.env.production)

```bash
VITE_APP_MODE=web
VITE_ALIBABA_API_KEY=***
VITE_APP_VERSION=3.0.0
```

### .gitignore

```bash
# 切勿提交 .env 文件
.env
.env.local
.env.*.local
```

## 安全注意事项

1. **切勿将真实 API 密钥提交**到版本控制
2. **使用 .env 文件**存储敏感数据
3. **定期轮换密钥**，尤其是生产环境
4. **生产 Web 应用中使用后端代理**处理 AI 调用
5. **启用密钥限制**（IP、域名），在可用时
