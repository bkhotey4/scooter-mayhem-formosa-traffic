import * as THREE from 'three';
import { box, paint, sign, createTree, createFoodStall } from '../models/StreetArt.js';

export const WORLD_BOUNDS = { minX: -155, maxX: 155, minZ: -275, maxZ: 275 };
export const ROADS = [
  // 5 North-South Avenues + 2 Alleys
  { x1: -125, z1: -230, x2: -125, z2: 230, width: 12 }, // 環河北路
  { x1: -65, z1: -230, x2: -65, z2: 230, width: 12 },  // 延平北路 / 西門老街
  { x1: -32, z1: -230, x2: -32, z2: 230, width: 8 },   // 西側文青老巷
  { x1: 0, z1: -230, x2: 0, z2: 230, width: 14 },      // 忠孝大道中央幹道
  { x1: 32, z1: -230, x2: 32, z2: 230, width: 8 },    // 東側美食後巷
  { x1: 65, z1: -230, x2: 65, z2: 230, width: 12 },   // 重慶南路金融街
  { x1: 125, z1: -230, x2: 125, z2: 230, width: 12 },  // 東環夜市大道

  // 5 East-West Cross Boulevards (Connecting all vertical avenues into complete loops!)
  { x1: -125, z1: -230, x2: 125, z2: -230, width: 14 }, // 北門圓環大道 (北環)
  { x1: -125, z1: -115, x2: 125, z2: -115, width: 12 }, // 南京西路
  { x1: -125, z1: 0, x2: 125, z2: 0, width: 14 },       // 中正大道十字路口
  { x1: -125, z1: 115, x2: 125, z2: 115, width: 12 },   // 和平西路
  { x1: -125, z1: 230, x2: 125, z2: 230, width: 14 }    // 南環水岸大道 (南環)
];

export const LANDMARKS = [
  { id: 'river', name: '榕樹河堤水岸', x: -125, z: -115 },
  { id: 'sunset', name: '夕照觀景道', x: -125, z: 115 },
  { id: 'homes', name: '重慶金融書街', x: 65, z: -115 },
  { id: 'market', name: '東環燈籠夜市', x: 125, z: 115 },
  { id: 'north', name: '北門古蹟圓環', x: 0, z: -230 },
  { id: 'south', name: '南環水岸大道', x: 65, z: 230 }
];

