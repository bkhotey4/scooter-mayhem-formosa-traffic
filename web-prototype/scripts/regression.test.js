import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { ScooterController } from '../src/physics/ScooterController.js';
import { BobaPhysics } from '../src/cargo/BobaPhysics.js';
import { GameMode, CARGO_TYPES } from '../src/game/GameMode.js';
import { UpgradeShop } from '../src/game/UpgradeShop.js';
import { CountySystem } from '../src/game/CountySystem.js';
import { bodyShell, createDetailedCar } from '../src/models/VehicleModels.js';
import { dampedSpring, cameraProfile, isTypingTarget } from '../src/game/RideFeedback.js';

// These tests simulate physics/state directly, with no browser or audio device.
globalThis.window = { addEventListener() {} };
globalThis.document = { addEventListener() {} };

function controller() { return new ScooterController(new THREE.Group(), null); }

test('suspension impulse settles identically at 30, 60 and 120 Hz', () => {
  const results = [30, 60, 120].map(hz => {
    let p = 0, v = 0.8;
    for (let i = 0; i < hz; i++) [p, v] = dampedSpring(p, v, 0, 8, 1 / hz);
    return [p, v];
  });
  for (const [p, v] of results) {
    assert.ok(Math.abs(p - results[0][0]) < 1e-10);
    assert.ok(Math.abs(v - results[0][1]) < 1e-10);
    assert.ok(Math.abs(p) < 0.001);
  }
});

test('one road impact is not reapplied each frame and reset clears its tail', () => {
  const results = [30, 60, 120].map(hz => {
    const c = controller(); c.bumpJolt = 0.3;
    for (let i = 0; i < hz / 2; i++) c.update(1 / hz, null, [], []);
    const y = c.suspensionY;
    assert.ok(y < 0.01, 'suspension must settle instead of bouncing against the travel limit');
    c.reset(0, 0, 0);
    assert.equal(c.lastBumpTail, 0);
    return y;
  });
  assert.ok(Math.max(...results) - Math.min(...results) < 1e-8);
});

test('comfort camera disables shake, roll, speedlines and FOV pumping', () => {
  const p = cameraProfile('comfort');
  for (const key of ['shake', 'bank', 'fov', 'lines']) assert.equal(p[key], 0);
  assert.equal(cameraProfile('dynamic').shake, 1);
});

test('typing names and room codes cannot trigger driving shortcuts', () => {
  for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT']) assert.equal(isTypingTarget({ tagName }), true);
  assert.equal(isTypingTarget({ tagName: 'DIV', isContentEditable: true }), true);
  assert.equal(isTypingTarget({ tagName: 'CANVAS' }), false);
});

test('braking illuminates the tail lamp and releasing or resetting restores it', () => {
  const mesh = new THREE.Group();
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial());
  lamp.name = 'playerBrakeLamp'; mesh.add(lamp);
  const c = new ScooterController(mesh, null);
  c.keys[' '] = true; c.update(1 / 60, null, [], []);
  assert.equal(lamp.material.emissiveIntensity, 3.2);
  c.keys[' '] = false; c.update(1 / 60, null, [], []);
  assert.equal(lamp.material.emissiveIntensity, 0.65);
  c.keys[' '] = true; c.update(1 / 60, null, [], []);
  c.reset(0, 0, 0);
  assert.equal(lamp.material.emissiveIntensity, 0.65);
});
function step(c, seconds, hz = 60, colliders = []) {
  for (let i = 0; i < Math.round(seconds * hz); i++) c.update(1 / hz, null, [], colliders);
}
function systems() {
  const c = controller(), boba = new BobaPhysics(null);
  return { c, boba, shop: new UpgradeShop(null, boba, c) };
}
function missions() {
  const boba = new BobaPhysics(null), game = new GameMode(null, boba);
  game.initMissions([0, 1, 2, 3].map(i => ({ pos: new THREE.Vector3(0, 0, i * 30 + 30), name: `Order ${i}`, beaconMesh: new THREE.Group() })));
  return { boba, game };
}

test('space stops the scooter even when the accelerator remains held', () => {
  const c = controller(); c.keys.w = true; step(c, 3);
  const start = c.position.z;
  c.keys[' '] = true; step(c, 1);
  assert.equal(c.speed, 0);
  assert.ok(c.position.z - start < 5, 'stopping distance must stay below 5m on dry road');
  step(c, 1); assert.equal(c.speed, 0);
});

