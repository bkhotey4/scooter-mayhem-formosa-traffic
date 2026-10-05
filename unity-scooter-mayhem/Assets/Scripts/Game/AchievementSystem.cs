using System;
using System.Collections.Generic;
using UnityEngine;

namespace ScooterMayhem.Game
{
    [Serializable]
    public class Achievement
    {
        public string id;
        public string title;
        public string description;
        public string icon;
        public int points;
        public float progress;
        public float target;
        public bool unlocked;
    }

    public class AchievementSystem : MonoBehaviour
    {
        public static AchievementSystem Instance { get; private set; }

        public event Action<Achievement> OnAchievementUnlocked;

        [Header("Arcade Meme Milestones")]
        public List<Achievement> achievements = new List<Achievement>
        {
            new Achievement { id = "TAIPEI_SWARM", title = "【這很台北橋】", description = "在車陣中完成 5 次極限鑽車縫！", icon = "🛵", points = 1500, target = 5 },
            new Achievement { id = "TAINAN_SUGAR", title = "【全糖的意志】", description = "在台南全糖模式下，以 90% 以上殘留率完成外送！", icon = "🍬", points = 2000, target = 1 },
            new Achievement { id = "WHEELIE_GHOST", title = "【神之翹孤輪】", description = "翹孤輪成功躲過 3 次測速照相機！", icon = "⚡", points = 2500, target = 3 },
            new Achievement { id = "NITRO_OVERDRIVE", title = "【喝了再上】", description = "拾取結冰水氮氣爆衝，時速突破 115 KM/H！", icon = "🧊", points = 1800, target = 1 },
            new Achievement { id = "SOBRIETY_KING", title = "【酒測零檢出】", description = "在警察臨檢站減速停車，完美受檢過關！", icon = "👮", points = 1200, target = 1 },
            new Achievement { id = "GUTTER_GOD", title = "【水溝蓋傳人】", description = "累計觸發水溝蓋跑法加速超過 12 秒！", icon = "🔥", points = 1600, target = 12 },
            new Achievement { id = "CHICKEN_FRIEND", title = "【土窯雞好麻吉】", description = "向土窯雞發財車按喇叭熱情打招呼！", icon = "🍗", points = 800, target = 1 },
            new Achievement { id = "KAOHSIUNG_KING", title = "【港都霸王】", description = "在高雄觸發正宗高雄式左轉！", icon = "⚓", points = 1500, target = 1 },
            new Achievement { id = "STREET_CLEANER", title = "【路霸剋星】", description = "累計撞開 3 個霸佔路邊的破椅子或水泥桶路霸！", icon = "🪑", points = 1500, target = 3 },
            new Achievement { id = "GARBAGE_HERO", title = "【少女的祈禱追風者】", description = "高速極限超車正在播音樂的清潔隊垃圾車！", icon = "🚛", points = 1200, target = 1 },
            new Achievement { id = "MONKEY_RACER", title = "【猴子敬禮！外送車神】", description = "極限超車雙開搶單猴子外送員！", icon = "🐒", points = 1500, target = 1 },
            new Achievement { id = "NIGHT_MARKET_DRIFT", title = "【夜市不用排隊】", description = "在夜市香腸地瓜球攤販間極限穿梭 2 次！", icon = "🍢", points = 1000, target = 2 },
            new Achievement { id = "WET_LINE_DRIFTER", title = "【白線水上漂】", description = "在雨港或雷雨天踩熱拌標線華麗甩尾過彎！", icon = "🌧️", points = 1500, target = 1 },
            new Achievement { id = "HOOK_TURN_MASTER", title = "【兩段式待轉模範生】", description = "在路口機慢車待轉區停妥並完成兩段式左轉！", icon = "🟩", points = 1200, target = 1 },
            new Achievement { id = "MAZU_BLESSING", title = "【粉紅超跑大吉大利】", description = "鑽過粉紅超跑媽祖神轎獲得神力保庇！", icon = "💖", points = 1800, target = 1 }
        };

        private Dictionary<string, Achievement> achLookup;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);

            achLookup = new Dictionary<string, Achievement>();
            foreach (var ach in achievements)
            {
                achLookup[ach.id] = ach;
            }
        }

        public void AddProgress(string id, float amount = 1f)
        {
            if (!achLookup.TryGetValue(id, out var ach) || ach.unlocked) return;

            ach.progress += amount;
            if (ach.progress >= ach.target)
            {
                ach.unlocked = true;
                ach.progress = ach.target;
                TriggerUnlock(ach);
            }
        }

        private void TriggerUnlock(Achievement ach)
        {
            Debug.Log($"<color=#FFD700>★ 成就解鎖！{ach.title} 獲得 +{ach.points} PTS ★</color>");
            OnAchievementUnlocked?.Invoke(ach);
        }
    }
}
