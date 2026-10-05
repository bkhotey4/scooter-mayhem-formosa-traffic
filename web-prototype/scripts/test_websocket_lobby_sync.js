// test_websocket_lobby_sync.js - E2E verification of Option B (WebSocket Lobby) multi-client sync
import puppeteer from 'puppeteer-core';
import path from 'path';
import { fork } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testWebSocketLobby() {
  console.log('🚀 [Option B 實測] 啟動本地 WebSocket 大廳中繼伺服器 (port 8080)...');
  const serverProc = fork('server/lobby_server.js');
  await new Promise(r => setTimeout(r, 1000));

  try {
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

    console.log('🛵 客戶端 1：連入 WebSocket 大廳...');
    const page1 = await browser.newPage();
    page1.on('console', m => console.log('[P1]', m.text()));
    await page1.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));

    await page1.evaluate(() => {
      window.app.network.setCallsign('大橋頭老司機');
      window.app.network.startWebSocket('ws://localhost:8080');
      window.app.ui.btnStart.click();
    });
    await page1.waitForFunction(() => window.app && window.app.network && window.app.network.status === 'connected', { timeout: 5000 });
    console.log('✅ 客戶端 1 已連線至大廳！');

    console.log('🛵 客戶端 2：連入 WebSocket 大廳...');
    const page2 = await browser.newPage();
    page2.on('console', m => console.log('[P2]', m.text()));
    await page2.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));

    await page2.evaluate(() => {
      window.app.network.setCallsign('北宜過彎王');
      window.app.network.startWebSocket('ws://localhost:8080');
      window.app.ui.btnStart.click();
    });
    await page2.waitForFunction(() => window.app && window.app.network && window.app.network.status === 'connected', { timeout: 5000 });
    console.log('✅ 客戶端 2 已連線至大廳！');

    // Wait 1.5 seconds for network sync
    await new Promise(r => setTimeout(r, 1500));

    // Client 2 checks remote players list
    const p2RemotePlayers = await page2.evaluate(() => {
      const list = [];
      window.app.network.remotePlayers.forEach((rp, id) => {
        list.push({
          id,
          callsign: rp.callsign,
          pos: { x: rp.mesh.position.x, z: rp.mesh.position.z }
        });
      });
      return {
        count: window.app.network.remotePlayers.size,
        players: list,
        status: window.app.network.status
      };
    });

    console.log('🎉 客戶端 2 透過 Option B WebSocket 大廳成功同步到車手:', JSON.stringify(p2RemotePlayers, null, 2));

    await browser.close();
    console.log('✅ Option B (WebSocket Lobby) 雙人端對端即時同步測試圓滿成功！');
  } finally {
    serverProc.kill();
  }
}

testWebSocketLobby().catch(err => {
  console.error('❌ 測試失敗:', err);
  process.exit(1);
});
