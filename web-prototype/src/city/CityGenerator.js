// CityGenerator.js - Procedural Taiwanese City with Shophouses, Alleys & Clutter
import * as THREE from 'three';
import { WORLD_BOUNDS, ROADS, LANDMARKS, expandWorld } from './ExplorationWorld.js';
import { enrichStreet, batchStaticStreet } from './StreetLife.js';

export class CityGenerator {
  constructor(scene, modelFactory) {
    this.scene = scene;
    this.factory = modelFactory;

    this.cityBounds = { ...WORLD_BOUNDS };
    this.gutterPositions = [];
    this.streetSegments = [];
    this.deliveryDestinations = [];
    this.colliders = [];
    this.hookTurnBoxes = [];
    this.bobaShopPos = new THREE.Vector3(0, 0, -140);
    this.roadPatches = [];
    this.speedBumps = [];
    this.airCompressorPos = new THREE.Vector3(-6.2, 0, 148);
    this.sobrietyCheckpointPos = new THREE.Vector3(2.5, 0, 45);
  }

  generateCity() {
    const existing = new Set(this.scene.children);
    this.createGroundAndRoads();
    this.createRoadPatchesAndBumps();
    this.createBuildings();
    this.createStreetFacilities();
    this.createSidewalkClutter();
    enrichStreet(this.scene, this.factory, this.colliders);
    expandWorld(this.scene, this.factory, this.colliders);
    batchStaticStreet(this.scene, this.scene.children.filter(o => !existing.has(o)));
    this.createDeliveryPoints();

    return {
      bounds: this.cityBounds,
      roads: ROADS,
      landmarks: LANDMARKS,
      gutters: this.gutterPositions,
      segments: this.streetSegments,
      bobaShop: this.bobaShopPos,
      destinations: this.deliveryDestinations,
      colliders: this.colliders,
      hookTurnBoxes: this.hookTurnBoxes,
      roadPatches: this.roadPatches,
      speedBumps: this.speedBumps,
      airCompressor: this.airCompressorPos,
      sobrietyCheckpoint: this.sobrietyCheckpointPos
    };
  }

