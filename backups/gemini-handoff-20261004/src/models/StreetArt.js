import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// A restrained enamel, cream, terracotta and jade palette shared by the street.
const palette = new Map();
export function paint(color, roughness = 0.65, metalness = 0) {
  const key = `${color}/${roughness}/${metalness}`;
  if (!palette.has(key)) palette.set(key, new THREE.MeshStandardMaterial({ color, roughness, metalness }));
  return palette.get(key);
}
export function part(parent, geometry, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export function box(parent, w, h, d, material, x = 0, y = 0, z = 0, radius = 0) {
  return part(parent, radius ? new RoundedBoxGeometry(w, h, d, 2, radius) : new THREE.BoxGeometry(w, h, d), material, x, y, z);
}
export function rod(parent, a, b, radius, material) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
  const mesh = part(parent, new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), 8), material);
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.sub(start).normalize());
  return mesh;
}
export function sign(parent, factory, text, subtitle, w, h, x, y, z, bg = '#194f50') {
  box(parent, w + 0.12, h + 0.12, 0.15, paint(0xefe2c5), x, y, z);
  const texture = factory.createTextTexture(text, bg, '#fff2d4', 34, subtitle);
  const material = new THREE.MeshStandardMaterial({ map: texture, emissiveMap: texture, emissive: 0xffffff, emissiveIntensity: 0.35, roughness: 0.65 });
  return part(parent, new THREE.PlaneGeometry(w, h), material, x, y, z + 0.081);
}

export function detailScooter(scooter, factory) {
  const m = factory.materials;
  // Rubber shoulders and machined brake discs; preserve wheel names and axes.
  for (const name of ['frontWheel', 'rearWheel']) {
    const wheel = scooter.getObjectByName(name);
    for (const side of [-1, 1]) {
      const shoulder = part(wheel, new THREE.TorusGeometry(0.193, 0.047, 8, 24), m.tireRubber, side * 0.045);
      shoulder.rotation.y = Math.PI / 2;
      const disc = part(wheel, new THREE.CylinderGeometry(0.12, 0.12, 0.014, 24), paint(0x8b9a9d, 0.3, 0.8), side * 0.08);
      disc.rotation.z = Math.PI / 2;
      for (let i = 0; i < 5; i++) {
        const angle = i * Math.PI * 2 / 5;
        const spoke = box(wheel, 0.018, 0.025, 0.22, m.chrome, side * 0.075);
        spoke.rotation.x = angle;
      }
    }
  }
  for (const side of [-1, 1]) {
    rod(scooter, [side * 0.095, 0.26, 0.7], [side * 0.095, 0.68, 0.53], 0.025, m.chrome);
    rod(scooter, [side * 0.22, 0.25, -0.58], [side * 0.22, 0.62, -0.35], 0.026, m.chrome);
    for (let i = 0; i < 6; i++) {
      const spring = part(scooter, new THREE.TorusGeometry(0.043, 0.012, 5, 10), paint(0xe0ac53, 0.35, 0.5), side * 0.22, 0.34 + i * 0.037, -0.53 + i * 0.023);
      spring.rotation.x = Math.PI / 2 - 0.55;
    }
    box(scooter, 0.015, 0.07, 0.55, paint(0xf1e7cd), side * 0.258, 0.58, -0.25, 0.006);
  }
  const fender = part(scooter, new THREE.SphereGeometry(0.29, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), m.scooterBodyTeal, 0, 0.28, 0.7);
  fender.scale.set(0.38, 1, 1);
  fender.name = 'scooterFender';
  const visor = part(scooter.getObjectByName('rider'), new THREE.SphereGeometry(0.163, 20, 12, 0, Math.PI, Math.PI * 0.28, Math.PI * 0.34), m.glassTinted, 0, 0.63, 0.11);
  visor.scale.z = 1.08;
  const phone = new THREE.Group();
  phone.position.set(0.16, 1.12, 0.44);
  phone.rotation.x = -0.45;
  box(phone, 0.09, 0.16, 0.025, m.blackPlastic, 0, 0, 0, 0.012);
  box(phone, 0.071, 0.125, 0.004, m.neonCyan, 0, 0, -0.015);
  scooter.add(phone);
  const plate = sign(scooter, factory, 'FMS-125', '', 0.24, 0.12, 0, 0.47, -0.8, '#e9e2cb');
  plate.rotation.y = Math.PI;
  scooter.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
}

