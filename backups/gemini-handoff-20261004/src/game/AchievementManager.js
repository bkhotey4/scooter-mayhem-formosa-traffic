// AchievementManager.js - Arcade Achievements & Taiwan Meme Milestones
export const ACHIEVEMENTS = {
  TAIPEI_SWARM: {
    id: 'TAIPEI_SWARM',
    title: '【這很台北橋】',
    desc: '在車陣中完成 5 次極限鑽車縫！',
    icon: '🛵',
    points: 1500,
    progress: 0,
    target: 5,
    unlocked: false
  },
  TAINAN_SUGAR: {
    id: 'TAINAN_SUGAR',
    title: '【全糖的意志】',
    desc: '在台南全糖模式下，以 90% 以上殘留率完成外送！',
    icon: '🍬',
    points: 2000,
    progress: 0,
    target: 1,
    unlocked: false
  },
  WHEELIE_GHOST: {
    id: 'WHEELIE_GHOST',
    title: '【神之翹孤輪】',
    desc: '翹孤輪成功躲過 3 次測速照相機！',
    icon: '⚡',
    points: 2500,
    progress: 0,
    target: 3,
    unlocked: false
  },
  NITRO_OVERDRIVE: {
    id: 'NITRO_OVERDRIVE',
    title: '【喝了再上】',
    desc: '拾取結冰水氮氣爆衝，時速突破 115 KM/H！',
    icon: '🧊',
    points: 1800,
    progress: 0,
    target: 1,
    unlocked: false
  },
  SOBRIETY_KING: {
    id: 'SOBRIETY_KING',
    title: '【酒測零檢出】',
    desc: '在警察臨檢站減速停車，完美受檢過關！',
    icon: '👮',
    points: 1200,
    progress: 0,
    target: 1,
    unlocked: false
  },
  GUTTER_GOD: {
    id: 'GUTTER_GOD',
    title: '【水溝蓋傳人】',
    desc: '累計觸發水溝蓋跑法加速超過 12 秒！',
    icon: '🔥',
    points: 1600,
    progress: 0,
    target: 12,
    unlocked: false
  },
  CHICKEN_FRIEND: {
    id: 'CHICKEN_FRIEND',
    title: '【土窯雞好麻吉】',
    desc: '向土窯雞發財車按喇叭熱情打招呼！',
    icon: '🍗',
    points: 800,
    progress: 0,
    target: 1,
    unlocked: false
  },
  KAOHSIUNG_KING: {
    id: 'KAOHSIUNG_KING',
    title: '【港都霸王】',
    desc: '在高雄觸發正宗高雄式左轉！',
    icon: '⚓',
    points: 1500,
    progress: 0,
    target: 1,
    unlocked: false
  },
  STREET_CLEANER: {
    id: 'STREET_CLEANER',
    title: '【路霸剋星】',
    desc: '累計撞開 3 個霸佔路邊的破椅子或水泥桶路霸！',
    icon: '🪑',
    points: 1500,
    progress: 0,
    target: 3,
    unlocked: false
  },
  GARBAGE_HERO: {
    id: 'GARBAGE_HERO',
    title: '【少女的祈禱追風者】',
    desc: '高速極限超車正在播音樂的清潔隊垃圾車！',
    icon: '🚛',
    points: 1200,
    progress: 0,
    target: 1,
    unlocked: false
  },
  MONKEY_RACER: {
    id: 'MONKEY_RACER',
    title: '【猴子敬禮！外送車神】',
    desc: '極限超車雙開搶單猴子外送員！',
    icon: '🐒',
    points: 1500,
    progress: 0,
    target: 1,
    unlocked: false
  },
  NIGHT_MARKET_DRIFT: {
    id: 'NIGHT_MARKET_DRIFT',
    title: '【夜市不用排隊】',
    desc: '在夜市香腸地瓜球攤販間極限穿梭 2 次！',
    icon: '🍢',
    points: 1000,
    progress: 0,
    target: 2,
    unlocked: false
  },
  WET_LINE_DRIFTER: {
    id: 'WET_LINE_DRIFTER',
    title: '【白線水上漂】',
    desc: '在雨港或雷雨天踩熱拌標線華麗甩尾過彎！',
    icon: '🌧️',
    points: 1500,
    progress: 0,
    target: 1,
    unlocked: false
  },
  HOOK_TURN_MASTER: {
    id: 'HOOK_TURN_MASTER',
    title: '【兩段式待轉模範生】',
    desc: '在路口機慢車待轉區停妥並完成兩段式左轉！',
    icon: '🟩',
    points: 1200,
    progress: 0,
    target: 1,
    unlocked: false
  },
  MAZU_BLESSING: {
    id: 'MAZU_BLESSING',
    title: '【粉紅超跑大吉大利】',
    desc: '鑽過粉紅超跑媽祖神轎獲得神力保庇！',
    icon: '💖',
    points: 1800,
    progress: 0,
    target: 1,
    unlocked: false
  }
};

export class AchievementManager {
  constructor(soundManager) {
    this.sound = soundManager;
    this.achievements = { ...ACHIEVEMENTS };
    this.onUnlock = null;
  }

  addProgress(id, amount = 1) {
    const ach = this.achievements[id];
    if (!ach || ach.unlocked) return;

    ach.progress += amount;
    if (ach.progress >= ach.target) {
      ach.unlocked = true;
      this.triggerUnlock(ach);
    }
  }

  triggerUnlock(ach) {
    this.sound?.playUpgradeChime();
    this.sound?.speak(`成就解鎖！${ach.title}`);

    if (this.onUnlock) {
      this.onUnlock(ach);
    }
  }
}
