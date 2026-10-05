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

export const QUIRKY_CUSTOMER_NOTES = [
  '請幫我送上五樓，老舊透天沒電梯，放門口紅地毯上即可！',
  '電鈴壞了千萬別按，家裡吉娃娃會狂吠，到了請在門口學貓叫一聲～',
  '湯汁千萬不能灑出來！昨天的外送員灑出來我給了一星！',
  '老闆說雞排要切不要辣，但如果太燙可以先幫我吹涼！',
  '放在一樓警衛室就好，但警衛阿伯很兇，請跟他說通關密碼：天王蓋地虎！',
  '請幫我跟店員說珍珠要現煮大波霸，小珍珠退散！',
  '如果巷口那隻小黑狗在追你，請幫我對牠按兩聲喇叭嚇退牠！',
  '請掛在三樓陽台垂下來的紅色塑膠繩上，我會自己拉上去。',
  '請不要敲門！小寶寶剛哄睡，到了請手機響一聲就掛斷！',
  '全糖珍奶是我的靈魂之水！拜託別讓封膜破掉！',
  '土雞蛋一顆都不能少！今天晚上要吃十全大補溫泉蛋！',
  '天氣好熱！八寶挫冰如果融成水，我就要拿去冰冷凍庫了！',
  '請從後門防火巷鑽進來，正門房東阿姨在收租我不敢出去！',
  '外送員辛苦了！門口鞋櫃上有放一罐冰麥香紅茶請自取！',
  '請停在白線內，對面二樓檢舉魔人正在架大砲鏡頭！'
];