export function detailBuilding(building, factory, width, height, depth, title, subtitle) {
  const front = depth / 2;
  const hash = [...title].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const colors = [0x397d79, 0xb65240, 0xc6954b, 0x49657c];
  const accent = paint(colors[hash % colors.length]);
  const cream = paint(0xe6dcc6), dark = paint(0x314543), steel = paint(0xa6b6b0, 0.4, 0.6);
  // Bring the shopfront into the arcade: the original shutter was buried in a wall.
  sign(building, factory, title, subtitle, width - 1.8, 1.35, 0, 4.1, front + 0.18, `#${colors[hash % colors.length].toString(16)}`);
  box(building, width - 1.6, 2.7, 0.18, dark, 0, 1.65, front - 2.1);
  for (let i = -1; i <= 1; i++) {
    box(building, 2.9, 2.3, 0.08, factory.materials.glassTinted, i * 3.4, 1.65, front - 1.96);
    box(building, 0.09, 2.6, 0.12, cream, i * 3.4 + 1.5, 1.65, front - 1.85);
    box(building, 2.4, 0.12, 0.12, factory.materials.windowWarm, i * 3.4, 2.7, front - 1.8);
  }
  // Broad fabric stripes make each storefront legible from the moving camera.
  for (let i = 0; i < 12; i++) {
    const awning = box(building, (width - 1) / 12, 0.12, 1.6, i % 2 ? cream : accent, -width / 2 + 0.5 + (i + 0.5) * (width - 1) / 12, 3.25, front - 0.45);
    awning.rotation.x = 0.16;
    box(building, (width - 1) / 12, 0.3, 0.08, i % 2 ? cream : accent, awning.position.x, 2.98, front + 0.34);
  }
  // Floor bands, projecting balconies, window mullions and drainpipes.
  for (let y = 5.5; y < height; y += 3.8) {
    box(building, width + 0.12, 0.17, 0.32, cream, 0, y, front);
  }
  for (const x of [-width * 0.25, width * 0.25]) {
    box(building, 3, 0.2, 1.0, cream, x, 8.55, front + 0.45);
    box(building, 3, 0.09, 0.08, dark, x, 9.4, front + 0.93);
    for (let i = -2; i <= 2; i++) box(building, 0.06, 0.8, 0.06, dark, x + i * 0.65, 8.98, front + 0.93);
    for (const y of [9.8, 13.6]) {
      box(building, 0.08, 1.6, 0.07, cream, x, y, front + 0.15);
      box(building, 2.2, 0.07, 0.07, cream, x, y, front + 0.15);
    }
  }
  rod(building, [-width / 2 + 1, 0.4, front + 0.2], [-width / 2 + 1, height, front + 0.2], 0.07, steel);
  const tank = part(building, new THREE.CylinderGeometry(1, 1, 2, 16), steel, width * 0.25, height + 4.6, 0);
  for (const y of [-0.7, 0.7]) {
    const band = part(tank, new THREE.TorusGeometry(1.01, 0.045, 6, 16), cream, 0, y);
    band.rotation.x = Math.PI / 2;
  }
  building.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
}

