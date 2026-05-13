/**
 * 地圖模式 E2E 測試
 * 測試切換列表/地圖模式，驗證 Leaflet 渲染
 */

import { test, expect } from '@playwright/test'

// Leaflet 初始化為非同步，需要較長的等待時間
const LEAFLET_TIMEOUT = 15000

async function goToMap(page) {
  await page.getByRole('menuitem', { name: '地圖' }).click()
  // 等待路由切換完成（heading 從「實價查詢」變為「地圖」）
  await expect(page.getByRole('heading', { name: '地圖' })).toBeVisible({ timeout: 10000 })
  // 等待地圖容器掛載到 DOM
  await expect(page.locator('#map-container')).toBeAttached({ timeout: 10000 })
}

test.describe('地圖模式', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // 路由預設導向 /search，等待頁面穩定
    await expect(page.getByRole('heading', { name: '實價查詢' })).toBeVisible({ timeout: 10000 })
  })

  test('should switch to map mode', async ({ page }) => {
    await goToMap(page)
    // Leaflet 會在 onMounted + nextTick 後非同步建立 .leaflet-container，給予足夠時間
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: LEAFLET_TIMEOUT })
  })

  test('should display heatmap control', async ({ page }) => {
    await goToMap(page)
    // PriceLegend 元件無條件渲染（無 v-if），待地圖組件掛載後即可見
    await expect(page.locator('.map-legend')).toBeVisible({ timeout: LEAFLET_TIMEOUT })
  })
})
