import puppeteer from 'puppeteer-core';

async function testGtaSandbox() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--use-gl=angle', '--use-angle=d3d11', '--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:3001...');
  await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.app && window.app.running !== undefined);

  // 1. Start Driving (Next to Step 2 -> Start)
  console.log('Starting game...');
  await page.click('#btn-goto-page2');
  await new Promise(r => setTimeout(r, 400));
  await page.click('#btn-start-game');
  await new Promise(r => setTimeout(r, 1200));

  // 2. Press F to dismount (On-foot Mode)
  console.log('Pressing F to dismount onto foot...');
  await page.keyboard.press('KeyF');
  await new Promise(r => setTimeout(r, 800));

  const screenshotOnFoot = 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/gta_sandbox_on_foot.png';
  await page.screenshot({ path: screenshotOnFoot });
  console.log('Captured gta_sandbox_on_foot.png');

  // 3. Press H to trigger Meme Horn & Comic Speech Bubble
  console.log('Pressing H to trigger Meme Horn & Speech Bubble...');
  await page.keyboard.press('KeyH');
  await new Promise(r => setTimeout(r, 400));

  const screenshotHorn = 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/gta_sandbox_meme_horn.png';
  await page.screenshot({ path: screenshotHorn });
  console.log('Captured gta_sandbox_meme_horn.png');

  // 4. Trigger Story Quest Dialogue (Open Ming Quest)
  console.log('Opening Story Quest Dialogue Modal...');
  await page.evaluate(() => {
    const mingQuest = window.app.taiwanSandbox.quests[0];
    window.app.taiwanSandbox.openQuestModal(mingQuest);
  });
  await new Promise(r => setTimeout(r, 600));

  const screenshotQuest = 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/gta_sandbox_quest_dialogue.png';
  await page.screenshot({ path: screenshotQuest });
  console.log('Captured gta_sandbox_quest_dialogue.png');

  // 5. Test Wanted Star Level
  console.log('Testing Wanted Stars...');
  await page.evaluate(() => {
    window.app.traffic.addWantedHeat(2);
  });
  await new Promise(r => setTimeout(r, 500));

  const screenshotWanted = 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/gta_sandbox_wanted_stars.png';
  await page.screenshot({ path: screenshotWanted });
  console.log('Captured gta_sandbox_wanted_stars.png');

  await browser.close();
  console.log('GTA Sandbox test passed successfully!');
}

testGtaSandbox().catch(err => {
  console.error(err);
  process.exit(1);
});
