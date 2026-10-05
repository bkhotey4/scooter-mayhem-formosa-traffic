// CityGenerator.js - Procedural Taiwanese City with Shophouses, Alleys & Clutter
import * as THREE from 'three';
import { enrichStreet, batchStaticStreet } from './StreetLife.js';

export class CityGenerator {
  constructor(scene, modelFactory) {
    this.scene = scene;
    this.factory = modelFactory;

    this.cityBounds = { minX: -10, maxX: 10, minZ: -176, maxZ: 176 };
    this.gutterPositions = [];
    this.streetSegments = [];
    this.deliveryDestinations = [];
    this.colliders = [];
    this.hookTurnBoxes = [];
    this.bobaShopPos = new THREE.Vector3(0, 0, -140);
  }

  generateCity() {
    const existing = new Set(this.scene.children);
    this.createGroundAndRoads();
    this.createBuildings();
    this.createSidewalkClutter();
    enrichStreet(this.scene, this.factory, this.colliders);
    batchStaticStreet(this.scene, this.scene.children.filter(o => !existing.has(o)));
    this.createDeliveryPoints();

    return {
      bounds: this.cityBounds,
      gutters: this.gutterPositions,
      segments: this.streetSegments,
      bobaShop: this.bobaShopPos,
      destinations: this.deliveryDestinations,
      colliders: this.colliders,
      hookTurnBoxes: this.hookTurnBoxes
    };
  }

  createGroundAndRoads() {
    // 1. Asphalt Ground
    const groundGeo = new THREE.PlaneGeometry(160, 420);
    groundGeo.rotateX(-Math.PI / 2);
    const ground = new THREE.Mesh(groundGeo, this.factory.materials.asphalt);
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 2. Road Markings (雙黃線、白邊線、斑馬線、機車待轉區)
    // Central Double Yellow Lines along Z axis
    [-0.15, 0.15].forEach(x => {
      const lineGeo = new THREE.PlaneGeometry(0.12, 380);
      lineGeo.rotateX(-Math.PI / 2);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(x, 0.02, 0);
      this.scene.add(line);
    });

    // White Lane Boundary Lines (Separating road from gutter / parking)
    [-5.5, 5.5].forEach(x => {
      const lineGeo = new THREE.PlaneGeometry(0.15, 380);
      lineGeo.rotateX(-Math.PI / 2);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(x, 0.02, 0);
      this.scene.add(line);
    });

    // Red Curb Lines (紅線違停禁區 - 諷刺的是違停車輛最愛停在紅線上!)
    [-6.8, 6.8].forEach(x => {
      const redLineGeo = new THREE.PlaneGeometry(0.15, 380);
      redLineGeo.rotateX(-Math.PI / 2);
      const redMat = new THREE.MeshBasicMaterial({ color: 0xd50000 });
      const redLine = new THREE.Mesh(redLineGeo, redMat);
      redLine.position.set(x, 0.02, 0);
      this.scene.add(redLine);
    });

    // Sidewalk Pavements (騎樓人行道)
    [-11.5, 11.5].forEach(x => {
      const swGeo = new THREE.BoxGeometry(9.0, 0.25, 400);
      const sw = new THREE.Mesh(swGeo, this.factory.materials.sidewalk);
      sw.position.set(x, 0.12, 0);
      sw.receiveShadow = true;
      this.scene.add(sw);
    });

    // 3. Road Metal Gutter Covers (水溝蓋 - 水溝蓋跑法專用加速帶)
    // Runs alongside the right and left road margins
    for (let z = -170; z <= 170; z += 18) {
      [-6.1, 6.1].forEach(x => {
        const gutter = this.factory.createGutterCover(12);
        gutter.position.set(x, 0.01, z);
        this.scene.add(gutter);

        this.gutterPositions.push({ x, z, length: 12 });
      });
    }

    // 4. Intersections & Crosswalks (斑馬線 & 機車待轉區)
    const intersectionsZ = [-90, 0, 90];
    intersectionsZ.forEach(z => {
      // Crosswalk stripes
      for (let x = -5; x <= 5; x += 1.0) {
        const stripeGeo = new THREE.PlaneGeometry(0.5, 3.5);
        stripeGeo.rotateX(-Math.PI / 2);
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(x, 0.025, z - 6);
        this.scene.add(stripe);

        const stripe2 = stripe.clone();
        stripe2.position.set(x, 0.025, z + 6);
        this.scene.add(stripe2);
      }

      // Scooter Waiting Box (兩段式左轉待轉區)
      const box1 = this.factory.createScooterWaitingBox();
      box1.position.set(5.2, 0.03, z + 4.5);
      this.scene.add(box1);

      const box2 = this.factory.createScooterWaitingBox();
      box2.position.set(-5.2, 0.03, z - 4.5);
      box2.rotation.y = Math.PI;
      this.scene.add(box2);

      this.hookTurnBoxes.push(
        { x: 5.2, z: z + 4.5, interZ: z, id: `box1_${z}`, radius: 2.2, completed: false },
        { x: -5.2, z: z - 4.5, interZ: z, id: `box2_${z}`, radius: 2.2, completed: false }
      );
    });
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
      { text: '全家便當店', sub: '冷氣開放' },
      { text: '宮廟祈福', sub: '香火鼎盛' }
    ];

