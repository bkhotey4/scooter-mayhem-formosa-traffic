import puppeteer from 'puppeteer-core';
import path from 'path';

async function run() {
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

  // Click #btn-start-quit (離開遊戲 on Step 1)
  console.log('Clicking #btn-start-quit...');
  await page.click('#btn-start-quit');
  await new Promise(r => setTimeout(r, 600));

  // Verify exit modal is displayed (hidden class removed)
  const isExitModalVisible = await page.$eval('#exit-modal', el => !el.classList.contains('hidden'));
  console.log('Is exit modal visible after click?', isExitModalVisible);

  const screenshotPath1 = 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/exit_modal_displayed.png';
  await page.screenshot({ path: screenshotPath1 });
  console.log('Saved screenshot to:', screenshotPath1);

  // Click #btn-exit-try-close
  console.log('Clicking #btn-exit-try-close...');
  await page.click('#btn-exit-try-close');
  await new Promise(r => setTimeout(r, 500));

  const isTipVisible = await page.$eval('#exit-close-tip', el => el.style.display !== 'none');
  console.log('Is exit close tip visible?', isTipVisible);

  const screenshotPath2 = 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/exit_modal_with_tip.png';
  await page.screenshot({ path: screenshotPath2 });
  console.log('Saved screenshot to:', screenshotPath2);

  // Click #btn-exit-cancel
  console.log('Clicking #btn-exit-cancel (返回遊戲)...');
  await page.click('#btn-exit-cancel');
  await new Promise(r => setTimeout(r, 500));

  const isExitModalHidden = await page.$eval('#exit-modal', el => el.classList.contains('hidden'));
  console.log('Is exit modal hidden after cancel?', isExitModalHidden);

  await browser.close();
  console.log('Test completed successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
