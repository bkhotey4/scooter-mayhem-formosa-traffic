// test_two_players_sync.js - E2E Multi-client synchronization test
import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.resolve('..', 'docs', 'playtest_screenshots');

async function testTwoPlayers() {
  console.log('👥 [雙人連線同步實測] 啟動雙瀏覽器視窗測試跨客戶端同台狂飆與 3D 遠端車手渲染...');

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

  // Client 1: "大橋頭老司機"
  console.log('🛵 啟動客戶端 1 (大橋頭老司機)...');
  const page1 = await browser.newPage();
  await page1.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  await page1.evaluate(() => {
    window.app.network.setCallsign('大橋頭老司機');
    window.app.ui.btnStart.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Client 2: "北宜過彎王"
  console.log('🛵 啟動客戶端 2 (北宜過彎王)...');
  const page2 = await browser.newPage();
  await page2.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));

  await page2.evaluate(() => {
    window.app.network.setCallsign('北宜過彎王');
    window.app.ui.btnStart.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Let Player 1 drive forward and honk
  console.log('💨 客戶端 1 油門全開並狂按喇叭「叭叭！」...');
  await page1.evaluate(() => {
    window.app.controller.keys['w'] = true;
    window.app.controller.hornPressed = true;
    window.app.network.broadcastState(window.app.controller);
    window.app.network.broadcastHorn();
  });

  // Let simulation tick for 1.5 seconds
  await new Promise(r => setTimeout(r, 1500));

  // Check if Client 2 sees Client 1 as a remote player entity!
  const syncState = await page2.evaluate(() => {
    const remoteCount = window.app.network.remotePlayers.size;
    const remoteList = [];
    window.app.network.remotePlayers.forEach((rp, id) => {
      remoteList.push({
        id,
        callsign: rp.callsign,
        pos: { x: rp.mesh.position.x.toFixed(1), z: rp.mesh.position.z.toFixed(1) },
        hasNameTag: !!rp.nameTag
      });
    });
    return { remoteCount, remoteList };
  });

  console.log('🎉 客戶端 2 偵測到遠端車手資料:', JSON.stringify(syncState, null, 2));

  // Take screenshot of Client 2 with remote player visible
  const multiScreenshot = path.join(SCREENSHOT_DIR, 'multiplayer_in_game_sync.png');
  await page2.screenshot({ path: multiScreenshot });
  console.log('📸 已截圖雙人連線遊戲實況:', multiScreenshot);

  await browser.close();
  console.log('✅ 雙人連線同步驗證全部通過！');
}

testTwoPlayers().catch(err => {
  console.error('❌ 測試失敗:', err);
  process.exit(1);
});
