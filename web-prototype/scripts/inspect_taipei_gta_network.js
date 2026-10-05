import puppeteer from 'puppeteer-core';

async function inspectNetwork() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--use-gl=angle', '--use-angle=d3d11', '--no-sandbox']
  });

  const page = await browser.newPage();
  const requests = [];

  page.on('request', req => {
    requests.push({
      url: req.url(),
      resourceType: req.resourceType()
    });
  });

  console.log('Navigating to https://taipei-gta.vercel.app/...');
  await page.goto('https://taipei-gta.vercel.app/', { waitUntil: 'networkidle2', timeout: 30000 });

  // Click start game button if exists
  try {
    const btn = await page.$('button');
    if (btn) await btn.click();
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {}

  console.log('\n--- Intercepted Network Requests (' + requests.length + ') ---');
  for (const r of requests) {
    if (!r.url.startsWith('data:')) {
      console.log(`[${r.resourceType}] ${r.url}`);
    }
  }

  // Check window object in page
  const pageGlobals = await page.evaluate(() => {
    return {
      hasThree: !!window.THREE,
      keys: Object.keys(window).filter(k => !k.startsWith('webkit') && !k.startsWith('on')),
    };
  });
  console.log('\nPage globals:', pageGlobals);

  await browser.close();
}

inspectNetwork().catch(console.error);
