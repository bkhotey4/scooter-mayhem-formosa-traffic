import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testQuitButtons() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle0' });

  // 1. Check start screen has exit button
  const startQuitExists = await page.$('#btn-start-quit');
  console.log('1. Start quit button exists:', !!startQuitExists);

  // 2. Start game
  await page.click('#btn-start-game');
  await new Promise(r => setTimeout(r, 600));

  // Verify game is running
  const isRunning = await page.evaluate(() => window.app.running);
  console.log('2. Game running:', isRunning);

  // 3. Click HUD quit button: #btn-hud-quit
  const hudQuitExists = await page.$('#btn-hud-quit');
  console.log('3. HUD quit button exists:', !!hudQuitExists);
  await page.click('#btn-hud-quit');
  await new Promise(r => setTimeout(r, 300));

  // Verify pause modal is visible
  const pauseModalHidden = await page.evaluate(() => document.getElementById('pause-modal').classList.contains('hidden'));
  console.log('4. Pause modal visible after clicking HUD quit:', !pauseModalHidden);

  // 5. Click "返回出發主選單" button: #btn-return-menu
  await page.click('#btn-return-menu');
  await new Promise(r => setTimeout(r, 300));

  // Verify back to start screen
  const startModalHidden = await page.evaluate(() => document.getElementById('start-modal').classList.contains('hidden'));
  const isRunningAfterMenu = await page.evaluate(() => window.app.running);
  console.log('5. Back to start screen (start modal visible):', !startModalHidden, 'Game running:', isRunningAfterMenu);

  await browser.close();

  if (startQuitExists && hudQuitExists && !pauseModalHidden && !startModalHidden && !isRunningAfterMenu) {
    console.log('SUCCESS: All quit and menu navigation buttons verified perfectly!');
    process.exit(0);
  } else {
    console.error('FAILED: Quit button navigation test failed!');
    process.exit(1);
  }
}

testQuitButtons().catch(err => {
  console.error(err);
  process.exit(1);
});
