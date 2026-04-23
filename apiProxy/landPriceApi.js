/**
 * 實價查詢 API 代理 Proxy
 * 使用內政部 Open API 2.0 獲取即時實價登錄資料
 */

const MOI_API_URL = 'https://service.land.moi.gov.tw/GIEXCEPTION2/SearchData';

module.exports = {
  /**
   * 查詢實價登錄資料
   */
  async searchLandPrice(params) {
    try {
      // 1. 建構查詢參數
      const formBody = [];
      formBody.push('QUERY=1');
      
      // 縣市映射（API 使用繁體中文）
      const cityMap = {
        '台北市': '臺北市',
        '新北市': '新北市',
        '台中市': '臺中市',
        '台南市': '臺南市',
        '高雄市': '高雄市',
        '桃園市': '桃園市',
      };
      
      formBody.push(`CITY=${cityMap[params.county] || ''}`);
      formBody.push(`RANGE=${params.district || ''}`);
      
      // 價格範圍
      if (params.priceMax) formBody.push(`PRICEBEG=${params.priceMin || ''}`);
      if (params.priceMax) formBody.push(`PRICEEND=${params.priceMax}`);
      
      // 交易期間
      if (params.tradePeriodBegin) {
        formBody.push(`RANGE1=${params.tradePeriodBegin.substring(5).replace(/-/g, '')}`);
      }
      if (params.tradePeriodEnd) {
        formBody.push(`RANGE2=${params.tradePeriodEnd.substring(5).replace(/-/g, '')}`);
      }
      
      // 關鍵詞
      if (params.keyword) {
        formBody.push(`SEARCHWORD=${params.keyword}`);
      }
      
      // 類型
      if (params.landCategory && params.landCategory !== '全部') {
        const typeMap = {
          '住宅': '住宅房屋',
          '商業': '商業房屋',
          '工業': '工業房屋',
        };
        formBody.push(`CATEGORY=${typeMap[params.landCategory] || '住宅房屋'}`);
      }
      
      const query = formBody.join('&');
      
      // 2. Fetch 資料
      const response = await fetch(MOI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query }),
      });
      
      if (!response.ok) throw new Error('API 請求失敗');
      
      // 3. 解析資料
      const data = await response.json();
      const result = [];
      
      if (data.ResultList && data.ResultList.Record) {
        const records = Array.isArray(data.ResultList.Record)
          ? data.ResultList.Record
          : [data.ResultList.Record];
        
        for (const r of records) {
          const tradePrice = parseInt(r.Price?.replace(/,/g, '') || 0);
          
          result.push({
            id: r.TradeID,
            address: r.Address,
            landCategory: r.LandCategory || '待分類',
            houseType: r.HouseCategory || '待分類',
            tradeCategory: r.TradeCategory || '一般交易',
            transactionDate: r.TradeDate,
            totalPrice: tradePrice > 1000 ? Math.round(tradePrice / 10000) : tradePrice,
            unitAreaPrice: r.UnitPrice || '0',
            area: r.TradeArea || '0',
            floor: r.Floor || '待分類',
            hasElevator: r.HasElevator === '有',
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Fetch 實價登錄 API 失敗:', error);
      return [];
    }
  },
};
