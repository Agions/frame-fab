# Brand Assets v3.0

> 最后更新: 2026-06-06 · 维护者: @Agions

## 设计哲学

**frame-fab = 框(frame) × 工(fab)**

把一本小说"框"进胶片,AI 在工厂里把它们"加工"成漫剧。视觉锤围绕三个核心隐喻:

| 元素         | 含义                 | 几何                                             |
| ------------ | -------------------- | ------------------------------------------------ |
| 三帧胶片结构 | 视频/影像/时间序列   | 三块圆角矩形,中间高两侧低                        |
| 中心脉冲点   | AI 智能核心          | 双层圆 (橙环 + 白心)                             |
| 4 向脉冲线   | 神经辐射/AI 工作流   | 渐变细线,中心向四方                              |
| 渐变描边     | "从文字到视频"的转换 | 靛蓝紫 `#6366F1` → 紫 `#A855F7` → 品红 `#EC4899` |

## 配色

| 角色                 | HEX                    | 用途              |
| -------------------- | ---------------------- | ----------------- |
| `--color-primary`    | `#6366F1` (Indigo 500) | 主品牌色          |
| `--color-secondary`  | `#A855F7` (Purple 500) | 过渡              |
| `--color-accent`     | `#EC4899` (Pink 500)   | 强调 / 装饰点     |
| `--color-warning`    | `#FB923C` (Orange 400) | 状态色, AI 脉冲点 |
| `--color-error`      | `#F43F5E` (Rose 500)   | 警示              |
| `--color-surface`    | `#0B0E2C` (深空)       | Logo 底色         |
| `--color-text-muted` | `#8B92B8`              | 副文字            |

## 资产清单

### SVG (源文件,可缩放)

- `assets/logo.svg` — 主图标 256×256
- `assets/logo-horizontal.svg` — 横向 720×200 (顶部 logo)
- `assets/logo-stacked.svg` — 堆叠 320×360 (卡片/关于页)
- `assets/logo-symbol.svg` — 极简符号 64×64 (favicon/任务栏)
- `assets/logo-light.svg` — 浅色主题版
- `assets/logo-mono.svg` — 单色 (水印/打印)
- `assets/logo-wordmark.svg` — 纯文字 480×120
- `assets/logo-og.svg` — GitHub 社交卡 1280×640
- `public/favicon.svg` — 浏览器 favicon
- `public/logo.svg` / `public/logo-horizontal.svg` — 静态资源副本
- `public/og-image.svg` — OG 分享卡

### PNG (位图, 适配各场景)

- `public/favicon-{16,32,48,64,128,256,512}.png` — 7 档 favicon
- `public/og-image.png` — OG 1280×640 (供 GitHub 社交卡)
- `assets/logo-{128,256,512,1024}.png` — 4 档透明 logo
- `assets/logo-horizontal.png` — 960×267
- `assets/logo-stacked.png` — 640×720

## 使用规则

### ✅ 推荐

- 暗色背景 → 彩色 logo (主图)
- 浅色背景 → `logo-light.svg`
- 单色印刷 / 水印 → `logo-mono.svg` + `currentColor`
- 文档站顶部 → `logo-horizontal.svg`

### ❌ 避免

- 不要把 logo 拉变形 (拉伸非等比)
- 不要在 logo 上叠加滤镜 (模糊/阴影等)
- 不要替换中心橙色脉冲点
- 不要单独使用 wordmark 而不带符号 (缺乏识别度)
- 不要在 16px 以下使用 `logo-horizontal.svg` (换 `logo-symbol.svg`)

## 字体

为避免字体渲染问题,所有 SVG 内嵌**系统字体栈**:

```css
font-family:
  -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

若需要嵌入中文文案 (如 OG 卡),使用 `<text>` 元素即可,不要转曲 (path) — 保持文件可编辑。

## 重新生成 PNG

```bash
# 需要 cairosvg + pillow
pip install --break-system-packages cairosvg pillow

/usr/bin/python3 -c "
import cairosvg
cairosvg.svg2png(url='public/og-image.svg', write_to='public/og-image.png', output_width=1280, output_height=640)
"
```

## 变更日志

### v3.0 (2026-06-06)

- 🎨 全新设计: 三帧胶片 + AI 神经脉冲 + 工厂齿轮 (品牌主色: 靛蓝紫→品红渐变)
- 📦 12 个 SVG + 14 个 PNG 全套
- 🌍 适配中英文,无字体渲染问题
- 🪟 多尺寸 favicon (7 档) + 桌面图标矩阵

### v2.x (历史)

- 老版: 紫色+橙色分离式 logo, 缺乏"从文字到视频"的过渡隐喻
