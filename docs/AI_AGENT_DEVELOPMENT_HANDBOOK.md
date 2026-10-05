# 《違停大作戰：福爾摩沙機車狂潮》
# AI 代理人開發交接手冊 (AI Agent Development Handbook)
> **致未來的 ChatGPT、Claude 與後續 Antigravity AI 代理人**：
> 當你讀到這份手冊時，你正在參與一款極具爆紅潛力、以台灣交通文化迷因為主題的 3D 街機物理駕駛遊戲《違停大作戰（Scooter Mayhem: Formosa Traffic）》。
> 請完整研讀本手冊，你將能無縫理解整個專案的代碼骨幹、物理公式、現有進度與後續擴充方針。

---

## 1. 雙軌架構與檔案地圖 (Project Architecture Map)

專案採用**「Web 網頁原型先驅驗證 ＋ Unity 6 商業版平行架構」**的雙軌模式：

```
Scooter Mayhem Formosa Traffic_AI_Studio/
├── docs/                                 # 企劃與 AI 協同文檔
│   ├── GAME_DESIGN_DOCUMENT.md           # 完整遊戲企劃書 (GDD)
│   ├── CLAUDE_COLLABORATION_GUIDE.md     # 雙 AI 協作速查指南
│   └── AI_AGENT_DEVELOPMENT_HANDBOOK.md  # 【本文件】AI 開發交接全手冊
│
├── web-prototype/                        # 即時可玩的 WebGL/Three.js 遊戲原型
│   ├── index.html                        # 遊戲 HUD、雷達畫布、珍奶儀表、雙手觸控鍵盤、四大神車出發選車格、改裝車庫、成就彈窗
│   ├── vite.config.js                    # Vite 靜態配置 (base: './' 完美相容 GitHub Pages 子路徑與 Cloudflare Workers)
│   ├── package.json                      # Node 18 + Vite 5.4.11 (嚴禁安裝與 Node 18 不相容之套件)
│   └── src/
│       ├── main.js                       # 遊戲主循環、Three.js 場景、雙手觸控自適應、兩段式左轉判定、神車快速切換、雷達繪製
│       ├── style.css                     # 賽博龐克夜市 UI、雙手虛擬手把樣式、冷氣水滴雨刷、成就卡片、縣市橫幅
│       ├── audio/
│       │   └── SoundManager.js           # Web Audio API 合成音效引擎 (轉速、喇叭、宮廟鑼鼓、水花滑移、TTS 語音、BGM)
│       ├── cargo/
│       │   └── BobaPhysics.js            # 黑糖珍珠鮮奶物理系統 (2D 液體阻尼晃動、珍珠粒子、封膜 HP、媽祖神力回復)
│       ├── city/
│       │   └── CityGenerator.js          # 程序化台灣街道街區 (二丁掛騎樓、兩段式待轉區、熱拌標線、粉紅超跑、路霸分佈)
│       ├── game/
│       │   ├── AchievementManager.js     # 台灣迷因成就里程碑系統 (15 大台灣文化成就：台北橋、全糖意志、白線水上漂、粉紅超跑等)
│       │   ├── TimeWeatherSystem.js      # 動態時間與天氣系統 (逢甲黃昏、通化深夜Cyberpunk、狂暴雷雨與動態打雷閃電)
│       │   ├── CountySystem.js           # 全台 7 大縣市專屬路況與天氣系統 (風力、摩擦力、糖漿比重、3D雨雪落葉粒子)
│       │   ├── GameMode.js               # Crazy Taxi 街機外送任務系統 (倒數計時、顧客目標、評級結算、連擊加分)
│       │   └── UpgradeShop.js            # 阿明機車行改裝車庫 (四大神車0元即選、避震保溫箱、雙層封膜、白鐵管、迷因喇叭)
│       ├── models/
│       │   └── ModelFactory.js           # 程序化 3D 模型庫 (勁戰/豪邁/偉士牌/Many、搶單猴子、夜市香腸地瓜球攤、粉紅超跑、神轎)
│       ├── physics/
│       │   └── ScooterController.js      # 兩輪機車街機物理引擎 (壓車傾角、暴雨白線滑移Drift、水花粒子、結冰水氮氣、防穿牆)
│       └── traffic/
│           └── TrafficSystem.js          # 動態交通事件與三寶 AI (突開車門、三寶阿嬤、雙開搶單猴子、夜市攤車、粉紅超跑、兩段待轉區)
│
├── .github/workflows/
│   └── deploy.yml                        # GitHub Pages 一鍵自動化 CI/CD 發布流程 (Push main/master 自動編譯發布)
│
└── unity-scooter-mayhem/                 # Unity 6.0 LTS 正式版 C# 核心腳本
    └── Assets/Scripts/
        ├── Camera/
        │   └── ArcadeChaseCamera.cs         # 動態街機追尾鏡頭 (縱向G力拉遠/推近、過彎頂點前瞻、路面微震動、動態FOV)
        ├── Vehicle/
        │   ├── ScooterVehicleController.cs  # Unity Rigidbody 兩輪機車物理、點頭/後沉重量感與雙軸懸吊
        │   ├── NitroBoostSystem.cs          # 結冰水氮氣爆衝與動態 FOV 廣角推進
        │   └── WetLineDriftController.cs    # 雨天熱拌標線「白線滑移」Drift 物理與水花粒子
        ├── Cargo/
        │   └── BobaLiquidCargoSystem.cs     # Unity 珍奶液體晃動與破膜噴灑系統
        ├── Traffic/
        │   ├── HazardCarDoorAI.cs          # 阿法神車突開車門 AI
        │   ├── MarketGrandmaAI.cs          # 菜市場三寶阿嬤鬼切 AI
        │   ├── SpeedTrapCamera.cs          # 測速照相機桿與翹孤輪遮牌判定
        │   ├── CitizenSnitchAI.cs          # 檢舉魔人攝影拍照判定
        │   ├── TempleParadeEvent.cs        # 宮廟神轎搖擺與大地雷鞭炮震動
        │   ├── PoliceCheckpointAI.cs       # 警察路檢酒測臨檢站與拒檢判定
        │   ├── StreetHogObstacle.cs        # 違規路霸破辦公椅與水泥桶碰撞清除物理
        │   ├── GarbageTruckAI.cs           # 清潔隊黃色垃圾車爬行與少女的祈禱超車判定
        │   ├── RivalDeliveryMonkeyAI.cs    # 雙開搶單外送猴子 AI (多手機架、大聲公叫囂、高速超車判定)
        │   ├── NightMarketStall.cs         # 夜市流動攤販 (炭烤香腸與地瓜球極限穿梭加分)
        │   ├── TwoStageTurnZone.cs         # 機慢車兩段式左轉待轉格與科技執法遮牌判定
        │   ├── PinkSupercarMazuProcession.cs # 白沙屯/大甲媽祖「粉紅超跑」神轎隊伍與鑽轎底神力加持
        │   ├── RoadsideBanquetAI.cs        # 廟口路邊辦桌流水席 (棚架桌椅物理翻桌與鑽桌縫獎勵)
        │   ├── RailwayLevelCrossingAI.cs   # 台鐵平交道與 EMU3000 自強號急速呼嘯 (4階段升降柵欄與警鈴)
        │   └── ManholeCoverAI.cs           # 台灣鑄鐵人孔蓋 (前後輪金屬敲擊喀咚聲、懸吊衝擊、雨天滑移神走位)
        ├── Environment/
        │   └── TimeWeatherController.cs    # Unity 日夜切換、賽博龐克通化夜景與打雷閃電
        └── Game/
            ├── DeliveryMissionManager.cs   # Unity 任務與評級結算
            ├── ScooterGarageManager.cs     # Unity 改裝裝備庫管理
            ├── CountySystem.cs             # 全台 7 縣市路況、側風、天氣與阻尼修正
            └── AchievementSystem.cs        # 15 大台灣迷因成就里程碑系統
```

