const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'tests', 'screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();
	await page.setViewportSize({ width: 1440, height: 900 });

	const screens = [];

	try {
		// ========== 1. 首頁（搜尋頁） ==========
		await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
		await page.waitForSelector('.el-select', { timeout: 5000 });
		const homePath = path.join(OUTPUT_DIR, '01_home.png');
		await page.screenshot({ path: homePath, fullPage: true });
		screens.push({ name: '首頁', path: homePath });
		console.log('Screenshot 01 Home: OK');

		// ========== 2. 搜尋操作 ==========
		const countySelect = await page.$('.el-select__wrapper');
		if (countySelect) {
			await countySelect.click();
			await page.waitForSelector('.el-select-dropdown', { timeout: 3000 });
			const taipeiOpt = await page.$("text=台北市");
			if (taipeiOpt) {
				await taipeiOpt.click();
				await page.waitForTimeout(500);
			}
		}

		const areaSelect = await page.$('.el-select .el-select__wrapper');
		if (areaSelect) {
			await page.click('.el-select .el-select__wrapper', { clickCount: 2 });
			await page.waitForSelector('.el-select-dropdown', { timeout: 3000 });
			const distOpt = await page.$("text=中正區");
			if (distOpt) distOpt.click();
			await page.waitForTimeout(200);
		}

		const keywordInput = await page.$('.el-input__inner');
		if (keywordInput) {
			await keywordInput.click();
			await keywordInput.press('Control+a');
			await page.type('.el-input__inner', '大安', { delay: 50 });
		}

		const searchBtn = await page.$('.el-button--primary');
		if (searchBtn) {
			await searchBtn.click();
		}
		await page.waitForTimeout(2000);
		const searchPath = path.join(OUTPUT_DIR, '02_search.png');
		await page.screenshot({ path: searchPath, fullPage: true });
		screens.push({ name: '搜尋結果', path: searchPath });
		console.log('Screenshot 02 Search: OK');

		// ========== 3. 分頁測試 ==========
		const nextBtn = await page.$('.el-pagination .btn-next:not(.disabled)');
		if (nextBtn) {
			await nextBtn.click();
			await page.waitForTimeout(1500);
		}
		const page2Path = path.join(OUTPUT_DIR, '03_page2.png');
		await page.screenshot({ path: page2Path, fullPage: true });
		screens.push({ name: '分頁測試', path: page2Path });
		console.log('Screenshot 03 Page2: OK');

		// ========== 4. 歷史紀錄 ==========
		await page.click('a[href="/history"]');
		await page.waitForTimeout(1000);
		const histPath = path.join(OUTPUT_DIR, '04_history.png');
		await page.screenshot({ path: histPath, fullPage: true });
		screens.push({ name: '歷史記錄', path: histPath });
		console.log('Screenshot 04 History: OK');

		// 寫入結果
		const resultPath = path.join(OUTPUT_DIR, 'test_result.txt');
		fs.writeFileSync(resultPath, `共 ${screens.length} 張截圖完成！\n` + screens.map(s => `- ${s.name}: ${s.path}`).join('\n') + '\n');

	} catch (err) {
		console.error('測試發生錯誤:', err.message);
		await page.screenshot({ path: path.join(OUTPUT_DIR, 'error.png'), fullPage: true });
	} finally {
		await browser.close();
	}

	console.log('✅ UI Test Done!');
})();
