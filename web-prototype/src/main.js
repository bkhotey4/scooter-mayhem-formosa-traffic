import { WorldMap } from './game/WorldMap.js';
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
import { ArtDirection } from './game/ArtDirection.js';
import { StreetLife } from './city/StreetLife.js';
import { NetworkManager } from './network/NetworkManager.js';
import { cameraProfile, isTypingTarget } from './game/RideFeedback.js';

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
    this.cameraMotion = 'comfort';
    try { if (localStorage.getItem('formosa.cameraMotion') === 'dynamic') this.cameraMotion = 'dynamic'; } catch (_) {}
    this.cameraHeading = 0;
    this.cameraOffset = new THREE.Vector3(0, 2.4, -4.8);
    this.cameraLookOffset = new THREE.Vector3(0, 1.2, 3.5);
    this.cameraDistance = 5.6;
    this.cameraHeight = 3.0;
    this.cameraApexOffset = 0;
    this.cameraShakeTimer = 0;
    this.cameraJolt = 0;

    // Timing
    this.lastFrameTime = performance.now();
    this.running = false;
    this.paused = false;
    this.selectedMode = 'delivery';

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
      nitroBadge: document.getElementById('nitro-badge'),
      wantedBadge: document.getElementById('wanted-badge'),
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
      speedlinesOverlay: document.getElementById('speedlines-overlay'),
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
      nitroBadge: document.getElementById('nitro-badge'),
      btnToggleTouch: document.getElementById('btn-toggle-touch'),
      touchControls: document.getElementById('touch-controls'),
      orderCardPopup: document.getElementById('order-card-popup'),
      orderCardCustomer: document.getElementById('order-card-customer'),
      orderCardCargo: document.getElementById('order-card-cargo'),
      orderCardBonus: document.getElementById('order-card-bonus'),
      orderCardNote: document.getElementById('order-card-note'),
      summaryNote: document.getElementById('summary-note'),
      // Multiplayer Hub UI elements
      mpModal: document.getElementById('multiplayer-modal'),
      btnOpenMp: document.getElementById('btn-open-multiplayer'),
      btnHudMp: document.getElementById('btn-hud-mp'),
      btnPauseMp: document.getElementById('btn-pause-mp'),
      mpCallsignInput: document.getElementById('mp-callsign-input'),
      mpBtnRandomName: document.getElementById('mp-btn-random-name'),
      tabBtnSchemeA: document.getElementById('tab-btn-scheme-a'),
      tabBtnSchemeB: document.getElementById('tab-btn-scheme-b'),
      tabPaneSchemeA: document.getElementById('tab-content-scheme-a'),
      tabPaneSchemeB: document.getElementById('tab-content-scheme-b'),
      mpBtnHostRoom: document.getElementById('mp-btn-host-room'),
      mpHostCodeDisplay: document.getElementById('mp-host-code-display'),
      mpCurrentRoomCode: document.getElementById('mp-current-room-code'),
      mpBtnCopyCode: document.getElementById('mp-btn-copy-code'),
      mpInputJoinCode: document.getElementById('mp-input-join-code'),
      mpBtnJoinRoom: document.getElementById('mp-btn-join-room'),
      mpWsUrlInput: document.getElementById('mp-ws-url-input'),
      mpBtnConnectWs: document.getElementById('mp-btn-connect-ws'),
      mpStatusBadge: document.getElementById('mp-status-badge'),
      mpStatusDot: document.getElementById('mp-status-dot'),
      mpStatusText: document.getElementById('mp-status-text'),
      mpRacersCount: document.getElementById('mp-racers-count'),
      mpRacersList: document.getElementById('mp-racers-list'),
      mpBtnStartDriving: document.getElementById('mp-btn-start-driving'),
      mpBtnDisconnect: document.getElementById('mp-btn-disconnect'),
      mpBtnCloseModal: document.getElementById('mp-btn-close-modal')
    };

    this.init();
  }

  init() {
    this.setupThree();
    this.setupWorld();
    this.setupUIEvents();
    this.setupMultiplayerUIEvents();
    this.onResize();
    this.updateCamera(1);
    this.updateHUD();

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
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
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
    this.dirLight.shadow.camera.left = -32;
    this.dirLight.shadow.camera.right = 32;
    this.dirLight.shadow.camera.top = 42;
    this.dirLight.shadow.camera.bottom = -42;
    this.dirLight.shadow.normalBias = 0.035;
    this.dirLight.shadow.bias = -0.00015;
    this.scene.add(this.dirLight.target);
    this.scene.add(this.dirLight);
    this.artDirection = new ArtDirection(this.scene, this.renderer);

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
      if (this.gameMode.state !== 'DELIVERING') return;
      this.gameMode.addCombo(title, pts);
      if (title.includes('台北橋')) this.achievementManager?.addProgress('TAIPEI_SWARM', 1);
      if (title.includes('酒測')) this.achievementManager?.addProgress('SOBRIETY_KING', 1);
      if (title.includes('土窯雞') || title.includes('發財車')) this.achievementManager?.addProgress('CHICKEN_FRIEND', 1);
      if (title.includes('翹孤輪')) this.achievementManager?.addProgress('WHEELIE_GHOST', 1);
      if (title.includes('高雄式左轉')) this.achievementManager?.addProgress('KAOHSIUNG_KING', 1);
      if (title.includes('掃除違規路霸')) this.achievementManager?.addProgress('STREET_CLEANER', 1);
      if (title.includes('清潔隊垃圾車')) this.achievementManager?.addProgress('GARBAGE_HERO', 1);
      if (title.includes('猴子敬禮')) this.achievementManager?.addProgress('MONKEY_RACER', 1);
      if (title.includes('夜市')) this.achievementManager?.addProgress('NIGHT_MARKET_DRIFT', 1);
      if (title.includes('兩段式待轉')) this.achievementManager?.addProgress('HOOK_TURN_MASTER', 1);
      if (title.includes('粉紅超跑')) this.achievementManager?.addProgress('MAZU_BLESSING', 1);
      if (title.includes('禮讓行人')) this.achievementManager?.addProgress('PEDESTRIAN_HERO', 1);
      if (title.includes('甩尾擺脫警方')) this.achievementManager?.addProgress('POLICE_ESCAPE', 1);
      if (title.includes('流水席')) this.achievementManager?.addProgress('BANQUET_DRIFTER', 1);
      if (title.includes('平交道極限生死時速')) this.achievementManager?.addProgress('TRAIN_CROSSING_HERO', 1);
    };

    this.traffic.onWantedChange = (heat) => {
      if (this.ui.wantedBadge) {
        if (heat > 0) {
          this.ui.wantedBadge.innerText = `🚨 警車追捕中！通緝 ${'★'.repeat(heat)} 🚨`;
          this.ui.wantedBadge.classList.add('active');
        } else {
          this.ui.wantedBadge.classList.remove('active');
        }
      }
    };

    this.traffic.onWaterDropHit = () => {
      this.triggerVisorSplash();
    };

    this.traffic.onBobaHeal = () => {
      if (this.gameMode.state !== 'DELIVERING') return;
      this.boba.sealHp = this.boba.sealMaxHp;
      this.boba.isSealBroken = false;
      this.achievementManager?.addProgress('MAZU_BLESSING', 1);
      this.updateHUD();
    };

    this.traffic.onPuddleSplash = () => {
      this.triggerVisorSplash();
    };

    this.boba.onEggCrack = () => {
      this.triggerEggYolkSplash();
    };

    // 5. Game Mode
    this.gameMode = new GameMode(this.sound, this.boba);
    this.gameMode.initMissions(this.cityData.destinations);
    this.scene.add(this.gameMode.navArrow);

    this.gameMode.onCargoChange = (cargo) => {
      this.controller.setCargoType(cargo.id);
      this.updateHUD();
    };

    this.gameMode.onStateChange = (state, data) => this.handleGameStateChange(state, data);
    this.gameMode.onComboPopup = (title, pts) => this.showComboPopup(title, pts);
    this.gameMode.onOrderReceived = (order) => this.showOrderCardPopup(order);
    this.streetLife = new StreetLife(this.scene, this.factory, this.gameMode);
    this.worldMap = new WorldMap(this);

    // 6. Upgrade Garage Shop
    this.shop = new UpgradeShop(this.sound, this.boba, this.controller);

    // Wire Fines and Screen Flash
    this.traffic.onFineEvent = (reason, amount) => {
      if (this.gameMode.state !== 'DELIVERING') return;
      this.gameMode.totalEarnings = Math.max(0, this.gameMode.totalEarnings - amount);
      this.showFineToast(`${reason} - 扣除小費 $${amount}！`);
    };

    this.traffic.onScreenFlash = () => {
      this.triggerScreenFlash();
    };

    this.controller.onComboCallback = (title, pts) => {
      if (this.gameMode.state !== 'DELIVERING') return;
      this.gameMode.addCombo(title, pts);
      if (title.includes('水溝蓋')) this.achievementManager?.addProgress('GUTTER_GOD', 2);
      if (title.includes('翹孤輪')) this.achievementManager?.addProgress('WHEELIE_GHOST', 1);
      if (title.includes('白線') || title.includes('溜冰場')) this.achievementManager?.addProgress('WET_LINE_DRIFTER', 1);
      if (title.includes('回火放炮')) this.achievementManager?.addProgress('BACKFIRE_POP', 1);
    };

    this.controller.onWetDriftSuccess = () => {
      if (this.gameMode.state !== 'DELIVERING') return;
      this.achievementManager?.addProgress('WET_LINE_DRIFTER', 1);
    };

    // 7. County System (7 Taiwanese Regional Modifiers & Weather FX)
    this.countySystem = new CountySystem(this.sound, this.boba, this.controller);
    this.countySystem.initWeather(this.scene);
    this.countySystem.onCountyChanged = (county) => {
      this.showCountyBanner(county);
      // County physics and time-of-day art direction must not overwrite one another.
      if (this.timeWeather) this.timeWeather.setMode(this.timeWeather.currentMode.id);
    };
    this.countySystem.setCounty('TAIPEI');

    // 8. Time & Atmosphere System (Dusk / Cyberpunk Midnight / Thunderstorm)
    this.timeWeather = new TimeWeatherSystem(this.scene, this.dirLight, this.ambient, this.sound);
    this.timeWeather.onModeChange = (mode) => {
      if (this.ui.btnWeather) this.ui.btnWeather.innerText = `${mode.name} (T)`;
      this.artDirection.setMode(mode, this.factory);
      this.controller.isStormWeather = mode.id === 'STORM';
    };
    this.timeWeather.setMode('DUSK');
    this.timeWeather.onLightningFlash = () => {
      this.triggerScreenFlash();
    };

    // 9. Achievement System (Taiwan Meme Milestones)
    this.achievementManager = new AchievementManager(this.sound);
    this.achievementManager.onUnlock = (ach) => {
      this.showAchievementToast(ach);
    };

    // 10. Multiplayer Networking System (Option A: WebRTC P2P & Option B: WebSocket Lobby)
    this.network = new NetworkManager(this.scene, this.factory, this.sound);
    this.network.onStatusChange = (status, text, mode) => {
      this.updateMultiplayerUI(status, text, mode);
    };
    this.network.onPeersUpdate = (peers) => {
      this.updateMultiplayerRoster(peers);
    };
    this.network.onToastMessage = (msg) => {
      this.showFineToast(msg);
    };
  }

  setupUIEvents() {
    document.querySelectorAll('[data-play-mode]').forEach(button => {
      button.addEventListener('click', () => {
        this.selectedMode = button.dataset.playMode;
        document.querySelectorAll('[data-play-mode]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
        this.ui.btnStart.textContent = this.selectedMode === 'practice' ? '🛵 出發！自由練車' : '🛵 發動引擎！開始狂飆！';
      });
    });
    document.getElementById('btn-pause').addEventListener('click', () => this.setPaused(true));
    document.getElementById('btn-resume').addEventListener('click', () => this.setPaused(false));
    document.getElementById('btn-return-menu').addEventListener('click', () => {
      this.running = false;
      this.setPaused(false);
      this.gameMode.state = 'START';
      this.ui.startModal.classList.remove('hidden');
      this.sound.stopBGM();
    });
    window.addEventListener('blur', () => { if (this.running) this.setPaused(true); });
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.running) this.setPaused(true); });
    // 1. Mobile & Touch Screen Auto-Detection
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);
    if (isTouchDevice) {
      document.body.classList.add('touch-enabled');
      if (this.ui.btnToggleTouch) this.ui.btnToggleTouch.innerText = '📱 隱藏觸控';
    }

    if (this.ui.btnToggleTouch) {
      this.ui.btnToggleTouch.addEventListener('click', () => {
        document.body.classList.toggle('touch-enabled');
        const enabled = document.body.classList.contains('touch-enabled');
        this.ui.btnToggleTouch.innerText = enabled ? '📱 隱藏觸控' : '📱 觸控鍵盤';
      });
    }

    // 2. Drive Key Buttons (Steering, Gas, Brake, Reverse, Wheelie)
    document.querySelectorAll('[data-drive-key]').forEach(button => {
      const key = button.dataset.driveKey;
      const press = (e) => {
        if (e) e.preventDefault();
        button.classList.add('active');
        this.controller.keys[key] = true;
      };
      const release = (e) => {
        if (e) e.preventDefault();
        button.classList.remove('active');
        this.controller.keys[key] = false;
      };

      // Pointer events for desktop testing & mouse
      button.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        try { button.setPointerCapture(e.pointerId); } catch (_) {}
        press();
      });
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);

      // Pointer events already cover touch; a second touch handler would double-fire.
      button.addEventListener('contextmenu', (e) => e.preventDefault());
    });

    // 3. Action Buttons (Horn & Vehicle Switch)
    document.querySelectorAll('[data-action]').forEach(button => {
      const act = button.dataset.action;
      const trigger = (e) => {
        if (e) e.preventDefault();
        button.classList.add('active');
        if (act === 'horn') {
          this.sound?.playHorn();
          this.controller.hornPressed = true;
          this.network?.broadcastHorn();
        } else if (act === 'vehicle') {
          this.cycleVehicle();
        }
        setTimeout(() => button.classList.remove('active'), 180);
      };

      button.addEventListener('pointerdown', trigger);
      button.addEventListener('pointerup', () => { if (act === 'horn') this.controller.hornPressed = false; });
      button.addEventListener('pointercancel', () => { if (act === 'horn') this.controller.hornPressed = false; });
      button.addEventListener('contextmenu', (e) => e.preventDefault());
    });
    this.ui.btnStart.addEventListener('click', () => {
      this.sound.init();
      this.sound.startBGM();
      this.ui.startModal.classList.add('hidden');
      this.controller.reset(this.cityData.bobaShop.x, this.cityData.bobaShop.z, 0);
      this.gameMode.initMissions(this.cityData.destinations);
      this.streetLife.reset();
      this.running = true;
      this.gameMode.startDelivery(this.selectedMode);
      this.updateCamera(1);
      this.updateHUD();
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
      this.streetLife.reset();
      this.gameMode.startDelivery();
    });

    this.ui.btnHorn.addEventListener('click', () => {
      this.sound.init();
      this.sound.playHorn();
      this.network?.broadcastHorn();
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
      this.controller.keys = {};
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
      if (isTypingTarget(e.target)) return;
      if (e.repeat) return;
      if (e.key.toLowerCase() === 'm') { e.preventDefault(); this.worldMap.toggle(); return; }
      if (this.mapOpen) {
        if (e.key === 'Escape') { e.preventDefault(); this.worldMap.close(); }
        return;
      }
      if (e.key === 'Escape' && this.running) {
        e.preventDefault();
        if (!this.ui.shopModal.classList.contains('hidden')) {
          this.ui.shopModal.classList.add('hidden');
          this.controller.keys = {};
        } else this.setPaused(!this.paused);
        return;
      }
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
        this.controller.reset(0, this.controller.position.z, Math.cos(this.controller.heading) >= 0 ? 0 : Math.PI);
      }
    });

    document.getElementById('btn-handling').addEventListener('click', (e) => {
      const comfort = this.controller.handlingMode !== 'comfort';
      this.controller.handlingMode = comfort ? 'comfort' : 'sport';
      e.currentTarget.textContent = comfort ? '操控：穩定輔助' : '操控：街機挑戰';
      e.currentTarget.setAttribute('aria-pressed', String(comfort));
    });

    const motionButton = document.getElementById('btn-camera-motion');
    const updateMotionLabel = () => {
      const comfort = this.cameraMotion === 'comfort';
      motionButton.textContent = comfort ? '鏡頭：舒適 · 固定視野、不晃動' : '鏡頭：動感 · 速度變焦、路面震動';
      motionButton.setAttribute('aria-pressed', String(comfort));
    };
    updateMotionLabel();
    motionButton.addEventListener('click', () => {
      this.cameraMotion = this.cameraMotion === 'comfort' ? 'dynamic' : 'comfort';
      this.cameraJolt = 0;
      try { localStorage.setItem('formosa.cameraMotion', this.cameraMotion); } catch (_) {}
      updateMotionLabel();
    });

    this.ui.btnMute.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      this.ui.btnMute.innerText = isMuted ? '🔇 靜音中' : '🔊 聲音開';
    });

    this.ui.btnReset.addEventListener('click', () => {
      this.controller.reset(0, this.controller.position.z, Math.cos(this.controller.heading) >= 0 ? 0 : Math.PI);
    });

    // Choose the region before departure; return to the menu to change it.
    const countyBtns = this.ui.countyPills?.querySelectorAll('.county-btn');
    countyBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.ui.startModal.classList.contains('hidden')) return;
        const cid = btn.getAttribute('data-county');
        countyBtns.forEach(b => {
          const selected = b === btn;
          b.classList.toggle('active', selected);
          b.setAttribute('aria-pressed', String(selected));
        });
        this.countySystem.setCounty(cid);
        document.getElementById('selected-map-label').textContent = `已選：${COUNTIES[cid].name}`;
        document.getElementById('current-county').textContent = `📍 ${COUNTIES[cid].name}`;
      });
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

  setPaused(paused) {
    this.paused = paused;
    this.controller.keys = {};
    this.controller.hornPressed = false;
    document.querySelectorAll('.touch-btn.active').forEach(b => b.classList.remove('active'));
    document.getElementById('pause-modal').classList.toggle('hidden', !paused);
    if (paused) this.sound.updateEngine(0, false);
  }

  toggleCamera() {
    this.cameraMode = this.cameraMode === 'chase' ? 'hood' : 'chase';
  }

  cycleVehicle() {
    if (!this.shop) return;
    const vids = ['cygnus', 'haomai', 'vespa', 'many', 'gas_tank'];
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

  triggerEggYolkSplash() {
    const eggOverlay = document.getElementById('egg-overlay');
    if (!eggOverlay) return;
    eggOverlay.classList.add('active');
    setTimeout(() => {
      eggOverlay.classList.remove('active');
    }, 1800);
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

  showOrderCardPopup(order) {
    if (!this.ui.orderCardPopup) return;
    if (this.ui.orderCardCustomer) this.ui.orderCardCustomer.innerText = order.customer;
    if (this.ui.orderCardCargo) this.ui.orderCardCargo.innerText = `${order.cargo.icon} ${order.cargo.name}`;
    if (this.ui.orderCardBonus) this.ui.orderCardBonus.innerText = `加碼 +$${order.bonus}`;
    if (this.ui.orderCardNote) this.ui.orderCardNote.innerText = `「${order.note}」`;

    this.ui.orderCardPopup.classList.remove('hidden');
    requestAnimationFrame(() => {
      this.ui.orderCardPopup.classList.add('animate-in');
    });

    if (this.orderCardTimer) clearTimeout(this.orderCardTimer);
    this.orderCardTimer = setTimeout(() => {
      this.ui.orderCardPopup.classList.remove('animate-in');
      setTimeout(() => {
        this.ui.orderCardPopup.classList.add('hidden');
      }, 400);
    }, 4800);
  }

  handleGameStateChange(state, data) {
    if (state === 'SUMMARY') {
      const res = data.result;
      if (this.countySystem?.currentCounty?.id === 'TAINAN' && (res.liquidLeft >= 90 || res.eggsIntact >= 9)) {
        this.achievementManager?.addProgress('TAINAN_SUGAR', 1);
      }

      const courierRankEl = document.getElementById('summary-courier-rank');
      if (courierRankEl) courierRankEl.innerText = data.courierRank || '🛵 菜鳥外送猴';
      const streakEl = document.getElementById('summary-streak');
      if (streakEl) streakEl.innerText = data.streak || 1;
      const cargoTitleEl = document.getElementById('summary-cargo-title');
      if (cargoTitleEl) cargoTitleEl.innerText = data.cargo ? `${data.cargo.icon} ${data.cargo.name}` : '🧋 黑糖珍珠鮮奶';

      const stat1LabelEl = document.getElementById('summary-stat1-label');
      const stat2LabelEl = document.getElementById('summary-stat2-label');
      if (stat1LabelEl) stat1LabelEl.innerText = this.boba.getStat1Label() + '：';
      if (stat2LabelEl) stat2LabelEl.innerText = this.boba.getStat2Label() + '：';

      this.ui.summaryRank.innerText = res.rank;
      this.ui.summaryStars.innerText = '★'.repeat(res.stars) + '☆'.repeat(5 - res.stars);
      this.ui.summaryLiquid.innerText = this.boba.getStat1Value();
      this.ui.summarySeal.innerText = this.boba.getStat2Value();
      this.ui.summaryPay.innerText = `$ ${data.orderTotal}`;
      const payout = data.payout;
      if (payout) {
        document.getElementById('summary-payout').textContent =
          `品質小費 $${payout.baseTip} ＋ 時效 $${payout.speedBonus} ＋ 連單 $${payout.streakBonus} ＋ 挑戰 $${payout.challengeBonus}`;
      }
      if (this.ui.summaryNote) {
        this.ui.summaryNote.innerText = data.note ? `「${data.note}」` : '無特殊備註';
      }
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
    const motion = cameraProfile(this.cameraMotion);
    const playerPos = this.controller.position;
    const speedKmH = Math.abs(this.controller.getSpeedKmH());

    // Camera follow heading with speed-adaptive lag
    const turnLag = THREE.MathUtils.lerp(9.5, 7.0, Math.min(speedKmH / 90, 1));
    const angleDelta = Math.atan2(Math.sin(this.controller.heading - this.cameraHeading), Math.cos(this.controller.heading - this.cameraHeading));
    this.cameraHeading += angleDelta * (1 - Math.exp(-turnLag * dt));
    const forward = new THREE.Vector3(Math.sin(this.cameraHeading), 0, Math.cos(this.cameraHeading));
    const lateralRight = new THREE.Vector3(forward.z, 0, -forward.x);

    // 1. Longitudinal G-Force Camera Weight Transfer (拉遠/推近慣性)
    const longAccel = (this.controller.longAccel || 0) * motion.weight;
    let targetDist = 5.6;
    let targetHeight = 2.9;

    if (longAccel > 0) {
      // Accel thrust: camera pulls back and lowers slightly toward tarmac
      targetDist = 5.6 + Math.min(1.35, longAccel * 0.075);
      targetHeight = 2.9 - Math.min(0.32, longAccel * 0.018);
    } else if (longAccel < 0) {
      // Hard brake dive: camera surges forward toward handlebars, height rises
      targetDist = 5.6 - Math.min(1.05, -longAccel * 0.065);
      targetHeight = 2.9 + Math.min(0.42, -longAccel * 0.022);
    }
    this.cameraDistance = THREE.MathUtils.damp(this.cameraDistance, targetDist, 6.0, dt);
    this.cameraHeight = THREE.MathUtils.damp(this.cameraHeight, targetHeight, 6.0, dt);

    // 2. Cornering Apex Look-Ahead (過彎向心前瞻點頭)
    const targetApex = -this.controller.rollAngle * 2.1 * motion.weight;
    this.cameraApexOffset = THREE.MathUtils.damp(this.cameraApexOffset, targetApex, 5.5, dt);

    // 3. Speed-Scaled Road Micro-Shake & Rumble Strip / Bump Feedback
    this.cameraShakeTimer += dt;
    const speedShake = speedKmH > 30 ? Math.min(0.018, ((speedKmH - 30) / 80) * 0.018) : 0;
    let rumbleShake = 0;
    if (this.controller.onRumbleStrip) {
      rumbleShake = 0.036;
    } else if (this.controller.isOnGutter) {
      rumbleShake = 0.022;
    }

    if (this.controller.cameraShakeImpulse > 0.001) {
      this.cameraJolt = Math.max(this.cameraJolt, this.controller.cameraShakeImpulse);
      this.controller.cameraShakeImpulse = THREE.MathUtils.damp(this.controller.cameraShakeImpulse, 0, 11.0, dt);
    }
    this.cameraJolt = THREE.MathUtils.damp(this.cameraJolt, 0, 9.5, dt);

    const totalJitter = (speedShake + rumbleShake + this.cameraJolt * 0.55) * motion.shake;
    const shakeX = Math.sin(this.cameraShakeTimer * 65.0) * totalJitter;
    const shakeY = Math.cos(this.cameraShakeTimer * 82.0) * totalJitter * 0.85 + (this.cameraJolt * 0.35 * motion.shake);

    let targetCamPos;
    let targetLookAt;

    if (this.cameraMode === 'chase') {
      // Dynamic chase camera following behind with lean tilt and suspension height damping
      const suspYOffset = (this.controller.suspensionY || 0) * 0.45 * motion.suspension;
      targetCamPos = playerPos.clone()
        .sub(forward.clone().multiplyScalar(this.cameraDistance))
        .add(new THREE.Vector3(0, this.cameraHeight + suspYOffset, 0))
        .add(lateralRight.clone().multiplyScalar(shakeX))
        .add(new THREE.Vector3(0, shakeY, 0));

      targetLookAt = playerPos.clone()
        .add(forward.clone().multiplyScalar(3.4))
        .add(new THREE.Vector3(0, 1.15 + suspYOffset * 0.3, 0))
        .add(lateralRight.clone().multiplyScalar(this.cameraApexOffset));
    } else {
      // First-person handlebar / visor camera with head-bob and suspension response
      const headSuspY = (this.controller.suspensionY || 0) * 0.75 * motion.suspension;
      targetCamPos = playerPos.clone()
        .add(new THREE.Vector3(0, 1.28 + headSuspY, 0))
        .add(forward.clone().multiplyScalar(0.42))
        .add(lateralRight.clone().multiplyScalar(shakeX * 0.7))
        .add(new THREE.Vector3(0, shakeY * 0.7, 0));

      targetLookAt = targetCamPos.clone()
        .add(forward.clone().multiplyScalar(10.0))
        .add(lateralRight.clone().multiplyScalar(this.cameraApexOffset * 0.6));
    }

    const followSmoothing = 1 - Math.exp(-11 * dt);
    this.camera.position.lerp(targetCamPos, followSmoothing);
    this.camera.lookAt(targetLookAt);

    // 4. Dynamic Speed & Nitro Lens FOV Warp
    const speedFov = (speedKmH / 100.0) * 11.0;
    const targetFov = 60 + motion.fov * (speedFov + (this.controller.isNitro ? 12 : 0) + (this.controller.isOnGutter ? 4 : 0));
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 6.5, dt);
    this.camera.updateProjectionMatrix();

    // 5. Camera bank roll with scooter lean for centrifugal sensation
    this.camera.rotateZ(-this.controller.rollAngle * 0.075 * motion.bank);

    // 6. Dynamic Speedlines Vignette Overlay (極速動態速度線光暈)
    if (this.ui.speedlinesOverlay) {
      const speedLinesAlpha = (speedKmH > 58 || this.controller.isNitro)
        ? Math.min(0.92, Math.max(0, (speedKmH - 58) / 36) + (this.controller.isNitro ? 0.35 : 0))
        : 0;
      this.ui.speedlinesOverlay.style.opacity = (speedLinesAlpha * motion.lines).toFixed(2);
    }
  }

  updateHUD() {
    document.getElementById('delivery-guidance').textContent = this.gameMode.getDeliveryGuidance(
      this.controller.position, this.controller.heading, this.controller.speed);
    const deliveryProgress = document.getElementById('delivery-progress');
    deliveryProgress.value = this.gameMode.arrivalProgress;
    deliveryProgress.hidden = this.gameMode.state !== 'DELIVERING' || this.gameMode.arrivalProgress <= 0;
    // 1. Mission Target & Distance
    if (this.gameMode.currentTarget) {
      this.ui.targetName.innerText = this.gameMode.currentTarget.name;
      const dist = this.gameMode.getDistanceToTarget(this.controller.position);
      this.ui.targetDist.innerText = `${dist}m`;
      document.getElementById('order-challenge').textContent = this.gameMode.getChallengeLabel();
    }
    const exploring = this.gameMode.state === 'EXPLORING';
    if (exploring) {
      this.ui.targetName.innerText = '自由練車 · 不限時街區探索';
      this.ui.targetDist.innerText = '—';
      document.getElementById('order-challenge').textContent = '貨物保護中 · 練習轉彎與煞車 · 不計收益';
    }

    // 2. Timer
    const t = Math.ceil(this.gameMode.timeRemaining);
    this.ui.timerDisplay.innerText = exploring ? '∞' : t;
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

    // 6. Adaptive Multi-Cargo Gauges
    const cargoTitleEl = document.getElementById('cargo-title');
    const cargoStat1El = document.getElementById('cargo-stat1-label');
    const cargoStat2El = document.getElementById('cargo-stat2-label');

    if (cargoTitleEl) cargoTitleEl.innerText = this.boba.getTitle();
    if (cargoStat1El) cargoStat1El.innerText = this.boba.getStat1Label();
    if (cargoStat2El) cargoStat2El.innerText = this.boba.getStat2Label();

    this.ui.liquidPct.innerText = this.boba.getStat1Value();
    this.ui.liquidBar.style.width = `${this.boba.getStat1Pct()}%`;

    this.ui.sealPct.innerText = this.boba.getStat2Value();
    this.ui.sealBar.style.width = `${this.boba.getStat2Pct()}%`;

    this.ui.bobaAlert.innerText = this.boba.statusMessage;
    if (this.boba.statusMessage.includes('⚠️') || this.boba.statusMessage.includes('⚡')) {
      this.ui.bobaAlert.classList.add('danger');
    } else {
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
    this.controller.keys = {};
    this.sound.updateEngine(0, false);
    this.ui.shopCash.innerText = this.gameMode.totalEarnings;
    this.renderShopCategory('vehicle', 'cards-vehicle');
    this.renderShopCategory('box', 'cards-box');
    this.renderShopCategory('seal', 'cards-seal');
    this.renderShopCategory('exhaust', 'cards-exhaust');
    this.renderShopCategory('horn', 'cards-horn');
    this.renderShopCategory('mudguard', 'cards-mudguard');
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
          if (res.costDeducted > 0) {
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

    // 0. Draw Street Grid Network on Radar (路網地圖底層)
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 55, 0, Math.PI * 2);
    ctx.clip();

    const drawRadarRoad = (x1, z1, x2, z2, color, width) => {
      const p1 = worldToRadar(x1, z1);
      const p2 = worldToRadar(x2, z2);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    };

    // Main Avenue (南北向幹道)
    for (const r of this.cityData.roads) {
      drawRadarRoad(r.x1, r.z1, r.x2, r.z2, 'rgba(180, 220, 210, 0.25)', r.width);
    }

    ctx.restore();

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

    // 4.5 Draw Remote Multiplayer Racers (Purple circles)
    if (this.network && this.network.remotePlayers.size > 0) {
      ctx.fillStyle = '#c084fc';
      this.network.remotePlayers.forEach(rp => {
        const r = worldToRadar(rp.currentPos.x, rp.currentPos.z);
        if (Math.hypot(r.x - cx, r.y - cy) < 55) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // 4.6 Draw Uncle Ming's Tire Pressure Pitstop (Green pump marker)
    if (this.cityData?.airCompressor) {
      const airR = worldToRadar(this.cityData.airCompressor.x, this.cityData.airCompressor.z);
      if (Math.hypot(airR.x - cx, airR.y - cy) < 55) {
        ctx.fillStyle = '#00e676';
        ctx.beginPath();
        ctx.arc(airR.x, airR.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4.7 Draw Sobriety Checkpoint (Blue & Red flashing marker)
    if (this.cityData?.sobrietyCheckpoint) {
      const sobR = worldToRadar(this.cityData.sobrietyCheckpoint.x, this.cityData.sobrietyCheckpoint.z);
      if (Math.hypot(sobR.x - cx, sobR.y - cy) < 55) {
        ctx.fillStyle = (Math.floor(Date.now() / 250) % 2 === 0) ? '#ff1744' : '#00e5ff';
        ctx.beginPath();
        ctx.arc(sobR.x, sobR.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

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

    const now = performance.now();
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.05);
    this.lastFrameTime = now;
    const active = this.running && ['DELIVERING', 'EXPLORING'].includes(this.gameMode.state) && !this.paused && !this.mapOpen && this.ui.shopModal.classList.contains('hidden') && !document.hidden;
    this.artDirection.update(dt, this.controller.position);
    this.streetLife.update(dt, this.controller, active);
    this.worldMap.update(active);
    // Keep the high-resolution shadow area around the player, not the whole map.
    this.dirLight.position.set(this.controller.position.x + 25, 45, this.controller.position.z - 22);
    this.dirLight.target.position.copy(this.controller.position);

    if (active) {
      // Apply wind before collision resolution so gusts cannot push through walls.
      this.countySystem?.update(dt);
      // 1. Vehicle Physics (with solid obstacle & wall colliders, road patches & speed bumps)
      this.controller.update(
        dt,
        this.cityData.bounds,
        this.cityData.gutters,
        this.cityData.colliders,
        this.cityData.roadPatches,
        this.cityData.speedBumps
      );

      // 2. Boba Liquid Sloshing Physics
      if (this.gameMode.state === 'DELIVERING') this.boba.update(
        dt,
        this.controller.speed,
        this.controller.rollAngle,
        this.controller.yawRate,
        this.controller.bumpJolt,
        this.controller.position,
        this.controller.getForwardVector()
      );

      // 3. County System & Weather Particle Simulation

      // 3.5. Time & Atmosphere System (Thunderstorms, Lightning)
      if (this.timeWeather) {
        this.timeWeather.update(dt);
        this.controller.isStormWeather = (this.timeWeather.currentMode?.id === 'STORM');
      }

      // Live Achievement Milestones
      if (this.gameMode.state === 'DELIVERING' && this.controller.isNitro && this.controller.getSpeedKmH() >= 115) {
        this.achievementManager?.addProgress('NITRO_OVERDRIVE', 1);
      }
      if (this.gameMode.state === 'DELIVERING' && this.controller.isOnGutter) {
        this.achievementManager?.addProgress('GUTTER_GOD', dt);
      }

      // 4. Traffic System & AI (with Two-Stage Hook Turn Waiting Boxes)
      this.traffic.update(dt, this.controller, this.countySystem?.currentCounty?.id, this.cityData.hookTurnBoxes);

      // 4. Game Mission Loop
      this.gameMode.update(dt, this.controller.position, this.controller.speed);

      // 5. Camera Follow
      this.updateCamera(dt);

      // 6. 2D Interactive Boba Cup Canvas
      this.boba.renderCanvas(this.bobaCanvas);

      // 7. Radar Mini-Map
      this.renderRadar();

      // 8. HUD Numbers & Bars
      this.updateHUD();
    }

    // 9. Update Multiplayer State and Synchronization
    this.network?.update(dt, this.controller);

    this.renderer.render(this.scene, this.camera);
  }

  setupMultiplayerUIEvents() {
    const randomCallsigns = [
      '北宜過彎王', '台南全糖衝鋒', '大橋頭老司機', '熊貓傳奇猴',
      '瓦斯桶飆客', '永和迷宮車神', '三重大甩尾阿伯', '逢甲夜市鑽縫手',
      '忠孝東路九遍猴', '九天玄女下凡', '粉紅超跑香燈腳', '平交道極限阿伯'
    ];

    // Open Modal
    const openMpModal = () => {
      this.ui.mpModal?.classList.remove('hidden');
    };
    this.ui.btnOpenMp?.addEventListener('click', openMpModal);
    this.ui.btnHudMp?.addEventListener('click', openMpModal);
    this.ui.btnPauseMp?.addEventListener('click', openMpModal);

    // Close Modal
    this.ui.mpBtnCloseModal?.addEventListener('click', () => {
      this.ui.mpModal?.classList.add('hidden');
    });

    // Callsign input & randomizer
    this.ui.mpCallsignInput?.addEventListener('input', (e) => {
      this.network?.setCallsign(e.target.value);
    });
    this.ui.mpBtnRandomName?.addEventListener('click', () => {
      const chosen = randomCallsigns[Math.floor(Math.random() * randomCallsigns.length)];
      if (this.ui.mpCallsignInput) this.ui.mpCallsignInput.value = chosen;
      this.network?.setCallsign(chosen);
      this.sound?.playCoinPickup();
    });

    // Scheme Tab Switching
    this.ui.tabBtnSchemeA?.addEventListener('click', () => {
      this.ui.tabBtnSchemeA.classList.add('active');
      this.ui.tabBtnSchemeB.classList.remove('active');
      this.ui.tabPaneSchemeA.classList.remove('hidden');
      this.ui.tabPaneSchemeB.classList.add('hidden');
    });

    this.ui.tabBtnSchemeB?.addEventListener('click', () => {
      this.ui.tabBtnSchemeB.classList.add('active');
      this.ui.tabBtnSchemeA.classList.remove('active');
      this.ui.tabPaneSchemeB.classList.remove('hidden');
      this.ui.tabPaneSchemeA.classList.add('hidden');
    });

    // Option A: Host Room
    this.ui.mpBtnHostRoom?.addEventListener('click', () => {
      this.sound?.playCoinPickup();
      this.network?.startWebRTC('host');
      if (this.ui.mpHostCodeDisplay && this.network) {
        this.ui.mpHostCodeDisplay.classList.remove('hidden');
        if (this.ui.mpCurrentRoomCode) this.ui.mpCurrentRoomCode.innerText = this.network.roomCode;
      }
    });

    // Option A: Copy Code
    this.ui.mpBtnCopyCode?.addEventListener('click', () => {
      if (!this.network?.roomCode) return;
      navigator.clipboard?.writeText(this.network.roomCode);
      if (this.ui.mpBtnCopyCode) {
        this.ui.mpBtnCopyCode.innerText = '✅ 已複製！';
        setTimeout(() => {
          if (this.ui.mpBtnCopyCode) this.ui.mpBtnCopyCode.innerText = '📋 複製';
        }, 1500);
      }
      this.showFineToast(`📋 房間代碼【${this.network.roomCode}】已複製到剪貼簿！`);
    });

    // Option A: Join Room
    this.ui.mpBtnJoinRoom?.addEventListener('click', () => {
      const code = this.ui.mpInputJoinCode?.value?.trim();
      if (!code) {
        this.showFineToast('⚠️ 請輸入 6 碼房間代碼！');
        return;
      }
      this.sound?.playCoinPickup();
      this.network?.startWebRTC('join', code);
    });

    // Option B: Connect WebSocket
    this.ui.mpBtnConnectWs?.addEventListener('click', () => {
      const url = this.ui.mpWsUrlInput?.value?.trim() || 'ws://localhost:8080';
      this.sound?.playCoinPickup();
      this.network?.startWebSocket(url);
    });

    // Option B: Presets
    document.querySelectorAll('.mp-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        if (this.ui.mpWsUrlInput) this.ui.mpWsUrlInput.value = url;
        this.sound?.playCoinPickup();
        this.network?.startWebSocket(url);
      });
    });

    // Disconnect
    this.ui.mpBtnDisconnect?.addEventListener('click', () => {
      this.network?.disconnect();
      if (this.ui.mpHostCodeDisplay) this.ui.mpHostCodeDisplay.classList.add('hidden');
    });

    // Start Driving with peers
    this.ui.mpBtnStartDriving?.addEventListener('click', () => {
      this.ui.mpModal?.classList.add('hidden');
      if (!this.running || this.gameMode.state === 'START') {
        this.ui.btnStart?.click();
      } else {
        this.setPaused(false);
      }
      this.showFineToast('🛵 街區連線競速開始！出發！');
    });
  }

  updateMultiplayerUI(status, text, mode) {
    if (this.ui.mpStatusDot) {
      this.ui.mpStatusDot.className = `status-dot ${status}`;
    }
    if (this.ui.mpStatusText) {
      this.ui.mpStatusText.innerText = text;
    }
    if (this.ui.btnHudMp) {
      const modeLabel = status === 'connected' ? (mode === 'webrtc' ? 'P2P' : '大廳') : '';
      this.ui.btnHudMp.innerText = status === 'connected' ? `🌐 ${modeLabel}連線中` : '🌐 車友連線';
      this.ui.btnHudMp.style.borderColor = status === 'connected' ? '#10b981' : 'rgba(137, 210, 186, 0.45)';
    }
    if (status === 'connected') {
      this.ui.mpBtnDisconnect?.classList.remove('hidden');
    } else if (status === 'disconnected') {
      this.ui.mpBtnDisconnect?.classList.add('hidden');
    }
  }

  updateMultiplayerRoster(peers) {
    if (this.ui.mpRacersCount) {
      this.ui.mpRacersCount.innerText = `車友人數：${peers.length} 人`;
    }
    if (!this.ui.mpRacersList) return;
    if (peers.length === 0) {
      this.ui.mpRacersList.innerHTML = `<div class="mp-empty-roster">尚未連線任何遠端車手，選擇上方方案開始同飆！</div>`;
      return;
    }
    this.ui.mpRacersList.innerHTML = peers.map(p => `
      <div class="mp-racer-chip">
        <span>🛵</span>
        <b>${p.callsign || '車友'}</b>
        <small style="color:#94a3b8">(${p.vehicle || 'cygnus'})</small>
      </div>
    `).join('');
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
  window.app = app;
  window.game = app;
  app.animate();
});
