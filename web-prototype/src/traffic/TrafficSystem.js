// TrafficSystem.js - Chaotic Taiwanese Traffic Events & AI Spawner
import * as THREE from 'three';

export class TrafficSystem {
  constructor(scene, modelFactory, soundManager) {
    this.scene = scene;
    this.factory = modelFactory;
    this.sound = soundManager;

    // Traffic Collections
    this.alphards = [];
    this.taxis = [];
    this.trucks = [];
    this.grandmas = [];
    this.dogs = [];
    this.droplets = [];
    this.speedCameras = [];
    this.snitches = [];
    this.templeParades = [];
    this.firecrackers = [];
    this.potholes = [];
    this.manholeCovers = [];
    this.tricycles = [];
    this.soundTrucks = [];
    this.steelPlates = [];
    this.photographers = [];
    this.betelNutKiosks = [];
    this.policeCheckpoints = [];
    this.commuterScooters = [];
    this.streetHogs = [];
    this.garbageTrucks = [];
    this.rivalMonkeys = [];
    this.marketStalls = [];
    this.pinkSupercars = [];
    this.puddles = [];
    this.pedestrians = [];
    this.pursuitCruiser = null;
    this.pursuitActive = false;
    this.pursuitSpeed = 0;
    this.pursuitPos = new THREE.Vector3(0, 0, -200);
    this.pursuitTimer = 0;
    this.pursuitLoseSightTimer = 0;
    this.wantedHeat = 0;
    this.wantedDecayTimer = 0;
    this.trafficSignals = [];
    this.tainanRoundabout = null;
    this.roundaboutTimer = 0;
    this.roundaboutAwarded = false;
    this.banquets = [];
    this.railwayCrossing = null;
    this.expressTrain = null;
    this.railwayState = 'IDLE';
    this.railwayTimer = 16.0;
    this.trainX = -85.0;
    this.trainSpeed = 34.0;
    this.railwayBellTimer = 0;
    this.railwayFlasherPhase = 0;
    this.railwayAwarded = false;
    this.railwayStopYieldAwarded = false;
    this.intersectionCheckers = [
      { z: -90, timer: 0 },
      { z: 0, timer: 0 },
      { z: 90, timer: 0 }
    ];

    // Uncle Ming's Tire Pitstop & Sobriety Checkpoint
    this.airPitstopPos = new THREE.Vector3(-6.2, 0, 148);
    this.airPitstopCooldown = 0;
    this.sobrietyStationPos = new THREE.Vector3(2.5, 0, 45);
    this.sobrietyStationChecked = false;

    // Collision & Event Callbacks
    this.onComboEvent = null; // callback (title, points)
    this.onWaterDropHit = null; // callback for visor splatter
    this.onPuddleSplash = null; // callback for puddle splash
    this.onFineEvent = null; // callback (reason, amount)
    this.onScreenFlash = null; // callback for camera flash
    this.onBobaHeal = null; // callback to restore boba seal HP
    this.onWantedChange = null; // callback (heatLevel 0-3)
  }