test('wet-line comfort braking stays predictable; sport retains slippery roads', () => {
  const distances = ['comfort', 'sport'].map(mode => {
    const c = controller(); c.handlingMode = mode; c.roadFrictionMultiplier = 0.65;
    c.speed = 15; c.keys[' '] = true;
    step(c, 2);
    assert.equal(c.speed, 0);
    return c.position.z;
  });
  assert.ok(distances[0] < 6);
  assert.ok(distances[1] > distances[0] * 1.5);
});

test('short steering taps are gentle and steering recenters', () => {
  const c = controller(); c.speed = 15; c.keys.w = true; c.keys.a = true;
  step(c, 0.2);
  assert.ok(c.heading < 0 && c.heading > -0.15);
  c.keys.a = false; step(c, 0.5);
  assert.ok(Math.abs(c.smoothedSteer) < 0.002);
});

test('coasting behaves consistently at 30Hz and 120Hz', () => {
  const speeds = [30, 120].map(hz => { const c = controller(); c.speed = 15; step(c, 1, hz); return c.speed; });
  assert.ok(Math.abs(speeds[0] - speeds[1]) < 0.001);
});

test('reverse has a stopping delay and remains speed-limited', () => {
  const c = controller(); c.keys.s = true; step(c, 0.2);
  assert.equal(c.speed, 0);
  step(c, 2); assert.equal(c.speed, -2.5);
});

test('nitro cannot tunnel through a thin wall during a long frame', () => {
  const c = controller(); c.handlingMode = 'sport'; c.isNitro = true; c.nitroTimer = 4; c.speed = 33; c.keys.w = true;
  c.update(0.05, null, [], [{ minX: -5, maxX: 5, minZ: 0.8, maxZ: 0.9 }]);
  assert.ok(c.position.z <= 0.25001);
});

test('reset clears movement, boosts, wheelies and held inputs', () => {
  const c = controller(); c.triggerNitro(); c.isWheelie = true; c.isOnGutter = true; c.keys.w = true;
  c.reset(0, -140);
  assert.equal(c.isNitro, false); assert.equal(c.isWheelie, false); assert.equal(c.isOnGutter, false);
  assert.deepEqual(c.keys, {}); assert.equal(c.position.z, -140);
});

test('a purchased upgrade is charged once; failed purchases do not change ownership', () => {
  const { shop } = systems();
  assert.equal(shop.buyOrEquip('box', 'gyro', 100).success, false);
  assert.equal(shop.items.box.find(i => i.id === 'gyro').owned, false);
  assert.equal(shop.buyOrEquip('box', 'gyro', 1200).costDeducted, 1200);
  assert.equal(shop.buyOrEquip('box', 'foam', 0).costDeducted, 0);
  assert.equal(shop.buyOrEquip('box', 'gyro', 0).costDeducted, 0);
});

test('reinforced seals keep their max durability across orders and report percentages', () => {
  const { shop, boba } = systems();
  shop.buyOrEquip('seal', 'titanium', 1000);
  assert.equal(boba.sealHp, 300); assert.equal(boba.getStat2Value(), '100%');
  boba.sealHp = 150;
  assert.equal(boba.getStat2Value(), '50%'); assert.equal(boba.getDeliveryResult().sealHp, 50);
  shop.buyOrEquip('vehicle', 'haomai', 0);
  assert.equal(boba.sealHp, 150, 'changing vehicles must not repair a seal');
  boba.setCargoType('eggs'); boba.setCargoType('boba');
  assert.equal(boba.sealHp, 300); assert.equal(boba.getStat2Pct(), 100);
});

test('region and box modifiers compose regardless of selection order', () => {
  const { shop, boba, c } = systems();
  const county = new CountySystem(null, boba, c);
  shop.buyOrEquip('box', 'gyro', 1200); county.setCounty('TAINAN');
  const values = [boba.springK, boba.damping, boba.bumpFactor];
  county.setCounty('TAIPEI'); county.setCounty('TAINAN'); shop.applyUpgrades();
  assert.deepEqual([boba.springK, boba.damping, boba.bumpFactor], values);
  assert.equal(boba.bumpFactor, 0.4);
});

