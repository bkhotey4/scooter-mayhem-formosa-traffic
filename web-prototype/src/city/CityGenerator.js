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
    this.createNorthGateMonument();
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
    const groundGeo = new THREE.PlaneGeometry(330, 570);
    groundGeo.rotateX(-Math.PI / 2);
    const ground = new THREE.Mesh(groundGeo, this.factory.materials.asphalt);
    ground.receiveShadow = true;
    this.scene.add(ground);

    const yellowMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const redMat = new THREE.MeshBasicMaterial({ color: 0xd50000 });

    // 2. Main Avenue Block Segments (Avoiding 5 cross-street intersections: -230, -115, 0, 115, 230)
    const mainBlockSegs = [
      { len: 26, centerZ: -250 },
      { len: 94, centerZ: -172.5 },
      { len: 94, centerZ: -57.5 },
      { len: 94, centerZ: 57.5 },
      { len: 94, centerZ: 172.5 },
      { len: 26, centerZ: 250 }
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
    for (let z = -220; z <= 220; z += 18) {
      if ([-230, -115, 0, 115, 230].some(cz => Math.abs(z - cz) < 14)) continue;
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

    // 4. Five Cross Streets (東西向橫向大道 / 北門圓環大道、南京西路、中正大道、和平西路、南環大道)
    const intersectionsZ = [-230, -115, 0, 115, 230];
    intersectionsZ.forEach(z => {
      // Cross Street Double Yellow Lines along Z = z, running between vertical avenues
      [-0.15, 0.15].forEach(dz => {
        [
          { startX: -120, endX: -68 },
          { startX: -62, endX: -35 },
          { startX: -29, endX: -6.5 },
          { startX: 6.5, endX: 29 },
          { startX: 35, endX: 62 },
          { startX: 68, endX: 120 }
        ].forEach(span => {
          const spanLen = span.endX - span.startX;
          const spanCenter = (span.startX + span.endX) / 2;
          const yGeo = new THREE.PlaneGeometry(spanLen, 0.12);
          yGeo.rotateX(-Math.PI / 2);
          const yMesh = new THREE.Mesh(yGeo, yellowMat);
          yMesh.position.set(spanCenter, 0.02, z + dz);
          this.scene.add(yMesh);
        });
      });

      // Cross Street White Border Lines
      [-4.6, 4.6].forEach(dz => {
        [
          { startX: -120, endX: -68 },
          { startX: -62, endX: -35 },
          { startX: -29, endX: -6.5 },
          { startX: 6.5, endX: 29 },
          { startX: 35, endX: 62 },
          { startX: 68, endX: 120 }
        ].forEach(span => {
          const spanLen = span.endX - span.startX;
          const spanCenter = (span.startX + span.endX) / 2;
          const wGeo = new THREE.PlaneGeometry(spanLen, 0.15);
          wGeo.rotateX(-Math.PI / 2);
          const wMesh = new THREE.Mesh(wGeo, whiteMat);
          wMesh.position.set(spanCenter, 0.02, z + dz);
          this.scene.add(wMesh);
        });
      });

      // Cross Street Sidewalks (North & South of cross streets, leaving avenues open)
      [-6.5, 6.5].forEach(dz => {
        [-20.0, 20.0].forEach(cx => {
          const cSwGeo = new THREE.BoxGeometry(14.0, 0.25, 2.6);
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
      [-18, 18].forEach(offsetZ => {
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

    // 5. Parallel Alleys Decor & Markings
    // 5.1 West Alley (X = -32)
    [-35.0, -29.0].forEach(ax => {
      for (let az = -215; az <= 215; az += 6) {
        if ([-230, -115, 0, 115, 230].some(cz => Math.abs(az - cz) < 9)) continue;
        const dashGeo = new THREE.PlaneGeometry(0.12, 3.2);
        dashGeo.rotateX(-Math.PI / 2);
        const dash = new THREE.Mesh(dashGeo, whiteMat);
        dash.position.set(ax, 0.02, az);
        this.scene.add(dash);
      }
    });

    // 5.2 East Alley (X = 32)
    [-35.0, -29.0].forEach(ax => {
      for (let az = -215; az <= 215; az += 6) {
        if ([-230, -115, 0, 115, 230].some(cz => Math.abs(az - cz) < 9)) continue;
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
    for (let lz = -200; lz <= 200; lz += 16) {
      if ([-230, -115, 0, 115, 230].some(cz => Math.abs(lz - cz) < 12)) continue;
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

  // Historic Landmark: North Gate (台北府城北門・承恩門) Roundabout Monument
  createNorthGateMonument() {
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, -230);

    // 1. Roundabout circular curb plaza (圓環安全島)
    const islandGeo = new THREE.CylinderGeometry(7.5, 7.5, 0.35, 32);
    const islandMat = new THREE.MeshStandardMaterial({ color: 0x5a6358, roughness: 0.8 });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.y = 0.17;
    gateGroup.add(island);

    // Roundabout lush lawn
    const lawnGeo = new THREE.CylinderGeometry(7.0, 7.0, 0.38, 32);
    const lawnMat = new THREE.MeshStandardMaterial({ color: 0x486b45, roughness: 0.9 });
    const lawn = new THREE.Mesh(lawnGeo, lawnMat);
    lawn.position.y = 0.2;
    gateGroup.add(lawn);

    // 2. Fortress Stone Base (台北府城北門・紅磚城台)
    const fortressMat = new THREE.MeshStandardMaterial({ color: 0x8b3a32, roughness: 0.85 });
    
    // Left & Right solid abutments leaving center archway open (X: -1.7 to 1.7)
    const abutmentGeo = new THREE.BoxGeometry(2.8, 3.2, 6.2);
    const leftAbutment = new THREE.Mesh(abutmentGeo, fortressMat);
    leftAbutment.position.set(-3.1, 1.8, 0);
    gateGroup.add(leftAbutment);

    const rightAbutment = leftAbutment.clone();
    rightAbutment.position.set(3.1, 1.8, 0);
    gateGroup.add(rightAbutment);

    // Arch header beam over the tunnel
    const archTopGeo = new THREE.BoxGeometry(3.6, 0.7, 6.2);
    const archTop = new THREE.Mesh(archTopGeo, fortressMat);
    archTop.position.set(0, 3.05, 0);
    gateGroup.add(archTop);

    // 3. Second Floor Wooden Pavilion (木造城樓)
    const pavilionWallMat = new THREE.MeshStandardMaterial({ color: 0xa83a2a, roughness: 0.7 });
    const pavilionGeo = new THREE.BoxGeometry(8.2, 1.8, 5.4);
    const pavilion = new THREE.Mesh(pavilionGeo, pavilionWallMat);
    pavilion.position.set(0, 4.3, 0);
    gateGroup.add(pavilion);

    // Traditional lattice window accents (木質格扇窗)
    const latticeMat = new THREE.MeshStandardMaterial({ color: 0x2e1810, roughness: 0.6 });
    [-2.2, 0, 2.2].forEach(wx => {
      [-2.72, 2.72].forEach(wz => {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.08), latticeMat);
        win.position.set(wx, 4.3, wz);
        gateGroup.add(win);
      });
    });

    // 4. Swallowtail / Hip-and-Gable Roof (傳統閩南式燕尾翹脊屋頂)
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x2f3e3a, roughness: 0.5 });
    
    // Lower eaves
    const lowerEavesGeo = new THREE.ConeGeometry(6.6, 1.4, 4);
    lowerEavesGeo.rotateY(Math.PI / 4);
    const lowerEaves = new THREE.Mesh(lowerEavesGeo, roofMat);
    lowerEaves.position.set(0, 5.6, 0);
    lowerEaves.scale.set(1.4, 0.7, 1.0);
    gateGroup.add(lowerEaves);

    // Upper ridge & ridge ornament (燕尾正脊)
    const ridgeGeo = new THREE.BoxGeometry(9.6, 0.35, 0.5);
    const ridge = new THREE.Mesh(ridgeGeo, roofMat);
    ridge.position.set(0, 6.2, 0);
    gateGroup.add(ridge);

    // Swallowtail flared tips (燕尾翹脊)
    [-4.8, 4.8].forEach(rx => {
      const tipGeo = new THREE.ConeGeometry(0.35, 0.8, 4);
      const tip = new THREE.Mesh(tipGeo, roofMat);
      tip.position.set(rx, 6.4, 0);
      tip.rotation.z = rx < 0 ? -0.4 : 0.4;
      gateGroup.add(tip);
    });

    // 5. Plaque "承恩門" and "北門" (門額石匾)
    const plaqueMat = new THREE.MeshStandardMaterial({ color: 0xd8caa5, roughness: 0.6 });
    [-3.12, 3.12].forEach((pz, pIdx) => {
      const plaque = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.65, 0.12), plaqueMat);
      plaque.position.set(0, 2.85, pz);
      gateGroup.add(plaque);
      const plaqueText = this.factory.createTextTexture(pIdx === 0 ? '北門' : '承恩門', '#222222', '#d8caa5', 28);
      const plaqueMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.9, 0.55),
        new THREE.MeshBasicMaterial({ map: plaqueText })
      );
      plaqueMesh.position.set(0, 2.85, pz + (pIdx === 0 ? -0.07 : 0.07));
      if (pIdx === 0) plaqueMesh.rotation.y = Math.PI;
      gateGroup.add(plaqueMesh);
    });

    // 6. Roundabout Road Arrows & Directional Ring (環形標線)
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 2) {
      const arGeo = new THREE.PlaneGeometry(0.7, 2.2);
      arGeo.rotateX(-Math.PI / 2);
      const ar = new THREE.Mesh(arGeo, arrowMat);
      ar.position.set(Math.cos(ang) * 9.2, 0.025, Math.sin(ang) * 9.2);
      ar.rotation.y = -ang + Math.PI / 2;
      gateGroup.add(ar);
    }

    this.scene.add(gateGroup);

    // Colliders for the fortress abutments (Tunnel between X = -1.6 and 1.6 is drivable!)
    this.colliders.push({
      minX: -4.6, maxX: -1.6,
      minZ: -233.2, maxZ: -226.8,
      type: 'wall'
    });
    this.colliders.push({
      minX: 1.6, maxX: 4.6,
      minZ: -233.2, maxZ: -226.8,
      type: 'wall'
    });
  }

  createBuildings() {
    const signs = [
      { text: '五十嵐', sub: '珍珠奶茶專賣' },
      { text: '永和豆漿', sub: '宵夜早餐大冰奶' },
      { text: '阿美鹽酥雞', sub: '蒜味九層塔' },
      { text: '黑糖珍珠', sub: '手工手炒黑糖' },
      { text: '大眾機車行', sub: '換機油傳動保養' },
      { text: '檳榔西施', sub: '雙子星包葉仔' },
      { text: '夾娃娃世界', sub: '保夾出貨保證' },
      { text: '正忠排骨飯', sub: '傳統美味便當' },
      { text: '文青咖啡', sub: '手沖單品咖啡' },
      { text: '東區滷味', sub: '特製中藥滷汁' },
      { text: '全家便當店', sub: '冷氣開放座位區' },
      { text: '宮廟祈福', sub: '香火鼎盛保平安' },
      { text: '鼎泰豐小籠包', sub: '黃金十八摺' },
      { text: '鬍鬚張魯肉飯', sub: '道地台灣小吃' },
      { text: '台灣中油', sub: '95無鉛加滿' },
      { text: '西門刺青', sub: '傳統日式浮世繪' }
    ];

    let signIdx = 0;

    // 4 Urban Blocks along Z (between cross streets: -230, -115, 0, 115, 230)
    const blockRanges = [
      { minZ: -218, maxZ: -128, stepZ: 18 },
      { minZ: -102, maxZ: -12, stepZ: 18 },
      { minZ: 12, maxZ: 102, stepZ: 18 },
      { minZ: 128, maxZ: 218, stepZ: 18 }
    ];

    blockRanges.forEach(b => {
      for (let z = b.minZ + 8; z <= b.maxZ - 6; z += b.stepZ) {
        // 1. Central West Shophouses facing Main Avenue (X = -18)
        const signW = signs[signIdx % signs.length]; signIdx++;
        const bldgW = this.factory.createTaiwanBuilding(15, 14 + Math.random() * 8, 15, signW.text, signW.sub);
        bldgW.position.set(-18, 0, z);
        bldgW.rotation.y = Math.PI / 2;
        this.scene.add(bldgW);

        // 2. Central East Shophouses facing Main Avenue (X = 18)
        const signE = signs[signIdx % signs.length]; signIdx++;
        const bldgE = this.factory.createTaiwanBuilding(15, 14 + Math.random() * 8, 15, signE.text, signE.sub);
        bldgE.position.set(18, 0, z);
        bldgE.rotation.y = -Math.PI / 2;
        this.scene.add(bldgE);

        // 3. Mid West Shophouses facing West Alley & Avenue (X = -48)
        const signOutW = signs[signIdx % signs.length]; signIdx++;
        const bldgOutW = this.factory.createTaiwanBuilding(14, 12 + Math.random() * 6, 15, signOutW.text, signOutW.sub);
        bldgOutW.position.set(-48, 0, z);
        bldgOutW.rotation.y = Math.PI / 2;
        this.scene.add(bldgOutW);

        // 4. Mid East Shophouses facing East Alley & Avenue (X = 48)
        const signOutE = signs[signIdx % signs.length]; signIdx++;
        const bldgOutE = this.factory.createTaiwanBuilding(14, 12 + Math.random() * 6, 15, signOutE.text, signOutE.sub);
        bldgOutE.position.set(48, 0, z);
        bldgOutE.rotation.y = -Math.PI / 2;
        this.scene.add(bldgOutE);

        // 5. Far West Commercial Buildings (between West Ave and Waterfront Ave, X = -95)
        const signFarW = signs[signIdx % signs.length]; signIdx++;
        const bldgFarW = this.factory.createTaiwanBuilding(20, 16 + Math.random() * 8, 15, signFarW.text, signFarW.sub);
        bldgFarW.position.set(-95, 0, z);
        bldgFarW.rotation.y = Math.PI / 2;
        this.scene.add(bldgFarW);

        // 6. Far East Commercial Buildings (between East Ave and East Ring, X = 95)
        const signFarE = signs[signIdx % signs.length]; signIdx++;
        const bldgFarE = this.factory.createTaiwanBuilding(20, 16 + Math.random() * 8, 15, signFarE.text, signFarE.sub);
        bldgFarE.position.set(95, 0, z);
        bldgFarE.rotation.y = -Math.PI / 2;
        this.scene.add(bldgFarE);
      }

      // Solid Colliders for the 6 urban blocks in this Z slice
      // Inner West Block (between Main Ave and West Alley)
      this.colliders.push({ minX: -26.0, maxX: -10.2, minZ: b.minZ, maxZ: b.maxZ, type: 'wall' });
      // Inner East Block (between Main Ave and East Alley)
      this.colliders.push({ minX: 10.2, maxX: 26.0, minZ: b.minZ, maxZ: b.maxZ, type: 'wall' });

      // Mid West Block (between West Alley and West Avenue)
      this.colliders.push({ minX: -55.0, maxX: -38.5, minZ: b.minZ, maxZ: b.maxZ, type: 'wall' });
      // Mid East Block (between East Alley and East Avenue)
      this.colliders.push({ minX: 38.5, maxX: 55.0, minZ: b.minZ, maxZ: b.maxZ, type: 'wall' });

      // Far West Block (between West Avenue and Waterfront Avenue)
      this.colliders.push({ minX: -115.0, maxX: -75.0, minZ: b.minZ, maxZ: b.maxZ, type: 'wall' });
      // Far East Block (between East Avenue and East Ring Avenue)
      this.colliders.push({ minX: 75.0, maxX: 115.0, minZ: b.minZ, maxZ: b.maxZ, type: 'wall' });
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

    // 2. Customer Delivery Destinations (Crazy Taxi Style Drop-off Spots across multiple routes and districts)
    const dropCoords = [
      { x: 0, z: -205, name: '北門廣場前 文創手作咖啡館' },
      { x: -65.0, z: -80, name: '延平北路 百年茶行王老闆' },
      { x: 65.0, z: -60, name: '重慶南路 兆豐金融總部林襄理' },
      { x: -125.0, z: 10, name: '淡水河堤夕照水岸 街頭藝人' },
      { x: 32.0, z: 60, name: '夜市深處 炭烤香腸攤張阿姨' },
      { x: 125.0, z: 120, name: '東環夜市 觀光美食街舞台' },
      { x: -65.0, z: 180, name: '西門萬年商業大樓 潮牌店長' },
      { x: 65.0, z: 215, name: '南環水岸花園 豪宅陳主委' },
      { x: 0.0, z: 80, name: '中正大道 科技新貴 (開雙黃燈阿法車主)' },
      { x: -32.0, z: -35, name: '文青老巷 手沖咖啡店長' }
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
