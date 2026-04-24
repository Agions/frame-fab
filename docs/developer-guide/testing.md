<!--
  PlotCraft 测试 — Animated & Professional Edition
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
table { width: 100%; border-collapse: collapse; margin: 10px 0 22px; animation: fadeIn 0.8s ease-out; }
thead tr { background: linear-gradient(90deg, rgba(255,107,53,0.15), rgba(69,184,172,0.1)); }
th { padding: 10px 14px; text-align: left; font-size: 0.88em; color: #FF6B35; border-bottom: 2px solid rgba(255,107,53,0.3); font-weight: 700; }
td { padding: 9px 14px; font-size: 0.88em; color: rgba(255,255,255,0.78); border-bottom: 1px solid rgba(255,255,255,0.06); }
tr { transition: background 0.25s ease; animation: slideUp 0.4s ease-out both; }
tbody tr:hover { background: rgba(255,107,53,0.08); } tr:last-child td { border-bottom: none; }
.cmd-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin: 10px 0 20px; }
.cmd-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 14px; animation: slideUp 0.4s ease-out both; transition: transform 0.3s ease, border-color 0.3s ease; }
.cmd-card:hover { transform: translateY(-3px); border-color: rgba(255,107,53,0.35); }
.cmd-name { font-weight: 700; font-size: 0.85em; color: #FF6B35; margin-bottom: 3px; }
.cmd-desc { font-size: 0.78em; color: rgba(255,255,255,0.6); margin: 0; }
.bp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin: 10px 0 20px; }
.bp-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 14px; animation: slideUp 0.4s ease-out both; transition: border-color 0.3s ease, transform 0.3s ease; }
.bp-item:hover { border-color: rgba(255,107,53,0.35); transform: translateY(-2px); }
.bp-num { font-weight: 700; font-size: 0.85em; color: #FF6B35; margin-bottom: 3px; }
.bp-text { font-size: 0.8em; color: rgba(255,255,255,0.6); margin: 0; }
.separator { border: none; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,107,53,0.3), rgba(69,184,172,0.3), transparent); margin: 26px 0; animation: fadeIn 1s ease-out; }
.footer-section { text-align: center; padding: 22px 16px 8px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 30px; animation: fadeIn 1s ease-out; }
.footer-text { color: rgba(255,255,255,0.5); font-size: 0.85em; animation: footerGlow 3s ease-in-out infinite; }
.footer-tagline { color: rgba(255,255,255,0.35); font-size: 0.8em; margin-top: 6px; animation: breathe 4s ease-in-out infinite; }
</style>

<div class="breadcrumb">← [文档首页](https://agions.github.io/PlotCraft) · [开发指南](../developer-guide/architecture.md) · 组件 →</div>

<div class="hero-banner"><div class="hero-title">🧪 测试</div><div class="hero-subtitle">PlotCraft 中的测试实践</div></div>

## 测试结构

```
tests/
├── unit/                  # 单元测试
│   ├── services/
│   ├── utils/
│   └── components/
├── integration/           # 集成测试
│   └── workflows/
└── e2e/                   # 端到端测试
    └── specs/
```

## 运行测试

<div class="cmd-grid">
  <div class="cmd-card"><div class="cmd-name">所有测试</div><div class="cmd-desc"><code>npm test</code></div></div>
  <div class="cmd-card"><div class="cmd-name">单元测试</div><div class="cmd-desc"><code>npm run test:unit</code></div></div>
  <div class="cmd-card"><div class="cmd-name">集成测试</div><div class="cmd-desc"><code>npm run test:integration</code></div></div>
  <div class="cmd-card"><div class="cmd-name">E2E 测试</div><div class="cmd-desc"><code>npm run test:e2e</code></div></div>
  <div class="cmd-card"><div class="cmd-name">监视模式</div><div class="cmd-desc"><code>npm run test:watch</code></div></div>
  <div class="cmd-card"><div class="cmd-name">覆盖率</div><div class="cmd-desc"><code>npm run test:coverage</code></div></div>
</div>

## 单元测试

使用 Vitest + React Testing Library。

### 测试服务

```typescript
// tests/unit/services/ai.service.test.ts
import { describe, it, expect, vi } from 'vitest';
import { aiService } from '@/core/services';

describe('AIService', () => {
  it('应该生成内容', async () => {
    const result = await aiService.generate('写一个 hello world 脚本');
    expect(result).toBeDefined();
    expect(result.content).toBeTruthy();
  });

  it('应该优雅处理错误', async () => {
    vi.spyOn(aiService, 'generate').mockRejectedValueOnce(new Error('API 错误'));
    await expect(aiService.generate('test')).rejects.toThrow('API 错误');
  });
});
```

### 测试组件

```typescript
// tests/unit/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/shared/components/ui/Button';

describe('Button', () => {
  it('应该渲染文本', () => {
    render(<Button>点击我</Button>);
    expect(screen.getByText('点击我')).toBeDefined();
  });

  it('点击时应该调用 onClick', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>点击</Button>);
    fireEvent.click(screen.getByText('点击'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 集成测试

### 工作流流水线

```typescript
// tests/integration/workflows/manga-pipeline.test.ts
describe('漫画流水线', () => {
  it('应该从小说处理到视频', async () => {
    const pipeline = new MangaPipelineService();
    const result = await pipeline.processSequence([{ id: 'scene_1', description: '一个角色走进来', dialogue: '你好!' }], { skipLipSync: true });
    expect(result.status).toBe('completed');
    expect(result.videoUrl).toBeDefined();
  });
});
```

## E2E 测试

使用 Playwright 进行端到端测试。

```typescript
// tests/e2e/specs/workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('工作流', () => {
  test('应该完成完整工作流', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="import-btn"]');
    await page.fill('[data-testid="novel-input"]', '示例小说文本');
    await page.click('[data-testid="analyze-btn"]');
    await page.click('[data-testid="generate-script-btn"]');
    await expect(page.locator('[data-testid="script-preview"]')).toBeVisible();
  });
});
```

## 测试覆盖率

| 类型 | 阈值 |
|------|------|
| 语句 | 70% |
| 分支 | 65% |
| 函数 | 70% |
| 行 | 70% |

## 最佳实践

<div class="bp-grid">
  <div class="bp-item"><div class="bp-num">1. 测试行为</div><div class="bp-text">不测试实现细节</div></div>
  <div class="bp-item"><div class="bp-num">2. 有意义断言</div><div class="bp-text">使用清晰的断言</div></div>
  <div class="bp-item"><div class="bp-num">3. 隔离测试</div><div class="bp-text">测试之间无依赖</div></div>
  <div class="bp-item"><div class="bp-num">4. AAA 模式</div><div class="bp-text">Arrange-Act-Assert</div></div>
  <div class="bp-item"><div class="bp-num">5. 边界情况</div><div class="bp-text">覆盖空/null/错误</div></div>
  <div class="bp-item"><div class="bp-num">6. 快速执行</div><div class="bp-text">单元测试 < 100ms</div></div>
</div>

<hr class="separator">
<div class="footer-section"><div class="footer-text">PlotCraft 文档 · AI 驱动的专业视频脚本创作平台</div><div class="footer-tagline">_💫 将你的故事转化为专业级视频内容_</div></div>
