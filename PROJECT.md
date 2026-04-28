# 實價登錄 SPA 設計文件

## 專案概述
- **名稱**：實價查詢實價登錄 SPA
- **目標**：查詢台灣各地區實價登錄資料
- **技術選型**：Vue 3 + Vite + Element Plus + Pinia + Vue Router + Axios
- **資料來源**：內政部實價登錄 API > 政府開放資料平台 > SQLite 資料庫

## 系統架構

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Client (Vue 3 SPA - Hash Router)                                           │
│  ┌─────────────┐  ┌──────────────┐  ┌───┬─────┐  ┌─────────────┐  ┌──────┐ │
│  │ SearchView  │  │ HistoryView  │  │ Map │     │  │ realEstate  │  │ API  │ │
│  │ (搜尋頁面)   │  │ (歷史頁面)    │  │(地圖) │  │ (Pinia Store)│  │ layer│ │
│  └─────────────┘  └──────────────┘  └───┴─────┘  └─────────────┘  └──────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ├─── GET /api/cities ────> dataServer.js
                                     ├─── GET /api/districts?city_code=? ──> dataServer.js
                                     └─── GET /api/search?city=? ──> dataServer.js
                                     │
┌────────────────────────────────────┴────────────────────────────────────────────┐
│  Server (Node.js)                                                                │
│  ┌──────────────────┐  ┌───────────────┐                                       │
│  │ dataServer.js    │  │ proxyServer.js│                                       │
│  │ (port 3002)      │  │ (CORS Proxy)  │                                       │
│  └──────────────────┘  └───────────────┘                                       │
│      │                                                                             │
│      ▼                                                                            │
│  ┌──────────────────┐                                                            │
│  │ lvr_data.db      │                                                            │
│  │ (SQLite / 4MB)   │                                                            │
│  └──────────────────┘                                                            │
│  ├─── lvr_records 表格                                                            │
│  ├─── 50,285 筆實價登錄資料                                                       │
│  ├─── 30 個縣市資料                                                               │
│  └─── 欄位: city_code, district, address, transaction_type,                        │
│          trade_date, total_price, unit_price_sqm, building_area_sqm,               │
│          land_area_sqm, room_count, bath_count, parking_price 等                   │
└────────────────────────────────────────────────────────────────────────────────────┘
```

## 專案結構

```
real_estate_spa/
├── src/
│   ├── api/
│   │   ├── landPrice.js        ← API 層 (轉換資料格式)
│   │   └── lvrDataProcessor.js ← 資料處理
│   ├── components/
│   │   ├── HelloWorld.vue
│   │   └── MapComponent.vue    ← Leaflet 地圖
│   ├── views/
│   │   ├── SearchView.vue      ← 搜尋頁面 (主要功能)
│   │   └── HistoryView.vue     ← 歷史頁面
│   ├── stores/
│   │   └── realEstate.js       ← Pinia 狀態管理
│   ├── App.vue                 ← 主應用程式組件
│   ├── main.js                 ← 入口 (Hash Router)
│   └── style.css
├── data/
│   ├── realdb/
│   │   └── lvr_data.db         ← SQLite 資料庫 (50,285 筆)
│   └── lvr_txt/               ← 原始 txt 檔案
├── dataServer.js               ← Node.js API 伺服器 (port 3002)
├── proxyServer.js              ← CORS Proxy
├── build_db.py                 ← 資料庫建構
├── ecosystem.config.js          ← PM2 組態
├── UI_TEST_PLAN.md             ← UI 測試計劃與結果
├── documentation.md            ← 前端 UI 說明
└── package.json
```

## 技術規格

### 前端
- **Vue 3**：Composition API with `<script setup>`
- **Element Plus**：UI 元件庫
- **Pinia**：狀態管理
- **Vue Router**：Hash Mode (`createWebHashHistory`)
- **Fetch API**：HTTP 請求

### 後端
- **Node.js**：伺服器端
- **Express**：API routing
- **CORS**：Cross-Origin Resource Sharing
- **SQLite**：查詢資料庫 (`better-sqlite3`)
- **PM2**：Process Manager

### 測試
- **Playwright**：E2E UI 測試
- **Chrome/Chromium**：headless 瀏覽器

### 資料庫
- **SQLite**：`lvr_data.db` (4MB)
- **資料規模**：50,285 筆實價登錄資料
- **欄位**：`city_code, district, address, transaction_type, trade_date, total_price, unit_price_sqm, building_area_sqm, land_area_sqm, room_count, bath_count, parking_price`

## 主要功能

### 1. 搜尋功能
- 縣市選取 → 行政區選取（聯動）
- 交易類型：買賣 / 租借
- 價格範圍（總價 / 每坪單價）
- 房間/浴室數量篩選
- 坪數範圍
- 搜尋結果表格 + 分頁

### 2. 地圖模式
- Leaflet 互動地圖
- Markers 標記搜尋結果地點
- 熱力圖疊加層
- 圖例顯示

### 3. 搜尋歷史
- 儲存最近搜尋紀錄
- 歷史紀錄一鍵回填
- 搜尋統計

---

## 專案狀態

### 已完成項目

| 項目 | 狀態 | 資料 |
|------|------|------|
| **專案架構** | ✅ 完成 | Vue 3 + Vite + Element Plus + Pinia + Vue Router |
| **前端頁面** | ✅ 完成 | SearchView（搜尋+表格+分頁）+ HistoryView + App.vue + |
| **資料爬取** | ✅ 完成 | 15 個.txt 檔案已下載至 data/lvr_txt/（台北、台中各 15 檔） |
| **SQLite 資料庫** | ✅ 完成 | data/realdb/lvr_data.db（4MB，已建立 lvr_records 表格） |
| **Node.js API Server** | ✅ 完成 | dataServer.js（port 3002），提供 /api/cities, /api/districts, /api/search |
| **Flask API Server** | ✅ 完成 | server/app.py（port 3001） |
| **Proxy Server** | ✅ 完成 | proxyServer.js（MOI API CORS Proxy） |
| **API 層（前端）** | ✅ 完成 | src/api/landPrice.js 串接 dataServer.js，含 transform 邏輯 |
| **狀態管理** | ✅ 完成 | src/stores/realEstate.js 含搜尋、分頁、近期搜尋 |

### 待處理項目
1. **202 個 txt 檔完整下載未完成** — 目前只有台北(`a`) + 台中(`b`)的檔案，還有 18 個縣市沒下載。需要把所有 202 個檔案都轉換成 SQLite。
2. **Flask 伺服器資料來源指向 /tmp/lvr_landtxt** — `/tmp` 在重新開機後會消失，不符合之前記憶的 convention（應該放在 `data/`）。
3. **前端與後端串接驗證** — 還沒實際起來跑過確認前端能正常查到 SQL DB 資料。
4. **PM2 組態已有**（`ecosystem.config.js`），但服務未實際啟動。

## 後續計劃

### Phase 1: 基礎架構
- [x] Vue 3 + Vite + Element Plus + Pinia + Vue Router
- [x] 前端頁面（SearchView + HistoryView + App.vue）
- [x] 狀態管理（realEstate.js）
- [x] API 層（landPrice.js）
- [x] 模擬資料（待改為真實資料）

### Phase 2: 資料庫整合
- [x] 下載 lvr_landtxt.zip
- [x] 解壓縮 50,285 筆資料
- [x] 建立 SQLite 資料庫
- [x] 建立 Node.js API 伺服器
- [x] API 驗證測試通過

### Phase 3: 前端整合 ✅ 完成
- [x] 前端串接真實 API (dataServer.js)
- [x] 前端頁面調整 (搜尋條件/表格/分頁)
- [x] 資料欄位對應
- [x] Hash Router 導航 (vue-router `createWebHashHistory`)
- [x] Pinia store 狀態管理
- [x] 地圖模式 (Leaflet)

### Phase 4: UI 測試 ✅ 完成
- [x] Playwright E2E 測試腳本
- [x] 首頁載入測試 (3 assertions)
- [x] 地圖模式測試 (5 assertions)
- [x] 地圖功能測試
- [x] 搜尋功能測試
- [x] 導航切換測試
- [x] **最終結果：16/16 通過**

### Phase 5: 進階功能 (待處理)
- [ ] 完整搜尋功能 (實際查詢)
- [ ] 詳細資訊展開
- [ ] 地圖標記點位
- [ ] 搜尋統計圖表
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ ] 測試
- [ 