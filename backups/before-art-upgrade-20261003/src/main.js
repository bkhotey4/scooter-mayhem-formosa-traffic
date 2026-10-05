// main.js - Central Game Coordinator & Three.js Engine
import * as THREE from 'three';
import { SoundManager } from './audio/SoundManager.js';
import { ModelFactory } from './models/ModelFactory.js';
import { CityGenerator } from './city/CityGenerator.js';
import { ScooterController } from './physics/ScooterController.js';
import { TrafficSystem } from './traffic/TrafficSystem.js';
import { BobaPhysics } from './cargo/BobaPhysics.js';
import { GameMode } from './game/GameMode.js';
import { UpgradeShop } from './game/UpgradeShop.js';
import { CountySystem, COUNTIES } from './game/CountySystem.js';
import { AchievementManager } from './game/AchievementManager.js';
import { TimeWeatherSystem } from './game/TimeWeatherSystem.js';

class GameApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.bobaCanvas = document.getElementById('boba-canvas');
    this.radarCanvas = document.getElementById('radar-canvas');

    // Subsystems
    this.sound = new SoundManager();
    this.factory = new ModelFactory();
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.city = null;
    this.scooter = null;
    this.controller = null;
    this.traffic = null;
    this.boba = null;
    this.gameMode = null;
    this.shop = null;
    this.countySystem = null;
    this.achievementManager = null;
    this.timeWeather = null;

    // Camera modes
    this.cameraMode = 'chase'; // 'chase', 'hood'
    this.cameraOffset = new THREE.Vector3(0, 2.4, -4.8);
    this.cameraLookOffset = new THREE.Vector3(0, 1.2, 3.5);

    // Timing
    this.clock = new THREE.Clock();
    this.running = false;

    // UI elements
    this.ui = {
      targetName: document.getElementById('target-name'),
      targetDist: document.getElementById('target-dist'),
      timerDisplay: document.getElementById('timer-display'),
      timerCard: document.querySelector('.timer-card'),
      earningsDisplay: document.getElementById('earnings-display'),
      scoreDisplay: document.getElementById('score-display'),
      speedDisplay: document.getElementById('speed-display'),
      speedoSub: document.getElementById('speedo-sub'),
      gutterBadge: document.getElementById('gutter-badge'),
      wheelieBadge: document.getElementById('wheelie-badge'),
      liquidPct: document.getElementById('liquid-pct'),
      liquidBar: document.getElementById('liquid-bar'),
      sealPct: document.getElementById('seal-pct'),
      sealBar: document.getElementById('seal-bar'),
      bobaAlert: document.getElementById('boba-alert'),
      comboContainer: document.getElementById('combo-container'),
      startModal: document.getElementById('start-modal'),
      summaryModal: document.getElementById('summary-modal'),
      gameoverModal: document.getElementById('gameover-modal'),
      shopModal: document.getElementById('shop-modal'),
      btnStart: document.getElementById('btn-start-game'),
      btnNext: document.getElementById('btn-next-order'),
      btnRetry: document.getElementById('btn-retry'),
      btnHorn: document.getElementById('btn-horn'),
      btnCam: document.getElementById('btn-camera'),
      btnWeather: document.getElementById('btn-weather'),
      btnShop: document.getElementById('btn-shop'),
      btnCloseShop: document.getElementById('btn-close-shop'),
      btnMute: document.getElementById('btn-mute'),
      btnReset: document.getElementById('btn-reset'),
      visorOverlay: document.getElementById('visor-overlay'),
      wiperArm: document.getElementById('wiper-arm'),
      screenFlash: document.getElementById('screen-flash'),
      fineToast: document.getElementById('fine-toast'),
      fineMsg: document.getElementById('fine-msg'),
      achievementToast: document.getElementById('achievement-toast'),
      achTitle: document.getElementById('ach-title'),
      achDesc: document.getElementById('ach-desc'),
      achPts: document.getElementById('ach-pts'),
      achIcon: document.querySelector('#achievement-toast .ach-icon'),
      shopCash: document.getElementById('shop-cash-display'),
      summaryRank: document.getElementById('summary-rank'),
      summaryStars: document.getElementById('summary-stars'),
      summaryLiquid: document.getElementById('summary-liquid'),
      summarySeal: document.getElementById('summary-seal'),
      summaryPay: document.getElementById('summary-pay'),
      summaryComment: document.getElementById('summary-comment'),
      goReason: document.getElementById('go-reason'),
      goScore: document.getElementById('go-score'),
      goEarnings: document.getElementById('go-earnings'),
      countyPills: document.getElementById('county-pills'),
      countyBanner: document.getElementById('county-banner'),
      countyBannerName: document.getElementById('county-banner-name'),
      countyBannerTitle: document.getElementById('county-banner-title'),
      countyBannerTag: document.getElementById('county-banner-tag'),
      nitroBadge: document.getElementById('nitro-badge')
    };

    this.init();
  }

  init() {
    this.setupThree();
    this.setupWorld();
    this.setupUIEvents();
    this.onResize();

    window.addEventListener('resize', () => this.onResize());
  }

  setupThree() {
    // 1. Scene with atmospheric dusk / night fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f1420);
    this.scene.fog = new THREE.FogExp2(0x0f1420, 0.008);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 500);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting (Dusk with colorful street neon ambience)
    this.ambient = new THREE.AmbientLight(0x8899aa, 0.6);
    this.scene.add(this.ambient);

    this.dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    this.dirLight.position.set(40, 60, -30);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 180;
    this.dirLight.shadow.camera.left = -60;
    this.dirLight.shadow.camera.right = 60;
    this.dirLight.shadow.camera.top = 100;
    this.dirLight.shadow.camera.bottom = -100;
    this.scene.add(this.dirLight);

    // Colored accent point lights for neon alley glow
    [-70, 0, 70].forEach(z => {
      const neonLightL = new THREE.PointLight(0xff1744, 1.5, 35);
      neonLightL.position.set(-10, 5, z);
      this.scene.add(neonLightL);

      const neonLightR = new THREE.PointLight(0x00e5ff, 1.5, 35);
      neonLightR.position.set(10, 5, z);
      this.scene.add(neonLightR);
    });
  }

  setupWorld() {
    // 1. City Generator
    this.city = new CityGenerator(this.scene, this.factory);
    this.cityData = this.city.generateCity();

    // 2. Player Scooter
    this.scooter = this.factory.createPlayerScooter();
    this.scene.add(this.scooter);

    this.controller = new ScooterController(this.scooter, this.sound);
    this.controller.reset(this.cityData.bobaShop.x, this.cityData.bobaShop.z, 0);
    this.scene.add(this.controller.particleGroup);

    // 3. Boba Physics System
    this.boba = new BobaPhysics(this.sound);
    this.scene.add(this.boba.particleGroup);

    // 4. Traffic System
    this.traffic = new TrafficSystem(this.scene, this.factory, this.sound);
    this.traffic.spawnTrafficGrid(this.cityData.segments);

    // Connect combo callbacks
    this.traffic.onComboEvent = (title, pts) => {
      this.gameMode.addCombo(title, pts);
      if (title.includes('台北橋')) this.achievementManager?.addProgress('TAIPEI_SWARM', 1);
      if (title.includes('酒測')) this.achievementManager?.addProgress('SOBRIETY_KING', 1);
      if (title.includes('土窯雞') || title.includes('發財車')) this.achievementManager?.addProgress('CHICKEN_FRIEND', 1);
      if (title.includes('翹孤輪')) this.achievementManager?.addProgress('WHEELIE_GHOST', 1);
      if (title.includes('高雄式左轉')) this.achievementManager?.addProgress('KAOHSIUNG_KING', 1);
      if (title.includes('掃除違規路霸')) this.achievementManager?.addProgress('STREET_CLEANER', 1);
      if (title.includes('清潔隊垃圾車')) this.achievementManager?.addProgress('GARBAGE_HERO', 1);
    };

    this.traffic.onWaterDropHit = () => {
      this.triggerVisorSplash();
    };

    // 5. Game Mode
    this.gameMode = new GameMode(this.sound, this.boba);
    this.gameMode.initMissions(this.cityData.destinations);
    this.scene.add(this.gameMode.navArrow);

    this.gameMode.onStateChange = (state, data) => this.handleGameStateChange(state, data);
    this.gameMode.onComboPopup = (title, pts) => this.showComboPopup(title, pts);

    // 6. Upgrade Garage Shop
    this.shop = new UpgradeShop(this.sound, this.boba, this.controller);

    // Wire Fines and Screen Flash
    this.traffic.onFineEvent = (reason, amount) => {
      this.gameMode.totalEarnings = Math.max(0, this.gameMode.totalEarnings - amount);
      this.showFineToast(`${reason} - 扣除小費 $${amount}！`);
    };

    this.traffic.onScreenFlash = () => {
      this.triggerScreenFlash();
    };

    this.controller.onComboCallback = (title, pts) => {
      this.gameMode.addCombo(title, pts);
      if (title.includes('水溝蓋')) this.achievementManager?.addProgress('GUTTER_GOD', 2);
      if (title.includes('翹孤輪')) this.achievementManager?.addProgress('WHEELIE_GHOST', 1);
    };

    // 7. County System (7 Taiwanese Regional Modifiers & Weather FX)
    this.countySystem = new CountySystem(this.sound, this.boba, this.controller);
    this.countySystem.initWeather(this.scene);
    this.countySystem.onCountyChanged = (county) => {
      this.showCountyBanner(county);
    };
    this.countySystem.setCounty('TAIPEI');

    // 8. Time & Atmosphere System (Dusk / Cyberpunk Midnight / Thunderstorm)
    this.timeWeather = new TimeWeatherSystem(this.scene, this.dirLight, this.ambient, this.sound);
    this.timeWeather.onModeChange = (mode) => {
      if (this.ui.btnWeather) this.ui.btnWeather.innerText = `${mode.name} (T)`;
    };
    this.timeWeather.onLightningFlash = () => {
      this.triggerScreenFlash();
    };

    // 9. Achievement System (Taiwan Meme Milestones)
    this.achievementManager = new AchievementManager(this.sound);
    this.achievementManager.onUnlock = (ach) => {
      this.showAchievementToast(ach);
    };
  }

  setupUIEvents() {
    this.ui.btnStart.addEventListener('click', () => {
      this.sound.init();
      this.sound.startBGM();
      this.ui.startModal.classList.add('hidden');
      this.running = true;
      this.gameMode.startDelivery();
    });

    this.ui.btnNext.addEventListener('click', () => {
      this.ui.summaryModal.classList.add('hidden');
      this.gameMode.nextOrder();
    });

    this.ui.btnRetry.addEventListener('click', () => {
      this.ui.gameoverModal.classList.add('hidden');
      this.controller.reset(this.cityData.bobaShop.x, this.cityData.bobaShop.z, 0);
      this.boba.liquid = 100;
      this.boba.sealHp = 100;
      this.boba.isSealBroken = false;
      this.gameMode.initMissions(this.cityData.destinations);
      this.gameMode.startDelivery();
    });

    this.ui.btnHorn.addEventListener('click', () => {
      this.sound.init();
      this.sound.playHorn();
    });

    this.ui.btnCam.addEventListener('click', () => {
      this.toggleCamera();
    });

    this.ui.btnWeather?.addEventListener('click', () => {
      this.timeWeather?.nextMode();
    });

    this.ui.btnShop.addEventListener('click', () => {
      this.openShop();
    });

    this.ui.btnCloseShop.addEventListener('click', () => {
      this.ui.shopModal.classList.add('hidden');
    });

    // Starter Vehicle Card Selector Click
    const starterCards = document.querySelectorAll('.starter-card');
    starterCards.forEach(card => {
      card.addEventListener('click', () => {
        const vid = card.getAttribute('data-vehicle');
        starterCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.shop.equipped.vehicle = vid;
        this.shop.applyUpgrades();
        this.controller.updateVisualUpgrades(this.shop.equipped, this.factory);
        this.sound?.playUpgradeChime();
        this.updateHUD();
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'c') {
        this.toggleCamera();
      }
      if (e.key.toLowerCase() === 't') {
        this.timeWeather?.nextMode();
      }
      if (e.key.toLowerCase() === 'v') {
        this.cycleVehicle();
      }
      if (e.key.toLowerCase() === 'r') {
        this.controller.reset(0, this.controller.position.z, this.controller.heading);
      }
    });

    this.ui.btnMute.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.ui.btnMute.innerText = isMuted ? '🔇 靜音中' : '🔊 聲音開';
    });

    this.ui.btnReset.addEventListener('click', () => {
      this.controller.reset(0, this.controller.position.z, this.controller.heading);
    });

    // County Selection Buttons Click
    const countyBtns = this.ui.countyPills?.querySelectorAll('.county-btn');
    countyBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        const cid = btn.getAttribute('data-county');
        countyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.countySystem.setCounty(cid);
      });
    });

    // Hotkeys 1-7 for fast County switching
    const countyList = ['TAIPEI', 'HSINCHU', 'TAICHUNG', 'TAINAN', 'KAOHSIUNG', 'KEELUNG', 'YILAN'];
    window.addEventListener('keydown', (e) => {
      if (['1', '2', '3', '4', '5', '6', '7'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        const cid = countyList[idx];
        countyBtns?.forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-county') === cid);
        });
        this.countySystem.setCounty(cid);
      }
    });
  }

  showCountyBanner(county) {
    if (!this.ui.countyBanner) return;
    this.ui.countyBannerName.innerText = county.name;
    this.ui.countyBannerTitle.innerText = county.title;
    this.ui.countyBannerTag.innerText = county.tagline;
    this.ui.countyBanner.classList.remove('hidden');

    if (this.bannerTimer) clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => {
      this.ui.countyBanner.classList.add('hidden');
    }, 3800);
  }

  toggleCamera() {
    this.cameraMode = this.cameraMode === 'chase' ? 'hood' : 'chase';
  }

  cycleVehicle() {
    if (!this.shop) return;
    const vids = ['cygnus', 'haomai', 'vespa', 'many'];
    const currentIdx = vids.indexOf(this.shop.equipped.vehicle);
    const nextVid = vids[(currentIdx + 1) % vids.length];
    this.shop.equipped.vehicle = nextVid;
    this.shop.applyUpgrades();
    this.controller.updateVisualUpgrades(this.shop.equipped, this.factory);
    this.sound?.playUpgradeChime();
    this.showComboPopup(`神車切換：${this.shop.getVehicleName()}`, 300);
    this.updateHUD();

    // Synchronize starter screen cards if visible
    const starterCards = document.querySelectorAll('.starter-card');
    starterCards.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-vehicle') === nextVid);
    });
  }

  triggerVisorSplash() {
    this.ui.visorOverlay.classList.add('active');
    this.ui.wiperArm.classList.add('wiping');

    setTimeout(() => {
      this.ui.visorOverlay.classList.remove('active');
      this.ui.wiperArm.classList.remove('wiping');
    }, 700);
  }

  showComboPopup(title, pts) {
    const badge = document.createElement('div');
    badge.className = 'combo-badge';
    badge.innerText = `【${title}】 +${pts}`;
    this.ui.comboContainer.appendChild(badge);

    setTimeout(() => {
      if (badge.parentNode) badge.parentNode.removeChild(badge);
    }, 1200);
  }

  handleGameStateChange(state, data) {
    if (state === 'SUMMARY') {
      const res = data.result;
      if (this.countySystem?.currentCounty?.id === 'TAINAN' && res.liquidLeft >= 90) {
        this.achievementManager?.addProgress('TAINAN_SUGAR', 1);
      }
      this.ui.summaryRank.innerText = res.rank;
      this.ui.summaryStars.innerText = '★'.repeat(res.stars) + '☆'.repeat(5 - res.stars);
      this.ui.summaryLiquid.innerText = `${res.liquidLeft}%`;
      this.ui.summarySeal.innerText = `${res.sealHp}%`;
      this.ui.summaryPay.innerText = `$ ${data.orderTotal}`;
      this.ui.summaryComment.innerText = `「${res.comment}」`;
      this.ui.summaryModal.classList.remove('hidden');
    } else if (state === 'GAME_OVER') {
      this.ui.goReason.innerText = data.reason;
      this.ui.goScore.innerText = data.score;
      this.ui.goEarnings.innerText = `$ ${data.earnings}`;
      this.ui.gameoverModal.classList.remove('hidden');
    }
  }

  showAchievementToast(ach) {
    if (!this.ui.achievementToast) return;
    if (this.ui.achTitle) this.ui.achTitle.innerText = ach.title;
    if (this.ui.achDesc) this.ui.achDesc.innerText = ach.desc;
    if (this.ui.achPts) this.ui.achPts.innerText = `+${ach.points} PTS`;
    if (this.ui.achIcon) this.ui.achIcon.innerText = ach.icon || '🏆';

    this.ui.achievementToast.classList.remove('hidden');
    this.gameMode?.addCombo(ach.title, ach.points);

    if (this.achTimer) clearTimeout(this.achTimer);
    this.achTimer = setTimeout(() => {
      this.ui.achievementToast.classList.add('hidden');
    }, 3800);
  }

  updateCamera(dt) {
    const playerPos = this.controller.position;
    const forward = this.controller.getForwardVector();

    let targetCamPos;
    let targetLookAt;

    if (this.cameraMode === 'chase') {
      // Dynamic chase camera following behind with lean tilt
      targetCamPos = playerPos.clone()
        .sub(forward.clone().multiplyScalar(4.6))
        .add(new THREE.Vector3(0, 2.2, 0));

      targetLookAt = playerPos.clone().add(forward.clone().multiplyScalar(3.2)).add(new THREE.Vector3(0, 1.1, 0));
    } else {
      // First-person handlebar / visor camera
      targetCamPos = playerPos.clone().add(new THREE.Vector3(0, 1.3, 0)).add(forward.clone().multiplyScalar(0.4));
      targetLookAt = targetCamPos.clone().add(forward.clone().multiplyScalar(10));
    }

    this.camera.position.lerp(targetCamPos, dt * 10);
    this.camera.lookAt(targetLookAt);

    // Dynamic FOV warp during Nitro Boost & Gutter Speed
    const targetFov = this.controller.isNitro ? 78 : (this.controller.isOnGutter ? 70 : 65);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, dt * 7);
    this.camera.updateProjectionMatrix();

    // Slight camera bank roll with scooter lean for speed sensation
    this.camera.rotateZ(-this.controller.rollAngle * 0.25);
  }

  updateHUD() {
    // 1. Mission Target & Distance
    if (this.gameMode.currentTarget) {
      this.ui.targetName.innerText = this.gameMode.currentTarget.name;
      const dist = this.gameMode.getDistanceToTarget(this.controller.position);
      this.ui.targetDist.innerText = `${dist}m`;
    }

    // 2. Timer
    const t = Math.ceil(this.gameMode.timeRemaining);
    this.ui.timerDisplay.innerText = t;
    if (t <= 15) {
      this.ui.timerCard.classList.add('danger');
    } else {
      this.ui.timerCard.classList.remove('danger');
    }

    // 3. Earnings & Score
    this.ui.earningsDisplay.innerText = this.gameMode.totalEarnings;
    this.ui.scoreDisplay.innerText = this.gameMode.score;

    // 4. Speedometer
    const speed = this.controller.getSpeedKmH();
    this.ui.speedDisplay.innerText = speed;

    // 5. Gutter, Wheelie & Nitro Badges
    if (this.controller.isOnGutter) {
      this.ui.gutterBadge.classList.add('active');
    } else {
      this.ui.gutterBadge.classList.remove('active');
    }

    if (this.controller.isWheelie) {
      this.ui.wheelieBadge.classList.add('active');
    } else {
      this.ui.wheelieBadge.classList.remove('active');
    }

    if (this.controller.isNitro) {
      this.ui.nitroBadge?.classList.add('active');
    } else {
      this.ui.nitroBadge?.classList.remove('active');
    }

    if (this.shop) {
      const vName = this.shop.getVehicleName();
      const exhStr = this.shop.equipped.exhaust === 'white_iron'
        ? '改裝回壓白鐵管 ⚡'
        : '原廠黑鐵管';
      this.ui.speedoSub.innerText = `${vName} ｜ ${exhStr}`;
    }

    // 6. Boba Physics Gauges
    const liq = Math.round(this.boba.liquid);
    const seal = Math.round(this.boba.sealHp);

    this.ui.liquidPct.innerText = `${liq}%`;
    this.ui.liquidBar.style.width = `${liq}%`;

    this.ui.sealPct.innerText = `${seal}%`;
    this.ui.sealBar.style.width = `${seal}%`;

    if (this.boba.isSealBroken) {
      this.ui.bobaAlert.innerText = '⚠️ 封膜破裂！嚴重溢出中！';
      this.ui.bobaAlert.classList.add('danger');
    } else if (this.boba.spillRate > 0) {
      this.ui.bobaAlert.innerText = '⚠️ 壓車過猛！茶湯溢出！';
      this.ui.bobaAlert.classList.add('danger');
    } else {
      this.ui.bobaAlert.innerText = '★ 封膜完好 ★';
      this.ui.bobaAlert.classList.remove('danger');
    }
  }

  showFineToast(msg) {
    this.ui.fineMsg.innerText = msg;
    this.ui.fineToast.classList.remove('hidden');
    setTimeout(() => {
      this.ui.fineToast.classList.add('hidden');
    }, 2500);
  }

  triggerScreenFlash() {
    this.ui.screenFlash.classList.add('flashing');
    setTimeout(() => {
      this.ui.screenFlash.classList.remove('flashing');
    }, 120);
  }

  openShop() {
    this.ui.shopCash.innerText = this.gameMode.totalEarnings;
    this.renderShopCategory('vehicle', 'cards-vehicle');
    this.renderShopCategory('box', 'cards-box');
    this.renderShopCategory('seal', 'cards-seal');
    this.renderShopCategory('exhaust', 'cards-exhaust');
    this.renderShopCategory('horn', 'cards-horn');
    this.ui.shopModal.classList.remove('hidden');
  }

  renderShopCategory(catKey, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !this.shop) return;
    container.innerHTML = '';

    const items = this.shop.items[catKey];
    items.forEach(item => {
      const card = document.createElement('div');
      const isEquipped = this.shop.equipped[catKey] === item.id;
      card.className = `shop-card ${isEquipped ? 'equipped' : ''}`;

      card.innerHTML = `
        <div>
          <div class="shop-card-header">
            <span>${item.icon}</span>
            <span>${item.name}</span>
          </div>
          <div class="shop-card-desc">${item.desc}</div>
        </div>
        <div class="shop-card-footer">
          <span class="cost-tag">${item.owned ? '已擁有' : `$ ${item.cost}`}</span>
          <span class="status-tag ${isEquipped ? 'equipped' : ''}">${isEquipped ? '使用中' : (item.owned ? '點擊裝備' : '點擊購買')}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        const res = this.shop.buyOrEquip(catKey, item.id, this.gameMode.totalEarnings);
        if (res.success) {
          if (res.costDeducted > 0 && !item.owned) {
            this.gameMode.totalEarnings -= res.costDeducted;
          }
          this.controller.updateVisualUpgrades(this.shop.equipped, this.factory);
          this.openShop();
          this.updateHUD();
        } else {
          alert(res.reason);
        }
      });

      container.appendChild(card);
    });
  }

  renderRadar() {
    if (!this.radarCanvas) return;
    const ctx = this.radarCanvas.getContext('2d');
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = 0.85; // radar zoom scale

    ctx.clearRect(0, 0, w, h);

    // Radar Concentric rings
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
    ctx.lineWidth = 1;
    [20, 40, 55].forEach(r => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Radar crosshairs
    ctx.beginPath();
    ctx.moveTo(cx, cy - 55); ctx.lineTo(cx, cy + 55);
    ctx.moveTo(cx - 55, cy); ctx.lineTo(cx + 55, cy);
    ctx.stroke();

    const pPos = this.controller.position;
    let heading = this.controller.heading;
    // New Taipei Zhongyonghe Bermuda Triangle Radar Glitch
    if (this.countySystem?.currentCounty?.radarGlitch) {
      if (Math.sin(Date.now() * 0.003) > 0.3) {
        heading += Math.sin(Date.now() * 0.02) * 0.6;
      }
    }
    const cosH = Math.cos(-heading);
    const sinH = Math.sin(-heading);

    const worldToRadar = (wx, wz) => {
      const dx = wx - pPos.x;
      const dz = wz - pPos.z;
      // Rotate by player heading so radar is always heading-up
      const rx = (dx * cosH - dz * sinH) * scale;
      const ry = -(dx * sinH + dz * cosH) * scale;
      return { x: cx + rx, y: cy + ry };
    };

    // 1. Draw Destination Beacon (Pulsing Green dot)
    if (this.gameMode.currentTarget) {
      const bPos = worldToRadar(this.gameMode.currentTarget.pos.x, this.gameMode.currentTarget.pos.z);
      const pulse = (Math.sin(Date.now() * 0.008) + 1) * 2;
      ctx.fillStyle = '#00e676';
      ctx.beginPath();
      ctx.arc(bPos.x, bPos.y, 4 + pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw Alphard hazard vans (Red squares)
    ctx.fillStyle = '#ff1744';
    this.traffic.alphards.forEach(car => {
      const r = worldToRadar(car.pos.x, car.pos.z);
      if (Math.hypot(r.x - cx, r.y - cy) < 55) {
        ctx.fillRect(r.x - 2, r.y - 2, 4, 4);
      }
    });

    // 3. Draw Grandmas (Magenta circles)
    ctx.fillStyle = '#e040fb';
    this.traffic.grandmas.forEach(g => {
      const r = worldToRadar(g.mesh.position.x, g.mesh.position.z);
      if (Math.hypot(r.x - cx, r.y - cy) < 55) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // 4. Draw Speed Cameras (Yellow diamonds)
    ctx.fillStyle = '#ffd600';
    this.traffic.speedCameras.forEach(cam => {
      const r = worldToRadar(cam.pos.x, cam.pos.z);
      if (Math.hypot(r.x - cx, r.y - cy) < 55) {
        ctx.beginPath();
        ctx.moveTo(r.x, r.y - 3);
        ctx.lineTo(r.x + 3, r.y);
        ctx.lineTo(r.x, r.y + 3);
        ctx.lineTo(r.x - 3, r.y);
        ctx.closePath();
        ctx.fill();
      }
    });

    // 5. Draw Player at Center (Cyan forward arrow)
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx + 4, cy + 4);
    ctx.lineTo(cx, cy + 2);
    ctx.lineTo(cx - 4, cy + 4);
    ctx.closePath();
    ctx.fill();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.08);

    if (this.running) {
      // 1. Vehicle Physics (with solid obstacle & wall colliders)
      this.controller.update(dt, this.cityData.bounds, this.cityData.gutters, this.cityData.colliders);

      // 2. Boba Liquid Sloshing Physics
      this.boba.update(
        dt,
        this.controller.speed,
        this.controller.rollAngle,
        this.controller.yawRate,
        this.controller.bumpJolt,
        this.controller.position,
        this.controller.getForwardVector()
      );

      // 3. County System & Weather Particle Simulation
      if (this.countySystem) {
        this.countySystem.update(dt);
      }

      // 3.5. Time & Atmosphere System (Thunderstorms, Lightning)
      if (this.timeWeather) {
        this.timeWeather.update(dt);
      }

      // Live Achievement Milestones
      if (this.controller.isNitro && this.controller.getSpeedKmH() >= 115) {
        this.achievementManager?.addProgress('NITRO_OVERDRIVE', 1);
      }
      if (this.controller.isOnGutter) {
        this.achievementManager?.addProgress('GUTTER_GOD', dt);
      }

      // 4. Traffic System & AI
      this.traffic.update(dt, this.controller, this.countySystem?.currentCounty?.id);

      // 4. Game Mission Loop
      this.gameMode.update(dt, this.controller.position);

      // 5. Camera Follow
      this.updateCamera(dt);

      // 6. 2D Interactive Boba Cup Canvas
      this.boba.renderCanvas(this.bobaCanvas);

      // 7. Radar Mini-Map
      this.renderRadar();

      // 8. HUD Numbers & Bars
      this.updateHUD();
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Start application on load
window.addEventListener('DOMContentLoaded', () => {
  const app = new GameApp();
  app.animate();
});
