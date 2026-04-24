#!/usr/bin/env node
/**
 * 實價登錄資料 API 伺服器 (SQLite 版)
 * 讀取 /tmp/lvr_landdata.db，提供 REST API。
 */

import sqlite3 from 'sqlite3';
import { createServer } from 'http';

const DB_PATH = '/tmp/lvr_landdata.db';

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
    city: row.city,
    district: row.district,
    propertyType: row.transaction_type,
    address: row.address,
    landArea: row.land_area,
    zoning: row.zoning,
    tradeDate: row.transaction_date,
    tradeDateISO: row.transaction_date_iso,
    totalFloors: row.total_floors,
    buildingType: row.building_type,
    buildingUse: row.building_use,
    buildingMaterial: row.building_material,
    buildingArea: row.building_area,
    rooms: row.rooms,
    halls: row.halls,
    bathrooms: row.bathrooms,
    interior: row.interior,
    hasManagement: row.has_management,
    totalPrice: row.total_price,
    totalPriceDisplay: row.total_price ? row.total_price.toLocaleString() : '-',
    unitPrice: row.unit_price,
    unitPriceDisplay: row.unit_price ? row.unit_price.toFixed(0).toLocaleString() : '-',
    parkingType: row.parking_type,
    parkingArea: row.parking_area,
    parkingPrice: row.parking_price,
    parkingPriceDisplay: row.parking_price ? row.parking_price.toLocaleString() : '-',
    hasParking: row.parking_type && row.parking_type !== '無' ? true : false,
    hasElevator: row.has_elevator ? '有' : '無',
    sourceFile: row.source_file,
  };
}

function formatRows(rows) {
  return rows.map(formatRow);
}

// ========== API Handlers ==========

async function handleCities(db) {
  const rows = await dbQuery(db, `
    SELECT city, COUNT(*) as count
    FROM lvr_records
    GROUP BY city
    ORDER BY count DESC
  `);
  return { cities: rows };
}

async function handleDistricts(db, city) {
  const rows = await dbQuery(db, `
    SELECT DISTINCT district
    FROM lvr_records
    WHERE city = ? AND district != ''
    ORDER BY district
  `, [city]);
  return {
    districts: rows.map(r => r.district),
    count: rows.length
  };
}

