/**
 * 實價查詢 SPA - Playwright 自動化測試
 * 測試涵蓋：首頁、地圖模式、搜尋功能、導航
 */
const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');

// 測試配置
const BASE_URL = 'http://localhost:5173';
const TIMEOUT = 15000;

async function runTests() {
  console.log('='.repeat(60));
  console.log('實價查詢 SPA - Playwright 自動化測試');
  console.log('='.repeat(60));
  console.log('');
  
  // 啟動瀏覽器
  console.log('🚀 啟動 Chrome 瀏覽器...');
  const browser = await chromium.launch({
    headless: true,
    slowMo: 500, // 慢動作 500ms 方便觀察
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    locale: 'zh-TW',
  });
  
  const page = await context.newPage();
  
  // 收集控制台日誌
  const logs = [];
  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text() });
  });
  
  // 收集錯誤
  const errors = [];
  page.on('pageerror', err => {
    errors.push(err.message);
  });
  
  let testResults = [];
  
  // ===== 測試 1: 首頁載入 =====
  console.log('\n📋 測試 1: 首頁載入');
  testResults.push({ test: '首頁載入', status: 'running' });
  
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    await page.waitForLoadState('networkidle');
    
    // 截圖
    const homeScreenshot = await page.screenshot({ 
      path: '/tmp/home_page_test.png',
      fullPage: false 
    });
    
    // 驗證標題
    const headerText = await page.locator('.content-header h1').textContent();
    console.log(`  ✓ 標題: ${headerText}`);
    expect(headerText).toBe('實價查詢');
    
    // 驗證側邊欄選單
    const menuItems = await page.locator('.el-menu-item').all();
    console.log(`  ✓ 選單項目數: ${menuItems.length}`);
    expect(menuItems.length).toBeGreaterThanOrEqual(3);
    
    // 驗證当前 URL
    const currentUrl = page.url();
    console.log(`  ✓ URL: ${currentUrl}`);
    expect(currentUrl).toContain('/search');
    
    testResults[testResults.length - 1].status = 'PASS';
    testResults.push({ test: '首頁標題', status: 'PASS' });
    testResults.push({ test: '選單項目', status: 'PASS' });
    testResults.push({ test: 'URL 導向', status: 'PASS' });
    console.log('  ✅ 測試通過');
  } catch (err) {
    testResults[testResults.length - 1].status = 'FAIL';
    console.log(`  ❌ 測試失敗: ${err.message}`);
  }
  
  // ===== 測試 2: 地圖模式 =====
  console.log('\n📍 測試 2: 地圖模式');
  testResults.push({ test: '地圖模式', status: 'running' });
  
  try {
    // 點擊地圖選單
    const mapMenuItem = page.locator('.el-menu-item:has-text("地圖")');
    await mapMenuItem.click();
    await page.waitForURL('**/map', { timeout: TIMEOUT });
    await page.waitForLoadState('networkidle');
    
    // 截圖
    const mapScreenshot = await page.screenshot({ 
      path: '/tmp/map_mode_test.png',
      fullPage: false 
    });
    
    // 驗證標題
    const mapTitle = await page.locator('.content-header h1').textContent();
    console.log(`  ✓ 地圖模式標題: ${mapTitle}`);
    expect(mapTitle).toBe('地圖');
    
    // 驗證 URL
    const mapUrl = page.url();
    console.log(`  ✓ URL: ${mapUrl}`);
    expect(mapUrl).toContain('/map');
    
    // 驗證地圖容器存在
    const mapContainer = page.locator('#map-container');
    const containerCount = await mapContainer.count();
    console.log(`  ✓ 地圖容器存在: ${containerCount > 0}`);
    expect(containerCount).toBeGreaterThan(0);
    
    // 等待 Leaflet 地圖載入（map class）
    await page.waitForSelector('.leaflet-container', { timeout: TIMEOUT });
    console.log('  ✓ Leaflet 地圖載入中...');
    
    // 檢查 CSS 載入
    const tileLayers = await page.locator('.leaflet-tile-pane').count();
    console.log(`  ✓ 地圖瓦片層: ${tileLayers}`);
    
    testResults[testResults.length - 1].status = 'PASS';
    testResults.push({ test: '地圖標題', status: 'PASS' });
    testResults.push({ test: '地圖 URL', status: 'PASS' });
    testResults.push({ test: '地圖容器', status: 'PASS' });
    testResults.push({ test: 'Leaflet 載入', status: 'PASS' });
    console.log('  ✅ 測試通過');
  } catch (err) {
    testResults[testResults.length - 1].status = 'FAIL';
    console.log(`  ❌ 測試失敗: ${err.message}`);
  }
  
  // ===== 測試 3: 地圖功能驗證 =====
  console.log('\n🗺️ 測試 3: 地圖功能驗證');
  testResults.push({ test: '地圖功能', status: 'running' });
  
  try {
    // 獲取地圖中心點
    const mapCenter = await page.evaluate(() => {
      const map = window.__leafletMaps?.['map-container']?.getCenter();
      return map;
    });
    console.log(`  ✓ 地圖中心: ${JSON.stringify(mapCenter)}`);
    
    // 獲取縮放級別
    const zoomLevel = await page.evaluate(() => {
      const map = window.__leafletMaps?.['map-container']?.getZoom();
      return map;
    });
    console.log(`  ✓ 縮放級別: ${zoomLevel}`);
    
    // 檢查地圖元素
    const mapOverlayLayers = await page.locator('.leaflet-overlay-pane').count();
    const mapMarkerPanes = await page.locator('.leaflet-marker-pane').count();
    console.log(`  ✓ 疊加層: ${mapOverlayLayers}, 標記: ${mapMarkerPanes}`);
    
    // 檢查熱力圖圖例
    const legendVisible = await page.locator('.map-legend').isVisible();
    console.log(`  ✓ 圖例可見: ${legendVisible}`);
    
    testResults[testResults.length - 1].status = 'PASS';
    console.log('  ✅ 測試通過');
  } catch (err) {
    testResults[testResults.length - 1].status = 'FAIL';
    console.log(`  ❌ 測試失敗: ${err.message}`);
  }
  
  // ===== 測試 4: 搜尋功能 =====
  console.log('\n🔍 測試 4: 搜尋功能');
  testResults.push({ test: '搜尋功能', status: 'running' });
  
  try {
    // 導航到搜尋頁
    await page.locator('.el-menu-item:has-text("實價查詢")').click();
    await page.waitForURL('**/search', { timeout: TIMEOUT });
    await page.waitForLoadState('networkidle');
    
    // 截圖
    const searchScreenshot = await page.screenshot({ 
      path: '/tmp/search_mode_test.png',
      fullPage: false 
    });
    
    // 驗證搜尋欄位存在
    const searchFields = await page.locator('.el-select, .el-input').count();
    console.log(`  ✓ 搜尋欄位數: ${searchFields}`);
    expect(searchFields).toBeGreaterThan(0);
    
    // 驗證搜尋按鈕
    const searchButton = page.locator('.el-button:has-text("查詢")');
    const buttonVisible = await searchButton.isVisible();
    console.log(`  ✓ 搜尋按鈕可見: ${buttonVisible}`);
    expect(buttonVisible).toBe(true);
    
    testResults[testResults.length - 1].status = 'PASS';
    testResults.push({ test: '搜尋欄位', status: 'PASS' });
    testResults.push({ test: '搜尋按鈕', status: 'PASS' });
    console.log('  ✅ 測試通過');
  } catch (err) {
    testResults[testResults.length - 1].status = 'FAIL';
    console.log(`  ❌ 測試失敗: ${err.message}`);
  }
  
  // ===== 測試 5: 導航切換 =====
  console.log('\n🔄 測試 5: 導航切換');
  testResults.push({ test: '導航切換', status: 'running' });
  
  try {
    // 切換到搜尋歷史
    await page.locator('.el-menu-item:has-text("搜尋歷史")').click();
    await page.waitForURL('**/history', { timeout: TIMEOUT });
    await page.waitForLoadState('networkidle');
    
    const historyTitle = await page.locator('.content-header h1').textContent();
    console.log(`  ✓ 歷史頁標題: ${historyTitle}`);
    expect(historyTitle).toBe('搜尋歷史與統計');
    
    // 切換回地圖
    await page.locator('.el-menu-item:has-text("地圖")').click();
    await page.waitForURL('**/map', { timeout: TIMEOUT });
    await page.waitForLoadState('networkidle');
    
    const backMapTitle = await page.locator('.content-header h1').textContent();
    console.log(`  ✓ 返回地圖頁標題: ${backMapTitle}`);
    expect(backMapTitle).toBe('地圖');
    
    // 截圖最後狀態
    const finalScreenshot = await page.screenshot({ 
      path: '/tmp/final_map_test.png',
      fullPage: false 
    });
    
    testResults[testResults.length - 1].status = 'PASS';
    testResults.push({ test: '歷史頁導航', status: 'PASS' });
    testResults.push({ test: '返回地圖', status: 'PASS' });
    console.log('  ✅ 測試通過');
  } catch (err) {
    testResults[testResults.length - 1].status = 'FAIL';
    console.log(`  ❌ 測試失敗: ${err.message}`);
  }
  
  // ===== 測試結果彙總 =====
  console.log('\n' + '='.repeat(60));
  console.log('📊 測試結果彙總');
  console.log('='.repeat(60));
  
  const passCount = testResults.filter(r => r.status === 'PASS').length;
  const failCount = testResults.filter(r => r.status === 'FAIL').length;
  const runningCount = testResults.filter(r => r.status === 'running').length;
  
  console.log(`\n總計: ${testResults.length} 項測試`);
  console.log(`✅ 通過: ${passCount}`);
  console.log(`❌ 失敗: ${failCount}`);
  console.log(`⏳ 進行中: ${runningCount}`);
  
  // 顯示詳細結果
  console.log('\n詳細結果:');
  testResults.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⏳';
    console.log(`  ${icon} ${r.test}: ${r.status}`);
  });
  
  // 檢查錯誤
  if (errors.length > 0) {
    console.log('\n⚠️ 頁面錯誤:');
    errors.forEach(err => console.log(`  - ${err}`));
  }
  
  // 檢查控制台警告
  const consoleWarnings = logs.filter(l => l.type === 'warn' || l.type === 'error');
  if (consoleWarnings.length > 0) {
    console.log('\n⚠️ 控制台警告:');
    consoleWarnings.slice(0, 5).forEach(w => console.log(`  - ${w.text}`));
    if (consoleWarnings.length > 5) {
      console.log(`  ... 還有 ${consoleWarnings.length - 5} 筆警告`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  // 保存測試結果
  const fs = require('fs');
  fs.writeFileSync('/tmp/test_results.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    total: testResults.length,
    pass: passCount,
    fail: failCount,
    results: testResults
  }, null, 2));
  
  console.log('📁 測試結果已保存至 /tmp/test_results.json');
  
  // 關閉瀏覽器
  await browser.close();
  
  console.log('\n✅ 測試完成!');
  
  // 返回結果
  return { pass: passCount, fail: failCount, total: testResults.length };
}

// 運行測試
runTests().catch(err => {
  console.error('測試執行失敗:', err);
  process.exit(1);
});
