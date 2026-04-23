/**
 * 實價查詢 API
 * 
 * 使用方式：
 * 1. 開發模式：預設使用模擬資料
 * 2. 正式部署：部署 proxyServer.js 或使用 Cloudflare Workers
 * 3. 設定 VITE_API_URL 環境變數來設定代理伺服器 URL
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/real-estate/search';

const MOCK_DATA = [
  {
    id: 'TX-MOCK-001',
    address: '新北市板橋區縣民大道一段100號',
    landCategory: '住宅',
    houseType: '電梯大樓',
    tradeCategory: '出售',
    transactionDate: '2024-12-15',
    totalPrice: 2800,
    unitAreaPrice: '78.5',
    area: '35.6',
    floor: '12/25',
    hasElevator: true,
    detailInfo: {
      landType: '住宅用地',
      buildingType: 'RC結構',
      transactionType: '買賣',
    },
  },
  {
    id: 'TX-MOCK-002',
    address: '新北市板橋區府中路200號',
    landCategory: '商業',
    houseType: '電梯大樓',
    tradeCategory: '出售',
    transactionDate: '2024-11-28',
    totalPrice: 3500,
    unitAreaPrice: '85.2',
    area: '42.3',
    floor: '8/18',
    hasElevator: true,
    detailInfo: {
      landType: '商業用地',
      buildingType: '鋼骨結構',
      transactionType: '買賣',
    },
  },
  {
    id: 'TX-MOCK-003',
    address: '台北市信義區信義路三段55號',
    landCategory: '住宅',
    houseType: '無電梯公寓',
    tradeCategory: '出售',
    transactionDate: '2024-10-10',
    totalPrice: 1500,
    unitAreaPrice: '52.1',
    area: '28.8',
    floor: '3/5',
    hasElevator: false,
    detailInfo: {
      landType: '住宅用地',
      buildingType: 'RC結構',
      transactionType: '買賣',
    },
  },
  {
    id: 'TX-MOCK-004',
    address: '桃園市桃園區縣民大道88號',
    landCategory: '住宅',
    houseType: '新建層別屋',
    tradeCategory: '出售',
    transactionDate: '2024-09-20',
    totalPrice: 1800,
    unitAreaPrice: '38.6',
    area: '46.5',
    floor: '6/22',
    hasElevator: true,
    detailInfo: {
      landType: '住宅用地',
      buildingType: 'RC結構',
      transactionType: '買賣',
    },
  },
  {
    id: 'TX-MOCK-005',
    address: '新北市新店區中興路120號',
    landCategory: '住宅',
    houseType: '透天厝',
    tradeCategory: '出售',
    transactionDate: '2024-08-05',
    totalPrice: 2200,
    unitAreaPrice: '45.3',
    area: '48.6',
    floor: '3/4',
    hasElevator: false,
    detailInfo: {
      landType: '住宅用地',
      buildingType: 'RC結構',
      transactionType: '買賣',
    },
  },
  {
    id: 'TX-MOCK-006',
    address: '台北市中正區重慶南路一段90號',
    landCategory: '商業',
    houseType: '電梯大樓',
    tradeCategory: '出售',
    transactionDate: '2024-07-18',
    totalPrice: 4200,
    unitAreaPrice: '92.8',
    area: '45.2',
    floor: '10/30',
    hasElevator: true,
    detailInfo: {
      landType: '商業用地',
      buildingType: '鋼骨結構',
      transactionType: '買賣',
    },
  },
  {
    id: 'TX-MOCK-007',
    address: '桃園市桃園區市中路35號',
    landCategory: '住宅',
    houseType: '電梯大樓',
    tradeCategory: '出售',
    transactionDate: '2024-06-22',
    totalPrice: 980,
    unitAreaPrice: '28.5',
    area: '34.4',
    floor: '15/18',
    hasElevator: true,
    detailInfo: {
      landType: '住宅用地',
      buildingType: 'RC結構',
      transactionType: '買賣',
    },
  },
  {
    id: 'TX-MOCK-008',
    address: '台中市西屯區臺灣大道四段680號',
    landCategory: '商業',
    houseType: '新建層別屋',
    tradeCategory: '出售',
    transactionDate: '2024-05-30',
    totalPrice: 2600,
    unitAreaPrice: '62.3',
    area: '41.7',
    floor: '9/20',
    hasElevator: true,
    detailInfo: {
      landType: '商業用地',
      buildingType: 'RC結構',
      transactionType: '買賣',
    },
  },
];

/**
 * 模擬查詢延遲
 */
function mockDelay(ms = 800) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 查詢實價登錄
 * @param {Object} params - 查詢參數
 * @param {string} params.county - 縣市
 * @param {string} params.district - 行政區
 * @param {string} [params.keyword] - 關鍵詞
 * @param {string} [params.landCategory] - 類型
 * @param {string} [params.tradeCategory] - 交易類型
 * @param {string} [params.priceMin] - 最低價格
 * @param {string} [params.priceMax] - 最高價格
 * @returns {Promise<Array>} - 交易紀錄列表
 */
export async function searchLandPrice(params) {
  try {
    // 嘗試呼叫代理伺服器
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: params.county,
        range: params.district,
        query: params.keyword,
        category: params.landCategory,
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    // 處理 API 回傳的欄位
    if (data.ResultList?.Record) {
      const records = Array.isArray(data.ResultList.Record)
        ? data.ResultList.Record
        : [data.ResultList.Record];
      
      return records.map(r => ({
        id: r.TradeID,
        address: r.Address,
        landCategory: r.LandCategory || '待分類',
        houseType: r.HouseCategory || '待分類',
        tradeCategory: r.TradeCategory || '一般交易',
        transactionDate: r.TradeDate,
        totalPrice: parseFloat(r.Price?.replace(/,/g, '')) || 0,
        unitAreaPrice: r.UnitPrice || '0',
        area: r.TradeArea || '0',
        floor: r.Floor || '待分類',
        hasElevator: r.HasElevator === '有',
      }));
    }
    
    // 如果 API 回傳了其他格式，則回傳空列表
    return [];
  } catch (error) {
    console.warn('代理伺服器不可用或連線失敗，回傳模擬資料', error);
    
    // 過濾模擬資料
    return MOCK_DATA.filter(record => {
      // 根據查詢條件過濾
      if (params.county && !record.address.includes(params.county)) return false;
      if (params.district && !record.address.includes(params.district)) return false;
      
      // 過濾類型
      if (params.landCategory && params.landCategory !== '全部')
        return record.landCategory === params.landCategory;
      
      return true;
    });
  }
}