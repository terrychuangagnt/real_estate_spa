# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: map.spec.js >> 地圖模式 >> should switch to map mode
- Location: tests/e2e/map.spec.js:14:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=請選擇縣市')

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
      - menuitem "搜尋歷史" [ref=e17] [cursor=pointer]:
        - img [ref=e19]
        - generic [ref=e21]: 搜尋歷史
      - menuitem "地圖" [ref=e22] [cursor=pointer]:
        - img [ref=e24]
        - generic [ref=e26]: 地圖
  - main [ref=e27]:
    - heading "實價查詢" [level=1] [ref=e29]
    - generic [ref=e31]:
      - generic [ref=e33]:
        - generic [ref=e34]:
          - generic [ref=e36]:
            - generic [ref=e37]: 縣市
            - generic [ref=e40]:
              - generic:
                - combobox "縣市" [ref=e42]
                - generic [ref=e43]: 台北市 (769)
              - img [ref=e46] [cursor=pointer]
          - generic [ref=e49]:
            - generic [ref=e50]: 行政區
            - generic [ref=e53]:
              - generic:
                - combobox "行政區" [disabled] [ref=e55]
                - generic [ref=e56]: 信義區
              - generic:
                - generic:
                  - img
          - generic [ref=e58]:
            - generic [ref=e59]: 交易類型
            - generic [ref=e62] [cursor=pointer]:
              - generic:
                - combobox "交易類型" [ref=e64]
                - generic [ref=e65]: 請選擇交易類型
              - img [ref=e68]
        - generic [ref=e70]:
          - generic [ref=e72]:
            - generic [ref=e73]: 關鍵詞
            - textbox "關鍵詞" [ref=e77]:
              - /placeholder: 輸入路名 / 門牌號碼
          - group "價格範圍（萬）" [ref=e79]:
            - generic [ref=e80]: 價格範圍（萬）
            - generic [ref=e81]:
              - generic [ref=e82]:
                - button "decrease number" [ref=e83]:
                  - img [ref=e85]
                - button "increase number" [ref=e87] [cursor=pointer]:
                  - img [ref=e89]
                - generic [ref=e92]:
                  - spinbutton: "0"
              - generic [ref=e93]: "-"
              - generic [ref=e94]:
                - button "decrease number" [ref=e95]:
                  - img [ref=e97]
                - button "increase number" [ref=e99] [cursor=pointer]:
                  - img [ref=e101]
                - generic [ref=e104]:
                  - spinbutton: "0"
          - group "每坪價格（萬/坪）" [ref=e106]:
            - generic [ref=e107]: 每坪價格（萬/坪）
            - generic [ref=e108]:
              - generic [ref=e109]:
                - button "decrease number" [ref=e110]:
                  - img [ref=e112]
                - button "increase number" [ref=e114] [cursor=pointer]:
                  - img [ref=e116]
                - generic [ref=e119]:
                  - spinbutton: "0"
              - generic [ref=e120]: "-"
              - generic [ref=e121]:
                - button "decrease number" [ref=e122]:
                  - img [ref=e124]
                - button "increase number" [ref=e126] [cursor=pointer]:
                  - img [ref=e128]
                - generic [ref=e131]:
                  - spinbutton: "0"
          - group "坪數範圍（坪）" [ref=e133]:
            - generic [ref=e134]: 坪數範圍（坪）
            - generic [ref=e135]:
              - generic [ref=e136]:
                - button "decrease number" [ref=e137]:
                  - img [ref=e139]
                - button "increase number" [ref=e141] [cursor=pointer]:
                  - img [ref=e143]
                - generic [ref=e146]:
                  - spinbutton: "0"
              - generic [ref=e147]: "-"
              - generic [ref=e148]:
                - button "decrease number" [ref=e149]:
                  - img [ref=e151]
                - button "increase number" [ref=e153] [cursor=pointer]:
                  - img [ref=e155]
                - generic [ref=e158]:
                  - spinbutton: "0"
        - generic [ref=e160]:
          - button "開始查詢" [ref=e161] [cursor=pointer]:
            - img [ref=e163]
            - generic [ref=e165]: 開始查詢
          - button "清除" [ref=e166] [cursor=pointer]:
            - img [ref=e168]
            - generic [ref=e170]: 清除
      - generic [ref=e171]:
        - img [ref=e173]
        - paragraph [ref=e190]: 請選擇「縣市」和「行政區」後按下「開始查詢」
```

# Test source

```ts
  1  | /**
  2  |  * 地圖模式 E2E 測試
  3  |  * 測試切換列表/地圖模式，驗證 Leaflet 渲染
  4  |  */
  5  | 
  6  | import { test, expect } from '@playwright/test'
  7  | 
  8  | test.describe('地圖模式', () => {
  9  |   test.beforeEach(async ({ page }) => {
  10 |     await page.goto('http://localhost:5173')
  11 |     await page.waitForTimeout(500)
  12 |   })
  13 | 
  14 |   test('should switch to map mode', async ({ page }) => {
  15 |     // 先搜尋一些資料（新北市）
> 16 |     await page.locator('text=請選擇縣市').click()
     |                                      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  17 |     await page.waitForTimeout(300)
  18 |     await page.locator('text=新北市').click()
  19 |     await page.waitForTimeout(500)
  20 |     
  21 |     await page.locator('text=開始查詢').click()
  22 |     await page.waitForTimeout(1000)
  23 |     
  24 |     // 點擊地圖圖示切換地圖模式
  25 |     const mapBtn = page.locator('.el-icon-map-location, [class*="map"], :has-text("地圖")').first()
  26 |     if (await mapBtn.isVisible().catch(() => false)) {
  27 |       await mapBtn.click()
  28 |       await page.waitForTimeout(1000)
  29 |     }
  30 |   })
  31 | 
  32 |   test('should display heatmap control', async ({ page }) => {
  33 |     // 搜尋後切換地圖
  34 |     await page.locator('text=請選擇縣市').click()
  35 |     await page.waitForTimeout(300)
  36 |     await page.locator('text=新北市').click()
  37 |     await page.waitForTimeout(500)
  38 |     
  39 |     await page.locator('text=開始查詢').click()
  40 |     await page.waitForTimeout(1000)
  41 |     
  42 |     // 地圖模式應該有熱力圖控制
  43 |     // (具體元素取決於 MapView.vue 的實現)
  44 |     await page.waitForTimeout(500)
  45 |   })
  46 | })
  47 | 
```