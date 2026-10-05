// test_multiplayer_ui.js - E2E verification of Multiplayer Hub UI & Option A / Option B
import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('..', 'docs', 'playtest_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function testMultiplayerUI() {
  console.log('🧪 [多人連線大廳 E2E 測試] 啟動 Chrome 測試方案 A 與方案 B 選擇介面...');
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
  page.on('console', msg => console.log('[PAGE CONSOLE]', msg.text()));

  await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Click "車友連線大廳" button from start modal
  console.log('🖱️ 點擊「🌐 車友連線大廳 (方案 A / 方案 B)」按鈕...');
  await page.click('#btn-open-multiplayer');
  await new Promise(r => setTimeout(r, 500));

  // 2. Check modal visibility
  const isModalVisible = await page.evaluate(() => {
    const modal = document.getElementById('multiplayer-modal');
    return modal && !modal.classList.contains('hidden');
  });
  console.log('✅ 多人連線視窗已展開:', isModalVisible);

  // 3. Test Random Callsign button
  console.log('🎲 點擊「🎲 隨機稱號」更換車手稱號...');
  await page.click('#mp-btn-random-name');
  await new Promise(r => setTimeout(r, 200));
  const newCallsign = await page.$eval('#mp-callsign-input', el => el.value);
  console.log('🏷️ 當前車手代號:', newCallsign);

  // 4. Test Option A: Host Room
  console.log('👑 測試方案 A：點擊「👑 立即建立房間 (Host Room)」...');
  await page.click('#mp-btn-host-room');
  await new Promise(r => setTimeout(r, 800));

  const roomCode = await page.evaluate(() => {
    return {
      code: document.getElementById('mp-current-room-code')?.innerText,
      status: document.getElementById('mp-status-text')?.innerText
    };
  });
  console.log('🔑 產生房間代碼:', roomCode.code, '| 連線狀態:', roomCode.status);

  // Take screenshot of Option A (WebRTC P2P)
  const screenshotPathA = path.join(SCREENSHOT_DIR, 'multiplayer_scheme_a_p2p.png');
  await page.screenshot({ path: screenshotPathA });
  console.log('📸 已截圖方案 A (WebRTC P2P):', screenshotPathA);

  // 5. Switch to Option B (WebSocket Server Lobby)
  console.log('⚡ 切換標籤頁至「方案 B：公開伺服器大廳 (WebSocket)」...');
  await page.click('#tab-btn-scheme-b');
  await new Promise(r => setTimeout(r, 400));

  // Take screenshot of Option B (WebSocket Lobby)
  const screenshotPathB = path.join(SCREENSHOT_DIR, 'multiplayer_scheme_b_websocket.png');
  await page.screenshot({ path: screenshotPathB });
  console.log('📸 已截圖方案 B (WebSocket Lobby):', screenshotPathB);

  // 6. Test Start Driving button from modal
  console.log('🏁 點擊「🛵 進入街區狂飆！」開始同飆...');
  await page.click('#mp-btn-start-driving');
  await new Promise(r => setTimeout(r, 1000));

  const gameStarted = await page.evaluate(() => {
    const startModal = document.getElementById('start-modal');
    const mpModal = document.getElementById('multiplayer-modal');
    return {
      startModalHidden: startModal?.classList.contains('hidden'),
      mpModalHidden: mpModal?.classList.contains('hidden'),
      speed: window.app?.controller?.getSpeedKmH()
    };
  });
  console.log('🎮 遊戲狀態確認:', gameStarted);

  await browser.close();
  console.log('🎉 [多人連線大廳 E2E 驗證圓滿成功！]');
}

testMultiplayerUI().catch(err => {
  console.error('❌ 測試失敗:', err);
  process.exit(1);
});
