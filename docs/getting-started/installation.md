---
title: 安装指南
description: Story Weaver 安装指南 — 系统要求 + 安装步骤 + 环境配置
category: getting-started
version: '>=2.2'
---

# 安装指南

> Story Weaver 基于 Tauri 2.1 + React 19 + Vite 6 构建的桌面端应用。

---

## 系统要求

| 平台        | 最低要求                                |
| ----------- | --------------------------------------- |
| **macOS**   | 11+ (Big Sur)，Apple Silicon / Intel    |
| **Windows** | 10+ (Build 1903)，64-bit                |
| **Linux**   | Ubuntu 20.04+ / Fedora 34+ / Debian 11+ |
| **内存**    | ≥ 4 GB（推荐 8 GB）                     |
| **磁盘**    | ≥ 500 MB 可用空间                       |

## 前置依赖

Story Weaver 桌面端需要以下运行时：

```bash
# Rust (≥ 1.70)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Node.js (≥ 20)
# 推荐使用 nvm
nvm install 20
nvm use 20

# pnpm (≥ 10)
npm install -g pnpm
```

### Web 开发模式（无需 Tauri）

仅需 Node.js + pnpm 即可运行 Web 预览版：

```bash
pnpm install
pnpm dev
```

## 桌面端安装

### 1. 克隆仓库

```bash
git clone https://github.com/Agions/story-weaver.git
cd story-weaver
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发模式

```bash
# Tauri 桌面端（完整功能，含 FFmpeg 原生加速）
pnpm tauri dev

# 纯 Web 模式（预览 UI，无桌面集成）
pnpm dev
```

### 4. 构建发布版

```bash
pnpm tauri build
```

输出位于 `src-tauri/target/release/`：

- **macOS**: `.app` / `.dmg`
- **Windows**: `.msi` / `.exe`
- **Linux**: `.AppImage` / `.deb`

## 验证安装

```bash
# 检查 Rust
rustc --version

# 检查 Node
node --version

# 检查 pnpm
pnpm --version

# 运行测试
pnpm test

# 类型检查
pnpm exec tsc --noEmit
```

## 故障排除

::: warning WebView2 (Windows)
Windows 平台需要 WebView2 运行时。如缺失，安装会提示下载。
:::

::: tip FFmpeg
桌面端使用系统 FFmpeg（如已安装）。缺失时自动降级到 FFmpeg.wasm。
:::

[下一步：三步跑通 →](/getting-started/quick-start)
