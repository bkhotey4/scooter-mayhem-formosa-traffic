import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--use-gl=angle','--use-angle=d3d11'],defaultViewport:{width:1440,height:900}});
const page=await browser.newPage(),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
try{
await page.goto('http://127.0.0.1:3001/',{waitUntil:'domcontentloaded',timeout:60000});await page.waitForFunction(()=>window.app?.worldMap);
await page.click('[data-play-mode="practice"]');await page.click('#btn-start-game');
const blocked=await page.evaluate(()=>{
 const paths=[...[-64,64].map(x=>[x,-190,x,190]),...[-190,190].map(z=>[-64,z,64,z]),...[-90,0,90].flatMap(z=>[[-64,z,-32,z],[32,z,64,z]])],bad=[];
 for(const [x1,z1,x2,z2] of paths)for(let t=0;t<=1;t+=1/400){const x=x1+(x2-x1)*t,z=z1+(z2-z1)*t,c=app.cityData.colliders.find(c=>x>c.minX-.5&&x<c.maxX+.5&&z>c.minZ-.5&&z<c.maxZ+.5);if(c){bad.push({x,z,c});break;}}return bad;
});assert.deepEqual(blocked,[]);
await page.click('#btn-world-map');assert.equal(await page.$eval('#world-map',e=>e.open),true);
const pos=await page.evaluate(()=>app.controller.position.toArray());await page.keyboard.down('w');await new Promise(r=>setTimeout(r,500));await page.keyboard.up('w');assert.deepEqual(await page.evaluate(()=>app.controller.position.toArray()),pos);
await page.screenshot({path:'../docs/exploration-map-20261005.png'});await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>app.mapOpen),false);
const drive=await page.evaluate(()=>{
 const c=app.controller,results=[];app.setPaused(true);
 for(const [x,z,h,axis,end] of [[-64,-185,0,'z',180],[64,-185,0,'z',180],[-62,190,Math.PI/2,'x',60],[-62,-190,Math.PI/2,'x',60],[-63,0,Math.PI/2,'x',-33],[33,90,Math.PI/2,'x',62]]){
 c.reset(x,z,h);c.keys.w=true;for(let i=0;i<2500&&c.position[axis]<end;i++)c.update(1/60,app.cityData.bounds,[],app.cityData.colliders,[],[]);results.push({axis,end,actual:c.position[axis]});}c.keys={};return results;
});for(const r of drive)assert.ok(r.actual>=r.end,JSON.stringify(r));
await page.evaluate(()=>{app.controller.reset(-64,-125,0);app.worldMap.update(true);app.worldMap.toggle();});assert.match(await page.$eval('#exploration-count',e=>e.textContent),/1 \/ 6/);
await page.reload({waitUntil:'domcontentloaded',timeout:60000});await page.waitForFunction(()=>window.app?.worldMap);assert.equal(await page.evaluate(()=>app.worldMap.progress.visited.has('river')),true);
await page.click('[data-play-mode="practice"]');await page.click('#btn-start-game');await page.evaluate(()=>app.controller.reset(-64,-150,0));await new Promise(r=>setTimeout(r,900));await page.screenshot({path:'../docs/exploration-river-20261005.png'});
await page.setViewport({width:390,height:844});await page.click('#btn-world-map');
assert.equal(await page.$eval('#world-map',e=>e.open&&e.scrollWidth<=e.clientWidth),true);
await page.screenshot({path:'../docs/exploration-mobile-20261005.png'});
await page.click('#close-world-map');assert.equal(await page.evaluate(()=>app.mapOpen),false);
assert.deepEqual(errors,[]);console.log(JSON.stringify({routes:drive,errors,persistence:true,mapPause:true}));
}finally{await browser.close();}


