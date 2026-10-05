// CountySystem.js - Regional Taiwanese Traffic & Cultural Modifiers
import * as THREE from 'three';

export const COUNTIES = {
  TAIPEI: {
    id: 'TAIPEI',
    name: '新北 / 台北',
    title: '【中永和百慕達迷宮 ＆ 台北橋機車瀑布】',
    tagline: '「永和有永和路，中和也有永和路！」',
    color: '#00e5ff',
    desc: '尖峰時刻車流密度暴增 300%，雷達導航隨機迷走！',
    sugarMultiplier: 1.0,
    windStrength: 0,
    roadFriction: 1.0,
    radarGlitch: true,
    scooterSwarm: true,
    kaohsiungTurn: false,
    specialCargo: '樂華夜市三合一綜合刨冰'
  },
  HSINCHU: {
    id: 'HSINCHU',
    name: '新竹風城',
    title: '【九降風狂襲 ＆ 竹科晶圓特急】',
    tagline: '「吹到你不得不反向壓車 30 度的地獄怪風！」',
    color: '#76ff03',
    desc: '8 級動態側風吹襲，必須反向壓車對抗！極苛刻計時！',
    sugarMultiplier: 1.0,
    windStrength: 14.0, // strong lateral push
    roadFriction: 1.0,
    radarGlitch: false,
    scooterSwarm: false,
    kaohsiungTurn: false,
    specialCargo: '竹科無塵室晶圓下午茶'
  },
  TAICHUNG: {
    id: 'TAICHUNG',
    name: '台中慶記',
    title: '【七期豪車 ＆ 熱情棒球隊出沒】',
    tagline: '「行車不禮讓，後車廂馬上下來四位球友！」',
    color: '#ffd600',
    desc: '黑道豪車穿梭，千萬別亂按喇叭，小心球棒伺候！',
    sugarMultiplier: 1.0,
    windStrength: 0,
    roadFriction: 1.0,
    radarGlitch: false,
    scooterSwarm: false,
    kaohsiungTurn: false,
    specialCargo: '逢甲大腸包小腸＋東泉辣椒醬'
  },
  TAINAN: {
    id: 'TAINAN',
    name: '台南全糖',
    title: '【全糖宇宙 ＆ 東門圓環多重宇宙】',
    tagline: '「甜到會長螞蟻！珍奶比重加倍，重量級晃動！」',
    color: '#ff4081',
    desc: '珍奶重力比重加倍，晃動動量極大，考驗手部平衡！',
    sugarMultiplier: 2.2, // Heavy sugar syrup
    windStrength: 0,
    roadFriction: 1.0,
    radarGlitch: false,
    scooterSwarm: false,
    kaohsiungTurn: false,
    specialCargo: '全糖正宗黑糖珍珠鮮奶（甜度200%）'
  },
  KAOHSIUNG: {
    id: 'KAOHSIUNG',
    name: '高雄港都',
    title: '【正宗高雄式左轉 ＆ 輕軌軌道滑移】',
    tagline: '「走斑馬線紅燈直行再切左轉，在高雄才是王者！」',
    color: '#ff6e40',
    desc: '合法觸發高雄式左轉獎勵！穿越輕軌軌道摩擦力驟降！',
    sugarMultiplier: 1.0,
    windStrength: 0,
    roadFriction: 0.95,
    radarGlitch: false,
    scooterSwarm: false,
    kaohsiungTurn: true,
    specialCargo: '六合夜市極品海產粥'
  },
  KEELUNG: {
    id: 'KEELUNG',
    name: '基隆雨港',
    title: '【雨港奪命標線 ＆ 舊金山級階梯巷】',
    tagline: '「天天落雨，路面標線滑如溜冰場，急煞必甩尾！」',
    color: '#40c4ff',
    desc: '全地圖持續降雨，熱融標線濕滑，煞車距離翻倍！',
    sugarMultiplier: 1.0,
    windStrength: 3.0,
    roadFriction: 0.65, // slippery wet road
    radarGlitch: false,
    scooterSwarm: false,
    kaohsiungTurn: false,
    specialCargo: '廟口夜市正宗營養三明治'
  },
  YILAN: {
    id: 'YILAN',
    name: '宜蘭北宜',
    title: '【九彎十八拐 ＆ 山道大砲追焦手】',
    tagline: '「盲彎壓白線過彎，閃避滿載砂石車與追焦相機！」',
    color: '#b388ff',
    desc: '路邊專業追焦手埋伏，完美壓車過彎留下帥照！',
    sugarMultiplier: 1.0,
    windStrength: 0,
    roadFriction: 1.0,
    radarGlitch: false,
    scooterSwarm: false,
    kaohsiungTurn: false,
    specialCargo: '正宗三星蔥油餅＋宜蘭牛舌餅'
  }
};