---

## 2. 核心運算規則與防穿牆保障 (Critical Rules)

### 2.1 防穿牆實體推離演算法 (Circle-to-AABB Penetration Resolver)
過去版本中機車在高速行駛時可能因邊界判定錯誤而穿透透天厝騎樓。
**目前的黃金防護機制（請勿隨意修改）**：
* 建築外牆實體邊界固定為：
  * 西側騎樓外牆：$X \in [-30.0, -9.8]$
  * 東側騎樓外牆：$X \in [9.8, 30.0]$
  * 南北世界盡頭：$Z \in [-185, -176]$ 與 $[176, 185]$
* 在 `ScooterController.js` 的 `resolveCollisions()` 中，每影格使用圓形對 AABB 盒取最近點投影 $\vec{P}_{closest}$。若距離小於機車碰撞半徑 $R=0.65\text{ m}$，以重疊深度（Penetration Depth）沿外向法線強制將機車座標推離，並反向反彈速度向量。

### 2.2 全台 7 縣市切換機制
`CountySystem.js` 集中管理全台 7 縣市數值與專屬特徵：
* **新北/台北 (`TAIPEI`)**：`radarGlitch: true`（中永和百慕達雷達指針擾動）、`scooterSwarm: true`（車流激增）。
* **新竹 (`HSINCHU`)**：`windStrength: 14.0`（8 級動態側風推力，逼迫反向壓車）、3D 空中落葉紙片粒子。
* **台中 (`TAICHUNG`)**：七期黑道豪車穿梭，千萬別亂按喇叭以免遭遇球棒隊！
* **台南 (`TAINAN`)**：`sugarMultiplier: 2.2`（全糖宇宙，珍奶晃動動量倍增、阻尼折半）。
* **高雄 (`KAOHSIUNG`)**：`kaohsiungTurn: true`（正宗高雄式左轉獎勵，穿過斑馬線紅燈左轉可獲小費）。
* **基隆 (`KEELUNG`)**：`roadFriction: 0.65`（雨港熱融標線濕滑溜冰，煞車距離加倍）、3D 連綿雨滴粒子。
* **宜蘭 (`YILAN`)**：九彎十八拐山道盲彎、大砲長焦追焦攝影師路旁抓拍。

