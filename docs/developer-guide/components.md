<!--
  PlotCraft 组件 — Animated & Professional Edition
-->
<style>
@keyframes flowGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scanLight { 0% { left: -100%; } 100% { left: 200%; } }
@keyframes h2Underline { from { width: 0; } to { width: 60px; } }
@keyframes breathe { 0%, 100% { box-shadow: 0 0 15px rgba(255,107,53,0.3); } 50% { box-shadow: 0 0 35px rgba(255,107,53,0.7); } }
@keyframes footerGlow { 0%, 100% { text-shadow: 0 0 10px rgba(69,184,172,0.4); } 50% { text-shadow: 0 0 30px rgba(69,184,172,0.9), 0 0 60px rgba(69,184,172,0.4); } }
.breadcrumb { font-size: 0.82em; color: rgba(255,255,255,0.4); margin-bottom: 18px; animation: fadeIn 0.6s ease-out; }
.breadcrumb a { color: #45B8AC; text-decoration: none; transition: color 0.3s ease; }
.breadcrumb a:hover { color: #FF6B35; }
.hero-banner { font-family: 'Segoe UI', system-ui, sans-serif; background: linear-gradient(-45deg, #0a0a0f, #1a1a2e, #16213e, #0f3460, #1a1a2e); background-size: 400% 400%; animation: flowGradient 12s ease infinite; padding: 20px 18px; border-radius: 12px; text-align: center; margin-bottom: 28px; border: 1px solid rgba(255,107,53,0.25); position: relative; overflow: hidden; }
.hero-banner::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(255,107,53,0.05) 0%, rgba(69,184,172,0.05) 100%); pointer-events: none; }
.hero-title { font-size: 1.8em; font-weight: 800; color: #fff; margin: 0 0 6px; letter-spacing: 1px; animation: slideUp 0.6s ease-out; }
.hero-subtitle { color: rgba(255,255,255,0.7); font-size: 1em; margin: 0; animation: slideUp 0.7s ease-out 0.15s both; }
.h2-section { position: relative; margin-top: 34px; margin-bottom: 14px; font-size: 1.4em; font-weight: 700; color: #e8e8e8; padding-bottom: 8px; animation: slideUp 0.6s ease-out; }
.h2-section::after { content: ''; position: absolute; bottom: 0; left: 0; height: 3px; background: linear-gradient(90deg, #FF6B35, #45B8AC, #FF6B35); background-size: 200% 100%; animation: flowGradient 3s ease infinite, h2Underline 0.8s ease-out forwards; border-radius: 2px; }
pre { background: linear-gradient(135deg, #0d0d14, #1a1a2e); border: 1px solid rgba(255,107,53,0.2); border-radius: 10px; padding: 16px 20px; overflow-x: auto; animation: slideUp 0.6s ease-out; position: relative; }
pre::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent); animation: scanLight 6s ease-in-out infinite; pointer-events: none; border-radius: 10px; }
code { color: #e8e8e8; font-size: 0.88em; font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace; }
:not(pre) > code { background: rgba(255,107,53,0.1); padding: 2px 7px; border-radius: 4px; color: #FF6B35; }
.comp-arch { background: linear-gradient(135deg, rgba(10,10,15,0.95), rgba(22,33,62,0.9)); border: 1px solid rgba(255,107,53,0.2); border-radius: 12px; padding: 18px 22px; overflow-x: auto; margin: 10px 0 20px; animation: slideUp 0.6s ease-out; position: relative; }
.comp-arch pre { background: transparent; border: none; padding: 0; font-size: 0.82em; line-height: 1.7; color: rgba(255,255,255,0.82); }
.comp-arch::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.015), transparent); animation: scanLight 8s ease-in-out infinite; pointer-events: none; border-radius: 12px; }
.bp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin: 10px 0 20px; }
.bp-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 14px; animation: slideUp 0.4s ease-out both; transition: border-color 0.3s ease, transform 0.3s ease; }
.bp-item:hover { border-color: rgba(255,107,53,0.35); transform: translateY(-2px); }
.bp-text { font-size: 0.82em; color: rgba(255,255,255,0.6); margin: 0; }
.separator { border: none; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,107,53,0.3), rgba(69,184,172,0.3), transparent); margin: 26px 0; animation: fadeIn 1s ease-out; }
.footer-section { text-align: center; padding: 22px 16px 8px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 30px; animation: fadeIn 1s ease-out; }
.footer-text { color: rgba(255,255,255,0.5); font-size: 0.85em; animation: footerGlow 3s ease-in-out infinite; }
.footer-tagline { color: rgba(255,255,255,0.35); font-size: 0.8em; margin-top: 6px; animation: breathe 4s ease-in-out infinite; }
</style>

<div class="breadcrumb">← [文档首页](https://agions.github.io/PlotCraft) · [开发指南](../developer-guide/architecture.md) · 测试 →</div>

<div class="hero-banner"><div class="hero-title">🧩 组件</div><div class="hero-subtitle">PlotCraft 中的可复用 UI 组件</div></div>

## 组件架构

<div class="comp-arch"><pre>
<span style="color:#45B8AC">shared/components/</span>
├── <span style="color:#e8e8e8">ui/</span>                    # 基础 UI 组件 (无头组件)
│   ├── <span style="color:#e8e8e8">Button/</span>
│   ├── <span style="color:#e8e8e8">Input/</span>
│   ├── <span style="color:#e8e8e8">Select/</span>
│   ├── <span style="color:#e8e8e8">Modal/</span>
│   └── <span style="color:#e8e8e8">...</span>
│
├── <span style="color:#e8e8e8">layout/</span>                # 布局组件
│   ├── <span style="color:#e8e8e8">AppLayout/</span>
│   ├── <span style="color:#e8e8e8">PageHeader/</span>
│   ├── <span style="color:#e8e8e8">Sidebar/</span>
│   └── <span style="color:#e8e8e8">...</span>
│
├── <span style="color:#e8e8e8">common/</span>                # 通用组件
│   ├── <span style="color:#e8e8e8">FileUpload/</span>
│   ├── <span style="color:#e8e8e8">ImagePreview/</span>
│   ├── <span style="color:#e8e8e8">ProgressBar/</span>
│   └── <span style="color:#e8e8e8">...</span>
│
└── <span style="color:#e8e8e8">icons/</span>                 # 图标组件
    └── <span style="color:#e8e8e8">Icon.tsx</span>
</pre></div>

## 基础 UI 组件

基于 Ant Design 构建，保持一致性。

### Button

```typescript
import { Button } from '@/shared/components/ui/Button';

// 变体
<Button variant="primary">主要</Button>
<Button variant="secondary">次要</Button>
<Button variant="ghost">幽灵</Button>
<Button variant="danger">危险</Button>

// 尺寸
<Button size="sm">小</Button>
<Button size="md">中</Button>
<Button size="lg">大</Button>

// 状态
<Button loading>加载中</Button>
<Button disabled>禁用</Button>
```

### Input

```typescript
import { Input } from '@/shared/components/ui/Input';

<Input placeholder="输入文本..." />
<Input.TextArea rows={4} />
<Input.Password />
```

### Modal

```typescript
import { Modal } from '@/shared/components/ui/Modal';

<Modal open={isOpen} onClose={() => setIsOpen(false)} title="弹窗标题">
  弹窗内容
</Modal>
```

## 布局组件

### AppLayout

带侧边栏的主应用布局。

```typescript
import { AppLayout } from '@/shared/components/layout/AppLayout';

<AppLayout sidebar={<Navigation />} header={<Header />}>
  <PageContent />
</AppLayout>
```

## 组件模式

### 复合组件

```typescript
// Modal 是一个复合组件
<Modal open={true} onClose={handleClose}>
  <Modal.Header>标题</Modal.Header>
  <Modal.Body>内容</Modal.Body>
  <Modal.Footer>
    <Button>取消</Button>
    <Button type="primary">确认</Button>
  </Modal.Footer>
</Modal>
```

### 受控/非受控

```typescript
// 受控
const [value, setValue] = useState('');
<Input value={value} onChange={(e) => setValue(e.target.value)} />

// 非受控 (内部状态)
<Input defaultValue="初始值" />
```

## 最佳实践

<div class="bp-grid">
  <div class="bp-item"><div class="bp-text">组合优于继承</div></div>
  <div class="bp-item"><div class="bp-text">单一职责 — 每个组件做好一件事</div></div>
  <div class="bp-item"><div class="bp-text">Props 类型 — 始终定义 TypeScript 接口</div></div>
  <div class="bp-item"><div class="bp-text">记忆化 — 昂贵渲染使用 <code>React.memo()</code></div></div>
  <div class="bp-item"><div class="bp-text">可访问性 — 包含 ARIA 属性和键盘导航</div></div>
</div>

<hr class="separator">
<div class="footer-section"><div class="footer-text">PlotCraft 文档 · AI 驱动的专业视频脚本创作平台</div><div class="footer-tagline">_💫 将你的故事转化为专业级视频内容_</div></div>
