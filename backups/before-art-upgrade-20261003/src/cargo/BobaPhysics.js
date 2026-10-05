// BobaPhysics.js - Liquid sloshing, pearl dynamics, seal durability & spill physics
import * as THREE from 'three';

export class BobaPhysics {
  constructor(soundManager) {
    this.sound = soundManager;

    // Cup Specs
    this.maxLiquid = 100;
    this.liquid = 100; // Remaining tea %
    this.sealMaxHp = 100;
    this.sealHp = 100; // Seal film integrity %
    this.isSealBroken = false;

    // Sloshing physics
    this.liquidAngle = 0; // Surface tilt in radians
    this.liquidAngleVel = 0;
    this.springK = 18; // Restoring spring force
    this.damping = 4.2; // Viscous damping

    // Pearls (simulated 2D particles inside the cup)
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

    // Spill tracking
    this.spillRate = 0;
    this.totalSpilled = 0;
    this.pearlsLost = 0;

    // 3D Particles for liquid splashes
    this.particleGroup = new THREE.Group();
    this.splashParticles = [];
    this.initSplashParticles();

    // Feedback message
    this.statusMessage = '★ 封膜完好 ★';
  }

  initSplashParticles() {
    const pGeo = new THREE.DodecahedronGeometry(0.04, 0);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0x5d4037, // Brown sugar tea color
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
    // 1. Calculate lateral & centrifugal inertial force
    // Centrifugal acceleration ~ (speed * yawRate)
    const centrifugalForce = (scooterSpeed / 10) * yawRate * 1.8;
    const gravityComponent = Math.sin(rollAngle) * 9.8;
    const targetAngle = -(centrifugalForce - gravityComponent * 0.35);

    // Spring-damper oscillator for liquid sloshing
    const accel = -this.springK * (this.liquidAngle - targetAngle) - this.damping * this.liquidAngleVel;
    this.liquidAngleVel += accel * dt;
    this.liquidAngle += this.liquidAngleVel * dt;

    // Clamping max liquid tilt
    this.liquidAngle = THREE.MathUtils.clamp(this.liquidAngle, -1.2, 1.2);

    // 2. Seal Stress & Damage
    // Severe sloshing, road bumps, potholes, or curb hops put tension on the thin sealing film
    const sloshStress = Math.abs(this.liquidAngle) * 35;
    const bumpStress = bumpJolt * 120;
    const totalStress = sloshStress + bumpStress;

    if (totalStress > 20) {
      const damage = (totalStress - 20) * dt * 0.9;
      this.sealHp = Math.max(0, this.sealHp - damage);

      if (this.sealHp <= 0 && !this.isSealBroken) {
        this.isSealBroken = true;
        this.statusMessage = '⚠️ 封膜爆開破裂！⚠️';
        this.sound?.playBobaSpill();
        this.sound?.speak('封膜爆開啦！');
      }
    }

    // 3. Liquid Spill Calculation
    this.spillRate = 0;
    const tiltOverflowThreshold = this.isSealBroken ? 0.35 : 0.95; // Broken seal spills much easier
    const overflowSeverity = Math.abs(this.liquidAngle) - tiltOverflowThreshold;

    if (overflowSeverity > 0 && this.liquid > 0) {
      this.spillRate = overflowSeverity * (this.isSealBroken ? 28 : 12) * dt;
      this.liquid = Math.max(0, this.liquid - this.spillRate);
      this.totalSpilled += this.spillRate;

      // Spawn splash particles in 3D
      if (Math.random() < 0.6 && worldPos) {
        this.emitSplash(worldPos, forwardVec || new THREE.Vector3(0, 0, 0));
        this.sound?.playBobaSpill();
      }
    }

    // 4. Update 2D Pearls inside cup
    for (const pearl of this.pearls) {
      // Slosh forces on pearl
      const gx = Math.sin(this.liquidAngle) * 6;
      const gy = -8; // downward gravity

      pearl.vx += gx * dt;
      pearl.vy += gy * dt;
      pearl.x += pearl.vx * dt;
      pearl.y += pearl.vy * dt;

      // Cup boundaries (tapered cup: bottom width ~ 0.5, top width ~ 0.8, height -0.7 to 0.7)
      const cupWidthAtY = 0.5 + (pearl.y + 0.7) * 0.22;
      const leftBound = -cupWidthAtY / 2;
      const rightBound = cupWidthAtY / 2;

      // Floor bounce
      if (pearl.y < -0.65) {
        pearl.y = -0.65;
        pearl.vy = -pearl.vy * 0.3;
      }

      // Wall bounce
      if (pearl.x < leftBound) {
        pearl.x = leftBound;
        pearl.vx = -pearl.vx * 0.4;
      } else if (pearl.x > rightBound) {
        pearl.x = rightBound;
        pearl.vx = -pearl.vx * 0.4;
      }

      // Pearl flying out if liquid spills severely
      if (pearl.y > 0.65 && this.isSealBroken) {
        // Pearl fell out of cup
        pearl.y = -999;
        this.pearlsLost++;
        this.sound?.playBobaSpill();
      }

      // Viscous liquid drag
      pearl.vx *= 0.92;
      pearl.vy *= 0.92;
    }

    // 5. Update 3D splash particles
    for (const p of this.splashParticles) {
      if (p.visible) {
        p.userData.life += dt;
        if (p.userData.life >= p.userData.maxLife) {
          p.visible = false;
        } else {
          p.position.addScaledVector(p.userData.vel, dt);
          p.userData.vel.y -= 9.8 * dt; // Gravity
          if (p.position.y < 0.05) {
            p.position.y = 0.05;
            p.userData.vel.set(0, 0, 0);
          }
        }
      }
    }
  }

