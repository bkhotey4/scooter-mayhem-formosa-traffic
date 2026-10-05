import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function capturePages() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,720']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));

  // Screenshot Page 1 (Map on Left, Scooter on Right, Quit on Bottom)
  const p1Path = path.resolve('..', 'docs', 'start_screen_page1.png');
  await page.screenshot({ path: p1Path });
  console.log('Saved Page 1 screenshot to', p1Path);

  // Navigate to Page 2
  await page.click('#btn-goto-page2');
  await page.waitForFunction(() => document.getElementById('start-page-1').classList.contains('hidden'));
  await new Promise(r => setTimeout(r, 600));

  // Screenshot Page 2 (Modes on Left, Start/MP on Right)
  const p2Path = path.resolve('..', 'docs', 'start_screen_page2.png');
  await page.screenshot({ path: p2Path });
  console.log('Saved Page 2 screenshot to', p2Path);

  await browser.close();
}

capturePages().catch(console.error);
