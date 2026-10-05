import * as THREE from 'three';
import { box, paint, sign, createTree, createFoodStall } from '../models/StreetArt.js';

export const WORLD_BOUNDS = { minX: -78, maxX: 78, minZ: -208, maxZ: 208 };
export const ROADS = [
  ...[-64, -32, 0, 32, 64].map(x => ({ x1: x, z1: -190, x2: x, z2: 190, width: x === 0 ? 13 : 9 })),
  ...[-190, -90, 0, 90, 190].map(z => ({ x1: -64, z1: z, x2: 64, z2: z, width: 10 }))
];
export const LANDMARKS = [
  { id: 'river', name: '榕樹河堤', x: -64, z: -125 },
  { id: 'sunset', name: '夕照觀景道', x: -64, z: 125 },
  { id: 'homes', name: '花磚住宅街', x: 64, z: -125 },
  { id: 'market', name: '燈籠夜市支路', x: 64, z: 45 },
  { id: 'north', name: '北門小公園', x: 0, z: -190 },
  { id: 'south', name: '南環休息站', x: 32, z: 190 }
];

export function expandWorld(scene, factory, colliders) {
  box(scene, 180, 0.1, 440, paint(0x849579), 0, -0.12, 0);
  for (const r of ROADS) {
    // Existing central streets retain their original surface and markings.
    const vertical = r.x1 === r.x2;
    const length = Math.hypot(r.x2 - r.x1, r.z2 - r.z1);
    box(scene, vertical ? r.width : length + r.width, 0.025, vertical ? length + r.width : r.width,
      factory.materials.asphalt, (r.x1 + r.x2) / 2, -0.015, (r.z1 + r.z2) / 2);
    if (vertical && Math.abs(r.x1) === 64) {
      for (let z = -181; z <= 181; z += 8) {
        if ([-90, 0, 90].some(c => Math.abs(c - z) < 8)) continue;
        box(scene, 0.12, 0.015, 3, paint(0xeed896), r.x1, 0.02, z);
      }
    }
    if (!vertical && Math.abs(r.z1) === 190) {
      for (let x = -58; x < 60; x += 8) box(scene, 3, 0.015, 0.12, paint(0xeed896), x, 0.02, r.z1);
    }
  }
  // River is separated from the rideable embankment by a continuous railing.
  box(scene, 16, 0.06, 420, paint(0x427b88, 0.23), -86, -0.03, 0);
  box(scene, 0.35, 0.9, 416, paint(0xd3cab1), -76, 0.45, 0);
  colliders.push({ minX: -76.3, maxX: -75.7, minZ: -208, maxZ: 208, type: 'wall' });
  for (let z = -170; z <= 170; z += 24) {
    if ([-90, 0, 90].some(c => Math.abs(c - z) < 13)) continue;
    const tree = createTree(); tree.position.set(-72, 0, z); scene.add(tree);
    colliders.push({ minX: -72.7, maxX: -71.3, minZ: z - 0.7, maxZ: z + 0.7, type: 'box' });
    if (z < -10) {
      const home = factory.createTaiwanBuilding(10, 7 + (z + 170) % 3, 8, '花磚小宅', '慢行・生活街');
      home.position.set(76, 0, z); home.rotation.y = -Math.PI / 2; scene.add(home);
      colliders.push({ minX: 71, maxX: 82, minZ: z - 5, maxZ: z + 5, type: 'wall' });
    } else {
      const stall = createFoodStall(factory, ['手工愛玉', '烤玉米', '夜市茶舖'][(z + 170) / 24 % 3 | 0], 0x9c5542);
      stall.position.set(72, 0, z); stall.rotation.y = -Math.PI / 2; scene.add(stall);
      colliders.push({ minX: 70.5, maxX: 73.5, minZ: z - 2, maxZ: z + 2, type: 'box' });
    }
  }
  // Pocket park and rest-stop furniture stay clear of the ring road.
  for (const z of [-201, 201]) {
    box(scene, 100, 0.12, 9, paint(0x98aa79), 0, 0, z);
    for (const x of [-40, -20, 0, 20, 40]) {
      const tree = createTree(); tree.position.set(x, 0, z); scene.add(tree);
      box(scene, 2.4, 0.16, 0.7, paint(0x86644c), x + 4, 0.6, z);
      box(scene, 2.4, 0.6, 0.12, paint(0x86644c), x + 4, 0.95, z + 0.3);
      colliders.push({ minX: x - 0.7, maxX: x + 0.7, minZ: z - 0.7, maxZ: z + 0.7, type: 'box' });
      colliders.push({ minX: x + 2.8, maxX: x + 5.2, minZ: z - 0.4, maxZ: z + 0.4, type: 'box' });
    }
  }
  for (const p of LANDMARKS) {
    const marker = new THREE.Group();
    box(marker, 0.16, 3.6, 0.16, paint(0x3f5d54), 0, 1.8, 0);
    const label = sign(marker, factory, p.name, '探索地標・沿路集章', 4.2, 1.1, 0, 3.4, 0);
    const reverseLabel = label.clone(); reverseLabel.position.z = -0.081; reverseLabel.rotation.y = Math.PI; marker.add(reverseLabel);
    const ring = Math.abs(p.z) === 190;
    const x = ring ? p.x : p.x + (p.x < 0 ? -6 : 6);
    const z = ring ? p.z + Math.sign(p.z) * 7 : p.z;
    marker.position.set(x, 0, z); scene.add(marker);
    colliders.push({ minX: x - 0.2, maxX: x + 0.2, minZ: z - 0.2, maxZ: z + 0.2, type: 'box' });
  }
  for (const z of [-207, 207]) {
    box(scene, 156, 0.8, 0.5, paint(0xc4bba2), 0, 0.4, z);
    colliders.push({ minX: -78, maxX: 78, minZ: z - 0.3, maxZ: z + 0.3, type: 'wall' });
  }
  box(scene, 0.5, 0.8, 416, paint(0xc4bba2), 78, 0.4, 0);
}

export class ExplorationProgress {
  constructor(storage) {
    this.storage = storage;
    try {
      const saved = JSON.parse(storage?.getItem('formosa.landmarks.v1') || '[]');
      this.visited = new Set(Array.isArray(saved) ? saved.filter(id => LANDMARKS.some(p => p.id === id)) : []);
    } catch { this.visited = new Set(); }
  }
  visit(position) {
    const found = LANDMARKS.find(p => !this.visited.has(p.id) && Math.hypot(p.x - position.x, p.z - position.z) < 5);
    if (!found) return null;
    this.visited.add(found.id);
    try { this.storage?.setItem('formosa.landmarks.v1', JSON.stringify([...this.visited])); } catch { /* Session progress still works. */ }
    return found;
  }
}
