import puppeteer from 'puppeteer-core';
import path from 'path';

async function testShowroom() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--use-gl=angle', '--use-angle=d3d11', '--no-sandbox'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  console.log('Navigating to http://localhost:3001/showroom.html...');
  await page.goto('http://localhost:3001/showroom.html', { waitUntil: 'domcontentloaded', timeout: 30000 });

  await new Promise(r => setTimeout(r, 1500));

  const screenshot1 = 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/showroom_glb_rendered.png';
  await page.screenshot({ path: screenshot1 });
  console.log('Captured showroom_glb_rendered.png');

  // Test selecting the GLB file input
  console.log('Uploading sample cygnus.glb to test stats analysis...');
  const fileInput = await page.$('#glb-file-input');
  const sampleFilePath = path.resolve('public/models/cygnus.glb');
  await fileInput.uploadFile(sampleFilePath);

  await new Promise(r => setTimeout(r, 1200));

  const stats = await page.evaluate(() => {
    const card = document.getElementById('model-stats-card');
    return {
      cardVisible: card && card.style.display !== 'none',
      tris: document.getElementById('stat-tris')?.textContent,
      verts: document.getElementById('stat-verts')?.textContent,
      size: document.getElementById('stat-size')?.textContent,
      mats: document.getElementById('stat-mats')?.textContent,
    };
  });
  console.log('Analyzed model stats:', stats);

  const screenshot2 = 'C:/Users/凱/.gemini/antigravity/brain/4eb164eb-a55c-418c-ae54-c60d3fa2f58a/showroom_custom_glb_stats.png';
  await page.screenshot({ path: screenshot2 });
  console.log('Captured showroom_custom_glb_stats.png');

  await browser.close();
  console.log('Showroom GLB test finished successfully!');
}

testShowroom().catch(err => {
  console.error(err);
  process.exit(1);
});
