// UpgradeShop.js - Scooter & Cargo Equipment Garage System
export class UpgradeShop {
  constructor(soundManager, bobaPhysics, scooterController) {
    this.sound = soundManager;
    this.boba = bobaPhysics;
    this.scooter = scooterController;

    // Upgrades Catalog
    this.items = {
      vehicle: [
        { id: 'cygnus', name: '勁戰四代 (125cc)', cost: 0, desc: '均衡型運動神車，傾角靈活好操控', icon: '🛵', owned: true },
        { id: 'haomai', name: '豪邁 125 (國民神車)', cost: 0, desc: '前裝經典金屬菜籃，極耐撞！碰撞損耗減半', icon: '🧺', owned: true },
        { id: 'vespa', name: '偉士牌復古白鐵 (150cc)', cost: 0, desc: '文青復古象牙白金屬身，直線極速可達 92 km/h！', icon: '✨', owned: true },
        { id: 'many', name: '光陽 Many 110 (小鋼炮)', cost: 0, desc: '極度輕巧！起步彈射加速 +40%，鑽車縫王者', icon: '⚡', owned: true },
        { id: 'gas_tank', name: '阿公瓦斯車 (20kg雙桶)', cost: 0, desc: '後座雙桶大瓦斯 ｜ 重量級霸主 ｜ 氣閥噴射推進', icon: '🔥', owned: true }
      ],
      box: [
        { id: 'foam', name: '原廠保溫箱', cost: 0, desc: '標準外送箱，顛簸無緩衝', icon: '📦', owned: true },
        { id: 'cushion', name: '氣墊避震箱', cost: 500, desc: '加厚防震氣墊，減少 35% 坑洞顛簸', icon: '🛡️', owned: false },
        { id: 'gyro', name: '航太陀螺儀防震箱', cost: 1200, desc: '自動水平平衡，大幅抵銷壓車晃動！', icon: '🛸', owned: false }
      ],
      seal: [
        { id: 'thin', name: '夜市普通薄膜', cost: 0, desc: '封膜耐久 100 HP', icon: '🥤', owned: true },
        { id: 'double', name: '雙層強化封膜', cost: 400, desc: '封膜耐久 180 HP (+80%)', icon: '✨', owned: false },
        { id: 'titanium', name: '奈米防刺爆封膜', cost: 1000, desc: '封膜耐久 300 HP，幾乎無法刺破！', icon: '💎', owned: false }
      ],
      exhaust: [
        { id: 'stock', name: '原廠黑鐵管', cost: 0, desc: '標準動力', icon: '🛵', owned: true },
        { id: 'white_iron', name: '改裝回壓白鐵管', cost: 600, desc: '起步加速 +25%，極速提升至 85 km/h', icon: '⚡', owned: false }
      ],
      horn: [
        { id: 'stock', name: '原廠逼逼喇叭', cost: 0, desc: '逼逼！叭叭！', icon: '📢', owned: true },
        { id: 'frog', name: '大眼蛙搞笑喇叭', cost: 300, desc: '呱呱！呱呱！路人側目', icon: '🐸', owned: false },
        { id: 'float', name: '電子花車電音喇叭', cost: 700, desc: '台客動感電音，逼退方圓十里惡犬！', icon: '🎉', owned: false }
      ],
      mudguard: [
        { id: 'dream', name: '追夢人', cost: 0, desc: '莫忘初衷經典照片', icon: '🏍️', owned: true },
        { id: 'queen', name: '擋泥板女神', cost: 250, desc: '90年代玉女偶像加持', icon: '👸', owned: false },
        { id: 'try_me', name: '檢舉我試試看', cost: 500, desc: '挑釁字樣，檢舉魔人拍照率 -50%', icon: '😈', owned: false }
      ]
    };

    // Current equipped IDs
    this.equipped = {
      vehicle: 'cygnus',
      box: 'foam',
      seal: 'thin',
      exhaust: 'stock',
      horn: 'stock',
      mudguard: 'dream'
    };
  }

  buyOrEquip(category, itemId, playerEarnings) {
    const list = this.items[category];
    if (!list) return { success: false, reason: '類別不存在' };

    const item = list.find(i => i.id === itemId);
    if (!item) return { success: false, reason: '物品不存在' };

    const costDeducted = item.owned ? 0 : item.cost;
    if (!item.owned) {
      if (playerEarnings < item.cost) {
        return { success: false, reason: '外送小費不足！再多送幾單吧！' };
      }
      item.owned = true;
      this.sound?.playUpgradeChime();
    }

    this.equipped[category] = itemId;
    this.applyUpgrades();
    return { success: true, item, costDeducted };
  }

  applyUpgrades() {
    // 1. Box upgrade effect on Boba
    if (this.equipped.box === 'cushion') {
      this.boba.springK = 14;
      this.boba.damping = 6.0;
    } else if (this.equipped.box === 'gyro') {
      this.boba.springK = 8;
      this.boba.damping = 9.0;
    } else {
      this.boba.springK = 18;
      this.boba.damping = 4.2;
    }

    // Preserve wear when switching unrelated equipment; re-equipping is not a repair.
    const sealRatio = Math.max(0, Math.min(1, this.boba.sealHp / this.boba.sealMaxHp));
    // 2. Seal upgrade effect
    if (this.equipped.seal === 'double') {
      this.boba.sealMaxHp = 180;
    } else if (this.equipped.seal === 'titanium') {
      this.boba.sealMaxHp = 300;
    } else {
      this.boba.sealMaxHp = 100;
    }
    this.boba.sealHp = this.boba.sealMaxHp * sealRatio;
    this.boba.boxEquipment = this.equipped.box;
    this.boba.applyHandlingModifiers();

    // 3. Vehicle Model handling & Performance
    let baseAccel = 18;
    let baseMaxSpeed = 20;

    if (this.equipped.vehicle === 'haomai') {
      baseAccel = 16;
      baseMaxSpeed = 19;
      this.scooter.crashResistance = 0.5; // High durability!
    } else if (this.equipped.vehicle === 'vespa') {
      baseAccel = 17;
      baseMaxSpeed = 25.5; // ~92 km/h!
      this.scooter.crashResistance = 0.8;
    } else if (this.equipped.vehicle === 'many') {
      baseAccel = 26; // High launch acceleration!
      baseMaxSpeed = 22;
      this.scooter.crashResistance = 1.0;
    } else if (this.equipped.vehicle === 'gas_tank') {
      baseAccel = 15;
      baseMaxSpeed = 21; // ~76 km/h
      this.scooter.crashResistance = 0.35; // Heavy steel frame and gas tanks absorb shock!
    } else {
      // Cygnus (Standard)
      this.scooter.crashResistance = 1.0;
    }

    // Exhaust upgrade boost
    if (this.equipped.exhaust === 'white_iron') {
      baseAccel += 5;
      baseMaxSpeed += 4;
    }

    this.scooter.acceleration = baseAccel;
    this.scooter.maxSpeed = baseMaxSpeed;
    this.scooter.equippedVehicle = this.equipped.vehicle;
    this.scooter.equippedBox = this.equipped.box;
    this.scooter.equippedExhaust = this.equipped.exhaust;
    this.scooter.equippedMudguard = this.equipped.mudguard;
    this.scooter.setMudguard?.(this.equipped.mudguard);
  }

  getVehicleName() {
    const v = this.items.vehicle.find(i => i.id === this.equipped.vehicle);
    return v ? v.name : '125cc 勁戰四代';
  }
}
