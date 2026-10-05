// GameMode.js - Crazy Taxi Style Multi-Cargo Delivery Loop, Streak & Scoring
import * as THREE from 'three';

export const CARGO_TYPES = [
  { id: 'boba', name: '黑糖珍珠鮮奶兩杯', icon: '🧋', prep: '現煮珍珠波濤洶湧，小心封膜！' },
  { id: 'eggs', name: '特選紅殼土雞蛋一箱', icon: '🥚', prep: '易碎物品！小心路面坑洞顛簸！' },
  { id: 'shaved_ice', name: '滿料八寶全糖挫冰', icon: '🍧', prep: '熱氣逼人！趁挫冰山融化前快送！' },
  { id: 'fried_chicken', name: '逢甲大雞排+甜不辣', icon: '🍗', prep: '現炸燙手多汁！別讓外皮受潮軟爛！' }
];

export const CARGO_CHALLENGES = {
  boba: [
    { title: '原味不灑單', instruction: '茶湯保留 90%', bonus: 180, qualifies: (r) => r.liquidLeft >= 90 },
    { title: '完美封膜單', instruction: '封膜保留 85%', bonus: 200, qualifies: (r) => r.sealHp >= 85 }
  ],
  eggs: [
    { title: '完好如初單', instruction: '雞蛋 0 破損 (10/10)', bonus: 250, qualifies: (r) => r.eggsIntact === 10 },
    { title: '平穩巡航單', instruction: '至少保留 8 顆蛋', bonus: 160, qualifies: (r) => r.eggsIntact >= 8 }
  ],
  shaved_ice: [
    { title: '急凍特快單', instruction: '挫冰保留 75%', bonus: 220, qualifies: (r) => r.iceVolume >= 75 },
    { title: '極速消暑單', instruction: '剩餘 35 秒送達', bonus: 200, qualifies: (_r, t) => t >= 35 }
  ],
  fried_chicken: [
    { title: '滾燙酥脆單', instruction: '出爐溫度 > 70°C', bonus: 240, qualifies: (r) => r.chickenTemp >= 70 },
    { title: '喀滋爽脆單', instruction: '溫度保留 60°C 以上', bonus: 190, qualifies: (r) => r.chickenTemp >= 60 }
  ]
};

export class GameMode {
  constructor(soundManager, bobaPhysics) {
    this.sound = soundManager;
    this.boba = bobaPhysics;

    this.state = 'START'; // START, DELIVERING, SUMMARY, GAME_OVER
    this.score = 0;
    this.combos = [];
    this.comboMultiplier = 1;

    // Mission specs
    this.currentOrderIdx = 0;
    this.orders = [];
    this.currentTarget = null;
    this.timeRemaining = 65; // seconds
    this.totalEarnings = 0;
    this.streak = 0; // Consecutive delivery streak

    // Current Cargo
    this.currentCargo = CARGO_TYPES[0];

    // 3D Navigation Arrow
    this.navArrow = this.createNavArrow();

    // Callbacks for UI updates
    this.onStateChange = null;
    this.onComboPopup = null;
    this.onCargoChange = null;
  }

  createNavArrow() {
    const arrow = new THREE.Group();
    const coneGeo = new THREE.ConeGeometry(0.35, 0.8, 12);
    coneGeo.rotateX(Math.PI / 2);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    arrow.add(cone);
    return arrow;
  }

  initMissions(destinations) {
    this.orders = destinations;
    this.currentOrderIdx = 0;
    this.streak = 0;
    this.currentTarget = this.orders[0];
    this.timeRemaining = 65;
    this.currentCargo = CARGO_TYPES[0];
    this.boba.setCargoType(this.currentCargo.id);
    this.updateBeacons();
  }

  get challenge() {
    const list = CARGO_CHALLENGES[this.currentCargo.id] || CARGO_CHALLENGES.boba;
    return list[this.currentOrderIdx % list.length];
  }

  getChallengeLabel() {
    return `${this.challenge.title} · ${this.challenge.instruction} · 額外 $${this.challenge.bonus}`;
  }

  getCourierRank() {
    if (this.totalEarnings > 3500) return '👑 九天玄女車神';
    if (this.totalEarnings > 1800) return '🏆 北宜公路傳奇';
    if (this.totalEarnings > 600) return '⚡ 巷弄鑽縫俠';
    return '🛵 菜鳥外送猴';
  }

  updateBeacons() {
    this.orders.forEach(order => {
      if (order.beaconMesh) order.beaconMesh.visible = (order === this.currentTarget);
    });
  }

