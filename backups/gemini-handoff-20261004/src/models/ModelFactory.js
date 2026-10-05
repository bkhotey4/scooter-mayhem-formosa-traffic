// ModelFactory.js - Procedural 3D Low-Poly Taiwanese Assets
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { detailScooter, detailBuilding } from './StreetArt.js';

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
      scooterBodyTeal: new THREE.MeshStandardMaterial({ color: 0x008ba3, roughness: 0.25, metalness: 0.35 }),
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
      alphardBlack: new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.15, metalness: 0.6 }),
      taxiYellow: new THREE.MeshStandardMaterial({ color: 0xfbc02d, roughness: 0.25, metalness: 0.3 }),
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
  createPlayerScooter() {
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
    scooter.add(headSpot);

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
    const taillight = new THREE.Mesh(tailGeo, this.materials.taillight);
    taillight.position.set(0, 0.65, -0.69);
    scooter.add(taillight);

    const tailLightPoint = new THREE.PointLight(0xff1744, 1.8, 6);
    tailLightPoint.position.set(0, 0.65, -0.75);
    scooter.add(tailLightPoint);

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
    return scooter;
  }

  createRider() {
    const rider = new THREE.Group();

    // Torso (Delivery T-shirt)
    const torsoGeo = new RoundedBoxGeometry(0.38, 0.5, 0.25, 3, 0.08);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0xf0b35a, roughness: 0.7 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, 0.25, 0);
    torso.rotation.x = 0.25; // Leaning forward slightly
    rider.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const head = new THREE.Mesh(headGeo, this.materials.skin);
    head.position.set(0, 0.6, 0.1);
    rider.add(head);

    // Watermelon Helmet (經典西瓜皮半罩安全帽)
    const helmetGeo = new THREE.SphereGeometry(0.16, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.3 });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.set(0, 0.63, 0.1);
    rider.add(helmet);

    // Helmet Brim / Stripe
    const stripeGeo = new THREE.TorusGeometry(0.16, 0.015, 6, 16);
    stripeGeo.rotateX(Math.PI / 2);
    const stripe = new THREE.Mesh(stripeGeo, this.materials.turnSignal);
    stripe.position.set(0, 0.58, 0.1);
    rider.add(stripe);

    // Arms gripping handlebars
    [-0.2, 0.2].forEach(side => {
      const armGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.45);
      armGeo.rotateZ(side > 0 ? -0.4 : 0.4);
      armGeo.rotateX(0.7);
      const arm = new THREE.Mesh(armGeo, this.materials.skin);
      arm.position.set(side * 1.1, 0.32, 0.2);
      rider.add(arm);
    });

    // Legs with Blue Slippers (經典藍白拖)
    [-0.18, 0.18].forEach(side => {
      const legGeo = new THREE.BoxGeometry(0.12, 0.4, 0.15);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x1565c0 }); // Denim jeans
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(side, -0.15, 0.15);
      rider.add(leg);

      // Blue-and-white slipper
      const flipFlop = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.04, 0.2),
        new THREE.MeshStandardMaterial({ color: 0x1976d2 })
      );
      flipFlop.position.set(side, -0.38, 0.22);
      rider.add(flipFlop);
    });

    return rider;
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
    const car = new THREE.Group();
    car.userData = { type: 'alphard', doorOpened: false, doorAngle: 0, targetDoorAngle: 0 };

    // Van Body (Boxy luxury MPV)
    const bodyGeo = new THREE.BoxGeometry(1.85, 1.45, 4.4);
    const body = new THREE.Mesh(bodyGeo, this.materials.alphardBlack);
    body.position.set(0, 1.0, 0);
    car.add(body);

    // Cabin / Windows (tinted dark glass)
    const cabinGeo = new THREE.BoxGeometry(1.86, 0.7, 3.2);
    const cabin = new THREE.Mesh(cabinGeo, this.materials.glassTinted);
    cabin.position.set(0, 1.35, -0.2);
    car.add(cabin);

    // Huge Chrome Front Grille (Alphard landmark)
    const grilleGeo = new THREE.BoxGeometry(1.4, 0.85, 0.15);
    const grille = new THREE.Mesh(grilleGeo, this.materials.chrome);
    grille.position.set(0, 0.8, 2.22);
    car.add(grille);

    // Front Headlights
    [-0.75, 0.75].forEach(x => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.1), this.materials.headlight);
      hl.position.set(x, 1.05, 2.22);
      car.add(hl);
    });

    // Flashing Hazard Lights (雙黃燈 - 違停無敵星星)
    const hazardGroup = new THREE.Group();
    hazardGroup.name = 'hazardLights';
    [
      [-0.8, 1.05, 2.22], [0.8, 1.05, 2.22], // Front
      [-0.8, 1.05, -2.22], [0.8, 1.05, -2.22] // Rear
    ].forEach(pos => {
      const hz = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), this.materials.turnSignal);
      hz.position.set(...pos);
      hazardGroup.add(hz);
    });
    car.add(hazardGroup);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    [
      [-0.95, 0.38, 1.4], [0.95, 0.38, 1.4],
      [-0.95, 0.38, -1.4], [0.95, 0.38, -1.4]
    ].forEach(pos => {
      const w = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
      w.position.set(...pos);
      car.add(w);
    });

    // Dynamic Left Car Door (Swings open violently into traffic)
    const doorPivot = new THREE.Group();
    doorPivot.name = 'doorPivot';
    // Pivot located at front hinge of driver/passenger side door facing road (left side in Taiwan: traffic on right)
    doorPivot.position.set(-0.93, 0.95, 0.4);

    const doorGeo = new THREE.BoxGeometry(0.08, 1.1, 1.05);
    const doorMesh = new THREE.Mesh(doorGeo, this.materials.alphardBlack);
    doorMesh.position.set(0, 0, -0.52); // Origin at hinge
    doorPivot.add(doorMesh);

    // Door window
    const winGeo = new THREE.BoxGeometry(0.09, 0.45, 0.95);
    const winMesh = new THREE.Mesh(winGeo, this.materials.glassTinted);
    winMesh.position.set(0, 0.25, -0.52);
    doorPivot.add(winMesh);

    car.add(doorPivot);

    return car;
  }

  // 3. Taiwanese Yellow Taxi (台灣大車隊 小黃)
  createTaxi() {
    const taxi = new THREE.Group();
    taxi.userData = { type: 'taxi' };

    // Body
    const bodyGeo = new THREE.BoxGeometry(1.7, 0.8, 3.8);
    const body = new THREE.Mesh(bodyGeo, this.materials.taxiYellow);
    body.position.set(0, 0.65, 0);
    taxi.add(body);

    // Roof / Cabin
    const roofGeo = new THREE.BoxGeometry(1.5, 0.55, 2.0);
    const roof = new THREE.Mesh(roofGeo, this.materials.glassTinted);
    roof.position.set(0, 1.15, -0.15);
    taxi.add(roof);

    // TAXI Roof Light
    const lampGeo = new THREE.BoxGeometry(0.5, 0.15, 0.2);
    const lampTex = this.createTextTexture('TAXI', '#fbc02d', '#000000', 36);
    const lampMat = new THREE.MeshStandardMaterial({ map: lampTex, emissive: 0xffd54f, emissiveIntensity: 0.6 });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(0, 1.5, -0.1);
    taxi.add(lamp);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    [
      [-0.85, 0.32, 1.2], [0.85, 0.32, 1.2],
      [-0.85, 0.32, -1.2], [0.85, 0.32, -1.2]
    ].forEach(pos => {
      const w = new THREE.Mesh(wheelGeo, this.materials.tireRubber);
      w.position.set(...pos);
      taxi.add(w);
    });

    return taxi;
  }

  // 4. Blue Small Truck (中華菱利小藍卡車 - 發財車)
  createBlueTruck() {
    const truck = new THREE.Group();
    truck.userData = { type: 'truck' };

    // Blue Cab
    const cabGeo = new THREE.BoxGeometry(1.65, 1.3, 1.4);
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

    return truck;
  }

  // 5. Market Grandma (菜市場三寶阿嬤 50cc 買菜車 - 突如其來鬼切)
  createGrandmaScooter() {
    const grandma = new THREE.Group();
    grandma.userData = { type: 'grandma', speed: 18, turnTimer: 0, cutLeftTriggered: false };

    // Vintage 50cc Scooter Body (Pastel Pink/Red)
    const bodyGeo = new THREE.BoxGeometry(0.42, 0.4, 1.1);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe57373, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0.4, 0);
    grandma.add(body);

    // Round front cowl & classic round headlight
    const cowlGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.4, 12);
    const cowl = new THREE.Mesh(cowlGeo, bodyMat);
    cowl.position.set(0, 0.65, 0.45);
    grandma.add(cowl);

    const hlGeo = new THREE.SphereGeometry(0.1, 10, 10);
    const hl = new THREE.Mesh(hlGeo, this.materials.headlight);
    hl.position.set(0, 0.72, 0.58);
    grandma.add(hl);

    // Front Vegetable Wire Basket (經典鐵絲菜籃，裝著大蔥與白蘿蔔)
    const basketGeo = new THREE.BoxGeometry(0.38, 0.22, 0.26);
    const basketMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, wireframe: true });
    const basket = new THREE.Mesh(basketGeo, basketMat);
    basket.position.set(0, 0.65, 0.72);
    grandma.add(basket);

    // Veggies in basket
    const radishGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.25);
    const radish = new THREE.Mesh(radishGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    radish.rotation.z = 0.5;
    radish.position.set(-0.06, 0.68, 0.72);
    grandma.add(radish);

    const scallionGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
    const scallion = new THREE.Mesh(scallionGeo, this.materials.plantGreen);
    scallion.rotation.z = -0.4;
    scallion.position.set(0.08, 0.7, 0.72);
    grandma.add(scallion);

    // Grandma Figure
    const torsoGeo = new THREE.BoxGeometry(0.35, 0.45, 0.24);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x8e24aa }); // Floral purple
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, 0.85, 0);
    grandma.add(torso);

    // Grandma Face
    const faceGeo = new THREE.SphereGeometry(0.12, 10, 10);
    const face = new THREE.Mesh(faceGeo, this.materials.skin);
    face.position.set(0, 1.15, 0.05);
    grandma.add(face);

    // Oversized Floral Sun Visor / Hat (超大碎花抗UV防曬帽)
    const hatGeo = new THREE.CylinderGeometry(0.24, 0.22, 0.06, 12);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xff80ab, roughness: 0.6 });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.set(0, 1.25, 0.08);
    hat.rotation.x = -0.15;
    grandma.add(hat);

    // Floral arm covers (防曬袖套)
    [-0.22, 0.22].forEach(x => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35), new THREE.MeshStandardMaterial({ color: 0xffd54f }));
      arm.position.set(x, 0.9, 0.18);
      arm.rotation.x = 0.7;
      grandma.add(arm);
    });

    // Wheels
    const wGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 12);
    wGeo.rotateZ(Math.PI / 2);
    const fw = new THREE.Mesh(wGeo, this.materials.tireRubber);
    fw.position.set(0, 0.2, 0.55);
    const rw = new THREE.Mesh(wGeo, this.materials.tireRubber);
    rw.position.set(0, 0.2, -0.45);
    grandma.add(fw, rw);

    // Right Turn Signal BLINKING constantly while cutting left! (打右轉燈卻鬼切左轉的究極三寶)
    const rightBlinker = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.04), this.materials.turnSignal);
    rightBlinker.position.set(0.18, 0.6, -0.55);
    rightBlinker.name = 'blinker';
    grandma.add(rightBlinker);

    return grandma;
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
}