export function getCustomerReview(cargoId, stars) {
  if (stars >= 5) {
    const list = {
      boba: '天啊！送到我家珍奶一滴都沒灑！吸管直接插好太神啦！五星推爆！',
      eggs: '神級避震！十顆紅殼土雞蛋完好如初！今晚可以加菜了！',
      shaved_ice: '挫冰山完全沒塌！一口吃下去透心涼！外送車神無誤！',
      fried_chicken: '大雞排燙到拿不住！外皮酥脆卡滋卡滋！神速送達！'
    };
    return list[cargoId] || '活著送到就是五星好評！太神啦！';
  } else if (stars >= 3) {
    const list = {
      boba: '稍微有點晃出來，封膜微凸，但珍珠還是很Q啦，給過！',
      eggs: '破了一兩顆，還好大部分都健在，騎士辛苦了～',
      shaved_ice: '融化了一點變成八寶甜湯，不過甜度剛剛好！',
      fried_chicken: '溫度稍微降了一點，但還是蠻香的，下次再騎快點！'
    };
    return list[cargoId] || '送得很快，路況辛苦了！四星好評！';
  } else {
    const list = {
      boba: '封膜直接爆開噴滿袋！整杯珍奶只剩半杯！差評！',
      eggs: '整袋蛋液蛋花湯！安全帽鏡片還都是蛋黃！給一星退錢！',
      shaved_ice: '挫冰融成洗碗水！外送員你是騎去環島順便送的嗎？！',
      fried_chicken: '雞排冷掉外皮像泡水抹布！完全不酥脆了啦！'
    };
    return list[cargoId] || '路上都在狂飆超速，東西都撞爛了！一星負評！';
  }
}

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
    this.arrivalProgress = 0;
    this.deliveryRadius = 3.5;
    this.deliveryHoldSeconds = 0.75;

    // Current Cargo & Quirky Note
    this.currentCargo = CARGO_TYPES[0];
    this.currentNote = QUIRKY_CUSTOMER_NOTES[0];

    // 3D Navigation Arrow
    this.navArrow = this.createNavArrow();

    // Callbacks for UI updates
    this.onStateChange = null;
    this.onComboPopup = null;
    this.onCargoChange = null;
    this.onOrderReceived = null;
  }

  createNavArrow() {
    const arrow = new THREE.Group();
    // A flat chevron reads as direction from the chase camera, unlike a cone base.
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.75); shape.lineTo(0.5, 0.25);
    shape.lineTo(0.18, 0.13); shape.lineTo(0.18, 0.6);
    shape.lineTo(-0.18, 0.6); shape.lineTo(-0.18, 0.13);
    shape.lineTo(-0.5, 0.25); shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.055, bevelEnabled: false });
    geometry.rotateX(-Math.PI / 2);
    arrow.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x8edbc3, side: THREE.DoubleSide })));
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
    if (this.streak >= 4) return '👑 九天玄女車神 · 4大委託大滿貫通關！';
    if (this.totalEarnings > 3500) return '👑 九天玄女車神';
    if (this.totalEarnings > 1800) return '🏆 北宜公路傳奇';
    if (this.totalEarnings > 600) return '⚡ 巷弄鑽縫俠';
    return '🛵 菜鳥外送猴';
  }

  updateBeacons() {
    this.orders.forEach(order => {
      if (order.beaconMesh) order.beaconMesh.visible = this.state !== 'EXPLORING' && (order === this.currentTarget);
    });
  }

  startDelivery(mode = 'delivery') {
    this.arrivalProgress = 0;
    this.state = mode === 'practice' ? 'EXPLORING' : 'DELIVERING';
    this.timeRemaining = 65;
    this.currentNote = QUIRKY_CUSTOMER_NOTES[Math.floor(Math.random() * QUIRKY_CUSTOMER_NOTES.length)];
    this.navArrow.visible = this.state === 'DELIVERING';
    this.updateBeacons();
    if (mode !== 'practice') {
      this.sound?.playAppNotification();
      this.sound?.speak(`新訂單！${this.currentCargo.name}，送往 ${this.currentTarget.name}！`);
      if (this.onOrderReceived) {
        this.onOrderReceived({
          cargo: this.currentCargo,
          customer: this.currentTarget.name,
          note: this.currentNote,
          bonus: this.challenge.bonus,
          challenge: this.challenge.title
        });
      }
    } else {
      this.sound?.speak('自由練車，沒有倒數。先熟悉油門和煞車，再慢慢逛街吧！');
    }
    if (this.onCargoChange) this.onCargoChange(this.currentCargo);
    if (this.onStateChange) this.onStateChange(this.state);
  }

  addCombo(title, points) {
    if (this.state !== 'DELIVERING') return;
    const totalPoints = points * this.comboMultiplier;
    this.score += totalPoints;
    this.timeRemaining = Math.min(this.timeRemaining + 3, 99);

    if (this.onComboPopup) {
      this.onComboPopup(title, totalPoints);
    }
  }

  update(dt, playerPos, speed = 0) {
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
    if (this.currentCargo.id === 'boba' && (this.boba.liquid <= 1 || Math.round(this.boba.liquid) <= 0)) {
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
    } else if (this.currentCargo.id === 'fried_chicken' && (this.boba.chickenTemp <= 30 || this.boba.crispiness <= 10)) {
      this.streak = 0;
      this.gameOver('雞排徹底冷掉軟爛！顧客憤怒退單！');
      return;
    }

    // 2. Check Arrival at Destination Beacon
    if (this.currentTarget) {
      const dist = Math.hypot(playerPos.x - this.currentTarget.pos.x, playerPos.z - this.currentTarget.pos.z);
      // Require a brief slow stop; a high-speed drive-through is not a handoff.
      if (dist <= this.deliveryRadius && Math.abs(speed) <= 1) {
        this.arrivalProgress = Math.min(1, this.arrivalProgress + dt / this.deliveryHoldSeconds);
        if (this.arrivalProgress >= 1) this.completeOrder();
      } else this.arrivalProgress = 0;

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

    // Generate personalized customer feedback review
    result.comment = getCustomerReview(this.currentCargo.id, result.stars);

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
    this.sound?.speak(`訂單完成！獲得 ${result.stars} 顆星！${result.comment}`);

    if (this.onStateChange) {
      this.onStateChange(this.state, {
        result,
        orderTotal,
        payout: { baseTip, speedBonus, streakBonus, challengeBonus },
        totalEarnings: this.totalEarnings,
        streak: this.streak,
        courierRank: this.getCourierRank(),
        cargo: this.currentCargo,
        customer: this.currentTarget.name,
        note: this.currentNote
      });
    }
  }

  nextOrder() {
    this.arrivalProgress = 0;
    this.currentOrderIdx++;
    if (this.currentOrderIdx >= this.orders.length) {
      this.currentOrderIdx = 0;
    }

    // Randomly select next cargo type
    const cargoIdx = Math.floor(Math.random() * CARGO_TYPES.length);
    this.currentCargo = CARGO_TYPES[cargoIdx];
    this.boba.setCargoType(this.currentCargo.id);

    this.currentTarget = this.orders[this.currentOrderIdx];
    this.currentNote = QUIRKY_CUSTOMER_NOTES[Math.floor(Math.random() * QUIRKY_CUSTOMER_NOTES.length)];
    this.updateBeacons();
    this.timeRemaining = 65;

    this.state = 'DELIVERING';
    this.sound?.playAppNotification();
    this.sound?.speak(`接獲新單！${this.currentCargo.name}，送往 ${this.currentTarget.name}！`);

    if (this.onOrderReceived) {
      this.onOrderReceived({
        cargo: this.currentCargo,
        customer: this.currentTarget.name,
        note: this.currentNote,
        bonus: this.challenge.bonus,
        challenge: this.challenge.title
      });
    }

    if (this.onCargoChange) this.onCargoChange(this.currentCargo);
    if (this.onStateChange) this.onStateChange(this.state);
  }

  gameOver(reason) {
    this.state = 'GAME_OVER';
    this.sound?.playGameOverSound?.();
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

  getDeliveryGuidance(playerPos, heading, speed) {
    if (this.state !== 'DELIVERING' || !this.currentTarget) return '';
    const dx = this.currentTarget.pos.x - playerPos.x;
    const dz = this.currentTarget.pos.z - playerPos.z;
    const distance = Math.hypot(dx, dz);
    if (distance <= this.deliveryRadius) {
      return Math.abs(speed) > 1 ? '已到交貨區 · 按住煞車停穩' : '正在交貨 · 保持停穩';
    }
    if (distance < 15) return '目的地就在附近 · 減速靠近光柱';
    const angle = Math.atan2(Math.sin(Math.atan2(dx, dz) - heading), Math.cos(Math.atan2(dx, dz) - heading));
    if (Math.abs(angle) > Math.PI * 0.72) return '目的地在後方 · 找安全路口迴轉';
    if (angle > 0.35) return '目的地在右前方 · 留意可通行路口';
    if (angle < -0.35) return '目的地在左前方 · 留意可通行路口';
    return '朝前方目的地前進 · 光柱旁停穩交貨';
  }
}