---

## 3. 未來 AI 代理人擴充指引 (Step-by-Step Task Guides)

### 3.1 如何新增一個全新的台灣縣市或地標？
假設你要新增「**彰化八卦山**」或「**屏東墾丁**」：
1. **修改 `src/game/CountySystem.js`**：
   在 `COUNTIES` 物件新增鍵值（例如 `CHANGHUA`），設定其 `name`、`title`、`tagline`、`sugarMultiplier`、`roadFriction` 與 `playCountyVoice` 台詞。
2. **修改 `index.html`**：
   在 `.county-pills` 內加入按鈕 `<button class="county-btn" data-county="CHANGHUA">彰化肉圓</button>`。
3. **在 `src/main.js`**：
   將鍵盤快捷鍵陣列 `countyList` 補上對應 ID 即可自動聯動。

### 3.2 如何新增一個全新的台灣文化路障或 NPC？
1. **在 `src/models/ModelFactory.js`**：
   撰寫 `createYourObstacle()` 函式，利用低多邊形 Box、Cylinder、Canvas Texture 拼裝出具辨識度的外觀。
2. **在 `src/city/CityGenerator.js`**：
   在 `createSidewalkClutter()` 的街區 segment 中配置位置與碰撞盒（若為實體障礙物加入 `this.colliders.push(...)`）。
3. **在 `src/traffic/TrafficSystem.js`**：
   在 `spawnTrafficGrid()` 生成實例，並於 `update(dt, playerController)` 實作接近判定、語音喊話與連擊加分（`this.triggerCombo('名稱', 分數)`）。

---

## 4. 給 ChatGPT 與 Claude 的即用提示詞庫 (Prompt Templates)

未來的工程師只要直接複製以下區塊給 ChatGPT 或 Claude，即可無痛推進開發：