  // Populate street with parked cars & dynamic hazards
  spawnTrafficGrid(streetSegments) {
    streetSegments.forEach(seg => {
      // 1. Double-Parked Alphard / Van with dynamic opening doors
      if (seg.hasAlphard) {
        const van = this.factory.createAlphardVan();
        van.position.set(seg.alphardX, 0, seg.alphardZ);
        van.rotation.y = seg.alphardRot || 0;
        this.scene.add(van);

        this.alphards.push({
          mesh: van,
          doorPivot: van.getObjectByName('doorPivot'),
          hazardLights: van.getObjectByName('hazardLights'),
          triggered: false,
          doorAngle: 0,
          targetAngle: 0,
          dodgeAwarded: false,
          pos: new THREE.Vector3(seg.alphardX, 0, seg.alphardZ),
          rot: seg.alphardRot || 0
        });
      }

      // 2. Yellow Taxi
      if (seg.hasTaxi) {
        const taxi = this.factory.createTaxi();
        taxi.position.set(seg.taxiX, 0, seg.taxiZ);
        taxi.rotation.y = seg.taxiRot || 0;
        this.scene.add(taxi);
        this.taxis.push({ mesh: taxi, pos: taxi.position });
      }

      // 3. Small Blue Truck
      if (seg.hasTruck) {
        const truck = this.factory.createBlueTruck();
        truck.position.set(seg.truckX, 0, seg.truckZ);
        truck.rotation.y = seg.truckRot || 0;
        this.scene.add(truck);
        this.trucks.push({ mesh: truck, pos: truck.position });
      }

      // 4. Market Grandma (三寶阿嬤)
      if (seg.hasGrandma) {
        const grandma = this.factory.createGrandmaScooter();
        grandma.position.set(seg.grandmaX, 0, seg.grandmaZ);
        grandma.rotation.y = seg.grandmaRot || 0;
        this.scene.add(grandma);

        this.grandmas.push({
          mesh: grandma,
          pos: grandma.position,
          speed: 4.5, // ~16 km/h
          baseX: seg.grandmaX,
          baseZ: seg.grandmaZ,
          cutLeft: false,
          dodgeAwarded: false,
          blinker: grandma.getObjectByName('blinker') || grandma.userData.blinkerR,
          blinkerTimer: 0
        });
      }

      // 5. Stray Black Dog
      if (seg.hasDog) {
        const dog = this.factory.createBlackDog();
        dog.position.set(seg.dogX, 0, seg.dogZ);
        this.scene.add(dog);

        this.dogs.push({
          mesh: dog,
          state: 'idle', // idle, chasing, retreating
          timer: 0,
          basePos: new THREE.Vector3(seg.dogX, 0, seg.dogZ),
          tail: dog.getObjectByName('tail')
        });
      }

      // 6. AC Drip Zone
      if (seg.hasAcDrip) {
        this.droplets.push({
          x: seg.acX,
          z: seg.acZ,
          y: 7.5,
          mesh: this.createDropletMesh(seg.acX, 7.5, seg.acZ)
        });
      }

      // 7. Speed Trap Camera (科技執法測速照相機桿)
      if (seg.hasSpeedCamera) {
        const cam = this.factory.createSpeedCamera();
        cam.position.set(seg.camX, 0, seg.camZ);
        cam.rotation.y = seg.camRot || 0;
        this.scene.add(cam);
        this.speedCameras.push({
          mesh: cam,
          pos: new THREE.Vector3(seg.camX, 0, seg.camZ),
          flashMesh: cam.getObjectByName('flashMesh'),
          triggered: false,
          dodgeAwarded: false
        });
      }

      // 8. Citizen Snitch NPC (檢舉魔人)
      if (seg.hasSnitch) {
        const snitch = this.factory.createCitizenSnitch();
        snitch.position.set(seg.snitchX, 0, seg.snitchZ);
        snitch.rotation.y = seg.snitchX > 0 ? -Math.PI / 2 : Math.PI / 2;
        this.scene.add(snitch);
        this.snitches.push({
          mesh: snitch,
          pos: new THREE.Vector3(seg.snitchX, 0, seg.snitchZ),
          flashBulb: snitch.getObjectByName('flashBulb'),
          triggered: false
        });
      }

      // 9. Temple Fair Parade (宮廟神轎隊伍 - 帶金碧輝煌七彩霓虹神轎)
      if (seg.hasTempleParade) {
        const parade = this.factory.createTempleSedanChair();
        parade.position.set(seg.templeX, 0, seg.templeZ);
        this.scene.add(parade);
        this.templeParades.push({
          mesh: parade,
          pos: new THREE.Vector3(seg.templeX, 0, seg.templeZ),
          baseX: seg.templeX,
          swayTimer: 0,
          sedanLeds: parade.getObjectByName('sedanLeds')
        });
      }

      // 10. Firecrackers Strip (大地雷紅色滾筒鞭炮)
      if (seg.hasFirecrackers) {
        const fc = this.factory.createFirecrackers(10);
        fc.position.set(seg.firecrackerX, 0, seg.firecrackerZ);
        this.scene.add(fc);
        this.firecrackers.push({
          mesh: fc,
          pos: new THREE.Vector3(seg.firecrackerX, 0, seg.firecrackerZ),
          length: 10,
          triggered: false
        });
      }

      // 11. Road Potholes (道路補丁坑洞)
      if (seg.hasPothole) {
        const pot = this.factory.createPothole();
        pot.position.set(seg.potholeX, 0, seg.potholeZ);
        this.scene.add(pot);
        this.potholes.push({
          mesh: pot,
          pos: new THREE.Vector3(seg.potholeX, 0, seg.potholeZ),
          radius: 1.0
        });
      }

      // 11.5. Taiwanese Cast-Iron Manholes (道路人孔蓋)
      if (seg.hasManhole) {
        const mh = this.factory.createManholeCover(seg.manholeType || 'taipower');
        mh.position.set(seg.manholeX, 0, seg.manholeZ);
        this.scene.add(mh);
        this.manholeCovers.push({
          mesh: mh,
          pos: new THREE.Vector3(seg.manholeX, 0, seg.manholeZ),
          radius: 0.65,
          utility: seg.manholeType || 'taipower',
          onCover: false,
          driftBonusAwarded: false
        });
      }

      // 12. Scrap Cardboard Tricycle (資源回收紙箱三輪車)
      if (seg.hasTricycle) {
        const tri = this.factory.createCardboardTricycle();
        tri.position.set(seg.tricycleX, 0, seg.tricycleZ);
        this.scene.add(tri);
        this.tricycles.push({
          mesh: tri,
          pos: new THREE.Vector3(seg.tricycleX, 0, seg.tricycleZ),
          stackPivot: tri.getObjectByName('cardboardStack'),
          swayTimer: Math.random() * 5,
          dodgeAwarded: false,
          speed: 2.2
        });
      }

      // 13. Broadcast Sound Truck (土窯雞/炭烤地瓜廣播發財車)
      if (seg.hasSoundTruck) {
        const truck = this.factory.createSoundTruck();
        truck.position.set(seg.soundTruckX, 0, seg.soundTruckZ);
        truck.rotation.y = Math.PI;
        this.scene.add(truck);
        this.soundTrucks.push({
          mesh: truck,
          pos: new THREE.Vector3(seg.soundTruckX, 0, seg.soundTruckZ),
          soundWaveRing: truck.getObjectByName('soundWaveRing'),
          waveScale: 1,
          broadcastCooldown: 2,
          honkGreeted: false
        });
      }

      // 14. Roadwork Steel Jump Plate (道路施工鋼板跳台)
      if (seg.hasSteelPlate) {
        const plate = this.factory.createRoadworkSteelPlate();
        plate.position.set(seg.plateX, 0, seg.plateZ);
        this.scene.add(plate);

        const strobes = [];
        plate.traverse(child => {
          if (child.name === 'hazardLight') strobes.push(child);
        });

        this.steelPlates.push({
          mesh: plate,
          pos: new THREE.Vector3(seg.plateX, 0, seg.plateZ),
          width: 3.6,
          length: 4.2,
          strobes,
          hazardTimer: 0,
          onPlate: false,
          jumpAwarded: false
        });
      }

      // 15. Trackside Photographer NPC (北宜追焦大砲手)
      if (seg.hasPhotographer) {
        const photo = this.factory.createTracksidePhotographer();
        photo.position.set(seg.photographerX, 0, seg.photographerZ);
        photo.rotation.y = seg.photographerX > 0 ? -Math.PI / 2 : Math.PI / 2;
        this.scene.add(photo);
        this.photographers.push({
          mesh: photo,
          pos: new THREE.Vector3(seg.photographerX, 0, seg.photographerZ),
          flashBulb: photo.getObjectByName('flashBulb'),
          cooldown: 0
        });
      }

      // 16. Betel Nut Kiosk & Iced Water Nitro Station (雙子星檳榔攤 ＆ 結冰水)
      if (seg.hasBetelNut) {
        const kiosk = this.factory.createBetelNutKiosk();
        kiosk.position.set(seg.kioskX, 0, seg.kioskZ);
        kiosk.rotation.y = seg.kioskX > 0 ? -Math.PI / 2 : Math.PI / 2;
        this.scene.add(kiosk);

        const bottle = kiosk.getObjectByName('nitroBottle');
        const peacock = kiosk.getObjectByName('peacockNeon');

        this.betelNutKiosks.push({
          mesh: kiosk,
          pos: new THREE.Vector3(seg.kioskX, 0, seg.kioskZ),
          bottleMesh: bottle,
          peacockMesh: peacock,
          bottleActive: true,
          respawnTimer: 0
        });
      }

      // 17. Police DUI Breathalyzer Checkpoint (警察路檢酒測臨檢站)
      if (seg.hasPoliceCheckpoint) {
        const checkpoint = this.factory.createPoliceCheckpoint();
        checkpoint.position.set(seg.policeX, 0, seg.policeZ);
        this.scene.add(checkpoint);

        this.policeCheckpoints.push({
          mesh: checkpoint,
          pos: new THREE.Vector3(seg.policeX, 0, seg.policeZ),
          redStrobe: checkpoint.getObjectByName('lightbarRed'),
          blueStrobe: checkpoint.getObjectByName('lightbarBlue'),
          batonArm: checkpoint.getObjectByName('batonArmPivot'),
          checked: false,
          strobeTimer: 0,
          passAwarded: false,
          escapeAwarded: false
        });
      }

      // 19. Street Tyrant Space Hogs (路霸佔位器：破辦公椅 / 水泥油漆桶 / 盆栽)
      if (seg.hasStreetHog) {
        const hog = this.factory.createStreetHogObstacle(seg.hogType);
        hog.position.set(seg.hogX, 0, seg.hogZ);
        this.scene.add(hog);
        this.streetHogs.push({
          mesh: hog,
          pos: new THREE.Vector3(seg.hogX, 0, seg.hogZ),
          type: seg.hogType,
          cleared: false
        });
      }

      // 20. Yellow Municipal Garbage Truck (清潔隊黃色垃圾車)
      if (seg.hasGarbageTruck) {
        const truck = this.factory.createGarbageTruck();
        truck.position.set(seg.garbageX, 0, seg.garbageZ);
        this.scene.add(truck);
        this.garbageTrucks.push({
          mesh: truck,
          pos: new THREE.Vector3(seg.garbageX, 0, seg.garbageZ),
          beaconL: truck.getObjectByName('garbageBeaconL'),
          beaconR: truck.getObjectByName('garbageBeaconR'),
          beaconTimer: 0,
          speed: 4.0, // 14.4 km/h
          chimeTimer: 0,
          dodgeAwarded: false
        });
      }

      // 21. Rival Delivery Monkey NPC (外送員雙開搶單猴子)
      if (seg.hasRivalMonkey) {
        const monkey = this.factory.createRivalDeliveryMonkey();
        monkey.position.set(seg.monkeyX, 0, seg.monkeyZ);
        this.scene.add(monkey);
        this.rivalMonkeys.push({
          mesh: monkey,
          pos: monkey.position,
          speed: 13.0, // ~47 km/h aggressive racer
          laneX: seg.monkeyX,
          swayTimer: Math.random() * 5,
          yellCooldown: 3,
          dodgeAwarded: false
        });
      }

      // 22. Night Market Pushcart Stalls (夜市特色流動攤販)
      if (seg.hasMarketStall) {
        const stall = this.factory.createNightMarketStall(seg.stallType);
        stall.position.set(seg.stallX, 0, seg.stallZ);
        stall.rotation.y = seg.stallX > 0 ? -Math.PI / 2 : Math.PI / 2;
        this.scene.add(stall);
        this.marketStalls.push({
          mesh: stall,
          pos: new THREE.Vector3(seg.stallX, 0, seg.stallZ),
          type: seg.stallType,
          dodgeAwarded: false
        });
      }

      // 23. Mazu Pink Supercar Procession (白沙屯/大甲媽祖「粉紅超跑」神轎隊伍)
      if (seg.hasPinkSupercar) {
        const mazu = this.factory.createPinkSupercarMazu();
        mazu.position.set(seg.mazuX, 0, seg.mazuZ);
        this.scene.add(mazu);
        this.pinkSupercars.push({
          mesh: mazu,
          pos: new THREE.Vector3(seg.mazuX, 0, seg.mazuZ),
          baseX: seg.mazuX,
          speed: 3.5, // fast energetic marching
          swayTimer: 0,
          gongTimer: 0,
          halo: mazu.getObjectByName('mazuHalo'),
          dodgeAwarded: false
        });
      }
    });

    // 18. Commuter Scooter Swarm (台北橋機車瀑布通勤大潮)
    for (let c = 0; c < 5; c++) {
      const commuter = this.factory.createPlayerScooter({ lights: false });
      const spawnX = (c % 2 === 0 ? -2.6 : 2.6) + (Math.random() - 0.5) * 1.6;
      const spawnZ = -120 + c * 50;
      commuter.position.set(spawnX, 0, spawnZ);
      commuter.scale.set(0.92, 0.92, 0.92);
      this.scene.add(commuter);

      this.commuterScooters.push({
        mesh: commuter,
        pos: commuter.position,
        speed: 9.0 + Math.random() * 3.5, // 32 - 45 km/h
        laneX: spawnX,
        swayTimer: Math.random() * 5,
        dodgeAwarded: false
      });
    }

    // 25. Ghost-Cutting Vegetable Market Grandmas (菜市場三寶阿嬤 50cc)
    const grandmaSpawns = [
      { x: 4.8, z: -60 },
      { x: 4.8, z: 40 }
    ];
    grandmaSpawns.forEach(sp => {
      const gMesh = this.factory.createGrandmaScooter();
      gMesh.position.set(sp.x, 0, sp.z);
      this.scene.add(gMesh);
      this.grandmas.push({
        mesh: gMesh,
        pos: gMesh.position,
        speed: 5.0,
        baseX: sp.x,
        baseZ: sp.z,
        cutLeft: false,
        dodgeAwarded: false,
        blinker: gMesh.userData.blinkerR || gMesh.getObjectByName('blinker'),
        blinkerTimer: 0
      });
    });

    // 26. Giant Road Puddles (暴雨深水坑 - 乘風破浪水花秀)
    const puddleSpawns = [
      { x: -1.8, z: -35 },
      { x: 2.2, z: 25 },
      { x: 0.0, z: 85 }
    ];
    puddleSpawns.forEach(sp => {
      const pMesh = this.factory.createWaterPuddle();
      pMesh.position.set(sp.x, 0, sp.z);
      this.scene.add(pMesh);
      this.puddles.push({
        mesh: pMesh,
        pos: pMesh.position,
        radius: 2.4,
        splashed: false
      });
    });

    // 27. Crosswalk Pedestrians (行人地獄斑馬線行人系統)
    const crosswalkConfigs = [
      { z: -96, startX: -4.2, dir: 1, type: 0, speed: 1.3 },  // Umbrella Auntie
      { z: -84, startX: 4.0, dir: -1, type: 1, speed: 1.1 },  // Elder with Pushcart
      { z: -6, startX: -3.8, dir: 1, type: 2, speed: 1.5 },   // Uncle with Shiba Inu
      { z: 6, startX: 4.2, dir: -1, type: 0, speed: 1.3 },    // Umbrella Auntie
      { z: 84, startX: -4.0, dir: 1, type: 1, speed: 1.1 },   // Elder with Pushcart
      { z: 96, startX: 3.6, dir: -1, type: 2, speed: 1.6 }    // Uncle with Shiba Inu
    ];

    crosswalkConfigs.forEach(cfg => {
      const ped = this.factory.createPedestrian(cfg.type);
      ped.position.set(cfg.startX, 0, cfg.z);
      ped.rotation.y = cfg.dir === 1 ? Math.PI / 2 : -Math.PI / 2;
      this.scene.add(ped);

      this.pedestrians.push({
        mesh: ped,
        pos: ped.position,
        dir: cfg.dir,
        speed: cfg.speed,
        crossZ: cfg.z,
        type: cfg.type,
        fineAwarded: false,
        yieldAwarded: false,
        waveTimer: 0
      });
    });

    // 28. High-Speed Police Pursuit Cruiser (高速巡邏警車追捕系統)
    this.pursuitCruiser = this.factory.createPolicePatrolCar();
    this.pursuitCruiser.visible = false;
    this.pursuitCruiser.position.set(0, 0, -200);
    this.scene.add(this.pursuitCruiser);

    // 29. Countdown Traffic Signal Poles (99秒超長倒數紅綠燈)
    const signalIntersections = [
      { z: -90, street: '民生東路' },
      { z: 0, street: '中正路' },
      { z: 90, street: '忠孝東路' }
    ];

    signalIntersections.forEach(sig => {
      const pole = this.factory.createTrafficSignalPole(sig.street);
      pole.position.set(-6.2, 0, sig.z);
      this.scene.add(pole);

      this.trafficSignals.push({
        mesh: pole,
        interZ: sig.z,
        state: 'RED',
        timer: 35.0,
        jumpStartAwarded: false,
        redLightFined: false
      });
    });

    // 30. Tainan Dongmen Roundabout (台南東門圓環中央綠島)
    this.tainanRoundabout = this.factory.createTainanRoundaboutCenter();
    this.tainanRoundabout.position.set(0, 0, 0);
    this.tainanRoundabout.visible = false;
    this.scene.add(this.tainanRoundabout);

    // 31. Roadside Banquet (廟口路邊辦桌流水席)
    const banquet = this.factory.createRoadsideBanquet();
    banquet.position.set(3.4, 0, 48);
    this.scene.add(banquet);
    this.banquets.push({
      mesh: banquet,
      pos: new THREE.Vector3(3.4, 0, 48),
      crashAwarded: false,
      dodgeAwarded: false
    });

    // 32. Taiwan Railway Level Crossing & Express Train (台鐵平交道與自強號)
    this.railwayCrossing = this.factory.createRailwayCrossing();
    this.railwayCrossing.position.set(0, 0, -45);
    this.scene.add(this.railwayCrossing);

    this.expressTrain = this.factory.createExpressTrain();
    this.expressTrain.position.set(-90, 0, -45);
    this.expressTrain.visible = false;
    this.scene.add(this.expressTrain);
  }

