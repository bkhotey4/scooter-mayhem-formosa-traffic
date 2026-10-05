import * as THREE from 'three';
import { box, part, rod, paint } from './StreetArt.js';

// Loft rounded cross sections instead of stacking cubes. Coordinates stay in
// metres, with +Z forward, matching existing traffic and collision envelopes.
export function bodyShell(sections, segments = 24) {
  const positions = [], uvs = [], indices = [];
  for (let ring = 0; ring < sections.length; ring++) {
    const [z, halfWidth, bottom, top] = sections[ring];
    for (let j = 0; j <= segments; j++) {
      const a = j / segments * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      positions.push(Math.sign(c) * Math.pow(Math.abs(c), 0.42) * halfWidth,
        (top + bottom) / 2 + Math.sign(s) * Math.pow(Math.abs(s), 0.42) * (top - bottom) / 2, z);
      uvs.push(j / segments, ring / (sections.length - 1));
      if (ring && j < segments) {
        const b = ring * (segments + 1) + j, a0 = b - segments - 1;
        indices.push(a0, a0 + 1, b, b, a0 + 1, b + 1);
      }
    }
  }
  // Close both ends with winding consistent with the side surfaces.
  for (const ring of [0, sections.length - 1]) {
    const [z, , bottom, top] = sections[ring];
    const center = positions.length / 3;
    positions.push(0, (bottom + top) / 2, z); uvs.push(0.5, 0.5);
    for (let j = 0; j < segments; j++) {
      const a = ring * (segments + 1) + j;
      if (ring === 0) indices.push(center, a + 1, a);
      else indices.push(center, a, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function plate(parent, factory, label, z, y, rear = false) {
  const g = new THREE.Group();
  const texture = factory.createTextTexture(label, '#e9e5d7', '#233234', 27);
  box(g, 0.49, 0.19, 0.025, new THREE.MeshStandardMaterial({ map: texture, roughness: 0.55 }));
  g.position.set(0, y, z); g.rotation.y = rear ? Math.PI : 0;
  parent.add(g);
}

function wheel(parent, x, z, radius, factory) {
  const g = new THREE.Group(); g.position.set(x, radius, z);
  const tire = part(g, new THREE.TorusGeometry(radius * 0.76, radius * 0.24, 10, 28), factory.materials.tireRubber);
  tire.rotation.y = Math.PI / 2;
  const hub = part(g, new THREE.CylinderGeometry(radius * 0.67, radius * 0.67, 0.18, 24), paint(0x273033, 0.7));
  hub.rotation.z = Math.PI / 2;
  const outerX = Math.sign(x) * 0.115;
  const lip = part(g, new THREE.TorusGeometry(radius * 0.63, 0.018, 6, 24), factory.materials.chrome, outerX);
  lip.rotation.y = Math.PI / 2;
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7;
    rod(g, [outerX, Math.sin(a) * radius * 0.15, Math.cos(a) * radius * 0.15], [outerX, Math.sin(a + 0.12) * radius * 0.59, Math.cos(a + 0.12) * radius * 0.59], 0.022, factory.materials.chrome);
  }
  const cap = part(g, new THREE.CylinderGeometry(0.055, 0.055, 0.026, 12), factory.materials.chrome, outerX * 1.1);
  cap.rotation.z = Math.PI / 2;
  parent.add(g);
}

export function createDetailedCar(factory, kind = 'van') {
  const g = new THREE.Group(), van = kind === 'van', m = factory.materials;
  g.userData = { type: van ? 'alphard' : 'taxi', doorOpened: false, doorAngle: 0, targetDoorAngle: 0 };
  const bodyPaint = van ? m.alphardBlack : m.taxiYellow;
  const length = van ? 2.18 : 1.88, width = van ? 0.93 : 0.85;
  part(g, bodyShell([
    [-length, width * 0.84, 0.4, 0.87], [-length + 0.15, width, 0.33, 1.03],
    [-1.2, width, 0.34, 1.05], [0.7, width, 0.34, 1.03],
    [length - 0.28, width * 0.98, 0.38, 0.96], [length, width * 0.83, 0.46, 0.82]
  ]), bodyPaint);
  const glass = paint(0x294047, 0.16, 0.5);
  const roofHeight = van ? 1.92 : 1.52;
  part(g, bodyShell(van ? [
    [-1.98, 0.8, 0.95, 1.75], [-1.75, 0.84, 0.94, 1.9],
    [0.65, 0.8, 0.94, 1.88], [1.45, 0.8, 0.95, 1.27]
  ] : [
    [-1.34, 0.71, 0.95, 1.04], [-0.8, 0.71, 0.96, 1.48],
    [0.28, 0.68, 0.96, 1.48], [0.98, 0.73, 0.96, 1.03]
  ]), glass);
  box(g, van ? 1.65 : 1.42, 0.1, van ? 2.75 : 1.15, bodyPaint, 0, roofHeight - 0.03, van ? -0.52 : -0.22, 0.045);
  for (const side of [-1, 1]) {
    // Continuous shoulder crease, window frames, door seams, mirrors and sills.
    rod(g, [side * width, 1.035, -length + 0.15], [side * width, 1.015, length - 0.35], 0.018, m.chrome);
    rod(g, [side * width, 0.37, -1.75], [side * width, 0.37, 1.75], 0.035, paint(0x263337));
    for (const z of van ? [-1.55, -0.6, 0.58] : [-0.75, 0.25]) {
      rod(g, [side * (width - 0.02), 0.54, z], [side * (width - 0.02), 1.02, z], 0.009, paint(0x263337));
      box(g, 0.055, 0.045, 0.22, m.chrome, side * (width + 0.015), 0.91, z - 0.18, 0.018);
    }
    rod(g, [side * (width - 0.06), 1.05, 0.5], [side * (width - 0.13), roofHeight - 0.05, 0.4], 0.045, bodyPaint);
    rod(g, [side * (width - 0.13), roofHeight - 0.06, 0.4], [side * (width - 0.04), 1.06, van ? 1.45 : 0.96], 0.045, bodyPaint);
    rod(g, [side * width, 1.14, 0.91], [side * (width + 0.22), 1.14, 0.82], 0.027, paint(0x263337));
    box(g, 0.22, 0.14, 0.22, bodyPaint, side * (width + 0.23), 1.17, 0.8, 0.055);
    wheel(g, side * width, van ? 1.4 : 1.2, van ? 0.36 : 0.32, factory);
    wheel(g, side * width, van ? -1.4 : -1.2, van ? 0.36 : 0.32, factory);
    // LED signatures and rear clusters.
    box(g, 0.39, 0.10, 0.08, m.headlight, side * width * 0.72, 0.93, length - 0.04, 0.035);
    box(g, 0.39, 0.035, 0.09, m.headlight, side * width * 0.72, 0.82, length - 0.015, 0.012);
    box(g, van ? 0.13 : 0.4, van ? 0.54 : 0.12, 0.08, m.taillight, side * width * 0.8, van ? 1.18 : 0.91, -length + 0.015, 0.035);
  }
  box(g, 1.45, van ? 0.45 : 0.22, 0.09, paint(0x182428), 0, 0.65, length, 0.055);
  for (let i = 0; i < (van ? 7 : 3); i++) box(g, 1.3 - Math.abs(i - 3) * 0.06, 0.024, 0.055, m.chrome, 0, (van ? 0.46 : 0.59) + i * 0.055, length + 0.055);
  plate(g, factory, van ? 'FMS-8888' : 'TX-5568', length + 0.09, 0.45);
  plate(g, factory, van ? 'FMS-8888' : 'TX-5568', -length - 0.03, 0.64, true);
  const hazards = new THREE.Group(); hazards.name = 'hazardLights';
  for (const side of [-1, 1]) for (const end of [-1, 1]) box(hazards, 0.12, 0.06, 0.07, m.turnSignal, side * width * 0.84, 0.89, end * length, 0.02);
  g.add(hazards);
  if (van) {
    const door = new THREE.Group(); door.name = 'doorPivot'; door.position.set(-0.95, 0.95, 0.4);
    box(door, 0.055, 0.55, 1.02, bodyPaint, 0, -0.19, -0.52, 0.025);
    box(door, 0.055, 0.51, 0.94, glass, 0, 0.37, -0.52, 0.022);
    rod(door, [0, 0.67, -1.02], [0, 0.67, -0.03], 0.025, m.chrome);
    box(door, 0.07, 0.045, 0.18, m.chrome, -0.05, -0.02, -0.82, 0.018);
    g.add(door);
  } else {
    const taxiTexture = factory.createTextTexture('TAXI', '#f5d566', '#263337', 36);
    box(g, 0.48, 0.18, 0.23, new THREE.MeshStandardMaterial({ map: taxiTexture, emissiveMap: taxiTexture, emissive: 0xffffff, emissiveIntensity: 0.3 }), 0, 1.65, -0.15, 0.04);
  }
  return g;
}

export function createDetailedRider(factory) {
  const g = new THREE.Group(), m = factory.materials;
  const jacket = paint(0xcc9957, 0.87), jeans = paint(0x344b5a, 0.93);
  const torso = part(g, new THREE.CapsuleGeometry(0.155, 0.22, 5, 12), jacket, 0, 0.26);
  torso.scale.set(1.18, 1, 0.8); torso.rotation.x = 0.18;
  part(g, new THREE.SphereGeometry(0.135, 20, 16), m.skin, 0, 0.6, 0.1);
  part(g, new THREE.SphereGeometry(0.16, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6), paint(0x284e43, 0.25, 0.15), 0, 0.63, 0.1);
  const brim = part(g, new THREE.TorusGeometry(0.152, 0.01, 6, 24), m.blackPlastic, 0, 0.58, 0.1); brim.rotation.x = Math.PI / 2;
  for (const side of [-1, 1]) {
    // Bent limbs connect shoulder → elbow → grip and hip → knee → footboard.
    rod(g, [side * 0.15, 0.4, 0.02], [side * 0.25, 0.19, 0.18], 0.062, jacket);
    part(g, new THREE.SphereGeometry(0.055, 12, 8), jacket, side * 0.25, 0.19, 0.18);
    rod(g, [side * 0.25, 0.19, 0.18], [side * 0.32, 0.17, 0.43], 0.04, m.skin);
    box(g, 0.08, 0.075, 0.09, m.blackPlastic, side * 0.32, 0.17, 0.43, 0.03);
    rod(g, [side * 0.12, 0, 0], [side * 0.23, -0.12, 0.29], 0.078, jeans);
    rod(g, [side * 0.23, -0.12, 0.29], [side * 0.23, -0.39, 0.24], 0.055, jeans);
    box(g, 0.13, 0.075, 0.25, paint(0x283a3d), side * 0.23, -0.4, 0.3, 0.035);
    box(g, 0.13, 0.012, 0.23, paint(0xd1d0bb), side * 0.23, -0.43, 0.3);
    box(g, 0.032, 0.32, 0.012, paint(0xdfdcc7), side * 0.1, 0.25, -0.123);
  }
  box(g, 0.26, 0.028, 0.012, paint(0xdfdcc7), 0, 0.25, -0.137);
  return g;
}

export function polishScooter(scooter, factory) {
  const cowl = scooter.getObjectByName('scooterCowl');
  cowl.geometry.dispose();
  cowl.geometry = bodyShell([[-0.2, 0.16, -0.29, 0.28], [-0.12, 0.23, -0.34, 0.33], [0.08, 0.26, -0.31, 0.3], [0.22, 0.16, -0.22, 0.14]], 24);
  const seat = scooter.getObjectByName('scooterSeatBody');
  seat.geometry.dispose();
  seat.geometry = bodyShell([[-0.45, 0.17, -0.1, 0.1], [-0.32, 0.25, -0.16, 0.18], [0.1, 0.26, -0.16, 0.17], [0.45, 0.14, -0.1, 0.14]], 24);
  const m = factory.materials;
  for (const side of [-1, 1]) {
    // Engine cooling louvres, rubber foot pads and fasteners add scale cues.
    for (let i = 0; i < 4; i++) {
      const vent = box(scooter, 0.012, 0.018, 0.12, m.blackPlastic, side * 0.255, 0.48 + i * 0.025, -0.35);
      vent.rotation.x = -0.2;
    }
    for (let i = 0; i < 5; i++) box(scooter, 0.13, 0.014, 0.025, paint(0x414e4d), side * 0.17, 0.417, -0.05 + i * 0.08);
    rod(scooter, [side * 0.25, 0.38, -0.4], [side * 0.25, 0.38, 0.22], 0.018, m.chrome);
  }
  // Seat piping reads clearly even in the close-follow camera.
  const piping = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.2, 0.82, 0.03), new THREE.Vector3(-0.19, 0.82, -0.57),
    new THREE.Vector3(0.19, 0.82, -0.57), new THREE.Vector3(0.2, 0.82, 0.03)
  ], true);
  part(scooter, new THREE.TubeGeometry(piping, 24, 0.007, 4, true), paint(0x80928a));
}