async function handleSearch(db, params) {
  const {
    city, district, propertyType,
    minPrice, maxPrice, minPriceUnit, maxPriceUnit,
    minArea, maxArea, minRooms, maxRooms,
    minHalls, maxHalls, minBathrooms, maxBathrooms,
    hasElevator, page = 1, pageSize = 2, sortBy = 'tradeDate', sortOrder = 'desc'
  } = params;

  const whereClauses = [];
  const queryParams = [];

  // City filter
  if (city && city !== '全台灣') {
    whereClauses.push('city = ?');
    queryParams.push(city);
  }

  // District
  if (district && district !== '所有區') {
    whereClauses.push('district = ?');
    queryParams.push(district);
  }

  // Property type
  if (propertyType && propertyType !== '所有類型') {
    if (propertyType === '買賣') {
      whereClauses.push("transaction_type = ? OR transaction_type LIKE ?", ['交易類型：買賣', '%預售%']);
      queryParams.push('交易類型：買賣', '%預售%');
    } else if (propertyType === '預售') {
      whereClauses.push('transaction_type LIKE ?', ['%預售%']);
    } else if (propertyType === '租賃') {
      whereClauses.push('transaction_type = ?', ['交易類型：租賃']);
    }
  }

  // Price range
  if (minPrice && minPrice !== '') { whereClauses.push('total_price >= ?'); queryParams.push(parseFloat(minPrice)); }
  if (maxPrice && maxPrice !== '') { whereClauses.push('total_price <= ?'); queryParams.push(parseFloat(maxPrice)); }
  if (minPriceUnit && minPriceUnit !== '') { whereClauses.push('unit_price >= ?'); queryParams.push(parseFloat(minPriceUnit)); }
  if (maxPriceUnit && maxPriceUnit !== '') { whereClauses.push('unit_price <= ?'); queryParams.push(parseFloat(maxPriceUnit)); }

  // Area range
  if (minArea && minArea !== '') { whereClauses.push('building_area >= ?'); queryParams.push(parseFloat(minArea)); }
  if (maxArea && maxArea !== '') { whereClauses.push('building_area <= ?'); queryParams.push(parseFloat(maxArea)); }

  // Rooms
  if (minRooms && minRooms !== '') { whereClauses.push('rooms >= ?'); queryParams.push(parseInt(minRooms)); }
  if (maxRooms && maxRooms !== '') { whereClauses.push('rooms <= ?'); queryParams.push(parseInt(maxRooms)); }

  // Halls
  if (minHalls && minHalls !== '') { whereClauses.push('halls >= ?'); queryParams.push(parseInt(minHalls)); }
  if (maxHalls && maxHalls !== '') { whereClauses.push('halls <= ?'); queryParams.push(parseInt(maxHalls)); }

  // Bathrooms
  if (minBathrooms && minBathrooms !== '') { whereClauses.push('bathrooms >= ?'); queryParams.push(parseInt(minBathrooms)); }
  if (maxBathrooms && maxBathrooms !== '') { whereClauses.push('bathrooms <= ?'); queryParams.push(parseInt(maxBathrooms)); }

  // Elevator
  if (hasElevator && hasElevator !== '所有') {
    whereClauses.push('has_elevator = ?', [hasElevator === '有' ? 1 : 0]);
  }

  const whereStr = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

  // Sort
  const sortMap = {
    'tradeDate': 'transaction_date',
    'totalPrice': 'total_price',
    'unitPrice': 'unit_price',
    'buildingArea': 'building_area',
    'landArea': 'land_area',
  };
  const sortCol = sortMap[sortBy] || 'transaction_date';
  const orderDir = sortOrder === 'asc' ? 'ASC' : 'DESC';

  // Count
  const countSql = `SELECT COUNT(*) as total FROM lvr_records ${whereStr}`;
  const countRow = await dbGet(db, countSql, queryParams);
  const total = countRow.total;

  // Data with pagination
  const pageNum = parseInt(page);
  const pageSizeNum = parseInt(pageSize);
  const offset = (pageNum - 1) * pageSizeNum;

  const dataSql = `${whereStr} ORDER BY ${sortCol} ${orderDir} LIMIT ? OFFSET ?`;
  const dataParams = [...queryParams, pageSizeNum, offset];
  const rows = await dbQuery(db, dataSql, dataParams);

  return {
    total,
    page: pageNum,
    pageSize: pageSizeNum,
    totalPages: Math.ceil(total / pageSizeNum),
    data: formatRows(rows)
  };
}

// ========== Server ==========

async function startServer() {
  const db = await getDB();
  console.log(`SQLite 資料庫已載入: ${DB_PATH}`);

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
      if (pathname === '/api/data/cities' && req.method === 'GET') {
        const result = await handleCities(db);
        res.writeHead(200);
        res.end(JSON.stringify(result));

      } else if (pathname === '/api/data/distinct' && req.method === 'GET') {
        const city = url.searchParams.get('city');
        if (!city) {
          res.writeHead(200);
          res.end(JSON.stringify({ districts: [], count: 0 }));
          return;
        }
        const result = await handleDistricts(db, city);
        res.writeHead(200);
        res.end(JSON.stringify(result));

      } else if (pathname === '/api/data/search' && req.method === 'GET') {
        const params = {};
        for (const [key, value] of url.searchParams.entries()) {
          params[key] = value;
        }
        const result = await handleSearch(db, params);
        console.log(`search: city=${params.city}, district=${params.district}, total=${result.total}, page=${result.page}/${result.totalPages}`);
        res.writeHead(200);
        res.end(JSON.stringify(result));

      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } catch (err) {
      console.error('API 錯誤:', err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
  });

  const PORT = process.env.PORT || 3002;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`API 伺服器已啟動: http://localhost:${PORT}`);
    console.log('可用端點:');
    console.log('  GET /api/data/cities          - 取得所有縣市');
    console.log('  GET /api/data/distinct?city=  - 取得特定縣市的行政區');
    console.log('  GET /api/data/search?...      - 搜尋資料');
    console.log(`範例: http://localhost:${PORT}/api/data/search?city=台北市&district=大安區&page=1&pageSize=5`);
  });
}

startServer().catch(err => {
  console.error('啟動失敗:', err);
  process.exit(1);
});
