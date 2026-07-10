# Story Weaver · UI 设计系统一致性体检

> 范围：`src/styles/globals.css`、`src/app/styles/index.css`、`tailwind.config.ts`、`components.json`
> 目的：为"重构 / 升级 UI 设计系统"提供基线问题清单与修复方向
> 状态：源码体检已完成；画布设计稿（设计系统板 / 组件库 / 关键界面 / 双主题）待 Ardot 适配器连通后落地

---

## 一、严重问题（必须修）

### 1. 双全局样式并存，存在"两套真相" [高]

- `src/app/styles/index.css`：`body` 背景硬编码 `#f5f5f5`，`border-color` 硬编码 `hsl(220 9% 90%)`，字体仅系统栈。
- `src/styles/globals.css`：真正的令牌源（`--background` / `--border` 走 CSS 变量 + 暗色覆盖）。
- **风险**：两份都会在 `:root` 注入样式，后加载者覆盖前者；暗色主题若被 `index.css` 的 `#f5f5f5` 覆盖则可能"暗不下去"。新成员无从判断以谁为准。
- **修复**：删除或合并 `src/app/styles/index.css` 到 `globals.css`；全局只保留**单一令牌源**。

### 2. 配置漂移：tailwind 指向不存在的文件 [中]

- `components.json` 写 `"tailwind": { "config": "tailwind.config.js" }`，实际文件是 `tailwind.config.ts`。
- **修复**：校正值，避免工具链（shadcn CLI、CLI 生成）踩空。

---

## 二、令牌命名不统一 [中]

`globals.css` 同时定义了两套命名体系：

- 自定义语义令牌：`--color-primary` / `--color-primary-hover` / `--color-success` / `--spacing-md` / `--radius-default` ...
- shadcn 标准令牌：`--primary` / `--background` / `--card` / `--border` / `--radius` ...

`tailwind.config.ts` 又用 `primary.DEFAULT` → `var(--color-primary)` 把两者桥接起来。结果：

- 同一概念至少两种写法（`--radius-default`=10px 与 `--radius`=10px 完全重复）。
- 新人不知道该用 `var(--color-primary)` 还是 `var(--primary)`。

**建议（统一规范）**：

- 以 **shadcn 标准令牌** 为基底：`--background / --foreground / --card / --popover / --primary / --secondary / --muted / --accent / --destructive / --border / --input / --ring / --radius`。
- 自定义语义色作为**受控扩展**，统一 kebab-case + 分组前缀：`--color-primary-hover` / `--color-primary-active` / `--color-primary-soft` / `--color-success` / `-warning` / `-error` / `-info`（及其 `-soft` 浅底变体）。
- 删除 `--radius-default` 与 `--radius` 的重复，仅保留 `--radius` 作为全局默认圆角。

---

## 三、间距 / 圆角 / 阴影刻度偏多 [中]

| 维度 | 现状                                                         | 问题                                              | 建议收敛                                                            |
| ---- | ------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------- |
| 间距 | `--spacing-xs..3xl` = 4/8/12/16/20/24/32/48（自定义命名）    | 与 Tailwind 默认 4px 基准重叠但命名不同，混用易乱 | 统一用一套：要么全用 Tailwind scale，要么全用自定义但全局只用自定义 |
| 圆角 | sm6 / base8 / DEFAULT10 / lg14 / xl18 / 2xl24 + `--radius`10 | 2xl=24px 在小组件上偏大                           | 按钮/输入 8–10px，卡片 14–16px，模态 16–20px                        |
| 阴影 | xs/sm/base/md/lg/xl/card + glow/glow-lg（9 档）              | 档位过多，日常用不到                              | 收为 4–5 档：`sm / base / md / lg` + `glow`                         |

---

## 四、可访问性 [中]

- 焦点环：`outline: 2px solid var(--color-primary); offset 2px` —— 达标。
- **`--muted-foreground: rgba(100,116,139,.9)` 配 `--background:#fafafa`**：对比度约 **4.6:1**，逼近 WCAG AA 4.5 临界，小字号（12–13px）有踩线风险。
- 暗色 `--muted-foreground: rgba(148,163,184,.9)` 配 `#0f172a`：约 5.3:1，达标。
- **建议**：浅色 `muted-foreground` 提深至 `rgba(71,85,105,1)`（slate-600）以稳过 AA。

---

## 五、字体系统缺失 [中]

- 无 `--font-sans` 令牌，无字阶（type scale）定义；仅全局 `system-ui` 兜底。
- 组件各自写死字号，缺乏层级规范；中文未指定 CJK 字体栈。
- **建议**：
  - `--font-sans: "Inter", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif`
  - 字阶：12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48（px）
  - 字重：400 / 500 / 600 / 700

---

## 六、暗色主题范围可收敛 [低]

- 现有三选择器 `.dark-theme` / `.dark` / `:root.dark` 并存。
- `tailwind.config.ts` 已配 `darkMode: 'class'`，依赖 `.dark`。
- **建议**：收敛为单一 `.dark`，其余别名删除，避免选择器散落。

---

## 七、玻璃拟态 helper [低 / 已就绪]

- `--glass-bg / --glass-border / --glass-shadow` 明/暗均定义，完整。
- **注意**：使用处必须配合 `backdrop-filter: blur()` 才生效，建议在组件层统一封装 `.glass` 工具类。

---

## 八、升级版设计系统目标（重构方向）

基于以上体检，重构后的设计系统应做到：

1. **单一令牌源**：合并两份全局样式，删除配置漂移。
2. **命名规范统一**：shadcn 标准令牌为基底 + 受控语义扩展，kebab-case。
3. **刻度收敛**：间距 / 圆角 / 阴影各收一套，覆盖 95% 场景。
4. **可访问性达标**：muted-foreground 过 AA；焦点环保留。
5. **字体系统**：引入 `--font-sans` + 字阶 + 字重 + 中文 CJK 栈。
6. **暗色单一入口**：仅 `.dark`。
7. **组件库**：Button / Input / Select / Card / Dialog / Tabs / Badge / Switch / Avatar / Toast，含默认 / hover / focus / disabled 状态，明/暗双主题。

---

_下一步：Ardot 适配器连通后，在画布上落地「设计系统板 + 组件库 + 关键界面重做 + 明/暗双主题」。_
