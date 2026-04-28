#!/usr/bin/env node
/**
 * 實價登錄資料伺服器 (SQLite 版)
 * 讀取 lvr_data.db，提供 API 查詢服務
 * 修正：欄位名改用小寫（與 DB schema 一致）
 */

import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data', 'realdb', 'lvr_data.db');
const PORT = 3002;

const app = express();
app.use(cors());
app.use(express.json());

const CITY_MAP = {
  'a': '台北市', 'b': '台中市', 'c': '基隆市', 'd': '台南市',
  'e': '高雄市', 'f': '新北市', 'g': '宜蘭縣', 'h': '桃園市',
  'i': '嘉義市', 'j': '新竹縣', 'k': '苗栗縣', 'm': '南投縣',
  'n': '彰化縣', 'o': '新竹市', 'p': '雲林縣', 'q': '嘉義縣',
  't': '屏東縣', 'u': '花蓮縣', 'v': '臺東縣', 'w': '金門縣',
  'x': '澎湖縣'
};

function formatDate(dateStr) {
  if (!dateStr || dateStr.length < 8) return dateStr || '';
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6));
  const day = parseInt(dateStr.substring(6, 8));
  return year + '年' + String(month).padStart(2, '0') + '月' + String(day).padStart(2, '0') + '日';
}

function formatPrice(price) {
  if (price === null || price === undefined) return null;
  return Number(price).toLocaleString();
}

const db = new sqlite3.Database(DB_PATH);
db.serialize(() => {
  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA busy_timeout = 5000');
  console.log('SQLite DB loaded:', DB_PATH);
});

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// GET /api/cities (also /api/data/cities for backward compat)
app.get('/api/cities', (req, res) => {
  allQuery('SELECT city_code as code, COUNT(*) as count FROM lvr_records GROUP BY city_code ORDER BY count DESC')
    .then(rows => {
      const cities = rows.map(r => ({ code: r.code, name: CITY_MAP[r.code] || r.code, count: r.count }));
      res.json(cities);
    }).catch(err => res.status(500).json({ error: err.message }));
});

// GET /api/districts?city_code=f (also /api/data/distinct for backward compat)
app.get('/api/districts', (req, res) => {
  const city_code = req.query.city_code || req.query.city;
  if (!city_code) return res.json({ districts: [] });
  // Use LOWER() for case-insensitive match
  allQuery('SELECT DISTINCT LOWER(district) as name FROM lvr_records WHERE LOWER(city_code) = ? ORDER BY name', [city_code])
    .then(rows => {
      res.json({ districts: rows.map(r => r.name), count: rows.length });
    });
});

// GET /api/search (also /api/data/search for backward compat)
app.get('/api/search', (req, res) => {
  const {
    city_code: city, district, transaction_type: transactionType,
    min_price: totalPriceMin, max_price: totalPriceMax,
    unit_price_min: unitPriceMin, unit_price_max: unitPriceMax,
    minRooms, maxRooms: maxRoom,
    min_bathrooms: minBathrooms, max_bathrooms: maxBathrooms,
    minArea, maxArea, startDate, endDate,
    page = 1, page_size: pageSize = 10,
    sortBy = 'trade_date',
    sortOrder = 'desc'
  } = req.query;

  const validSortFields = ['trade_date', 'total_price', 'unit_price_sqm', 'land_area_sqm', 'building_area_sqm', 'id'];
  const safeSortField = validSortFields.includes(sortBy) ? sortBy : 'trade_date';
  const safeSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc';

  let where = [];
  let params = [];

  if (city && city !== 'all') { where.push('LOWER(city_code) = ?'); params.push(city); }
  if (district) { where.push('LOWER(district) = ?'); params.push(decodeURIComponent(district).toLowerCase()); }
  if (transactionType) { where.push('LOWER(transaction_type) = ?'); params.push(transactionType.toLowerCase()); }
  if (totalPriceMin) { where.push('total_price >= ?'); params.push(parseFloat(totalPriceMin)); }
  if (totalPriceMax) { where.push('total_price <= ?'); params.push(parseFloat(totalPriceMax)); }
  if (unitPriceMin) { where.push('unit_price_sqm >= ?'); params.push(parseFloat(unitPriceMin)); }
  if (unitPriceMax) { where.push('unit_price_sqm <= ?'); params.push(parseFloat(unitPriceMax)); }
  if (minArea) { where.push('(land_area_sqm + building_area_sqm) >= ?'); params.push(parseFloat(minArea)); }
  if (maxArea) { where.push('(land_area_sqm + building_area_sqm) <= ?'); params.push(parseFloat(maxArea)); }
  if (minRooms) { where.push('room_count >= ?'); params.push(parseInt(minRooms)); }
  if (maxRoom) { where.push('room_count <= ?'); params.push(parseInt(maxRoom)); }
  if (minBathrooms) { where.push('bath_count >= ?'); params.push(parseInt(minBathrooms)); }
  if (maxBathrooms) { where.push('bath_count <= ?'); params.push(parseInt(maxBathrooms)); }
  if (startDate) { where.push('trade_date >= ?'); params.push(startDate); }
  if (endDate) { where.push('trade_date <= ?'); params.push(endDate); }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  allQuery('SELECT COUNT(*) as total FROM lvr_records ' + whereClause, params)
    .then(countRows => {
      if (!countRows || countRows.length === 0 || countRows[0].total === 0) {
        res.json({ data: [], total: 0, page: parseInt(page), perPage: parseInt(pageSize), totalPages: 0 });
        return;
      }
      const totalCount = countRows[0].total;
      const pageNum = parseInt(page);
      const pageSizeNum = parseInt(pageSize);
      const offset = (pageNum - 1) * pageSizeNum;
      allQuery('SELECT * FROM lvr_records ' + whereClause + ' ORDER BY ' + safeSortField + ' ' + safeSortOrder + ' LIMIT ? OFFSET ?', [...params, pageSizeNum, offset])
        .then(rows => res.json({
          data: rows.map(r => ({
            id: r.id, city_code: r.city_code, district: r.district, transaction_type: r.transaction_type,
            address: r.address, land_area_sqm: r.land_area_sqm, urban_zone: r.urban_zone,
            trade_date: r.trade_date, trade_date_formatted: formatDate(r.trade_date),
            building_type: r.building_type, building_use: r.main_use, building_area_sqm: r.building_area_sqm,
            room_count: r.room_count, bath_count: r.bath_count,
            total_price: r.total_price, total_price_display: formatPrice(r.total_price),
            unit_price_sqm: r.unit_price_sqm, unit_price_sqm_display: formatPrice(r.unit_price_sqm),
            parking_type: r.parking_type, parking_price: r.parking_price,
            parking_price_display: formatPrice(r.parking_price),
            completion_date_formatted: formatDate(r.completion_date),
            source: r.source, project_name: r.project_name
          })),
          total: totalCount, page: pageNum, perPage: pageSizeNum, totalPages: Math.ceil(totalCount / pageSizeNum)
        }));
    });
});

app.get('/api/data/health', (req, res) => {
  allQuery('SELECT COUNT(*) as total FROM lvr_records')
    .then(rows => res.json({ status: 'ok', database: 'lvr_data.db', total_records: rows[0].total, port: PORT }));
});

app.set('json replacer', function(key, value) {
  if (value === null || value === undefined) return '';
  return String(value);
});

app.listen(PORT, () => {
  console.log('實價登錄資料伺服器(SQLite版)已啟動: http://localhost:' + PORT);
  allQuery('SELECT COUNT(*) as total FROM lvr_records').then(rows => {
    console.log('Loaded ' + rows[0].total + ' records from SQLite database');
  });
});
