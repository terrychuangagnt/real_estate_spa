#!/usr/bin/env node
/**
 * 實價登錄資料 API 伺服器 (SQLite 版)
 * 讀取本地 SQLite 資料庫 lvr_records 表 (34 columns)
 */

import sqlite3 from 'sqlite3';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const DB_PATH = '/opt/data/home/real_estate_spa/data/realdb/lvr_data.db';

// ========== DB Helpers ==========

function getDB() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
      if (err) return reject(err);
      db.run("PRAGMA busy_timeout = 5000");
      resolve(db);
    });
  });
}

function dbQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function dbGet(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// ========== Row Formatter ==========

function formatRow(row) {
  return {
    id: row.id,
    city_code: row.city_code,
    district: row.district,
    transaction_type: row.transaction_type,
    address: row.address,
    land_area_sqm: row.land_area_sqm,
    urban_zone: row.urban_zone,
    rural_zone: row.rural_zone,
    rural_allocation: row.rural_allocation,
    trade_date: row.trade_date,
    trade_bundles: row.trade_bundles,
    transfer_level: row.transfer_level,
    total_floors: row.total_floors,
    building_type: row.building_type,
    main_use: row.main_use,
    main_material: row.main_material,
    completion_date: row.completion_date,
    building_area_sqm: row.building_area_sqm,
    room_count: row.room_count,
    living_count: row.living_count,
    bath_count: row.bath_count,
    partition_info: row.partition_info,
    management_org: row.management_org,
    total_price: row.total_price,
    unit_price_sqm: row.unit_price_sqm,
    parking_type: row.parking_type,
    parking_area_sqm: row.parking_area_sqm,
    parking_price: row.parking_price,
    notes: row.notes,
    id_no: row.id_no,
    project_name: row.project_name,
    building_num: row.building_num,
    termination_info: row.termination_info,
    source: row.source,
  };
}

// ========== API Handlers ==========

async function handleAll(db) {
  const rows = await dbQuery(db, 'SELECT * FROM lvr_records');
  return { records: rows.map(formatRow), count: rows.length };
}

async function handleRecord(db, id) {
  const row = await dbGet(db, 'SELECT * FROM lvr_records WHERE id = ?', [id]);
  if (!row) return null;
  return formatRow(row);
}

async function handleCities(db) {
  const rows = await dbQuery(db, `
    SELECT city_code, COUNT(*) as count
    FROM lvr_records
    GROUP BY city_code
    ORDER BY count DESC
  `);
  // Return in frontend-compatible format
  return rows.map(r => ({
    name: getCityName(r.city_code),
    code: r.city_code,
    count: r.count
  }));
}

function getCityName(code) {
  const map = {
    'a': '台北市', 'b': '台中市', 'c': '基隆市', 'd': '台南市',
    'e': '高雄市', 'f': '新北市', 'g': '宜蘭縣', 'h': '桃園市',
    'i': '嘉義市', 'j': '新竹縣', 'k': '苗栗縣', 'm': '南投縣',
    'n': '彰化縣', 'o': '新竹市', 'p': '雲林縣', 'q': '嘉義縣',
    't': '屏東縣', 'u': '花蓮縣', 'v': '台東縣', 'w': '金門縣',
    'x': '澎湖縣'
  };
  return map[code] || code;
}

async function handleDistricts(db, cityCode) {
  const rows = await dbQuery(db, `
    SELECT DISTINCT district
    FROM lvr_records
    WHERE city_code = ? AND district != ''
    ORDER BY district
  `, [cityCode]);
  return {
    districts: rows.map(r => r.district),
    count: rows.length
  };
}

async function handleSearch(db, params) {
  const {
    city_code,
    district,
    transaction_type,
    transactionType,  // also accept camelCase variant
    min_price,
    max_price,
    unit_price_min,
    unit_price_max,
    minArea,
    maxArea,
    minRooms,
    maxRooms,
    minBathrooms,
    maxBathrooms,
    hasElevator,
    keyword,
    page = 1,
    page_size,
    pageSize = 10,
    sort_by = 'trade_date',
    sortColParam = 'trade_date',
    sortOrder = 'desc'
  } = params;

  const whereClauses = [];
  const queryParams = [];

  if (city_code && city_code !== '') {
    whereClauses.push('city_code = ?');
    queryParams.push(city_code);
  }

  if (district && district !== '') {
    whereClauses.push('district = ?');
    queryParams.push(district);
  }

  // Accept both transaction_type and transactionType
  const txType = transaction_type || transactionType || '';
  if (txType && txType !== '') {
    whereClauses.push('transaction_type = ?');
    queryParams.push(txType);
  }

  // Keyword search on address and city_code
  if (keyword && keyword !== '') {
    whereClauses.push('(address LIKE ? OR city_code = ?)');
    queryParams.push('%' + keyword + '%', keyword);
  }

  // Price in NTD
  if (min_price && min_price !== '') { whereClauses.push('total_price >= ?'); queryParams.push(parseFloat(min_price)); }
  if (max_price && max_price !== '') { whereClauses.push('total_price <= ?'); queryParams.push(parseFloat(max_price)); }

  // Unit price per sqm
  const minUnit = unit_price_min || 0;
  const maxUnit = unit_price_max || 0;
  if (minUnit && parseFloat(minUnit) > 0) { whereClauses.push('unit_price_sqm >= ?'); queryParams.push(parseFloat(minUnit)); }
  if (maxUnit && parseFloat(maxUnit) > 0) { whereClauses.push('unit_price_sqm <= ?'); queryParams.push(parseFloat(maxUnit)); }

  // Area in sqm
  if (minArea && minArea !== '') { whereClauses.push('building_area_sqm >= ?'); queryParams.push(parseFloat(minArea)); }
  if (maxArea && maxArea !== '') { whereClauses.push('building_area_sqm <= ?'); queryParams.push(parseFloat(maxArea)); }

  // Rooms
  if (minRooms && minRooms !== '') { whereClauses.push('room_count >= ?'); queryParams.push(parseInt(minRooms)); }
  if (maxRooms && maxRooms !== '') { whereClauses.push('room_count <= ?'); queryParams.push(parseInt(maxRooms)); }

  // Bathrooms
  if (minBathrooms && minBathrooms !== '') { whereClauses.push('bath_count >= ?'); queryParams.push(parseInt(minBathrooms)); }
  if (maxBathrooms && maxBathrooms !== '') { whereClauses.push('bath_count <= ?'); queryParams.push(parseInt(maxBathrooms)); }

  const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

  // Sort column
  const sortMap = {
    'tradeDate': 'trade_date',
    'totalPrice': 'total_price',
    'unitPriceSqm': 'unit_price_sqm',
    'buildingAreaSqm': 'building_area_sqm',
  };
  const sortColumn = sortMap[sort_by] || sortColParam || 'trade_date';
  const orderDir = (sortOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countSql = `SELECT COUNT(*) as total FROM lvr_records${whereClause ? ' ' : ''}${whereClause}`;
  const countRow = await dbGet(db, countSql, queryParams);
  const total = countRow.total;

  const pageNum = parseInt(page);
  const pageSizeNum = parseInt(page_size || pageSize);
  const offset = (pageNum - 1) * pageSizeNum;

  const dataSql = `SELECT * FROM lvr_records${whereClause ? ' ' : ''}${whereClause} ORDER BY ${sortColumn} ${orderDir} LIMIT ? OFFSET ?`;
  const dataParams = [...queryParams, pageSizeNum, offset];
  const rows = await dbQuery(db, dataSql, dataParams);

  return {
    total,
    page: pageNum,
    pageSize: pageSizeNum,
    totalPages: Math.ceil(total / pageSizeNum),
    records: rows
  };
}

// ========== Server ==========

async function startServer() {
  const db = await getDB();
  console.log('Database loaded:', DB_PATH);

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      if (pathname === '/api/all' && req.method === 'GET') {
        const result = await handleAll(db);
        res.writeHead(200);
        res.end(JSON.stringify(result));

      } else if (pathname.match(/^\/api\/record\/\d+$/) && req.method === 'GET') {
        const id = parseInt(pathname.split('/')[3]);
        if (isNaN(id)) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid record ID' }));
        } else {
          const result = await handleRecord(db, id);
          if (result) {
            res.writeHead(200);
            res.end(JSON.stringify(result));
          } else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Record not found' }));
          }
        }

      } else if (pathname === '/api/cities' && req.method === 'GET') {
        const result = await handleCities(db);
        res.writeHead(200);
        res.end(JSON.stringify(result));

      } else if (pathname === '/api/districts' && req.method === 'GET') {
        const cityCode = url.searchParams.get('city_code');
        if (!cityCode) {
          res.writeHead(200);
          res.end(JSON.stringify({ districts: [], count: 0 }));
          return;
        }
        const result = await handleDistricts(db, cityCode);
        res.writeHead(200);
        res.end(JSON.stringify(result));

      } else if (pathname === '/api/search' && req.method === 'GET') {
        const params = {};
        for (const [key, value] of url.searchParams.entries()) {
          params[key] = value;
        }
        const result = await handleSearch(db, params);
        res.writeHead(200);
        res.end(JSON.stringify(result));

      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } catch (err) {
      console.error('Error:', err.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  });

  const PORT = process.env.PORT || 3002;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`API Server: http://localhost:${PORT}`);
    console.log('/api/all - All records');
    console.log('/api/record/<id> - Single record');
    console.log('/api/cities - City list');
    console.log('/api/districts?city_code=X - Districts list');
    console.log('/api/search?city_code=a&district=士林區 - Search');
  });
}

startServer().catch(err => {
  console.error('Startup failed:', err);
  process.exit(1);
});