  createDropletMesh(x, y, z) {
    const geo = new THREE.SphereGeometry(0.06, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0x81d4fa, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    return mesh;
  }

  update(dt, playerController, countyId = null, hookTurnBoxes = []) {
    const playerPos = playerController.position;
    const playerSpeed = playerController.getSpeedKmH();

    // 1. Update Alphard hazard doors & collision
    this.alphards.forEach(car => {
      // Flashing Hazard lights (雙黃燈閃爍)
      if (car.hazardLights) {
        const isBlinkOn = (Date.now() % 600) < 300;
        car.hazardLights.visible = isBlinkOn;
      }

      const dist = car.pos.distanceTo(playerPos);

      // Trigger door swing when player approaches within 13m
      if (!car.triggered && dist < 14) {
        // Player is coming from behind the van
        const toPlayer = playerPos.clone().sub(car.pos);
        if (toPlayer.z * Math.cos(car.rot) < 0 || dist < 10) {
          car.triggered = true;
          car.targetAngle = THREE.MathUtils.degToRad(75); // Swing out wide!
          this.sound?.playDoorOpen();
        }
      }

      // Animate door swing
      if (car.doorPivot) {
        car.doorAngle = THREE.MathUtils.lerp(car.doorAngle, car.targetAngle, dt * 14);
        car.doorPivot.rotation.y = car.doorAngle;
      }

      // Collision check with door or car body
      if (dist < 3.2) {
        // Compute door collision tip
        const doorTipWorld = new THREE.Vector3(-1.8, 0.95, -0.2)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), car.rot + car.doorAngle)
          .add(car.pos);

        const distToDoor = doorTipWorld.distanceTo(playerPos);

        if (car.doorAngle > 0.4 && distToDoor < 1.1) {
          // Slammed right into the open door!
          playerController.triggerCrash(15);
        } else if (dist < 1.8) {
          // Hit car body
          playerController.triggerCrash(10);
        }
      }

      // Check for Close-Call Door Dodge Combo
      if (car.triggered && !car.dodgeAwarded && dist < 2.4 && playerSpeed > 25 && !playerController.isCrashed) {
        car.dodgeAwarded = true;
        this.triggerCombo('神之側身！車門極限閃避', 1000);
      }
    });

    // 2. Update Market Grandma (三寶阿嬤 50cc 買菜車)
    this.grandmas.forEach(g => {
      // Blinker always flashes right
      g.blinkerTimer += dt;
      if (g.blinker) {
        g.blinker.visible = Math.floor(g.blinkerTimer * 5) % 2 === 0;
      }

      const dist = g.mesh.position.distanceTo(playerPos);

      // When player approaches within 18m, sudden sharp left cut! (鬼切左轉)
      if (!g.cutLeft && dist < 18) {
        g.cutLeft = true;
        this.sound?.speak('少年欸！借過啦！我要左轉！');
      }

      if (g.cutLeft) {
        // Turn sharply left while right blinker is blinking!
        g.mesh.rotation.y = THREE.MathUtils.lerp(g.mesh.rotation.y, Math.PI * 0.45, dt * 2.0);
      } else {
        g.mesh.rotation.y = 0;
      }

      // Move forward in current heading
      const forward = new THREE.Vector3(Math.sin(g.mesh.rotation.y), 0, Math.cos(g.mesh.rotation.y));
      g.mesh.position.addScaledVector(forward, g.speed * dt);
      if (g.mesh.position.z > 175) g.mesh.position.z = -175;

      // Collision with player
      if (dist < 1.35) {
        playerController.triggerCrash(10);
        this.sound?.speak('撞到阿嬤啦！賠慘了！');
      }

      // Close call dodge combo
      if (g.cutLeft && !g.dodgeAwarded && dist < 2.4 && playerSpeed > 22 && !playerController.isCrashed) {
        g.dodgeAwarded = true;
        this.triggerCombo('【神之閃避三寶阿嬤鬼切！】', 900);
        this.sound?.speak('好險！神之反應閃過阿嬤！');
      }

      if (dist > 35) {
        g.cutLeft = false;
        g.dodgeAwarded = false;
      }
    });

    // 3. Update Stray Black Dog (台灣小黑狗)
    this.dogs.forEach(d => {
      const dist = d.mesh.position.distanceTo(playerPos);

      // Wag tail
      if (d.tail) {
        d.tail.rotation.z = Math.sin(Date.now() * 0.02) * 0.4;
      }

      if (d.state === 'idle') {
        if (dist < 12 && playerSpeed > 15) {
          d.state = 'chasing';
          d.timer = 0;
          this.sound?.playDogBark();
        }
      } else if (d.state === 'chasing') {
        d.timer += dt;

        // Run towards player's rear tire
        const toPlayer = playerPos.clone().sub(d.mesh.position);
        toPlayer.y = 0;
        toPlayer.normalize();

        d.mesh.position.addScaledVector(toPlayer, 7.5 * dt); // Dog sprint ~27 km/h
        d.mesh.lookAt(playerPos.x, d.mesh.position.y, playerPos.z);

        // Periodically bark
        if (Math.random() < 0.03) {
          this.sound?.playDogBark();
        }

        // If player honks horn, dog gets scared and retreats!
        if (playerController.keys['h'] || playerController.hornPressed) {
          d.state = 'retreating';
          this.triggerCombo('喇叭逼退惡犬！', 400);
        }

        if (d.timer > 4.5 || dist > 25) {
          d.state = 'retreating';
        }
      } else if (d.state === 'retreating') {
        const toHome = d.basePos.clone().sub(d.mesh.position);
        if (toHome.length() > 0.5) {
          toHome.normalize();
          d.mesh.position.addScaledVector(toHome, 5.0 * dt);
          d.mesh.lookAt(d.basePos.x, d.mesh.position.y, d.basePos.z);
        } else {
          d.state = 'idle';
        }
      }
    });

