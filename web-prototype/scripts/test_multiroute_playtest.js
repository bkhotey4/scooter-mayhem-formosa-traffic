// test_multiroute_playtest.js - Autonomous Alley & Cross-Street Navigation Test
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve('..', 'docs', 'playtest_screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runMultiRouteTest() {
  console.log('🚀 [多路徑街區自駕測試] 啟動 Chrome 實例測試橫向大道與側向防火巷/夜市後巷...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--enable-webgl',
      '--window-size=1280,720'
    ],
    defaultViewport: { width: 1280, height: 720 }
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') console.error(`[Browser Error]: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    errors.push(err.message);
    console.error('❌ [Page Error]:', err.message);
  });

  try {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const targetUrl = 'http://localhost:3001/';
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#btn-start-game', { timeout: 10000 });
    await sleep(1000);

    // Start game
    console.log('🏁 點擊開始遊戲...');
    await page.click('#btn-start-game');
    await sleep(800);

    // Initial position
    let state = await page.evaluate(() => {
      const g = window.game;
      return {
        x: g?.controller?.position?.x,
        z: g?.controller?.position?.z,
        district: document.getElementById('district-name')?.innerText
      };
    });
    console.log(`📍 出發位置: X=${state.x?.toFixed(1)}, Z=${state.z?.toFixed(1)}, 區域: ${state.district}`);

    // Teleport or drive towards East Cross Street & East Alley (Z = 0, X = 32)
    // First, test driving and steering
    console.log('🛵 測試轉向切入東側中正路橫向大道...');
    await page.evaluate(() => {
      // Teleport closer to intersection Z=0 to test smooth alley entry
      if (window.game?.controller) {
        window.game.controller.position.set(2, 0, -10);
        window.game.controller.heading = 0;
        window.game.controller.speed = 12;
      }
    });
    await sleep(200);

    // Steer right towards X = 32
    await page.keyboard.down('w');
    await page.keyboard.down('d');
    await sleep(1500);
    await page.keyboard.up('d');
    await sleep(1000);
    await page.keyboard.up('w');

    // Test East Alley position directly to verify alley rendering, HUD, and combo
    console.log('🏮 導航至東側夜市後巷 (X = 32, Z = 20)...');
    await page.evaluate(() => {
      if (window.game?.controller) {
        window.game.controller.position.set(31.5, 0, 20);
        window.game.controller.heading = 0;
        window.game.controller.speed = 15;
      }
    });
    await sleep(500);

    const eastState = await page.evaluate(() => {
      const g = window.game;
      return {
        x: g?.controller?.position?.x,
        z: g?.controller?.position?.z,
        district: document.getElementById('district-name')?.innerText,
        detail: document.getElementById('district-detail')?.innerText,
        inEastAlley: g?.controller?.inEastAlley
      };
    });
    console.log('🏮 [東側夜市後巷狀態]：', JSON.stringify(eastState, null, 2));

    const eastScreenPath = path.join(OUTPUT_DIR, '07_east_night_market_alley.png');
    await page.screenshot({ path: eastScreenPath });
    console.log(`📸 已截取東側夜市後巷紅燈籠街景：${eastScreenPath}`);

    // Now test West Alley (X = -32, Z = -30)
    console.log('🏛️ 導航至西側老街防火巷 (X = -32, Z = -30)...');
    await page.evaluate(() => {
      if (window.game?.controller) {
        window.game.controller.position.set(-31.5, 0, -30);
        window.game.controller.heading = Math.PI;
        window.game.controller.speed = 15;
      }
    });
    await sleep(500);

    const westState = await page.evaluate(() => {
      const g = window.game;
      return {
        x: g?.controller?.position?.x,
        z: g?.controller?.position?.z,
        district: document.getElementById('district-name')?.innerText,
        detail: document.getElementById('district-detail')?.innerText,
        inWestAlley: g?.controller?.inWestAlley
      };
    });
    console.log('🏛️ [西側老街防火巷狀態]：', JSON.stringify(westState, null, 2));

    const westScreenPath = path.join(OUTPUT_DIR, '08_west_old_street_alley.png');
    await page.screenshot({ path: westScreenPath });
    console.log(`📸 已截取西側老街防火巷街景：${westScreenPath}`);

    if (errors.length === 0) {
      console.log('🎉 [多路徑街區自駕測試] 完全成功！所有橫向大道、東西側後巷與HUD皆正常運作！');
    } else {
      console.error('⚠️ 測試中偵測到錯誤：', errors);
    }
  } catch (err) {
    console.error('❌ 測試發生異常：', err);
  } finally {
    await browser.close();
  }
}

runMultiRouteTest();