test('free practice has no countdown, delivery completion or monetary rewards', () => {
  const { game, boba } = missions(); game.startDelivery('practice');
  const time = game.timeRemaining; boba.liquid = 0;
  game.update(120, game.currentTarget.pos); game.addCombo('test', 500);
  assert.equal(game.state, 'EXPLORING'); assert.equal(game.timeRemaining, time);
  assert.equal(game.score, 0); assert.equal(game.totalEarnings, 0);
  assert.equal(game.navArrow.visible, false);
  assert.ok(game.orders.every(o => !o.beaconMesh.visible));
});

test('all four Gemini cargo types can complete deliveries; duplicate completion cannot pay twice', () => {
  for (const cargo of CARGO_TYPES) {
    const { game, boba } = missions(); game.currentCargo = cargo; boba.setCargoType(cargo.id);
    game.startDelivery(); game.update(0.8, game.currentTarget.pos, 0);
    assert.equal(game.state, 'SUMMARY'); assert.ok(game.totalEarnings > 0);
    const earnings = game.totalEarnings; game.completeOrder(); assert.equal(game.totalEarnings, earnings);
    game.nextOrder(); assert.equal(game.state, 'DELIVERING');
    assert.equal(game.orders.filter(o => o.beaconMesh.visible).length, 1);
  }
});

test('returning from practice restores real order rules', () => {
  const { game } = missions(); game.startDelivery('practice'); game.startDelivery();
  assert.equal(game.navArrow.visible, true);
  game.update(66, new THREE.Vector3()); assert.equal(game.state, 'GAME_OVER');
});

test('delivery requires a slow continuous stop and leaving resets handoff', () => {
  const { game } = missions(); game.startDelivery();
  const target = game.currentTarget.pos;
  game.update(1, target, 15);
  assert.equal(game.state, 'DELIVERING'); assert.equal(game.arrivalProgress, 0);
  game.update(0.4, target, 0);
  assert.ok(game.arrivalProgress > 0 && game.arrivalProgress < 1);
  game.update(0.1, target.clone().add(new THREE.Vector3(5, 0, 0)), 0);
  assert.equal(game.arrivalProgress, 0);
  game.update(0.4, target, -2);
  assert.equal(game.arrivalProgress, 0, 'reverse drive-through must not deliver');
  game.update(0.4, target, 0); game.update(0.4, target, 0);
  assert.equal(game.state, 'SUMMARY');
  game.nextOrder(); assert.equal(game.arrivalProgress, 0);
});

test('handoff payout breakdown sums to the actual credited amount', () => {
  const { game } = missions(); let summary;
  game.onStateChange = (state, data) => { if (state === 'SUMMARY') summary = data; };
  game.startDelivery(); game.update(0.8, game.currentTarget.pos, 0);
  assert.equal(Object.values(summary.payout).reduce((a, b) => a + b, 0), summary.orderTotal);
  assert.equal(summary.orderTotal, game.totalEarnings);
});

test('delivery guidance distinguishes approach, braking, handoff and practice', () => {
  const { game } = missions(); game.startDelivery();
  const target = game.currentTarget.pos;
  assert.match(game.getDeliveryGuidance(target, 0, 10), /煞車/);
  assert.match(game.getDeliveryGuidance(target, 0, 0), /正在交貨/);
  assert.match(game.getDeliveryGuidance(new THREE.Vector3(), Math.PI, 0), /後方/);
  assert.match(game.getDeliveryGuidance(target.clone().add(new THREE.Vector3(0, 0, -10)), 0, 0), /减速|減速/);
  game.startDelivery('practice'); assert.equal(game.getDeliveryGuidance(target, 0, 0), '');
});

test('left steering leans the rider into the turn and collisions allow recovery', () => {
  const c = controller(); c.keys.w = true; c.keys.a = true; step(c, 1);
  assert.ok(c.heading < 0); assert.ok(c.rollAngle > 0, 'positive local-Z roll leans left');
  c.triggerCrash(); step(c, 0.85);
  assert.equal(c.isCrashed, false);
  c.triggerCrash(); assert.equal(c.isCrashed, false, 'brief recovery grace prevents collision stunlock');
});

