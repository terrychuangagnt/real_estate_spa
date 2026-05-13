# 實價登錄 SPA 專案狀態

## 專案概述

- 名稱：實價登錄 SPA
- 目標：查詢台灣各地區實價登錄資料，並提供列表、歷史紀錄與地圖視覺化。
- 前端：Vue 3、Vite、Element Plus、Pinia、Vue Router
- 後端：Node.js、Express、SQLite
- 主要資料庫：`data/realdb/lvr_data.db`，由 `python build_db.py` 從 `data/lvr_txt/` 重建

## 系統架構

```text
Client
  SearchView / HistoryView / Map components
  Pinia store
  src/api/landPrice.js
      |
      v
Vite dev proxy (/api -> http://localhost:3002)
      |
      v
dataServer.js
  /api/cities
  /api/districts
  /api/search
      |
      v
SQLite lvr_records
```

## 已實作項目

| 項目 | 狀態 | 備註 |
|------|------|------|
| Vue SPA 架構 | 已實作 | `src/App.vue`, `src/views`, `src/stores` |
| 實價查詢 API layer | 已實作 | `src/api/landPrice.js` |
| Node API Server | 已實作 | `dataServer.js`, port 3002 |
| SQLite 資料庫 | 可重建 | 主 DB 檔不提交到 git，乾淨 clone 後執行 `python build_db.py` |
| 搜尋頁 | 已實作 | 搜尋條件、結果、統計、分頁 |
| 搜尋歷史 | 已實作 | 近期搜尋紀錄 |
| 地圖模式 | 已實作 | Leaflet 相關元件位於 `src/components/map` |
| Playwright E2E 設定 | 已修正 | 同時啟動 API server 與 Vite |

## 測試狀態

| 測試類型 | 狀態 | 備註 |
|----------|------|------|
| Unit tests | 有既有測試 | 需以目前版本重新執行確認 |
| Data integrity tests | 有既有測試 | 依賴 `http://localhost:3002` |
| Playwright E2E | 設定已修正，需重新跑完整結果 | 原本只啟動 Vite，未啟動 API server |
| 手動 UI 測試 | 有舊報告 | 舊報告包含搜尋、行政區、地圖渲染問題，需重新驗證 |

## 尚未完成事項

1. 重新執行 `npm test`，更新單元測試與資料完整性測試的真實結果。
2. 重新執行 `npx playwright test`，確認 E2E 在自動啟動 API server + Vite 後的結果。
3. 在乾淨 clone 後驗證 `python build_db.py` 可產生 `data/realdb/lvr_data.db`。
4. 釐清舊 UI 報告中的搜尋按鈕重置、行政區 disabled、地圖瓦片空白是否仍存在。
5. 補齊 API wrapper 單元測試：`getCities()`、`getDistricts()`、`searchLandPrice()` 參數映射與錯誤處理。
6. 整理 `tests/` 內舊版腳本，將正式 E2E、截圖腳本、一次性驗證腳本分層命名。
7. 若要讓 `npm run test:e2e` 同時啟動服務以外的工作流程更清楚，可考慮新增 package script，但目前未修改 `package.json`。
