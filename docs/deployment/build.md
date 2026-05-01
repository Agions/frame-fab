# 构建与部署

PanelFlow 构建和部署指南。

## 构建命令

```bash
# 开发构建
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview

# Tauri 桌面应用构建
npm run tauri build
```

## Web 部署

### 静态托管

PanelFlow 可以部署到任何静态托管提供商。

#### Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 生产部署
vercel --prod
```

#### Netlify

```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 部署
netlify deploy --dir=dist --prod
```

#### GitHub Pages

```bash
# 添加到 package.json scripts
"deploy:github": "gh-pages -d dist"

# 部署
npm run deploy:github
```

### Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://backend:3000;
  }
}
```

构建和运行：

```bash
# 构建镜像
docker build -t PanelFlow:latest .

# 运行容器
docker run -p 8080:80 PanelFlow:latest
```

## 环境配置

### Web 模式 (.env)

```bash
# AI 提供商
VITE_ALIBABA_API_KEY=***
VITE_OPENAI_API_KEY=***

# 应用
VITE_APP_MODE=web
VITE_API_BASE_URL=https://api.PanelFlow.example.com
```

### 生产检查清单

- [ ] 所有 API 密钥已配置
- [ ] 构建无错误完成
- [ ] 所有路由重定向到 index.html
- [ ] CORS 头已配置（如果使用后端）
- [ ] 压缩已启用（gzip/brotli）
- [ ] CDN 已配置用于静态资源
- [ ] 分析跟踪已启用
- [ ] 错误监控已配置

## 桌面应用 (Tauri)

### 前置要求

**macOS：**
```bash
xcode-select --install
```

**Linux：**
```bash
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

**Windows：**
- 带有 C++ 工作负载的 Visual Studio Build Tools
- Rust 工具链

### 构建

```bash
# 安装依赖
npm install

# 构建 Tauri 应用
npm run tauri build

# 输出位置
# macOS: src-tauri/target/release/bundle/dmg/
# Linux: src-tauri/target/release/bundle/appimage/
# Windows: src-tauri/target/release/bundle/msi/
```

### 代码签名

**macOS：**
```bash
# 设置签名凭证
export APPLE_SIGNING_IDENTITY="Developer ID Application: Name"
export APPLE_ID="developer@example.com"
export APPLE_ID_PASSWORD="***"
```

**Windows：**
```bash
# 设置签名证书
set CODE_SIGNING_CERTIFICATE="certificate.pfx"
set CODE_SIGNING_PASSWORD="***"
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install & Build
        run: |
          npm ci
          npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 性能优化

### 构建优化

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs', 'vaul', 'sonner', 'class-variance-authority'],
        },
      },
    },
  },
});
```

### 运行时优化

- 启用按路由代码分割
- 延迟加载功能模块
- 对昂贵组件使用 `React.memo()`
- 对长列表实施虚拟化

## 监控

### 错误跟踪

```typescript
// Sentry 集成
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### 分析

```typescript
// Plausible 或类似工具
<script defer data-domain="PanelFlow.example.com" src="https://plausible.io/js/script.js"></script>
```