export class CountySystem {
  constructor(soundManager, bobaPhysics, scooterController) {
    this.sound = soundManager;
    this.boba = bobaPhysics;
    this.scooter = scooterController;

    this.currentCounty = COUNTIES.TAIPEI;
    this.windOscillator = 0;
    this.windGust = 0;
    this.windAudioCooldown = 0;

    // Weather Visuals
    this.scene = null;
    this.rainPoints = null;
    this.rainPositions = null;
    this.windPoints = null;
    this.windPositions = null;

    // Callbacks
    this.onCountyChanged = null;
  }

  initWeather(scene) {
    this.scene = scene;

    // 1. Keelung 3D Rain Particle System (2,500 raindrops)
    const rainCount = 2500;
    const rainGeo = new THREE.BufferGeometry();
    this.rainPositions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      this.rainPositions[i * 3 + 0] = (Math.random() - 0.5) * 50; // X
      this.rainPositions[i * 3 + 1] = Math.random() * 25;        // Y
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 360; // Z
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x90caf9,
      size: 0.18,
      transparent: true,
      opacity: 0.75
    });

    this.rainPoints = new THREE.Points(rainGeo, rainMat);
    this.rainPoints.visible = false;
    this.scene.add(this.rainPoints);

    // 2. Hsinchu 3D Flying Wind Leaves & Debris System (450 particles)
    const windCount = 450;
    const windGeo = new THREE.BufferGeometry();
    this.windPositions = new Float32Array(windCount * 3);

    for (let i = 0; i < windCount; i++) {
      this.windPositions[i * 3 + 0] = (Math.random() - 0.5) * 50; // X
      this.windPositions[i * 3 + 1] = Math.random() * 8 + 0.2;    // Y
      this.windPositions[i * 3 + 2] = (Math.random() - 0.5) * 360; // Z
    }

    windGeo.setAttribute('position', new THREE.BufferAttribute(this.windPositions, 3));
    const windMat = new THREE.PointsMaterial({
      color: 0xffb74d,
      size: 0.28,
      transparent: true,
      opacity: 0.85
    });

    this.windPoints = new THREE.Points(windGeo, windMat);
    this.windPoints.visible = false;
    this.scene.add(this.windPoints);
  }

  setCounty(countyId) {
    if (!COUNTIES[countyId]) return;
    this.currentCounty = COUNTIES[countyId];

    // Apply modifiers to vehicle, cargo & weather
    this.applyCountyModifiers();

    if (this.onCountyChanged) {
      this.onCountyChanged(this.currentCounty);
    }

    // Play regional announcements
    this.playCountyVoice(this.currentCounty.id);
  }

  applyCountyModifiers() {
    const c = this.currentCounty;

    // 1. Boba Sugar Weight Modifier (Tainan extra heavy syrup)
    if (this.boba) {
      this.boba.sugarMultiplier = c.sugarMultiplier;
      this.boba.applyHandlingModifiers();
    }

    // 2. Road Friction Modifier (Keelung rainy wet asphalt)
    if (this.scooter) {
      this.scooter.roadFrictionMultiplier = c.roadFriction;
      this.scooter.kaohsiungTurnEnabled = c.kaohsiungTurn;
    }

    // 3. Weather FX Toggling & Scene Atmosphere
    if (this.rainPoints) {
      this.rainPoints.visible = (c.id === 'KEELUNG');
    }
    if (this.windPoints) {
      this.windPoints.visible = (c.id === 'HSINCHU');
    }

    // Dynamic Fog Shifts
    if (this.scene && this.scene.fog) {
      if (c.id === 'KEELUNG') {
        this.scene.fog.color.setHex(0x101c28);
        this.scene.fog.density = 0.016; // heavy rain mist
      } else if (c.id === 'TAINAN') {
        this.scene.fog.color.setHex(0x281920);
        this.scene.fog.density = 0.007; // warm golden dusk
      } else if (c.id === 'YILAN') {
        this.scene.fog.color.setHex(0x1a1a2b);
        this.scene.fog.density = 0.013; // mountain pass fog
      } else {
        this.scene.fog.color.setHex(0x0f1420);
        this.scene.fog.density = 0.008;
      }
    }
  }

  update(dt) {
    const c = this.currentCounty;

    // 1. Hsinchu Crosswind calculation
    if (c.windStrength > 0) {
      this.windOscillator += dt * 2.5;
      const gustCycle = Math.sin(this.windOscillator) + Math.sin(this.windOscillator * 2.3) * 0.5;
      this.windGust = gustCycle * c.windStrength;

      if (this.scooter) {
        // Push scooter laterally
        const assist = this.scooter.handlingMode === 'comfort' ? 0.28 : 1;
        this.scooter.position.x += this.windGust * dt * 0.45 * assist;
        this.scooter.externalRoll = (this.windGust / c.windStrength) * 0.28 * assist;
      }

      // Wind howl sound
      this.windAudioCooldown -= dt;
      if (Math.abs(this.windGust) > 10 && this.windAudioCooldown <= 0) {
        this.windAudioCooldown = 4.0;
        this.sound?.playWindHowl();
      }
    } else {
      this.windGust = 0;
      if (this.scooter) this.scooter.externalRoll = 0;
    }

    // 2. Animate Keelung 3D Raindrops
    if (this.rainPoints && this.rainPoints.visible) {
      const pos = this.rainPositions;
      const count = pos.length / 3;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] -= 38.0 * dt; // Fall down fast
        pos[i * 3 + 0] -= 4.0 * dt;  // Slight wind slant
        if (pos[i * 3 + 1] < 0) {
          pos[i * 3 + 1] = 25.0; // Reset to sky
        }
      }
      this.rainPoints.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Animate Hsinchu Flying Wind Leaves
    if (this.windPoints && this.windPoints.visible) {
      const pos = this.windPositions;
      const count = pos.length / 3;
      const speedX = 35.0 + Math.abs(this.windGust) * 1.5;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 0] += speedX * dt;
        pos[i * 3 + 1] += Math.sin(pos[i * 3 + 0] * 0.5) * 0.05;
        if (pos[i * 3 + 0] > 25.0) {
          pos[i * 3 + 0] = -25.0; // Reset to west side
        }
      }
      this.windPoints.geometry.attributes.position.needsUpdate = true;
    }
  }

  playCountyVoice(id) {
    switch (id) {
      case 'TAIPEI':
        this.sound?.speak('進入新北中永和！小心迷路！');
        break;
      case 'HSINCHU':
        this.sound?.speak('新竹風城到了！九降風超大，請全力壓車對抗！');
        break;
      case 'TAICHUNG':
        this.sound?.speak('台中七期路段，請勿隨意按喇叭，注意行車安全！');
        break;
      case 'TAINAN':
        this.sound?.speak('歡迎來到台南！珍奶全面升級全糖，小心翻倒！');
        break;
      case 'KAOHSIUNG':
        this.sound?.speak('高雄港都！歡迎體驗正宗高雄式左轉！');
        break;
      case 'KEELUNG':
        this.sound?.speak('基隆雨港降雨中，路面濕滑請點煞減速！');
        break;
      case 'YILAN':
        this.sound?.speak('進入北宜九彎十八拐，注意盲彎與大砲追焦手！');
        break;
    }
  }
}