    // 4. Update AC Water Droplets
    this.droplets.forEach(drop => {
      drop.y -= 9.8 * dt * 1.5;
      if (drop.y < 0) {
        drop.y = 7.5; // Reset to AC unit height
      }
      drop.mesh.position.y = drop.y;

      // Check hit on player helmet/visor
      const dropPos2D = new THREE.Vector2(drop.x, drop.z);
      const playerPos2D = new THREE.Vector2(playerPos.x, playerPos.z);
      if (dropPos2D.distanceTo(playerPos2D) < 0.9 && drop.y < 1.6 && drop.y > 0.8) {
        if (this.onWaterDropHit) this.onWaterDropHit();
        this.sound?.playTone(900, 0.05, 'sine', 0.15);
      }
    });

    // 5. Check Taxis & Blue Trucks static collision
    const staticVehicles = [...this.taxis, ...this.trucks];
    staticVehicles.forEach(veh => {
      const dist = veh.pos.distanceTo(playerPos);
      if (dist < 1.8) {
        playerController.triggerCrash(10);
      }
    });

    // 6. Update Speed Trap Cameras (科技執法測速照相機)
    this.speedCameras.forEach(cam => {
      const dist = cam.pos.distanceTo(playerPos);
      if (dist < 14) {
        if (playerSpeed > 60 && !cam.triggered) {
          cam.triggered = true;

          // Check if player is doing a wheelie to hide license plate!
          if (playerController.isPlateHidden) {
            this.triggerCombo('神之翹孤輪遮牌！避開測速罰單！', 1200);
            this.sound?.speak('漂亮！翹孤輪成功躲過測速照相！');
          } else {
            // Flashed and ticketed!
            if (cam.flashMesh) {
              cam.flashMesh.visible = true;
              setTimeout(() => { if (cam.flashMesh) cam.flashMesh.visible = false; }, 180);
            }
            if (this.onScreenFlash) this.onScreenFlash();
            this.sound?.playCameraShutter();
            this.sound?.speak('國家級追焦！超速拍照罰單！');
            if (this.onFineEvent) this.onFineEvent('【科技執法】超速拍照罰單', 300);
          }
        }
      } else if (dist > 30) {
        cam.triggered = false;
      }
    });

    // 7. Update Citizen Snitches (檢舉魔人)
    this.snitches.forEach(s => {
      const dist = s.pos.distanceTo(playerPos);
      if (dist < 12) {
        // Snitch takes photo if player is riding on sidewalk!
        const isOnSidewalk = Math.abs(playerPos.x) > 6.8;
        if (isOnSidewalk && !s.triggered && playerSpeed > 10) {
          s.triggered = true;
          if (s.flashBulb) {
            s.flashBulb.visible = true;
            setTimeout(() => { if (s.flashBulb) s.flashBulb.visible = false; }, 180);
          }
          if (this.onScreenFlash) this.onScreenFlash();
          this.sound?.playCameraShutter();
          this.sound?.speak('檢舉魔人拍照！違規行駛人行道！');
          if (this.onFineEvent) this.onFineEvent('【檢舉魔人】違規行駛人行道', 200);
        }
      } else if (dist > 25) {
        s.triggered = false;
      }
    });

    // 8. Update Temple Fair Parade (宮廟神轎隊伍)
    this.templeParades.forEach(p => {
      p.swayTimer += dt;
      // Palanquin sways back and forth across road
      p.mesh.position.x = p.baseX + Math.sin(p.swayTimer * 1.5) * 3.5;
      p.mesh.rotation.y = Math.sin(p.swayTimer * 2.0) * 0.25;

      const dist = p.mesh.position.distanceTo(playerPos);
      if (dist < 18 && Math.random() < 0.02) {
        this.sound?.playTempleGong();
      }

      if (dist < 2.0) {
        playerController.triggerCrash(14);
        this.sound?.speak('迎媽祖請注意路況！');
      }
    });

    // 9. Update Firecracker Roll (大地雷鞭炮陣)
    this.firecrackers.forEach(fc => {
      const dist = fc.pos.distanceTo(playerPos);
      if (dist < 3.2 && !fc.triggered) {
        fc.triggered = true;
        this.sound?.playFirecrackers();
        // Violently jolts the scooter cargo
        playerController.bumpJolt = 0.55;
        this.triggerCombo('炸邯鄲大吉大利！勇闖鞭炮陣！', 1500);
        this.sound?.speak('好彩頭！炸邯鄲大吉大利！');
      }
    });

    // 10. Update Road Potholes (道路補丁坑洞)
    this.potholes.forEach(pot => {
      const dist = pot.pos.distanceTo(playerPos);
      if (dist < pot.radius && playerSpeed > 15) {
        playerController.bumpJolt = Math.max(playerController.bumpJolt, 0.4);
      }
    });

    // 10.5. Update Taiwanese Cast-Iron Manholes (道路人孔蓋)
    this.manholeCovers.forEach(mh => {
      const dist = mh.pos.distanceTo(playerPos);
      if (dist < mh.radius) {
        if (!mh.onCover) {
          mh.onCover = true;
          this.sound?.playManholeClank?.();
          playerController.bumpJolt = Math.max(playerController.bumpJolt, 0.28);

          // If road is wet or player is leaning into hard turn:
          const isWet = playerController.isOnWetLine || (playerController.roadFrictionMultiplier && playerController.roadFrictionMultiplier < 0.85);
          if (isWet && Math.abs(playerController.rollAngle) > 0.18 && !mh.driftBonusAwarded) {
            mh.driftBonusAwarded = true;
            this.sound?.playBrakeSqueal?.();
            this.triggerCombo('【鐵蓋水上漂】人孔蓋滑移神走位！', 450);
          }
        }
      } else {
        mh.onCover = false;
      }
    });

    // 11. Update Scrap Cardboard Tricycle (資源回收紙箱三輪車)
    this.tricycles.forEach(t => {
      t.swayTimer += dt;
      // Precarious swaying stack
      if (t.stackPivot) {
        t.stackPivot.rotation.z = Math.sin(t.swayTimer * 2.8) * 0.12;
      }

      // Slowly pedal forward along road
      t.mesh.position.z += t.speed * dt;
      t.pos.copy(t.mesh.position);

      const dist = t.pos.distanceTo(playerPos);

      // Hit cardboard cart
      if (dist < 1.4) {
        playerController.triggerCrash(10);
        this.sound?.speak('撞到紙箱啦！');
      }

      // Close call dodge combo
      if (!t.dodgeAwarded && dist < 2.2 && playerSpeed > 25 && !playerController.isCrashed) {
        t.dodgeAwarded = true;
        this.triggerCombo('極限閃避阿伯回收車！', 700);
      }
    });

    // 12. Update Broadcast Sound Truck (土窯雞/炭烤地瓜廣播發財車)
    this.soundTrucks.forEach(st => {
      const dist = st.pos.distanceTo(playerPos);

      // Pulse sound wave rings
      if (st.soundWaveRing) {
        st.waveScale += dt * 3.5;
        if (st.waveScale > 4.5) st.waveScale = 1.0;
        st.soundWaveRing.scale.set(st.waveScale, st.waveScale, 1.0);
        st.soundWaveRing.material.opacity = Math.max(0, 1.0 - (st.waveScale / 4.5));
      }

      // Proximity broadcast
      if (dist < 24) {
        st.broadcastCooldown -= dt;
        if (st.broadcastCooldown <= 0) {
          st.broadcastCooldown = 15;
          const phrases = [
            '土窯雞～好吃的土窯雞又來了！',
            '香熱炭烤～金山紅心地瓜！',
            '土窯脆皮烤雞，新鮮出爐！'
          ];
          const chosen = phrases[Math.floor(Math.random() * phrases.length)];
          this.sound?.speak(chosen);
        }

        // If player honks at the truck, truck greets back!
        if ((playerController.keys['h'] || playerController.hornPressed) && !st.honkGreeted) {
          st.honkGreeted = true;
          this.triggerCombo('熱情土窯雞打招呼！', 400);
          this.sound?.speak('少年欸！辛苦了，外送騎慢一點！');
        }
      }
    });

