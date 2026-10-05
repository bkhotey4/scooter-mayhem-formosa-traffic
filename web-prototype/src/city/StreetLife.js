import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { box, part, rod, paint, sign, createTree, createFoodStall, createLantern, createTempleGate } from '../models/StreetArt.js';

export const DISTRICTS = [
  { name: '民生早餐街', sub: '豆漿香・騎樓晨光', maxZ: -60 },
  { name: '福安廟埕夜市', sub: '燈籠巷・街邊小吃', maxZ: 65 },
  { name: '榕樹老城區', sub: '老店招牌・慢行生活', maxZ: Infinity }
];

export function enrichStreet(scene, factory, colliders) {
  const steel = paint(0x384c4c, 0.45, 0.5);
  for (let z = -162; z < 176; z += 28) {
    if (Math.abs(z - (-90)) < 12 || Math.abs(z - 0) < 12 || Math.abs(z - 90) < 12) continue;
    for (const side of [-1, 1]) {
      const lamp = new THREE.Group();
      rod(lamp, [0, 0.3, 0], [0, 6.2, 0], 0.065, steel);
      rod(lamp, [0, 6.2, 0], [-side * 1.7, 6.2, 0], 0.055, steel);
      box(lamp, 1.05, 0.13, 0.42, factory.materials.windowWarm, -side * 1.5, 6.1, 0, 0.04);
      lamp.position.set(side * 8.6, 0, z);
      scene.add(lamp);
      // Planters are outside the driving corridor; give their bases solid bounds.
      const tree = createTree();
      tree.position.set(side * 8.8, 0, z + 5);
      scene.add(tree);
      colliders.push({ minX: side * 8.8 - 0.6, maxX: side * 8.8 + 0.6, minZ: z + 4.4, maxZ: z + 5.6, type: 'box' });
    }
  }
  const stalls = [
    [-8.3, -122, '手作飯糰', 0x3e7772], [8.3, -80, '古早味豆花', 0xb78a4c],
    [-8.3, -8, '炭烤香腸', 0xb65240], [8.3, 32, '現炸鹽酥雞', 0xb78a4c],
    [-8.3, 58, '阿婆地瓜球', 0x3e7772], [8.3, 130, '冰涼愛玉', 0x49657c]
  ];
  stalls.forEach(([x, z, title, color]) => {
    const stall = createFoodStall(factory, title, color);
    stall.position.set(x, 0.25, z);
    stall.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(stall);
    colliders.push({ minX: x - 0.75, maxX: x + 0.75, minZ: z - 1.4, maxZ: z + 1.4, type: 'box' });
  });
  const gate = createTempleGate(factory);
  gate.position.z = 4;
  gate.rotation.y = Math.PI;
  scene.add(gate);
  for (const x of [-6.5, 6.5]) colliders.push({ minX: x - 0.5, maxX: x + 0.5, minZ: 3.5, maxZ: 4.5, type: 'box' });
  for (const z of [-48, -24, 24, 48]) {
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-10, 7, z), new THREE.Vector3(0, 5.8, z), new THREE.Vector3(10, 7, z)]);
    part(scene, new THREE.TubeGeometry(curve, 20, 0.025, 5, false), steel);
    for (let i = 1; i < 10; i++) {
      const lantern = createLantern();
      lantern.position.copy(curve.getPoint(i / 10));
      lantern.position.y -= 0.4;
      scene.add(lantern);
    }
  }
  // Utility lines and distant buildings give depth beyond the two street walls.
  for (const side of [-1, 1]) {
    const cable = new THREE.CatmullRomCurve3(Array.from({ length: 15 }, (_, i) => new THREE.Vector3(side * 9.4, 9 + i % 2, -180 + i * 26)));
    part(scene, new THREE.TubeGeometry(cable, 80, 0.025, 4, false), steel);
  }
}


