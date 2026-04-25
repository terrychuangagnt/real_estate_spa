/**
 * 實價登錄資料服務
 * 使用本地 SQLite 資料庫的實價查詢來源
 */

const API_BASE = (typeof process !== 'undefined' && process.env.VITE_API_URL) 
  ? process.env.VITE_API_URL 
  : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
    ? import.meta.env.VITE_API_URL 
    : '/api';

// 縣市代碼對應
const CITY_MAP = {
  'a': '台北市', 'b': '台中市', 'c': '基隆市', 'd': '台南市',
  'e': '高雄市', 'f': '新北市', 'g': '宜蘭縣', 'h': '桃園市',
  'i': '嘉義市', 'j': '新竹縣', 'k': '苗栗縣', 'm': '南投縣',
  'n': '彰化縣', 'o': '新竹市', 'p': '雲林縣', 'q': '嘉義縣',
  't': '屏東縣', 'u': '花蓮縣', 'v': '台東縣', 'w': '金門縣',
  'x': '澎湖縣'
};
const REVERSE_CITY_MAP = Object.fromEntries(Object.entries(CITY_MAP).map(([k,v]) => [v,k]));

// 交易類型對應
const TRANSACTION_MAP = {
  '買賣': 1,
  '預售屋': 2,
  '租賃': 3
};

// 轉換資料庫回傳的資料格式到前端使用的格式
function transformRecord(row) {
  return {
    // 基本資料
    district: row.district || '',
    propertyType: row.transaction_type || '',
    address: row.address || '',
    landArea: row.land_area_sqm ? parseFloat(row.land_area_sqm) : 0,
    urbanZoning: row.urban_zone || '',
    ruralZoning: row.rural_zone || '',
    ruralDesignation: row.rural_allocation || '',

    // 交易資訊
    tradeDate: formatTradeDate(row.trade_date),
    transactionType: row.transaction_type || '',
    totalFloors: row.total_floors || '',

    // 建物資訊
    buildingType: row.building_type || '',
    buildingUse: row.main_use || '',
    buildingMaterial: row.main_material || '',
    builtYear: row.completion_date || '',
    buildingArea: row.building_area_sqm ? parseFloat(row.building_area_sqm) : 0,
    rooms: row.room_count || '',
    halls: row.living_count || '',
    bathrooms: row.bath_count || '',
    interior: row.partition_info || '',
    hasManagement: row.management_org || '',

    // 價格資訊（單位：萬/坪）
    // total_price 單位是「元」，除以 10000 變成「萬元」
    totalPrice: row.total_price ? parseFloat(row.total_price) / 10000 : 0,
    totalPriceDisplay: row.total_price ? formatPrice(parseFloat(row.total_price) / 10000) : '0',
    // unit_price_sqm 單位是「元/sqm」，1 sqm ≈ 3.306 坪，換算成「萬/坪」
    unitPrice: row.unit_price_sqm ? parseFloat(row.unit_price_sqm) * 3.306 / 10000 : 0,
    unitPriceDisplay: row.unit_price_sqm ? formatPrice(parseFloat(row.unit_price_sqm) * 3.306 / 10000) : '0',

    // 車位資訊
    parkingType: row.parking_type || '',
    parkingArea: row.parking_area_sqm ? parseFloat(row.parking_area_sqm) : 0,
    parkingPrice: row.parking_price || 0,
    parkingPriceDisplay: row.parking_price ? formatPrice(row.parking_price) : '0',
    hasParking: row.parking_price > 0,

    // 來源資訊
    city: CITY_MAP[row.city_code] || row.city_code || '',
    cityCode: row.city_code || '',
    sourceFile: row.source || '',

    // 其他
    recordId: row.id || '',
    mainBuildingArea: row.building_area_sqm || '',
    ancillaryArea: '',
    balconyArea: '',
    hasElevator: '',
    transactionNumber: row.trade_bundles || '',
    
    // 原始欄位
    tradeDateRaw: row.trade_date || '',
    totalFloorsRaw: row.total_floors || '',
    buildingAreaSqm: row.building_area_sqm || '',
    landAreaSqm: row.land_area_sqm || '',
  };
}

function formatPrice(value) {
  if (value === null || value === undefined || value === 0) return '0';
  return Math.round(value).toLocaleString();
}

function formatTradeDate(dateStr) {
  if (!dateStr) return '';
  // 支援 7 位數 "1150401" 或 8 位數 "11504011"（民國 YYYYMMDD）
  if (dateStr.length === 7) {
    return `${dateStr.substring(0, 3)}/${dateStr.substring(3, 5)}/${dateStr.substring(5, 7)}`;
  }
  if (dateStr.length === 8) {
    return `${dateStr.substring(0, 4)}/${dateStr.substring(4, 6)}/${dateStr.substring(6, 8)}`;
  }
  return dateStr;
}

export async function searchLandPrice(params) {
  try {
    // Map frontend params to backend snake_case params
    const queryParamMap = {
      city_code: params.county ? REVERSE_CITY_MAP[params.county] : '',
      district: params.district || '',
      transaction_type: params.type || '',
      min_price: params.minPrice || '',
      max_price: params.maxPrice || '',
      unit_price_min: params.unitPriceMin || '',
      unit_price_max: params.unitPriceMax || '',
      minArea: params.minArea || '',
      maxArea: params.maxArea || '',
      minRooms: params.minRooms || '',
      maxRooms: params.maxRooms || '',
      minBathrooms: params.minBathrooms || '',
      maxBathrooms: params.maxBathrooms || '',
      page: params.page || 1,
      page_size: params.pageSize || 10,
      sort_by: params.sortBy === 'tradeDate' ? 'trade_date' : params.sortBy || 'trade_date',
      sortOrder: params.sortOrder || 'desc',
    };

    // Remove empty values
    const queryString = new URLSearchParams(
      Object.entries(queryParamMap).filter(([_, v]) => v !== undefined && v !== '')
    );
    const url = `${API_BASE}/search?${queryString}`;

    console.log('Searching:', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API 錯誤 ${res.status}`);

    const data = await res.json();
    return {
      data: (data.records || []).map(transformRecord),
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 10,
      totalPages: data.totalPages || 0,
    };
  } catch (err) {
    console.warn('查詢失敗:', err.message);
    return { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }
}

export async function getDistricts(cityCode) {
  if (!cityCode) return [];

  try {
    const url = `${API_BASE}/districts?city_code=${encodeURIComponent(cityCode)}`;
    console.log('Fetching districts:', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Districts API 錯誤 ${res.status}`);
    const data = await res.json();
    return data.districts || [];
  } catch (err) {
    console.warn('取得行政區失敗:', err.message);
    return [];
  }
}

export async function getCities() {
  try {
    const url = `${API_BASE}/cities`;
    console.log('Fetching cities:', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Cities API 錯誤 ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map(c => ({ name: c.name, code: c.code, count: c.count }));
    }
    return data || [];
  } catch (err) {
    console.warn('取得縣市失敗:', err.message);
    return [];
  }
}
