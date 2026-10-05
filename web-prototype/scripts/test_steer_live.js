import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testSteering() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle0' });

  await page.waitForFunction(() => window.app && window.app.controller);
  console.log('Game initialized.');

  // Click start game button to leave title screen
  await page.click('#btn-start-game');
  await new Promise(r => setTimeout(r, 500));

  // Test Left turn (press A)
  await page.evaluate(() => {
    window.app.controller.reset(0, 0);
    window.app.controller.speed = 10;
  });

  await page.keyboard.down('KeyA');
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 350));
  const whileLeft = await page.evaluate(() => ({
    steerInput: window.app.controller.steerInput,
    x: window.app.controller.position.x,
    heading: window.app.controller.heading,
    roll: window.app.controller.rollAngle
  }));
  await new Promise(r => setTimeout(r, 250));
  await page.keyboard.up('KeyA');
  await page.keyboard.up('KeyW');

  console.log('While A pressed (Left):', whileLeft);

  // Reset scooter to center
  await page.evaluate(() => {
    window.app.controller.reset(0, 0);
    window.app.controller.speed = 10;
  });

  // Test Right turn (press D)
  await page.keyboard.down('KeyD');
  await page.keyboard.down('KeyW');
  await new Promise(r => setTimeout(r, 350));
  const whileRight = await page.evaluate(() => ({
    steerInput: window.app.controller.steerInput,
    x: window.app.controller.position.x,
    heading: window.app.controller.heading,
    roll: window.app.controller.rollAngle
  }));
  await new Promise(r => setTimeout(r, 250));
  await page.keyboard.up('KeyD');
  await page.keyboard.up('KeyW');

  console.log('While D pressed (Right):', whileRight);

  await browser.close();

  if (whileLeft.x < 0 && whileLeft.heading < 0 && whileRight.x > 0 && whileRight.heading > 0 && whileLeft.steerInput > 0 && whileRight.steerInput < 0) {
    console.log('SUCCESS: A steers left (negative X, negative heading, positive steer), D steers right (positive X, positive heading, negative steer)!');
    process.exit(0);
  } else {
    console.error('FAILED: Incorrect steering behavior!');
    process.exit(1);
  }
}

testSteering().catch(err => {
  console.error(err);
  process.exit(1);
});
