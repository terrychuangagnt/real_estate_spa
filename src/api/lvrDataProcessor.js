/**
 * 實價登錄資料處理器
 * 
 * 處理從 /tmp/lvr_landtxt/ 讀取的 CSV 格式實價登錄資料
 * 
 * 注意事項處理：
 * 1. BOM 編碼：Node.js 自動處理，不需要額外處理
 * 2. 空欄位：使用 formatNull() 處理
 * 3. 交易日期 YMMDD：使用 formatDate() 處理
 * 4. 車位資訊：使用 hasParking 屬性判斷是否需要
 * 5. 按縣市/類型分割：使用 loadDataByCity() 處理
 */

import fs from 'fs';
import path from 'path';

export function parseRecord(row) {
  const price = (row[22] && row[22].trim() !== '') ? parseFloat(row[22]) : null;
  const unitPrice = (row[23] && row[23].trim() !== '') ? parseFloat(row[23]) : null;
  const parkingPrice = (row[26] && row[26].trim() !== '') ? parseFloat(row[26]) : null;

  return {
    // 基本資料
    district: row[0] || '',
    propertyType: row[1] || '',
    address: row[2] || '',
    landArea: (row[3] && row[3].trim() !== '') ? parseFloat(row[3]) : null,
    urbanZoning: row[4] || '',
    ruralZoning: row[5] || '',
    ruralDesignation: row[6] || '',

    // 交易資訊
    tradeDate: formatDate(row[7]),
    tradeDateISO: formatDateISO(row[7]),
    transactionType: row[8] || '',
    transferLevel: row[9] || '',
    totalFloors: (row[10] && row[10].trim() !== '') ? parseInt(row[10]) : null,

    // 建物資訊
    buildingType: row[11] || '',
    buildingUse: row[12] || '',
    buildingMaterial: row[13] || '',
    builtYear: row[14] || '',
    buildingArea: (row[15] && row[15].trim() !== '') ? parseFloat(row[15]) : null,
    rooms: (row[16] && row[16].trim() !== '') ? parseInt(row[16]) : null,
    halls: (row[17] && row[17].trim() !== '') ? parseInt(row[17]) : null,
    bathrooms: (row[18] && row[18].trim() !== '') ? parseInt(row[18]) : null,
    interior: row[19] || '',
    hasManagement: row[20] || '',

    // 價格資訊
    totalPrice: price,
    totalPriceDisplay: formatPrice(price),
    unitPrice: unitPrice,
    unitPriceDisplay: formatUnitPrice(unitPrice),

    // 車位資訊
    parkingType: row[24] || null,
    parkingArea: (row[25] && row[25].trim() !== '') ? parseFloat(row[25]) : null,
    parkingPrice: parkingPrice,
    parkingPriceDisplay: formatPrice(parkingPrice),
    hasParking: row[24] && row[24].trim() !== '',

    // 其他
    remarks: row[27] || '',
    recordId: row[28] || '',
    mainBuildingArea: (row[29] && row[29].trim() !== '') ? parseFloat(row[29]) : null,
    ancillaryArea: (row[30] && row[30].trim() !== '') ? parseFloat(row[30]) : null,
    balconyArea: (row[31] && row[31].trim() !== '') ? parseFloat(row[31]) : null,
    hasElevator: row[32] || '',
    transactionNumber: row[33] || '',

    // 來源資訊
    sourceFile: '',
    cityCode: '',
    city: ''
  };
}

/**
 * 注意事項：1. 日期格式化
 * YMMDD 格式 → 民國年月日（UI）及 YYYYMMDD（ISO）
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const dateStrClean = dateStr.toString().trim();
  if (dateStrClean.length < 7) return dateStr;

  const year = parseInt(dateStrClean.substring(0, 3)) + 1911;
  const month = parseInt(dateStrClean.substring(3, 5));
  const day = parseInt(dateStrClean.substring(5, 7));
  return `${year}年${String(month).padStart(2, '0')}月${String(day).padStart(2, '0')}日`;
}

export function formatDateISO(dateStr) {
  if (!dateStr) return '';
  const dateStrClean = dateStr.toString().trim();
  if (dateStrClean.length < 7) return dateStr;

  const year = parseInt(dateStrClean.substring(0, 3)) + 1911;
  const month = parseInt(dateStrClean.substring(3, 5));
  const day = parseInt(dateStrClean.substring(5, 7));
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatTraditionalDate(dateStr) {
  return formatDate(dateStr);
}

/**
 * 注意事項：2. 金額格式化
 * 純數字 → 千分位 + 單位
 */
export function formatPrice(value) {
  if (value === null || value === undefined) return null;
  const price = parseFloat(value);
  if (isNaN(price)) return null;
  return `NT$${price.toLocaleString()}`;
}

export function formatUnitPrice(value) {
  if (value === null || value === undefined) return null;
  const price = parseFloat(value);
  if (isNaN(price)) return null;
  return `${price.toLocaleString()}/sqm`;
}

/**
 * 注意事項：3. 空欄位處理
 * 避免在 UI 顯示空字串，改用 '-' 或 null
 */
export function formatNull(value, defaultValue = '-') {
  if (value === null || value === undefined || value === '' || value === '-') return defaultValue;
  return value.trim() || defaultValue;
}

/**
 * 注意事項：4. 車位欄位條件渲染
 * 只有当 hasParking === true 時，才顯示車位資訊
 */
export function isParkingIncluded(record) {
  return record.hasParking === true;
}

/**
 * 注意事項：5. 城市資訊判斷
 */
const CITY_MAP = {
  'a': '台北市', 'b': '台中市', 'c': '基隆市', 'd': '台南市',
  'e': '高雄市', 'f': '新北市', 'g': '宜蘭縣', 'h': '桃園市',
  'i': '嘉義市', 'j': '新竹縣', 'k': '苗栗縣', 'm': '南投縣',
  'n': '彰化縣', 'o': '新竹市', 'p': '雲林縣', 'q': '嘉義縣',
  't': '屏東縣', 'u': '花蓮縣', 'v': '臺東縣', 'w': '金門縣',
  'x': '澎湖縣'
};

export function extractCityCode(filename) {
  const match = filename.match(/^([a-x])_/);
  return match ? match[1] : '';
}

export function getCityName(code) {
  return CITY_MAP[code] || '';
}

/**
 * 讀取單一檔案的資料
 */
export function readTxtFile(filePath, sourceFile) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 注意事項：1. 處理 BOM
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.substring(1);
  }
  
  const lines = content.split('\n');
  const records = [];
  
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].replace(/\r$/, '');
    if (!line.trim()) continue;
    
    const row = line.split(',');
    if (row.length < 34) continue;
    
    const record = parseRecord(row);
    record.sourceFile = sourceFile;
    record.cityCode = extractCityCode(sourceFile);
    record.city = getCityName(record.cityCode);
    
    records.push(record);
  }
  
  return records;
}

/**
 * 注意事項：6. 按城市/類型分割
 * 按 cityCode + fileType 讀取對應的檔案
 */
export function loadDataByCity(cityCode, fileType) {
  const patterns = [
    `${cityCode}_lvr_land_${fileType}.txt`,
    `${cityCode}_lvr_land_${fileType}_land.txt`,
    `${cityCode}_lvr_land_${fileType}_build.txt`,
    `${cityCode}_lvr_land_${fileType}_park.txt`
  ];
  
  return patterns.map(filename => {
    const filePath = path.join('/tmp/lvr_landtxt', filename);
    if (!fs.existsSync(filePath)) return [];
    return readTxtFile(filePath, filename);
  }).flat();
}
