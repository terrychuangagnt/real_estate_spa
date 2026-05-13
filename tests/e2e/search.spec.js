/**
 * 搜尋頁面 Playwright E2E 測試
 * 測試搜尋表單、結果表格、分頁等功能
 */

import { test, expect } from '@playwright/test'

async function openCityDropdown(page) {
  await page.locator('.el-form-item').filter({ hasText: '縣市' }).locator('.el-select').click()
  const dropdown = page.locator('.el-select-dropdown:visible .el-select-dropdown__item')
  await expect(dropdown.first()).toBeVisible()
  return dropdown
}

async function selectCity(page, cityName) {
  const options = await openCityDropdown(page)
  await options.filter({ hasText: cityName }).click()
}

async function searchNewTaipei(page) {
  await selectCity(page, '新北市')
  await expect(page.getByRole('combobox', { name: '行政區' })).not.toBeDisabled({ timeout: 10000 })
  await page.getByRole('button', { name: '開始查詢' }).click()
  await expect(page.getByText('搜尋結果')).toBeVisible()
}

test.describe('搜尋頁面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '實價查詢' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: '行政區' })).not.toBeDisabled({ timeout: 10000 })
  })

  test('should display search form on page load', async ({ page }) => {
    await expect(page.getByRole('combobox', { name: '縣市' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: '行政區' })).toBeVisible()
    await expect(page.getByRole('button', { name: '開始查詢' })).toBeVisible()
  })

  test('should show cities in dropdown', async ({ page }) => {
    const options = await openCityDropdown(page)

    await expect(options.filter({ hasText: '台北市' })).toBeVisible()
    await expect(options.filter({ hasText: '新北市' })).toBeVisible()
    await expect(options.filter({ hasText: '桃園市' })).toBeVisible()

    const count = await options.count()
    expect(count).toBeGreaterThanOrEqual(20)
  })

  test('should search and display results when selecting city and district', async ({ page }) => {
    await searchNewTaipei(page)
    await expect(page.getByText('平均單價')).toBeVisible()
  })

  test('should apply price filter', async ({ page }) => {
    await selectCity(page, '新北市')

    const priceRange = page.getByRole('group', { name: '價格範圍（萬）' })
    await priceRange.getByRole('button', { name: 'increase number' }).nth(0).click()
    await priceRange.getByRole('button', { name: 'increase number' }).nth(1).click()

    await page.getByRole('button', { name: '開始查詢' }).click()
    await expect(page.locator('.el-table, .el-empty')).toBeVisible()
  })

  test('should handle pagination', async ({ page }) => {
    await searchNewTaipei(page)
    await expect(page.getByText('頁數')).toBeVisible()
    await expect(page.locator('.el-pagination')).toBeVisible()
  })
})
