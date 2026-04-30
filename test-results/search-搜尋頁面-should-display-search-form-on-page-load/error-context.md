# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: search.spec.js >> 搜尋頁面 >> should display search form on page load
- Location: tests/e2e/search.spec.js:14:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=請選擇縣市')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
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
  1   | /**
  2   |  * 搜尋頁面 Playwright E2E 測試
  3   |  * 測試搜尋表單、結果表格、分頁等功能
  4   |  */
  5   | 
  6   | import { test, expect } from '@playwright/test'
  7   | 
  8   | test.describe('搜尋頁面', () => {
  9   |   test.beforeEach(async ({ page }) => {
  10  |     await page.goto('http://localhost:5173')
  11  |     await page.waitForTimeout(500)
  12  |   })
  13  | 
  14  |   test('should display search form on page load', async ({ page }) => {
  15  |     // 縣市下拉選擇應該存在
> 16  |     await expect(page.locator('text=請選擇縣市')).toBeVisible()
      |                                              ^ Error: expect(locator).toBeVisible() failed
  17  |     // 行政區下拉應該存在
  18  |     await expect(page.locator('text=請選擇行政區')).toBeVisible()
  19  |   })
  20  | 
  21  |   test('should show cities in dropdown', async ({ page }) => {
  22  |     await page.locator('text=請選擇縣市').click()
  23  |     await page.waitForTimeout(300)
  24  |     
  25  |     // 台北市應該在列表中
  26  |     const option = page.locator('li:has-text("台北市")')
  27  |     await expect(option).toBeVisible()
  28  |     
  29  |     // 新北市應該在列表中
  30  |     const option2 = page.locator('li:has-text("新北市")')
  31  |     await expect(option2).toBeVisible()
  32  |     
  33  |     // 桃園市應該在列表中
  34  |     const option3 = page.locator('li:has-text("桃園市")')
  35  |     await expect(option3).toBeVisible()
  36  |     
  37  |     // 總共應該有 21 個選項
  38  |     const allOptions = page.locator('li')
  39  |     const count = await allOptions.count()
  40  |     expect(count).toBeGreaterThanOrEqual(20)
  41  |   })
  42  | 
  43  |   test('should search and display results when selecting city and district', async ({ page }) => {
  44  |     // 選擇縣市 - 新北市
  45  |     await page.locator('text=請選擇縣市').click()
  46  |     await page.waitForTimeout(300)
  47  |     await page.locator('text=新北市').click()
  48  |     
  49  |     // 行政區應該自動載入並選擇第一項
  50  |     await page.waitForTimeout(500)
  51  |     
  52  |     // 點擊開始查詢
  53  |     await page.locator('text=開始查詢').click()
  54  |     
  55  |     // 等待結果出現
  56  |     await page.waitForTimeout(1000)
  57  |     
  58  |     // 統計卡片應該顯示
  59  |     await expect(page.locator('text=搜尋結果')).toBeVisible()
  60  |     
  61  |     // 平均單價卡片應該顯示
  62  |     await expect(page.locator('text=平均單價')).toBeVisible()
  63  |   })
  64  | 
  65  |   test('should apply price filter', async ({ page }) => {
  66  |     // 選擇縣市
  67  |     await page.locator('text=請選擇縣市').click()
  68  |     await page.waitForTimeout(300)
  69  |     await page.locator('text=新北市').click()
  70  |     await page.waitForTimeout(500)
  71  |     
  72  |     // 設定價格範圍
  73  |     const priceMinInput = page.locator('input[placeholder="最低"]')
  74  |     await priceMinInput.first().click()
  75  |     await priceMinInput.first().fill('1000')
  76  |     
  77  |     const priceMaxInput = page.locator('input[placeholder="最高"]')
  78  |     await priceMaxInput.first().click()
  79  |     await priceMaxInput.first().fill('5000')
  80  |     
  81  |     // 點擊搜尋
  82  |     await page.locator('text=開始查詢').click()
  83  |     await page.waitForTimeout(1000)
  84  |     
  85  |     // 應該顯示結果（可能為 0 但也應該是表格）
  86  |     await page.waitForTimeout(500)
  87  |   })
  88  | 
  89  |   test('should handle pagination', async ({ page }) => {
  90  |     // 選擇新北市並搜尋
  91  |     await page.locator('text=請選擇縣市').click()
  92  |     await page.waitForTimeout(300)
  93  |     await page.locator('text=新北市').click()
  94  |     await page.waitForTimeout(500)
  95  |     
  96  |     await page.locator('text=開始查詢').click()
  97  |     await page.waitForTimeout(1000)
  98  |     
  99  |     // 頁數統計應該顯示
  100 |     const paginationText = page.locator('text=/頁數/')
  101 |     await expect(paginationText).toBeVisible()
  102 |     
  103 |     // 分頁元件應該存在
  104 |     await expect(page.locator('.el-pagination')).toBeVisible()
  105 |   })
  106 | })
  107 | 
```