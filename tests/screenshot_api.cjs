const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const chromePath = '/opt/data/home/.cache/puppeteer/chrome/linux-147.0.7727.57/chrome-linux64/chrome';
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  // 1. 首頁 - 正常搜尋頁面
  console.log('📸 截取首頁...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
  await page.screenshot({ 
    path: '/opt/data/home/real_estate_spa/documentation/home_page_full.png',
    fullPage: true 
  });
  console.log('✅ 首頁截圖完成');
  
  // 2. 點擊地圖選單
  console.log('📍 切換地圖模式...');
  const mapLink = await page.$('a[href="/map"]');
  if (mapLink) {
    await mapLink.click();
    await page.waitForTimeout(3000); // 等待地圖載入
    await page.screenshot({ 
      path: '/opt/data/home/real_estate_spa/documentation/map_with_markers.png',
      fullPage: true 
    });
    console.log('✅ 地圖模式截圖完成（含真實標記）');
  }
  
  // 3. 切換回搜尋歷史
  console.log('📜 切換歷史頁面...');
  const historyLink = await page.$('a[href="/history"]');
  if (historyLink) {
    await historyLink.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: '/opt/data/home/real_estate_spa/documentation/history_page_full.png',
      fullPage: true 
    });
    console.log('✅ 歷史頁面截圖完成');
  }
  
  // 4. 回到搜尋頁面
  console.log('🔍 回到搜尋頁面...');
  const searchLink = await page.$('a[href="/search"]');
  if (searchLink) {
    await searchLink.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: '/opt/data/home/real_estate_spa/documentation/search_results_full.png',
      fullPage: true 
    });
    console.log('✅ 搜尋頁面截圖完成');
  }
  
  await browser.close();
  console.log('\n🎉 所有截圖完成！');
})();