export function polishTruck(truck, factory) {
  const m = factory.materials, trim = paint(0x9ba9a7, 0.45, 0.65);
  for (const side of [-1, 1]) {
    box(truck, 0.055, 0.5, 2.6, m.blueTruck, side * 0.87, 0.96, -0.8, 0.022);
    for (let i = 0; i < 4; i++) box(truck, 0.065, 0.48, 0.055, trim, side * 0.9, 0.96, -1.9 + i * 0.72);
    box(truck, 0.03, 0.5, 0.85, paint(0x294047, 0.2, 0.45), side * 0.833, 1.25, 1.05, 0.05);
    box(truck, 0.045, 0.05, 0.18, m.chrome, side * 0.86, 0.92, 0.95, 0.02);
    box(truck, 0.18, 0.21, 0.12, m.blackPlastic, side * 1.03, 1.24, 1.57, 0.04);
    rod(truck, [side * 0.8, 1.1, 1.55], [side * 1.03, 1.1, 1.55], 0.025, trim);
    box(truck, 0.32, 0.15, 0.05, m.headlight, side * 0.57, 0.66, 1.82, 0.03);
    box(truck, 0.23, 0.1, 0.05, m.taillight, side * 0.64, 0.58, -2.13, 0.025);
    for (const z of [-1, 1.1]) {
      const hub = part(truck, new THREE.CylinderGeometry(0.2, 0.2, 0.022, 20), trim, side * 1.005, 0.35, z);
      hub.rotation.z = Math.PI / 2;
    }
  }
  box(truck, 1.8, 0.15, 0.16, paint(0x263337), 0, 0.44, 1.82, 0.055);
  box(truck, 1.7, 0.5, 0.07, m.blueTruck, 0, 0.96, -2.1, 0.02);
  plate(truck, factory, 'FMS-168', 1.91, 0.44);
  plate(truck, factory, 'FMS-168', -2.16, 0.54, true);
  truck.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
}