### 提示詞 A：為 Unity 6 專案實作「全糖珍奶液體晃動 Shader」
```markdown
你好 Claude / ChatGPT！我們正在用 Unity 6 開發 3D 街機遊戲《違停大作戰：福爾摩沙機車狂潮》。
目前在 Assets/Scripts/Cargo/BobaLiquidCargoSystem.cs 已經有完整的阻尼晃動物理計算，後座珍奶有 liquidAngle、sealHp 等數值。

請為我們撰寫一個 Unity URP (Universal Render Pipeline) 的 Shader Graph 或 HLSL Custom Shader：
1. 表現透明塑膠杯內裝著黑糖珍珠奶茶的液體切面（Liquid Surface Slosh Plane）。
2. 杯身周圍帶有隨機流動的手炒黑糖「虎紋（Tiger Stripes）」。
3. 當封膜破裂時，杯口周圍產生飛濺的小水滴粒子（Particle System）。
請提供 HLSL 程式碼或 Shader Graph 節點配置說明。
```

### 提示詞 B：擴充「冬日薑母鴨酒測臨檢站」機制
```markdown
你好！請為《違停大作戰》的 Web 原型 (Three.js) 與 Unity 專案新增「薑母鴨酒測臨檢站」文化事件：
1. 模型需求：警察三角路障、紅色爆閃指揮棒、臨檢路口告示牌「酒測臨檢 停車受檢」。
2. 玩法機制：如果玩家剛送完「冬季進補薑母鴨」或「藥燉排骨」，通過臨檢站時會觸發酒測檢驗。
3. 玩家操作：畫面出現「酒測吹氣指示條」，玩家必須有節奏地按空白鍵控制呼吸平衡條，若失敗將被開單並扣除車輛極速！
請分別給出 JavaScript 與 C# 核心實作代碼。
```

### 提示詞 C：設計 Steam 商店頁面在地化迷因與宣傳文案
```markdown
你好！請為《違停大作戰（Scooter Mayhem: Formosa Traffic）》撰寫 Steam 商店頁面的行銷文案：
包含：
1. 繁體中文版本（充滿台灣機車族共鳴、迷因梗、笑點拉滿）。
2. 英文版本（向歐美玩家解釋台灣特有交通文化反差萌，突顯「Crazy Taxi meets Boba Physics」）。
3. 日文版本（突出台灣夜市懷舊賽博龐克感與誇張布娃娃物理搞笑風格）。
4. 條列 10 個核心 Steam 成就（如：「這很台北橋」、「全糖的意志」、「神之翹孤輪」、「球友的問候」）。
```

### 提示詞 D：擴充「老舊公寓頂樓鐵皮加蓋違建與高空鋼索飛車」機制
```markdown
你好 Claude / ChatGPT！我們正在開發《違停大作戰：福爾摩沙機車狂潮》。
請為 Web 原型 (Three.js) 與 Unity 6 專案新增台灣標誌性的「公寓頂樓鐵皮屋飛車」特技路線：
1. 模型需求：波浪綠色/藍色鐵皮屋頂、生鏽逃生鐵梯、頂樓加蓋鐵皮屋、曬衣桿吊滿四角褲、鴿舍與大水塔。
2. 玩法機制：玩家可從狹窄巷弄撞開障礙衝上鐵梯飛上屋頂，在連綿的鐵皮加蓋屋頂上狂飆飛越，避開地面塞車！
3. 特殊特技：從大水塔頂端飛躍降落至對面街區，獎勵【頂樓加蓋特技車神！】+1800 PTS！
請分別給出 JavaScript (CityGenerator.js / ScooterController.js) 與 Unity C# (RooftopRampSystem.cs) 實作代碼。
```

