# 實價登錄 SPA

台灣實價查詢工具，使用 Vue 3 + Vite + Element Plus 建置前端，並以 Node.js + Express + SQLite 提供本機查詢 API。

## 目前狀態

| 模組 | 狀態 | 備註 |
|------|------|------|
| 實價查詢 | 已實作，需持續驗證 | 支援縣市、行政區、價格、坪數等條件 |
| 搜尋歷史 | 已實作，需 E2E 覆蓋 | 記錄最近搜尋條件 |
| 地圖模式 | 已實作，需 E2E 覆蓋 | Leaflet 地圖、標記、熱力圖與圖例 |
| API Server | 已實作 | `dataServer.js`，預設 `http://localhost:3002` |
| 前端 Dev Server | 已實作 | Vite，預設 `http://localhost:5173` |
| Unit / data integrity 測試 | 有既有報告 | 詳見 `TEST_REPORT.md`，不要視為最新完整驗證 |
| Playwright E2E | 已修正啟動設定 | `playwright.config.js` 會同時啟動 API server 與 Vite |

## 技術架構

```text
Vue 3 SPA (Vite, Element Plus, Pinia, Vue Router)
        |
        | /api/search, /api/cities, /api/districts
        v
Vite dev proxy
        |
        v
dataServer.js (Express, port 3002)
        |
        v
data/realdb/lvr_data.db (SQLite)
```

## 快速開始

```bash
npm install

# 若 data/realdb/lvr_data.db 不存在，先由原始 txt 重建 SQLite
python build_db.py

# 手動啟動前後端
node dataServer.js
npm run dev
```

前端預設網址：`http://localhost:5173`

API 預設網址：`http://localhost:3002`

## 測試

```bash
# 單元測試與 data integrity 測試
npm test

# Playwright E2E
npx playwright test
```

Playwright E2E 的 config 會自動啟動：

- `node dataServer.js`
- `npm run dev`

如果本機已經有相同 port 的服務，Playwright 會重用既有服務。

## 資料庫

SQLite 主檔 `data/realdb/lvr_data.db` 會由 `build_db.py` 從 `data/lvr_txt/` 重建。主 DB 檔不提交到 git；乾淨 clone 後若只看到 `lvr_data.db-shm` 或 `lvr_data.db-wal`，請先執行：

```bash
python build_db.py
```

`build_db.py` 與 `data/import_all_txt.py` 皆使用 repo 相對路徑，可在不同本機路徑下執行。

## API 端點

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/search` | GET | 搜尋實價登錄 |
| `/api/cities` | GET | 取得所有縣市 |
| `/api/districts` | GET | 取得行政區列表 |

常用查詢參數：

- `city_code`
- `district`
- `min_price` / `max_price`
- `unit_price_min` / `unit_price_max`
- `minArea` / `maxArea`
- `page` / `page_size`

## 尚未完成事項

1. 重新執行 `npm test` 與 `npx playwright test`，以最新程式碼更新測試報告。
2. 確認乾淨 clone 後可用 `python build_db.py` 重建 `data/realdb/lvr_data.db`。
3. 補上 `getCities()`、`getDistricts()`、`searchLandPrice()` 參數映射的單元測試。
4. 確認搜尋表單送出後不會重置欄位，並驗證行政區選單可互動。
5. 確認地圖頁 Leaflet tiles、marker cluster、heatmap 在本機與 CI 環境都可渲染。
6. 整理舊版 Playwright/Puppeteer 腳本，決定保留或移除。
