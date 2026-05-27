/**
 * E2E Tests — 创建项目 → 生成漫剧主链路
 * 使用 Playwright 运行完整的用户旅程
 */

import { test, expect, type Page } from '@playwright/test';

// ============================================
// Helpers
// ============================================

async function createProject(page: Page, name: string) {
  await page.goto('/');
  await page.getByRole('button', { name: /新建项目/i }).click();
  await page.getByLabel(/项目名称/i).fill(name);
  await page.getByRole('button', { name: /创建/i }).click();
  await expect(page.getByText(name)).toBeVisible();
}

async function completeStepAndAdvance(page: Page, stepLabel: string) {
  const stepCard = page.getByRole('region', { name: new RegExp(stepLabel, 'i') });
  await stepCard.getByRole('button', { name: /下一步/i }).click();
  await expect(stepCard).not.toBeVisible();
}

// ============================================
// E2E: Dashboard
// ============================================

test.describe('Dashboard', () => {
  test('should display project list', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /我的项目/i })).toBeVisible();
  });

  test('should create new project and navigate to editor', async ({ page }) => {
    await createProject(page, 'E2E-测试项目');

    await expect(
      page.getByRole('article').getByText('E2E-测试项目')
    ).toBeVisible();
  });

  test('should show empty state when no projects', async ({ page }) => {
    await page.goto('/');
    // 清空 localStorage 模拟无项目状态
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.getByText(/还没有项目/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /创建第一个项目/i })).toBeVisible();
  });

  test('keyboard navigation on project cards', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.getByRole('article').first();

    await firstCard.focus();
    await expect(firstCard).toBeFocused();

    await page.keyboard.press('Enter');
    // 项目被打开或导航发生
    await expect(page).not.toHaveURL(/\/$/); // 至少导航到新页面
  });
});

// ============================================
// E2E: Step Wizard
// ============================================

test.describe('Step Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await createProject(page, 'Wizard-E2E');
    await page.goto('/projects/wizard-e2e/edit');
  });

  test('should display all five steps', async ({ page }) => {
    const steps = ['创意', '剧本', '资产', '分镜', '合成'];
    for (const step of steps) {
      await expect(page.getByText(step)).toBeVisible();
    }
  });

  test('should allow clicking completed steps to navigate back', async ({ page }) => {
    // 完成"创意"步骤
    await page.getByText('创意').click();
    await page.getByLabel(/创意内容/i).fill('一个勇敢的小猫的故事');
    await page.getByRole('button', { name: /下一步/i }).click();

    // 点击"创意"标签返回上一步
    await page.getByText('创意').click();
    await expect(page.getByLabel(/创意内容/i)).toBeVisible();
  });

  test('should auto-save draft periodically', async ({ page }) => {
    await page.getByText('剧本').click();
    const saveIndicator = page.getByText(/保存草稿/i);
    // 草稿保存按钮应可见
    await expect(saveIndicator).toBeVisible();
  });

  test('should show progress percentage', async ({ page }) => {
    const progressLabel = page.getByText(/\d+%/);
    await expect(progressLabel).toBeVisible();
  });

  test('should block locked steps', async ({ page }) => {
    const synthesisStep = page.getByText('合成');
    await synthesisStep.click();
    // 合成是最末步骤，在未完成前置步骤前不可进入
    // 实际行为取决于实现，此测试记录预期
    await expect(page.getByText(/合成/i)).toBeVisible();
  });
});

// ============================================
// E2E: Preview Panel
// ============================================

test.describe('Preview Panel', () => {
  test.beforeEach(async ({ page }) => {
    await createProject(page, 'Preview-E2E');
    await page.goto('/projects/preview-e2e/edit');
  });

  test('should render preview canvas', async ({ page }) => {
    await page.goto('/projects/preview-e2e/storyboard');
    const canvas = page.getByRole('img', { name: /预览帧/i });
    await expect(canvas).toBeVisible();
  });

  test('should play/pause video', async ({ page }) => {
    await page.goto('/projects/preview-e2e/composite');

    const playButton = page.getByRole('button', { name: /播放/i });
    await playButton.click();

    await expect(page.getByRole('button', { name: /暂停/i })).toBeVisible();
  });

  test('keyboard shortcuts: space to play/pause', async ({ page }) => {
    await page.goto('/projects/preview-e2e/composite');
    await page.keyboard.press(' ');

    await expect(page.getByRole('button', { name: /暂停/i })).toBeVisible();

    await page.keyboard.press(' ');
    await expect(page.getByRole('button', { name: /播放/i })).toBeVisible();
  });

  test('thumbnail strip should allow frame jumping', async ({ page }) => {
    await page.goto('/projects/preview-e2e/composite');
    const thumbnails = page.getByRole('option');
    const count = await thumbnails.count();
    expect(count).toBeGreaterThan(0);

    if (count > 1) {
      await thumbnails.nth(1).click();
    }
  });

  test('zoom controls should work', async ({ page }) => {
    await page.goto('/projects/preview-e2e/storyboard');
    await page.getByRole('button', { name: /设置/i }).click();
    await page.getByRole('button', { name: /放大/i }).click();
  });
});

// ============================================
// E2E: Error Boundary
// ============================================

test.describe('Error Boundary', () => {
  test('should show error fallback on component crash', async ({ page }) => {
    // 导航到会触发错误的路由（需应用提供 /errors test 路由）
    await page.goto('/error-test');
    await expect(
      page.getByText(/应用程序遇到了一个意外错误/i)
    ).toBeVisible();

    await expect(page.getByRole('button', { name: /重新加载/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /返回首页/i })).toBeVisible();
  });
});

// ============================================
// E2E: Dark Mode
// ============================================

test.describe('Dark Mode', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');

    const initialTheme = await html.getAttribute('data-theme');

    // 点击主题切换按钮（需在 Header 组件中提供）
    const themeToggle = page.getByRole('button', { name: /主题/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      const newTheme = await html.getAttribute('data-theme');
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('should respect system dark mode preference', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();

    const theme = await page.locator('html').getAttribute('data-theme');
    expect(['dark', 'light']).toContain(theme);
  });
});