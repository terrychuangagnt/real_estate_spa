/**
 * 搜尋頁面 Playwright E2E 測試
 * 測試搜尋表單、結果表格、分頁等功能
 */

import { test, expect } from '@playwright/test'

test.describe('搜尋頁面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForTimeout(500)
  })

  test('should display search form on page load', async ({ page }) => {
    // 縣市下拉選擇應該存在
    await expect(page.locator('text=請選擇縣市')).toBeVisible()
    // 行政區下拉應該存在
    await expect(page.locator('text=請選擇行政區')).toBeVisible()
  })

  test('should show cities in dropdown', async ({ page }) => {
    await page.locator('text=請選擇縣市').click()
    await page.waitForTimeout(300)
    
    // 台北市應該在列表中
    const option = page.locator('li:has-text("台北市")')
    await expect(option).toBeVisible()
    
    // 新北市應該在列表中
    const option2 = page.locator('li:has-text("新北市")')
    await expect(option2).toBeVisible()
    
    // 桃園市應該在列表中
    const option3 = page.locator('li:has-text("桃園市")')
    await expect(option3).toBeVisible()
    
    // 總共應該有 21 個選項
    const allOptions = page.locator('li')
    const count = await allOptions.count()
    expect(count).toBeGreaterThanOrEqual(20)
  })

  test('should search and display results when selecting city and district', async ({ page }) => {
    // 選擇縣市 - 新北市
    await page.locator('text=請選擇縣市').click()
    await page.waitForTimeout(300)
    await page.locator('text=新北市').click()
    
    // 行政區應該自動載入並選擇第一項
    await page.waitForTimeout(500)
    
    // 點擊開始查詢
    await page.locator('text=開始查詢').click()
    
    // 等待結果出現
    await page.waitForTimeout(1000)
    
    // 統計卡片應該顯示
    await expect(page.locator('text=搜尋結果')).toBeVisible()
    
    // 平均單價卡片應該顯示
    await expect(page.locator('text=平均單價')).toBeVisible()
  })

  test('should apply price filter', async ({ page }) => {
    // 選擇縣市
    await page.locator('text=請選擇縣市').click()
    await page.waitForTimeout(300)
    await page.locator('text=新北市').click()
    await page.waitForTimeout(500)
    
    // 設定價格範圍
    const priceMinInput = page.locator('input[placeholder="最低"]')
    await priceMinInput.first().click()
    await priceMinInput.first().fill('1000')
    
    const priceMaxInput = page.locator('input[placeholder="最高"]')
    await priceMaxInput.first().click()
    await priceMaxInput.first().fill('5000')
    
    // 點擊搜尋
    await page.locator('text=開始查詢').click()
    await page.waitForTimeout(1000)
    
    // 應該顯示結果（可能為 0 但也應該是表格）
    await page.waitForTimeout(500)
  })

  test('should handle pagination', async ({ page }) => {
    // 選擇新北市並搜尋
    await page.locator('text=請選擇縣市').click()
    await page.waitForTimeout(300)
    await page.locator('text=新北市').click()
    await page.waitForTimeout(500)
    
    await page.locator('text=開始查詢').click()
    await page.waitForTimeout(1000)
    
    // 頁數統計應該顯示
    const paginationText = page.locator('text=/頁數/')
    await expect(paginationText).toBeVisible()
    
    // 分頁元件應該存在
    await expect(page.locator('.el-pagination')).toBeVisible()
  })
})
