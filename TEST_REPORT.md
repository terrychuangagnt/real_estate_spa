# 實價登錄 SPA 測試報告

## 狀態摘要

本報告整理目前 repo 內可見的測試狀態與待驗證事項。舊版文件曾標示「100% 通過」或「16/16 通過」，但那些結論不是本次修正後的最新完整驗證結果，因此不再作為目前狀態宣稱。

## 測試分類

| 分類 | 位置 | 依賴服務 | 目前說明 |
|------|------|----------|----------|
| Unit | `tests/unit/*.test.js` | 無，使用 mock | 需要重新執行 `npm test` 確認 |
| Data integrity | `tests/data-integrity/*.test.js` | `dataServer.js` on port 3002 | 需要 API server 運行 |
| Playwright E2E | `tests/e2e/*.spec.js` | Vite on 5173 + API on 3002 | `playwright.config.js` 已改為同時啟動兩個服務 |
| Python/manual scripts | `tests/data-integrity/*.py`, 根目錄測試腳本 | 視腳本而定 | 尚未納入標準 npm script |

## E2E 啟動修正

原狀況：Playwright `webServer` 只執行 `npm run dev`，因此 Vite 可以啟動，但前端透過 `/api` proxy 呼叫 API 時，`dataServer.js` 未必存在，會造成 E2E 結果不穩或失敗。

目前修正：

- `playwright.config.js` 使用 `webServer` 陣列。
- 第一個服務啟動 `node dataServer.js`，等待 `http://localhost:3002/api/cities`。
- 第二個服務啟動 `npm run dev`，等待 `http://localhost:5173`。
- E2E 測試改用 `page.goto('/')`，讓 `baseURL` 統一由 config 控制。

## 待驗證清單

1. 執行 `npm test`，記錄 unit + data integrity 的實際通過/失敗數。
2. 執行 `npx playwright test`，記錄 E2E 的實際通過/失敗數。
3. 若 E2E 失敗，優先分類是服務啟動、selector 過期、實際功能 bug 或外部地圖資源問題。
4. 若 data integrity 失敗，確認 `data/realdb/lvr_data.db` 是否存在且 schema 與 `dataServer.js` 查詢一致。
5. 檢查舊手動 UI 測試提到的問題是否仍存在：
   - 搜尋按鈕送出後欄位是否被重置。
   - 行政區下拉是否仍 disabled。
   - 地圖瓦片層是否空白。

## 待補測試

| 功能 | 建議測試 |
|------|----------|
| `getCities()` | 成功回傳、API 錯誤、非陣列 response |
| `getDistricts()` | 城市名稱/code 映射、空城市、API 錯誤 |
| `searchLandPrice()` | 價格單位轉換、坪數與房間數參數、分頁參數、錯誤 fallback |
| 搜尋頁 E2E | 選縣市、選行政區、送出查詢、結果與統計顯示 |
| 地圖 E2E | 切換地圖模式、Leaflet container、marker/heatmap control |
| 歷史頁 E2E | 搜尋後新增歷史、點擊歷史回填條件 |

## 執行指令

```bash
npm test
npx playwright test
```

更新報告時請填入實際執行日期、測試總數、通過數、失敗數與失敗原因，不要沿用舊的 100% 結論。