    let signIdx = 0;

    // Build shophouses along West side (X = -18) and East side (X = 18)
    for (let z = -170; z <= 170; z += 17) {
      // Skip intersection gaps
      if (Math.abs(z - (-90)) < 12 || Math.abs(z - 0) < 12 || Math.abs(z - 90) < 12) {
        continue;
      }

      // Left side building
      const signL = signs[signIdx % signs.length];
      signIdx++;
      const hL = 14 + Math.random() * 8;
      const bldgL = this.factory.createTaiwanBuilding(16, hL, 16, signL.text, signL.sub);
      bldgL.position.set(-18, 0, z);
      bldgL.rotation.y = Math.PI / 2;
      this.scene.add(bldgL);

      // Right side building
      const signR = signs[signIdx % signs.length];
      signIdx++;
      const hR = 14 + Math.random() * 8;
      const bldgR = this.factory.createTaiwanBuilding(16, hR, 16, signR.text, signR.sub);
      bldgR.position.set(18, 0, z);
      bldgR.rotation.y = -Math.PI / 2;
      this.scene.add(bldgR);
    }

    // Solid Building Wall Colliders (Left and Right street facade barriers)
    const blockRanges = [
      { minZ: -180, maxZ: -98 },
      { minZ: -82, maxZ: -10 },
      { minZ: 10, maxZ: 82 },
      { minZ: 98, maxZ: 180 }
    ];

    blockRanges.forEach(b => {
      // West building wall barrier
      this.colliders.push({
        minX: -30, maxX: -9.8,
        minZ: b.minZ, maxZ: b.maxZ,
        type: 'wall'
      });
      // East building wall barrier
      this.colliders.push({
        minX: 9.8, maxX: 30,
        minZ: b.minZ, maxZ: b.maxZ,
        type: 'wall'
      });
    });

    // North & South dead-end world boundaries
    this.colliders.push({
      minX: -35, maxX: 35,
      minZ: -185, maxZ: -176,
      type: 'wall'
    });
    this.colliders.push({
      minX: -35, maxX: 35,
      minZ: 176, maxZ: 185,
      type: 'wall'
    });
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

    // 2. Customer Delivery Destinations (Crazy Taxi Style Drop-off Spots)
    const dropCoords = [
      { x: 4.5, z: -50, name: '林小姐 (永和豆漿隔壁3樓)' },
      { x: -4.5, z: 20, name: '陳先生 (台電變電箱後方老宅)' },
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
}
