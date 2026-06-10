# Security Policy

> frame-fab 项目的安全策略与漏洞披露流程

## Supported Versions

当前支持的安全更新版本：

| Version | Supported        |
| ------- | ---------------- |
| 3.0.x   | ✅ Active        |
| 2.4.x   | ✅ Active        |
| 2.3.x   | ⚠️ Critical only |
| < 2.3   | ❌ End of life   |

## Reporting a Vulnerability

**请勿在 GitHub Issues 公开披露安全漏洞喵～**

### 推荐流程

1. **私有披露**：通过 [GitHub Security Advisories](https://github.com/Agions/frame-fab/security/advisories/new) 提交
2. **邮件**：security@frame-fab.dev（备用渠道）
3. **包含信息**：
   - 漏洞描述与影响范围
   - 复现步骤（PoC）
   - 受影响版本
   - 建议的修复方案（可选）

### 响应时间承诺

| 阶段         | 时限             |
| ------------ | ---------------- |
| 初次确认     | 48 小时内        |
| 严重漏洞修复 | 7 天内           |
| 一般漏洞修复 | 30 天内          |
| 公开披露     | 修复发布后 90 天 |

## 安全设计原则

frame-fab 在设计层面遵循以下安全原则：

### 1. 数据本地化（Data Locality）

- ✅ **项目数据、API Key 全部本地存储**，不上传任何服务器
- ✅ 使用 Tauri `path` 白名单限制文件 I/O 范围
- ✅ localStorage 加密敏感字段（API Key）

### 2. 依赖最小化

- ✅ Rust 端无 unsafe 代码块（除必要 FFI）
- ✅ npm 依赖锁定 `pnpm-lock.yaml`，CI 验证
- ✅ 定期 `pnpm audit` 检查 CVE

### 3. 供应链安全

- ✅ Tauri 2.1 官方签名验证
- ✅ FFmpeg 子进程通过白名单 binary 路径调用
- ✅ AI Provider 请求走 HTTPS，含证书钉扎

### 4. 沙箱化（v3.1 已实施）

#### 4.1 Tauri Capability 最小化（capabilities/default.json）

✅ **已实施**：移除未使用的 plugin permission，最小化攻击面

- 移除 `clipboard-manager:*`（前端用 `navigator.clipboard` 浏览器 API，不走 plugin）
- 移除 `shell:allow-open`（前端文件选择用 `dialog` plugin，不走 shell）
- 移除 `global-shortcut:*`（快捷键由 `shortcutController` 内部 service 模拟，无需 OS 全局快捷键）
- 保留 `dialog` / `fs` / `notification` / `os`（实际使用）+ `core:window`（窗口控制必需）

#### 4.2 Content Security Policy（CSP）收紧

✅ **已实施**：`src-tauri/tauri.conf.json` 的 `app.security.csp`

```text
script-src 'self'                              # 移除 'unsafe-inline' — 主应用无 inline script
style-src  'self' 'unsafe-inline'              # 保留 — React 19 + Radix UI CSS-in-JS 必需
img-src    'self' data: blob: asset: ...       # 允许本地/资源/AI 返回图片
frame-src  'self' blob:                        # Radix portal 需要
```

- ✅ 移除 `script-src 'unsafe-inline'`（XSS 攻击面减小）
- ✅ 保留 `style-src 'unsafe-inline'`（React CSS-in-JS 必需）
- ✅ `frame-src` 添加 `blob:` 支持 Radix portal

#### 4.3 Path 遍历防御（Rust 侧）

✅ **已实施**：`src-tauri/src/utils/path_validator.rs`

- ✅ 所有路径在 canonicalize 后比较，绕过 `..` 软链接
- ✅ null byte `\0` 拒绝
- ✅ `validate_temp_path` 修复：原 `starts_with(allowed)` 因 allowed 是子目录名（相对路径）而**永远不匹配**——已用 `temp_subdir()` 拼成绝对路径后比较
- ✅ `list_app_data_files` 修复：原 `directory` 参数未验证，**`../../etc` 可遍历**——已加白名单（字母数字-下划线）+ canonicalize 二次防御

#### 4.4 IPC 调用签名校验

✅ **已实施**：所有 Tauri command 在 Rust 侧用 `validate_*` 函数校验

- `validate_project_id`：正则白名单 `^[A-Za-z0-9_-]+$`
- `validate_input_path` / `validate_output_path` / `validate_temp_path`：三层防御
- 视频命令 `analyze_video` / `extract_key_frames` 等：先验证 path，再委托 service

## 已知安全边界

### 桌面端

- ❌ **不上传用户内容** 到 frame-fab 官方服务器（无服务器）
- ⚠️ **AI Provider 调用**：由用户配置 API Key，请求直发 Provider
- ⚠️ **本地文件访问**：Tauri path 白名单限定

### 浏览器/Web 模式

- ⚠️ 部分高级功能（视频合成）需要 Tauri 桌面端
- Web 模式下 API Key 仅存于浏览器 localStorage

## 致谢

报告安全漏洞的所有贡献者将在修复发布后致谢（可选择匿名）。

感谢您帮助 frame-fab 变得安全喵～(=^･ω･^=)
