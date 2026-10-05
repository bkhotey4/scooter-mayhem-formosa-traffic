import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

async function generateSampleGlb() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--use-gl=angle', '--use-angle=d3d11', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.app && window.app.factory);

  console.log('Exporting procedural Cygnus scooter to binary GLB via browser...');
  const base64Glb = await page.evaluate(async () => {
    const { GLTFExporter } = await import('/node_modules/three/examples/jsm/exporters/GLTFExporter.js');
    const factory = window.app.factory;
    const model = factory.createPlayerScooter({ lights: false });
    
    const exporter = new GLTFExporter();
    return new Promise((resolve, reject) => {
      exporter.parse(
        model,
        (result) => {
          // result is ArrayBuffer
          const bytes = new Uint8Array(result);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          resolve(btoa(binary));
        },
        (error) => reject(error),
        { binary: true }
      );
    });
  });

  const buffer = Buffer.from(base64Glb, 'base64');
  const targetDir = path.resolve('public/models');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const targetFile = path.join(targetDir, 'cygnus.glb');
  fs.writeFileSync(targetFile, buffer);
  console.log(`Successfully generated starter GLB file: ${targetFile} (${buffer.length} bytes)`);

  await browser.close();
}

generateSampleGlb().catch(err => {
  console.error(err);
  process.exit(1);
});
