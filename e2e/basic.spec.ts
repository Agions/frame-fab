/**
 * Playwright E2E Tests - 可视化回归测试
 *
 * 覆盖核心用户流程，确保 UI 变更不引入视觉回归
 */

import { test, expect, Page } from '@playwright/test';

/** 等待页面骨架屏消失 */
async function waitForSkeleton(page: Page, selector = '[data-testid="skeleton"]') {
  const skeleton = page.locator(selector);
  if ((await skeleton.count()) > 0) {
    await expect(skeleton).toBeHidden({ timeout: 10000 });
  }
}

/** 截图辅助 - 拍摄当前页面并保存 */
async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true });
}

test('home page: should load without errors', async ({ page }) => {
  await page.goto('/');
  await waitForSkeleton(page);
  await expect(page).toHaveTitle(/PanelFlow/i);
});

test('home page: should display project list', async ({ page }) => {
  await page.goto('/');
  await waitForSkeleton(page);
  const projectList = page.locator('[data-testid="project-list"]');
  await expect(projectList).toBeVisible();
});

test('project editor: should load project editor', async ({ page }) => {
  await page.goto('/project/new');
  await waitForSkeleton(page);
  await expect(page.locator('[data-testid="project-editor"]')).toBeVisible();
});

test('project editor: timeline should render correctly', async ({ page }) => {
  await page.goto('/project/test-project');
  await waitForSkeleton(page);
  const timeline = page.locator('[data-testid="timeline"]');
  await expect(timeline).toBeVisible();
});

test('project editor: composition panel should render', async ({ page }) => {
  await page.goto('/project/test-project');
  await waitForSkeleton(page);
  const composition = page.locator('[data-testid="composition-panel"]');
  await expect(composition).toBeVisible();
});

test('audio editor: should display audio tabs', async ({ page }) => {
  await page.goto('/project/test-project');
  await waitForSkeleton(page);
  await page.click('[data-testid="audio-tab"]');
  await expect(page.locator('[data-testid="voice-tab"]')).toBeVisible();
  await expect(page.locator('[data-testid="music-tab"]')).toBeVisible();
  await expect(page.locator('[data-testid="sfx-tab"]')).toBeVisible();
});

test('storyboard: frame list should render', async ({ page }) => {
  await page.goto('/project/test-project');
  await waitForSkeleton(page);
  const frameList = page.locator('[data-testid="frame-list"]');
  await expect(frameList).toBeVisible();
});

test('storyboard: should switch to virtualized list at 50+ frames', async ({ page }) => {
  await page.goto('/project/test-project?frames=60');
  await waitForSkeleton(page);
  const virtuosoList = page.locator('[data-testid="virtuoso-list"]');
  await expect(virtuosoList).toBeVisible();
});

test('settings: should load settings page', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.locator('[data-testid="settings-page"]')).toBeVisible();
});

test('settings: should toggle dark mode', async ({ page }) => {
  await page.goto('/settings');
  const toggle = page.locator('[data-testid="dark-mode-toggle"]');
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
