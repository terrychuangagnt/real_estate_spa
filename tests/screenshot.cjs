const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  // Chrome 安裝路徑
  const chromePath = '/opt/data/home/.cache/puppeteer/chrome/linux-147.0.7727.57/chrome-linux64/chrome';
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  // 1. 首頁
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 15000 });
  await page.screenshot({ 
    path: '/opt/data/home/real_estate_spa/documentation/screenshot_home.png',
    fullPage: true 
  });
  console.log('✅ 首頁截圖完成');
  
  // 2. 點擊地圖選單
  const mapLink = await page.$('a[href="/map"]');
  if (mapLink) {
    await mapLink.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: '/opt/data/home/real_estate_spa/documentation/screenshot_map.png',
      fullPage: true 
    });
    console.log('✅ 地圖模式截圖完成');
  }
  
  // 3. 點擊搜尋歷史
  const historyLink = await page.$('a[href="/history"]');
  if (historyLink) {
    await historyLink.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ 
      path: '/opt/data/home/real_estate_spa/documentation/screenshot_history.png',
      fullPage: true 
    });
    console.log('✅ 歷史頁面截圖完成');
  }
  
  await browser.close();
  console.log('✅ 所有截圖完成');
})();
