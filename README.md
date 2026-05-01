# 實價登錄 SPA

台灣實價查詢工具，整合地圖視覺化功能。基於 Vue 3 + Vite + Element Plus 開發的單頁應用程式。

## 功能特色

| 功能 | 狀態 | 說明 |
|------|------|--|--|
| 實價查詢 | ✅ 完成 | 搜尋縣市、行政區、價格、坪數等條件 |
| 搜尋歷史 | ✅ 完成 | 記錄最近 5 筆搜尋紀錄 |
| 地圖模式 | ✅ 完成 | Leaflet 地圖顯示交易標記、熱力圖、圖例 |
| 分頁查詢 | ✅ 完成 | 支援分頁顯示搜尋結果 |
| 資料統計 | ✅ 完成 | 總交易數、平均單價統計卡片 |
| UI 自動化測試 | ✅ 完成 | Playwright 測試 12 項通過 11 項 |

## 技術架構

```.
┌─── CLIENT (Vue 3 SPA) ────────────────────────┐
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ SearchView│  │HistoryView│  │ MapView   │      │
│  │ (搜尋頁面) │  │ (歷史頁面)  │  │(地圖頁面)  │      │
    24|│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘      │
    25|│        │              │              │            │
    26|│  ┌─────┴──────────────┴──────────────┴─────┐      │
    27|│  │        Pinia Store (searchStore.js)      │      │
    28|│  │   records, loading, pagination, mapMode   │      │
    29|│  └──────────────┬───────────────────────────┘      │
    30|│                 │                                  │
│  ┌──────────────┴───────────────────────────┐      │
│  │           API Layer (landPrice.js)        │      │
│  │   searchLandPrice, getDistricts, getCities │      │
│  └──────────────┬───────────────────────────┘      │
└─────────────────┼──────────────────────────────────┘
                  │ /api/search, /api/cities, /api/districts
┌─────────────────┼──────────────────────────────────┐
│                 ▼                                  │
│  ┌──────────────────────────┐                     │
│  │ dataServer.js (port 3002)│                     │
│  │ Express + SQLite         │                     │
│  └──────────────┬───────────┘                     │
│                 │                                  │
│  ┌──────────────┴───────────┐                     │
│  │ lvr_data.db (SQLite)     │                     │
│  │ 50,285 筆實價登錄資料     │                     │
│  └──────────────────────────┘                     │
└──────────────────────────────────────────────────┘
```

### 技術選型

| 分類 | 技術 |
|------|------|
| 前端框架 | Vue 3 (Composition API + `<script setup>`) |
| 建構工具 | Vite 8 |
| UI 元件庫 | Element Plus |
| 狀態管理 | Pinia |
| 路由 | Vue Router 5 |
| 地圖 | Leaflet + MarkerCluster + Heatmap |
| 後端 | Node.js + Express |
| 資料庫 | SQLite (lvr_data.db) |
| 測試 | Playwright |

## 專案結構

```
real_estate_spa/
├── src/
│   ├── api/
│   │   └── landPrice.js          ← API 層 (搜尋/縣市/行政區)
│   ├── components/
│   │   └── map/
│   │       ├── MapView.vue       ← 地圖主元件
│   │       ├── MarkerCluster.vue ← 標記集合
│   │       ├── PriceHeatmap.vue  ← 熱力圖
│   │       └── PriceLegend.vue   ← 價格圖例
│   ├── stores/
│   │   └── realEstate.js         ← Pinia 狀態管理
│   ├── views/
│   │   ├── SearchView.vue        ← 搜尋頁面
│   │   └── HistoryView.vue       ← 歷史頁面
│   ├── App.vue                   ← 主應用程式
│   ├── main.js                   ← 入口
│   └── style.css
├── data/
│   ├── realdb/
│   │   └── lvr_data.db           ← SQLite 資料庫
│   └── lvr_txt/                  ← 原始 txt 檔案
├── documentation/
│   ├── UI_TEST_REPORT.md         ← UI 測試報告
│   ├── home_page_test.png        ← 首頁截圖
│   ├── map_mode_test.png         ← 地圖模式截圖
│   ├── search_mode_test.png      ← 搜尋功能截圖
│   └── final_map_test.png        ← 導航測試截圖
├── tests/
│   └── playwright_map_test.cjs   ← Playwright 測試腳本
├── dataServer.js                 ← API 伺服器 (port 3002)
├── build_db.py                   ← 資料庫建構腳本
├── DESIGN.md                     ← 詳細設計文件
├── PROJECT.md                    ← 專案規格文件
├── UI_TEST_REPORT.md             ← UI 測試報告
├── package.json
└── README.md
```

## 快速開始

### 環境需求

- Node.js 18+
- npm 或直接使用 node 執行

### 安裝與啟動

```bash
# 安裝依賴
npm install

# 啟動開發伺服器 (Vite)
npm run dev
# → http://localhost:5173

# 啟動 API 伺服器 (SQLite)
node dataServer.js
# → port 3002
```

### 建置

```bash
npm run build
npm run preview
```

## 頁面說明

### 1. 實價查詢 (首頁)
- 縣市下拉選單
- 行政區下拉選單 (依縣市動態載入)
- 交易類型篩選
- 價格範圍篩選
- 坪數範圍篩選
- 統計卡片 (總交易數、平均單價)
- 搜尋結果表格
- 分頁

### 2. 搜尋歷史
- 顯示最近 5 筆搜尋紀錄
- 可點擊快速重新搜尋

### 3. 地圖
- Leaflet 互動式地圖
- 交易標記 (MarkerCluster 聚合)
- 熱力圖 (價格密度)
- 價格圖例

## UI 測試

```bash
# 執行 Playwright 測試
node tests/playwright_map_test.cjs
```
    164|
    165|測試結果:
    166|- ✅ 12/12 項目通過 (100%)
    167|- 涵蓋首頁、地圖、搜尋、導航
    168|
    169|詳細報告: [documentation/UI_TEST_REPORT.md](documentation/UI_TEST_REPORT.md)

## API 端點

| 端點 | 方法 | 說明 |
|------|------|--|--|
| /api/search | GET | 搜尋實價登錄 |
| /api/cities | GET | 取得所有縣市 |
| /api/districts | GET | 取得行政區列表 |

查詢參數:
- `city_code` - 縣市代碼
- `district` - 行政區
- `minPrice/maxPrice` - 總價範圍
- `unitPriceMin/unitPriceMax` - 單價範圍
- `minArea/maxArea` - 坪數範圍
- `page/pageSize` - 分頁

## 資料庫

- **檔案**: `data/realdb/lvr_data.db`
- **規模**: 50,285 筆資料
- **範圍**: 全國 21 縣市
- **主要表格**: `lvr_records`

## 開發日誌

### 2026-04-28
- ✅ 新增地圖模式 (Leaflet + MarkerCluster + Heatmap)
- ✅ Playwright UI 自動化測試 (12項測試)
- ✅ 更新專案文件

## License

MIT
