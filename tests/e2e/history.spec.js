/**
 * 搜尋歷史 E2E 測試
 * 測試 SearchView -> HistoryView 的搜尋歷史功能
 */

import { test, expect } from '@playwright/test'

test.describe('搜尋歷史', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500)
  })

  test('should navigate to history page', async ({ page }) => {
    await page.getByRole('menuitem', { name: '搜尋歷史' }).click()
    
    await expect(page.getByRole('heading', { name: '搜尋歷史與統計' })).toBeVisible()
    await expect(page.getByRole('main').getByText('搜尋歷史', { exact: true })).toBeVisible()
  })

  test('should show empty state when no search history', async ({ page }) => {
    await page.getByRole('menuitem', { name: '搜尋歷史' }).click()
    
    await expect(page.getByRole('button', { name: '清除' })).toBeVisible()
    await expect(page.getByText('尚無搜尋紀錄')).toBeVisible()
  })
})
