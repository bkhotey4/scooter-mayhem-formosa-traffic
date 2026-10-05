// ScooterController.js - Arcade 2-Wheel Scooter Physics, Leaning & Drifting
import * as THREE from 'three';

export class ScooterController {
  constructor(scooterMesh, soundManager) {
    this.mesh = scooterMesh;
    this.sound = soundManager;

    // Transform & Motion
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.heading = 0; // Yaw angle in radians (0 = forward +Z)
    this.speed = 0; // m/s (1 m/s = 3.6 km/h)
    this.maxSpeed = 20; // ~72 km/h
    this.boostSpeed = 26; // ~94 km/h (Gutter boost)

    // Acceleration & Braking
    this.acceleration = 18; // m/s^2
    this.brakeForce = 28;
    this.drag = 0.985;
    this.reverseMax = -5;

    // Steering & Leaning (壓車)
    this.steerInput = 0;
    this.throttleInput = 0;
    this.driftInput = false;
    this.hornPressed = false;
    this.wheelieInput = false;

    this.rollAngle = 0; // Lean angle in radians
    this.pitchAngle = 0; // Wheelie pitch angle in radians (front wheel lifted)
    this.maxLean = THREE.MathUtils.degToRad(32);
    this.maxPitch = THREE.MathUtils.degToRad(38);
    this.yawRate = 0;

    // Wheelie state
    this.isWheelie = false;
    this.wheelieTimer = 0;
    this.isPlateHidden = false; // License plate angled downwards to hide from cameras!

    // Mechanics
    this.isOnGutter = false;
    this.gutterBoostTimer = 0;
    this.isCrashed = false;
    this.crashTimer = 0;
    this.bumpJolt = 0; // Vertical jolt transferred to cargo

    // Regional County Modifiers
    this.roadFrictionMultiplier = 1.0;
    this.externalRoll = 0; // Hsinchu crosswind tilt
    this.kaohsiungTurnEnabled = false;
    this.kaohsiungStep = 0;
    this.kaohsiungTimer = 0;

    // Upgrades
    this.equippedExhaust = 'stock'; // 'stock', 'white_iron'
    this.equippedBox = 'foam'; // 'foam', 'cushion', 'gyro'
    this.equippedMudguard = 'dream'; // 'dream', 'queen', 'try_me'

    // Visual sub-meshes
    this.steeringStem = this.mesh.getObjectByName('steeringStem');
    this.frontWheel = this.mesh.getObjectByName('frontWheel');
    this.rearWheel = this.mesh.getObjectByName('rearWheel');
    this.rider = this.mesh.getObjectByName('rider');

    // Particle system for tire smoke / sparks / nitro / wet spray
    this.particleGroup = new THREE.Group();
    this.tireParticles = [];
    this.sparkParticles = [];
    this.nitroParticles = [];
    this.waterParticles = [];
    this.initParticles();

    // Nitro Boost State (結冰水神力加速)
    this.isNitro = false;
    this.nitroTimer = 0;
    this.nitroSpeed = 33; // ~120 km/h!

    // Wet Thermal Marking Drift (熱拌白線滑移物理)
    this.isOnWetLine = false;
    this.wetDriftTimer = 0;
    this.isStormWeather = false;
    this.onWetDriftSuccess = null;

    // Input state
    this.keys = {};
    this.handlingMode = 'comfort';
    this.smoothedSteer = 0;
    this.reverseHold = 0;
    this.onComboCallback = null;
    this.setupInputs();
  }

