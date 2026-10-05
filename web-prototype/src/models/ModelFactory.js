// ModelFactory.js - Procedural 3D Low-Poly Taiwanese Assets
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { detailScooter, detailBuilding } from './StreetArt.js';
import { createDetailedCar, createDetailedRider, polishScooter, polishTruck } from './VehicleModels.js';

export class ModelFactory {
  constructor() {
    this.materials = this.initMaterials();
  }

  initMaterials() {
    this.asphaltTex = this.createAsphaltCanvasTexture();
    this.tileBeigeTex = this.createTileWallCanvasTexture('#ded5c4', '#a89f8d');
    this.tileTealTex = this.createTileWallCanvasTexture('#7faec4', '#557a8d');
    this.tileBrownTex = this.createTileWallCanvasTexture('#bda387', '#7d6852');
    this.shutterTex = this.createMetalShutterCanvasTexture();

    return {
      asphalt: new THREE.MeshStandardMaterial({ map: this.asphaltTex, roughness: 0.85, metalness: 0.1 }),
      sidewalk: new THREE.MeshStandardMaterial({ color: 0x908c84, roughness: 0.75 }),
      scooterBodyTeal: new THREE.MeshPhysicalMaterial({ color: 0x247e83, roughness: 0.29, metalness: 0.35, clearcoat: 0.85, clearcoatRoughness: 0.18 }),
      scooterBodyYellow: new THREE.MeshStandardMaterial({ color: 0xffb300, roughness: 0.25, metalness: 0.35 }),
      blackPlastic: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.65 }),
      tireRubber: new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.95 }),
      chrome: new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.1, metalness: 0.95 }),
      mirrorGlass: new THREE.MeshStandardMaterial({ color: 0x90caf9, roughness: 0.05, metalness: 0.9 }),
      headlight: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffee, emissiveIntensity: 1.5 }),
      taillight: new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xd50000, emissiveIntensity: 1.2 }),
      turnSignal: new THREE.MeshStandardMaterial({ color: 0xff9100, emissive: 0xff6d00, emissiveIntensity: 1.5 }),
      deliveryBox: new THREE.MeshStandardMaterial({ color: 0x00a86b, roughness: 0.3 }),
      deliveryBoxPink: new THREE.MeshStandardMaterial({ color: 0xd81b60, roughness: 0.3 }),
      skin: new THREE.MeshStandardMaterial({ color: 0xf5cda8, roughness: 0.55 }),
      helmetGreen: new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.25 }),
      alphardBlack: new THREE.MeshPhysicalMaterial({ color: 0x243037, roughness: 0.28, metalness: 0.45, clearcoat: 1, clearcoatRoughness: 0.15 }),
      taxiYellow: new THREE.MeshPhysicalMaterial({ color: 0xdfae35, roughness: 0.32, metalness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
      blueTruck: new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.35, metalness: 0.3 }),
      metalRoofGreen: new THREE.MeshStandardMaterial({ color: 0x275b29, roughness: 0.6, metalness: 0.2 }),
      metalRoofBlue: new THREE.MeshStandardMaterial({ color: 0x154374, roughness: 0.6, metalness: 0.2 }),
      tileWallBeige: new THREE.MeshStandardMaterial({ map: this.tileBeigeTex, roughness: 0.65 }),
      tileWallTeal: new THREE.MeshStandardMaterial({ map: this.tileTealTex, roughness: 0.65 }),
      tileWallBrown: new THREE.MeshStandardMaterial({ map: this.tileBrownTex, roughness: 0.65 }),
      metalShutter: new THREE.MeshStandardMaterial({ map: this.shutterTex, roughness: 0.45, metalness: 0.65 }),
      potteryRed: new THREE.MeshStandardMaterial({ color: 0xbf360c, roughness: 0.75 }),
      plantGreen: new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.5 }),
      taipowerGreen: new THREE.MeshStandardMaterial({ color: 0x33691e, roughness: 0.55 }),
      metalGutter: new THREE.MeshStandardMaterial({ color: 0x607d8b, roughness: 0.3, metalness: 0.85 }),
      neonYellow: new THREE.MeshStandardMaterial({ color: 0xffd54f, emissive: 0xffb300, emissiveIntensity: 1.5 }),
      neonRed: new THREE.MeshStandardMaterial({ color: 0xff5252, emissive: 0xd50000, emissiveIntensity: 1.5 }),
      neonCyan: new THREE.MeshStandardMaterial({ color: 0x18ffff, emissive: 0x00e5ff, emissiveIntensity: 1.5 }),
      neonGreen: new THREE.MeshStandardMaterial({ color: 0x69f0ae, emissive: 0x00e676, emissiveIntensity: 1.5 }),
      glassTinted: new THREE.MeshStandardMaterial({ color: 0x0d1b2a, roughness: 0.08, metalness: 0.7, transparent: true, opacity: 0.88 }),
      windowWarm: new THREE.MeshStandardMaterial({ color: 0xffe082, emissive: 0xffb74d, emissiveIntensity: 0.7 })
    };
  }

  // Realistic procedural asphalt road texture
  createAsphaltCanvasTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base dark asphalt
    ctx.fillStyle = '#1c1f24';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle asphalt speckles & noise
    for (let i = 0; i < 15000; i++) {
      const shade = Math.floor(25 + Math.random() * 35);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
    }

    // Faint oil drips / tire streaks
    ctx.fillStyle = 'rgba(10, 10, 10, 0.4)';
    for (let j = 0; j < 12; j++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 20 + Math.random() * 60, 4 + Math.random() * 10);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 42);
    return tex;
  }

  // Authentic Taiwanese Two-Ding-Hang ceramic tile facade
  createTileWallCanvasTexture(baseHex, groutHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = groutHex;
    ctx.fillRect(0, 0, 256, 256);

    const tileW = 60;
    const tileH = 20;
    const gap = 3;

    for (let y = 0; y < 256; y += tileH + gap) {
      const rowIdx = Math.floor(y / (tileH + gap));
      const offsetX = (rowIdx % 2 === 0) ? 0 : tileW / 2;

      for (let x = -tileW; x < 256 + tileW; x += tileW + gap) {
        // Subtle tile color variation
        ctx.fillStyle = baseHex;
        ctx.fillRect(x + offsetX, y, tileW, tileH);

        // Highlight top/left bevel
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(x + offsetX, y, tileW, 2);
        ctx.fillRect(x + offsetX, y, 2, tileH);

        // Shadow bottom/right
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x + offsetX, y + tileH - 2, tileW, 2);
        ctx.fillRect(x + offsetX + tileW - 2, y, 2, tileH);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
  }

  // Corrugated commercial metal roll-up door
  createMetalShutterCanvasTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#607d8b';
    ctx.fillRect(0, 0, 128, 256);

    // Ribbed horizontal grooves
    const grooveH = 8;
    for (let y = 0; y < 256; y += grooveH) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, y, 128, 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(0, y + 2, 128, 4);
    }

    // Key lock handles
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(52, 140, 24, 8);
    ctx.fillStyle = '#111';
    ctx.fillRect(62, 142, 4, 4);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 2);
    return tex;
  }

  // Helper to create text canvas texture for signs and stickers
  createTextTexture(text, bgColor = '#000000', textColor = '#ffffff', fontSize = 32, subtitle = '') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = textColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    // Text
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, subtitle ? canvas.height / 2 - 14 : canvas.height / 2);

    if (subtitle) {
      ctx.font = `bold ${Math.floor(fontSize * 0.5)}px sans-serif`;
      ctx.fillStyle = '#ffeb3b';
      ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 28);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  // 1. Taiwanese 125cc Delivery Scooter (經典勁戰 / 迪爵風格)
  createPlayerScooter({ lights = true } = {}) {
    const scooter = new THREE.Group();

    // Chassis / Footboard
    const deckGeo = new THREE.BoxGeometry(0.55, 0.12, 1.2);
    const deck = new THREE.Mesh(deckGeo, this.materials.blackPlastic);
    deck.position.set(0, 0.35, 0);
    scooter.add(deck);

    // Front Cowl / Fairing
    const cowlGeo = new RoundedBoxGeometry(0.52, 0.68, 0.45, 3, 0.14);
    const cowl = new THREE.Mesh(cowlGeo, this.materials.scooterBodyTeal);
    cowl.name = 'scooterCowl';
    cowl.position.set(0, 0.72, 0.52);
    cowl.rotation.x = -0.22;
    scooter.add(cowl);

    // Front Headlight (Triangular / Modern)
    const lightGeo = new THREE.BoxGeometry(0.28, 0.16, 0.05);
    const headlight = new THREE.Mesh(lightGeo, this.materials.headlight);
    headlight.position.set(0, 0.75, 0.76);
    headlight.rotation.x = -0.22;
    scooter.add(headlight);

    // Real-time Projected Headlight Beam
    const headSpot = new THREE.SpotLight(0xfffaee, 4.0, 38, Math.PI / 5.5, 0.45, 1.2);
    headSpot.position.set(0, 0.75, 0.8);
    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 0.2, 16);
    scooter.add(spotTarget);
    headSpot.target = spotTarget;
    headSpot.castShadow = true;
    if (lights) scooter.add(headSpot);

    // Front Wire Basket for Haomai (國民神車專屬菜籃)
    const basket = new THREE.Group();
    basket.name = 'scooterBasket';
    basket.position.set(0, 0.65, 0.78);
    const basketBottom = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.22), this.materials.blackPlastic);
    const basketRim = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.22, 0.24), new THREE.MeshStandardMaterial({
      color: 0x333333,
      wireframe: true
    }));
    basketRim.position.set(0, 0.1, 0);
    basket.add(basketBottom, basketRim);
    basket.visible = false;
    scooter.add(basket);

    // Turn Signals (Left / Right)
    const sigGeo = new THREE.BoxGeometry(0.08, 0.06, 0.04);
    const sigL = new THREE.Mesh(sigGeo, this.materials.turnSignal);
    sigL.position.set(-0.2, 0.68, 0.74);
    const sigR = new THREE.Mesh(sigGeo, this.materials.turnSignal);
    sigR.position.set(0.2, 0.68, 0.74);
    scooter.add(sigL, sigR);

    // Handlebar & Fork assembly (can rotate when steering)
    const steeringStem = new THREE.Group();
    steeringStem.name = 'steeringStem';
    steeringStem.position.set(0, 0.95, 0.42);

    const barGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.72);
    barGeo.rotateZ(Math.PI / 2);
    const bar = new THREE.Mesh(barGeo, this.materials.blackPlastic);
    steeringStem.add(bar);

    // Instrument Speedometer
    const dashGeo = new THREE.BoxGeometry(0.2, 0.1, 0.15);
    const dash = new THREE.Mesh(dashGeo, this.materials.blackPlastic);
    dash.position.set(0, 0.05, 0);
    dash.rotation.x = 0.5;
    steeringStem.add(dash);

    // Rearview Mirrors (Left / Right)
    [-0.32, 0.32].forEach(xOffset => {
      const mirrorStem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.22),
        this.materials.chrome
      );
      mirrorStem.position.set(xOffset, 0.12, 0.02);
      mirrorStem.rotation.z = xOffset > 0 ? -0.25 : 0.25;

      const mirrorGlass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.02),
        this.materials.mirrorGlass
      );
      mirrorGlass.rotation.x = Math.PI / 2;
      mirrorGlass.position.set(xOffset * 1.15, 0.22, 0.04);
      steeringStem.add(mirrorStem, mirrorGlass);
    });

    scooter.add(steeringStem);

    // Front Wheel & Fork
    const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.12, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const frontWheel = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
    frontWheel.position.set(0, 0.24, 0.7);
    frontWheel.name = 'frontWheel';

    // Front Rim
    const rimGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.13, 8);
    rimGeo.rotateZ(Math.PI / 2);
    const rimFront = new THREE.Mesh(rimGeo, this.materials.chrome);
    frontWheel.add(rimFront);
    scooter.add(frontWheel);

    // Rear Wheel
    const rearWheel = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
    rearWheel.position.set(0, 0.24, -0.6);
    rearWheel.name = 'rearWheel';
    const rimRear = new THREE.Mesh(rimGeo, this.materials.chrome);
    rearWheel.add(rimRear);
    scooter.add(rearWheel);

    // Rear Body & Seat
    const seatBodyGeo = new RoundedBoxGeometry(0.51, 0.35, 0.9, 3, 0.15);
    const seatBody = new THREE.Mesh(seatBodyGeo, this.materials.scooterBodyTeal);
    seatBody.name = 'scooterSeatBody';
    seatBody.position.set(0, 0.58, -0.25);
    scooter.add(seatBody);

    const cushionGeo = new RoundedBoxGeometry(0.46, 0.12, 0.82, 3, 0.055);
    const cushion = new THREE.Mesh(cushionGeo, this.materials.blackPlastic);
    cushion.position.set(0, 0.78, -0.25);
    scooter.add(cushion);

    // Exhaust Pipe (Right Side)
    const exhaustGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.65);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaust = new THREE.Mesh(exhaustGeo, this.materials.chrome);
    exhaust.name = 'scooterExhaust';
    exhaust.position.set(0.26, 0.22, -0.45);
    exhaust.rotation.y = -0.15;
    scooter.add(exhaust);

    // Rear Taillight & Glowing Point Light
    const tailGeo = new THREE.BoxGeometry(0.3, 0.1, 0.05);
    const taillight = new THREE.Mesh(tailGeo, this.materials.taillight.clone());
    taillight.name = 'playerBrakeLamp';
    taillight.position.set(0, 0.65, -0.69);
    scooter.add(taillight);

    const tailLightPoint = new THREE.PointLight(0xff1744, 1.8, 6);
    tailLightPoint.name = 'playerBrakeGlow';
    tailLightPoint.position.set(0, 0.65, -0.75);
    if (lights) scooter.add(tailLightPoint);

    // Mudguard with Retro Idol Decal ("追夢人")
    const mudguardGeo = new THREE.BoxGeometry(0.24, 0.35, 0.02);
    const mudguardTex = this.createTextTexture('追夢人', '#e91e63', '#ffffff', 36, '莫忘初衷');
    const mudguardMat = new THREE.MeshStandardMaterial({ map: mudguardTex, roughness: 0.5 });
    const mudguard = new THREE.Mesh(mudguardGeo, mudguardMat);
    mudguard.name = 'scooterMudguard';
    mudguard.position.set(0, 0.32, -0.76);
    mudguard.rotation.x = -0.15;
    scooter.add(mudguard);

    // Rear Cargo Groups (Multi-Cargo Visual System)
    // 1. Boba Delivery Box (外送保溫箱 - 經典黑糖珍奶)
    const boxGroup = new THREE.Group();
    boxGroup.name = 'deliveryBox';
    boxGroup.position.set(0, 0.95, -0.55);

    const boxGeo = new RoundedBoxGeometry(0.48, 0.42, 0.48, 2, 0.035);
    const boxTex = this.createTextTexture('黑糖珍奶', '#00a86b', '#ffffff', 32, '★ 極速專送 ★');
    const boxMat = new THREE.MeshStandardMaterial({ map: boxTex, roughness: 0.4 });
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.name = 'scooterBoxMesh';
    boxGroup.add(boxMesh);

    const strapGeo = new THREE.BoxGeometry(0.5, 0.02, 0.03);
    const strap1 = new THREE.Mesh(strapGeo, this.materials.blackPlastic);
    strap1.position.set(0, 0.21, 0.12);
    const strap2 = new THREE.Mesh(strapGeo, this.materials.blackPlastic);
    strap2.position.set(0, 0.21, -0.12);
    boxGroup.add(strap1, strap2);
    scooter.add(boxGroup);

    // 2. Farm Fresh Egg Crate (紅殼土雞蛋 10顆木框箱)
    const eggCrateGroup = new THREE.Group();
    eggCrateGroup.name = 'eggCrateGroup';
    eggCrateGroup.position.set(0, 0.88, -0.55);
    eggCrateGroup.visible = false;

    const crateMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.18, 0.46), this.materials.potteryRed);
    eggCrateGroup.add(crateMesh);

    // 10 egg spheres (2 rows of 5)
    const eggGeo = new THREE.SphereGeometry(0.045, 8, 8);
    eggGeo.scale(1, 1.25, 1);
    const eggMat = new THREE.MeshStandardMaterial({ color: 0xf5b041, roughness: 0.4 });
    for (let r = -1; r <= 1; r += 2) {
      for (let c = -2; c <= 2; c++) {
        const egg = new THREE.Mesh(eggGeo, eggMat);
        egg.position.set(r * 0.12, 0.12, c * 0.08);
        eggCrateGroup.add(egg);
      }
    }
    scooter.add(eggCrateGroup);

    // 3. Shaved Ice Mountain (滿料八寶全糖挫冰玻璃大碗)
    const shavedIceGroup = new THREE.Group();
    shavedIceGroup.name = 'shavedIceGroup';
    shavedIceGroup.position.set(0, 0.85, -0.55);
    shavedIceGroup.visible = false;

    const bowlGeo = new THREE.CylinderGeometry(0.24, 0.14, 0.16, 16);
    const bowlMat = new THREE.MeshStandardMaterial({ color: 0x81d4fa, transparent: true, opacity: 0.75, roughness: 0.1 });
    const bowl = new THREE.Mesh(bowlGeo, bowlMat);
    shavedIceGroup.add(bowl);

    const iceConeGeo = new THREE.ConeGeometry(0.22, 0.28, 12);
    const iceMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    const iceCone = new THREE.Mesh(iceConeGeo, iceMat);
    iceCone.position.set(0, 0.2, 0);
    shavedIceGroup.add(iceCone);

    // Red spoon
    const spoon = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.32), this.materials.taillight);
    spoon.position.set(0.12, 0.22, 0.08);
    spoon.rotation.z = -0.35;
    shavedIceGroup.add(spoon);
    scooter.add(shavedIceGroup);

    // 4. Hot Fried Chicken Bag (逢甲大雞排+甜不辣 經典防油紙袋)
    const friedChickenGroup = new THREE.Group();
    friedChickenGroup.name = 'friedChickenGroup';
    friedChickenGroup.position.set(0, 0.88, -0.55);
    friedChickenGroup.visible = false;

    const bagGeo = new THREE.BoxGeometry(0.38, 0.32, 0.24);
    const bagMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.8 });
    const bag = new THREE.Mesh(bagGeo, bagMat);
    friedChickenGroup.add(bag);

    const cutletGeo = new THREE.BoxGeometry(0.28, 0.22, 0.06);
    const cutletMat = new THREE.MeshStandardMaterial({ color: 0xff8f00, roughness: 0.5 });
    const cutlet = new THREE.Mesh(cutletGeo, cutletMat);
    cutlet.position.set(0, 0.14, 0);
    cutlet.rotation.z = 0.15;
    friedChickenGroup.add(cutlet);
    scooter.add(friedChickenGroup);

    // 5. Dual 20kg LPG Gas Cylinders for "阿公瓦斯車"
    const gasTanksGroup = new THREE.Group();
    gasTanksGroup.name = 'gasTanksGroup';
    gasTanksGroup.position.set(0, 0.85, -0.55);
    gasTanksGroup.visible = false;

    [-0.16, 0.16].forEach(xOff => {
      const tankGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.58, 14);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x78909c, metalness: 0.4, roughness: 0.4 });
      const tank = new THREE.Mesh(tankGeo, tankMat);
      tank.position.set(xOff, 0.15, 0);

      // Valve knob
      const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08), this.materials.turnSignal);
      valve.position.set(xOff, 0.48, 0);

      // Warning text band
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.12, 14), this.materials.taillight);
      band.position.set(xOff, 0.15, 0);

      gasTanksGroup.add(tank, valve, band);
    });

    // Ratchet yellow tie strap
    const gasStrap = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.03, 0.05), this.materials.taxiYellow);
    gasStrap.position.set(0, 0.22, 0.1);
    gasTanksGroup.add(gasStrap);
    scooter.add(gasTanksGroup);

    // Dynamic Cargo Visual Switcher Method
    scooter.setCargoVisual = (cargoType = 'boba', vehicleId = 'cygnus') => {
      if (vehicleId === 'gas_tank') {
        gasTanksGroup.visible = true;
        boxGroup.visible = false;
        eggCrateGroup.visible = false;
        shavedIceGroup.visible = false;
        friedChickenGroup.visible = false;
      } else {
        gasTanksGroup.visible = false;
        boxGroup.visible = (cargoType === 'boba');
        eggCrateGroup.visible = (cargoType === 'eggs');
        shavedIceGroup.visible = (cargoType === 'shaved_ice');
        friedChickenGroup.visible = (cargoType === 'fried_chicken');
      }
    };

    // Rider Character
    const rider = this.createRider();
    rider.position.set(0, 0.78, -0.05);
    rider.name = 'rider';
    scooter.add(rider);

    detailScooter(scooter, this);
    polishScooter(scooter, this);
    return scooter;
  }

  createRider() {
    return createDetailedRider(this);
  }

  // 1.5. Ghost-Cutting Vegetable Market Grandma (菜市場三寶阿嬤 50cc)
  createGrandmaScooter() {
    const scooter = new THREE.Group();
    scooter.userData = {
      type: 'grandma',
      speed: 5.5,
      blinkerOn: true,
      blinkerTimer: 0,
      ghostCutTriggered: false,
      ghostCutProgress: 0,
      laneX: 4.8,
      targetX: -3.5,
      dodgeAwarded: false
    };

    // Body (Old-school mint green/pastel 50cc)
    const cowlMat = new THREE.MeshStandardMaterial({ color: 0x80cbc4, roughness: 0.4 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.1, 1.0), this.materials.blackPlastic);
    deck.position.set(0, 0.3, 0);
    scooter.add(deck);

    const cowl = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.58, 0.38, 2, 0.1), cowlMat);
    cowl.position.set(0, 0.65, 0.42);
    scooter.add(cowl);

    const seat = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.28, 0.72, 2, 0.1), cowlMat);
    seat.position.set(0, 0.55, -0.22);
    const cushion = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.1, 0.66, 2, 0.05), this.materials.blackPlastic);
    cushion.position.set(0, 0.72, -0.22);
    scooter.add(seat, cushion);

    // Front Wheel & Rear Wheel
    const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const fw = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
    fw.position.set(0, 0.2, 0.58);
    const rw = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
    rw.position.set(0, 0.2, -0.5);
    scooter.add(fw, rw);

    // Front Vegetable Wire Basket (大菜籃)
    const basketGroup = new THREE.Group();
    basketGroup.position.set(0, 0.65, 0.65);
    const basketMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.22), new THREE.MeshStandardMaterial({
      color: 0x222222,
      wireframe: true
    }));
    basketGroup.add(basketMesh);

    // Green Leeks / Scallions (青蔥)
    const leekMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 });
    const leek1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35), leekMat);
    leek1.position.set(-0.06, 0.12, 0.02);
    leek1.rotation.z = 0.25;
    const leek2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32), leekMat);
    leek2.position.set(0.04, 0.12, -0.02);
    leek2.rotation.z = -0.2;
    basketGroup.add(leek1, leek2);

    // Orange Carrot (紅蘿蔔)
    const carrot = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.22, 8), new THREE.MeshStandardMaterial({ color: 0xff6d00 }));
    carrot.position.set(0.08, 0.08, 0.04);
    carrot.rotation.x = -0.3;
    basketGroup.add(carrot);
    scooter.add(basketGroup);

    // Blinking Right Turn Signal (右轉燈恆閃)
    const blinkerGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const blinkerR = new THREE.Mesh(blinkerGeo, this.materials.turnSignal);
    blinkerR.position.set(0.18, 0.62, 0.62);
    scooter.add(blinkerR);
    scooter.userData.blinkerR = blinkerR;
    blinkerR.name = 'blinker';

    // Grandma Rider
    const grandma = new THREE.Group();
    grandma.position.set(0, 0.72, -0.08);

    // Floral purple cardigan
    const torso = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.44, 0.22, 2, 0.06), new THREE.MeshStandardMaterial({
      color: 0x7b1fa2,
      roughness: 0.8
    }));
    torso.position.set(0, 0.22, 0);
    grandma.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), this.materials.skin);
    head.position.set(0, 0.52, 0.06);
    grandma.add(head);

    // Watermelon green helmet
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), this.materials.helmetGreen);
    helmet.position.set(0, 0.54, 0.06);
    grandma.add(helmet);

    // Grey hair bun peeking out behind
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
    bun.position.set(0, 0.48, -0.06);
    grandma.add(bun);

    scooter.add(grandma);
    return scooter;
  }

  // 1.6. Giant Road Puddle (暴雨深水坑 - 乘風破浪水花秀)
  createWaterPuddle() {
    const puddle = new THREE.Group();
    puddle.userData = { type: 'puddle', radius: 2.2, active: true };

    const geo = new THREE.CircleGeometry(2.0, 16);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x102027,
      roughness: 0.08,
      metalness: 0.85,
      transparent: true,
      opacity: 0.82
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.025;
    mesh.scale.set(1.4, 1, 1.8);
    puddle.add(mesh);

    // Subtle ripple ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.35, 16);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.4 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.03;
    ring.scale.set(1.4, 1, 1.8);
    puddle.add(ring);

    return puddle;
  }

  // 2. Double-Parked Alphard / VIP Van (違停阿法神車 - 會突開車門)
  createAlphardVan() {
    return createDetailedCar(this, 'van');
  }

  // 3. Taiwanese Yellow Taxi (台灣大車隊 小黃)
  createTaxi() {
    return createDetailedCar(this, 'taxi');
  }

  // 4. Blue Small Truck (中華菱利小藍卡車 - 發財車)
  createBlueTruck() {
    const truck = new THREE.Group();
    truck.userData = { type: 'truck' };

    // Blue Cab
    const cabGeo = new RoundedBoxGeometry(1.65, 1.3, 1.4, 3, 0.15);
    const cab = new THREE.Mesh(cabGeo, this.materials.blueTruck);
    cab.position.set(0, 0.95, 1.1);
    truck.add(cab);

    // Windshield
    const wsGeo = new THREE.BoxGeometry(1.5, 0.55, 0.05);
    const ws = new THREE.Mesh(wsGeo, this.materials.glassTinted);
    ws.position.set(0, 1.1, 1.81);
    truck.add(ws);

    // Flatbed (Wooden / Galvanized)
    const bedGeo = new THREE.BoxGeometry(1.75, 0.35, 2.6);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(0, 0.6, -0.8);
    truck.add(bed);

    // Cargo on truck: Gas cylinders (瓦斯桶)
    [-0.45, 0.45].forEach((x, i) => {
      [-0.8, -0.2, 0.4].forEach((z, j) => {
        const gasGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.65, 10);
        const gasMat = new THREE.MeshStandardMaterial({ color: (i + j) % 2 === 0 ? 0x90a4ae : 0xd32f2f, roughness: 0.5 });
        const gas = new THREE.Mesh(gasGeo, gasMat);
        gas.position.set(x, 1.1, z);
        truck.add(gas);
      });
    });

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.24, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    [
      [-0.85, 0.35, 1.1], [0.85, 0.35, 1.1],
      [-0.88, 0.35, -1.0], [0.88, 0.35, -1.0]
    ].forEach(pos => {
      const w = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
      w.position.set(...pos);
      truck.add(w);
    });

    polishTruck(truck, this);
    return truck;
  }

  // 6. Taiwanese Black Dog (台灣小黑狗 - 巷口狂追機車)
  createBlackDog() {
    const dog = new THREE.Group();
    dog.userData = { type: 'dog', state: 'idle', barkTimer: 0 };

    const dogMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.25, 0.3, 0.6);
    const body = new THREE.Mesh(bodyGeo, dogMat);
    body.position.set(0, 0.35, 0);
    dog.add(body);

    // Head with pointy ears
    const headGeo = new THREE.BoxGeometry(0.2, 0.22, 0.25);
    const head = new THREE.Mesh(headGeo, dogMat);
    head.position.set(0, 0.52, 0.32);
    dog.add(head);

    // Snout
    const snoutGeo = new THREE.BoxGeometry(0.12, 0.1, 0.15);
    const snout = new THREE.Mesh(snoutGeo, dogMat);
    snout.position.set(0, 0.48, 0.48);
    dog.add(snout);

    // Red Collar (項圈)
    const collar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.22), new THREE.MeshStandardMaterial({ color: 0xe53935 }));
    collar.position.set(0, 0.44, 0.25);
    dog.add(collar);

    // Ears
    [-0.08, 0.08].forEach(x => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 4), dogMat);
      ear.position.set(x, 0.66, 0.28);
      dog.add(ear);
    });

    // Tail (Wagging)
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.25), dogMat);
    tail.position.set(0, 0.45, -0.38);
    tail.rotation.x = -0.7;
    tail.name = 'tail';
    dog.add(tail);

    // Legs
    [-0.1, 0.1].forEach(x => {
      [-0.2, 0.2].forEach(z => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.25), dogMat);
        leg.position.set(x, 0.12, z);
        dog.add(leg);
      });
    });

    return dog;
  }

  // 7. Shophouse Building with Arcade (透天厝騎樓店面、冷氣、鐵皮屋頂、霓虹招牌)
  createTaiwanBuilding(width = 12, height = 16, depth = 14, signText = '五十嵐', signSub = '正宗奶茶') {
    const building = new THREE.Group();

    // Random tile color
    const tileMats = [this.materials.tileWallBeige, this.materials.tileWallTeal, this.materials.tileWallBrown];
    const wallMat = tileMats[Math.floor(Math.random() * tileMats.length)];

    // Main Upper Floors (2F ~ 4F)
    const upperGeo = new THREE.BoxGeometry(width, height - 4.5, depth);
    const upper = new THREE.Mesh(upperGeo, wallMat);
    upper.position.set(0, (height - 4.5) / 2 + 4.5, 0);
    building.add(upper);

    // Ground Floor Arcade (騎樓 - Walkway with pillars)
    const backWallGeo = new THREE.BoxGeometry(width, 4.5, depth - 4);
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 2.25, -2);
    building.add(backWall);

    // Roll-up Iron Door (鐵捲門) on Ground Floor with textured corrugated lines
    const shutterGeo = new THREE.BoxGeometry(width - 1.5, 3.8, 0.1);
    const shutter = new THREE.Mesh(shutterGeo, this.materials.metalShutter);
    shutter.position.set(0, 1.9, 0.05);
    building.add(shutter);

    // Arcade Columns (騎樓柱子)
    const colGeo = new THREE.BoxGeometry(0.8, 4.5, 0.8);
    [-width / 2 + 0.6, width / 2 - 0.6].forEach(x => {
      const col = new THREE.Mesh(colGeo, wallMat);
      col.position.set(x, 2.25, depth / 2 - 0.4);
      building.add(col);
    });

    // Rooftop Corrugated Iron Addition (頂樓鐵皮加蓋 - 經典台味綠/藍)
    const roofColorMat = Math.random() > 0.5 ? this.materials.metalRoofGreen : this.materials.metalRoofBlue;
    const roofAdditionGeo = new THREE.BoxGeometry(width - 1.5, 3.5, depth - 2);
    const roofAddition = new THREE.Mesh(roofAdditionGeo, roofColorMat);
    roofAddition.position.set(0, height + 1.75, 0);
    building.add(roofAddition);

    // Corrugated Pitched Roof
    const roofGableGeo = new THREE.ConeGeometry((width - 1.2) * 0.7, 1.8, 4);
    roofGableGeo.rotateY(Math.PI / 4);
    const pitchedRoof = new THREE.Mesh(roofGableGeo, roofColorMat);
    pitchedRoof.position.set(0, height + 3.5 + 0.9, 0);
    pitchedRoof.scale.set(1, 1, (depth - 2) / (width - 1.5));
    building.add(pitchedRoof);

    // AC Outdoor Compressor Unit on balcony with water drop potential (冷氣室外機)
    const acGeo = new THREE.BoxGeometry(1.0, 0.7, 0.45);
    const acMat = new THREE.MeshStandardMaterial({ color: 0xdcdcdc, roughness: 0.6 });
    const ac = new THREE.Mesh(acGeo, acMat);
    ac.position.set(width * 0.25, 8.5, depth / 2 + 0.25);
    ac.name = 'acUnit';
    building.add(ac);

    // Warm illuminated window panes & Traditional Iron Window Grilles (鐵窗花)
    for (let f = 1; f <= 2; f++) {
      [-width * 0.25, width * 0.25].forEach(x => {
        // Warm interior light pane
        const winPane = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), this.materials.windowWarm);
        winPane.position.set(x, 6 + f * 3.8, depth / 2 + 0.05);
        building.add(winPane);

        // Security Grille
        const grilleGeo = new THREE.BoxGeometry(2.4, 1.8, 0.15);
        const grilleMat = new THREE.MeshStandardMaterial({ color: 0x263238, wireframe: true });
        const grille = new THREE.Mesh(grilleGeo, grilleMat);
        grille.position.set(x, 6 + f * 3.8, depth / 2 + 0.12);
        building.add(grille);
      });
    }

    // Protruding Vertical Neon Signboard (經典台灣懸掛直立招牌)
    if (signText) {
      const signGeo = new THREE.BoxGeometry(0.3, 4.4, 1.5);
      const signTex = this.createTextTexture(signText, '#d50000', '#ffeb3b', 28, signSub);
      const signMat = new THREE.MeshStandardMaterial({
        map: signTex,
        emissive: 0xff1744,
        emissiveIntensity: 0.65,
        roughness: 0.25
      });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(width / 2 + 0.15, 7.5, depth / 2 - 1.5);
      building.add(sign);

      // Support metal bracket
      const bracketGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2);
      bracketGeo.rotateZ(Math.PI / 2);
      const bracket = new THREE.Mesh(bracketGeo, this.materials.chrome);
      bracket.position.set(width / 2 + 0.6, 9.2, depth / 2 - 1.5);
      building.add(bracket);
    }

    detailBuilding(building, this, width, height, depth, signText, signSub);
    return building;
  }

  // 8. Sidewalk & Alley Clutter (盆栽陣、台電變電箱、紅色瓦斯桶、三角錐)
  createTaipowerBox() {
    const box = new THREE.Group();
    box.userData = { type: 'transformerBox' };

    const bodyGeo = new THREE.BoxGeometry(1.2, 1.4, 0.75);
    const tex = this.createTextTexture('台電高壓電', '#2e7d32', '#ffeb3b', 26, '危險勿近');
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
    const mesh = new THREE.Mesh(bodyGeo, mat);
    mesh.position.set(0, 0.7, 0);
    box.add(mesh);

    // Concrete base
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.2, 0.9), this.materials.sidewalk);
    base.position.set(0, 0.1, 0);
    box.add(base);

    return box;
  }

  createFlowerPots() {
    const group = new THREE.Group();
    group.userData = { type: 'flowerPots' };

    // Clustered Taiwanese red plastic pots with leafy plants (佔地為王盆栽陣)
    [-0.45, 0, 0.45].forEach((x, i) => {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.35, 8), this.materials.potteryRed);
      pot.position.set(x, 0.18, (i % 2) * 0.15);
      group.add(pot);

      const plant = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 1), this.materials.plantGreen);
      plant.position.set(x, 0.5, (i % 2) * 0.15);
      group.add(plant);
    });

    return group;
  }

  // 9. Metal Storm Drain Gutter Cover (水溝蓋 - 水溝蓋跑法專用加速區)
  createGutterCover(length = 4) {
    const gutter = new THREE.Group();
    gutter.userData = { type: 'gutterCover' };

    const geo = new THREE.BoxGeometry(0.7, 0.05, length);
    const mesh = new THREE.Mesh(geo, this.materials.metalGutter);
    mesh.position.set(0, 0.02, 0);
    gutter.add(mesh);

    // Grate slits
    const numSlits = Math.floor(length * 3);
    for (let i = 0; i < numSlits; i++) {
      const slit = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.06, 0.08),
        this.materials.blackPlastic
      );
      slit.position.set(0, 0.03, -length / 2 + 0.2 + i * 0.32);
      gutter.add(slit);
    }

    return gutter;
  }

  // 10. Two-Stage Left Turn Waiting Box (機車待轉區)
  createScooterWaitingBox() {
    const box = new THREE.Group();
    const planeGeo = new THREE.PlaneGeometry(2.8, 2.8);
    planeGeo.rotateX(-Math.PI / 2);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, 236, 236);

    // Text "機車待轉區"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('機車待轉區', 128, 140);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9 });
    const mesh = new THREE.Mesh(planeGeo, mat);
    mesh.position.set(0, 0.03, 0);
    box.add(mesh);
    return box;
  }

  // 11. Speed Trap Camera Pole (科技執法測速照相機桿)
  createSpeedCamera() {
    const group = new THREE.Group();
    group.userData = { type: 'speedCamera', flashed: false };

    // Pole with yellow & grey stripes
    const poleGeo = new THREE.CylinderGeometry(0.18, 0.18, 4.5, 12);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.5 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(0, 2.25, 0);
    group.add(pole);

    // Yellow warning stripes on pole
    [-0.8, -0.2, 0.4, 1.0].forEach(y => {
      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.19, 0.25, 12),
        new THREE.MeshStandardMaterial({ color: 0xfbc02d, roughness: 0.4 })
      );
      stripe.position.set(0, 2.25 + y, 0);
      group.add(stripe);
    });

    // Camera Box on top
    const boxGeo = new THREE.BoxGeometry(0.7, 0.9, 0.6);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.4 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 4.8, 0);
    group.add(box);

    // Twin Radar / Camera Lenses
    [-0.16, 0.16].forEach(x => {
      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 })
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(x, 4.85, 0.32);
      group.add(lens);
    });

    // Camera Flash Light (Emissive)
    const flashMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.45, 0.25),
      new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
    );
    flashMesh.position.set(0, 5.1, 0.32);
    flashMesh.name = 'flashMesh';
    group.add(flashMesh);

    // Warning sign plate: "前有測速照相 請減速慢行"
    const signTex = this.createTextTexture('前有測速', '#ffeb3b', '#d50000', 36, '限速 60');
    const signMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.5, 0.05),
      new THREE.MeshStandardMaterial({ map: signTex })
    );
    signMesh.position.set(0, 3.6, 0.25);
    group.add(signMesh);

    return group;
  }

  // 12. Citizen Snitch NPC (檢舉魔人 - 躲在變電箱旁拍照)
  createCitizenSnitch() {
    const snitch = new THREE.Group();
    snitch.userData = { type: 'snitch', flashTimer: 0 };

    // Body in High-Vis Orange/Yellow Vest (反光背心)
    const torsoGeo = new THREE.BoxGeometry(0.36, 0.55, 0.25);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0xff6d00, roughness: 0.5 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, 0.95, 0);
    snitch.add(torso);

    // Reflective stripes on vest
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.37, 0.08, 0.26),
      new THREE.MeshStandardMaterial({ color: 0xeeff41, emissive: 0xaeea00, emissiveIntensity: 0.4 })
    );
    stripe.position.set(0, 0.95, 0);
    snitch.add(stripe);

    // Head with Bucket Hat (遮陽漁夫帽)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), this.materials.skin);
    head.position.set(0, 1.35, 0);
    snitch.add(head);

    const hat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.18, 0.1, 12),
      new THREE.MeshStandardMaterial({ color: 0x4e342e })
    );
    hat.position.set(0, 1.45, 0);
    snitch.add(hat);

    // DSLR Camera with zoom lens pointed at road
    const camGeo = new THREE.BoxGeometry(0.2, 0.15, 0.12);
    const cam = new THREE.Mesh(camGeo, this.materials.blackPlastic);
    cam.position.set(0, 1.15, 0.3);
    snitch.add(cam);

    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.18, 12), this.materials.chrome);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 1.15, 0.42);
    snitch.add(lens);

    // Camera flash bulb
    const flashBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
    );
    flashBulb.position.set(0, 1.25, 0.35);
    flashBulb.name = 'flashBulb';
    snitch.add(flashBulb);

    // Legs
    [-0.1, 0.1].forEach(x => {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.65, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x37474f })
      );
      leg.position.set(x, 0.35, 0);
      snitch.add(leg);
    });

    return snitch;
  }

  // 13. Temple Fair Palanquin (宮廟陣頭神轎 - 橫行路障)
  createTempleParade() {
    const parade = new THREE.Group();
    parade.userData = { type: 'templeParade', swayTimer: 0 };

    // Wooden Palanquin Base (紅金神轎)
    const baseGeo = new THREE.BoxGeometry(1.6, 1.2, 1.6);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.4 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.set(0, 1.3, 0);
    parade.add(base);

    // Golden Temple Roof & Finials
    const roofGeo = new THREE.ConeGeometry(1.4, 0.8, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.6, roughness: 0.3 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 2.2, 0);
    parade.add(roof);

    // Carrying Poles (兩根長木槓)
    [-0.6, 0.6].forEach(x => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 4.8),
        new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.6 })
      );
      pole.rotation.x = Math.PI / 2;
      pole.position.set(x, 0.85, 0);
      parade.add(pole);
    });

    // Temple Banner Flags (天上聖母 / 境內平安)
    const flagTex = this.createTextTexture('天上聖母', '#ffd600', '#d50000', 32, '境內平安');
    const flagMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 1.4),
      new THREE.MeshStandardMaterial({ map: flagTex, side: THREE.DoubleSide })
    );
    flagMesh.position.set(0.9, 2.2, 0.8);
    parade.add(flagMesh);

    return parade;
  }

  // 14. Red Firecracker Roll (大地雷紅色滾筒鞭炮)
  createFirecrackers(length = 8) {
    const group = new THREE.Group();
    group.userData = { type: 'firecrackers', exploded: false };

    // Red firecracker strip along ground
    const geo = new THREE.BoxGeometry(0.8, 0.08, length);
    const mat = new THREE.MeshStandardMaterial({ color: 0xd50000, roughness: 0.7 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0.04, 0);
    group.add(mesh);

    // Rolled bundle at end
    const rollGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.8, 12);
    rollGeo.rotateZ(Math.PI / 2);
    const roll = new THREE.Mesh(rollGeo, mat);
    roll.position.set(0, 0.35, -length / 2);
    group.add(roll);

    return group;
  }

  // 15. Road Asphalt Pothole (道路補丁與坑洞)
  createPothole() {
    const pot = new THREE.Group();
    pot.userData = { type: 'pothole' };

    const geo = new THREE.CylinderGeometry(0.9, 1.0, 0.04, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x121418, roughness: 0.95 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0.02, 0);
    pot.add(mesh);

    return pot;
  }

  // 15.5. Taiwanese Cast-Iron Manhole Cover (台灣馬路人孔蓋 - 金屬凹凸滑移與彈跳)
  createManholeCover(utilityType = 'taipower') {
    const group = new THREE.Group();
    group.userData = { type: 'manholeCover', utility: utilityType };

    // Outer recessed asphalt rim ring
    const rimGeo = new THREE.CylinderGeometry(0.62, 0.64, 0.03, 24);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x222428, roughness: 0.9, metalness: 0.3 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.set(0, 0.015, 0);
    group.add(rim);

    // Cast iron main lid (鑄鐵圓蓋)
    const lidGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.04, 24);
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0x363a3e,
      roughness: 0.42,
      metalness: 0.78
    });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.set(0, 0.025, 0);
    group.add(lid);

    // Center utility emblem badge (台電閃電 / 水字紋 / 雨水下水道)
    const emblemGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.045, 12);
    let emblemColor = 0xd32f2f; // Taipower red mark or metal bronze
    if (utilityType === 'water') emblemColor = 0x1976d2;
    if (utilityType === 'sewer') emblemColor = 0xf57c00;
    const emblemMat = new THREE.MeshStandardMaterial({ color: emblemColor, roughness: 0.5, metalness: 0.5 });
    const emblem = new THREE.Mesh(emblemGeo, emblemMat);
    emblem.position.set(0, 0.028, 0);
    group.add(emblem);

    // Anti-slip diamond raised rib bars (防滑鑄鐵十字凸紋)
    const ribMat = new THREE.MeshStandardMaterial({ color: 0x282b2e, roughness: 0.5, metalness: 0.8 });
    for (let r = 0; r < 4; r++) {
      const angle = (r * Math.PI) / 4;
      const barGeo = new THREE.BoxGeometry(0.78, 0.05, 0.04);
      const bar = new THREE.Mesh(barGeo, ribMat);
      bar.position.set(0, 0.026, 0);
      bar.rotation.y = angle;
      group.add(bar);
    }

    return group;
  }

  // 16. Scrap Cardboard Tricycle (資源回收阿伯紙箱三輪車 - 搖晃路障)
  createCardboardTricycle() {
    const group = new THREE.Group();
    group.userData = { type: 'cardboardTricycle' };

    // Metal Frame & Pedals
    const frameGeo = new THREE.BoxGeometry(0.12, 0.12, 2.2);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8, metalness: 0.3 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 0.45, 0);
    group.add(frame);

    // Front Wheel
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const fWheel = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
    fWheel.position.set(0, 0.35, 1.1);
    group.add(fWheel);

    // Rear Axle & Wheels
    [-0.55, 0.55].forEach(x => {
      const rWheel = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
      rWheel.position.set(x, 0.35, -0.6);
      group.add(rWheel);
    });

    // Handlebars
    const barGeo = new THREE.BoxGeometry(0.75, 0.06, 0.06);
    const bar = new THREE.Mesh(barGeo, this.materials.chrome);
    bar.position.set(0, 0.95, 0.9);
    group.add(bar);

    // Elderly Cyclist NPC
    // Body (Blue undershirt)
    const bodyGeo = new THREE.BoxGeometry(0.38, 0.55, 0.28);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1976d2, roughness: 0.7 });
    const cyclistBody = new THREE.Mesh(bodyGeo, bodyMat);
    cyclistBody.position.set(0, 1.05, 0.3);
    cyclistBody.rotation.x = 0.25; // Leaning forward pedaling
    group.add(cyclistBody);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), this.materials.skin);
    head.position.set(0, 1.45, 0.42);
    group.add(head);

    // Bamboo Conical Straw Hat (傳統竹編斗笠)
    const hatGeo = new THREE.ConeGeometry(0.38, 0.16, 12);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.85 });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.set(0, 1.56, 0.42);
    group.add(hat);

    // White Towel around neck (白汗毛巾)
    const towelGeo = new THREE.BoxGeometry(0.32, 0.08, 0.18);
    const towelMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    const towel = new THREE.Mesh(towelGeo, towelMat);
    towel.position.set(0, 1.34, 0.38);
    group.add(towel);

    // Rear Wooden Cargo Bed
    const bedGeo = new THREE.BoxGeometry(1.2, 0.1, 1.4);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.9 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.set(0, 0.55, -0.6);
    group.add(bed);

    // Swaying Cardboard Stack (2.5m Tall Towering Stack!)
    const stackPivot = new THREE.Group();
    stackPivot.name = 'cardboardStack';
    stackPivot.position.set(0, 0.6, -0.6);
    group.add(stackPivot);

    const boxLayers = [
      { w: 1.25, h: 0.5, d: 1.3, y: 0.25, c: 0xcaa472 },
      { w: 1.15, h: 0.6, d: 1.25, y: 0.8, c: 0xd7b889 },
      { w: 1.3, h: 0.55, d: 1.2, y: 1.35, c: 0xbfa06d },
      { w: 1.1, h: 0.5, d: 1.15, y: 1.85, c: 0xd2b48c },
      { w: 0.95, h: 0.45, d: 1.05, y: 2.3, c: 0xc49e68 }
    ];

    boxLayers.forEach((l, idx) => {
      const bGeo = new THREE.BoxGeometry(l.w, l.h, l.d);
      const bMat = new THREE.MeshStandardMaterial({ color: l.c, roughness: 0.9 });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set((idx % 2 === 0 ? 0.04 : -0.04), l.y, (idx % 3 === 0 ? 0.05 : -0.05));
      bMesh.rotation.y = (idx * 0.08) - 0.15;
      stackPivot.add(bMesh);
    });

    // Yellow Twine Strings (束帶繩子)
    const ropeGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.5);
    const ropeMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
    [-0.4, 0.4].forEach(x => {
      const rope = new THREE.Mesh(ropeGeo, ropeMat);
      rope.position.set(x, 1.25, 0);
      stackPivot.add(rope);
    });

    return group;
  }

  // 17. Broadcast Sound Truck (土窯雞/炭烤地瓜廣播發財車)
  createSoundTruck() {
    const truck = new THREE.Group();
    truck.userData = { type: 'soundTruck' };

    // Standard blue truck body
    const baseTruck = this.createBlueTruck();
    truck.add(baseTruck);

    // Megaphone Speaker on Cab Roof (大聲公高音喇叭)
    const speakerGroup = new THREE.Group();
    speakerGroup.name = 'megaphoneSpeaker';
    speakerGroup.position.set(0, 2.2, 0.9);

    const hornConeGeo = new THREE.ConeGeometry(0.24, 0.45, 12, 1, true);
    hornConeGeo.rotateX(-Math.PI / 2);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.4, roughness: 0.3 });
    const hornCone = new THREE.Mesh(hornConeGeo, hornMat);
    speakerGroup.add(hornCone);

    const hornBaseGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 10);
    hornBaseGeo.rotateX(-Math.PI / 2);
    const hornBase = new THREE.Mesh(hornBaseGeo, hornMat);
    hornBase.position.set(0, 0, 0.28);
    speakerGroup.add(hornBase);

    truck.add(speakerGroup);

    // Roasting Barrels in Truck Bed (炭烤土窯桶)
    [-0.45, 0.45].forEach((x, idx) => {
      const barrelGeo = new THREE.CylinderGeometry(0.42, 0.45, 0.9, 14);
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0x37474f, metalness: 0.6, roughness: 0.4 });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.position.set(x, 1.3, -1.0 + (idx * 0.4));
      truck.add(barrel);

      // Chimney Pipe with Smoke (排煙煙囪)
      const chimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x212121, metalness: 0.8 })
      );
      chimney.position.set(x, 1.9, -1.0 + (idx * 0.4));
      truck.add(chimney);
    });

    // Sound Truck Banners on Sides (紅色經典布條: 土窯雞 烤地瓜)
    const bannerTex = this.createTextTexture('傳統炭烤土窯雞', '#d50000', '#ffeb3b', 30, '香熱燒地瓜');
    const bannerMat = new THREE.MeshStandardMaterial({ map: bannerTex, side: THREE.DoubleSide });

    const bannerL = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.5), bannerMat);
    bannerL.position.set(-1.05, 1.25, -0.9);
    bannerL.rotation.y = -Math.PI / 2;
    truck.add(bannerL);

    const bannerR = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.5), bannerMat);
    bannerR.position.set(1.05, 1.25, -0.9);
    bannerR.rotation.y = Math.PI / 2;
    truck.add(bannerR);

    // Pulsing Sound Wave indicator ring
    const ringGeo = new THREE.RingGeometry(0.3, 0.45, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const waveRing = new THREE.Mesh(ringGeo, ringMat);
    waveRing.name = 'soundWaveRing';
    waveRing.position.set(0, 2.2, 0.6);
    truck.add(waveRing);

    return truck;
  }

  // 18. Roadwork Steel Jump Plate (道路施工鋼板跳台與閃爍三角錐)
  createRoadworkSteelPlate(width = 3.6, length = 4.2) {
    const group = new THREE.Group();
    group.userData = { type: 'steelPlate' };

    // Heavy Corrugated Steel Plate (厚重鋪路鋼板)
    const plateGeo = new THREE.BoxGeometry(width, 0.08, length);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x546e7a,
      roughness: 0.35,
      metalness: 0.85
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(0, 0.04, 0);
    plate.receiveShadow = true;
    group.add(plate);

    // Yellow & Black Hazard Edge Stripes (黑黃警示斜紋邊框)
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
    const edgeFront = new THREE.Mesh(new THREE.BoxGeometry(width, 0.085, 0.25), stripeMat);
    edgeFront.position.set(0, 0.045, length / 2);
    group.add(edgeFront);

    const edgeBack = new THREE.Mesh(new THREE.BoxGeometry(width, 0.085, 0.25), stripeMat);
    edgeBack.position.set(0, 0.045, -length / 2);
    group.add(edgeBack);

    // Flanking Construction Cones with Blinking Hazard Strobes
    [-width / 2 - 0.35, width / 2 + 0.35].forEach((x, idx) => {
      // Traffic Cone (三角錐)
      const coneGeo = new THREE.ConeGeometry(0.2, 0.7, 10);
      const coneMat = new THREE.MeshStandardMaterial({ color: 0xff6d00, roughness: 0.5 });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(x, 0.35, idx === 0 ? -length / 3 : length / 3);
      group.add(cone);

      // Reflective white stripe on cone
      const whiteBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.15, 0.18, 10),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      whiteBand.position.set(x, 0.35, idx === 0 ? -length / 3 : length / 3);
      group.add(whiteBand);

      // Blinking Yellow Warning Strobe Light (施工爆閃黃燈)
      const strobe = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffea00 })
      );
      strobe.name = 'hazardLight';
      strobe.position.set(x, 0.8, idx === 0 ? -length / 3 : length / 3);
      group.add(strobe);
    });

    return group;
  }

  // 19. Trackside Photographer NPC (北宜九彎十八拐追焦大砲手)
  createTracksidePhotographer() {
    const group = new THREE.Group();
    group.userData = { type: 'photographer' };

    // Folding Camp Chair (折疊椅)
    const chairGeo = new THREE.BoxGeometry(0.55, 0.45, 0.5);
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x0277bd, roughness: 0.8 });
    const chair = new THREE.Mesh(chairGeo, chairMat);
    chair.position.set(0, 0.25, 0);
    group.add(chair);

    // Photographer Body sitting down
    const bodyGeo = new THREE.BoxGeometry(0.42, 0.6, 0.3);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0.75, 0.05);
    group.add(body);

    // Head with Baseball Cap turned backwards
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), this.materials.skin);
    head.position.set(0, 1.15, 0.08);
    group.add(head);

    const capGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.08, 10);
    const cap = new THREE.Mesh(capGeo, new THREE.MeshStandardMaterial({ color: 0xd50000 }));
    cap.position.set(0, 1.24, 0.05);
    group.add(cap);

    // Tripod (三腳架)
    const tripodGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6);
    const tripodMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
    const tripodCenter = new THREE.Mesh(tripodGeo, tripodMat);
    tripodCenter.position.set(0, 0.55, 0.5);
    group.add(tripodCenter);

    // Canon "White Bazooka" Telephoto Lens (大砲神鏡 - 70-200mm / 400mm 白鏡)
    const lensGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.5, 14);
    lensGeo.rotateX(Math.PI / 2);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.25, metalness: 0.3 });
    const bigLens = new THREE.Mesh(lensGeo, lensMat);
    bigLens.position.set(0, 1.1, 0.65);
    group.add(bigLens);

    // Red luxury ring on lens (L 鏡標誌紅圈)
    const redRingGeo = new THREE.CylinderGeometry(0.132, 0.132, 0.03, 14);
    redRingGeo.rotateX(Math.PI / 2);
    const redRing = new THREE.Mesh(redRingGeo, new THREE.MeshBasicMaterial({ color: 0xd50000 }));
    redRing.position.set(0, 1.1, 0.82);
    group.add(redRing);

    // DSLR Camera Body
    const camGeo = new THREE.BoxGeometry(0.24, 0.18, 0.15);
    const cam = new THREE.Mesh(camGeo, this.materials.blackPlastic);
    cam.position.set(0, 1.1, 0.35);
    group.add(cam);

    // Strobe Speedlite Flash (機頂大閃光燈)
    const flashHeadGeo = new THREE.BoxGeometry(0.12, 0.14, 0.1);
    const flashHead = new THREE.Mesh(flashHeadGeo, this.materials.blackPlastic);
    flashHead.position.set(0, 1.26, 0.35);
    group.add(flashHead);

    const flashBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
    );
    flashBulb.name = 'flashBulb';
    flashBulb.position.set(0, 1.26, 0.42);
    group.add(flashBulb);

    // Cooler box beside chair (冰桶與手搖杯)
    const cooler = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.3, 0.45),
      new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.5 })
    );
    cooler.position.set(0.45, 0.15, 0.1);
    group.add(cooler);

    return group;
  }

  // 20. Betel Nut Kiosk & Iced Water Nitro Station (雙子星檳榔攤 ＆ 結冰水氮氣補給站)
  createBetelNutKiosk() {
    const group = new THREE.Group();
    group.userData = { type: 'betelNutKiosk' };

    // Glass Booth Structure
    const boothGeo = new THREE.BoxGeometry(2.8, 2.6, 2.2);
    const boothMat = new THREE.MeshStandardMaterial({
      color: 0x80deea,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.65
    });
    const booth = new THREE.Mesh(boothGeo, boothMat);
    booth.position.set(0, 1.3, 0);
    group.add(booth);

    // Aluminum Frame Edges (亮綠金屬邊框)
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x00e676, roughness: 0.3, metalness: 0.7 });
    [-1.35, 1.35].forEach(x => {
      [-1.05, 1.05].forEach(z => {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.6, 0.1), frameMat);
        pillar.position.set(x, 1.3, z);
        group.add(pillar);
      });
    });

    // Glass Counter inside
    const counterGeo = new THREE.BoxGeometry(2.4, 0.9, 0.6);
    const counterMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.position.set(0, 0.45, 0.3);
    group.add(counter);

    // Kiosk Vendor NPC (檳榔西施)
    const vendorBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.6, 0.25),
      new THREE.MeshStandardMaterial({ color: 0xff4081, roughness: 0.6 })
    );
    vendorBody.position.set(0, 1.15, -0.2);
    group.add(vendorBody);

    const vendorHead = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), this.materials.skin);
    vendorHead.position.set(0, 1.55, -0.2);
    group.add(vendorHead);

    // Rooftop Signboard (雙子星檳榔 結冰水)
    const signTex = this.createTextTexture('雙子星檳榔', '#d50000', '#00e5ff', 32, '幼齒包葉 結冰水');
    const signMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.8, 0.2),
      new THREE.MeshStandardMaterial({ map: signTex, emissive: 0xd50000, emissiveIntensity: 0.5 })
    );
    signMesh.position.set(0, 2.9, 0.9);
    group.add(signMesh);

    // Peacock Neon Rings on Roof (旋轉孔雀七彩霓虹燈圈)
    const peacockGroup = new THREE.Group();
    peacockGroup.name = 'peacockNeon';
    peacockGroup.position.set(0, 3.4, 0);

    const neonColors = [0xff1744, 0x00e5ff, 0x76ff03, 0xffd600, 0xd500f9];
    neonColors.forEach((col, idx) => {
      const ringGeo = new THREE.TorusGeometry(0.4 + idx * 0.16, 0.03, 8, 24);
      const ringMat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      peacockGroup.add(ring);
    });
    group.add(peacockGroup);

    // Floating 3D Nitro Pickup Bottle ("結冰水")
    const bottleGroup = new THREE.Group();
    bottleGroup.name = 'nitroBottle';
    bottleGroup.position.set(2.4, 1.1, 0.5);

    // Frost blue water bottle
    const bottleGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.8, 12);
    const bottleMat = new THREE.MeshStandardMaterial({
      color: 0x40c4ff,
      roughness: 0.1,
      metalness: 0.5,
      transparent: true,
      opacity: 0.85,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.6
    });
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    bottleGroup.add(bottle);

    // Bottle cap
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.14, 10),
      new THREE.MeshStandardMaterial({ color: 0x0288d1 })
    );
    cap.position.y = 0.45;
    bottleGroup.add(cap);

    // Frost Glow Ring
    const glowRing = new THREE.Mesh(
      new THREE.RingGeometry(0.35, 0.5, 16),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    );
    glowRing.rotation.x = -Math.PI / 2;
    glowRing.position.y = -0.4;
    bottleGroup.add(glowRing);

    group.add(bottleGroup);

    return group;
  }

  // 21. Police DUI Breathalyzer Checkpoint (警察路檢酒測臨檢站)
  createPoliceCheckpoint() {
    const group = new THREE.Group();
    group.userData = { type: 'policeCheckpoint' };

    // Police Cruiser Car (白黑警車)
    const cruiser = new THREE.Group();
    cruiser.position.set(0, 0, 0);

    const bodyGeo = new THREE.BoxGeometry(2.1, 0.8, 4.4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
    const carBody = new THREE.Mesh(bodyGeo, bodyMat);
    carBody.position.y = 0.65;
    cruiser.add(carBody);

    // Black hood & trunk (黑白相間警車)
    const hood = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 0.05, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 })
    );
    hood.position.set(0, 1.06, 1.3);
    cruiser.add(hood);

    // Police Cruiser Cabin with tinted windows
    const cabGeo = new THREE.BoxGeometry(1.8, 0.65, 2.2);
    const cab = new THREE.Mesh(cabGeo, this.materials.glassTinted);
    cab.position.set(0, 1.35, -0.2);
    cruiser.add(cab);

    // Strobe Lightbar on roof (紅藍交替警示爆閃燈)
    const lightbar = new THREE.Group();
    lightbar.position.set(0, 1.75, -0.2);

    const barBase = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.1, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x212121, metalness: 0.9 })
    );
    lightbar.add(barBase);

    // Left Red Strobe
    const redStrobe = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.12, 0.22),
      new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xd50000, emissiveIntensity: 2.0 })
    );
    redStrobe.name = 'lightbarRed';
    redStrobe.position.set(-0.35, 0.05, 0);
    lightbar.add(redStrobe);

    // Right Blue Strobe
    const blueStrobe = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.12, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00b0ff, emissiveIntensity: 2.0 })
    );
    blueStrobe.name = 'lightbarBlue';
    blueStrobe.position.set(0.35, 0.05, 0);
    lightbar.add(blueStrobe);

    cruiser.add(lightbar);
    group.add(cruiser);

    // Police Officer NPC (執勤交警)
    const officer = new THREE.Group();
    officer.name = 'policeOfficer';
    officer.position.set(-2.5, 0, 1.0);

    // Body in Reflective Yellow Vest (螢光黃反光背心)
    const offBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.65, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xeeff41, emissive: 0xc6ff00, emissiveIntensity: 0.4 })
    );
    offBody.position.y = 1.05;
    officer.add(offBody);

    // Reflective white stripes
    const vestStripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.08, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 })
    );
    vestStripe.position.y = 1.15;
    officer.add(vestStripe);

    // Head with Police Cap
    const offHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), this.materials.skin);
    offHead.position.y = 1.48;
    officer.add(offHead);

    const offCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.18, 0.08, 12),
      new THREE.MeshStandardMaterial({ color: 0x1a237e })
    );
    offCap.position.y = 1.58;
    officer.add(offCap);

    // Arm with Waving Red LED Traffic Baton (揮舞紅色指揮棒)
    const armPivot = new THREE.Group();
    armPivot.name = 'batonArmPivot';
    armPivot.position.set(0.26, 1.25, 0);

    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.45, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x1a237e })
    );
    arm.position.y = -0.2;
    armPivot.add(arm);

    // Glowing Red LED Baton
    const baton = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8),
      new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xff1744, emissiveIntensity: 2.2 })
    );
    baton.name = 'trafficBaton';
    baton.position.set(0, -0.5, 0.2);
    baton.rotation.x = Math.PI / 4;
    armPivot.add(baton);

    officer.add(armPivot);
    group.add(officer);

    // Checkpoint Barricade (酒測臨檢 停車受檢 告示牌)
    const signTex = this.createTextTexture('酒測臨檢', '#d50000', '#ffffff', 32, '停車受檢 違者重罰');
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.9, 0.15),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.4 })
    );
    board.position.set(-2.5, 0.7, -1.0);
    group.add(board);

    // Barricade legs
    [-1.0, 1.0].forEach(bx => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8),
        new THREE.MeshStandardMaterial({ color: 0x424242 })
      );
      leg.position.set(-2.5 + bx, 0.45, -1.0);
      group.add(leg);
    });

    return group;
  }

  // 22. Taiwanese Street Tyrant Space Hog (路霸佔位器：破辦公椅 / 水泥油漆桶 / 盆栽陣)
  createStreetHogObstacle(type = 0) {
    const group = new THREE.Group();
    group.name = 'streetHog';

    if (type === 0) {
      // A. Broken Swivel Office Chair (破爛辦公椅 + 紅磚塊)
      const baseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.05, 5),
        new THREE.MeshStandardMaterial({ color: 0x212121 })
      );
      baseMesh.position.y = 0.08;
      group.add(baseMesh);

      // Gas lift pole
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8),
        this.materials.chrome
      );
      pole.position.y = 0.3;
      group.add(pole);

      // Seat cushion
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.1, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x424242, roughness: 0.9 })
      );
      seat.position.y = 0.55;
      group.add(seat);

      // Backrest
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.55, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.9 })
      );
      back.position.set(0, 0.85, -0.22);
      back.rotation.x = -0.08;
      group.add(back);

      // Red construction brick on seat ("請勿停車")
      const brick = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.12, 0.14),
        new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.95 })
      );
      brick.position.set(0, 0.65, 0);
      brick.rotation.y = 0.2;
      group.add(brick);

      // Cardboard sign "請勿停車" taped to back
      const signTex = this.createTextTexture('請勿停車', '#ffeb3b', '#d50000', 36, '佔位自用');
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.28, 0.02),
        new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.6 })
      );
      sign.position.set(0, 0.88, 0.06);
      group.add(sign);
    } else if (type === 1) {
      // B. Cement-Filled Paint Bucket with Warning Rebar (灌水泥油漆桶插鐵棍)
      const bucket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.2, 0.48, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
      );
      bucket.position.y = 0.24;
      group.add(bucket);

      // Cement surface inside bucket
      const cement = new THREE.Mesh(
        new THREE.CylinderGeometry(0.23, 0.23, 0.04, 12),
        new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.95 })
      );
      cement.position.y = 0.46;
      group.add(cement);

      // Rusty Rebar / Bamboo pole sticking up
      const rebar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 1.3, 8),
        new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.8 })
      );
      rebar.position.set(0, 0.9, 0);
      group.add(rebar);

      // Yellow caution ribbon waving at tip
      const ribbon = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.45, 0.25),
        new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.3 })
      );
      ribbon.position.set(0.12, 1.4, 0);
      ribbon.rotation.z = -0.3;
      group.add(ribbon);
    } else {
      // C. Clustered Potted Plants & Styrofoam Box (連環佔位保麗龍花盆)
      const styroBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.35, 0.45),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9 })
      );
      styroBox.position.set(-0.25, 0.18, 0);
      group.add(styroBox);

      // Soil & green leaves
      const soil = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.04, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 1.0 })
      );
      soil.position.set(-0.25, 0.34, 0);
      group.add(soil);

      const leafGroup = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.24, 1),
        new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 })
      );
      leafGroup.position.set(-0.25, 0.48, 0);
      group.add(leafGroup);

      // Ceramic flower pot beside it
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.16, 0.45, 10),
        new THREE.MeshStandardMaterial({ color: 0xd84315, roughness: 0.7 })
      );
      pot.position.set(0.35, 0.22, 0);
      group.add(pot);

      const plant = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.8 })
      );
      plant.position.set(0.35, 0.55, 0);
      group.add(plant);
    }

    return group;
  }

  // 23. Taiwanese Yellow Compactor Garbage Truck (清潔隊黃色垃圾車)
  createGarbageTruck() {
    const truck = new THREE.Group();
    truck.name = 'garbageTruck';

    // Yellow Truck Cab & Cabin
    const cabGeo = new THREE.BoxGeometry(2.3, 2.2, 2.4);
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffd600, roughness: 0.4 });
    const cab = new THREE.Mesh(cabGeo, yellowMat);
    cab.position.set(0, 1.4, 2.4);
    cab.castShadow = true;
    truck.add(cab);

    // Cab Windshield
    const glassGeo = new THREE.BoxGeometry(2.0, 1.0, 0.05);
    const windshield = new THREE.Mesh(glassGeo, this.materials.alphardGlass);
    windshield.position.set(0, 1.7, 3.62);
    truck.add(windshield);

    // Front Bumper with green/white diagonal stripes
    const bumper = new THREE.Mesh(
      new THREE.BoxGeometry(2.35, 0.4, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.5 })
    );
    bumper.position.set(0, 0.55, 3.65);
    truck.add(bumper);

    // Large Compactor Cargo Body (Rear)
    const compactorGeo = new THREE.BoxGeometry(2.4, 2.5, 4.6);
    const compactor = new THREE.Mesh(compactorGeo, yellowMat);
    compactor.position.set(0, 1.7, -1.1);
    compactor.castShadow = true;
    truck.add(compactor);

    // EPA Emblem Banner ("環境保護局 資源回收")
    const epaTex = this.createTextTexture('環境保護局', '#ffd600', '#1b5e20', 36, '資源回收 清潔隊');
    const epaSignL = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.85, 3.4),
      new THREE.MeshStandardMaterial({ map: epaTex, roughness: 0.4 })
    );
    epaSignL.position.set(-1.22, 1.8, -1.0);
    epaSignL.rotation.y = Math.PI / 2;
    truck.add(epaSignL);

    const epaSignR = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.85, 3.4),
      new THREE.MeshStandardMaterial({ map: epaTex, roughness: 0.4 })
    );
    epaSignR.position.set(1.22, 1.8, -1.0);
    epaSignR.rotation.y = -Math.PI / 2;
    truck.add(epaSignR);

    // Rear Hopper Door (後斗壓縮進料口)
    const hopper = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.4, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.7 })
    );
    hopper.position.set(0, 1.1, -3.5);
    truck.add(hopper);

    // Piled Blue Trash Bags inside hopper
    const bagMat = new THREE.MeshStandardMaterial({ color: 0x1976d2, roughness: 0.3 });
    [-0.5, 0, 0.5].forEach(bx => {
      const bag = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 1), bagMat);
      bag.position.set(bx, 1.1, -3.5);
      truck.add(bag);
    });

    // Roof Amber Emergency Rotating Beacons (黃色旋轉警示燈)
    const beaconL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.18, 10),
      new THREE.MeshStandardMaterial({ color: 0xff9100, emissive: 0xff9100, emissiveIntensity: 2.0 })
    );
    beaconL.position.set(-0.7, 2.6, 2.4);
    beaconL.name = 'garbageBeaconL';
    const beaconR = beaconL.clone();
    beaconR.position.x = 0.7;
    beaconR.name = 'garbageBeaconR';
    truck.add(beaconL, beaconR);

    // 6 Big Truck Wheels
    [-1.8, 0, 1.8].forEach(wz => {
      [-1.15, 1.15].forEach(wx => {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.44, 0.44, 0.3, 16),
          this.materials.tireRubber
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.44, wz);
        truck.add(wheel);
      });
    });

    return truck;
  }

  // 24. Taiwanese Taoist Temple Parade Sedan Chair & Firecrackers (宮廟迎神金轎 ＆ 滿地鞭炮)
  createTempleSedanChair() {
    const group = new THREE.Group();
    group.name = 'templeParade';

    // Wooden Carrying Poles (八抬大轎長竹槓 / 轎槓)
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 5.2, 8);
    poleGeo.rotateX(Math.PI / 2);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.6 });

    const poleL = new THREE.Mesh(poleGeo, poleMat);
    poleL.position.set(-0.75, 0.72, 0);
    const poleR = new THREE.Mesh(poleGeo, poleMat);
    poleR.position.set(0.75, 0.72, 0);
    group.add(poleL, poleR);

    // Central Ornate Golden Sedan Pavilion (金碧輝煌木雕神轎)
    const baseBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.8, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.4 })
    );
    baseBox.position.set(0, 0.8, 0);
    group.add(baseBox);

    // 4 Golden Corner Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.6, roughness: 0.2 });
    [-0.5, 0.5].forEach(px => {
      [-0.5, 0.5].forEach(pz => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), pillarMat);
        pillar.position.set(px, 1.6, pz);
        group.add(pillar);
      });
    });

    // Curved Traditional Temple Pavilion Roof (飛簷走壁廟宇屋頂)
    const roofGeo = new THREE.ConeGeometry(1.25, 0.75, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xff8f00, metalness: 0.4, roughness: 0.3 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 2.3, 0);
    group.add(roof);

    // Roof Top Golden Gourd Ornament (轎頂金葫蘆)
    const gourd = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), pillarMat);
    gourd.position.set(0, 2.8, 0);
    group.add(gourd);

    // RGB Flashing LED Fairy String Lights on Roof Edge (神轎七彩霓虹燈帶)
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 2.5
    });
    const ledGeo = new THREE.TorusGeometry(0.75, 0.04, 6, 16);
    ledGeo.rotateX(Math.PI / 2);
    const ledRing = new THREE.Mesh(ledGeo, ledMat);
    ledRing.name = 'sedanLeds';
    ledRing.position.set(0, 2.0, 0);
    group.add(ledRing);

    // Red Silk Tassels at 4 Corners (紅色轎角垂簾流蘇)
    [-0.55, 0.55].forEach(tx => {
      [-0.55, 0.55].forEach(tz => {
        const tassel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.06, 0.45, 6),
          new THREE.MeshStandardMaterial({ color: 0xd50000, roughness: 0.6 })
        );
        tassel.position.set(tx, 1.85, tz);
        group.add(tassel);
      });
    });

    // Floor Firecrackers Coils (一長串大紅連珠鞭炮鋪在地上)
    const crackerGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.16, 6);
    crackerGeo.rotateX(Math.PI / 2);
    const crackerMat = new THREE.MeshStandardMaterial({ color: 0xff1744, roughness: 0.5 });

    for (let c = -2.5; c <= 2.5; c += 0.35) {
      const cracker = new THREE.Mesh(crackerGeo, crackerMat);
      cracker.position.set(Math.sin(c * 2) * 0.4, 0.04, c);
      cracker.rotation.y = (Math.random() - 0.5) * 0.8;
      group.add(cracker);
    }

    return group;
  }

  // 25. Rival Multi-App Delivery Monkey NPC (外送員雙開搶單猴子)
  createRivalDeliveryMonkey() {
    const scooter = new THREE.Group();
    scooter.name = 'rivalMonkey';

    // Fluorescent Purple / Magenta Many 110 Body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x9c27b0,
      roughness: 0.25,
      metalness: 0.3
    });

    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.12, 1.15), this.materials.blackPlastic);
    deck.position.set(0, 0.35, 0);
    scooter.add(deck);

    const cowl = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.62, 0.42), bodyMat);
    cowl.position.set(0, 0.72, 0.5);
    cowl.rotation.x = -0.22;
    scooter.add(cowl);

    // Front Headlight with angry purple eye tint
    const light = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.14, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 1.5 })
    );
    light.position.set(0, 0.75, 0.72);
    light.rotation.x = -0.22;
    scooter.add(light);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.12, 14);
    wheelGeo.rotateZ(Math.PI / 2);
    const fw = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
    fw.position.set(0, 0.22, 0.68);
    const rw = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
    rw.position.set(0, 0.22, -0.58);
    scooter.add(fw, rw);

    // Seat
    const seatBody = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.8), bodyMat);
    seatBody.position.set(0, 0.58, -0.25);
    const seatCushion = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.75), this.materials.blackPlastic);
    seatCushion.position.set(0, 0.76, -0.25);
    scooter.add(seatBody, seatCushion);

    // Direct Flow Loud Exhaust Pipe (改裝直通管，無消音塞)
    const exh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.065, 0.7, 8),
      new THREE.MeshStandardMaterial({ color: 0x7c4dff, metalness: 0.8, roughness: 0.2 })
    );
    exh.rotation.x = Math.PI / 2;
    exh.position.set(0.26, 0.24, -0.42);
    exh.rotation.y = -0.2;
    scooter.add(exh);

    // Handlebar with Array of 3 Glowing Smartphone Mounts (3 支手機架同時搶單)
    const bar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.72, 8),
      this.materials.blackPlastic
    );
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 0.95, 0.42);
    scooter.add(bar);

    const phoneMat = new THREE.MeshStandardMaterial({
      color: 0x00e676,
      emissive: 0x00e676,
      emissiveIntensity: 2.2
    });

    [-0.22, 0, 0.22].forEach((px, idx) => {
      const phoneMount = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.16, 0.02),
        phoneMat
      );
      phoneMount.name = `monkeyPhone${idx + 1}`;
      phoneMount.position.set(px, 1.05, 0.44);
      phoneMount.rotation.x = 0.4;
      scooter.add(phoneMount);
    });

    // Rider: Tank top, backward cap
    const rider = new THREE.Group();
    rider.name = 'monkeyRider';

    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.55, 0.24),
      new THREE.MeshStandardMaterial({ color: 0x212121 }) // black tank top
    );
    torso.position.set(0, 1.15, -0.15);
    torso.rotation.x = 0.25; // aggressive racing crouch forward
    rider.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), this.materials.skin);
    head.position.set(0, 1.52, -0.05);
    rider.add(head);

    // Backward baseball cap
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.08, 10),
      new THREE.MeshStandardMaterial({ color: 0xff1744 })
    );
    cap.position.set(0, 1.6, -0.05);
    rider.add(cap);

    const brim = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.02, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xff1744 })
    );
    brim.position.set(0, 1.6, -0.16); // facing backward
    rider.add(brim);

    scooter.add(rider);

    // Dual-App Oversized Rear Delivery Box (「雙開外送神人」大保溫箱)
    const boxTex = this.createTextTexture('雙開搶單', '#ff3d00', '#ffffff', 32, '★ 秒殺接單 ★');
    const rearBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.48, 0.52),
      new THREE.MeshStandardMaterial({ map: boxTex, roughness: 0.4 })
    );
    rearBox.position.set(0, 1.0, -0.58);
    scooter.add(rearBox);

    return scooter;
  }

  // 26. Night Market Mobile Pushcart Stalls (夜市特色攤販：香腸/地瓜球/鹽酥雞)
  createNightMarketStall(type = 0) {
    const stall = new THREE.Group();
    stall.name = 'marketStall';

    // Stainless Steel Pushcart Counter (白鐵行動攤車身)
    const cartBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.85, 1.0),
      new THREE.MeshStandardMaterial({ color: 0xb0bec5, metalness: 0.6, roughness: 0.3 })
    );
    cartBody.position.y = 0.55;
    stall.add(cartBody);

    // 4 Small Cart Wheels
    [-0.7, 0.7].forEach(wx => {
      [-0.45, 0.45].forEach(wz => {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.06, 10),
          this.materials.tireRubber
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.12, wz);
        stall.add(wheel);
      });
    });

    if (type === 0) {
      // A. Grilled Taiwanese Sausage with Dice Gambling Bowl (炭烤香腸攤 ＆ 十八仔骰子)
      const bannerTex = this.createTextTexture('炭烤香腸', '#d50000', '#ffeb3b', 36, '純手工 高粱酒');
      const signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.45, 0.04),
        new THREE.MeshStandardMaterial({ map: bannerTex })
      );
      signBoard.position.set(0, 1.25, 0.5);
      stall.add(signBoard);

      // Charcoal Grill Basin
      const grill = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.15, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.8 })
      );
      grill.position.set(-0.25, 1.05, 0);
      stall.add(grill);

      // Glowing charcoal embers
      const coal = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.04, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xff3d00, emissive: 0xff1744, emissiveIntensity: 2.0 })
      );
      coal.position.set(-0.25, 1.12, 0);
      stall.add(coal);

      // Big Porcelain Dice Bowl (十八仔大碗公)
      const bowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.1, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
      );
      bowl.position.set(0.5, 1.05, 0);
      stall.add(bowl);

      // Traditional Big Red Night Market Umbrella (傳統大紅雨傘)
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0, 8), this.materials.chrome);
      pole.position.set(0.65, 1.5, -0.35);
      stall.add(pole);

      const umbrella = new THREE.Mesh(
        new THREE.ConeGeometry(1.1, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0xd50000, roughness: 0.5 })
      );
      umbrella.position.set(0.65, 2.5, -0.35);
      stall.add(umbrella);
    } else {
      // B. Golden Sweet Potato Balls Stall (正宗酥脆黑糖地瓜球攤)
      const bannerTex = this.createTextTexture('現炸地瓜球', '#ff8f00', '#ffffff', 34, '大包50 小包30');
      const signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.45, 0.04),
        new THREE.MeshStandardMaterial({ map: bannerTex })
      );
      signBoard.position.set(0, 1.25, 0.5);
      stall.add(signBoard);

      // Giant Round Iron Frying Wok (大鐵鍋)
      const wok = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.25, 0.22, 16),
        new THREE.MeshStandardMaterial({ color: 0x212121, metalness: 0.7, roughness: 0.4 })
      );
      wok.position.set(0, 1.08, 0);
      stall.add(wok);

      // Piled Golden & Purple Sweet Potato Balls (金黃與紫色地瓜球)
      const ballMatGold = new THREE.MeshStandardMaterial({ color: 0xffb300, roughness: 0.3 });
      const ballMatPurple = new THREE.MeshStandardMaterial({ color: 0x8e24aa, roughness: 0.3 });
      for (let b = 0; b < 12; b++) {
        const ball = new THREE.Mesh(
          new THREE.SphereGeometry(0.065, 8, 8),
          b % 2 === 0 ? ballMatGold : ballMatPurple
        );
        ball.position.set(
          (Math.random() - 0.5) * 0.45,
          1.18 + Math.random() * 0.1,
          (Math.random() - 0.5) * 0.35
        );
        stall.add(ball);
      }
    }

    return stall;
  }

  // 27. Pink Supercar Mazu Procession Palanquin (大甲/白沙屯媽祖「粉紅超跑」神轎隊伍)
  createPinkSupercarMazu() {
    const mazuGroup = new THREE.Group();
    mazuGroup.name = 'pinkSupercarMazu';

    // 1. Golden Carrying Poles (兩根長長金黃抬轎木桿)
    const poleGeo = new THREE.CylinderGeometry(0.045, 0.045, 4.4, 12);
    poleGeo.rotateX(Math.PI / 2);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xffca28, roughness: 0.3, metalness: 0.4 });
    [-0.65, 0.65].forEach(px => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(px, 0.95, 0);
      mazuGroup.add(pole);
    });

    // 2. Palanquin Wooden Base Frame
    const baseGeo = new THREE.BoxGeometry(1.0, 0.2, 1.2);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.7 });
    const pBase = new THREE.Mesh(baseGeo, baseMat);
    pBase.position.set(0, 0.9, 0);
    mazuGroup.add(pBase);

    // 3. Four Golden Dragon Pillars (四根金龍轎柱)
    const pillarGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.95, 10);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.6, roughness: 0.2 });
    [
      [-0.42, -0.5], [0.42, -0.5],
      [-0.42, 0.5], [0.42, 0.5]
    ].forEach(([cx, cz]) => {
      const pillar = new THREE.Mesh(pillarGeo, goldMat);
      pillar.position.set(cx, 1.45, cz);
      mazuGroup.add(pillar);
    });

    // 4. Iconic Fluorescent Pink Supercar Roof Canopy (粉紅超跑專屬招牌桃粉紅遮雨簾屋頂)
    const pinkMat = new THREE.MeshStandardMaterial({
      color: 0xff4081,
      roughness: 0.35,
      emissive: 0xf50057,
      emissiveIntensity: 0.35
    });
    const roofGeo = new THREE.ConeGeometry(0.85, 0.55, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, pinkMat);
    roof.position.set(0, 2.15, 0);
    mazuGroup.add(roof);

    // Golden Lotus Crown Finial on top (轎頂金色葫蘆/蓮花寶頂)
    const crownGeo = new THREE.SphereGeometry(0.12, 10, 10);
    const crown = new THREE.Mesh(crownGeo, goldMat);
    crown.position.set(0, 2.5, 0);
    mazuGroup.add(crown);

    // Pink Curtains (粉紅簾布)
    const curtainGeo = new THREE.BoxGeometry(0.92, 0.65, 0.03);
    const curtainF = new THREE.Mesh(curtainGeo, pinkMat);
    curtainF.position.set(0, 1.45, 0.52);
    mazuGroup.add(curtainF);

    const curtainB = new THREE.Mesh(curtainGeo, pinkMat);
    curtainB.position.set(0, 1.45, -0.52);
    mazuGroup.add(curtainB);

    // Temple Banner Sign (拱天宮 / 鎮瀾宮粉紅超跑布條)
    const bannerTex = this.createTextTexture('粉紅超跑', '#ff4081', '#ffffff', 32, '★ 媽祖保庇 ★');
    const bannerSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.3, 0.04),
      new THREE.MeshStandardMaterial({ map: bannerTex })
    );
    bannerSign.position.set(0, 1.85, 0.53);
    mazuGroup.add(bannerSign);

    // 5. Four Palanquin Bearers / Runners (四名穿著橘帽黃衣的轎班抬轎勇士)
    const orangeCapMat = new THREE.MeshStandardMaterial({ color: 0xff6d00, roughness: 0.6 });
    const yellowVestMat = new THREE.MeshStandardMaterial({ color: 0xffd600, roughness: 0.5 });
    const bluePantsMat = new THREE.MeshStandardMaterial({ color: 0x1565c0, roughness: 0.7 });

    const bearerPositions = [
      [-0.65, 1.5], [0.65, 1.5],   // Front runners
      [-0.65, -1.5], [0.65, -1.5]  // Rear runners
    ];

    bearerPositions.forEach(([bx, bz]) => {
      const bearer = new THREE.Group();
      bearer.name = 'mazuBearer';

      // Head with orange pilgrim cap
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), this.materials.skin);
      head.position.y = 1.35;
      bearer.add(head);

      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.14, 8), orangeCapMat);
      cap.position.y = 1.46;
      bearer.add(cap);

      // Torso in yellow devotional vest
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.45, 0.22), yellowVestMat);
      torso.position.y = 1.05;
      bearer.add(torso);

      // Legs in blue pants
      const legs = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.6, 0.2), bluePantsMat);
      legs.position.y = 0.45;
      bearer.add(legs);

      bearer.position.set(bx, 0, bz);
      mazuGroup.add(bearer);
    });

    // 6. Holy Golden Aura Ring (金光閃閃神明光環)
    const haloGeo = new THREE.TorusGeometry(0.7, 0.035, 8, 24);
    haloGeo.rotateX(Math.PI / 2);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 2.55, 0);
    halo.name = 'mazuHalo';
    mazuGroup.add(halo);

    return mazuGroup;
  }

  // 28. Authentic Taiwanese Pedestrian on Crosswalk (行人地獄斑馬線行人)
  createPedestrian(type = 0) {
    const ped = new THREE.Group();
    ped.name = 'pedestrian';

    // 1. Legs (Animated walking pivots)
    const legGeo = new THREE.BoxGeometry(0.14, 0.65, 0.16);
    const legMat = type === 0
      ? new THREE.MeshStandardMaterial({ color: 0xf5cda8, roughness: 0.6 }) // Skirt legs
      : (type === 1
        ? new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.8 }) // Slacks
        : new THREE.MeshStandardMaterial({ color: 0xf5cda8, roughness: 0.6 })); // Shorts

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.12, 0.65, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, legMat);
    leftLegMesh.position.y = -0.32;
    leftLeg.add(leftLegMesh);
    ped.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.12, 0.65, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, legMat);
    rightLegMesh.position.y = -0.32;
    rightLeg.add(rightLegMesh);
    ped.add(rightLeg);

    // 2. Torso & Upper Body
    let torsoMat;
    if (type === 0) {
      torsoMat = new THREE.MeshStandardMaterial({ color: 0xe91e63, roughness: 0.5 }); // Pink floral dress
    } else if (type === 1) {
      torsoMat = new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.7 }); // Elderly cardigan
    } else {
      torsoMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }); // White tank top
    }

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.55, 0.24), torsoMat);
    torso.position.y = 1.05;
    ped.add(torso);

    // 3. Head & Hair/Hats
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), this.materials.skin);
    head.position.y = 1.45;
    ped.add(head);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.1, 0.5, 0.12);
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.25, 1.25, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, this.materials.skin);
    leftArmMesh.position.y = -0.22;
    leftArm.add(leftArmMesh);
    ped.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.25, 1.25, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, this.materials.skin);
    rightArmMesh.position.y = -0.22;
    rightArm.add(rightArmMesh);
    ped.add(rightArm);

    // Type-specific Props & Aesthetics
    if (type === 0) {
      // Umbrella Auntie (撐抗UV花陽傘阿姨)
      const umbrellaPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.85, 6),
        this.materials.chrome
      );
      umbrellaPole.position.set(0.28, 1.45, 0.1);
      ped.add(umbrellaPole);

      const canopy = new THREE.Mesh(
        new THREE.ConeGeometry(0.65, 0.28, 12),
        new THREE.MeshStandardMaterial({ color: 0xab47bc, roughness: 0.35 })
      );
      canopy.position.set(0.28, 1.9, 0.1);
      ped.add(canopy);

      // Tote shopping bag on left arm
      const bag = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.28, 0.22),
        new THREE.MeshStandardMaterial({ color: 0xffca28, roughness: 0.4 })
      );
      bag.position.set(-0.28, 0.92, 0);
      ped.add(bag);
    } else if (type === 1) {
      // Elder with Walker / Shopping Pushcart (推菜籃助行車阿公)
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.17, 0.06, 8),
        new THREE.MeshStandardMaterial({ color: 0x4e342e })
      );
      cap.position.y = 1.58;
      ped.add(cap);

      // Pushcart Frame
      const cart = new THREE.Group();
      cart.position.set(0, 0, 0.55);

      const frameMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, metalness: 0.7, roughness: 0.3 });
      // Handles
      const hBar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.42, 6), frameMat);
      hBar.rotation.z = Math.PI / 2;
      hBar.position.y = 0.95;
      cart.add(hBar);

      // Vertical legs
      [-0.18, 0.18].forEach(cx => {
        const cLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.85, 6), frameMat);
        cLeg.position.set(cx, 0.5, 0);
        cart.add(cLeg);
      });

      // Basket
      const basket = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.35, 0.38),
        new THREE.MeshStandardMaterial({ color: 0x2e7d32, wireframe: false, roughness: 0.6 })
      );
      basket.position.set(0, 0.45, 0.1);
      cart.add(basket);

      // White Daikon Radish in basket
      const radish = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.06, 0.35, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
      );
      radish.rotation.z = 0.4;
      radish.position.set(0.06, 0.6, 0.1);
      cart.add(radish);

      ped.add(cart);
    } else {
      // Uncle walking Shiba Inu Dog (吊嘎海灘褲牽柴犬阿伯)
      // Dog
      const dog = new THREE.Group();
      dog.position.set(0.7, 0, 0.3);

      const dogMat = new THREE.MeshStandardMaterial({ color: 0xd97724, roughness: 0.8 }); // Shiba golden tan
      const dogBody = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.48), dogMat);
      dogBody.position.y = 0.28;
      dog.add(dogBody);

      // Dog Head
      const dogHead = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.2), dogMat);
      dogHead.position.set(0, 0.42, 0.26);
      dog.add(dogHead);

      // Dog Ears
      [-0.06, 0.06].forEach(ex => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 4), dogMat);
        ear.position.set(ex, 0.53, 0.26);
        dog.add(ear);
      });

      // Dog Curled Tail
      const tail = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.025, 4, 8), dogMat);
      tail.position.set(0, 0.42, -0.25);
      tail.rotation.x = Math.PI / 2;
      dog.add(tail);

      // Dog Legs
      const dLegGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.22, 6);
      [[-0.08, 0.15], [0.08, 0.15], [-0.08, -0.15], [0.08, -0.15]].forEach(([lx, lz]) => {
        const dLeg = new THREE.Mesh(dLegGeo, dogMat);
        dLeg.position.set(lx, 0.11, lz);
        dog.add(dLeg);
      });

      ped.add(dog);

      // Leash (Tension line from hand to collar)
      const leash = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.85, 4),
        new THREE.MeshBasicMaterial({ color: 0xd50000 })
      );
      leash.position.set(0.48, 0.65, 0.18);
      leash.rotation.z = -0.7;
      ped.add(leash);
    }

    ped.userData = {
      type,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
      walkPhase: Math.random() * Math.PI * 2
    };

    return ped;
  }

  // 29. High-Speed Police Pursuit Patrol Cruiser (高速巡邏追捕警車)
  createPolicePatrolCar() {
    const cruiser = new THREE.Group();
    cruiser.name = 'policePatrolCruiser';

    // Sedan Main Chassis (White body)
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.2 });
    const carBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.75, 4.4), bodyMat);
    carBody.position.y = 0.65;
    cruiser.add(carBody);

    // Black Painted Doors & Bumpers (台灣黑白相間警車)
    const blackPaintMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 });
    const hood = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.05, 1.4), blackPaintMat);
    hood.position.set(0, 1.04, 1.35);
    cruiser.add(hood);

    const trunk = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.05, 1.0), blackPaintMat);
    trunk.position.set(0, 1.04, -1.55);
    cruiser.add(trunk);

    // Front Bumper with Heavy-Duty Push Bar
    const bumper = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.4, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 })
    );
    bumper.position.set(0, 0.5, 2.25);
    cruiser.add(bumper);

    const pushBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.35, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.9 })
    );
    pushBar.position.set(0, 0.68, 2.42);
    cruiser.add(pushBar);

    // Cabin Glass
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.82, 0.62, 2.2),
      this.materials.glassTinted
    );
    cabin.position.set(0, 1.32, -0.15);
    cruiser.add(cabin);

    // High-Intensity Aerodynamic Strobe Lightbar on roof
    const lightbar = new THREE.Group();
    lightbar.position.set(0, 1.72, -0.15);

    const barFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.08, 0.24),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9 })
    );
    lightbar.add(barFrame);

    const redStrobe = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.12, 0.22),
      new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xd50000, emissiveIntensity: 2.2 })
    );
    redStrobe.name = 'lightbarRed';
    redStrobe.position.set(-0.35, 0.05, 0);
    lightbar.add(redStrobe);

    const blueStrobe = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.12, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x00b0ff, emissiveIntensity: 2.2 })
    );
    blueStrobe.name = 'lightbarBlue';
    blueStrobe.position.set(0.35, 0.05, 0);
    lightbar.add(blueStrobe);

    cruiser.add(lightbar);

    // Taiwanese Police Decal ("交通警察")
    const policeTex = this.createTextTexture('交通警察', '#ffffff', '#1b5e20', 36, 'POLICE 01');
    const decalMat = new THREE.MeshStandardMaterial({ map: policeTex, roughness: 0.3 });
    [-1.06, 1.06].forEach((dx, idx) => {
      const decal = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.38), decalMat);
      decal.position.set(dx, 0.72, -0.2);
      decal.rotation.y = idx === 0 ? -Math.PI / 2 : Math.PI / 2;
      cruiser.add(decal);
    });

    // 4 Wheels
    const wheelMat = this.materials.tireRubber;
    [[-0.98, 1.3], [0.98, 1.3], [-0.98, -1.3], [0.98, -1.3]].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 12), wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.34, wz);
      cruiser.add(wheel);
    });

    cruiser.userData = {
      lightbarRed: redStrobe,
      lightbarBlue: blueStrobe,
      strobeTimer: 0
    };

    return cruiser;
  }

  // 30. Authentic Taiwanese Countdown Traffic Signal Pole (99秒超長倒數紅綠燈桿)
  createTrafficSignalPole(streetName = '中正路') {
    const poleGroup = new THREE.Group();
    poleGroup.name = 'trafficSignalPole';

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x455a64, metalness: 0.8, roughness: 0.3 });

    // Vertical Mast Pole (5.8m tall)
    const vertPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 5.8, 12), steelMat);
    vertPole.position.y = 2.9;
    poleGroup.add(vertPole);

    // Cantilever Horizontal Mast Arm (Overhanging across traffic lanes)
    const armGeo = new THREE.CylinderGeometry(0.09, 0.11, 4.6, 12);
    armGeo.rotateZ(Math.PI / 2);
    const arm = new THREE.Mesh(armGeo, steelMat);
    arm.position.set(2.3, 5.4, 0);
    poleGroup.add(arm);

    // Diagonal support strut
    const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
    strutGeo.rotateZ(Math.PI / 4);
    const strut = new THREE.Mesh(strutGeo, steelMat);
    strut.position.set(0.65, 4.75, 0);
    poleGroup.add(strut);

    // 3-Aspect Traffic Signal Head Box
    const boxGeo = new THREE.BoxGeometry(1.6, 0.6, 0.35);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.5 });
    const headBox = new THREE.Mesh(boxGeo, boxMat);
    headBox.position.set(2.6, 5.3, 0);
    poleGroup.add(headBox);

    // Three Lights: Red, Yellow, Green
    const redLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xd50000, emissive: 0xff1744, emissiveIntensity: 2.2 })
    );
    redLight.position.set(2.1, 5.3, 0.16);
    poleGroup.add(redLight);

    const yellowLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x332200, emissive: 0x000000, emissiveIntensity: 0.1 })
    );
    yellowLight.position.set(2.6, 5.3, 0.16);
    poleGroup.add(yellowLight);

    const greenLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x003311, emissive: 0x000000, emissiveIntensity: 0.1 })
    );
    greenLight.position.set(3.1, 5.3, 0.16);
    poleGroup.add(greenLight);

    // Digital 7-Segment Countdown Timer Box beside lights
    const timerBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.6, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6 })
    );
    timerBox.position.set(3.8, 5.3, 0);
    poleGroup.add(timerBox);

    // Dynamic 2D Canvas for Countdown Number
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#ff1744';
    ctx.font = 'bold 84px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('99', 64, 64);

    const timerTex = new THREE.CanvasTexture(canvas);
    const timerMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.52),
      new THREE.MeshBasicMaterial({ map: timerTex })
    );
    timerMesh.position.set(3.8, 5.3, 0.18);
    poleGroup.add(timerMesh);

    // Street Name Banner Sign (e.g. "中正路")
    const signTex = this.createTextTexture(streetName, '#00e5ff', '#ffffff', 36, 'ZHONGZHENG RD');
    const streetSign = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.45),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.4 })
    );
    streetSign.position.set(2.6, 4.65, 0.05);
    poleGroup.add(streetSign);

    poleGroup.userData = {
      redLight,
      yellowLight,
      greenLight,
      timerCanvas: canvas,
      timerCtx: ctx,
      timerTex,
      timerMesh,
      updateSignal: (seconds, state) => {
        // state: 'RED', 'YELLOW', 'GREEN'
        if (state === 'RED') {
          redLight.material.emissive.setHex(0xff1744);
          redLight.material.emissiveIntensity = 2.4;
          yellowLight.material.emissive.setHex(0x000000);
          yellowLight.material.emissiveIntensity = 0.1;
          greenLight.material.emissive.setHex(0x000000);
          greenLight.material.emissiveIntensity = 0.1;
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(0, 0, 128, 128);
          ctx.fillStyle = seconds <= 3 ? '#ffea00' : '#ff1744';
          ctx.fillText(String(Math.max(1, Math.floor(seconds))).padStart(2, '0'), 64, 64);
        } else if (state === 'YELLOW') {
          redLight.material.emissive.setHex(0x000000);
          redLight.material.emissiveIntensity = 0.1;
          yellowLight.material.emissive.setHex(0xffea00);
          yellowLight.material.emissiveIntensity = 2.5;
          greenLight.material.emissive.setHex(0x000000);
          greenLight.material.emissiveIntensity = 0.1;
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(0, 0, 128, 128);
          ctx.fillStyle = '#ffea00';
          ctx.fillText(String(Math.max(1, Math.floor(seconds))).padStart(2, '0'), 64, 64);
        } else {
          redLight.material.emissive.setHex(0x000000);
          redLight.material.emissiveIntensity = 0.1;
          yellowLight.material.emissive.setHex(0x000000);
          yellowLight.material.emissiveIntensity = 0.1;
          greenLight.material.emissive.setHex(0x00e676);
          greenLight.material.emissiveIntensity = 2.4;
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(0, 0, 128, 128);
          ctx.fillStyle = '#00e676';
          ctx.fillText(String(Math.max(1, Math.floor(seconds))).padStart(2, '0'), 64, 64);
        }
        timerTex.needsUpdate = true;
      }
    };

    return poleGroup;
  }

  // 31. Tainan Dongmen Roundabout Central Island (台南東門圓環綠島與七路放射指標)
  createTainanRoundaboutCenter() {
    const roundabout = new THREE.Group();
    roundabout.name = 'tainanRoundabout';

    // Circular Curb Raised Island
    const curbGeo = new THREE.CylinderGeometry(5.0, 5.2, 0.45, 32);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: 0.8 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.y = 0.22;
    roundabout.add(curb);

    // Green Grass Mound
    const grassGeo = new THREE.CylinderGeometry(4.75, 4.85, 0.2, 32);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.75 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.position.y = 0.45;
    roundabout.add(grass);

    // Central Banyan Tree / Tropical Palm Canopy
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.45, 4.2, 10),
      new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9 })
    );
    trunk.position.y = 2.4;
    roundabout.add(trunk);

    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.7 });
    [
      [0, 4.8, 0, 1.8],
      [-0.8, 4.5, 0.6, 1.4],
      [0.8, 4.4, -0.7, 1.4],
      [0.6, 4.6, 0.8, 1.3]
    ].forEach(([fx, fy, fz, fr]) => {
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(fr, 1), foliageMat);
      foliage.position.set(fx, fy, fz);
      roundabout.add(foliage);
    });

    // Historic Stone Monument: "台南東門圓環"
    const obeliskGeo = new THREE.BoxGeometry(0.9, 2.2, 0.6);
    const obeliskMat = new THREE.MeshStandardMaterial({ color: 0xbdbdbd, roughness: 0.85 });
    const obelisk = new THREE.Mesh(obeliskGeo, obeliskMat);
    obelisk.position.set(0, 1.5, 1.8);
    roundabout.add(obelisk);

    const monTex = this.createTextTexture('東門圓環', '#795548', '#ffffff', 32, '台南歷史地標');
    const monSign = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), new THREE.MeshBasicMaterial({ map: monTex }));
    monSign.position.set(0, 1.6, 2.12);
    roundabout.add(monSign);

    // 6 Radial Guide Signs (六向放射出口路標)
    const exits = [
      { name: '府前路一段', angle: 0 },
      { name: '北門路一段', angle: Math.PI / 3 },
      { name: '青年路', angle: (2 * Math.PI) / 3 },
      { name: '東門路一段', angle: Math.PI },
      { name: '開山路', angle: (4 * Math.PI) / 3 },
      { name: '大同路一段', angle: (5 * Math.PI) / 3 }
    ];

    exits.forEach(ex => {
      const gantry = new THREE.Group();
      gantry.rotation.y = ex.angle;

      const pPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8), this.materials.chrome);
      pPost.position.set(3.8, 1.4, 0);
      gantry.add(pPost);

      const eSignTex = this.createTextTexture(ex.name, '#0277bd', '#ffffff', 28, '出口 EX');
      const eSign = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.4), new THREE.MeshStandardMaterial({ map: eSignTex }));
      eSign.position.set(3.8, 2.5, 0);
      eSign.rotation.y = Math.PI / 2;
      gantry.add(eSign);

      roundabout.add(gantry);
    });

    return roundabout;
  }

  // 32. Taiwanese Roadside Banquet (廟口路邊辦桌流水席紅圓桌路障與飛散龍蝦冷盤)
  createRoadsideBanquet() {
    const banquet = new THREE.Group();
    banquet.name = 'roadsideBanquet';

    // 1. Semi-transparent Striped Canopy Tent (桃紅與天空藍相間條紋塑膠大棚架)
    const tentWidth = 4.6;
    const tentLength = 6.2;
    const tentHeight = 2.9;

    // Galvanized tubular steel legs
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, tentHeight, 8);
    const poleMat = this.materials.chrome;
    [
      [-tentWidth / 2, tentHeight / 2, -tentLength / 2],
      [tentWidth / 2, tentHeight / 2, -tentLength / 2],
      [-tentWidth / 2, tentHeight / 2, tentLength / 2],
      [tentWidth / 2, tentHeight / 2, tentLength / 2]
    ].forEach(([px, py, pz]) => {
      const p = new THREE.Mesh(poleGeo, poleMat);
      p.position.set(px, py, pz);
      banquet.add(p);
    });

    // Striped Canvas Canopy Roof
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-tentWidth / 2 - 0.2, 0);
    roofShape.lineTo(0, 0.75);
    roofShape.lineTo(tentWidth / 2 + 0.2, 0);
    roofShape.lineTo(tentWidth / 2 + 0.15, -0.2);
    roofShape.lineTo(-tentWidth / 2 - 0.15, -0.2);
    roofShape.closePath();

    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: tentLength + 0.4, bevelEnabled: false });
    roofGeo.translate(0, tentHeight, -(tentLength + 0.4) / 2);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0xff4081,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    banquet.add(roof);

    // Cyan blue accent stripes along the canopy
    const stripeGeo = new THREE.BoxGeometry(tentWidth + 0.5, 0.08, 0.4);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    [-tentLength / 3, 0, tentLength / 3].forEach(sz => {
      const str = new THREE.Mesh(stripeGeo, stripeMat);
      str.position.set(0, tentHeight + 0.38, sz);
      banquet.add(str);
    });

    // Hanging Festive Red Lanterns (大紅燈籠)
    const lanternMat = new THREE.MeshStandardMaterial({ color: 0xd50000, roughness: 0.4, emissive: 0xd50000, emissiveIntensity: 0.3 });
    [-tentWidth / 2, tentWidth / 2].forEach(lx => {
      [-tentLength / 2, 0, tentLength / 2].forEach(lz => {
        const lant = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), lanternMat);
        lant.position.set(lx, tentHeight - 0.2, lz);
        banquet.add(lant);
      });
    });

    const dynamicProps = [];

    // Helper for Red Plastic Round Stool (紅色塑膠圓凳)
    const createStool = (x, z) => {
      const stoolGroup = new THREE.Group();
      stoolGroup.position.set(x, 0, z);

      const seatMat = new THREE.MeshStandardMaterial({ color: 0xd50000, roughness: 0.3 });
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 12), seatMat);
      seat.position.y = 0.45;
      stoolGroup.add(seat);

      // 4 Tapered legs
      const legGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.45, 6);
      [
        [-0.1, 0.22, -0.1],
        [0.1, 0.22, -0.1],
        [-0.1, 0.22, 0.1],
        [0.1, 0.22, 0.1]
      ].forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(legGeo, seatMat);
        leg.position.set(lx, ly, lz);
        stoolGroup.add(leg);
      });

      banquet.add(stoolGroup);
      dynamicProps.push({ obj: stoolGroup, initPos: new THREE.Vector3(x, 0, z), rot: 0, isStool: true });
    };

    // Helper for Foldable Big Red Table (經典大紅圓桌與酒席名菜)
    const createTable = (cx, cz, isFirstTable) => {
      const tableGroup = new THREE.Group();
      tableGroup.position.set(cx, 0, cz);

      // Red round tabletop
      const topGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.06, 24);
      const topMat = new THREE.MeshStandardMaterial({ color: 0xb71c1c, roughness: 0.25, metalness: 0.1 });
      const tableTop = new THREE.Mesh(topGeo, topMat);
      tableTop.position.y = 0.75;
      tableGroup.add(tableTop);

      // Metal folding legs
      const standGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.75, 8);
      const standMat = this.materials.chrome;
      const leg1 = new THREE.Mesh(standGeo, standMat);
      leg1.position.set(-0.25, 0.375, 0);
      leg1.rotation.z = 0.25;
      tableGroup.add(leg1);

      const leg2 = new THREE.Mesh(standGeo, standMat);
      leg2.position.set(0.25, 0.375, 0);
      leg2.rotation.z = -0.25;
      tableGroup.add(leg2);

      // Feast Dishes on Table
      // 1. Lobster Cold Platter (龍蝦沙拉冷盤大拼盤)
      const platter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.32, 0.03, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
      );
      platter.position.set(0, 0.8, 0);
      tableGroup.add(platter);

      // Lobster Meat Pieces (橘紅色龍蝦肉球)
      const lobsterMat = new THREE.MeshStandardMaterial({ color: 0xff5722, roughness: 0.4 });
      for (let i = 0; i < 5; i++) {
        const lob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), lobsterMat);
        const ang = (i * Math.PI * 2) / 5;
        lob.position.set(Math.cos(ang) * 0.16, 0.83, Math.sin(ang) * 0.16);
        tableGroup.add(lob);
      }

      // 2. Red Crab Sticky Rice Steamer (紅蟳米糕竹蒸籠)
      const steamerMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.8 });
      const steamer = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12), steamerMat);
      steamer.position.set(0.42, 0.82, -0.2);
      tableGroup.add(steamer);

      const crabShell = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xd84315 })
      );
      crabShell.position.set(0.42, 0.88, -0.2);
      crabShell.scale.set(1.4, 0.5, 1.1);
      tableGroup.add(crabShell);

      // 3. Black-Bone Chicken Soup Pot (烏骨雞湯陶瓷深盅)
      const soupPotMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.3 });
      const soupPot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.14, 12), soupPotMat);
      soupPot.position.set(-0.38, 0.84, 0.22);
      tableGroup.add(soupPot);

      // Disposable red plastic bowls & chopsticks
      const bowlMat = new THREE.MeshStandardMaterial({ color: 0xff1744 });
      for (let b = 0; b < 6; b++) {
        const ang = (b * Math.PI * 2) / 6;
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.04, 0.04, 8), bowlMat);
        bowl.position.set(Math.cos(ang) * 0.65, 0.8, Math.sin(ang) * 0.65);
        tableGroup.add(bowl);
      }

      banquet.add(tableGroup);
      dynamicProps.push({ obj: tableGroup, initPos: new THREE.Vector3(cx, 0, cz), rot: 0, isTable: true });

      // Surrounding Red Stools
      for (let s = 0; s < 5; s++) {
        const ang = (s * Math.PI * 2) / 5;
        createStool(cx + Math.cos(ang) * 1.15, cz + Math.sin(ang) * 1.15);
      }
    };

    // Table 1 & Table 2
    createTable(0, -1.6, true);
    createTable(0, 1.6, false);

    // 2. Master Chef's Steamer Tower (總鋪師不鏽鋼大蒸籠)
    const chefArea = new THREE.Group();
    chefArea.position.set(tentWidth / 2 - 0.7, 0, 0);

    const burner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.42, 0.3, 12),
      new THREE.MeshStandardMaterial({ color: 0x424242, metalness: 0.8 })
    );
    burner.position.y = 0.15;
    chefArea.add(burner);

    // Multi-tier stainless steel steamers
    for (let t = 0; t < 3; t++) {
      const tier = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.28, 14),
        new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.85, roughness: 0.25 })
      );
      tier.position.y = 0.44 + t * 0.3;
      chefArea.add(tier);
    }

    // Steamer conical lid
    const lid = new THREE.Mesh(
      new THREE.ConeGeometry(0.38, 0.22, 14),
      new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.9, roughness: 0.2 })
    );
    lid.position.y = 1.45;
    chefArea.add(lid);

    banquet.add(chefArea);

    banquet.userData = {
      dynamicProps,
      isFlipped: false,
      dodgeAwarded: false,
      scatterProps: () => {
        dynamicProps.forEach((p, idx) => {
          const randAngle = Math.random() * Math.PI * 2;
          const force = 1.2 + Math.random() * 2.5;
          p.obj.position.x += Math.cos(randAngle) * force;
          p.obj.position.z += Math.sin(randAngle) * force;
          p.obj.position.y = Math.random() * 0.2;
          p.obj.rotation.x = (Math.random() - 0.5) * 1.8;
          p.obj.rotation.z = (Math.random() - 0.5) * 1.8;
          p.obj.rotation.y += Math.random() * 2.0;
        });
      }
    };

    return banquet;
  }

  // 33. Taiwan Railway Level Crossing (台鐵路面平交道與黑黃斑馬紋自動遮斷桿)
  createRailwayCrossing() {
    const crossing = new THREE.Group();
    crossing.name = 'railwayCrossing';

    // 1. Rubber Crossing Bed across street (平交道防滑橡膠板與鐵軌枕木)
    const bedWidth = 14.0;
    const bedLength = 4.2;
    const bedGeo = new THREE.BoxGeometry(bedWidth, 0.05, bedLength);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.9 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.y = 0.025;
    crossing.add(bed);

    // Yellow Caution Safety Lines on Road
    const yellowStripeMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    [-bedLength / 2, bedLength / 2].forEach(zy => {
      const yLine = new THREE.Mesh(new THREE.BoxGeometry(bedWidth, 0.06, 0.22), yellowStripeMat);
      yLine.position.set(0, 0.035, zy);
      crossing.add(yLine);
    });

    // Twin Steel Tracks (雙軌鋼軌)
    const trackGeo = new THREE.BoxGeometry(bedWidth + 20.0, 0.08, 0.1);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, metalness: 0.9, roughness: 0.3 });
    [-0.75, 0.75].forEach(tz => {
      const rail = new THREE.Mesh(trackGeo, trackMat);
      rail.position.set(0, 0.065, tz);
      crossing.add(rail);
    });

    // 2. Crossing Warning Posts on Both Sides (左右兩側平交道號誌機)
    const redLightL1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0x000000 }));
    const redLightL2 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0x000000 }));
    const redLightR1 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0x000000 }));
    const redLightR2 = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0x000000 }));

    const barrierPivotL = new THREE.Group();
    const barrierPivotR = new THREE.Group();

    [-6.4, 6.4].forEach((postX, pIdx) => {
      const postGroup = new THREE.Group();
      postGroup.position.set(postX, 0, pIdx === 0 ? -bedLength / 2 - 0.4 : bedLength / 2 + 0.4);

      // Black & Yellow Zebra Striped Mast
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.09, 3.4, 10),
        new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.5 })
      );
      mast.position.y = 1.7;
      postGroup.add(mast);

      // "停看聽" Railroad Crossbuck Sign (平交道交叉標誌)
      const crossArmGeo = new THREE.BoxGeometry(1.3, 0.18, 0.04);
      const crossMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
      const arm1 = new THREE.Mesh(crossArmGeo, crossMat);
      arm1.position.set(0, 2.7, 0.05);
      arm1.rotation.z = Math.PI / 4;
      postGroup.add(arm1);

      const arm2 = new THREE.Mesh(crossArmGeo, crossMat);
      arm2.position.set(0, 2.7, 0.05);
      arm2.rotation.z = -Math.PI / 4;
      postGroup.add(arm2);

      // Dual Red Warning Lights
      const flasherCross = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.06), this.materials.chrome);
      flasherCross.position.set(0, 2.25, 0.08);
      postGroup.add(flasherCross);

      const l1 = pIdx === 0 ? redLightL1 : redLightR1;
      const l2 = pIdx === 0 ? redLightL2 : redLightR2;
      l1.position.set(-0.35, 2.25, 0.12);
      l2.position.set(0.35, 2.25, 0.12);
      postGroup.add(l1);
      postGroup.add(l2);

      // Speaker Box on Mast Top
      const speaker = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.24, 8), this.materials.metalDark);
      speaker.position.set(0, 3.45, 0);
      postGroup.add(speaker);

      // Barrier Gate Mechanism Box
      const motorBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.7, 0.4),
        new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.6 })
      );
      motorBox.position.set(0, 0.85, 0);
      postGroup.add(motorBox);

      // Automatic Descending Barrier Arm (黑黃相間反光斜紋遮斷桿)
      const pivot = pIdx === 0 ? barrierPivotL : barrierPivotR;
      pivot.position.set(pIdx === 0 ? 0.2 : -0.2, 0.95, 0);

      const armLength = 6.2;
      const armGeo = new THREE.BoxGeometry(armLength, 0.09, 0.06);
      const armMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.4 });
      const barrierArm = new THREE.Mesh(armGeo, armMat);
      barrierArm.position.set(pIdx === 0 ? armLength / 2 : -armLength / 2, 0, 0);
      pivot.add(barrierArm);

      // Black stripes on barrier arm
      for (let s = 1; s < 6; s++) {
        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.096, 0.066),
          new THREE.MeshBasicMaterial({ color: 0x111111 })
        );
        const sx = pIdx === 0 ? s * 1.05 : -s * 1.05;
        stripe.position.set(sx, 0, 0);
        pivot.add(stripe);
      }

      // Red flashing LED bulb on barrier tip
      const tipLed = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xff1744 })
      );
      tipLed.position.set(pIdx === 0 ? armLength : -armLength, 0, 0);
      pivot.add(tipLed);

      // Initial angle: 90 deg (upright vertical open)
      pivot.rotation.z = pIdx === 0 ? Math.PI / 2 : -Math.PI / 2;

      postGroup.add(pivot);
      crossing.add(postGroup);
    });

    crossing.userData = {
      barrierPivotL,
      barrierPivotR,
      redLightL1,
      redLightL2,
      redLightR1,
      redLightR2,
      barrierAngle: 1.0, // 1.0 = upright open, 0.0 = lowered horizontal
      setBarrierProgress: (prog) => {
        // prog: 1.0 (fully open upright) to 0.0 (fully lowered horizontal)
        crossing.userData.barrierAngle = prog;
        barrierPivotL.rotation.z = prog * (Math.PI / 2);
        barrierPivotR.rotation.z = -prog * (Math.PI / 2);
      },
      updateFlashers: (active, phase) => {
        if (!active) {
          redLightL1.material.emissive.setHex(0x000000);
          redLightL2.material.emissive.setHex(0x000000);
          redLightR1.material.emissive.setHex(0x000000);
          redLightR2.material.emissive.setHex(0x000000);
          return;
        }
        const stateA = phase % 2 === 0;
        const colOn = 0xff1744;
        const colOff = 0x000000;
        redLightL1.material.emissive.setHex(stateA ? colOn : colOff);
        redLightL1.material.emissiveIntensity = stateA ? 2.5 : 0;
        redLightL2.material.emissive.setHex(!stateA ? colOn : colOff);
        redLightL2.material.emissiveIntensity = !stateA ? 2.5 : 0;
        redLightR1.material.emissive.setHex(stateA ? colOn : colOff);
        redLightR1.material.emissiveIntensity = stateA ? 2.5 : 0;
        redLightR2.material.emissive.setHex(!stateA ? colOn : colOff);
        redLightR2.material.emissiveIntensity = !stateA ? 2.5 : 0;
      }
    };

    return crossing;
  }

  // 34. Taiwan Railway TRA Express Train EMU3000 (台鐵自強號柴電高速列車)
  createExpressTrain() {
    const train = new THREE.Group();
    train.name = 'expressTrain';

    const trainLen = 22.0;
    const trainW = 2.7;
    const trainH = 3.2;

    // Aerodynamic Streamlined Body (Pure White with TRA Black & Red Trim)
    const bodyGeo = new THREE.BoxGeometry(trainLen, trainH, trainW);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.35,
      metalness: 0.15
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = trainH / 2 + 0.45;
    train.add(body);

    // Front Nose Wedge Streamline
    const noseGeo = new THREE.ConeGeometry(1.6, 2.5, 4);
    noseGeo.rotateZ(-Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(trainLen / 2 + 1.1, trainH / 2 + 0.35, 0);
    train.add(nose);

    // Matte Black Window Ribbon (車身黑色側窗飾帶)
    const windowRibbon = new THREE.Mesh(
      new THREE.BoxGeometry(trainLen - 2.5, 0.75, trainW + 0.04),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 })
    );
    windowRibbon.position.set(0, trainH / 2 + 0.65, 0);
    train.add(windowRibbon);

    // Iconic Red Racing Line (台鐵紅線條)
    const redStripe = new THREE.Mesh(
      new THREE.BoxGeometry(trainLen + 1.2, 0.12, trainW + 0.06),
      new THREE.MeshStandardMaterial({ color: 0xd50000, roughness: 0.3 })
    );
    redStripe.position.set(0.5, trainH / 2 + 0.15, 0);
    train.add(redStripe);

    // High-Intensity Dual LED Headlights (高亮度車頭大燈)
    const headlightL = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    headlightL.position.set(trainLen / 2 + 1.8, 1.3, -0.65);
    train.add(headlightL);

    const headlightR = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    headlightR.position.set(trainLen / 2 + 1.8, 1.3, 0.65);
    train.add(headlightR);

    // Headlight Beam Cone Light
    const spotLight = new THREE.SpotLight(0xffeedd, 3.5, 38, Math.PI / 6, 0.4);
    spotLight.position.set(trainLen / 2 + 1.9, 1.4, 0);
    spotLight.target.position.set(trainLen / 2 + 25, 0.5, 0);
    train.add(spotLight);
    train.add(spotLight.target);

    // Train Bogies Wheels (鐵道雙轉向架鋼輪)
    const wheelMat = this.materials.metalDark;
    [-7.5, 7.5].forEach(bx => {
      const bogie = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.35, 2.2), wheelMat);
      bogie.position.set(bx, 0.35, 0);
      train.add(bogie);

      [-1.0, 1.0].forEach(wx => {
        [-1.15, 1.15].forEach(wz => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.14, 12), this.materials.chrome);
          wheel.rotation.x = Math.PI / 2;
          wheel.position.set(bx + wx, 0.38, wz);
          train.add(wheel);
        });
      });
    });

    return train;
  }

  // 35. Mudguard Decal Swapping Utility (阿明車行擋泥板女神/貼紙動態切換)
  updateScooterMudguard(scooterMesh, style = 'dream') {
    if (!scooterMesh) return;
    const mudguard = scooterMesh.getObjectByName('scooterMudguard');
    if (!mudguard) return;

    let title = '追夢人';
    let bg = '#e91e63';
    let sub = '莫忘初衷';
    if (style === 'queen') {
      title = '擋泥板女神';
      bg = '#880e4f';
      sub = '♥ 永遠的偶像 ♥';
    } else if (style === 'try_me') {
      title = '檢舉我試試';
      bg = '#b71c1c';
      sub = '不怕死的來';
    }

    const tex = this.createTextTexture(title, bg, '#ffffff', 34, sub);
    mudguard.material.map = tex;
    mudguard.material.needsUpdate = true;
  }

  // 36. Uncle Ming's Tire Pressure & Maintenance Pitstop (大眾機車行阿明自助打氣站)
  createAirCompressor() {
    const group = new THREE.Group();
    group.name = 'airPitstop';

    // Yellow Air Compressor Tank
    const tankGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.72, 16);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0xfbc02d, roughness: 0.35, metalness: 0.5 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = 0.42;
    group.add(tank);

    // Motor Pump on top
    const motor = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.22, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x37474f, metalness: 0.7 })
    );
    motor.position.set(0, 0.88, 0);
    group.add(motor);

    // PSI Gauge dial
    const gauge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.03, 12),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    gauge.rotation.x = Math.PI / 2;
    gauge.position.set(0, 1.02, 0.12);
    group.add(gauge);

    // Black coiled rubber hose
    const hose = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.025, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
    );
    hose.position.set(0.26, 0.45, 0);
    group.add(hose);

    // Top Signboard
    const signTex = this.createTextTexture('自助打氣', '#f57f17', '#ffffff', 32, 'FREE AIR');
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.32, 0.04),
      new THREE.MeshStandardMaterial({ map: signTex })
    );
    sign.position.set(0, 1.35, 0);
    group.add(sign);

    // Ground aura ring marking pitstop trigger area
    const auraGeo = new THREE.RingGeometry(0.9, 1.35, 32);
    auraGeo.rotateX(-Math.PI / 2);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x00e676,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.position.y = 0.02;
    group.add(aura);
    group.userData = { auraRing: aura };

    return group;
  }

  // 37. Roadside Sobriety Police Checkpoint (路口酒測臨檢站)
  createSobrietyCheckpoint() {
    const group = new THREE.Group();
    group.name = 'sobrietyCheckpoint';

    // Police Signboard Barrier
    const signTex = this.createTextTexture('酒測臨檢', '#1565c0', '#ffffff', 34, '停車受檢 POLICE');
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.5, 0.06),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.3 })
    );
    signBoard.position.set(0, 0.9, 0);
    group.add(signBoard);

    // Barrier Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    [-0.65, 0.65].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9), legMat);
      leg.position.set(lx, 0.45, 0);
      group.add(leg);
    });

    // Flashing Blue/Red Police LED Beacon
    const beaconLight = new THREE.PointLight(0x00e5ff, 2.5, 12);
    beaconLight.position.set(0, 1.25, 0);
    group.add(beaconLight);

    const redLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff1744 })
    );
    redLed.position.set(-0.25, 1.22, 0);
    group.add(redLed);

    const blueLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff })
    );
    blueLed.position.set(0.25, 1.22, 0);
    group.add(blueLed);

    // Reflective Traffic Cones
    [-1.8, -1.0, 1.0, 1.8].forEach(cx => {
      const cone = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.26), new THREE.MeshStandardMaterial({ color: 0xff3d00 }));
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 12), new THREE.MeshStandardMaterial({ color: 0xff3d00 }));
      body.position.y = 0.27;
      const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.095, 0.14, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      stripe.position.y = 0.28;
      cone.add(base, body, stripe);
      cone.position.set(cx, 0, 0.65);
      group.add(cone);
    });

    group.userData = {
      beaconLight,
      redLed,
      blueLed,
      timer: 0
    };

    return group;
  }
}



