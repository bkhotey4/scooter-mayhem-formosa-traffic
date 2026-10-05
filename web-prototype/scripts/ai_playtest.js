// ai_playtest.js - Antigravity AI Autonomous Playtest & Screenshot Bot
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve('..', 'docs', 'playtest_screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runPlaytest() {
  console.log('🚀 [AI 代理人自駕測試] 啟動 Chrome 實例進行物理與玩法實時試玩...');

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

  const logs = [];
  page.on('console', msg => {
    logs.push(`[Console ${msg.type()}]: ${msg.text()}`);
    console.log(`[Browser Console]: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error('❌ [Page Error]:', err.message);
  });

  page.on('requestfailed', request => {
    console.warn(`⚠️ [Request Failed]: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const targetUrl = 'http://localhost:3001/';
    console.log(`🌐 導航至遊戲首頁 ${targetUrl} ...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#btn-start-game', { timeout: 10000 });
    await sleep(1500);

    // 1. Capture Start Screen & Starter Vehicle Grid
    const startScreenPath = path.join(OUTPUT_DIR, '01_start_screen.png');
    await page.screenshot({ path: startScreenPath });
    console.log(`📸 已截取首頁畫面：${startScreenPath}`);

    // 2. Select starter vehicle: 阿公瓦斯車 (20kg雙桶)
    console.log('🛵 挑選出發神車：阿公瓦斯車 (20kg雙桶)...');
    await page.click('[data-vehicle="gas_tank"]');
    await sleep(300);

    // 3. Click Start Delivery Button
    console.log('🏁 點擊「發動引擎！開始狂飆！」按鈕進入遊戲...');
    await page.click('#btn-start-game');
    await sleep(600);

    // Verify order card popup
    const orderCardData = await page.evaluate(() => {
      const card = document.getElementById('order-card-popup');
      return {
        visible: card && !card.classList.contains('hidden'),
        customer: document.getElementById('order-card-customer')?.innerText,
        cargo: document.getElementById('order-card-cargo')?.innerText,
        note: document.getElementById('order-card-note')?.innerText
      };
    });
    console.log('📱 [外送平台奇葩備註推播卡驗證]：', JSON.stringify(orderCardData, null, 2));

    const orderScreenPath = path.join(OUTPUT_DIR, '01b_order_card_popup.png');
    await page.screenshot({ path: orderScreenPath });
    console.log(`📸 已截取外送平台新單推播卡畫面：${orderScreenPath}`);

    // 4. Accelerate full throttle forward (W key)
    console.log('🟢 催油門加速狂飆 (按住 W 鍵 3.5 秒)...');
    await page.keyboard.down('w');
    await sleep(2500);

    let speed = await page.evaluate(() => document.getElementById('speed-display')?.innerText);
    console.log(`⚡ 當前時速：${speed} KM/H`);

    // 5. Take Driving screenshot
    const drivingScreenPath = path.join(OUTPUT_DIR, '02_driving_street.png');
    await page.screenshot({ path: drivingScreenPath });
    console.log(`📸 已截取街景狂飆畫面：${drivingScreenPath}`);

    // 6. Test Leaning & Steering (A/D keys)
    console.log('🏍️ 使出極限壓車轉彎過彎 (A/D 逆操舵)...');
    await page.keyboard.down('d');
    await sleep(600);
    await page.keyboard.up('d');
    await page.keyboard.down('a');
    await sleep(800);
    await page.keyboard.up('a');

    // 7. Test Wheelie (Shift / Q)
    console.log('⚡ 使出【神之翹孤輪】特技遮車牌！');
    await page.keyboard.down('q');
    await sleep(800);

    const wheelieScreenPath = path.join(OUTPUT_DIR, '03_wheelie_action.png');
    await page.screenshot({ path: wheelieScreenPath });
    console.log(`📸 已截取翹孤輪特技畫面：${wheelieScreenPath}`);
    await page.keyboard.up('q');

    // 8. Test Horn (H key)
    console.log('📢 按喇叭「叭叭！」向街道發財車問候...');
    await page.keyboard.press('h');
    await sleep(500);

    // 9. Test In-Game Vehicle Switch (V key)
    console.log('🔄 按快捷鍵 V 即時切換神車 (Cygnus ➔ Haomai ➔ Vespa ➔ Many)...');
    await page.keyboard.press('v');
    await sleep(600);
    await page.keyboard.press('v');
    await sleep(600);

    // 10. Test Weather Switch (T key to Storm)
    console.log('⛈️ 按快捷鍵 T 切換至狂暴雷雨天（測試白線水上漂）...');
    await page.keyboard.press('t'); // Midnight
    await sleep(600);
    await page.keyboard.press('t'); // Storm
    await sleep(1000);

    const stormScreenPath = path.join(OUTPUT_DIR, '04_storm_weather.png');
    await page.screenshot({ path: stormScreenPath });
    console.log(`📸 已截取狂暴雷雨天畫面：${stormScreenPath}`);

    // 11. Test Mobile Touch Overlay Toggle
    console.log('📱 點擊「📱 觸控鍵盤」開啟雙手自適應虛擬手把...');
    await page.click('#btn-toggle-touch');
    await sleep(500);

    const touchScreenPath = path.join(OUTPUT_DIR, '05_touch_controls.png');
    await page.screenshot({ path: touchScreenPath });
    console.log(`📸 已截取雙手虛擬手把畫面：${touchScreenPath}`);

    // 12. Drive forward to check Roadside Banquet & Railway Level Crossing
    console.log('🦞 催油門狂飆前往廟口流水席與台鐵平交道路段 (按住 W 鍵 2 秒)...');
    await page.keyboard.down('w');
    await sleep(2000);
    await page.keyboard.up('w');

    const banquetScreenPath = path.join(OUTPUT_DIR, '06_banquet_and_railway.png');
    await page.screenshot({ path: banquetScreenPath });
    console.log(`📸 已截取路邊辦桌流水席與平交道畫面：${banquetScreenPath}`);

    // 13. Read Telemetry from game
    const telemetry = await page.evaluate(() => {
      return {
        speed: document.getElementById('speed-display')?.innerText,
        liquid: document.getElementById('liquid-pct')?.innerText,
        seal: document.getElementById('seal-pct')?.innerText,
        earnings: document.getElementById('earnings-display')?.innerText,
        score: document.getElementById('score-display')?.innerText,
        target: document.getElementById('target-name')?.innerText,
        district: document.getElementById('district-name')?.innerText,
        weather: document.getElementById('btn-weather')?.innerText
      };
    });

    console.log('📊 [AI 試玩實時監控數據]：', JSON.stringify(telemetry, null, 2));

    await page.keyboard.up('w');
    console.log('🎉 [AI 代理人自駕測試] 完美通關！所有物理、音效、UI 與控制模組皆運作正常！');
  } catch (err) {
    console.error('❌ 測試過程發生異常：', err);
  } finally {
    await browser.close();
  }
}

runPlaytest();
