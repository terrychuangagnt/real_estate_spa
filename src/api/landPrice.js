/**
 * 實價登錄資料服務
 * 使用本地的 lvr_landtxt.txt 資料作為實價查詢來源
 */

const API_BASE = (typeof process !== 'undefined' && process.env.VITE_API_URL) 
  ? process.env.VITE_API_URL 
  : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
    ? import.meta.env.VITE_API_URL 
    : '/api';

// 轉換伺服器回傳的資料格式到前端使用的格式
function transformRecord(record) {
  return {
    // 基本資料
    district: record.district,
    propertyType: record.propertyType,
    address: record.address,
    landArea: record.landArea,
    urbanZoning: record.urbanZoning,
    ruralZoning: record.ruralZoning,
    ruralDesignation: record.ruralDesignation,

    // 交易資訊（格式化後）
    tradeDate: record.tradeDate,
    transactionType: record.transactionType,
    totalFloors: record.totalFloors,

    // 建物資訊
    buildingType: record.buildingType,
    buildingUse: record.buildingUse,
    buildingMaterial: record.buildingMaterial,
    builtYear: record.builtYear,
    buildingArea: record.buildingArea,
    rooms: record.rooms,
    halls: record.halls,
    bathrooms: record.bathrooms,
    interior: record.interior,
    hasManagement: record.hasManagement,

    // 價格資訊（格式化後）
    totalPrice: record.totalPrice,
    totalPriceDisplay: record.totalPriceDisplay,
    unitPrice: record.unitPrice,
    unitPriceDisplay: record.unitPriceDisplay,

    // 車位資訊（有車位才顯示）
    parkingType: record.parkingType,
    parkingArea: record.parkingArea,
    parkingPrice: record.parkingPrice,
    parkingPriceDisplay: record.parkingPriceDisplay,
    hasParking: record.hasParking,

    // 來源資訊
    city: record.city,
    sourceFile: record.sourceFile,

    // 其他
    recordId: record.recordId,
    mainBuildingArea: record.mainBuildingArea,
    ancillaryArea: record.ancillaryArea,
    balconyArea: record.balconyArea,
    hasElevator: record.hasElevator,
    transactionNumber: record.transactionNumber,
  };
}

export async function searchLandPrice(params) {
  try {
    const queryString = new URLSearchParams({
      city: params.county || '',
      district: params.district || '',
      propertyType: params.type || '',
      minPrice: params.minPrice || '',
      maxPrice: params.maxPrice || '',
      minPriceUnit: params.unitPriceMin || '',
      maxPriceUnit: params.unitPriceMax || '',
      minArea: params.minArea || '',
      maxArea: params.maxArea || '',
      minRooms: params.minRooms || '',
      maxRooms: params.maxRooms || '',
      minHalls: params.minHalls || '',
      maxHalls: params.maxHalls || '',
      minBathrooms: params.minBathrooms || '',
      maxBathrooms: params.maxBathrooms || '',
      hasElevator: params.hasElevator || '',
      page: params.page || 1,
      pageSize: params.pageSize || 2,
      sortBy: params.sortBy || 'tradeDate',
      sortOrder: params.sortOrder || 'desc',
    });

    const res = await fetch(`${API_BASE}/data/search?${queryString}`);
    if (!res.ok) throw new Error(`API 錯誤 ${res.status}`);

    const data = await res.json();
    return {
      data: (data.data || []).map(transformRecord),
      total: data.total || 0,
      page: data.page || 1,
      pageSize: data.pageSize || 2,
      totalPages: data.totalPages || 0,
    };
  } catch (err) {
    console.warn('查詢失敗:', err.message);
    return { data: [], total: 0, page: 1, pageSize: 2, totalPages: 0 };
  }
}

export async function getDistricts(city) {
  if (!city) return [];

  try {
    const res = await fetch(`${API_BASE}/data/distinct?city=${encodeURIComponent(city)}`);
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
    const res = await fetch(`${API_BASE}/data/cities`);
    if (!res.ok) throw new Error(`Cities API 錯誤 ${res.status}`);
    const data = await res.json();
    return data || [];
  } catch (err) {
    console.warn('取得縣市失敗:', err.message);
    return [];
  }
}
