#!/usr/bin/env node
/**
 * 實價查詢 API 代理伺服器
 * 解決 CORS 限制，代理內政部 Open API 2.0
 */

import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 3001;

// 允許 CORS
app.use(cors());
app.use(express.json());

const MOI_API_URL = 'https://service.land.moi.gov.tw/GIEXCEPTION2/SearchData';

app.post('/api/real-estate/search', async (req, res) => {
  try {
    const { city, range, query, category } = req.body;

    // 建構表單參數
    const params = new URLSearchParams();
    params.append('QUERY', '1');
    params.append('CITY', city || '');
    params.append('RANGE', range || '');
    params.append('SEARCHWORD', query || '');
    params.append('CATEGORY', category || '');
    
    const formData = params.toString();
    
    const response = await fetch(MOI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'RealEstateSPA/1.0',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API 代理錯誤:', error.message);
    res.status(500).json({ error: '資料查詢失敗', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`實價代理伺服器運行中: http://localhost:${PORT}`);
});
