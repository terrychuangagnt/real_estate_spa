# Phase 2: 實價登錄 SPA 驗證測試報告 (更新日期: 2026-04-30)

## 📊 測試總結
目前測試狀態為：**部分通過 / 部分失敗**。

雖然自動化測試流程中遇到伺服器連接與超時問題，但透過 Playwright 的截圖功能，我們已經成功捕捉到了關鍵的錯誤現場。

| 測試案例 (Test Case) | 狀態 | 說明 | 截圖路徑 |
| :--- | :---: | :--- | :--- |
| **搜尋歷史: 應該能跳轉至歷史頁面** | ❌ | 發生 Timeout (30s)，可能為元素未出現 | `tests/screenshots/history-搜尋歷史-should-navigate-to-history-page/test-failed-1.png` |
| **搜尋歷史: 應該顯示空狀態** | ✅ | 通過 | `tests/screenshots/history-搜尋歷史-should-show-empty-state-when-no-search-history/test-finished-1.png` |
| **地圖模式: 應該能切換至地圖模式** | ❌ | 發生 `ERR_CONNECTION_REFUSED` | `tests/screenshots/map-地圖模式-should-switch-to-map-mode/test-failed-1.png` |
| **地圖模式: 應該顯示熱力圖控制項** | ❌ | 發生 `ERR_CONNECTION_REFUSED` | `tests/screenshots/map-地圖模式-should-display-heatmap-control/test-failed-1.png` |
| **搜尋頁面: 載入時應顯示搜尋表單** | ❌ | 元素未找到 (Selector: `text=請選擇縣市`) | `tests/screenshots/search-搜尋頁面-should-display-search-form-on-page-load/test-failed-1.png` |
| **搜尋頁面: 應顯示縣市下拉選單** | ❌ | 發生 `ERR_CONNECTION_REFUSED` | `tests/screenshots/search-搜尋頁面-should-show-cities-in-dropdown/test-failed-1.png` |
| **搜尋頁面: 選擇縣市與行政區後應顯示結果** | ❌ | 發生 `ERR_CONNECTION_REFUSED` | `tests/screenshots/search-搜尋頁面-should-search--81e90-selecting-city-and-district/test-failed-1.png` |
| **搜尋頁面: 應能套用價格篩選** | ❌ | 發生 `ERR_CONNECTION_REFUSED` | `tests/screenshots/search-搜尋頁面-should-apply-price-filter/test-failed-1.png` |
| **搜尋頁面: 應能處理分頁** | ❌ | 發生 `ERR_CONNECTION_REFUSED` | `tests/screenshots/search-搜尋頁面-should-handle-pagination/test-failed-1.png` |

## 🔍 錯誤分析與修復建議

### 1. 網路連接錯誤 (`ERR_CONNECTION_REFUSED`)
* **現象**：大量測試案例報告無法連接至 `http://localhost:5173`。
* **原因**：Playwright 的 `webServer` 雖然嘗試啟動 `npm run dev`，但測試腳本啟動時，伺服器尚未完全 Ready，或是伺服器在啟動過程中崩潰。
* **建議方案**：
    * 檢查 `package.json` 中的 `dev` 指令是否穩定。
    * 增加 `webServer.timeout` 或在測試前加入等待機制。
    * 確保測試環境的端口 (5173) 沒有被其他殘留程序佔用。

### 2. 元素未找到 (`TimeoutError`)
* **現象**：在 `history` 頁面發生元素找不到的情況。
* **原因**：可能是頁面渲染過慢，或 HTML 結構發生變動。
* **建議方案**：優化 `locator` 的寫法，並在操作前增加 `waitForSelector` 判斷。

---
**報告生成日期**: 2026-04-30
**狀態**: 🔴 測試失敗 (需要修正環境配置)