export function createFoodStall(factory, title, color = 0xb65240) {
  const g = new THREE.Group(), steel = paint(0xa1aaa4, 0.42, 0.55), cream = paint(0xf1dfb9);
  box(g, 2.5, 0.95, 1.2, paint(color), 0, 0.7, 0, 0.08);
  box(g, 2.7, 0.12, 1.45, steel, 0, 1.22, 0);
  for (const x of [-1.15, 1.15]) rod(g, [x, 0.3, 0], [x, 2.55, 0], 0.045, steel);
  for (let i = 0; i < 8; i++) box(g, 0.35, 0.13, 1.9, i % 2 ? cream : paint(color), -1.225 + i * 0.35, 2.55, 0);
  sign(g, factory, title, '現做・在地好味', 2.4, 0.56, 0, 2.1, 0.71, `#${color.toString(16)}`);
  for (let i = -1; i <= 1; i++) {
    part(g, new THREE.CylinderGeometry(0.23, 0.2, 0.14, 12), cream, i * 0.62, 1.35, 0.15);
    for (let j = 0; j < 3; j++) part(g, new THREE.SphereGeometry(0.07, 8, 6), paint(0xc9833c), i * 0.62 + (j - 1) * 0.11, 1.45, 0.15);
  }
  for (const x of [-0.9, 0.9]) {
    const wheel = part(g, new THREE.CylinderGeometry(0.18, 0.18, 0.1, 12), paint(0x253532), x, 0.25, 0.3);
    wheel.rotation.z = Math.PI / 2;
  }
  return g;
}

export function createTree() {
  const g = new THREE.Group();
  box(g, 1.2, 0.45, 1.2, paint(0xc1b399), 0, 0.3, 0, 0.08);
  rod(g, [0, 0.5, 0], [0.12, 3.6, 0], 0.14, paint(0x795d46));
  for (let i = 0; i < 5; i++) {
    const a = i * 2.4;
    const crown = part(g, new THREE.IcosahedronGeometry(1.1, 1), paint([0x557b52, 0x78975f, 0x3e6c57][i % 3]), Math.cos(a) * 0.55, 3.3 + (i % 2) * 0.65, Math.sin(a) * 0.55);
    crown.scale.y = 0.85;
  }
  return g;
}

export function createLantern() {
  const g = new THREE.Group();
  const glow = new THREE.MeshStandardMaterial({ color: 0xdf5941, emissive: 0xe85222, emissiveIntensity: 0.45, roughness: 0.65 });
  part(g, new THREE.SphereGeometry(0.29, 12, 10), glow).scale.y = 1.18;
  for (const y of [-0.32, 0.32]) part(g, new THREE.CylinderGeometry(0.12, 0.12, 0.07, 12), paint(0xd7ae55), 0, y);
  rod(g, [0, -0.35, 0], [0, -0.65, 0], 0.025, paint(0xd7ae55));
  return g;
}

export function createTempleGate(factory) {
  const g = new THREE.Group(), red = paint(0xa94536), roof = paint(0x375e5b), gold = paint(0xd5ac57, 0.4, 0.3);
  for (const x of [-6.5, 6.5]) {
    part(g, new THREE.CylinderGeometry(0.35, 0.42, 6.5, 12), red, x, 3.25);
    box(g, 1, 0.5, 1, paint(0xb8b5a5), x, 0.3, 0);
  }
  box(g, 14, 0.65, 1.1, red, 0, 6.15);
  for (let tier = 0; tier < 2; tier++) {
    const width = 16 - tier * 2;
    box(g, width, 0.27, 2.1 - tier * 0.35, roof, 0, 6.65 + tier * 0.75);
    for (const side of [-1, 1]) {
      const tip = box(g, 1.5, 0.22, 2.1 - tier * 0.35, roof, side * (width / 2 - 0.35), 6.92 + tier * 0.75);
      tip.rotation.z = side * 0.38;
    }
    rod(g, [-width / 2, 6.8 + tier * 0.75, 1], [width / 2, 6.8 + tier * 0.75, 1], 0.04, gold);
  }
  sign(g, factory, '福爾摩沙夜市', '廟埕好食・平安慢行', 4.6, 1.2, 0, 5.7, 0.62, '#793d32');
  for (const x of [-4.5, -2.8, 2.8, 4.5]) { const l = createLantern(); l.position.set(x, 5.25, 0); g.add(l); }
  return g;
}
