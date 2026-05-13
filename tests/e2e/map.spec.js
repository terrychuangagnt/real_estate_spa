/**
 * 地圖模式 E2E 測試
 * 測試切換列表/地圖模式，驗證 Leaflet 渲染
 */

import { test, expect } from '@playwright/test'

async function goToMap(page) {
  await page.getByRole('menuitem', { name: '地圖' }).click()
  await expect(page.getByRole('heading', { name: '地圖' })).toBeVisible()
}

test.describe('地圖模式', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '實價查詢' })).toBeVisible()
  })

  test('should switch to map mode', async ({ page }) => {
    await goToMap(page)
    await expect(page.locator('#map-container')).toBeAttached()
    await expect(page.locator('.leaflet-container')).toBeVisible()
  })

  test('should display heatmap control', async ({ page }) => {
    await goToMap(page)
    await expect(page.locator('.map-legend')).toBeVisible()
  })
})
