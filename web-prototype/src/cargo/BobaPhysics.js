// BobaPhysics.js - Multi-Cargo Physical Simulation System
// Supports: Boba Milk Tea, Farm Fresh Eggs, Shaved Ice Mountain, Hot Fried Chicken
import * as THREE from 'three';

export class BobaPhysics {
  constructor(soundManager) {
    this.sound = soundManager;

    // Active Cargo Mode: 'boba' | 'eggs' | 'shaved_ice' | 'fried_chicken'
    this.cargoType = 'boba';

    // 1. Boba Specs
    this.maxLiquid = 100;
    this.liquid = 100; // Remaining tea %
    this.sealMaxHp = 100;
    this.sealHp = 100; // Seal film integrity %
    this.isSealBroken = false;
    this.liquidAngle = 0; // Surface tilt in radians
    this.liquidAngleVel = 0;
    this.springK = 18;
    this.damping = 4.2;

    this.numPearls = 24;
    this.pearls = [];
    for (let i = 0; i < this.numPearls; i++) {
      this.pearls.push({
        x: (Math.random() - 0.5) * 0.5,
        y: -0.6 + Math.random() * 0.25,
        vx: 0,
        vy: 0,
        radius: 0.065
      });
    }
    this.spillRate = 0;
    this.totalSpilled = 0;
    this.pearlsLost = 0;

    // 2. Eggs Specs
    this.eggsTotal = 10;
    this.eggsIntact = 10;
    this.eggCrackCooldown = 0;
    this.eggsState = Array(10).fill('intact'); // 'intact' | 'cracked'

    // 3. Shaved Ice Specs
    this.iceVolume = 100; // Remaining ice %
    this.syrupLevel = 100; // Condensed milk & syrup %

    // 4. Fried Chicken Specs
    this.chickenTemp = 100; // Temperature in Celsius (starts at 100°C)
    this.crispiness = 100; // Crispiness %

    // 3D Particles for liquid / crumbs splashes
    this.particleGroup = new THREE.Group();
    this.splashParticles = [];
    this.initSplashParticles();

    // Callbacks
    this.onEggCrack = null;
    this.statusMessage = '★ 封膜完好 ★';
  }

  setCargoType(type) {
    this.cargoType = type || 'boba';
    this.reset(this.cargoType);
  }

  get sealPercent() {
    return THREE.MathUtils.clamp(this.sealHp / this.sealMaxHp * 100, 0, 100);
  }

  applyHandlingModifiers() {
    const settings = { foam: [18, 4.2, 1], cushion: [14, 6, 0.65], gyro: [8, 9, 0.4] };
    const [spring, damping, bumpFactor] = settings[this.boxEquipment] || settings.foam;
    const sugar = this.sugarMultiplier || 1;
    this.springK = spring / Math.sqrt(sugar);
    this.damping = damping / Math.sqrt(sugar);
    this.bumpFactor = bumpFactor;
  }

  reset(type = null) {
    if (type) this.cargoType = type;

    // Reset Boba
    this.liquid = 100;
    this.sealHp = this.sealMaxHp;
    this.isSealBroken = false;
    this.liquidAngle = 0;
    this.liquidAngleVel = 0;
    this.pearlsLost = 0;
    this.spillRate = 0;
    this.totalSpilled = 0;
    this.splashParticles.forEach(p => { p.visible = false; });
    for (const p of this.pearls) {
      p.x = (Math.random() - 0.5) * 0.5;
      p.y = -0.6 + Math.random() * 0.25;
      p.vx = 0;
      p.vy = 0;
    }

    // Reset Eggs
    this.eggsTotal = 10;
    this.eggsIntact = 10;
    this.eggsState = Array(10).fill('intact');
    this.eggCrackCooldown = 0;

    // Reset Shaved Ice
    this.iceVolume = 100;
    this.syrupLevel = 100;

    // Reset Fried Chicken
    this.chickenTemp = 100;
    this.crispiness = 100;

    this.updateStatusMessage();
  }