### 提示詞 E：擴充「夜市排骨酥與臭豆腐油煙煙幕彈」路障機制
```markdown
你好！請為《違停大作戰》設計「夜市濃烈油煙煙幕」路況事件：
1. 視覺與粒子：白霧與金黃色濃密油煙粒子從排氣管狂噴而出，籠罩路段（煙幕半徑 8m，能見度驟降 80%）。
2. 玩法機制：進入油煙區時，騎士畫面產生白煙遮蔽與咳嗽聲效，後座貨物「保溫箱」防護力降低；若長按喇叭可藉由風壓吹散部分油煙！
3. 盲眼穿行：在零能見度下以時速 > 30 km/h 成功穿過油煙區，觸發【盲眼夜市幽靈】+1000 PTS！
請提供核心演算法與 Web + Unity 雙軌代碼。
```

---

## 5. 本地執行與建置指令備忘 (CLI Cheatsheet)

* **啟動 Web 開發伺服器**：
  ```bash
  cd web-prototype
  npm run dev
  # 預設啟動於 http://localhost:3001/
  ```
* **執行 Production 編譯驗證**：
  ```bash
  cd web-prototype
  npm run build
  # 輸出至 dist/，確保 0 報錯
  ```
* **執行 AI 自駕實時試玩腳本 (Playtest)**：
  ```bash
  cd web-prototype
  node scripts/ai_playtest.js
  # 自動調度無頭 Chrome 自駕、壓車、翹孤輪、切換天氣、觸控鍵盤並保存實測截圖至 docs/playtest_screenshots/
  ```
* **執行環境限制**：本機 Node.js 版本為 `v18.15.0`，因此 Vite 鎖定在 `5.4.11`，請勿隨意升級至需要 Node 20+ 的 `create-vite@latest`。

---

## 6. AI 實時自駕試玩成果與品質驗證 (Playtest Validation)

本專案配置由 Antigravity 代理人自動駕駛的 Puppeteer 測試機器人 (`web-prototype/scripts/ai_playtest.js`)，已全面驗證以下項目：
1. **外送平台推播與爆笑備註**：
   - 15 組台灣奇葩顧客備註隨機派單，手機外送新單推播卡（`#order-card-popup`）霓虹滑入動畫與語音播報。
   - 結算單同步顯示原訂單備註與顧客 1~5 星級個性化留言反饋。
2. **交通生態與路況事件**：
   - 【廟口路邊辦桌流水席】：條紋塑膠大棚架、大紅燈籠、折疊式大紅圓桌、塑膠圓凳、龍蝦冷盤、紅蟳米糕、烏骨雞湯、總鋪師不鏽鋼蒸籠。極限鑽縫獲【鑽流水席棚架車神！】+1200 PTS；撞擊翻桌飛散餐具與賠償 $400。
   - 【台鐵平交道自強號急速呼嘯】：鐵軌枕木、雙紅閃爍燈頭、自動降下黑黃斑馬紋遮斷桿、自強號/EMU3000 高速橫越。停等獲【平交道停看聽楷模】+600 PTS；擦身飛馳獲【平交道極限生死時速！】+2000 PTS；被撞超級大暴走。
   - 【99秒超長倒數紅綠燈】：7段倒數計時器（35s 紅燈 / 22s 綠燈 / 3.5s 黃燈）。最後 3s 起步偷跑彈射 +600 PTS；紅燈 >5s 硬闖科技執法重罰 $1,800 + 通緝熱度 +2。
   - 【台南東門圓環莫比烏斯迷走】：3D 綠島、老榕樹、歷史地標石碑、六向出口路標。順利切出獲【圓環車神突破八卦陣！】+1000 PTS；迷航逾時扣款 $300。
   - 【行人地獄斑馬線科技執法】：3D 行人（撐傘阿姨、推車長輩、牽柴犬阿伯）斑馬線穿越。未停讓罰 $1200；停讓獲【禮讓行人楷模】+800 PTS！
   - 【警方通緝等級與巡邏警車圍捕】：多次違規累積通緝三星，巡邏警車鳴笛警報以 94 KM/H 緊迫追捕，鑽車縫、水溝蓋或翹孤輪遮牌甩脫！
   - 【改裝白鐵管回火放炮】：起步與急煞回火連續放炮爆震與烈焰光球粒子。
