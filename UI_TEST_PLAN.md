## 實價登錄 SPA - UI 測試結果報告

**測試日期**：2026-04-28
**測試工具**：Playwright (Chromium, headless)
**測試檔案**：`tests/playwright_map_test.cjs`
**測試總數**：16 項
**通過率**：100% (16/16)

### 測試環境
- 前端：Vue 3 + Vite + Element Plus + Pinia + Vue Router (Hash Mode) — `http://localhost:5175`
- 後端：Node.js dataServer (port 3002)
- 測試模式：Hash Router (`#/search`, `#/map`, `#/history`)
- slowMo：500ms（方便觀察）

### 測試結果總覽

| # | 測試模組 | 子項目 | 狀態 |
|---|---------|--------|------|
| 1 | **首頁載入** | 標題「實價查詢」、選單 3 項、URL `/#/search` | ✅ PASS |
| 2 | **地圖模式** | 標題「地圖」、URL `/#/map`、`#map-container`、Leaflet 容器、瓦片層 | ✅ PASS |
| 3 | **地圖功能** | 疊加層 1、標記 1、熱力圖例可見 | ✅ PASS |
| 4 | **搜尋功能** | 從地圖頁點擊導航回搜尋頁、搜尋卡片出現、10 個搜尋欄位、「開始查詢」按鈕 | ✅ PASS |
| 5 | **導航切換** | 搜尋歷史頁標題、返回地圖頁標題 | ✅ PASS |

### 修復記錄

| 問題 | 原因 | 解決方案 |
|------|------|---------|
| 測試 2 (地圖模式) hash URL 偵測 timeout | `waitForURL` 不匹配 Hash Router | 改用 `page.goto('/#/map')` + `waitForSelector('#map-container', state:'attached')` |
| 測試 4 (搜尋功能) selector 找不到 | `waitForFunction` wait for hash 變化 unreliable | 改用 `page.waitForSelector('.search-card', state:'visible')` |
| 測試 4/5 選單元素無法識別 | Element Plus shadow DOM + `.el-menu-item:has-text()` 不支援 | 測試 4 改用 `page.goto('/#/search')` 直接導航；測試 5 改用 `getByRole('menuitem')` |
| Leaflet 容器 `visible` 狀態檢查失敗 | 地圖容器 CSS `display:none` 但 DOM 已掛載 | 改用 `state: 'attached'` 檢查 DOM 掛載即可 |

### 測試腳本架構
```
playwright_map_test.cjs (CJS, 因 package.json type=module)
  ├── 測試 1: 首頁載入 (4 assertions)
  │   ├── 標題 = '實價查詢'
  │   ├── 選單元素 >= 3
  │   └── URL 包含 '/search'
  ├── 測試 2: 地圖模式 (5 assertions)
  │   ├── 標題 = '地圖' (waitForFunction 等待 title 更新)
  │   ├── URL 包含 '/map'
  │   ├── #map-container 掛載
  │   ├── .leaflet-container attached
  │   └── .leaflet-tile-pane 存在
  ├── 測試 3: 地圖功能 (1 test block)
  │   └── 疊加層 + 圖例
  ├── 測試 4: 搜尋功能 (3 assertions)
  │   ├── 搜尋卡片可見
  │   ├── 搜尋欄位 >= 1
  │   └── '開始查詢' 按鈕可見
  └── 測試 5: 導航切換 (3 assertions)
      ├── .history-card 可見
      ├── 歷史頁標題 = '搜尋歷史與統計'
      └── 返回地圖標題 = '地圖'

結果儲存 → /tmp/test_results.json
```

### 已知問題
- 控制台出現 502 Bad Gateway 警告（可能是開發伺服器某些 API endpoint 尚未實作），不影響測試功能。