  initSplashParticles() {
    const pGeo = new THREE.DodecahedronGeometry(0.04, 0);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0x5d4037,
      roughness: 0.2,
      metalness: 0.1
    });

    for (let i = 0; i < 35; i++) {
      const p = new THREE.Mesh(pGeo, pMat);
      p.visible = false;
      p.userData = { vel: new THREE.Vector3(), life: 0, maxLife: 0.8 };
      this.particleGroup.add(p);
      this.splashParticles.push(p);
    }
  }

  emitSplash(worldPos, velocity) {
    let count = 0;
    for (const p of this.splashParticles) {
      if (!p.visible) {
        p.visible = true;
        p.position.copy(worldPos);
        p.position.x += (Math.random() - 0.5) * 0.3;
        p.position.y += 0.8 + Math.random() * 0.2;
        p.position.z += (Math.random() - 0.5) * 0.3;

        p.userData.vel.set(
          velocity.x * 0.4 + (Math.random() - 0.5) * 3,
          2.5 + Math.random() * 2.5,
          velocity.z * 0.4 + (Math.random() - 0.5) * 3
        );
        p.userData.life = 0;
        count++;
        if (count >= 4) break;
      }
    }
  }

  update(dt, scooterSpeed, rollAngle, yawRate, bumpJolt, worldPos, forwardVec) {
    bumpJolt *= this.bumpFactor ?? 1;
    switch (this.cargoType) {
      case 'boba':
        this.updateBoba(dt, scooterSpeed, rollAngle, yawRate, bumpJolt, worldPos, forwardVec);
        break;
      case 'eggs':
        this.updateEggs(dt, scooterSpeed, bumpJolt);
        break;
      case 'shaved_ice':
        this.updateShavedIce(dt, scooterSpeed, bumpJolt);
        break;
      case 'fried_chicken':
        this.updateFriedChicken(dt, scooterSpeed, bumpJolt);
        break;
    }
    this.updateStatusMessage();
  }

  updateBoba(dt, scooterSpeed, rollAngle, yawRate, bumpJolt, worldPos, forwardVec) {
    const centrifugalForce = (scooterSpeed / 10) * yawRate * 1.8;
    const gravityComponent = Math.sin(rollAngle) * 9.8;
    const targetAngle = -(centrifugalForce - gravityComponent * 0.35);

    const accel = -this.springK * (this.liquidAngle - targetAngle) - this.damping * this.liquidAngleVel;
    this.liquidAngleVel += accel * dt;
    this.liquidAngle += this.liquidAngleVel * dt;
    this.liquidAngle = THREE.MathUtils.clamp(this.liquidAngle, -1.2, 1.2);

    const sloshStress = Math.abs(this.liquidAngle) * 35;
    const bumpStress = bumpJolt * 120;
    const totalStress = sloshStress + bumpStress;

    if (totalStress > 20) {
      const damage = (totalStress - 20) * dt * 0.9;
      this.sealHp = Math.max(0, this.sealHp - damage);

      if (this.sealHp <= 0 && !this.isSealBroken) {
        this.isSealBroken = true;
        this.sound?.playBobaSpill();
        this.sound?.speak('封膜爆開啦！');
      }
    }

    this.spillRate = 0;
    const tiltOverflowThreshold = this.isSealBroken ? 0.35 : 0.95;
    const overflowSeverity = Math.abs(this.liquidAngle) - tiltOverflowThreshold;

    if (overflowSeverity > 0 && this.liquid > 0) {
      this.spillRate = overflowSeverity * (this.isSealBroken ? 28 : 12) * dt;
      this.liquid = Math.max(0, this.liquid - this.spillRate);
      this.totalSpilled += this.spillRate;

      if (Math.random() < 0.6 && worldPos) {
        this.emitSplash(worldPos, forwardVec || new THREE.Vector3(0, 0, 0));
        this.sound?.playBobaSpill();
      }
    }

    for (const pearl of this.pearls) {
      const gx = Math.sin(this.liquidAngle) * 6;
      const gy = -8;
      pearl.vx += gx * dt;
      pearl.vy += gy * dt;
      pearl.x += pearl.vx * dt;
      pearl.y += pearl.vy * dt;

      const cupWidthAtY = 0.5 + (pearl.y + 0.7) * 0.22;
      const leftBound = -cupWidthAtY / 2;
      const rightBound = cupWidthAtY / 2;

      if (pearl.y < -0.65) {
        pearl.y = -0.65;
        pearl.vy = -pearl.vy * 0.3;
      }
      if (pearl.x < leftBound) {
        pearl.x = leftBound;
        pearl.vx = -pearl.vx * 0.4;
      } else if (pearl.x > rightBound) {
        pearl.x = rightBound;
        pearl.vx = -pearl.vx * 0.4;
      }

      if (pearl.y > 0.65 && this.isSealBroken) {
        pearl.y = -999;
        this.pearlsLost++;
        this.sound?.playBobaSpill();
      }

      pearl.vx *= 0.92;
      pearl.vy *= 0.92;
    }
  }

  updateEggs(dt, scooterSpeed, bumpJolt) {
    this.eggCrackCooldown = Math.max(0, this.eggCrackCooldown - dt);

    // Hard bumps or high speed crashes crack eggs
    if (bumpJolt > 0.32 && this.eggCrackCooldown <= 0 && this.eggsIntact > 0) {
      this.eggCrackCooldown = 0.7;
      const crackCount = bumpJolt > 0.6 ? 2 : 1;
      let crackedNow = 0;

      for (let i = 0; i < this.eggsState.length; i++) {
        if (this.eggsState[i] === 'intact' && crackedNow < crackCount) {
          this.eggsState[i] = 'cracked';
          crackedNow++;
          this.eggsIntact--;
        }
      }

      this.sound?.playEggCrack();
      this.sound?.speak('啪擦！雞蛋破裂！');
      if (this.onEggCrack) this.onEggCrack();
    }
  }

  updateShavedIce(dt, scooterSpeed, bumpJolt) {
    // Melting rate: Base 1.1%/sec + wind melt from high speed
    const windMelt = (scooterSpeed / 50) * 0.8;
    const meltRate = (1.1 + windMelt) * dt;
    this.iceVolume = Math.max(0, this.iceVolume - meltRate);
    this.syrupLevel = Math.max(0, this.syrupLevel - meltRate * 0.9);

    if (bumpJolt > 0.45) {
      // Avalanche of shaved ice from bump!
      this.iceVolume = Math.max(0, this.iceVolume - 3.5);
    }
  }

  updateFriedChicken(dt, scooterSpeed, bumpJolt) {
    // Cools down from 100°C to ambient ~30°C
    const windCooling = (scooterSpeed / 50) * 0.6;
    const coolingRate = (0.75 + windCooling) * dt;
    this.chickenTemp = Math.max(25, this.chickenTemp - coolingRate);

    // Crispiness degrades as temperature falls below 70°C (steam softens crust)
    if (this.chickenTemp < 70) {
      this.crispiness = Math.max(10, this.crispiness - dt * 2.2);
    }
  }

  updateStatusMessage() {
    switch (this.cargoType) {
      case 'boba':
        if (this.isSealBroken) {
          this.statusMessage = '⚠️ 封膜爆破！珍奶噴濺！';
        } else if (this.sealHp < 40) {
          this.statusMessage = '⚠️ 封膜瀕臨爆裂！';
        } else {
          this.statusMessage = '★ 封膜完好 ★';
        }
        break;
      case 'eggs':
        if (this.eggsIntact === 10) {
          this.statusMessage = '★ 蛋殼完好無損 (10/10) ★';
        } else if (this.eggsIntact > 5) {
          this.statusMessage = `⚠️ 破裂 ${10 - this.eggsIntact} 顆！小心避震！`;
        } else {
          this.statusMessage = `⚡ 慘烈！僅存 ${this.eggsIntact} 顆蛋！`;
        }
        break;
      case 'shaved_ice':
        if (this.iceVolume > 75) {
          this.statusMessage = '★ 冰山挺拔清涼 ★';
        } else if (this.iceVolume > 35) {
          this.statusMessage = '⚠️ 冰山融化中，儘速送達！';
        } else {
          this.statusMessage = '⚡ 嚴重融化！變全糖甜湯！';
        }
        break;
      case 'fried_chicken':
        if (this.chickenTemp > 75) {
          this.statusMessage = '★ 剛起鍋爆汁香酥 (燙) ★';
        } else if (this.chickenTemp > 50) {
          this.statusMessage = '⚠️ 溫度下降中，趁熱送達！';
        } else {
          this.statusMessage = '⚡ 受潮冷卻！外皮軟爛！';
        }
        break;
    }
  }

  // Adaptive Titles and Stat Labels for UI
  getTitle() {
    switch (this.cargoType) {
      case 'boba': return '黑糖珍珠鮮奶 物理監控儀';
      case 'eggs': return '特選紅殼土雞蛋 避震監控儀';
      case 'shaved_ice': return '滿料八寶全糖挫冰 融化監控儀';
      case 'fried_chicken': return '逢甲大雞排+甜不辣 溫度監控儀';
    }
  }

  getStat1Label() {
    switch (this.cargoType) {
      case 'boba': return '茶湯殘量';
      case 'eggs': return '完好蛋數';
      case 'shaved_ice': return '挫冰山高度';
      case 'fried_chicken': return '出爐溫度';
    }
  }

  getStat1Value() {
    switch (this.cargoType) {
      case 'boba': return `${Math.round(this.liquid)}%`;
      case 'eggs': return `${this.eggsIntact} / 10 顆`;
      case 'shaved_ice': return `${Math.round(this.iceVolume)}%`;
      case 'fried_chicken': return `${Math.round(this.chickenTemp)}°C`;
    }
  }

  getStat1Pct() {
    switch (this.cargoType) {
      case 'boba': return this.liquid;
      case 'eggs': return (this.eggsIntact / 10) * 100;
      case 'shaved_ice': return this.iceVolume;
      case 'fried_chicken': return Math.min(100, Math.max(0, (this.chickenTemp - 25) / 75 * 100));
    }
  }

  getStat2Label() {
    switch (this.cargoType) {
      case 'boba': return '封膜耐久度';
      case 'eggs': return '蛋箱完整度';
      case 'shaved_ice': return '黑糖煉乳量';
      case 'fried_chicken': return '外皮酥脆度';
    }
  }

  getStat2Value() {
    switch (this.cargoType) {
      case 'boba': return `${Math.round(this.sealPercent)}%`;
      case 'eggs': return `${Math.round((this.eggsIntact / 10) * 100)}%`;
      case 'shaved_ice': return `${Math.round(this.syrupLevel)}%`;
      case 'fried_chicken': return `${Math.round(this.crispiness)}%`;
    }
  }

  getStat2Pct() {
    switch (this.cargoType) {
      case 'boba': return this.sealPercent;
      case 'eggs': return (this.eggsIntact / 10) * 100;
      case 'shaved_ice': return this.syrupLevel;
      case 'fried_chicken': return this.crispiness;
    }
  }

  // 2D Canvas Dispatcher
  renderCanvas(canvas) {
    return this.render2DCanvas(canvas);
  }

  render2DCanvas(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    switch (this.cargoType) {
      case 'boba':
        this.renderBoba(ctx, w, h);
        break;
      case 'eggs':
        this.renderEggs(ctx, w, h);
        break;
      case 'shaved_ice':
        this.renderShavedIce(ctx, w, h);
        break;
      case 'fried_chicken':
        this.renderFriedChicken(ctx, w, h);
        break;
    }
  }

  renderBoba(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2 + 5;
    const cupTopW = 54;
    const cupBotW = 38;
    const cupH = 75;
    const topY = cy - cupH / 2;
    const botY = cy + cupH / 2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - cupTopW / 2, topY);
    ctx.lineTo(cx + cupTopW / 2, topY);
    ctx.lineTo(cx + cupBotW / 2, botY);
    ctx.lineTo(cx - cupBotW / 2, botY);
    ctx.closePath();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.clip();

    const liquidFillH = (this.liquid / 100) * cupH;
    const liquidBaseY = botY - liquidFillH;

    ctx.save();
    ctx.translate(cx, liquidBaseY);
    ctx.rotate(this.liquidAngle);

    ctx.beginPath();
    ctx.moveTo(-120, 0);
    ctx.quadraticCurveTo(0, Math.sin(Date.now() * 0.01) * 4, 120, 0);
    ctx.lineTo(120, 200);
    ctx.lineTo(-120, 200);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, 0, 160);
    grad.addColorStop(0, '#fffbf0');
    grad.addColorStop(0.3, '#f2d5a3');
    grad.addColorStop(0.8, '#5d3516');
    grad.addColorStop(1, '#321603');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.fillStyle = 'rgba(65, 30, 7, 0.6)';
    for (let x = -80; x <= 80; x += 30) {
      ctx.beginPath();
      ctx.ellipse(x + Math.sin(x) * 8, 40, 6, 25, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    for (const pearl of this.pearls) {
      if (pearl.y === -999) continue;
      const px = cx + pearl.x * (cupBotW * 0.8);
      const py = cy - pearl.y * (cupH * 0.45);

      ctx.beginPath();
      ctx.arc(px, py, pearl.radius * 75, 0, Math.PI * 2);
      ctx.fillStyle = '#1c0e06';
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(px - 1.5, py - 1.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - cupTopW / 2 - 4, topY);
    ctx.lineTo(cx + cupTopW / 2 + 4, topY);

    if (this.isSealBroken) {
      ctx.strokeStyle = '#e53935';
      ctx.lineWidth = 4;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
    } else {
      const sealStressColor = this.sealHp > 60 ? '#00e676' : (this.sealHp > 30 ? '#ffea00' : '#ff3d00');
      ctx.strokeStyle = sealStressColor;
      ctx.lineWidth = 5;
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = '#e91e63';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx + 12, topY - 20);
    ctx.lineTo(cx - 8, botY - 15);
    ctx.stroke();
    ctx.restore();
  }

  renderEggs(ctx, w, h) {
    const startX = 14;
    const startY = 16;
    const cols = 2;
    const rows = 5;
    const cellW = 26;
    const cellH = 15;

    // Egg crate background
    ctx.fillStyle = 'rgba(120, 80, 50, 0.35)';
    ctx.roundRect ? ctx.roundRect(8, 10, 64, 82, 6) : ctx.fillRect(8, 10, 64, 82);
    ctx.fill();
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const ex = startX + c * cellW + 10;
        const ey = startY + r * cellH + 6;
        const state = this.eggsState[idx];

        ctx.save();
        if (state === 'intact') {
          // Smooth golden egg
          ctx.beginPath();
          ctx.ellipse(ex, ey, 8, 10, 0, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(ex - 2, ey - 3, 1, ex, ey, 9);
          grad.addColorStop(0, '#fff3e0');
          grad.addColorStop(0.5, '#f5b041');
          grad.addColorStop(1, '#b9770e');
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.strokeStyle = '#d68910';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          // Cracked egg with yolk dripping
          ctx.beginPath();
          ctx.ellipse(ex, ey, 7, 7, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#ffb300';
          ctx.fill();

          // Crack jagged lines
          ctx.strokeStyle = '#d32f2f';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ex - 6, ey - 4);
          ctx.lineTo(ex, ey);
          ctx.lineTo(ex + 5, ey + 4);
          ctx.stroke();

          // Drip
          ctx.fillStyle = '#ffca28';
          ctx.beginPath();
          ctx.arc(ex + 3, ey + 7, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
  }

  renderShavedIce(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2 + 10;

    // Glass Bowl
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy + 15, 30, 0, Math.PI);
    ctx.fillStyle = 'rgba(129, 212, 250, 0.4)';
    ctx.fill();
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Shaved Ice Mountain (Height depends on iceVolume)
    const iceH = (this.iceVolume / 100) * 45;
    ctx.beginPath();
    ctx.moveTo(cx - 28, cy + 15);
    ctx.quadraticCurveTo(cx - 15, cy + 15 - iceH * 0.9, cx, cy + 15 - iceH);
    ctx.quadraticCurveTo(cx + 15, cy + 15 - iceH * 0.9, cx + 28, cy + 15);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, cy + 15 - iceH, 0, cy + 15);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#e0f7fa');
    grad.addColorStop(0.85, '#80deea');
    grad.addColorStop(1, '#6d4c41'); // Red bean syrup base
    ctx.fillStyle = grad;
    ctx.fill();

    // Dripping condensed milk / brown sugar syrup
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.arc(cx - 8, cy + 6, 4, 0, Math.PI * 2);
    ctx.arc(cx + 6, cy + 8, 5, 0, Math.PI * 2);
    ctx.arc(cx, cy + 13, 3, 0, Math.PI * 2);
    ctx.fill();

    // Red spoon sticking out
    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy + 15);
    ctx.lineTo(cx + 28, cy - 18);
    ctx.stroke();
    ctx.restore();
  }

  renderFriedChicken(ctx, w, h) {
    const cx = w / 2;
    const cy = h / 2 + 10;

    // Paper Bag
    ctx.save();
    ctx.fillStyle = '#d7ccc8';
    ctx.fillRect(cx - 24, cy - 10, 48, 42);
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 24, cy - 10, 48, 42);

    // Red/White Taiwan Fried Chicken stripes
    ctx.fillStyle = 'rgba(229, 57, 53, 0.4)';
    for (let x = cx - 20; x < cx + 20; x += 10) {
      ctx.fillRect(x, cy - 10, 5, 42);
    }

    // Crispy Fried Chicken Cutlet peeking out
    ctx.beginPath();
    ctx.ellipse(cx, cy - 16, 20, 16, 0.1, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(cx, cy - 16, 2, cx, cy - 16, 22);
    grad.addColorStop(0, '#ffe082');
    grad.addColorStop(0.6, '#ff8f00');
    grad.addColorStop(1, '#e65100');
    ctx.fillStyle = grad;
    ctx.fill();

    // Crispy sprinkles / pepper salt specks
    ctx.fillStyle = '#3e2723';
    for (let i = 0; i < 12; i++) {
      ctx.fillRect(cx - 14 + (i * 2.5), cy - 22 + ((i * 5) % 12), 2, 2);
    }

    // Rising hot steam wisps (if hot)
    if (this.chickenTemp > 50) {
      const steamY = cy - 28 + Math.sin(Date.now() * 0.008) * 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 6, steamY);
      ctx.quadraticCurveTo(cx - 2, steamY - 8, cx - 6, steamY - 14);
      ctx.moveTo(cx + 6, steamY + 2);
      ctx.quadraticCurveTo(cx + 10, steamY - 6, cx + 6, steamY - 12);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Delivery evaluation with customized customer feedback
  getDeliveryResult() {
    let stars = 5;
    let comment = '';
    let rank = 'SSS';

    switch (this.cargoType) {
      case 'boba': {
        if (this.liquid >= 90 && !this.isSealBroken) {
          stars = 5; rank = 'SSS';
          comment = '超讚！封膜完好無缺，黑糖虎紋依舊漂亮，珍珠Q彈！給五星小費！';
        } else if (this.liquid >= 75) {
          stars = 4; rank = 'A';
          comment = '封膜有點滲水，但珍珠還很多，下次騎慢一點啦！';
        } else if (this.liquid >= 50) {
          stars = 3; rank = 'B';
          comment = '袋子裡都是奶茶！我點大杯送來變中杯，這是在哈囉？';
        } else if (this.liquid >= 20) {
          stars = 2; rank = 'C';
          comment = '整杯灑到剩冰塊跟幾顆珍珠，你是開瘋狂計程車送來的逆？！扣薪水！';
        } else {
          stars = 1; rank = 'F';
          comment = '幹！只剩空杯跟塑膠袋！你乾脆直接叫我自己去店裡舔地板算了啦！直接負評！';
        }
        break;
      }
      case 'eggs': {
        if (this.eggsIntact === 10) {
          stars = 5; rank = 'SSS';
          comment = '太神了！整箱特選土雞蛋 10 顆完好無損，阿嬤誇獎你手真穩！五星小費已入帳！';
        } else if (this.eggsIntact >= 8) {
          stars = 4; rank = 'A';
          comment = `破了 ${10 - this.eggsIntact} 顆，但剩下的蛋黃很大粒，勉強給過！`;
        } else if (this.eggsIntact >= 5) {
          stars = 3; rank = 'B';
          comment = `破了一半！盒子一打開全是蛋黃，你是拿來練習拋接球逆？`;
        } else {
          stars = 1; rank = 'F';
          comment = `破到只剩 ${this.eggsIntact} 顆！我點的是土雞蛋，送來變現拌蛋花湯？！拒收退單！`;
        }
        break;
      }
      case 'shaved_ice': {
        if (this.iceVolume >= 80) {
          stars = 5; rank = 'SSS';
          comment = '冰山還是尖尖的！黑糖煉乳跟布丁超級消暑，神之車速！';
        } else if (this.iceVolume >= 55) {
          stars = 4; rank = 'A';
          comment = '有點化水了，不過料很多，大熱天外送員辛苦了！';
        } else if (this.iceVolume >= 30) {
          stars = 2; rank = 'C';
          comment = '挫冰化了一大半，碗底變成溫溫的甜湯，扣小費！';
        } else {
          stars = 1; rank = 'F';
          comment = '完全融化成一碗全糖死甜的洗碗水！連一粒冰都沒有，給差評！';
        }
        break;
      }
      case 'fried_chicken': {
        if (this.chickenTemp >= 75) {
          stars = 5; rank = 'SSS';
          comment = '燙燙燙！外皮喀滋喀滋爆汁！東泉辣椒醬也給得很足，五星吹捧！';
        } else if (this.chickenTemp >= 55) {
          stars = 4; rank = 'A';
          comment = '雖然稍微溫掉了，但甜不辣還是很Q，下次快一點！';
        } else if (this.chickenTemp >= 40) {
          stars = 2; rank = 'C';
          comment = '雞排冷掉了，外皮被水氣悶得軟爛，吃起來像泡水抹布！';
        } else {
          stars = 1; rank = 'F';
          comment = '冷得跟冰棒一樣！你是從合歡山走下山外送的嗎？扣薪水！';
        }
        break;
      }
    }

    return {
      stars,
      rank,
      cargoType: this.cargoType,
      liquidLeft: Math.round(this.liquid),
      sealHp: Math.round(this.sealPercent),
      eggsIntact: this.eggsIntact,
      iceVolume: Math.round(this.iceVolume),
      chickenTemp: Math.round(this.chickenTemp),
      comment
    };
  }
}