  createGroundAndRoads() {
    // 1. Asphalt Ground
    const groundGeo = new THREE.PlaneGeometry(160, 420);
    groundGeo.rotateX(-Math.PI / 2);
    const ground = new THREE.Mesh(groundGeo, this.factory.materials.asphalt);
    ground.receiveShadow = true;
    this.scene.add(ground);

    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const redMat = new THREE.MeshBasicMaterial({ color: 0xd50000 });

    // 2. Main Avenue Block Segments (4 block segments avoiding 3 cross-street intersections)
    const mainBlockSegs = [
      { len: 74, centerZ: -135 },
      { len: 74, centerZ: -45 },
      { len: 74, centerZ: 45 },
      { len: 74, centerZ: 135 }
    ];

    mainBlockSegs.forEach(seg => {
      // Central Double Yellow Lines along Z axis
      [-0.15, 0.15].forEach(x => {
        const lineGeo = new THREE.PlaneGeometry(0.12, seg.len);
        lineGeo.rotateX(-Math.PI / 2);
        const line = new THREE.Mesh(lineGeo, yellowMat);
        line.position.set(x, 0.02, seg.centerZ);
        this.scene.add(line);
      });

      // White Lane Boundary Lines
      [-5.5, 5.5].forEach(x => {
        const lineGeo = new THREE.PlaneGeometry(0.15, seg.len);
        lineGeo.rotateX(-Math.PI / 2);
        const line = new THREE.Mesh(lineGeo, whiteMat);
        line.position.set(x, 0.02, seg.centerZ);
        this.scene.add(line);
      });

      // Red Curb Lines
      [-6.8, 6.8].forEach(x => {
        const redLineGeo = new THREE.PlaneGeometry(0.15, seg.len);
        redLineGeo.rotateX(-Math.PI / 2);
        const redLine = new THREE.Mesh(redLineGeo, redMat);
        redLine.position.set(x, 0.02, seg.centerZ);
        this.scene.add(redLine);
      });

      // Sidewalk Pavements (騎樓人行道 - width 2.8m, along X = -8.3 and +8.3)
      [-8.3, 8.3].forEach(x => {
        const swGeo = new THREE.BoxGeometry(2.8, 0.25, seg.len);
        const sw = new THREE.Mesh(swGeo, this.factory.materials.sidewalk);
        sw.position.set(x, 0.12, seg.centerZ);
        sw.receiveShadow = true;
        this.scene.add(sw);
      });
    });

    // 3. Road Metal Gutter Covers (水溝蓋) along Main Avenue & Side Alleys
    for (let z = -170; z <= 170; z += 18) {
      if (Math.abs(z - (-90)) < 12 || Math.abs(z - 0) < 12 || Math.abs(z - 90) < 12) continue;
      // Main Avenue Gutters
      [-6.1, 6.1].forEach(x => {
        const gutter = this.factory.createGutterCover(12);
        gutter.position.set(x, 0.01, z);
        this.scene.add(gutter);
        this.gutterPositions.push({ x, z, length: 12 });
      });

      // West Alley Gutter (老街防火巷水溝蓋)
      const westGutter = this.factory.createGutterCover(12);
      westGutter.position.set(-34.8, 0.01, z);
      this.scene.add(westGutter);
      this.gutterPositions.push({ x: -34.8, z, length: 12 });

      // East Alley Gutter (夜市美食後巷水溝蓋)
      const eastGutter = this.factory.createGutterCover(12);
      eastGutter.position.set(34.8, 0.01, z);
      this.scene.add(eastGutter);
      this.gutterPositions.push({ x: 34.8, z, length: 12 });
    }

    // 4. Three Cross Streets (東西向橫向大道 / 北門路、中正路、逢甲路)
    const intersectionsZ = [-90, 0, 90];
    intersectionsZ.forEach(z => {
      // Cross Street Double Yellow Lines along Z = z
      [-0.15, 0.15].forEach(dz => {
        // West cross branch (X: -34 to -6.5, len: 27.5, centerX: -20.25)
        const westYGeo = new THREE.PlaneGeometry(27.5, 0.12);
        westYGeo.rotateX(-Math.PI / 2);
        const westY = new THREE.Mesh(westYGeo, yellowMat);
        westY.position.set(-20.25, 0.02, z + dz);
        this.scene.add(westY);

        // East cross branch (X: 6.5 to 34, len: 27.5, centerX: 20.25)
        const eastYGeo = new THREE.PlaneGeometry(27.5, 0.12);
        eastYGeo.rotateX(-Math.PI / 2);
        const eastY = new THREE.Mesh(eastYGeo, yellowMat);
        eastY.position.set(20.25, 0.02, z + dz);
        this.scene.add(eastY);
      });

      // Cross Street White Border Lines
      [-4.6, 4.6].forEach(dz => {
        [-20.25, 20.25].forEach(cx => {
          const wLineGeo = new THREE.PlaneGeometry(27.5, 0.15);
          wLineGeo.rotateX(-Math.PI / 2);
          const wLine = new THREE.Mesh(wLineGeo, whiteMat);
          wLine.position.set(cx, 0.02, z + dz);
          this.scene.add(wLine);
        });
      });

      // Cross Street Sidewalks (North & South of cross streets, leaving alleys and main street open)
      [-6.5, 6.5].forEach(dz => {
        [-19.0, 19.0].forEach(cx => {
          const cSwGeo = new THREE.BoxGeometry(16.0, 0.25, 2.6);
          const cSw = new THREE.Mesh(cSwGeo, this.factory.materials.sidewalk);
          cSw.position.set(cx, 0.12, z + dz);
          cSw.receiveShadow = true;
          this.scene.add(cSw);
        });
      });

      // Main Road Crosswalk stripes (North and South of intersection)
      for (let x = -5; x <= 5; x += 1.0) {
        const stripeGeo = new THREE.PlaneGeometry(0.5, 3.5);
        stripeGeo.rotateX(-Math.PI / 2);
        const stripe = new THREE.Mesh(stripeGeo, whiteMat);
        stripe.position.set(x, 0.025, z - 6);
        this.scene.add(stripe);

        const stripe2 = stripe.clone();
        stripe2.position.set(x, 0.025, z + 6);
        this.scene.add(stripe2);
      }

      // Cross Street Crosswalk stripes (West and East of intersection)
      for (let sz = -4.5; sz <= 4.5; sz += 1.0) {
        const crossStripeGeo = new THREE.PlaneGeometry(3.5, 0.5);
        crossStripeGeo.rotateX(-Math.PI / 2);
        const cStripeW = new THREE.Mesh(crossStripeGeo, whiteMat);
        cStripeW.position.set(-6.5, 0.025, z + sz);
        this.scene.add(cStripeW);

        const cStripeE = cStripeW.clone();
        cStripeE.position.set(6.5, 0.025, z + sz);
        this.scene.add(cStripeE);
      }

      // Scooter Waiting Box (兩段式左轉待轉區)
      const box1 = this.factory.createScooterWaitingBox();
      box1.position.set(5.2, 0.03, z + 4.5);
      this.scene.add(box1);

      const box2 = this.factory.createScooterWaitingBox();
      box2.position.set(-5.2, 0.03, z - 4.5);
      box2.rotation.y = Math.PI;
      this.scene.add(box2);

      // 4.1. Transverse Deceleration Stripes (橫向減速標線)
      [-22, 22].forEach(offsetZ => {
        const decelCenterZ = z + offsetZ;
        for (let s = -2.2; s <= 2.2; s += 1.1) {
          const decelGeo = new THREE.PlaneGeometry(10.2, 0.22);
          decelGeo.rotateX(-Math.PI / 2);
          const decelMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
          const decelLine = new THREE.Mesh(decelGeo, decelMat);
          decelLine.position.set(0, 0.024, decelCenterZ + s);
          this.scene.add(decelLine);
        }
      });

      this.hookTurnBoxes.push(
        { x: 5.2, z: z + 4.5, interZ: z, id: `box1_${z}`, radius: 2.2, completed: false },
        { x: -5.2, z: z - 4.5, interZ: z, id: `box2_${z}`, radius: 2.2, completed: false }
      );
    });

    // 5. Parallel Alleys Decor & Markings (南北向平行街巷捷徑網)
    // 5.1 West Alley (西側文青老街 / 防火巷捷徑 - X = -32)
    [-35.0, -29.0].forEach(ax => {
      for (let az = -155; az <= 155; az += 6) {
        if (Math.abs(az - (-90)) < 8 || Math.abs(az - 0) < 8 || Math.abs(az - 90) < 8) continue;
        const dashGeo = new THREE.PlaneGeometry(0.12, 3.2);
        dashGeo.rotateX(-Math.PI / 2);
        const dash = new THREE.Mesh(dashGeo, whiteMat);
        dash.position.set(ax, 0.02, az);
        this.scene.add(dash);
      }
    });

    // 5.2 East Alley (東側夜市美食後巷 - X = 32)
    [-35.0, -29.0].forEach(ax => {
      for (let az = -155; az <= 155; az += 6) {
        if (Math.abs(az - (-90)) < 8 || Math.abs(az - 0) < 8 || Math.abs(az - 90) < 8) continue;
        const dashGeo = new THREE.PlaneGeometry(0.12, 3.2);
        dashGeo.rotateX(-Math.PI / 2);
        const dash = new THREE.Mesh(dashGeo, whiteMat);
        dash.position.set(-ax, 0.02, az);
        this.scene.add(dash);
      }
    });

    // East Alley Overhead Festive Red Lantern Strings (夜市紅燈籠天幕)
    const redLanternMat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: 0xd50000,
      emissiveIntensity: 0.6,
      roughness: 0.3
    });
    for (let lz = -140; lz <= 140; lz += 16) {
      if (Math.abs(lz - (-90)) < 12 || Math.abs(lz - 0) < 12 || Math.abs(lz - 90) < 12) continue;
      const wireCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(28.8, 5.2, lz),
        new THREE.Vector3(32.0, 4.6, lz),
        new THREE.Vector3(35.2, 5.2, lz)
      ]);
      const wireMesh = new THREE.Mesh(
        new THREE.TubeGeometry(wireCurve, 12, 0.02, 4, false),
        new THREE.MeshBasicMaterial({ color: 0x222222 })
      );
      this.scene.add(wireMesh);

      [-1.8, 0, 1.8].forEach(dx => {
        const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.35, 8), redLanternMat);
        lantern.position.set(32.0 + dx, 4.6 - Math.abs(dx) * 0.15 - 0.22, lz);
        this.scene.add(lantern);
      });
    }
  }

  createBuildings() {
    const signs = [
      { text: '五十嵐', sub: '珍珠奶茶專賣' },
      { text: '永和豆漿', sub: '宵夜早餐' },
      { text: '阿美鹽酥雞', sub: '蒜味九層塔' },
      { text: '黑糖珍珠', sub: '手工手炒黑糖' },
      { text: '大眾機車行', sub: '換機油傳動保養' },
      { text: '檳榔西施', sub: '雙子星包葉仔' },
      { text: '夾娃娃世界', sub: '保夾出貨' },
      { text: '正忠排骨飯', sub: '傳統美味便當' },
      { text: '文青咖啡', sub: '手沖單品咖啡' },
      { text: '東區滷味', sub: '特製中藥滷汁' },
      { text: '全家便當店', sub: '冷氣開放' },
      { text: '宮廟祈福', sub: '香火鼎盛' }
    ];

    let signIdx = 0;

    // 8 Island Blocks & Perimeter Buildings
    const blockRanges = [
      { minZ: -168, maxZ: -98, stepZ: 17 },
      { minZ: -82, maxZ: -10, stepZ: 17 },
      { minZ: 10, maxZ: 82, stepZ: 17 },
      { minZ: 98, maxZ: 168, stepZ: 17 }
    ];

    blockRanges.forEach(b => {
      for (let z = b.minZ + 8; z <= b.maxZ - 6; z += b.stepZ) {
        // 1. West Island Shophouse facing Main Avenue (X = -18)
        const signW = signs[signIdx % signs.length]; signIdx++;
        const hW = 14 + Math.random() * 8;
        const bldgW = this.factory.createTaiwanBuilding(16, hW, 15, signW.text, signW.sub);
        bldgW.position.set(-18, 0, z);
        bldgW.rotation.y = Math.PI / 2;
        this.scene.add(bldgW);

        // 2. East Island Shophouse facing Main Avenue (X = 18)
        const signE = signs[signIdx % signs.length]; signIdx++;
        const hE = 14 + Math.random() * 8;
        const bldgE = this.factory.createTaiwanBuilding(16, hE, 15, signE.text, signE.sub);
        bldgE.position.set(18, 0, z);
        bldgE.rotation.y = -Math.PI / 2;
        this.scene.add(bldgE);

        // 3. West Outer Perimeter Buildings facing West Alley (X = -44)
        const signOutW = signs[signIdx % signs.length]; signIdx++;
        const bldgOutW = this.factory.createTaiwanBuilding(14, 12 + Math.random() * 6, 15, signOutW.text, signOutW.sub);
        bldgOutW.position.set(-44, 0, z);
        bldgOutW.rotation.y = Math.PI / 2;
        this.scene.add(bldgOutW);

        // 4. East Outer Perimeter Buildings facing East Alley (X = 44)
        const signOutE = signs[signIdx % signs.length]; signIdx++;
        const bldgOutE = this.factory.createTaiwanBuilding(14, 12 + Math.random() * 6, 15, signOutE.text, signOutE.sub);
        bldgOutE.position.set(44, 0, z);
        bldgOutE.rotation.y = -Math.PI / 2;
        this.scene.add(bldgOutE);
      }

      // Island Block Solid Colliders
      this.colliders.push({
        minX: -27.8, maxX: -9.8,
        minZ: b.minZ, maxZ: b.maxZ,
        type: 'wall'
      });
      this.colliders.push({
        minX: 9.8, maxX: 27.8,
        minZ: b.minZ, maxZ: b.maxZ,
        type: 'wall'
      });
    });

    // Outer shop blocks have cross-street openings connecting to the new ring.
    for (const b of blockRanges) {
      for (const side of [-1, 1]) {
        this.colliders.push({ minX: side < 0 ? -52 : 35.8, maxX: side < 0 ? -35.8 : 52,
          minZ: b.minZ, maxZ: b.maxZ, type: 'wall' });
      }
    }
  }

  createSidewalkClutter() {
    // Generate chaotic obstacles & traffic spawn segments
    const zList = [-140, -115, -65, -40, -20, 25, 50, 70, 115, 140];

    zList.forEach((z, i) => {
      // Transformer box (台電變電箱)
      if (i % 3 === 0) {
        const box = this.factory.createTaipowerBox();
        const posX = i % 2 === 0 ? -7.8 : 7.8;
        box.position.set(posX, 0, z + 5);
        this.scene.add(box);
        this.colliders.push({
          minX: posX - 0.75, maxX: posX + 0.75,
          minZ: z + 5 - 0.5, maxZ: z + 5 + 0.5,
          type: 'box'
        });
      }

      // Clustered Flower Pots (紅塑膠盆栽陣)
      if (i % 2 === 1) {
        const pots = this.factory.createFlowerPots();
        const posX = i % 3 === 0 ? -7.2 : 7.2;
        pots.position.set(posX, 0, z - 4);
        this.scene.add(pots);
        this.colliders.push({
          minX: posX - 0.7, maxX: posX + 0.7,
          minZ: z - 4 - 0.45, maxZ: z - 4 + 0.45,
          type: 'pots'
        });
      }

      // Traffic Event Configurations for this segment
      const seg = {
        hasAlphard: (i % 2 === 0),
        alphardX: i % 4 === 0 ? -4.6 : 4.6, // double-parked blocking half lane!
        alphardZ: z,
        alphardRot: i % 4 === 0 ? 0 : Math.PI,

        hasTaxi: (i % 3 === 1),
        taxiX: (i % 3 === 1) ? 4.8 : -4.8,
        taxiZ: z + 12,
        taxiRot: 0,

        hasTruck: (i % 4 === 2),
        truckX: -4.8,
        truckZ: z - 10,
        truckRot: 0,

        hasGrandma: (i % 2 === 1),
        grandmaX: i % 3 === 0 ? -2.2 : 2.2,
        grandmaZ: z - 25,
        grandmaRot: 0,

        hasDog: (i % 3 === 2),
        dogX: i % 2 === 0 ? -7.5 : 7.5,
        dogZ: z + 2,

        hasAcDrip: (i % 2 === 0),
        acX: i % 4 === 0 ? -4.2 : 4.2,
        acZ: z - 3,

        // New Expanded Features:
        hasSpeedCamera: (i === 2 || i === 7),
        camX: (i === 2) ? 6.5 : -6.5,
        camZ: z - 8,
        camRot: (i === 2) ? Math.PI : 0,

        hasSnitch: (i === 1 || i === 8),
        snitchX: (i === 1) ? -7.2 : 7.2,
        snitchZ: z + 6,

        hasTempleParade: (i === 4), // Near main center intersection
        templeX: 0,
        templeZ: z - 2,

        hasFirecrackers: (i === 4),
        firecrackerX: 0,
        firecrackerZ: z - 12,

        hasPothole: (i % 3 === 0),
        potholeX: (i % 2 === 0) ? -2.5 : 2.5,
        potholeZ: z + 16,

        // Taiwanese Cast-Iron Utility Manholes (人孔蓋)
        hasManhole: (i % 2 === 1),
        manholeX: (i % 3 === 0) ? -2.8 : ((i % 3 === 1) ? 2.6 : -1.5),
        manholeZ: z + 6,
        manholeType: (i % 3 === 0) ? 'taipower' : ((i % 3 === 1) ? 'water' : 'sewer'),

        // Iconic Taiwanese Hazards & Landmarks:
        hasTricycle: (i === 3 || i === 8),
        tricycleX: (i === 3) ? -4.2 : 4.2,
        tricycleZ: z + 8,

        hasSoundTruck: (i === 5),
        soundTruckX: 4.8,
        soundTruckZ: z - 5,

        hasSteelPlate: (i === 0 || i === 6),
        plateX: (i === 0) ? -2.0 : 2.0,
        plateZ: z + 2,

        hasPhotographer: (i === 3 || i === 7),
        photographerX: (i === 3) ? -7.8 : 7.8,
        photographerZ: z + 10,

        hasBetelNut: (i === 2 || i === 7),
        kioskX: (i === 2) ? -7.5 : 7.5,
        kioskZ: z + 4,

        hasPoliceCheckpoint: (i === 6),
        policeX: 4.5,
        policeZ: z - 6,

        // Street Hogs & Municipal Waste Truck:
        hasStreetHog: (i % 2 === 0),
        hogX: (i % 4 === 0) ? -5.6 : 5.6,
        hogZ: z - 14,
        hogType: (i % 3),

        hasGarbageTruck: (i === 1),
        garbageX: -4.4,
        garbageZ: z + 22,

        // Rival Delivery Monkey & Night Market Stalls:
        hasRivalMonkey: (i === 0),
        monkeyX: 2.2,
        monkeyZ: z - 30,

        hasMarketStall: (i === 3 || i === 7),
        stallX: (i === 3) ? -7.0 : 7.0,
        stallZ: z - 4,
        stallType: (i % 2),

        // Mazu Pink Supercar Procession:
        hasPinkSupercar: (i === 4),
        mazuX: -1.8,
        mazuZ: z + 12
      };

      // Add Market Stall Collider
      if (seg.hasMarketStall) {
        this.colliders.push({
          minX: seg.stallX - 0.8, maxX: seg.stallX + 0.8,
          minZ: seg.stallZ - 0.6, maxZ: seg.stallZ + 0.6,
          type: 'stall'
        });
      }

      // Add Car & Obstacle Colliders
      if (seg.hasAlphard) {
        this.colliders.push({
          minX: seg.alphardX - 1.1, maxX: seg.alphardX + 1.1,
          minZ: seg.alphardZ - 2.3, maxZ: seg.alphardZ + 2.3,
          type: 'car'
        });
      }
      if (seg.hasTaxi) {
        this.colliders.push({
          minX: seg.taxiX - 0.95, maxX: seg.taxiX + 0.95,
          minZ: seg.taxiZ - 2.0, maxZ: seg.taxiZ + 2.0,
          type: 'car'
        });
      }
      if (seg.hasTruck) {
        this.colliders.push({
          minX: seg.truckX - 1.0, maxX: seg.truckX + 1.0,
          minZ: seg.truckZ - 2.2, maxZ: seg.truckZ + 2.2,
          type: 'car'
        });
      }
      if (seg.hasBetelNut) {
        this.colliders.push({
          minX: seg.kioskX - 1.4, maxX: seg.kioskX + 1.4,
          minZ: seg.kioskZ - 1.1, maxZ: seg.kioskZ + 1.1,
          type: 'building'
        });
      }
      if (seg.hasPoliceCheckpoint) {
        this.colliders.push({
          minX: seg.policeX - 1.1, maxX: seg.policeX + 1.1,
          minZ: seg.policeZ - 2.2, maxZ: seg.policeZ + 2.2,
          type: 'car'
        });
      }

      this.streetSegments.push(seg);
    });
  }

  createDeliveryPoints() {
    // 1. Boba Shop Pickup Station (Starting Point)
    const bobaSign = this.factory.createTextTexture('正宗黑糖珍珠鮮奶', '#ffeb3b', '#000000', 30, '★ 取餐起點 ★');
    const bobaSignMesh = new THREE.Mesh(
      new THREE.BoxGeometry(4, 1.2, 0.4),
      new THREE.MeshStandardMaterial({ map: bobaSign, emissive: 0xffd54f, emissiveIntensity: 0.5 })
    );
    bobaSignMesh.position.set(-8, 3.5, this.bobaShopPos.z);
    this.scene.add(bobaSignMesh);

    // Glowing Hologram Beacon at Pickup Point
    const pickupBeacon = this.createBeacon(this.bobaShopPos.x, this.bobaShopPos.z, 0x00e676);
    this.scene.add(pickupBeacon);

    // 2. Customer Delivery Destinations (Crazy Taxi Style Drop-off Spots across multiple routes)
    const dropCoords = [
      { x: 4.5, z: -50, name: '林小姐 (永和豆漿隔壁3樓・主幹道)' },
      { x: -32.0, z: -35, name: '文青咖啡廳店長 (西側防火巷老街)' },
      { x: 32.0, z: 45, name: '夜市鹹酥雞張阿姨 (東側美食後巷)' },
      { x: -4.5, z: 20, name: '陳先生 (台電變電箱後方老宅)' },
      { x: -32.0, z: 120, name: '動漫社學弟 (西巷住宅公寓5樓)' },
      { x: 4.8, z: 80, name: '科技新貴 (開雙黃燈阿法車主)' },
      { x: -4.2, z: 150, name: '大眾機車行 老闆阿明' }
    ];

    dropCoords.forEach((coord, idx) => {
      const beacon = this.createBeacon(coord.x, coord.z, 0xff1744);
      this.scene.add(beacon);

      this.deliveryDestinations.push({
        id: idx,
        name: coord.name,
        pos: new THREE.Vector3(coord.x, 0, coord.z),
        beaconMesh: beacon,
        delivered: false
      });
    });
  }

  createBeacon(x, z, hexColor) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Vertical cylinder column
    const cylGeo = new THREE.CylinderGeometry(1.4, 1.4, 6.0, 16, 1, true);
    const cylMat = new THREE.MeshBasicMaterial({
      color: hexColor,
      transparent: true,
      opacity: 0.055,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const cyl = new THREE.Mesh(cylGeo, cylMat);
    cyl.position.y = 3.0;
    group.add(cyl);

    // Ground target ring
    const ringGeo = new THREE.RingGeometry(0.8, 1.6, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: hexColor, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.05;
    group.add(ring);

    return group;
  }

  // 5. Road Patches & Diagonal Speed Bumps (道路管線開挖回填補丁與黃黑斜紋減速丘)
  createRoadPatchesAndBumps() {
    // 5.1 Asphalt excavation road patches
    const patchMat = new THREE.MeshStandardMaterial({
      color: 0x222428,
      roughness: 0.94,
      metalness: 0.05
    });
    const seamMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });

    const patches = [
      { x: 1.8, z: -115, w: 2.2, l: 3.6, rot: 0.04 },
      { x: -2.2, z: -35, w: 2.6, l: 4.2, rot: -0.05 },
      { x: 2.4, z: 28, w: 2.0, l: 3.4, rot: 0.03 },
      { x: -1.6, z: 122, w: 2.5, l: 4.6, rot: -0.06 }
    ];

    patches.forEach(p => {
      const patchGroup = new THREE.Group();
      patchGroup.position.set(p.x, 0.021, p.z);
      patchGroup.rotation.y = p.rot;

      // Dark asphalt patch slab
      const slabGeo = new THREE.PlaneGeometry(p.w, p.l);
      slabGeo.rotateX(-Math.PI / 2);
      const slab = new THREE.Mesh(slabGeo, patchMat);
      patchGroup.add(slab);

      // Bitumen perimeter seam tar line
      const seamBorderGeo = new THREE.PlaneGeometry(p.w + 0.16, p.l + 0.16);
      seamBorderGeo.rotateX(-Math.PI / 2);
      const seam = new THREE.Mesh(seamBorderGeo, seamMat);
      seam.position.y = -0.002;
      patchGroup.add(seam);

      this.scene.add(patchGroup);
      this.roadPatches.push({ x: p.x, z: p.z, halfW: p.w / 2, halfL: p.l / 2 });
    });

    // 5.2 Yellow & Black Diagonal Rubber Speed Bumps (黃黑斜紋減速丘)
    let bumpMat;
    try {
      const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
      if (canvas) {
        canvas.width = 128;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffea00';
        ctx.fillRect(0, 0, 128, 32);
        ctx.fillStyle = '#1b1b1b';
        for (let x = -32; x < 160; x += 24) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + 16, 0);
          ctx.lineTo(x - 8, 32);
          ctx.lineTo(x - 24, 32);
          ctx.closePath();
          ctx.fill();
        }
        const bumpTex = new THREE.CanvasTexture(canvas);
        bumpTex.wrapS = THREE.RepeatWrapping;
        bumpTex.repeat.set(3, 1);
        bumpMat = new THREE.MeshStandardMaterial({
          map: bumpTex,
          roughness: 0.6,
          metalness: 0.1
        });
      }
    } catch (_) {}

    if (!bumpMat) {
      bumpMat = new THREE.MeshStandardMaterial({ color: 0xffea00, roughness: 0.6 });
    }

    const bumps = [
      { x: 2.6, z: -45, w: 5.2, l: 0.58 },
      { x: -2.6, z: 65, w: 5.2, l: 0.58 }
    ];

    bumps.forEach(b => {
      const bumpMesh = new THREE.Mesh(new THREE.BoxGeometry(b.w, 0.038, b.l), bumpMat);
      bumpMesh.position.set(b.x, 0.02, b.z);
      this.scene.add(bumpMesh);
      this.speedBumps.push({ x: b.x, z: b.z, halfW: b.w / 2, halfL: b.l / 2 });
    });
  }

  // 6. Street Facilities (阿明機車行自助打氣站 & 酒測臨檢站)
  createStreetFacilities() {
    // 6.1 Uncle Ming's Tire Pitstop
    if (this.factory.createAirCompressor) {
      const airPitstop = this.factory.createAirCompressor();
      airPitstop.position.set(this.airCompressorPos.x, 0, this.airCompressorPos.z);
      this.scene.add(airPitstop);
    }

    // 6.2 Roadside Sobriety Police Checkpoint
    if (this.factory.createSobrietyCheckpoint) {
      const checkpoint = this.factory.createSobrietyCheckpoint();
      checkpoint.position.set(this.sobrietyCheckpointPos.x, 0, this.sobrietyCheckpointPos.z);
      this.scene.add(checkpoint);
    }
  }
}
