/**
 * 搜尋歷史 E2E 測試
 * 測試 SearchView -> HistoryView 的搜尋歷史功能
 */

import { test, expect } from '@playwright/test'

test.describe('搜尋歷史', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(500)
  })

  test('should navigate to history page', async ({ page }) => {
    // 點擊歷史圖示
    await page.locator('text=搜尋歷史').click()
    await page.waitForTimeout(500)
    
    // 應該可以看到歷史頁面（即使為空）
    await expect(page.locator('text=搜尋歷史')).toBeVisible()
  })

  test('should show empty state when no search history', async ({ page }) => {
    // 點擊歷史
    await page.locator('text=搜尋歷史').click()
    await page.waitForTimeout(500)
    
    // 應該顯示「清除」按鈕
    await expect(page.locator('text=清除')).toBeVisible()
  })
})
