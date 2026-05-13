# UI / E2E 測試計畫

## 目的

驗證使用者主要流程是否可用，並確保 Playwright 測試環境同時具備前端 Vite server 與後端 API server。

## 測試環境

| 服務 | 指令 | URL |
|------|------|-----|
| API server | `node dataServer.js` | `http://localhost:3002` |
| Vite dev server | `npm run dev` | `http://localhost:5173` |

`playwright.config.js` 已設定 `webServer` 陣列，執行 `npx playwright test` 時會自動啟動上述兩個服務。

## 測試範圍

| 流程 | 測試重點 | 對應檔案 |
|------|----------|----------|
| 搜尋頁載入 | 預設表單、縣市與行政區欄位可見 | `tests/e2e/search.spec.js` |
| 縣市選單 | 可開啟選單，主要縣市出現 | `tests/e2e/search.spec.js` |
| 搜尋送出 | 選縣市後查詢，顯示搜尋結果與統計 | `tests/e2e/search.spec.js` |
| 價格篩選 | 輸入價格範圍後可送出 | `tests/e2e/search.spec.js` |
| 分頁 | 搜尋結果出現分頁資訊與元件 | `tests/e2e/search.spec.js` |
| 地圖模式 | 搜尋後可切換或顯示地圖相關 UI | `tests/e2e/map.spec.js` |
| 搜尋歷史 | 可進入歷史頁，空狀態/清除功能可見 | `tests/e2e/history.spec.js` |

## 執行方式

```bash
npx playwright test
```

產出的 HTML report 會寫入 `playwright-report/`。

## 驗收標準

1. 測試啟動時不需要手動先開 API server。
2. Playwright report 內不得出現 `/api` proxy 連線失敗造成的測試失敗。
3. 若測試失敗，需能從 trace 或 error-context 判斷是 selector 過期、功能 bug、資料問題或外部資源問題。
4. 文件只記錄已實際執行過的結果，不沿用舊的 100% 通過敘述。

## 已知風險

1. Element Plus 下拉選單 DOM 結構可能讓 `text=` selector 不穩，必要時應改用 role、placeholder 或 `.el-select-dropdown` 範圍內定位。
2. Leaflet tiles 可能受網路或外部圖資服務影響，E2E 應優先驗證容器與本地控制項，視需求再驗證瓦片像素。
3. 搜尋結果依 SQLite 資料內容而定，測試應避免假設固定總筆數。
4. 舊版 `tests/playwright_map_test.cjs` 使用 `http://localhost:5175`，與目前正式 Playwright config 不一致，需整理用途。

## 下一步

1. 重新跑完整 E2E 並更新實際結果。
2. 將不穩定 selector 改成更貼近使用者語意的定位方式。
3. 把正式測試與一次性截圖/驗證腳本分開命名或移至文件說明。
