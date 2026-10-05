// CountySystem.cs - Unity 6 C# Regional Taiwanese Traffic & Cultural Modifiers
using System;
using UnityEngine;

namespace ScooterMayhem.Game
{
    public enum TaiwanCounty
    {
        Taipei,     // 新北 / 台北: 中永和百慕達迷宮 ＆ 台北橋機車瀑布
        Hsinchu,    // 新竹風城: 九降風 8 級側風狂襲
        Taichung,   // 台中慶記: 七期豪車 ＆ 熱情球棒隊
        Tainan,     // 台南全糖: 珍奶比重 2.2x，重糖糖漿晃動
        Kaohsiung,  // 高雄港都: 正宗高雄式左轉 ＆ 輕軌軌道
        Keelung,    // 基隆雨港: 連綿降雨 ＆ 0.65x 濕滑標線
        Yilan       // 宜蘭北宜: 九彎十八拐盲彎 ＆ 大砲追焦手
    }

    [System.Serializable]
    public struct CountyData
    {
        public TaiwanCounty county;
        public string displayName;
        public string title;
        public string tagline;
        public Color themeColor;
        public float sugarMultiplier;
        public float windStrength;
        public float roadFriction;
        public bool radarGlitch;
        public bool scooterSwarm;
        public bool kaohsiungTurn;
        public string specialCargo;
    }

    public class CountySystem : MonoBehaviour
    {
        public static CountySystem Instance { get; private set; }

        [Header("Current County State")]
        public TaiwanCounty currentCounty = TaiwanCounty.Taipei;
        public CountyData currentData;

        [Header("Crosswind Simulation (Hsinchu)")]
        public float currentWindGust = 0f;
        private float windOscillator = 0f;

        [Header("Weather Particles")]
        public ParticleSystem rainParticleSystem;
        public ParticleSystem windLeavesParticleSystem;

        // Events
        public event Action<CountyData> OnCountyChanged;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        private void Start()
        {
            SetCounty(currentCounty);
        }

        public void SetCounty(TaiwanCounty county)
        {
            currentCounty = county;
            currentData = GetCountyData(county);

            // Apply weather effects
            if (rainParticleSystem != null)
            {
                if (county == TaiwanCounty.Keelung) rainParticleSystem.Play();
                else rainParticleSystem.Stop();
            }

            if (windLeavesParticleSystem != null)
            {
                if (county == TaiwanCounty.Hsinchu) windLeavesParticleSystem.Play();
                else windLeavesParticleSystem.Stop();
            }

            // Adjust environmental fog
            if (RenderSettings.fog)
            {
                switch (county)
                {
                    case TaiwanCounty.Keelung:
                        RenderSettings.fogColor = new Color(0.08f, 0.12f, 0.16f);
                        RenderSettings.fogDensity = 0.018f;
                        break;
                    case TaiwanCounty.Tainan:
                        RenderSettings.fogColor = new Color(0.18f, 0.12f, 0.08f);
                        RenderSettings.fogDensity = 0.007f;
                        break;
                    case TaiwanCounty.Yilan:
                        RenderSettings.fogColor = new Color(0.12f, 0.12f, 0.18f);
                        RenderSettings.fogDensity = 0.014f;
                        break;
                    default:
                        RenderSettings.fogColor = new Color(0.06f, 0.08f, 0.12f);
                        RenderSettings.fogDensity = 0.008f;
                        break;
                }
            }

            OnCountyChanged?.Invoke(currentData);
        }

        private void Update()
        {
            // Update Hsinchu Crosswinds
            if (currentData.windStrength > 0)
            {
                windOscillator += Time.deltaTime * 2.5f;
                float gustCycle = Mathf.Sin(windOscillator) + Mathf.Sin(windOscillator * 2.3f) * 0.5f;
                currentWindGust = gustCycle * currentData.windStrength;
            }
            else
            {
                currentWindGust = 0f;
            }
        }