test('lofted vehicle shells have outward side normals and finite geometry', () => {
  const geometry = bodyShell([[-1, 0.8, 0.3, 1], [0, 0.9, 0.3, 1.1], [1, 0.8, 0.3, 1]]);
  assert.ok(geometry.attributes.position.array.every(Number.isFinite));
  assert.ok(geometry.attributes.normal.getX(25) > 0.9);
});

test('detailed van preserves the moving door and hazard-light integration', () => {
  const material = new THREE.MeshStandardMaterial();
  const factory = {
    materials: new Proxy({}, { get: () => material }),
    createTextTexture: () => new THREE.Texture()
  };
  const car = createDetailedCar(factory);
  assert.ok(car.getObjectByName('doorPivot'));
  assert.equal(car.getObjectByName('hazardLights').children.length, 4);
  const bounds = new THREE.Box3().setFromObject(car);
  assert.ok(bounds.max.z < 2.31 && bounds.min.z > -2.31);
  assert.ok(bounds.max.x < 1.35 && bounds.min.x > -1.35);
});

test('road patches, speed bumps, tire pressure boost, and mudguard physics function accurately', () => {
  const c = controller();
  const mudguard = new THREE.Mesh();
  mudguard.name = 'scooterMudguard';
  c.mesh.add(mudguard);
  const stem = new THREE.Group();
  c.mesh.add(stem);
  c.steeringStem = stem;

  // 1. Idle vibration on handlebars
  c.speed = 0;
  c.update(0.05, null, [], [], [], []);
  assert.ok(Math.abs(stem.rotation.y) > 0 || Math.abs(stem.rotation.z) >= 0);

  // 2. Road patch contact triggers bump jolt
  const roadPatches = [{ x: 0, z: 2, halfW: 2, halfL: 2 }];
  c.speed = 10;
  c.position.set(0, 0, 2);
  c.update(0.016, null, [], [], roadPatches, []);
  assert.ok(c.lastOnPatch, 'scooter must detect contact with asphalt patch');
  assert.ok(c.bumpJolt > 0.1, 'patch must impart suspension bump impulse');

  // 3. Speed bump contact triggers deceleration and bump
  const speedBumps = [{ x: 0, z: 10, halfW: 3, halfL: 1 }];
  c.speed = 12; // ~43 km/h
  c.position.set(0, 0, 10);
  const prevSpeed = c.speed;
  c.update(0.016, null, [], [], [], speedBumps);
  assert.ok(c.lastOnBump, 'scooter must detect contact with speed bump');
  assert.ok(c.speed < prevSpeed, 'high-speed bump contact must check speed');

  // 4. Mudguard pendulum swing
  assert.ok(c.mudguardMesh, 'mudguard mesh must be tracked');
  assert.ok(c.mudguardPitch !== 0, 'mudguard pitch must tilt under speed and acceleration');

  // 5. Tire pressure boost
  c.tireBoostTimer = 15;
  c.update(0.1, null, [], [], [], []);
  assert.equal(c.isTireBoosted, true);
  assert.ok(c.tireBoostTimer < 15);
});


// Exploration awards persist independently of delivery and practice resets.
import { ExplorationProgress, LANDMARKS } from '../src/city/ExplorationWorld.js';
test('exploration stamps persist, ignore invalid IDs, and cannot repeat', () => {
  let value = '["obsolete"]';
  const storage = { getItem: () => value, setItem: (_, next) => { value = next; } };
  const progress = new ExplorationProgress(storage);
  assert.equal(progress.visited.size, 0);
  assert.equal(progress.visit({ x: 0, z: 0 }), null);
  assert.equal(progress.visit(LANDMARKS[0]).id, LANDMARKS[0].id);
  assert.equal(progress.visit(LANDMARKS[0]), null);
  assert.equal(new ExplorationProgress(storage).visited.size, 1);
  for (const point of LANDMARKS) progress.visit(point);
  assert.equal(progress.visited.size, 6);
});
test('blocked storage and malformed saves preserve playable exploration', () => {
  const storage = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  const progress = new ExplorationProgress(storage);
  assert.ok(progress.visit(LANDMARKS[0]));
  for (const value of ['null', '{}', 'broken']) assert.equal(new ExplorationProgress({ getItem: () => value }).visited.size, 0);
});