export function batchStaticStreet(scene, roots) {
  scene.updateMatrixWorld(true);
  const batches = new Map(), sourceMeshes = [];
  for (const root of roots) root.traverse(o => {
    if (!o.isMesh || Array.isArray(o.material) || o.material.transparent || !o.geometry.attributes.normal || !o.geometry.attributes.uv) return;
    const position = o.getWorldPosition(new THREE.Vector3());
    const key = `${o.material.uuid}:${Math.floor(position.z / 40)}`;
    if (!batches.has(key)) batches.set(key, { material: o.material, geometries: [] });
    const geometry = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    geometry.applyMatrix4(o.matrixWorld);
    batches.get(key).geometries.push(geometry);
    sourceMeshes.push(o);
  });
  for (const batch of batches.values()) {
    const merged = mergeGeometries(batch.geometries);
    batch.geometries.forEach(g => g.dispose());
    const mesh = new THREE.Mesh(merged, batch.material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = 'static-street-batch';
    scene.add(mesh);
  }
  sourceMeshes.forEach(o => o.removeFromParent());
  // Geometry may be shared by clones; release each only after every copy merged.
  const retained = new Set();
  scene.traverse(o => { if (o.isMesh) retained.add(o.geometry); });
  new Set(sourceMeshes.map(o => o.geometry)).forEach(g => { if (!retained.has(g)) g.dispose(); });
}

export class StreetLife {
  constructor(scene, factory, gameMode) {
    this.gameMode = gameMode;
    this.elapsed = 0;
    this.collected = 0;
    this.hud = document.getElementById('street-progress');
    this.districtHud = document.getElementById('district-name');
    this.detailHud = document.getElementById('district-detail');
    this.tokens = [];
    const places = [[2.4, -118], [-2.4, -72], [2.4, -38], [-2.4, 12], [2.4, 64], [-2.4, 122]];
    const names = ['飯糰', '豆花', '香腸', '雞排', '地瓜球', '愛玉'];
    const tokenGeo = new THREE.TorusGeometry(0.48, 0.055, 8, 24);
    places.forEach(([x, z], i) => {
      const mesh = new THREE.Group();
      part(mesh, tokenGeo, factory.materials.neonYellow);
      const cup = part(mesh, new THREE.CylinderGeometry(0.17, 0.12, 0.38, 12), paint(0xe4bd78));
      box(mesh, 0.32, 0.025, 0.32, paint(0xf6e5c5), 0, 0.2, 0, 0.01);
      rod(mesh, [0.04, 0.15, 0], [0.1, 0.44, 0], 0.018, paint(0x984b43));
      for (let p = 0; p < 5; p++) part(mesh, new THREE.SphereGeometry(0.03, 6, 4), paint(0x493329), (p - 2) * 0.045, -0.11, 0.11);
      mesh.position.set(x, 1.05, z);
      scene.add(mesh);
      this.tokens.push({ mesh, x, z, name: names[i], collected: false });
    });
    this.renderProgress();
  }
  reset() {
    this.collected = 0;
    this.tokens.forEach(t => { t.collected = false; t.mesh.visible = true; });
    this.renderProgress();
  }
  renderProgress() {
    if (this.hud) this.hud.textContent = this.collected === 6 ? `在地美食家！全套集章完成${this.gameMode.state === 'EXPLORING' ? '（練習）' : ' +$300'}` : `美食集章 ${this.collected} / 6 · 沿路收集金色珍奶`;
  }
  update(dt, controller, active) {
    this.elapsed += dt;
    let district;
    if (Math.abs(controller.position.z) > 174) {
      district = { name: controller.position.z < 0 ? '北門公園環道' : '南環休息站', sub: '環線串接・自由探索' };
    } else if (controller.position.x < -54) {
      district = { name: '榕樹河堤', sub: '河岸綠蔭・夕照慢行' };
    } else if (controller.position.x > 54) {
      district = { name: controller.position.z < -10 ? '花磚住宅街' : '燈籠夜市支路', sub: '巷弄生活・探索集章' };
    } else if (controller.position.x < -20) {
      district = { name: '西巷老街捷徑', sub: '防火窄弄・文青老宅' };
    } else if (controller.position.x > 20) {
      district = { name: '東側夜市後巷', sub: '飄香攤販・紅燈籠・鑽縫避車潮' };
    } else {
      district = DISTRICTS.find(d => controller.position.z < d.maxZ);
    }
    if (!this.currentDistrict || this.currentDistrict.name !== district.name) {
      this.currentDistrict = district;
      if (this.districtHud) this.districtHud.textContent = district.name;
      if (this.detailHud) this.detailHud.textContent = district.sub;
    }
    for (const t of this.tokens) {
      if (t.collected) continue;
      t.mesh.rotation.y = this.elapsed * 1.3;
      t.mesh.position.y = 1.05 + Math.sin(this.elapsed * 2 + t.z) * 0.12;
      if (active && Math.hypot(controller.position.x - t.x, controller.position.z - t.z) < 1.25) {
        t.collected = true;
        t.mesh.visible = false;
        this.collected++;
        this.gameMode.addCombo(`${t.name}集章`, 150);
        if (this.collected === 6) {
          this.gameMode.addCombo('在地美食家・全套完成', 1200);
          if (this.gameMode.state === 'DELIVERING') this.gameMode.totalEarnings += 300;
        }
        this.renderProgress();
      }
    }
  }
}
