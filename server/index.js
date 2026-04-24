import express from 'express';
import cors from 'cors';
import LVR_DATA from '../src/data/lvr.json' with { type: 'json' };

const app = express();
const PORT = process.env.PORT || 3100;

let cachedData = null;
let statsSnapshot = null;

async function preload() {
  if (cachedData) return cachedData.records;
  cachedData = LVR_DATA;
  if (!statsSnapshot) {
    statsSnapshot = {
      districts: {},
      records: cachedData.records,
    };
    cachedData.records.forEach(r => {
      if (r._county && r.district) {
        if (!statsSnapshot.districts[r._county]) statsSnapshot.districts[r._county] = new Set();
        statsSnapshot.districts[r._county].add(r.district);
      }
    });
    for (const [k, v] of Object.entries(statsSnapshot.districts)) {
      statsSnapshot.districts[k] = [...v].sort();
    }
  }
  console.log(`✅ 已載入 ${cachedData.records.length} 筆實價登錄紀錄`);
  return cachedData.records;
}

app.use(cors());
app.use(express.json());

// GET /api/districts
app.get('/api/districts', async (req, res) => {
  await preload();
  res.json({ districts: statsSnapshot.districts });
});

// POST /api/records
app.post('/api/records', async (req, res) => {
  await preload();
  const records = statsSnapshot.records;
  
  let result = [...records];
  const { county, district, keyword, landCategory, priceMin, priceMax, tradePeriodBegin, tradePeriodEnd } = req.body;

  if (county) {
    const countyPatterns = [county];
    if (county.includes('台北市')) countyPatterns.push('臺北市');
    if (county.includes('台南市')) countyPatterns.push('臺南市');
    if (county.includes('台中市')) countyPatterns.push('臺中市');
    if (county.includes('臺北市')) countyPatterns.push('台北市');
    if (county.includes('臺南市')) countyPatterns.push('台南市');
    if (county.includes('臺中市')) countyPatterns.push('台中市');
    result = result.filter(r => countyPatterns.some(p => r._county === p || r._county.includes(p)));
  }
  
  if (district) {
    result = result.filter(r => r.district === district);
  }
  
  if (keyword) {
    result = result.filter(r => r.address?.includes(keyword) || false);
  }
  
  if (landCategory && landCategory !== '全部') {
    const patterns = {
      '住宅': ['住', '華廈', '大樓', '公寓'],
      '商業': ['商業', '商業用'],
      '工業': ['工業', '工業用'],
    };
    const pats = patterns[landCategory] || [];
    result = result.filter(r => pats.some(p => r.buildingType?.includes(p) || r.mainUse?.includes(p)));
  }
  
  if (priceMin) {
    const min = parseFloat(priceMin) * 10000;
    result = result.filter(r => r.totalPrice >= min);
  }
  if (priceMax) {
    const max = parseFloat(priceMax) * 10000;
    result = result.filter(r => r.totalPrice <= max);
  }
  
  if (tradePeriodBegin) {
    const begin = tradePeriodBegin.substring(5).replace(/-/g, '');
    result = result.filter(r => r.tradeDate >= begin);
  }
  if (tradePeriodEnd) {
    const end = tradePeriodEnd.substring(5).replace(/-/g, '');
    result = result.filter(r => r.tradeDate <= end);
  }

  const formatted = result.map(r => ({
    id: r.id || '',
    address: r.address || '',
    landCategory: r._county || '',
    houseType: r.buildingType || '',
    tradeCategory: r.tradeType || '',
    transactionDate: r.tradeDate || '',
    totalPrice: r.totalPrice ? (r.totalPrice / 10000).toFixed(0) : 0,
    unitAreaPrice: r.unitPrice ? Math.round(r.unitPrice) : 0,
    area: r.buildArea ? r.buildArea.toFixed(1) : (r.area ? r.area.toFixed(1) : '0'),
    floor: r.transferLevel || '',
    totalTransactions: result.length,
  }));

  const avgPrice = result.length > 0
    ? (result.reduce((s, r) => s + (r.unitPrice || 0), 0) / result.length).toFixed(0)
    : 0;

  res.json({
    records: formatted,
    total: formatted.length,
    totalTransactions: result.length,
    avgPrice: avgPrice,
  });
});

// GET /api/stats/summary
app.get('/api/stats/summary', async (req, res) => {
  await preload();
  const records = statsSnapshot.records;
  res.json({
    totalCount: records.length,
    counties: [...new Set(records.map(r => r._county).filter(Boolean))].sort(),
  });
});

app.listen(PORT, () => {
  console.log(`🌍 實價登錄 API: http://localhost:${PORT}`);
});
