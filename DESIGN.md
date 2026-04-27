# 實價登錄 SPA 設計文件

## 1. 專案概述

### 1.1 專案目標
建立一個單頁應用程式（SPA），提供台灣各地區實價登錄資料的查詢功能。

### 1.2 使用者
- 房地產研究者
- 房屋買賣雙方
- 一般民眾查詢參考價格

### 1.3 使用場景
1. 使用者查詢特定區域的實價登錄資料
2. 比較不同區域的價格差異
3. 查詢特定區間的交易紀錄
4. 查看搜尋歷史

---

## 2. 系統架構

### 2.1 架構圖

```
┌───CLIENT (Vue 3 SPA)───┐
│                         │
│ ┌─────────┐ ┌────────┐ │
│ │SearchView│ │HistoryView│ │
│ └────┬─────┘ └────┬───┘ │
│      │            │      │
│ ┌────┴────────────┴────┐ │
│ │   Pinia Store        │ │
│ │   realEstate.js      │ │
│ └────┬─────────────────┘ │
│      │                   │
│ ┌────┴─────────────────┐ │
│ │   landPrice API      │ │
│ └────┬─────────────────┘ │
└──────┼───────────────────┘
       │
       ▼
┌───SERVER (Node.js)───┐
│                      │
│ ┌────────────┐       │
│ │dataServer.js│       │
│ └──────┬─────┘       │
│        │             │
│ ┌──────┴─────┐       │
│ │lvr_data.db │       │
│ └────────────┘       │
└──────────────────────┘
```

### 2.2 通訊流程
1. 使用者在前端頁面操作
2. Pinia Store 管理狀態
3. API 層將請求發送到後端 API
4. dataServer.js 查詢 SQLite 資料庫
5. 將結果回傳給前端

---

## 3. 技術選型

### 3.1 前端技術棧
- **Vue 3** - 使用者介面框架 (Composition API + <script setup>語法
- **Vite** - 快速建構工具 (port 5173)
- **Element Plus** - UI 元件庫
- **Pinia** - 狀態管理
- **Vue Router** - 路由管理
- **Axios** - HTTP 客戶端

### 3.2 後端技術棧
- **Node.js** - 伺服器端執行環境
- **Express** - Web 框架
- **CORS** - 跨域資源共享
- **SQLite3** - 資料庫

### 3.3 開發工具
- **Vite** - 開發伺服器與建置工具
- **npm** - 套件管理

---

## 4. 模組設計

### 4.1 前端 Modules

#### App.vue (主應用程式)
- 側邊欄導航
- 頁面標題
- 路由渲染 (`<router-view>`)
- 元件：`el-container`、`el-aside`、`el-main`、`el-menu`

#### SearchView.vue (搜尋頁面)
- 搜尋表單 (縣市、行政區、交易類型、價格、坪數)
- 統計卡片
- 資料表格
- 分頁
- 最近搜尋

#### HistoryView.vue (歷史頁面)
- 搜尋歷史記錄

#### 狀態管理 (Pinia Store - realEstate.js
- 狀態：
  - `records` - 搜尋結果
  - `loading` - 載入中
  - `error` - 錯誤訊息
  - `recentSearches` - 最近搜尋
  - `pagination` - 分頁資訊 (total, page, pageSize, totalPages)
- 動作：
  - `search(params)` - 執行搜尋
  - `loadDistricts()` - 載入行政區
  - `updatePagination(page)` - 更新分頁
  - `clearResult()` - 清除結果

#### API 模組 (landPrice.js)
- `searchLandPrice(params)` - 搜尋
- `getDistricts()` - 獲取行政區
- `getHistory()` - 獲取歷史
- `getStatistics()` - 獲取統計

---

## 5. 資料庫設計

### 5.1 資料庫架構
- **資料庫** : SQLite (lvr_data.db)
- **資料表** : lvr_records

| 欄位 | 說明 |
|------|------|
| id | 主鍵 |
| city_code | 縣市代碼 |
| district | 行政區 |
| address | 地址 |
| transaction_type | 交易類型 |
| trade_date | 交易日期 |
| total_price | 總價 |
| unit_price_sqm | 單價 |
| building_area_sqm | 建物面積 |
| land_area_sqm | 土地面積 |
| room_count | 房間數 |
| bath_count | 浴室數 |
| parking_price | 車位價格 |
| source | 來源 |

### 5.2 資料規模
- **總筆數** : 50,285 筆
- **資料來源** : 內政部實價登錄
- **時間範圍** : 2023-2024 年
- **涵蓋範圍** : 台北市

---

## 6. API 規格

### 6.1 GET /api/data/cities
- **說明** : 獲取所有縣市
- **請求** : 無
- **回應** : 縣市列表 (city_code, name, count)

### 6.2 GET /api/data/distinct
- **說明** : 獲取行政區
- **請求** : city
- **回應** : 行政區列表 (districts)

### 6.3 GET /api/data/search
- **說明** : 搜尋實價登錄資料
- **請求** : city, district, minPrice, maxPrice, minArea, maxArea, page, pageSize
- **回應** : 搜尋結果 (records, total, page, totalPages)

---

## 7. 資料流

### 7.1 搜尋流程
1. 使用者輸入搜尋條件
2. 前端將條件傳遞到 Pinia Store
3. Pinia Store 調用 API 層
4. API 層將請求發送到後端
5. 後端查詢資料庫
6. 將結果回傳給前端
7. Pinia Store 更新狀態
8. 前端重新渲染

### 7.2 更新流程
- 搜尋條件：更新搜尋
- 搜尋結果：搜尋結果
- 狀態更新：更新狀態

---

## 8. 部署

### 8.1 部署環境
- **Node.js** : Node.js
- **npm** : npm
- **PM2** : pm2
- **port** : port 3002

### 8.2 PM2 設置
- **pm2.config.js** : pm2.config.js

---

## 9. 開發指南

### 9.1 開發環境建置
1. **安裝依賴** : npm install
2. **啟動開發伺服器** : npm run dev
3. **建置** : npm run build

### 9.2 開發環境
- **Node.js** : Node.js
- **npm** : npm
- **Vite** : Vite

---

## 10. 注意事項

### 10.1 限制
- **HTTPS** : HTTPS
- **HTTPS** : HTTPS
- **HTTPS** : HTTPS

### 10.2 已知問題
- **HTTPS** : HTTPS
- **HTTPS** : HTTPS
- **HTTPS** : HTTPS
