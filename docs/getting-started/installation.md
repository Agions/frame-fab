# 安装

PanelFlow 的详细安装说明。

## 系统要求

### 最低要求
- **操作系统**：Windows 10+、macOS 10.15+、Ubuntu 20.04+
- **内存**：8GB
- **存储空间**：2GB 可用空间
- **网络**：稳定的互联网连接（用于 AI API 调用）

### 推荐配置
- **内存**：16GB+
- **显卡**：NVIDIA 6GB+ 显存 GPU（用于本地渲染加速）
- **存储空间**：SSD 10GB+ 可用空间

## 安装方法

### 方法一：Web 开发（推荐）

**macOS/Linux：**

```bash
# 1. 克隆仓库
git clone https://github.com/Agions/PanelFlow.git
cd PanelFlow

# 2. 安装 Node.js（推荐使用 nvm）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev
```

**Windows：**

```powershell
# 1. 安装 Node.js（使用 winget）
winget install OpenJS.NodeJS

# 2. 克隆仓库
git clone https://github.com/Agions/PanelFlow.git
cd PanelFlow

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev
```

应用运行在 `http://localhost:5173`。

---

### 方法二：桌面应用（Tauri 2.0）

#### 前置条件

**macOS：**

```bash
# 1. 安装 Homebrew（如果没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 使用 Homebrew 安装 Rust 编译依赖
brew install rust cmake protobuf llvm

# 3. 安装 GTK 和 WebKit 依赖
brew installwebkit2gtk python3 gtkmm3 libsoup3 adwaita-icon-theme at-spi2-core

# 4. 安装 Rust
brew install rustup-init && rustup-init
source ~/.zshrc  # 或 source ~/.bashrc
```

**Linux（Ubuntu/Debian）：**

```bash
# 1. 安装系统依赖
sudo apt update && sudo apt install -y \
  rustc \
  cargo \
  cmake \
  ninja-build \
  libgtk-3-dev \
  libwebkitgtk-6.0-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf \
  python3

# 2. 验证安装
rustc --version
cargo --version
```

**Windows：**

```powershell
# 1. 安装 Rust
# 下载 rustup-init.exe 并运行
# https://rustup.rs/

# 2. 安装 Visual Studio Build Tools
# 下载并安装 Visual Studio Build Tools 2022
# 勾选 "C++ 桌面开发" 工作负载

# 3. 验证安装
rustc --version
cargo --version
```

#### 构建桌面应用

```bash
# 1. 克隆仓库（如果还没有）
git clone https://github.com/Agions/PanelFlow.git
cd PanelFlow

# 2. 安装前端依赖
npm install

# 3. 构建 Tauri 应用
npm run tauri build
```

构建输出位于：
- **macOS**：`src-tauri/target/release/bundle/dmg/`
- **Linux**：`src-tauri/target/release/bundle/appimage/`
- **Windows**：`src-tauri/target/release/bundle/msi/`

## 依赖

### 核心依赖

| 包 | 版本 | 用途 |
|-----|------|------|
| react | ^18.2 | UI 框架 |
| react-dom | ^18.2 | DOM 渲染 |
| vite | ^4.4 | 构建工具 |
| typescript | ^5.0 | 类型安全 |
| zustand | ^4.4 | 状态管理 |
| shadcn/ui | ^0.x | UI 组件库 (Radix UI + Tailwind) |
| @tauri-apps/api | ^2.0 | 桌面集成 |
| framer-motion | ^12.10 | 动画 |

### AI 服务依赖

| 包 | 用途 |
|-----|------|
| axios | HTTP 客户端 |
| i18next | 国际化 |

## 故障排除

### 端口已被占用

```bash
# 查找并终止占用 5173 端口的进程
# macOS/Linux
lsof -i :5173
kill -9 <PID>

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### TypeScript 错误

```bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json
npm install
```

### Tauri 构建失败

```bash
# 更新 Rust
rustup update

# 验证 Rust 安装
rustc --version
cargo --version

# 重新安装 Tauri CLI
cargo install tauri-cli

# 清理构建缓存
cargo clean
npm run tauri build
```

### macOS 构建提示 "Safari 无法打开"

这是因为未正确安装 WebKit 依赖。运行：

```bash
brew installwebkit2gtk python3 gtkmm3 libsoup3
```

### Linux 构建提示缺少 libgtk

```bash
sudo apt install libgtk-3-dev
```

## 下一步

- [配置指南](./configuration.md)
- [快速入门](./quick-start.md)
