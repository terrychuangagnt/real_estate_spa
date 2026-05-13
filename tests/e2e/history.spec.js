/**
 * 搜尋歷史 E2E 測試
 * 測試 SearchView -> HistoryView 的搜尋歷史功能
 */

import { test, expect } from '@playwright/test'

test.describe('搜尋歷史', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '實價查詢' })).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to history page', async ({ page }) => {
    await page.getByRole('menuitem', { name: '搜尋歷史' }).click()

    await expect(page.getByRole('heading', { name: '搜尋歷史與統計' })).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.el-card__header').filter({ hasText: '搜尋歷史' })).toBeVisible()
  })

  test('should show empty state when no search history', async ({ page }) => {
    await page.getByRole('menuitem', { name: '搜尋歷史' }).click()
    await expect(page.getByRole('heading', { name: '搜尋歷史與統計' })).toBeVisible({ timeout: 10000 })

    await expect(page.getByRole('button', { name: '清除' })).toBeVisible()
    await expect(page.getByText('尚無搜尋紀錄')).toBeVisible()
  })
})