    // 13. Update Roadwork Steel Jump Plates (道路施工鋼板跳台)
    this.steelPlates.forEach(sp => {
      // Blinking strobe lights
      sp.hazardTimer += dt;
      const isStrobeOn = Math.floor(sp.hazardTimer * 6) % 2 === 0;
      sp.strobes.forEach(s => { s.visible = isStrobeOn; });

      // Check if scooter is currently over the plate
      const onX = Math.abs(playerPos.x - sp.pos.x) < (sp.width / 2);
      const onZ = Math.abs(playerPos.z - sp.pos.z) < (sp.length / 2);

      if (onX && onZ) {
        if (!sp.onPlate) {
          sp.onPlate = true;
          // Just entered plate: metallic clang sound!
          this.sound?.playMetalClang();
          playerController.bumpJolt = Math.max(playerController.bumpJolt, 0.28);

          // If wheelie or high speed: Jump bonus!
          if ((playerController.isWheelie || playerSpeed > 45) && !sp.jumpAwarded) {
            sp.jumpAwarded = true;
            this.triggerCombo('飛越施工鋼板！', 600);
            this.sound?.speak('水喔！神之飛越鋼板！');
          }
        }
      } else {
        sp.onPlate = false;
      }
    });

    // 14. Update Trackside Photographers (北宜追焦大砲手)
    this.photographers.forEach(p => {
      p.cooldown -= dt;
      const dist = p.pos.distanceTo(playerPos);

      // Trigger flash when rider passes with high roll lean and speed
      if (dist < 15 && p.cooldown <= 0) {
        const isLeaning = Math.abs(playerController.rollAngle) > 0.24;
        if (isLeaning && playerSpeed > 32) {
          p.cooldown = 7.0;

          // Flash strobe light
          if (p.flashBulb) {
            p.flashBulb.visible = true;
            setTimeout(() => { if (p.flashBulb) p.flashBulb.visible = false; }, 180);
          }

          if (this.onScreenFlash) this.onScreenFlash();
          this.sound?.playCameraShutter();
          this.triggerCombo('北宜帥氣壓車追焦！', 800);
          this.sound?.speak('帥喔！極限壓車入鏡！');
        }
      }
    });