  setupInputs() {
    window.addEventListener('blur', () => { this.keys = {}; this.hornPressed = false; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.keys = {}; });
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key.startsWith('Arrow') || e.key === 'Shift') {
        e.preventDefault();
      }
      if (e.key.toLowerCase() === 'h' && !this.hornPressed) {
        this.sound?.playHorn();
        this.hornPressed = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      if (e.key.toLowerCase() === 'h') {
        this.hornPressed = false;
      }
    });
  }

  initParticles() {
    // Tire smoke
    const smokeGeo = new THREE.DodecahedronGeometry(0.12, 0);
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.6 });
    for (let i = 0; i < 20; i++) {
      const p = new THREE.Mesh(smokeGeo, smokeMat.clone());
      p.visible = false;
      p.userData = { life: 0, maxLife: 0.5, vel: new THREE.Vector3() };
      this.particleGroup.add(p);
      this.tireParticles.push(p);
    }

    // Metal gutter sparks (水溝蓋火花)
    const sparkGeo = new THREE.BoxGeometry(0.04, 0.04, 0.08);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    for (let i = 0; i < 25; i++) {
      const sp = new THREE.Mesh(sparkGeo, sparkMat);
      sp.visible = false;
      sp.userData = { life: 0, maxLife: 0.3, vel: new THREE.Vector3() };
      this.particleGroup.add(sp);
      this.sparkParticles.push(sp);
    }

    // Nitro Blue Fire Flames (結冰水氮氣藍焰)
    const nitroGeo = new THREE.BoxGeometry(0.09, 0.09, 0.18);
    const nitroMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    for (let i = 0; i < 35; i++) {
      const np = new THREE.Mesh(nitroGeo, nitroMat);
      np.visible = false;
      np.userData = { life: 0, maxLife: 0.22, vel: new THREE.Vector3() };
      this.particleGroup.add(np);
      this.nitroParticles.push(np);
    }

    // Water spray particles (白線滑移水花噴濺)
    const waterGeo = new THREE.DodecahedronGeometry(0.08, 0);
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x81d4fa, transparent: true, opacity: 0.7 });
    for (let i = 0; i < 30; i++) {
      const wp = new THREE.Mesh(waterGeo, waterMat.clone());
      wp.visible = false;
      wp.userData = { life: 0, maxLife: 0.35, vel: new THREE.Vector3() };
      this.particleGroup.add(wp);
      this.waterParticles.push(wp);
    }
  }

  emitWaterSpray(pos) {
    const fwd = this.getForwardVector();
    for (let i = 0; i < 3; i++) {
      for (const wp of this.waterParticles) {
        if (!wp.visible) {
          wp.visible = true;
          wp.position.copy(pos);
          wp.position.x += (Math.random() - 0.5) * 0.25;
          wp.position.y = 0.08;
          wp.position.z += (Math.random() - 0.5) * 0.25;
          wp.material.opacity = 0.7;
          wp.userData.life = 0;
          wp.userData.vel.set(
            -fwd.x * 8 + (Math.random() - 0.5) * 3,
            1.2 + Math.random() * 1.4,
            -fwd.z * 8 + (Math.random() - 0.5) * 3
          );
          break;
        }
      }
    }
  }

  emitNitroFlames(pos) {
    const fwd = this.getForwardVector();
    for (let i = 0; i < 3; i++) {
      for (const np of this.nitroParticles) {
        if (!np.visible) {
          np.visible = true;
          np.position.copy(pos);
          np.position.x += (Math.random() - 0.5) * 0.15;
          np.position.y = 0.28;
          np.position.z += (Math.random() - 0.5) * 0.15;
          np.userData.life = 0;
          np.userData.vel.set(
            -fwd.x * 14 + (Math.random() - 0.5) * 2.5,
            0.6 + Math.random() * 0.8,
            -fwd.z * 14 + (Math.random() - 0.5) * 2.5
          );
          break;
        }
      }
    }
  }

  emitTireSmoke(pos) {
    for (const p of this.tireParticles) {
      if (!p.visible) {
        p.visible = true;
        p.position.copy(pos);
        p.position.x += (Math.random() - 0.5) * 0.2;
        p.position.y = 0.1;
        p.position.z += (Math.random() - 0.5) * 0.2;
        p.material.opacity = 0.6;
        p.userData.life = 0;
        p.userData.vel.set((Math.random() - 0.5) * 1.5, 1.2 + Math.random(), (Math.random() - 0.5) * 1.5);
        break;
      }
    }
  }

  emitGutterSparks(pos) {
    for (let i = 0; i < 3; i++) {
      for (const sp of this.sparkParticles) {
        if (!sp.visible) {
          sp.visible = true;
          sp.position.copy(pos);
          sp.position.x += (Math.random() - 0.5) * 0.15;
          sp.position.y = 0.05;
          sp.userData.life = 0;
          sp.userData.vel.set((Math.random() - 0.5) * 3, 2 + Math.random() * 2, -this.speed * 0.6 + (Math.random() - 0.5) * 3);
          break;
        }
      }
    }
  }

  update(dt, cityBounds, gutterPositions, colliders) {
    if (this.isCrashed) {
      this.crashTimer += dt;
      this.speed = THREE.MathUtils.lerp(this.speed, 0, dt * 5);
      if (this.crashTimer > 0.75) {
        this.isCrashed = false;
        this.crashTimer = 0;
      }
      this.updateParticles(dt);
      this.sound?.updateEngine(this.getSpeedKmH(), false);
      return;
    }

    // 1. Process Inputs
    let throttle = 0;
    if (this.keys['w'] || this.keys['arrowup']) throttle += 1;
    if (this.keys['s'] || this.keys['arrowdown']) throttle -= 1;

    let steer = 0;
    if (this.keys['a'] || this.keys['arrowleft']) steer += 1;
    if (this.keys['d'] || this.keys['arrowright']) steer -= 1;

    const brake = !!this.keys[' '];
    const comfort = this.handlingMode === 'comfort';
    // Space is a reliable brake. Deliberate sport riding can still tighten turns.
    const drift = brake && !comfort;
    this.smoothedSteer = THREE.MathUtils.damp(this.smoothedSteer, steer, steer === 0 ? 14 : 9, dt);
    steer = this.smoothedSteer;
    this.throttleInput = throttle;
    this.steerInput = steer;
    this.driftInput = drift;

    // Road thermal plastic marking check (雙黃線、外側白線、斑馬線)
    const onDoubleYellow = Math.abs(this.position.x) < 0.45;
    const onWhiteBorder = Math.abs(Math.abs(this.position.x) - 5.5) < 0.45;
    const onCrosswalk = (Math.abs(this.position.z - (-90)) < 4.5 || Math.abs(this.position.z - 0) < 4.5 || Math.abs(this.position.z - 90) < 4.5) && Math.abs(this.position.x) < 5.5;
    const onMarking = onDoubleYellow || onWhiteBorder || onCrosswalk;
    const isWetWeather = this.roadFrictionMultiplier < 0.88 || this.isStormWeather;

    this.isOnWetLine = onMarking && isWetWeather;
    const effectiveFriction = this.isOnWetLine
      ? (this.roadFrictionMultiplier * 0.38)
      : this.roadFrictionMultiplier;

    // 2. Acceleration / Deceleration & Nitro Boost
    let targetMaxSpeed = comfort ? Math.min(this.maxSpeed, 15.5) : this.maxSpeed;
    if (this.isNitro) {
      targetMaxSpeed = comfort ? 24 : this.nitroSpeed;
      this.nitroTimer -= dt;
      this.emitNitroFlames(this.position);
      if (this.nitroTimer <= 0) {
        this.isNitro = false;
      }
    } else if (this.isOnGutter) {
      targetMaxSpeed = comfort ? 18 : this.boostSpeed;
    }

    const currentAccel = this.acceleration * (comfort ? 0.48 : 0.8) * (this.isNitro ? 1.5 : 1);

    if (brake) {
      const braking = this.brakeForce * Math.max(0.4, effectiveFriction) * dt;
      this.speed = Math.sign(this.speed) * Math.max(0, Math.abs(this.speed) - braking);
      this.reverseHold = 0;
    } else if (throttle > 0) {
      this.reverseHold = 0;
      this.speed += currentAccel * throttle * dt;
    } else if (throttle < 0) {
      if (this.speed > 0.5) {
        // Friction multiplier affects braking (wet rainy roads double braking distance)
        this.speed = Math.max(0, this.speed - this.brakeForce * effectiveFriction * dt);
        this.reverseHold = 0;
        if (effectiveFriction < 0.8 && this.speed > 6) {
          // Wet road slide
          this.emitTireSmoke(this.position);
          this.sound?.playBrakeSqueal();
        } else if (this.speed > 10) {
          this.sound?.playBrakeSqueal();
        }
      } else {
        // Brief stop before reverse prevents accidental backwards launches.
        this.speed = Math.min(this.speed, 0);
        this.reverseHold += dt;
        if (this.reverseHold > 0.35) this.speed = Math.max(this.speed - currentAccel * 0.4 * dt, -2.5);
      }
    } else {
      this.reverseHold = 0;
      this.speed *= Math.exp(-(comfort ? 1.15 : 0.7) * effectiveFriction * dt);
      if (Math.abs(this.speed) < 0.1) this.speed = 0;
    }

    this.speed = THREE.MathUtils.clamp(this.speed, this.reverseMax, targetMaxSpeed);

    // 3. Steering & Yaw calculation
    // Scooters turn sharper at low-mid speeds; drift increases yaw rate
    const speedAbs = Math.abs(this.speed);
    const turnSensitivity = THREE.MathUtils.lerp(1.75, comfort ? 0.62 : 1.05, Math.min(speedAbs / 18, 1));
    const speedFactor = Math.min(speedAbs / 2.5, 1);
    const wetLineSlip = (this.isOnWetLine && speedAbs > 5.5 && (Math.abs(steer) > 0.25 || brake)) ? 1.65 : 1.0;
    this.yawRate = -steer * turnSensitivity * speedFactor * (drift ? 1.25 : 1) * wetLineSlip;

    if (Math.abs(this.speed) > 0.1) {
      this.heading += this.yawRate * dt * Math.sign(this.speed);
    }

    // Wet Line Drift Visuals, Audio & Combo
    if (this.isOnWetLine && speedAbs > 5.5 && (Math.abs(steer) > 0.25 || brake)) {
      this.emitWaterSpray(this.position);
      if (Math.random() < 0.22) {
        this.sound?.playWaterSplash();
      }
      this.wetDriftTimer += dt;
      if (this.wetDriftTimer > 0.65) {
        const comboTitle = this.roadFrictionMultiplier <= 0.7 ? '【雨港溜冰場神之漂移】白線水上漂！' : '【奪命白線滑移】極限水上漂！';
        const comboPts = this.roadFrictionMultiplier <= 0.7 ? 700 : 500;
        if (this.onComboCallback) this.onComboCallback(comboTitle, comboPts);
        if (this.onWetDriftSuccess) this.onWetDriftSuccess();
        this.wetDriftTimer = -2.5; // Cooldown to avoid repetitive spam in single slide
      }
    } else {
      this.wetDriftTimer = Math.max(0, this.wetDriftTimer - dt * 2);
    }

    // 3.5. Kaohsiung Left Turn (高雄式左轉) Maneuver Detection
    if (this.kaohsiungTurnEnabled && Math.abs(this.speed) > 8) {
      const nearIntersection = Math.abs(this.position.z - (-90)) < 15 || Math.abs(this.position.z - 0) < 15 || Math.abs(this.position.z - 90) < 15;
      if (nearIntersection && steer > 0.7) { // cutting hard left!
        this.kaohsiungTimer += dt;
        if (this.kaohsiungTimer > 0.6 && this.kaohsiungStep === 0) {
          this.kaohsiungStep = 1;
          if (this.onComboCallback) this.onComboCallback('【正宗高雄式左轉】港都霸王！', 1000);
          this.sound?.speak('正宗高雄式左轉啦！');
          setTimeout(() => { this.kaohsiungStep = 0; this.kaohsiungTimer = 0; }, 4000);
        }
      } else {
        this.kaohsiungTimer = 0;
      }
    }

    // 4. Scooter Leaning (壓車傾角) & Wheelie Pitch (翹孤輪) + Crosswind Roll
    // Leaning depends on steering rate and speed, reversed when drifting for counter-steering!
    const targetLean = drift
      ? steer * this.maxLean * 0.7 // Counter lean while drifting
      : -steer * this.maxLean * Math.min(Math.abs(this.speed) / this.maxSpeed, 1) * (comfort ? 0.65 : 1);

    // External crosswind roll pushes scooter chassis sideways
    this.rollAngle = THREE.MathUtils.lerp(this.rollAngle, targetLean + this.externalRoll, dt * 8);

    // Wheelie Trigger (Shift or Q)
    const wheelieRequested = (this.keys['shift'] || this.keys['q']) && this.speed > 5;
    if (wheelieRequested) {
      this.isWheelie = true;
      this.wheelieTimer += dt;
      this.pitchAngle = THREE.MathUtils.lerp(this.pitchAngle, this.maxPitch, dt * 6);
      this.isPlateHidden = (this.pitchAngle > 0.3);

      // Loop out crash if held too long without letting go!
      if (this.wheelieTimer > 4.2) {
        this.triggerCrash(10);
        this.sound?.speak('幹！翹孤輪翻車啦！');
      } else if (this.wheelieTimer > 1.5 && Math.random() < 0.05) {
        if (this.onComboCallback) this.onComboCallback('神之翹孤輪極限壓尾！', 600);
      }

      // Special Ability for "阿公瓦斯車": Gas Jet Propulsion
      if (this.equippedVehicle === 'gas_tank') {
        this.gasJetCooldown = Math.max(0, (this.gasJetCooldown || 0) - dt);
        if (wheelieRequested && this.gasJetCooldown <= 0) {
          this.gasJetCooldown = 3.5;
          this.speed = Math.min(this.speed + 5.5, this.maxSpeed + 4);
          this.emitTireSmoke(this.position);
          this.sound?.playGasHiss();
          this.sound?.speak('瓦斯噴射推進！');
          if (this.onComboCallback) this.onComboCallback('【阿公瓦斯氣閥噴射推進】！', 600);
        }
      }
    } else {
      this.isWheelie = false;
      this.wheelieTimer = 0;
      this.pitchAngle = THREE.MathUtils.lerp(this.pitchAngle, 0, dt * 10);
      this.isPlateHidden = false;
    }

    // 5. Update Position
    const forward = new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
    const distance = this.speed * dt;
    const substeps = Math.max(1, Math.ceil(Math.abs(distance) / 0.22));
    const deltaMove = forward.clone().multiplyScalar(distance / substeps);
    for (let step = 0; step < substeps; step++) {
      this.position.add(deltaMove);

    // 5.5. Solid Obstacle & Building Wall Collision Resolution (防穿牆物理推擠)
    if (colliders && colliders.length > 0) {
      const radius = 0.55; // Scooter collision radius
      for (const c of colliders) {
        const closestX = Math.max(c.minX, Math.min(this.position.x, c.maxX));
        const closestZ = Math.max(c.minZ, Math.min(this.position.z, c.maxZ));
        const dx = this.position.x - closestX;
        const dz = this.position.z - closestZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < radius * radius) {
          const dist = Math.sqrt(distSq);
          let nx = 0, nz = 0, pen = 0;

          if (dist > 0.0001) {
            nx = dx / dist;
            nz = dz / dist;
            pen = radius - dist;
          } else {
            // Inside box, push out to nearest edge
            const dl = this.position.x - c.minX;
            const dr = c.maxX - this.position.x;
            const db = this.position.z - c.minZ;
            const dtEdge = c.maxZ - this.position.z;
            const minEdge = Math.min(dl, dr, db, dtEdge);

            if (minEdge === dl) { nx = -1; nz = 0; pen = dl + radius; }
            else if (minEdge === dr) { nx = 1; nz = 0; pen = dr + radius; }
            else if (minEdge === db) { nx = 0; nz = -1; pen = db + radius; }
            else { nx = 0; nz = 1; pen = dtEdge + radius; }
          }

          // Push player out
          this.position.x += nx * pen;
          this.position.z += nz * pen;

          // Impact response
          const normalDot = (forward.x * nx + forward.z * nz) * Math.sign(this.speed);
          if (normalDot < -0.25 && Math.abs(this.speed) > 5) {
            if (Math.abs(this.speed) > 13) {
              this.triggerCrash(12);
              this.sound?.playCrash();
              this.sound?.speak('碰！撞牆啦！');
            } else {
              this.speed = 0;
              this.sound?.playCrash();
            }
            this.bumpJolt = 0.45;
          } else {
            this.speed *= 0.95;
          }
        }
      }
    }
      // Do not keep advancing after an impact stops or reverses the scooter.
      if (this.isCrashed || this.speed === 0 || Math.sign(this.speed) !== Math.sign(distance)) break;
    }

    // Keep within world bounds
    if (cityBounds) {
      this.position.x = THREE.MathUtils.clamp(this.position.x, cityBounds.minX, cityBounds.maxX);
      this.position.z = THREE.MathUtils.clamp(this.position.z, cityBounds.minZ, cityBounds.maxZ);
    }

    // 6. Check "水溝蓋跑法" (Gutter running boost)
    this.isOnGutter = false;
    if (gutterPositions) {
      for (const g of gutterPositions) {
        if (Math.abs(this.position.x - g.x) < 0.55 && Math.abs(this.position.z - g.z) < g.length / 2) {
          this.isOnGutter = true;
          this.emitGutterSparks(this.position);
          this.sound?.playGutterSparks();
          break;
        }
      }
    }

    // 7. Calculate Bump / Pothole Jolt
    // Taiwanese roads have wavy asphalt and gutter bumps
    this.bumpJolt = 0;
    if (this.isOnGutter) {
      this.bumpJolt = Math.random() * 0.15;
    } else if (!comfort && Math.random() < 1 - Math.exp(-2 * dt) && Math.abs(this.speed) > 5) {
      // Occasional road pothole bump (路面坑洞)
      this.bumpJolt = Math.random() * 0.25;
    }

    // 8. Apply Transforms to Mesh
    this.mesh.position.copy(this.position);
    this.mesh.position.y = 0.05 + this.bumpJolt * 0.5 + (this.pitchAngle * 0.25);

    // Scooter orientation: Heading (Y) + Leaning roll (Z) + Wheelie pitch (X)
    this.mesh.rotation.set(0, 0, 0);
    this.mesh.rotation.y = this.heading;
    this.mesh.rotateZ(this.rollAngle);
    this.mesh.rotateX(-this.pitchAngle);

    // Steering Handlebar Turn
    if (this.steeringStem) {
      this.steeringStem.rotation.y = -steer * 0.45;
    }

    // Wheel Rotation
    const wheelRotDelta = (this.speed * dt) / 0.24;
    if (this.frontWheel) this.frontWheel.rotation.x += wheelRotDelta;
    if (this.rearWheel) this.rearWheel.rotation.x += wheelRotDelta;

    // Drifting particles & smoke
    if (drift && Math.abs(this.speed) > 6) {
      this.emitTireSmoke(this.position);
      this.sound?.playBrakeSqueal();
    }

    // 9. Update sound engine
    this.sound?.updateEngine(this.getSpeedKmH(), throttle > 0);

    // 10. Update particle systems
    this.updateParticles(dt);
  }

  updateParticles(dt) {
    for (const p of this.tireParticles) {
      if (p.visible) {
        p.userData.life += dt;
        if (p.userData.life >= p.userData.maxLife) {
          p.visible = false;
        } else {
          p.position.addScaledVector(p.userData.vel, dt);
          p.material.opacity = (1 - p.userData.life / p.userData.maxLife) * 0.5;
        }
      }
    }

    for (const sp of this.sparkParticles) {
      if (sp.visible) {
        sp.userData.life += dt;
        if (sp.userData.life >= sp.userData.maxLife) {
          sp.visible = false;
        } else {
          sp.position.addScaledVector(sp.userData.vel, dt);
          sp.userData.vel.y -= 9.8 * dt;
        }
      }
    }

    for (const np of this.nitroParticles) {
      if (np.visible) {
        np.userData.life += dt;
        if (np.userData.life >= np.userData.maxLife) {
          np.visible = false;
        } else {
          np.position.addScaledVector(np.userData.vel, dt);
          np.scale.setScalar(1 - np.userData.life / np.userData.maxLife);
        }
      }
    }

    for (const wp of this.waterParticles) {
      if (wp.visible) {
        wp.userData.life += dt;
        if (wp.userData.life >= wp.userData.maxLife) {
          wp.visible = false;
        } else {
          wp.position.addScaledVector(wp.userData.vel, dt);
          wp.userData.vel.y -= 7.5 * dt;
          wp.material.opacity = (1 - wp.userData.life / wp.userData.maxLife) * 0.7;
        }
      }
    }
  }

  triggerNitro(duration = 5.0) {
    this.isNitro = true;
    this.nitroTimer = duration;
    this.sound?.speak('結冰水神力加持！氮氣全開！');
    if (this.onComboCallback) {
      this.onComboCallback('【結冰水神力加持】氮氣爆衝！', 1000);
    }
  }

  triggerCrash(knockbackForce = 12) {
    if (this.isCrashed) return;
    this.isCrashed = true;
    this.crashTimer = 0;
    const force = knockbackForce * (this.crashResistance || 1.0);
    this.speed = -force * 0.3; // bounce back
    this.rollAngle = (Math.random() > 0.5 ? 1 : -1) * (1.2 * (this.crashResistance || 1.0)); // fall sideways
    this.sound?.playCrash();
    this.sound?.speak(Math.random() > 0.5 ? '幹！開車不看路喔！' : '看三小啦！');
  }

  getSpeedKmH() {
    return Math.abs(Math.round(this.speed * 3.6));
  }

  getForwardVector() {
    return new THREE.Vector3(Math.sin(this.heading), 0, Math.cos(this.heading));
  }

  reset(x = 0, z = 0, heading = 0) {
    this.position.set(x, 0, z);
    this.heading = heading;
    this.speed = 0;
    this.rollAngle = 0;
    this.isCrashed = false;
    this.smoothedSteer = 0;
    this.yawRate = 0;
    this.pitchAngle = 0;
    this.reverseHold = 0;
    this.keys = {};
    this.mesh.position.copy(this.position);
    this.mesh.rotation.set(0, heading, 0);
  }

  updateVisualUpgrades(equipped, factory) {
    const cowl = this.mesh.getObjectByName('scooterCowl');
    const seatBody = this.mesh.getObjectByName('scooterSeatBody');
    const exhaust = this.mesh.getObjectByName('scooterExhaust');
    const basket = this.mesh.getObjectByName('scooterBasket');

    // 1. Vehicle Paint and Aesthetics
    if (cowl && seatBody) {
      if (equipped.vehicle === 'haomai') {
        const matHaomai = new THREE.MeshStandardMaterial({ color: 0x1c2833, roughness: 0.65 });
        cowl.material = matHaomai;
        seatBody.material = matHaomai;
        if (basket) basket.visible = true;
      } else if (equipped.vehicle === 'vespa') {
        const matVespa = new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.22, metalness: 0.35 });
        cowl.material = matVespa;
        seatBody.material = matVespa;
        if (basket) basket.visible = false;
      } else if (equipped.vehicle === 'many') {
        const matMany = new THREE.MeshStandardMaterial({ color: 0xd81b60, roughness: 0.28, metalness: 0.2 });
        cowl.material = matMany;
        seatBody.material = matMany;
        if (basket) basket.visible = false;
      } else if (equipped.vehicle === 'gas_tank') {
        const matGas = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.55 });
        cowl.material = matGas;
        seatBody.material = matGas;
        if (basket) basket.visible = false;
      } else {
        // Cygnus (Cyan/Teal standard)
        cowl.material = factory.materials.scooterBodyTeal;
        seatBody.material = factory.materials.scooterBodyTeal;
        if (basket) basket.visible = false;
      }
      // Each vehicle gets a distinct silhouette as well as a different finish.
      const shapes = {
        cygnus: [1, 1, 1, 1],
        haomai: [0.86, 1.08, 0.85, 0.94],
        vespa: [1.18, 1.05, 0.8, 1.12],
        many: [0.88, 0.9, 0.88, 0.9],
        gas_tank: [1.1, 1.02, 1.05, 1.15]
      };
      const shape = shapes[equipped.vehicle] || shapes.cygnus;
      cowl.scale.set(shape[0], shape[1], shape[2]);
      seatBody.scale.set(shape[3], 1, shape[3]);
      const fender = this.mesh.getObjectByName('scooterFender');
      if (fender) fender.material = cowl.material;

      // Update 3D rear cargo display
      if (this.mesh.setCargoVisual) {
        this.mesh.setCargoVisual(this.currentCargoType || 'boba', equipped.vehicle);
      }
    }

    // 2. Exhaust Pipe Visuals
    if (exhaust) {
      if (equipped.exhaust === 'white_iron') {
        exhaust.material = factory.materials.chrome;
        exhaust.scale.set(1.2, 1.2, 1.2);
      } else {
        exhaust.material = factory.materials.blackPlastic;
        exhaust.scale.set(1.0, 1.0, 1.0);
      }
    }
  }

  setCargoType(cargoType) {
    this.currentCargoType = cargoType;
    if (this.mesh.setCargoVisual) {
      this.mesh.setCargoVisual(this.currentCargoType, this.equippedVehicle || 'cygnus');
    }
  }
}

