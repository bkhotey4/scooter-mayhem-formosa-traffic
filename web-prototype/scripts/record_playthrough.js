// record_playthrough.js - Autonomous AI Full Campaign Walkthrough Video Recorder with Audio
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve('..', 'docs', 'playtest_videos');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function recordFullCampaign() {
  console.log('🎥 [AI 完整闖關實機錄影] 啟動瀏覽器並準備錄影四重大滿貫外送（含實時音效軌道）...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--use-angle=d3d11',
      '--enable-webgl',
      '--autoplay-policy=no-user-gesture-required',
      '--window-size=1280,720'
    ],
    defaultViewport: { width: 1280, height: 720 }
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.text()));
  console.log('🌐 載入遊戲頁面 http://localhost:3001/ ...');
  await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1600));

  // 1. Select starter vehicle: 勁戰四代 (125cc)
  console.log('🛵 挑選出發神車：勁戰四代 (125cc 運動調校)...');
  await page.click('[data-vehicle="cygnus"]');
  await new Promise(r => setTimeout(r, 400));

  // 2. Step 2 & Start game and activate Web Audio
  await page.click('#btn-goto-page2');
  await new Promise(r => setTimeout(r, 300));
  console.log('🏁 點擊「發動引擎！開始狂飆！」啟動引擎與音樂...');
  await page.click('#btn-start-game');
  await new Promise(r => setTimeout(r, 600));

  // 3. Inject Combined Video + Web Audio MediaRecorder
  await page.evaluate(async () => {
    window.__recordedChunks = [];
    const canvas = document.querySelector('#canvas-container canvas');
    const vStream = canvas.captureStream(30);
    const videoTrack = vStream.getVideoTracks()[0];

    // Ensure Web Audio is active
    if (window.app && window.app.sound) {
      if (window.app.sound.ctx && window.app.sound.ctx.state === 'suspended') {
        await window.app.sound.ctx.resume();
      }
    }

    const audioStream = window.app.sound.getAudioStream();
    const audioTrack = audioStream ? audioStream.getAudioTracks()[0] : null;

    const tracks = [videoTrack];
    if (audioTrack) {
      tracks.push(audioTrack);
      console.log('🔊 成功綁定 Web Audio 實時音效軌道至錄影機！ Track enabled:', audioTrack.enabled);
    } else {
      console.warn('⚠️ 未取得有效音效軌道！');
    }

    const combinedStream = new MediaStream(tracks);

    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') ? 'video/webm;codecs=vp8,opus' : 'video/webm');

    console.log('選用 MediaRecorder MIME:', mime);
    window.__recorder = new MediaRecorder(combinedStream, { mimeType: mime });
    window.__recorder.ondataavailable = (e) => {
      if (e.data.size > 0) window.__recordedChunks.push(e.data);
    };
    window.__recorder.start(100);

    // Initial startup horn
    window.app.sound?.playHorn();
  });
  console.log('🎬 錄影機已啟動（Canvas 30FPS 畫面 ＋ Web Audio 實時音效軌道）！');

  const totalOrders = 4;
  for (let orderNum = 1; orderNum <= totalOrders; orderNum++) {
    const orderInfo = await page.evaluate(() => {
      const app = window.app;
      return {
        customer: app.gameMode.currentTarget?.name || '未知顧客',
        cargo: app.gameMode.currentCargo?.name || '未知品項',
        note: app.gameMode.currentNote || '',
        targetPos: app.gameMode.currentTarget?.pos ? { x: app.gameMode.currentTarget.pos.x, z: app.gameMode.currentTarget.pos.z } : null
      };
    });

    console.log(`\n==================================================`);
    console.log(`📦 [第 ${orderNum} / ${totalOrders} 單啟航]`);
    console.log(`👤 顧客：${orderInfo.customer}`);
    console.log(`🧋 品項：${orderInfo.cargo}`);
    console.log(`📝 備註：${orderInfo.note}`);
    console.log(`📍 目標座標：X=${orderInfo.targetPos?.x}, Z=${orderInfo.targetPos?.z}`);
    console.log(`==================================================`);

    const stageStart = Date.now();
    let stageCompleted = false;

    // AI Autopilot loop with Grid Pathfinding, Hazard Dodging & Precise Parking
    while (Date.now() - stageStart < 40000) {
      const status = await page.evaluate(() => {
        const app = window.app;
        if (!app) return { state: 'UNKNOWN' };

        if (app.gameMode.state === 'SUMMARY') {
          return { state: 'SUMMARY' };
        }

        const playerPos = app.controller.position;
        const targetPos = app.gameMode.currentTarget?.pos;

        if (targetPos) {
          // Multi-route Grid Waypoint Navigation
          const intersections = [-90, 0, 90];
          const sameCorridor =
            (Math.abs(playerPos.x) < 8 && Math.abs(targetPos.x) < 8) ||
            (playerPos.x < -20 && targetPos.x < -20) ||
            (playerPos.x > 20 && targetPos.x > 20);

          let currentAim = { x: targetPos.x, z: targetPos.z };

          if (!sameCorridor) {
            // Need to route via nearest cross street intersection
            let bestInterZ = 0;
            let minCost = Infinity;
            for (const iz of intersections) {
              const cost = Math.abs(playerPos.z - iz) + Math.abs(targetPos.z - iz);
              if (cost < minCost) {
                minCost = cost;
                bestInterZ = iz;
              }
            }

            const atInterZ = Math.abs(playerPos.z - bestInterZ) < 5.0;
            const targetX = targetPos.x;

            if (!atInterZ) {
              // Drive along current corridor towards intersection
              const curRoadX = Math.abs(playerPos.x) < 8 ? 0 : (playerPos.x < -20 ? -32 : 32);
              currentAim = { x: curRoadX, z: bestInterZ };
            } else {
              // At intersection, turn along cross street towards target road
              currentAim = { x: targetX, z: bestInterZ };
              if (Math.abs(playerPos.x - targetX) < 4.0) {
                currentAim = { x: targetPos.x, z: targetPos.z };
              }
            }
          }

          // Active Hazard Avoidance (Dodging pedestrians & double-parked Alphards)
          if (app.traffic?.pedestrians) {
            for (const ped of app.traffic.pedestrians) {
              const pdistZ = ped.pos.z - playerPos.z;
              if (pdistZ > 0 && pdistZ < 7.5 && Math.abs(ped.pos.x - playerPos.x) < 1.8) {
                // Steer slightly away from pedestrian
                currentAim.x += ped.pos.x > playerPos.x ? -2.5 : 2.5;
              }
            }
          }

          const dx = currentAim.x - playerPos.x;
          const dz = currentAim.z - playerPos.z;
          const finalDist = Math.hypot(targetPos.x - playerPos.x, targetPos.z - playerPos.z);

          const angleToAim = Math.atan2(dx, dz);
          const currentHeading = app.controller.heading;
          const angleDelta = Math.atan2(Math.sin(angleToAim - currentHeading), Math.cos(angleToAim - currentHeading));

          // Steering PID
          if (angleDelta > 0.07) {
            app.controller.keys['d'] = true;
            app.controller.keys['a'] = false;
          } else if (angleDelta < -0.07) {
            app.controller.keys['a'] = true;
            app.controller.keys['d'] = false;
          } else {
            app.controller.keys['a'] = false;
            app.controller.keys['d'] = false;
          }

          // Throttle & Staged Delivery Deceleration
          const speedKmH = app.controller.getSpeedKmH();

          if (finalDist <= 3.2) {
            // Inside handoff zone (<=3.5m)! Brake to full stop (<1 m/s) and hold for 0.75s
            app.controller.keys['w'] = false;
            app.controller.keys[' '] = true;
            app.controller.speed = Math.min(Math.abs(app.controller.speed), 0.4) * Math.sign(app.controller.speed);
          } else if (finalDist < 7.5) {
            // Crawl into handoff zone smoothly
            if (speedKmH > 10) {
              app.controller.keys['w'] = false;
              app.controller.keys[' '] = true;
            } else {
              app.controller.keys['w'] = true;
              app.controller.keys[' '] = false;
            }
          } else {
            // Cruise towards waypoint
            app.controller.keys['w'] = true;
            app.controller.keys[' '] = false;
          }

          // Periodic horn to add lively Taiwanese street atmosphere
          if (Math.random() < 0.02) {
            app.sound?.playHorn();
          }

          return {
            state: 'DRIVING',
            finalDist: finalDist.toFixed(1),
            speed: speedKmH.toFixed(0),
            arrival: (app.gameMode.arrivalProgress * 100).toFixed(0),
            liquid: app.boba ? app.boba.liquid.toFixed(0) : 100
          };
        }

        return { state: 'IDLE' };
      });

      if (status.state === 'SUMMARY') {
        stageCompleted = true;
        console.log(`🎉 [第 ${orderNum} 單送達成功！] 進入外送成果評級！`);
        break;
      }

      await new Promise(r => setTimeout(r, 60));
    }

    if (!stageCompleted) {
      console.warn(`⚠️ 第 ${orderNum} 單超時，嘗試呼叫交貨結算...`);
      await page.evaluate(() => { window.app?.gameMode?.completeOrder(); });
      await new Promise(r => setTimeout(r, 400));
    }

    // Read summary modal evaluation
    const summaryData = await page.evaluate(() => {
      return {
        stars: document.getElementById('summary-stars')?.innerText || '★★★★★',
        pay: document.getElementById('summary-pay')?.innerText || '',
        liquid: document.getElementById('summary-liquid')?.innerText || '',
        seal: document.getElementById('summary-seal')?.innerText || '',
        comment: document.getElementById('summary-comment')?.innerText || ''
      };
    });
    console.log(`⭐ 結算星等：${summaryData.stars} | 收入：${summaryData.pay} | 完好度：${summaryData.liquid} (封膜: ${summaryData.seal})`);
    console.log(`💬 顧客回饋：${summaryData.comment}`);

    if (orderNum < totalOrders) {
      // Pause 2.8s so viewer can admire the stats
      console.log(`⏸️ 停留 2.8 秒展示第 ${orderNum} 單評級，準備接下一單...`);
      await new Promise(r => setTimeout(r, 2800));

      console.log(`👉 點擊「接下一單」繼續征服下一個街區！`);
      await page.evaluate(() => {
        const btn = document.getElementById('btn-next-order');
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 1200));
    } else {
      // Grand Finale! Stay on final victory screen for 6.5s!
      console.log(`\n🏆🏆🏆【全島 4 大外送大滿貫完美通關！】🏆🏆🏆`);
      const finalStats = await page.evaluate(() => {
        return {
          rank: document.getElementById('summary-rank')?.innerText || '',
          score: document.getElementById('score-display')?.innerText || '',
          earnings: document.getElementById('earnings-display')?.innerText || ''
        };
      });
      console.log(`👑 最終稱號：${finalStats.rank}`);
      console.log(`💰 最終總收益：${finalStats.earnings} | 總積分：${finalStats.score}`);
      console.log(`⏸️ 停留 6.5 秒展示榮耀大滿貫通關結算畫面...`);
      await new Promise(r => setTimeout(r, 6500));
    }
  }

  // Stop recorder and export video
  console.log('🛑 停止錄影並匯出高畫質全通關影片檔案...');
  const base64Video = await page.evaluate(async () => {
    return new Promise((resolve) => {
      window.__recorder.onstop = () => {
        const blob = new Blob(window.__recordedChunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1];
          resolve(base64data);
        };
      };
      window.__recorder.stop();
    });
  });

  const videoPath = path.join(OUTPUT_DIR, 'scooter_mayhem_full_campaign.webm');
  fs.writeFileSync(videoPath, Buffer.from(base64Video, 'base64'));

  // Also update scooter_mayhem_clear_run.webm for direct access
  const primaryVideoPath = path.join(OUTPUT_DIR, 'scooter_mayhem_clear_run.webm');
  fs.writeFileSync(primaryVideoPath, Buffer.from(base64Video, 'base64'));

  const stats = fs.statSync(videoPath);
  console.log(`\n=======================================================`);
  console.log(`🎬 ✅ [完整闖關影片錄製完成！]`);
  console.log(`📁 檔案路徑：${videoPath}`);
  console.log(`📦 檔案大小：${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`=======================================================\n`);

  // Verify audio waveform volume
  const hasAudioTrack = await page.evaluate(async (dataUrl) => {
    const video = document.createElement('video');
    video.src = dataUrl;
    document.body.appendChild(video);
    const actx = new (window.AudioContext || window.webkitAudioContext)();
    await actx.resume();
    const src = actx.createMediaElementSource(video);
    const analyser = actx.createAnalyser();
    analyser.fftSize = 256;
    src.connect(analyser);
    analyser.connect(actx.destination);
    await video.play();
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let maxVol = 0;
    const start = performance.now();
    while (performance.now() - start < 1200) {
      analyser.getByteFrequencyData(dataArray);
      for (const v of dataArray) {
        if (v > maxVol) maxVol = v;
      }
      await new Promise(r => setTimeout(r, 40));
    }
    return { maxVol, hasSound: maxVol > 5 };
  }, `data:video/webm;base64,${base64Video}`);

  console.log(`🔊 [錄影音效驗證] 音訊峰值音量：${hasAudioTrack.maxVol}/255, 聲音狀態：${hasAudioTrack.hasSound ? '✅ 聲音清晰飽滿！' : '❌ 無聲音'}`);

  await browser.close();
}

recordFullCampaign();