    // 16. Update Betel Nut Kiosks & Iced Water Nitro Pickups (雙子星檳榔攤 ＆ 結冰水)
    this.betelNutKiosks.forEach(k => {
      // Rotate Peacock neon rainbow rings
      if (k.peacockMesh) {
        k.peacockMesh.rotation.z += dt * 3.5;
      }

      // Bobbing and rotating 3D Nitro bottle
      if (k.bottleMesh && k.bottleActive) {
        k.bottleMesh.rotation.y += dt * 2.8;
        k.bottleMesh.position.y = 1.1 + Math.sin(Date.now() * 0.006) * 0.12;

        // Check player pickup
        const bottleWorld = new THREE.Vector3(2.4, 1.1, 0.5)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), k.mesh.rotation.y)
          .add(k.pos);

        const distToBottle = bottleWorld.distanceTo(playerPos);
        if (distToBottle < 2.0) {
          k.bottleActive = false;
          k.bottleMesh.visible = false;
          k.respawnTimer = 18.0;

          // Trigger Nitro Boost!
          playerController.triggerNitro(6.0);
          this.sound?.speak('喝了再上！結冰水神力加持！');
        }
      } else if (!k.bottleActive) {
        k.respawnTimer -= dt;
        if (k.respawnTimer <= 0) {
          k.bottleActive = true;
          if (k.bottleMesh) k.bottleMesh.visible = true;
        }
      }
    });

    // 17. Update Police DUI Checkpoints (警察路檢酒測臨檢站)
    this.policeCheckpoints.forEach(cp => {
      // Red & Blue Emergency Strobe alternation
      cp.strobeTimer += dt;
      const isRed = Math.floor(cp.strobeTimer * 10) % 2 === 0;
      if (cp.redStrobe) cp.redStrobe.visible = isRed;
      if (cp.blueStrobe) cp.blueStrobe.visible = !isRed;

      // Waving Traffic Baton Arm
      if (cp.batonArm) {
        cp.batonArm.rotation.z = Math.sin(Date.now() * 0.007) * 0.5;
      }

      const dist = cp.pos.distanceTo(playerPos);

      // Checkpoint Interaction
      if (dist < 18) {
        // Scenario A: Player stops for breathalyzer test (speed < 4 km/h)
        if (playerSpeed < 4 && dist < 5.0 && !cp.checked) {
          cp.checked = true;
          cp.passAwarded = true;
          this.sound?.speak('酒測值 0.00！警官：『外送員辛苦了，快去送吧！』');
          this.triggerCombo('酒測零檢出安全過關！', 800);
          if (this.onFineEvent) {
            this.onFineEvent('【警察嘉獎】酒測零檢出獎金', -200); // negative fine = extra tip reward!
          }
        }
        // Scenario B: Player speeds past (> 38 km/h)
        else if (playerSpeed > 38 && dist < 6.5 && !cp.checked && !cp.escapeAwarded) {
          cp.checked = true;
          if (playerController.isWheelie || Math.abs(playerController.rollAngle) > 0.2) {
            // Skillful evasion!
            cp.escapeAwarded = true;
            this.triggerCombo('華麗衝破警察臨檢！', 1500);
            this.sound?.speak('狂飆衝過去了！好大的膽子！');
          } else {
            // Ticketed for running roadblock!
            this.sound?.speak('停車受檢！拒絕臨檢開罰！');
            if (this.onFineEvent) {
              this.onFineEvent('【拒絕臨檢】逃逸拒檢罰單', 500);
            }
          }
        }
      } else if (dist > 35) {
        cp.checked = false;
        cp.passAwarded = false;
        cp.escapeAwarded = false;
      }
    });

    // 17.5. Update Uncle Ming's Tire Pressure Pitstop (大眾機車行阿明打氣站)
    if (this.airPitstopPos) {
      this.airPitstopCooldown = Math.max(0, this.airPitstopCooldown - dt);
      const distToAir = playerPos.distanceTo(this.airPitstopPos);
      if (distToAir < 2.6 && playerSpeed < 7.0 && this.airPitstopCooldown <= 0) {
        this.airPitstopCooldown = 20.0;
        playerController.tireBoostTimer = 20.0;
        playerController.isTireBoosted = true;
        this.sound?.playAirHose?.();
        this.sound?.speak?.('阿明老闆：『少年欸胎壓補飽囉！過彎抓地力提升！』');
        this.triggerCombo('【阿明機車行・胎壓飽滿！】抓地力+15%！', 400);
        playerController.triggerHaptic?.([30, 25, 45]);
      }
    }

    // 17.6. Update Roadside Sobriety Police Checkpoint (路口酒測臨檢站光效與檢驗)
    const sobriety = this.scene.getObjectByName('sobrietyCheckpoint');
    if (sobriety && sobriety.userData) {
      sobriety.userData.timer = (sobriety.userData.timer || 0) + dt;
      const isRed = Math.floor(sobriety.userData.timer * 8) % 2 === 0;
      if (sobriety.userData.redLed) sobriety.userData.redLed.visible = isRed;
      if (sobriety.userData.blueLed) sobriety.userData.blueLed.visible = !isRed;
      if (sobriety.userData.beaconLight) {
        sobriety.userData.beaconLight.color.setHex(isRed ? 0xff1744 : 0x00e5ff);
      }
    }

    if (this.sobrietyStationPos) {
      const distToSobriety = playerPos.distanceTo(this.sobrietyStationPos);
      if (distToSobriety < 6.5) {
        if (playerSpeed <= 22 && !this.sobrietyStationChecked) {
          this.sobrietyStationChecked = true;
          this.sound?.speak?.('酒測值 0.00！警官：『外送員辛苦了，注意安全！』');
          this.triggerCombo('【酒測零檢出・模範騎士】安全過關！', 600);
          if (this.onFineEvent) {
            this.onFineEvent('【警察嘉獎】酒測零檢出獎勵金', -250);
          }
        } else if (playerSpeed > 36 && !this.sobrietyStationChecked) {
          this.sobrietyStationChecked = true;
          this.sound?.speak?.('嗶嗶！停車受檢！竟然強行衝卡！');
          this.triggerCombo('【強行衝破酒測臨檢站】！', 900);
          this.wantedHeat = Math.min(3, this.wantedHeat + 2);
          if (this.onWantedChange) this.onWantedChange(this.wantedHeat);
        }
      } else if (distToSobriety > 35) {
        this.sobrietyStationChecked = false;
      }
    }

    // 18. Update Commuter Scooter Swarm (台北橋機車瀑布通勤大潮)
    this.commuterScooters.forEach(cs => {
      cs.swayTimer += dt;
      // Commuters ride steadily forward
      cs.pos.z += cs.speed * dt;
      cs.pos.x = cs.laneX + Math.sin(cs.swayTimer * 1.5) * 0.4;
      cs.mesh.position.copy(cs.pos);

      // Wrap around world
      if (cs.pos.z > 175) {
        cs.pos.z = -175;
      }

      const dist = cs.pos.distanceTo(playerPos);

      // Crash with commuter
      if (dist < 1.3) {
        playerController.triggerCrash(8);
        this.sound?.speak('逼三小啦！');
      }

      // Close weave combo (台北橋車陣鑽車縫)
      if (!cs.dodgeAwarded && dist < 2.0 && playerSpeed > 28 && !playerController.isCrashed) {
        cs.dodgeAwarded = true;
        this.triggerCombo('台北橋車陣鑽車縫！', 600);
        setTimeout(() => { cs.dodgeAwarded = false; }, 4000);
      }
    });

    // 19. Update Street Tyrant Space Hogs (路霸佔位器碰撞掃除)
    this.streetHogs.forEach(hog => {
      if (hog.cleared) return;
      const dist = hog.pos.distanceTo(playerPos);
      if (dist < 1.25) {
        hog.cleared = true;
        // Tip over the obstacle with funny impulse
        hog.mesh.rotation.z = (Math.random() > 0.5 ? 1 : -1) * 1.2;
        hog.mesh.rotation.x = 0.5;
        hog.mesh.position.y = 0.1;
        hog.mesh.position.x += (hog.mesh.position.x > playerPos.x ? 0.6 : -0.6);

        this.sound?.playCrash(4);
        this.sound?.speak('路霸退散！');
        this.triggerCombo('掃除違規路霸！', 400);

        // Small bump to player scooter without completely crashing
        playerController.bumpJolt = 0.45;
      }
    });

    // 20. Update Yellow Municipal Garbage Trucks (清潔隊黃色垃圾車)
    this.garbageTrucks.forEach(gt => {
      // Rotating Amber Beacons
      gt.beaconTimer += dt * 8;
      const bOn = Math.floor(gt.beaconTimer) % 2 === 0;
      if (gt.beaconL) gt.beaconL.visible = bOn;
      if (gt.beaconR) gt.beaconR.visible = !bOn;

      // Slow crawl forward
      gt.pos.z += gt.speed * dt;
      if (gt.pos.z > 175) gt.pos.z = -175;
      gt.mesh.position.copy(gt.pos);

      const dist = gt.pos.distanceTo(playerPos);

      // Play Maiden's Prayer melody tone cues when close
      if (dist < 22) {
        gt.chimeTimer -= dt;
        if (gt.chimeTimer <= 0) {
          gt.chimeTimer = 8.0;
          this.sound?.playTone(659.25, 0.22, 'triangle', 0.15); // E5
          setTimeout(() => this.sound?.playTone(587.33, 0.22, 'triangle', 0.15), 250); // D5
          setTimeout(() => this.sound?.playTone(523.25, 0.32, 'triangle', 0.15), 500); // C5
        }
      }

      // Crash with garbage truck
      if (dist < 2.5) {
        playerController.triggerCrash(10);
        this.sound?.speak('撞到垃圾車啦！');
      }

      // Close overtake combo
      if (!gt.dodgeAwarded && dist < 3.8 && playerSpeed > 30 && !playerController.isCrashed) {
        gt.dodgeAwarded = true;
        this.triggerCombo('超車清潔隊垃圾車！', 750);
        setTimeout(() => { gt.dodgeAwarded = false; }, 6000);
      }
    });

    // 21. Update Rival Delivery Monkeys (雙開搶單外送猴子)
    this.rivalMonkeys.forEach(rm => {
      rm.swayTimer += dt * 2.5;
      // Fast weaving forward
      rm.pos.z += rm.speed * dt;
      rm.pos.x = rm.laneX + Math.sin(rm.swayTimer) * 2.2;
      rm.mesh.position.copy(rm.pos);
      rm.mesh.rotation.y = Math.sin(rm.swayTimer) * 0.18;

      if (rm.pos.z > 175) rm.pos.z = -175;

      const dist = rm.pos.distanceTo(playerPos);

      // Shouting & Order Alert
      if (dist < 16) {
        rm.yellCooldown -= dt;
        if (rm.yellCooldown <= 0) {
          rm.yellCooldown = 12.0;
          this.sound?.playTone(880, 0.12, 'sawtooth', 0.2); // notification ding
          setTimeout(() => this.sound?.playTone(1174.66, 0.2, 'sine', 0.2), 120);
          const yells = [
            '叮咚！外送新訂單！',
            '這單是我的！閃開啦！',
            '雙開搶單才是財富密碼！',
            '不要擋我外送搶單！'
          ];
          const chosen = yells[Math.floor(Math.random() * yells.length)];
          this.sound?.speak(chosen);
        }
      }

      // Crash with monkey
      if (dist < 1.4) {
        playerController.triggerCrash(9);
        this.sound?.speak('互相傷害啦！');
      }

      // Overtake rival delivery monkey
      if (!rm.dodgeAwarded && dist < 2.8 && playerSpeed > 38 && !playerController.isCrashed) {
        rm.dodgeAwarded = true;
        this.triggerCombo('猴子敬禮！外送車神超車！', 800);
        this.sound?.speak('猴子甘拜下風！');
        setTimeout(() => { rm.dodgeAwarded = false; }, 8000);
      }
    });

    // 22. Update Night Market Food Stalls (夜市流動攤販穿梭)
    this.marketStalls.forEach(st => {
      const dist = st.pos.distanceTo(playerPos);
      if (!st.dodgeAwarded && dist < 2.5 && playerSpeed > 24 && !playerController.isCrashed) {
        st.dodgeAwarded = true;
        const stallName = st.type === 0 ? '炭烤香腸攤' : '黑糖地瓜球攤';
        this.triggerCombo(`穿梭夜市${stallName}！不用排隊！`, 350);
        setTimeout(() => { st.dodgeAwarded = false; }, 6000);
      }
    });

    // 23. Update Pink Supercar Mazu Procession (大甲/白沙屯媽祖「粉紅超跑」神轎隊伍)
    this.pinkSupercars.forEach(mazu => {
      mazu.swayTimer += dt * 5.0;
      mazu.pos.z += mazu.speed * dt;
      mazu.pos.x = mazu.baseX + Math.sin(mazu.swayTimer) * 1.8;
      if (mazu.pos.z > 175) mazu.pos.z = -175;
      mazu.mesh.position.copy(mazu.pos);
      mazu.mesh.rotation.y = Math.sin(mazu.swayTimer) * 0.22;
      if (mazu.halo) mazu.halo.rotation.z += dt * 3.5;

      const dist = mazu.pos.distanceTo(playerPos);
      if (dist < 26) {
        mazu.gongTimer -= dt;
        if (mazu.gongTimer <= 0) {
          mazu.gongTimer = 3.6;
          this.sound?.playGongDrum();
        }
      }

      // Player threads through or passes under palanquin (鑽轎底神明加持)
      if (!mazu.dodgeAwarded && dist < 2.8 && playerSpeed > 10 && !playerController.isCrashed) {
        mazu.dodgeAwarded = true;
        this.triggerCombo('【粉紅超跑神力加持】媽祖保庇大吉！', 1500);
        this.sound?.speak('白沙屯媽祖保庇！鑽轎底大吉大利！');
        if (this.onBobaHeal) this.onBobaHeal();
        setTimeout(() => { mazu.dodgeAwarded = false; }, 10000);
      }
    });

    // 24. Two-Stage Hook Turn Waiting Boxes & Smart Enforcement (機慢車兩段式左轉判定)
    if (hookTurnBoxes && hookTurnBoxes.length > 0) {
      hookTurnBoxes.forEach(box => {
        const dx = playerPos.x - box.x;
        const dz = playerPos.z - box.z;
        const inBox = (dx * dx + dz * dz) < (box.radius * box.radius);

        if (inBox) {
          if (playerSpeed < 6.5) {
            box.dwellTimer = (box.dwellTimer || 0) + dt;
            if (box.dwellTimer >= 0.35 && !box.completed) {
              box.completed = true;
              this.triggerCombo('【乖寶寶兩段式待轉】守法模範生！', 600);
              this.sound?.playTone(880, 0.2, 'triangle', 0.25);
              setTimeout(() => this.sound?.playTone(1174.66, 0.35, 'triangle', 0.3), 150);
              this.sound?.speak('兩段式待轉！守法第一名！');
              setTimeout(() => { box.completed = false; box.dwellTimer = 0; }, 15000);
            }
          } else {
            box.dwellTimer = 0;
          }
        } else {
          box.dwellTimer = 0;
        }
      });
    }

    // Smart Camera Left Turn Violation Detection
    this.intersectionCheckers.forEach(inter => {
      inter.timer = Math.max(0, inter.timer - dt);
      const inInterZ = Math.abs(playerPos.z - inter.z) < 7.5;
      const inCenterLane = Math.abs(playerPos.x) < 4.2;

      if (inInterZ && inCenterLane && playerSpeed > 22 && !playerController.isCrashed && inter.timer <= 0) {
        // Cutting hard left without using hook turn box
        const turningLeft = playerController.steerInput > 0.6;
        if (turningLeft && countyId !== 'KAOHSIUNG') {
          const hasBoxCompleted = hookTurnBoxes?.some(b => b.interZ === inter.z && b.completed);
          if (!hasBoxCompleted) {
            inter.timer = 8.0;
            if (playerController.isPlateHidden) {
              this.triggerCombo('【極限鬼切免待轉・翹孤輪遮牌】！', 1200);
              this.sound?.speak('哇哈哈！照不到大牌啦！');
            } else {
              if (this.onScreenFlash) this.onScreenFlash();
              if (this.onFineEvent) this.onFineEvent('【科技執法：未依兩段式左轉】 - 扣除小費 $300！', 300);
              this.addWantedHeat(1);
              this.sound?.playCrash();
              this.sound?.speak('逼逼！未兩段式左轉！開單！');
            }
          }
        }
      }
    });

    // 26. Update Giant Road Puddles (暴雨深水坑 - 乘風破浪水花秀)
    this.puddles.forEach(p => {
      const dx = playerPos.x - p.pos.x;
      const dz = playerPos.z - p.pos.z;
      const dist2D = Math.sqrt(dx * dx + dz * dz);

      if (dist2D < p.radius) {
        if (playerSpeed > 24 && !p.splashed) {
          p.splashed = true;
          this.sound?.playWaterSplash();
          if (this.onPuddleSplash) this.onPuddleSplash();
          this.triggerCombo('【暴雨乘風破浪水花秀！】', 600);
          playerController.bumpJolt = Math.max(playerController.bumpJolt, 0.35);
        }
      } else if (dist2D > 6.0) {
        p.splashed = false;
      }
    });

    // 27. Update Crosswalk Pedestrians (行人地獄斑馬線行人系統)
    this.pedestrians.forEach(p => {
      // 1. Leg and Arm Walking Animation
      const ud = p.mesh.userData;
      if (ud && ud.leftLeg && ud.rightLeg) {
        ud.walkPhase += dt * p.speed * 4.2;
        ud.leftLeg.rotation.x = Math.sin(ud.walkPhase) * 0.42;
        ud.rightLeg.rotation.x = -Math.sin(ud.walkPhase) * 0.42;
        if (p.waveTimer <= 0 && ud.leftArm && ud.rightArm) {
          ud.leftArm.rotation.x = -Math.sin(ud.walkPhase) * 0.32;
          ud.rightArm.rotation.x = Math.sin(ud.walkPhase) * 0.32;
        }
      }

      // Waving animation when yielded to
      if (p.waveTimer > 0) {
        p.waveTimer -= dt;
        if (ud && ud.rightArm) {
          ud.rightArm.rotation.x = 0;
          ud.rightArm.rotation.z = 1.1 + Math.sin(Date.now() * 0.015) * 0.25;
        }
      }

      // 2. Crosswalk walking movement across road
      p.pos.x += p.dir * p.speed * dt;
      if (p.pos.x > 5.2) {
        p.dir = -1;
        p.mesh.rotation.y = -Math.PI / 2;
      } else if (p.pos.x < -5.2) {
        p.dir = 1;
        p.mesh.rotation.y = Math.PI / 2;
      }

      const dist = p.pos.distanceTo(playerPos);

      // Hit pedestrian collision
      if (dist < 1.15) {
        playerController.triggerCrash(10);
        this.sound?.playCrash();
        this.sound?.speak('哎唷喂呀！撞到路人了！');
        if (this.onFineEvent) {
          this.onFineEvent('【重大交通違規：衝撞斑馬線行人！】', 2000);
        }
        this.addWantedHeat(2);
      }

      // Failing to yield (科技執法：未停讓行人)
      if (!p.fineAwarded && dist < 3.0 && playerSpeed > 18 && !playerController.isCrashed) {
        p.fineAwarded = true;
        this.sound?.playPoliceWhistle();
        if (this.onScreenFlash) this.onScreenFlash();
        if (this.onFineEvent) {
          this.onFineEvent('【科技執法：未停讓行人穿越道行人】', 1200);
        }
        this.sound?.speak('逼逼！未禮讓行人！開單一千二！');
        this.addWantedHeat(1);
        setTimeout(() => { p.fineAwarded = false; }, 8000);
      }

      // Yielding to pedestrian bonus (禮讓行人楷模)
      if (!p.yieldAwarded && dist < 4.2 && dist > 1.35 && playerSpeed < 4.5 && !playerController.isCrashed) {
        p.yieldAwarded = true;
        p.waveTimer = 3.5;
        this.triggerCombo('【禮讓行人楷模】行人親切揮手致意！', 800);
        this.sound?.playCelebrationChime();
        this.sound?.speak('謝謝帥哥！禮讓行人守法第一名！');
        setTimeout(() => { p.yieldAwarded = false; }, 14000);
      }
    });

    // 28. Update High-Speed Police Pursuit Cruiser (高速巡邏警車追捕)
    if (this.pursuitActive && this.pursuitCruiser) {
      // Strobe flashing
      const ud = this.pursuitCruiser.userData;
      if (ud) {
        ud.strobeTimer = (ud.strobeTimer || 0) + dt;
        const strobeState = Math.floor(ud.strobeTimer * 12) % 2 === 0;
        if (ud.lightbarRed) ud.lightbarRed.visible = strobeState;
        if (ud.lightbarBlue) ud.lightbarBlue.visible = !strobeState;
      }

      // Steering towards player X
      this.pursuitPos.x = THREE.MathUtils.lerp(this.pursuitPos.x, THREE.MathUtils.clamp(playerPos.x, -5.5, 5.5), dt * 3.5);

      // Accelerate towards player Z
      const targetSpeed = Math.min(27, Math.abs(playerController.speed) + 4.0);
      this.pursuitSpeed = THREE.MathUtils.lerp(this.pursuitSpeed, targetSpeed, dt * 2.0);
      const toPlayer = playerPos.clone().sub(this.pursuitPos);
      const dist = toPlayer.length();
      const dirZ = Math.sign(toPlayer.z || 1);
      this.pursuitPos.z += dirZ * this.pursuitSpeed * dt;

      this.pursuitCruiser.position.copy(this.pursuitPos);
      this.pursuitCruiser.rotation.y = dirZ > 0 ? 0 : Math.PI;

      // Interception / Ramming
      if (dist < 2.5) {
        playerController.triggerCrash(15);
        this.sound?.speak('下車受檢！拒檢現行犯逮捕！');
        if (this.onFineEvent) {
          this.onFineEvent('【拒檢衝撞警察局巡邏車】', 1500);
        }
        this.wantedHeat = 0;
        this.stopPursuit();
      }

      // Losing police pursuit (Evading through sidewalks/gutters, high speed escape, or wheelie)
      const onSidewalkOrGutter = Math.abs(playerPos.x) > 5.8;
      const isEvading = dist > 44 || onSidewalkOrGutter || playerController.isPlateHidden;
      if (isEvading) {
        this.pursuitLoseSightTimer += dt;
        if (this.pursuitLoseSightTimer > 4.5) {
          this.triggerCombo('【神級甩尾擺脫警方圍捕！】條子吃灰！', 1500);
          this.sound?.speak('甩掉條子了！技術真好！');
          this.wantedHeat = 0;
          this.stopPursuit();
        }
      } else {
        this.pursuitLoseSightTimer = Math.max(0, this.pursuitLoseSightTimer - dt * 0.5);
      }
    }

    // 29. Update Tainan Roundabout Visibility & Mobius Maze Glitch
    const isTainan = countyId === 'TAINAN';
    if (this.tainanRoundabout) {
      this.tainanRoundabout.visible = isTainan;
    }

    if (isTainan) {
      const distToRoundabout = Math.sqrt(playerPos.x * playerPos.x + playerPos.z * playerPos.z);
      if (distToRoundabout < 9.5) {
        this.roundaboutTimer += dt;
        // Cutting out of roundabout
        const cuttingOut = Math.abs(playerPos.x) > 6.0 || Math.abs(playerPos.z) > 7.0;
        if (!this.roundaboutAwarded && this.roundaboutTimer > 2.5 && this.roundaboutTimer < 10.0 && playerSpeed > 22 && cuttingOut) {
          this.roundaboutAwarded = true;
          this.triggerCombo('【圓環車神突破八卦陣！】順利切出！', 1000);
          this.sound?.speak('厲害！東門圓環完全沒迷路！');
          setTimeout(() => { this.roundaboutAwarded = false; this.roundaboutTimer = 0; }, 14000);
        } else if (this.roundaboutTimer >= 10.0 && !this.roundaboutAwarded) {
          this.roundaboutAwarded = true;
          this.sound?.speak('慘了！陷入台南東門圓環多重宇宙！轉不出來啦！');
          if (this.onFineEvent) {
            this.onFineEvent('【台南圓環莫比烏斯迷路】 - 迷航耽擱！', 300);
          }
          setTimeout(() => { this.roundaboutAwarded = false; this.roundaboutTimer = 0; }, 14000);
        }
      } else {
        if (this.roundaboutTimer > 0 && !this.roundaboutAwarded) {
          this.roundaboutTimer = 0;
        }
      }
    }

    // 30. Update 99s Countdown Traffic Signals (紅綠燈倒數與起步偷跑彈射)
    this.trafficSignals.forEach(sig => {
      sig.timer -= dt;
      if (sig.timer <= 0) {
        if (sig.state === 'RED') {
          sig.state = 'GREEN';
          sig.timer = 22.0;
          sig.jumpStartAwarded = false;
          sig.redLightFined = false;
        } else if (sig.state === 'GREEN') {
          sig.state = 'YELLOW';
          sig.timer = 3.5;
        } else {
          sig.state = 'RED';
          sig.timer = 35.0;
          sig.jumpStartAwarded = false;
          sig.redLightFined = false;
        }
      }

      if (sig.mesh.userData && sig.mesh.userData.updateSignal) {
        sig.mesh.userData.updateSignal(sig.timer, sig.state);
      }

      // Check player crossing stopline at intersection
      const inStopZone = Math.abs(playerPos.z - sig.interZ) < 5.5 && Math.abs(playerPos.x) < 5.0;
      if (inStopZone && !playerController.isCrashed) {
        // Jump start bonus in last 3s of Red Light (偷跑彈射起步)
        if (sig.state === 'RED' && sig.timer <= 3.0 && sig.timer > 0.2) {
          if (!sig.jumpStartAwarded && playerSpeed > 14 && playerController.throttleInput > 0) {
            sig.jumpStartAwarded = true;
            this.triggerCombo('【紅綠燈起步偷跑彈射！】起步神速！', 600);
            this.sound?.playCelebrationChime();
            this.sound?.speak('綠燈起步偷跑！這很台灣！');
          }
        }
        // Red light violation running straight through while Red has > 5s left
        else if (sig.state === 'RED' && sig.timer > 5.0 && !sig.redLightFined) {
          if (playerSpeed > 24) {
            sig.redLightFined = true;
            if (playerController.isPlateHidden) {
              this.triggerCombo('【極限狂飆闖紅燈・翹孤輪遮牌】！', 1500);
              this.sound?.speak('哇哈哈！照不到大牌啦！');
            } else {
              this.sound?.playCameraShutter();
              this.sound?.playPoliceWhistle();
              if (this.onScreenFlash) this.onScreenFlash();
              if (this.onFineEvent) {
                this.onFineEvent('【科技執法：闖紅燈重大違規！】', 1800);
              }
              this.sound?.speak('逼逼！紅燈硬闖！開單一千八！');
              this.addWantedHeat(2);
            }
          }
        }
      }
    });

    // 31. Update Roadside Banquet (流水席紅圓桌與棚架鑽縫)
    this.banquets.forEach(banquet => {
      const bPos = banquet.pos;
      const dist = bPos.distanceTo(playerPos);

      // Narrow gap passing between banquet tent edge and center lane
      if (!banquet.dodgeAwarded && !banquet.crashAwarded) {
        const inGapZ = Math.abs(playerPos.z - bPos.z) < 3.2;
        const inGapX = playerPos.x > 0.4 && playerPos.x < 1.6;
        if (inGapZ && inGapX && playerSpeed > 22) {
          banquet.dodgeAwarded = true;
          this.triggerCombo('【鑽流水席棚架車神！】極限穿梭！', 1200);
          this.sound?.speak('水啦！外送員身手矯健！');
          setTimeout(() => { banquet.dodgeAwarded = false; }, 12000);
        }
      }

      // Crash into banquet tables
      if (!banquet.crashAwarded && dist < 2.5 && !playerController.isCrashed) {
        banquet.crashAwarded = true;
        this.sound?.playDishesClatter();
        this.sound?.speak('我的龍蝦冷盤跟紅蟳米糕啊！');
        if (banquet.mesh.userData && banquet.mesh.userData.scatterProps) {
          banquet.mesh.userData.scatterProps();
        }
        playerController.triggerCrash(14);
        if (this.onFineEvent) {
          this.onFineEvent('【撞翻路邊辦桌流水席】賠償總鋪師 $400！', 400);
        }
        setTimeout(() => { banquet.crashAwarded = false; }, 15000);
      }
    });

    // 32. Update Taiwan Railway Level Crossing & Express Train (台鐵平交道自強號循環)
    if (this.railwayCrossing && this.expressTrain) {
      this.railwayTimer -= dt;

      if (this.railwayState === 'IDLE') {
        this.railwayCrossing.userData.setBarrierProgress(1.0); // open upright
        this.railwayCrossing.userData.updateFlashers(false, 0);
        this.expressTrain.visible = false;

        if (this.railwayTimer <= 0) {
          this.railwayState = 'LOWERING';
          this.railwayTimer = 4.5;
          this.railwayBellTimer = 0;
          this.railwayFlasherPhase = 0;
          this.railwayAwarded = false;
          this.railwayStopYieldAwarded = false;
          this.sound?.speak('叮咚！平交道警報響起！注意來車！');
        }
      } else if (this.railwayState === 'LOWERING') {
        const prog = Math.max(0, this.railwayTimer / 4.5);
        this.railwayCrossing.userData.setBarrierProgress(prog);

        // Flashing lights & bell sound
        this.railwayBellTimer += dt;
        if (this.railwayBellTimer > 0.45) {
          this.railwayBellTimer = 0;
          this.railwayFlasherPhase++;
          this.sound?.playLevelCrossingBell();
        }
        this.railwayCrossing.userData.updateFlashers(true, this.railwayFlasherPhase);

        // Check if player obediently stopped before the crossing
        const nearCrossingZ = Math.abs(playerPos.z - (-45)) < 5.0 && Math.abs(playerPos.z - (-45)) > 2.0;
        if (nearCrossingZ && playerSpeed < 4 && !this.railwayStopYieldAwarded) {
          this.railwayStopYieldAwarded = true;
          this.triggerCombo('【平交道停看聽楷模】安全第一！', 600);
        }

        if (this.railwayTimer <= 0) {
          this.railwayState = 'CROSSING';
          this.railwayTimer = 4.2;
          this.expressTrain.visible = true;
          this.trainX = -85.0;
          this.expressTrain.position.set(this.trainX, 0, -45);
          this.sound?.playTrainHorn();
        }
      } else if (this.railwayState === 'CROSSING') {
        this.railwayCrossing.userData.setBarrierProgress(0.0); // fully lowered horizontal

        // Keep flashers active
        this.railwayBellTimer += dt;
        if (this.railwayBellTimer > 0.45) {
          this.railwayBellTimer = 0;
          this.railwayFlasherPhase++;
        }
        this.railwayCrossing.userData.updateFlashers(true, this.railwayFlasherPhase);

        // Move train across tracks at ~115 km/h
        this.trainX += this.trainSpeed * dt;
        this.expressTrain.position.x = this.trainX;

        // Collision check: player on tracks while train is passing
        const inTrackZ = Math.abs(playerPos.z - (-45)) < 1.8;
        const trainBoxCollision = Math.abs(playerPos.x - this.trainX) < 13.0;

        if (inTrackZ && trainBoxCollision && !playerController.isCrashed) {
          playerController.triggerCrash(26);
          this.sound?.playTrainHorn();
          this.sound?.speak('慘遭自強號擦撞！超級大暴走！');
          if (this.onFineEvent) {
            this.onFineEvent('【強闖平交道遭火車衝撞】送醫重罰 $2000！', 2000);
          }
        }

        // Daring Close Call: player raced across right ahead of the train
        if (!this.railwayAwarded && inTrackZ && playerSpeed > 38 && (playerPos.x - this.trainX) > 13.0 && (playerPos.x - this.trainX) < 22.0) {
          this.railwayAwarded = true;
          this.triggerCombo('【平交道極限生死時速！】神速擦身！', 2000);
          this.sound?.speak('太狂了！搶在火車頭前十公分通過！');
        }

        if (this.railwayTimer <= 0 || this.trainX > 85.0) {
          this.railwayState = 'RAISING';
          this.railwayTimer = 3.0;
          this.expressTrain.visible = false;
        }
      } else if (this.railwayState === 'RAISING') {
        const prog = 1.0 - Math.max(0, this.railwayTimer / 3.0);
        this.railwayCrossing.userData.setBarrierProgress(prog);
        this.railwayCrossing.userData.updateFlashers(false, 0);

        if (this.railwayTimer <= 0) {
          this.railwayState = 'IDLE';
          this.railwayTimer = 35.0;
        }
      }
    }

    // Wanted Heat Passive Decay (每 20 秒自然降低一星)
    if (this.wantedHeat > 0 && !this.pursuitActive) {
      this.wantedDecayTimer += dt;
      if (this.wantedDecayTimer > 20) {
        this.wantedDecayTimer = 0;
        this.wantedHeat = Math.max(0, this.wantedHeat - 1);
        if (this.onWantedChange) this.onWantedChange(this.wantedHeat);
      }
    }
  }

  addWantedHeat(amount) {
    this.wantedHeat = Math.min(3, this.wantedHeat + amount);
    this.wantedDecayTimer = 0;
    if (this.onWantedChange) this.onWantedChange(this.wantedHeat);
    if (this.wantedHeat >= 2 && !this.pursuitActive && this.pursuitCruiser) {
      this.startPursuit();
    }
  }

  startPursuit() {
    this.pursuitActive = true;
    if (this.pursuitCruiser) {
      this.pursuitCruiser.visible = true;
      // Position behind player
      this.pursuitPos.set(0, 0, -170);
      this.pursuitCruiser.position.copy(this.pursuitPos);
    }
    this.pursuitSpeed = 16;
    this.pursuitLoseSightTimer = 0;
    this.sound?.playPoliceSiren();
    this.sound?.speak('警告！前方機車立即靠邊停車受檢！');
  }

  stopPursuit() {
    this.pursuitActive = false;
    if (this.pursuitCruiser) {
      this.pursuitCruiser.visible = false;
    }
    this.sound?.stopPoliceSiren();
    if (this.onWantedChange) this.onWantedChange(this.wantedHeat);
  }

  triggerCombo(title, points) {
    if (this.onComboEvent) {
      this.onComboEvent(title, points);
      this.sound?.playComboSound();
    }
  }
}