  // Draw interactive 2D HUD widget
  renderCanvas(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 10;
    const cupTopW = 100;
    const cupBotW = 75;
    const cupH = 130;
    const topY = cy - cupH / 2;
    const botY = cy + cupH / 2;

    // 1. Draw Cup Outline & Background
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
    ctx.clip(); // Clip everything inside the cup

    // 2. Draw Fresh Milk & Brown Sugar Liquid with Sloshing Wave
    const liquidFillH = (this.liquid / 100) * cupH;
    const liquidBaseY = botY - liquidFillH;

    ctx.save();
    ctx.translate(cx, liquidBaseY);
    ctx.rotate(this.liquidAngle);

    // Liquid polygon
    ctx.beginPath();
    ctx.moveTo(-120, 0);
    // Draw gentle wave curve
    ctx.quadraticCurveTo(0, Math.sin(Date.now() * 0.01) * 4, 120, 0);
    ctx.lineTo(120, 200);
    ctx.lineTo(-120, 200);
    ctx.closePath();

    // Fresh milk to brown sugar syrup gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 160);
    grad.addColorStop(0, '#fffbf0'); // Fresh milk foam
    grad.addColorStop(0.3, '#f2d5a3'); // Milk tea
    grad.addColorStop(0.8, '#5d3516'); // Brown sugar syrup
    grad.addColorStop(1, '#321603'); // Dense dark sugar bottom
    ctx.fillStyle = grad;
    ctx.fill();

    // Brown sugar stripes dripping down the cup wall (經典黑糖虎紋)
    ctx.fillStyle = 'rgba(65, 30, 7, 0.6)';
    for (let x = -80; x <= 80; x += 30) {
      ctx.beginPath();
      ctx.ellipse(x + Math.sin(x) * 8, 40, 6, 25, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Draw Bouncing Tapioca Pearls
    for (const pearl of this.pearls) {
      if (pearl.y === -999) continue; // spilled out
      const px = cx + pearl.x * (cupBotW * 0.8);
      const py = cy - pearl.y * (cupH * 0.45);

      ctx.beginPath();
      ctx.arc(px, py, pearl.radius * 75, 0, Math.PI * 2);
      ctx.fillStyle = '#1c0e06';
      ctx.fill();
      // Shiny reflection on tapioca
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(px - 1.5, py - 1.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // Restore clipping

    // 4. Draw Sealing Film (封膜) on Top
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - cupTopW / 2 - 4, topY);
    ctx.lineTo(cx + cupTopW / 2 + 4, topY);

    if (this.isSealBroken) {
      // Jagged torn seal
      ctx.strokeStyle = '#e53935';
      ctx.lineWidth = 4;
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      ctx.fillStyle = '#ff1744';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ 封膜爆破 ⚡', cx, topY - 8);
    } else {
      // Intact seal with tension indicator
      const sealStressColor = this.sealHp > 60 ? '#00e676' : (this.sealHp > 30 ? '#ffea00' : '#ff3d00');
      ctx.strokeStyle = sealStressColor;
      ctx.lineWidth = 5;
      ctx.stroke();

      // Mini seal HP bar above cup
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(cx - 35, topY - 14, 70, 6);
      ctx.fillStyle = sealStressColor;
      ctx.fillRect(cx - 35, topY - 14, 70 * (this.sealHp / 100), 6);
    }
    ctx.restore();

    // 5. Draw Straw (經典粗吸管)
    ctx.save();
    ctx.strokeStyle = '#e91e63';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx + 15, topY - 24);
    ctx.lineTo(cx - 10, botY - 15);
    ctx.stroke();
    ctx.restore();
  }

  // Get delivery rating & funny customer comment
  getDeliveryResult() {
    let stars = 5;
    let comment = '超讚！封膜完好無缺，黑糖虎紋依舊漂亮，珍珠Q彈！給五星小費！';
    let rank = 'SSS';

    if (this.liquid < 90 || this.isSealBroken) {
      stars = 4;
      rank = 'A';
      comment = '封膜有點滲水，但珍珠還很多，下次騎慢一點啦！';
    }
    if (this.liquid < 70) {
      stars = 3;
      rank = 'B';
      comment = '袋子裡都是奶茶！我點大杯送來變中杯，這是在哈囉？';
    }
    if (this.liquid < 40) {
      stars = 2;
      rank = 'C';
      comment = '整杯灑到剩冰塊跟幾顆珍珠，你是開瘋狂計程車送來的逆？！扣薪水！';
    }
    if (this.liquid < 15) {
      stars = 1;
      rank = 'F';
      comment = '幹！只剩空杯跟塑膠袋！你乾脆直接叫我自己去店裡舔地板算了啦！直接負評！';
    }

    return {
      stars,
      rank,
      liquidLeft: Math.round(this.liquid),
      sealHp: Math.round(this.sealHp),
      pearlsLost: this.pearlsLost,
      comment
    };
  }
}
