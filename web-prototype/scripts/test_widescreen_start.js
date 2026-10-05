import puppeteer from 'puppeteer-core';

async function testWidescreenWindows() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--use-gl=angle', '--use-angle=d3d11', '--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => window.app && window.app.running !== undefined);

    // Capture Page 1 (Left: Map Window, Right: Scooter Window)
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/start_modal_widescreen_page1.png' });
    console.log('Captured start_modal_widescreen_page1.png');

    // Click next page to view Page 2 (Left: Mode Window, Right: Launch Window)
    await page.click('#btn-goto-page2');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/start_modal_widescreen_page2.png' });
    console.log('Captured start_modal_widescreen_page2.png');

    console.log('Widescreen capture done!');
  } finally {
    await browser.close();
  }
}

testWidescreenWindows().catch(err => {
  console.error(err);
  process.exit(1);
});