export function expandWorld(scene, factory, colliders) {
  // Broad green lawn / foundation ground
  box(scene, 330, 0.1, 570, paint(0x849579), 0, -0.12, 0);

  // Render secondary asphalt roads and lane markings
  for (const r of ROADS) {
    const vertical = r.x1 === r.x2;
    const length = Math.hypot(r.x2 - r.x1, r.z2 - r.z1);
    box(scene, vertical ? r.width : length + r.width, 0.025, vertical ? length + r.width : r.width,
      factory.materials.asphalt, (r.x1 + r.x2) / 2, -0.015, (r.z1 + r.z2) / 2);

    // Yellow dashed road center lines along outer avenues
    if (vertical && Math.abs(r.x1) >= 65) {
      for (let z = -220; z <= 220; z += 8) {
        if ([-230, -115, 0, 115, 230].some(c => Math.abs(c - z) < 10)) continue;
        box(scene, 0.15, 0.015, 3.5, paint(0xffeb3b), r.x1, 0.02, z);
      }
    }
    if (!vertical && Math.abs(r.z1) >= 115) {
      for (let x = -118; x < 120; x += 8) {
        if ([-125, -65, 0, 65, 125].some(c => Math.abs(c - x) < 10)) continue;
        box(scene, 3.5, 0.015, 0.15, paint(0xffeb3b), x, 0.02, r.z1);
      }
    }
  }

  // Western River & Promenade Railing along X = -145
  box(scene, 24, 0.06, 540, paint(0x427b88, 0.23), -146, -0.03, 0);
  box(scene, 0.35, 0.9, 530, paint(0xd3cab1), -135, 0.45, 0);
  colliders.push({ minX: -135.3, maxX: -134.7, minZ: -275, maxZ: 275, type: 'wall' });

  // Trees and lights along riverside avenue
  for (let z = -210; z <= 210; z += 28) {
    if ([-230, -115, 0, 115, 230].some(c => Math.abs(c - z) < 14)) continue;
    const tree = createTree(); tree.position.set(-131, 0, z); scene.add(tree);
    colliders.push({ minX: -131.7, maxX: -130.3, minZ: z - 0.7, maxZ: z + 0.7, type: 'box' });
  }

  // Eastern night market shophouses and food stalls
  for (let z = -210; z <= 210; z += 26) {
    if ([-230, -115, 0, 115, 230].some(c => Math.abs(c - z) < 14)) continue;
    if (z < 0) {
      const home = factory.createTaiwanBuilding(12, 10 + (Math.abs(z) % 4) * 2, 12, '金融商辦', '重慶南路');
      home.position.set(137, 0, z); home.rotation.y = -Math.PI / 2; scene.add(home);
      colliders.push({ minX: 131, maxX: 143, minZ: z - 6, maxZ: z + 6, type: 'wall' });
    } else {
      const stall = createFoodStall(factory, ['大腸包小腸', '排骨酥麵', '碳烤雞排', '手工愛玉'][(z / 26 | 0) % 4], 0x9c5542);
      stall.position.set(133, 0, z); stall.rotation.y = -Math.PI / 2; scene.add(stall);
      colliders.push({ minX: 131.5, maxX: 134.5, minZ: z - 2, maxZ: z + 2, type: 'box' });
    }
  }

  // North & South Perimeter Pocket Parks
  for (const z of [-250, 250]) {
    box(scene, 220, 0.12, 9, paint(0x98aa79), 0, 0, z);
    for (const x of [-90, -50, -10, 30, 70]) {
      const tree = createTree(); tree.position.set(x, 0, z); scene.add(tree);
      box(scene, 2.4, 0.16, 0.7, paint(0x86644c), x + 4, 0.6, z);
      box(scene, 2.4, 0.6, 0.12, paint(0x86644c), x + 4, 0.95, z + 0.3);
      colliders.push({ minX: x - 0.7, maxX: x + 0.7, minZ: z - 0.7, maxZ: z + 0.7, type: 'box' });
      colliders.push({ minX: x + 2.8, maxX: x + 5.2, minZ: z - 0.4, maxZ: z + 0.4, type: 'box' });
    }
  }

  // 6 Exploration Landmark Pillars
  for (const p of LANDMARKS) {
    const marker = new THREE.Group();
    box(marker, 0.2, 3.8, 0.2, paint(0x3f5d54), 0, 1.9, 0);
    const label = sign(marker, factory, p.name, '探索地標・集章打卡', 4.5, 1.2, 0, 3.5, 0);
    const reverseLabel = label.clone(); reverseLabel.position.z = -0.081; reverseLabel.rotation.y = Math.PI; marker.add(reverseLabel);
    marker.position.set(p.x, 0, p.z); scene.add(marker);
    colliders.push({ minX: p.x - 0.3, maxX: p.x + 0.3, minZ: p.z - 0.3, maxZ: p.z + 0.3, type: 'box' });
  }

  // North & South Boundary Walls
  for (const z of [-274, 274]) {
    box(scene, 312, 0.8, 0.5, paint(0xc4bba2), 0, 0.4, z);
    colliders.push({ minX: -155, maxX: 155, minZ: z - 0.3, maxZ: z + 0.3, type: 'wall' });
  }

  // East Boundary Wall
  box(scene, 0.5, 0.8, 548, paint(0xc4bba2), 154, 0.4, 0);
  colliders.push({ minX: 153.7, maxX: 154.3, minZ: -275, maxZ: 275, type: 'wall' });
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
