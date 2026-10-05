import puppeteer from 'puppeteer-core';

async function testCityExpansion() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--use-gl=angle', '--use-angle=d3d11', '--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push(`[CONSOLE ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err.message));

  try {
    console.log('Navigating to http://localhost:3001/ ...');
    await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => window.app && window.app.running !== undefined);

    // 1. Navigate to Page 2 of the two-step starter modal
    await page.click('#btn-goto-page2');
    await new Promise(r => setTimeout(r, 400));

    // Select Free Practice mode so we can drive anywhere without delivery pressure
    await page.click('[data-play-mode="practice"]');
    await page.click('#btn-start-game');
    await new Promise(r => setTimeout(r, 1200));

    // Initial spawn screenshot
    await page.screenshot({ path: 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/city_spawn_hud.png' });
    console.log('Captured city_spawn_hud.png');

    // Check initial road sign
    const initialRoad = await page.$eval('#road-sign-name', el => el.textContent);
    const initialSub = await page.$eval('#road-sign-sub', el => el.textContent);
    console.log(`Initial road sign: ${initialRoad} (${initialSub})`);

    // 2. Open World Map Modal (M key) to inspect expanded 4x4 road grid
    await page.keyboard.press('KeyM');
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/city_expanded_map.png' });
    console.log('Captured city_expanded_map.png');
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));

    // 3. Drive up north towards Beimen Roundabout (Z = -230)
    console.log('Driving north towards North Gate Roundabout (Z = -230)...');
    await page.evaluate(() => {
      // Teleport near North Gate to inspect the monument & roundabout
      app.controller.reset(0, -210, Math.PI);
    });
    await new Promise(r => setTimeout(r, 1000));
    const northGateRoad = await page.$eval('#road-sign-name', el => el.textContent);
    console.log(`Near North Gate road sign: ${northGateRoad}`);
    await page.screenshot({ path: 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/city_north_gate_monument.png' });
    console.log('Captured city_north_gate_monument.png');

    // 4. Drive west towards Tamsui River Promenade (X = -125, Z = 0)
    console.log('Driving to Tamsui River Promenade (X = -125)...');
    await page.evaluate(() => {
      app.controller.reset(-125, 0, 0);
    });
    await new Promise(r => setTimeout(r, 1000));
    const riverRoad = await page.$eval('#road-sign-name', el => el.textContent);
    console.log(`River road sign: ${riverRoad}`);
    await page.screenshot({ path: 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/city_river_promenade.png' });
    console.log('Captured city_river_promenade.png');

    // 5. Test real driving: press W and drive through city streets
    await page.keyboard.down('KeyW');
    await new Promise(r => setTimeout(r, 1500));
    await page.keyboard.down('KeyD');
    await new Promise(r => setTimeout(r, 1000));
    await page.keyboard.up('KeyD');
    await new Promise(r => setTimeout(r, 1000));
    await page.keyboard.up('KeyW');

    const speed = await page.$eval('#speed-display', el => el.textContent);
    console.log(`Speed after driving: ${speed} km/h`);
    await page.screenshot({ path: 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/city_driving_turn.png' });
    console.log('Captured city_driving_turn.png');

    console.log('ALL PLAYTEST STEPS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

testCityExpansion().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
