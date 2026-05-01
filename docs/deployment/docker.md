# Docker

PanelFlow 的 Docker 部署指南。

## 前置要求

- Docker Engine 20.10+
- Docker Compose 2.0+（可选）

## 快速开始

```bash
# 构建镜像
docker build -t PanelFlow:latest .

# 运行容器
docker run -p 8080:80 PanelFlow:latest

# 访问 http://localhost:8080
```

## Docker Compose

### 基本配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  PanelFlow:
    build: .
    ports:
      - "8080:80"
    environment:
      - VITE_APP_MODE=web
    restart: unless-stopped
```

### 带后端代理

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - api

  api:
    image: node:20-alpine
    working_dir: /app
    command: node server.js
    ports:
      - "3000:3000"
    environment:
      - ALIBABA_API_KEY=${ALIB...KEY}
    restart: unless-stopped
```

### 带数据库

```yaml
version: '3.8'

services:
  PanelFlow:
    build: .
    ports:
      - "80:80"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://user:***@postgres:5432/PanelFlow

  postgres:
    image: postgres:15-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=***
      - POSTGRES_DB=PanelFlow

volumes:
  pgdata:
```

## 多阶段构建

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制包文件
COPY package*.json ./
RUN npm ci

# 复制源码并构建
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine AS production

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Nginx 配置

```nginx
# nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # 缓存静态资源
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 代理 API 请求（可选）
    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 环境变量

### 构建时变量

```dockerfile
# 使用自定义 API 密钥构建
ARG ALIBABA_API_KEY
ENV VITE_ALIBABA_API_KEY=***
```

构建：
```bash
docker build --build-arg ALIBABA_API_KEY=*** -t PanelFlow:latest .
```

### 运行时变量

```bash
# 使用环境文件运行
docker run -p 8080:80 --env-file .env PanelFlow:latest

# 或者内联
docker run -p 8080:80 \
  -e VITE_ALIBABA_API_KEY=*** \
  -e VITE_APP_MODE=web \
  PanelFlow:latest
```

## 数据卷

```bash
# 挂载数据卷以持久化数据
docker run -p 8080:80 \
  -v PanelFlow_data:/app/data \
  PanelFlow:latest
```

## 健康检查

```dockerfile
# 添加健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
```

## Docker Hub

### 推送到 Hub

```bash
# 打标签
docker tag PanelFlow:latest username/PanelFlow:latest

# 推送
docker push username/PanelFlow:latest
```

### 拉取和运行

```bash
docker pull username/PanelFlow:latest
docker run -p 8080:80 username/PanelFlow:latest
```

## Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: PanelFlow
spec:
  replicas: 3
  selector:
    matchLabels:
      app: PanelFlow
  template:
    metadata:
      labels:
        app: PanelFlow
    spec:
      containers:
        - name: PanelFlow
          image: username/PanelFlow:latest
          ports:
            - containerPort: 80
          resources:
            limits:
              cpu: "1"
              memory: "512Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: PanelFlow
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 80
  selector:
    app: PanelFlow
```

## 故障排除

### 容器无法启动

```bash
# 查看日志
docker logs <container_id>

# 查看配置
docker inspect <container_id>
```

### 构建失败

```bash
# 无缓存构建
docker build --no-cache -t PanelFlow:latest .

# 检查构建参数
docker build --build-arg DEBUG=1 -t PanelFlow:latest .
```

### 端口已被占用

```bash
# 查找占用 80 端口的进程
lsof -i :80

# 使用不同端口
docker run -p 8080:80 PanelFlow:latest
```