  startDelivery() {
    this.state = 'DELIVERING';
    this.timeRemaining = 65;
    this.sound?.speak(`新訂單！${this.currentCargo.name}，請儘速送達！`);
    if (this.onCargoChange) this.onCargoChange(this.currentCargo);
    if (this.onStateChange) this.onStateChange(this.state);
  }

  addCombo(title, points) {
    const totalPoints = points * this.comboMultiplier;
    this.score += totalPoints;
    this.timeRemaining = Math.min(this.timeRemaining + 3, 99);

    if (this.onComboPopup) {
      this.onComboPopup(title, totalPoints);
    }
  }

  update(dt, playerPos) {
    if (this.state !== 'DELIVERING') return;

    // 1. Countdown timer
    this.timeRemaining -= dt;

    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.streak = 0;
      this.gameOver('時間到！外送逾時，顧客取消訂單！');
      return;
    }

    // Critical cargo failure checks
    if (this.currentCargo.id === 'boba' && this.boba.liquid <= 0) {
      this.streak = 0;
      this.gameOver('珍奶全灑光了！顧客憤怒退單！');
      return;
    } else if (this.currentCargo.id === 'eggs' && this.boba.eggsIntact <= 0) {
      this.streak = 0;
      this.gameOver('整箱雞蛋全破成蛋花湯！顧客拒收退單！');
      return;
    } else if (this.currentCargo.id === 'shaved_ice' && this.boba.iceVolume <= 5) {
      this.streak = 0;
      this.gameOver('挫冰化成洗碗水！顧客拒收退單！');
      return;
    }

    // 2. Check Arrival at Destination Beacon
    if (this.currentTarget) {
      const dist = playerPos.distanceTo(this.currentTarget.pos);
      if (dist < 2.5) {
        this.completeOrder();
      }

      // Update Nav Arrow
      if (this.navArrow) {
        this.navArrow.position.set(playerPos.x, playerPos.y + 2.4, playerPos.z);
        this.navArrow.lookAt(this.currentTarget.pos.x, this.navArrow.position.y, this.currentTarget.pos.z);
      }
    }
  }

  completeOrder() {
    if (this.state !== 'DELIVERING') return;
    this.state = 'SUMMARY';
    this.streak++;
    const result = this.boba.getDeliveryResult();

    // Calculate delivery earnings
    const baseTip = result.stars * 85;
    const speedBonus = Math.floor(this.timeRemaining * 12);
    const streakBonus = (this.streak - 1) * 60;
    const challengeBonus = this.challenge.qualifies(result, this.timeRemaining) ? this.challenge.bonus : 0;
    const orderTotal = baseTip + speedBonus + streakBonus + challengeBonus;

    result.comment += challengeBonus
      ? ` 【${this.challenge.title}】達成加碼 $${challengeBonus}！`
      : ` 下次挑戰：${this.challenge.instruction}。`;

    this.totalEarnings += orderTotal;
    this.score += orderTotal * 2;

    this.sound?.playCelebrationChime();
    this.sound?.speak(`訂單完成！獲得 ${result.stars} 顆星！連送 ${this.streak} 單！`);

    if (this.onStateChange) {
      this.onStateChange(this.state, {
        result,
        orderTotal,
        totalEarnings: this.totalEarnings,
        streak: this.streak,
        courierRank: this.getCourierRank(),
        cargo: this.currentCargo,
        customer: this.currentTarget.name
      });
    }
  }

  nextOrder() {
    this.currentOrderIdx++;
    if (this.currentOrderIdx >= this.orders.length) {
      this.currentOrderIdx = 0;
    }

    // Randomly select next cargo type
    const cargoIdx = Math.floor(Math.random() * CARGO_TYPES.length);
    this.currentCargo = CARGO_TYPES[cargoIdx];
    this.boba.setCargoType(this.currentCargo.id);

    this.currentTarget = this.orders[this.currentOrderIdx];
    this.updateBeacons();
    this.timeRemaining = 65;

    this.state = 'DELIVERING';
    this.sound?.speak(`接獲新單！${this.currentCargo.name}，送往 ${this.currentTarget.name}`);

    if (this.onCargoChange) this.onCargoChange(this.currentCargo);
    if (this.onStateChange) this.onStateChange(this.state);
  }

  gameOver(reason) {
    this.state = 'GAME_OVER';
    this.sound?.speak('外送失敗！');
    if (this.onStateChange) {
      this.onStateChange(this.state, {
        reason,
        score: this.score,
        earnings: this.totalEarnings,
        streak: this.streak,
        courierRank: this.getCourierRank()
      });
    }
  }

  getDistanceToTarget(playerPos) {
    if (!this.currentTarget) return 0;
    return Math.round(playerPos.distanceTo(this.currentTarget.pos));
  }
}
