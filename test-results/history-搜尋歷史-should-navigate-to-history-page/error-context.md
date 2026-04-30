# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: history.spec.js >> 搜尋歷史 >> should navigate to history page
- Location: tests/e2e/history.spec.js:14:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=搜尋歷史')
Expected: visible
Error: strict mode violation: locator('text=搜尋歷史') resolved to 3 elements:
    1) <span>搜尋歷史</span> aka getByRole('menuitem', { name: '搜尋歷史' }).locator('span')
    2) <h1>搜尋歷史與統計</h1> aka getByRole('heading', { name: '搜尋歷史與統計' })
    3) <span data-v-77e3d4bd="">…</span> aka getByRole('main').getByText('搜尋歷史', { exact: true })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=搜尋歷史')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - complementary [ref=e5]:
    - generic [ref=e6]:
      - img [ref=e8]
      - generic [ref=e10]: 實價查詢
    - menubar [ref=e11]:
      - menuitem "實價查詢" [ref=e12] [cursor=pointer]:
        - img [ref=e14]
        - generic [ref=e16]: 實價查詢
      - menuitem "搜尋歷史" [active] [ref=e17] [cursor=pointer]:
        - img [ref=e19]
        - generic [ref=e21]: 搜尋歷史
      - menuitem "地圖" [ref=e22] [cursor=pointer]:
        - img [ref=e24]
        - generic [ref=e26]: 地圖
  - main [ref=e27]:
    - heading "搜尋歷史與統計" [level=1] [ref=e29]
    - generic [ref=e30]:
      - generic [ref=e31]:
        - generic [ref=e33]:
          - generic [ref=e35]:
            - generic [ref=e36]:
              - img [ref=e38]
              - text: 搜尋歷史
            - button "清除" [ref=e42] [cursor=pointer]:
              - img [ref=e44]
              - generic [ref=e46]: 清除
          - generic [ref=e47]:
            - generic [ref=e49]:
              - table [ref=e51]:
                - rowgroup [ref=e56]:
                  - row "縣市 行政區 搜尋時間" [ref=e57]:
                    - columnheader "縣市" [ref=e58]:
                      - generic [ref=e59]: 縣市
                    - columnheader "行政區" [ref=e60]:
                      - generic [ref=e61]: 行政區
                    - columnheader "搜尋時間" [ref=e62]:
                      - generic [ref=e63]: 搜尋時間
              - generic [ref=e67]:
                - table:
                  - rowgroup
                - generic [ref=e69]: No Data
            - generic [ref=e70]:
              - img [ref=e72]
              - paragraph [ref=e89]: 尚無搜尋紀錄
        - generic [ref=e91]:
          - generic [ref=e93]:
            - img [ref=e95]
            - text: 統計資訊
          - table [ref=e100]:
            - rowgroup [ref=e101]:
              - row "總交易筆數 0" [ref=e102]:
                - cell "總交易筆數" [ref=e103]
                - cell "0" [ref=e104]:
                  - generic [ref=e106]: "0"
              - row "平均單價 0 萬元/坪" [ref=e107]:
                - cell "平均單價" [ref=e108]
                - cell "0 萬元/坪" [ref=e109]
              - row "已安裝套件 Element Plus Pinia Vue Router" [ref=e110]:
                - cell "已安裝套件" [ref=e111]
                - cell "Element Plus Pinia Vue Router" [ref=e112]:
                  - generic [ref=e114]: Element Plus
                  - generic [ref=e116]: Pinia
                  - generic [ref=e118]: Vue Router
              - row "專案狀態 開發中" [ref=e119]:
                - cell "專案狀態" [ref=e120]
                - cell "開發中" [ref=e121]:
                  - generic [ref=e123]: 開發中
      - generic [ref=e124]:
        - img [ref=e126]
        - paragraph [ref=e143]: 先搜尋一些資料來查看分佈圖表
```

# Test source

```ts
  1  | /**
  2  |  * 搜尋歷史 E2E 測試
  3  |  * 測試 SearchView -> HistoryView 的搜尋歷史功能
  4  |  */
  5  | 
  6  | import { test, expect } from '@playwright/test'
  7  | 
  8  | test.describe('搜尋歷史', () => {
  9  |   test.beforeEach(async ({ page }) => {
  10 |     await page.goto('http://localhost:5173')
  11 |     await page.waitForTimeout(500)
  12 |   })
  13 | 
  14 |   test('should navigate to history page', async ({ page }) => {
  15 |     // 點擊歷史圖示
  16 |     await page.locator('text=搜尋歷史').click()
  17 |     await page.waitForTimeout(500)
  18 |     
  19 |     // 應該可以看到歷史頁面（即使為空）
> 20 |     await expect(page.locator('text=搜尋歷史')).toBeVisible()
     |                                             ^ Error: expect(locator).toBeVisible() failed
  21 |   })
  22 | 
  23 |   test('should show empty state when no search history', async ({ page }) => {
  24 |     // 點擊歷史
  25 |     await page.locator('text=搜尋歷史').click()
  26 |     await page.waitForTimeout(500)
  27 |     
  28 |     // 應該顯示「清除」按鈕
  29 |     await expect(page.locator('text=清除')).toBeVisible()
  30 |   })
  31 | })
  32 | 
```