        public CountyData GetCountyData(TaiwanCounty county)
        {
            switch (county)
            {
                case TaiwanCounty.Taipei:
                    return new CountyData
                    {
                        county = TaiwanCounty.Taipei,
                        displayName = "新北 / 台北",
                        title = "【中永和百慕達迷宮 ＆ 台北橋機車瀑布】",
                        tagline = "「永和有永和路，中和也有永和路！」",
                        themeColor = new Color(0f, 0.9f, 1f),
                        sugarMultiplier = 1.0f,
                        windStrength = 0f,
                        roadFriction = 1.0f,
                        radarGlitch = true,
                        scooterSwarm = true,
                        kaohsiungTurn = false,
                        specialCargo = "樂華夜市三合一綜合刨冰"
                    };
                case TaiwanCounty.Hsinchu:
                    return new CountyData
                    {
                        county = TaiwanCounty.Hsinchu,
                        displayName = "新竹風城",
                        title = "【九降風狂襲 ＆ 竹科晶圓特急】",
                        tagline = "「吹到你不得不反向壓車 30 度的地獄怪風！」",
                        themeColor = new Color(0.46f, 1f, 0.01f),
                        sugarMultiplier = 1.0f,
                        windStrength = 14.0f,
                        roadFriction = 1.0f,
                        radarGlitch = false,
                        scooterSwarm = false,
                        kaohsiungTurn = false,
                        specialCargo = "竹科無塵室晶圓下午茶"
                    };
                case TaiwanCounty.Taichung:
                    return new CountyData
                    {
                        county = TaiwanCounty.Taichung,
                        displayName = "台中慶記",
                        title = "【七期豪車 ＆ 熱情棒球隊出沒】",
                        tagline = "「行車不禮讓，後車廂馬上下來四位球友！」",
                        themeColor = new Color(1f, 0.84f, 0f),
                        sugarMultiplier = 1.0f,
                        windStrength = 0f,
                        roadFriction = 1.0f,
                        radarGlitch = false,
                        scooterSwarm = false,
                        kaohsiungTurn = false,
                        specialCargo = "逢甲大腸包小腸＋東泉辣椒醬"
                    };
                case TaiwanCounty.Tainan:
                    return new CountyData
                    {
                        county = TaiwanCounty.Tainan,
                        displayName = "台南全糖",
                        title = "【全糖宇宙 ＆ 東門圓環多重宇宙】",
                        tagline = "「甜到會長螞蟻！珍奶比重加倍，重量級晃動！」",
                        themeColor = new Color(1f, 0.25f, 0.51f),
                        sugarMultiplier = 2.2f,
                        windStrength = 0f,
                        roadFriction = 1.0f,
                        radarGlitch = false,
                        scooterSwarm = false,
                        kaohsiungTurn = false,
                        specialCargo = "全糖正宗黑糖珍珠鮮奶（甜度200%）"
                    };
                case TaiwanCounty.Kaohsiung:
                    return new CountyData
                    {
                        county = TaiwanCounty.Kaohsiung,
                        displayName = "高雄港都",
                        title = "【正宗高雄式左轉 ＆ 輕軌軌道滑移】",
                        tagline = "「走斑馬線紅燈直行再切左轉，在高雄才是王者！」",
                        themeColor = new Color(1f, 0.43f, 0.25f),
                        sugarMultiplier = 1.0f,
                        windStrength = 0f,
                        roadFriction = 0.95f,
                        radarGlitch = false,
                        scooterSwarm = false,
                        kaohsiungTurn = true,
                        specialCargo = "六合夜市極品海產粥"
                    };
                case TaiwanCounty.Keelung:
                    return new CountyData
                    {
                        county = TaiwanCounty.Keelung,
                        displayName = "基隆雨港",
                        title = "【雨港奪命標線 ＆ 舊金山級階梯巷】",
                        tagline = "「天天落雨，路面標線滑如溜冰場，急煞必甩尾！」",
                        themeColor = new Color(0.25f, 0.77f, 1f),
                        sugarMultiplier = 1.0f,
                        windStrength = 3.0f,
                        roadFriction = 0.65f,
                        radarGlitch = false,
                        scooterSwarm = false,
                        kaohsiungTurn = false,
                        specialCargo = "廟口夜市正宗營養三明治"
                    };
                case TaiwanCounty.Yilan:
                    return new CountyData
                    {
                        county = TaiwanCounty.Yilan,
                        displayName = "宜蘭北宜",
                        title = "【九彎十八拐 ＆ 山道大砲追焦手】",
                        tagline = "「盲彎壓白線過彎，閃避滿載砂石車與追焦相機！」",
                        themeColor = new Color(0.7f, 0.53f, 1f),
                        sugarMultiplier = 1.0f,
                        windStrength = 0f,
                        roadFriction = 1.0f,
                        radarGlitch = false,
                        scooterSwarm = false,
                        kaohsiungTurn = false,
                        specialCargo = "正宗三星蔥油餅＋宜蘭牛舌餅"
                    };
                default:
                    return default;
            }
        }
    }
}