3. **物理與操控系統**：
   - 5 大台灣神車（勁戰四代、豪邁 125、復古偉士牌、Many 110、阿公瓦斯車）動力曲線與逆操舵壓車滾轉（Roll Lean）。
   - 阿公瓦斯車雙桶 20kg LPG 液化瓦斯閥門氣流推進（Shift / Q 加速衝擊）。
   - 4 大外送貨物物理：黑糖珍奶流體阻尼晃動、特選紅殼土雞蛋碰撞碎裂、滿料八寶全糖挫冰高溫消融、現炸逢甲大雞排對流散熱。
   - 【神之翹孤輪】（Shift / Q 鍵）車牌視線仰角阻斷特技，規避科技執法測速照相機。
4. **截圖與錄影存檔目錄**：
   - 實測高清截圖已保存於 `docs/playtest_screenshots/`（包含路邊辦桌與平交道實測 `06_banquet_and_railway.png`、多人連線方案 A `multiplayer_scheme_a_p2p.png`、方案 B `multiplayer_scheme_b_websocket.png` 等）。
   - 四重大滿貫通關音效錄影檔已生成於 `docs/playtest_videos/scooter_mayhem_full_campaign.webm`。

---

## 7. 車友連線中心 (Multiplayer Connection Hub) 開發規範

遊戲支援兩種連線方式供玩家在介面中自由選擇：

### 方案 A：好友 P2P 免費開房 (WebRTC Direct P2P via PeerJS)
* **特點**：零伺服器維護成本，使用 Google 免費 STUN 伺服器進行點對點握手，極低延遲。
* **流程**：
  1. 房主點擊「👑 建立房間 (Host Room)」生成 6 碼房間代號（如 `TP-8888`）。
  2. 車友點擊「🚀 加入好友房間 (Join Room)」並輸入房號。
  3. 雙方建立 DataChannel，以 20Hz 廣播機車位置、傾角、速度、車種與喇叭動作。

### 方案 B：公開伺服器大廳 (WebSocket Lobby Relay)
* **特點**：集中廣播、隨進隨出、多人同台大混戰。
* **流程**：
  1. 連線至預設公開中繼節點（`wss://relay.scooter-mayhem.tw/ws`）或本地伺服器（`ws://localhost:8080`）。
  2. 開發者或玩家可於終端機執行 `npm run lobby` 啟動自架輕量 WebSocket 伺服器 (`server/lobby_server.js`)。

### 遠端車手 3D 渲染與同屏互動
* `NetworkManager.js` 自動管理遠端車手生命週期：
  - 生成對應車種的 3D 機車模型，並附帶頭頂 Billboard 畫布車手稱號標籤（如 `🛵 三重大甩尾阿伯`）。
  - 死推預測平滑插值（Dead Reckoning Lerp），確保 60FPS 流暢過彎。
  - 遠端車友按喇叭時，本地播放 3D 空間定位「叭叭！」音效並觸發動態稱號牌放大彈跳效果。
  - Mini-map 雷達自動標繪紫色車友圓點。

---

## 8. Web Audio 實時音頻軌道錄影規範 (Audio-Synchronized Video Capture)

* **音訊總線架構 (`SoundManager.js`)**：
  - 所有 36 組程序化合成音訊節點（雙衝程引擎、City-Pop 貝斯與和弦、喇叭「叭叭！」、煞車尖銳聲、平交道鈴聲）統一路由至 `this.masterOut`。
  - `this.masterOut` 同步輸出至硬體揚聲器 (`this.ctx.destination`) 與媒體串流輸出 (`this.streamDest = this.ctx.createMediaStreamDestination()`)。
* **錄影腳本整合 (`scripts/record_playthrough.js`)**：
  - Puppeteer 透過 `MediaStreamDestination.stream.getAudioTracks()[0]` 將即時音訊軌道注入 Canvas 串流：`combinedStream.addTrack(audioTrack)`。
  - 錄製容器指定 `video/webm;codecs=vp9,opus`，生成具備 100% 同步音效與配樂的高畫質全通關實機錄影。



