// TaiwanSandboxSystem.js - GTA Taipei Sandbox Mechanics:
// 1. On-Foot Mode & Vehicle Hijacking (下車漫步與街頭搶車/換車)
// 2. Taiwanese Story NPC Dialogue Beacons (台味劇情任務與對白)
// 3. Wanted Star Level & Police Evading (通緝星級與警匪追逐)
// 4. Meme Horn & Taiwanese Voice Shoutouts (台味迷因按喇叭與街頭喊話)

import * as THREE from 'three';
import { createDetailedRider } from '../models/VehicleModels.js';

export class TaiwanSandboxSystem {
  constructor(scene, factory, sound, controller, traffic, gameMode) {
    this.scene = scene;
    this.factory = factory;
    this.sound = sound;
    this.controller = controller;
    this.traffic = traffic;
    this.gameMode = gameMode;

    // 1. Player State: 'driving' | 'on_foot'
    this.playerMode = 'driving';
    this.footPos = new THREE.Vector3(0, 0, 0);
    this.footHeading = 0;
    this.footSpeed = 0;
    this.walkAnimPhase = 0;
    this.drivenVehicleType = 'scooter'; // 'scooter' | 'taxi' | 'van' | 'truck'
    this.hijackedMesh = null;
    this.originalScooterVisible = true;

    // Create On-Foot Pedestrian Character
    this.footRider = this.factory.createRider();
    this.footRider.name = 'playerOnFootRider';
    this.footRider.visible = false;
    this.scene.add(this.footRider);

    // 2. NPC Story Quest Beacons
    this.quests = [
      {
        id: 'ming_tea',
        npcName: '表哥阿明',
        npcTitle: '西門町改裝車行老手',
        avatar: '👨‍🦱',
        pos: new THREE.Vector3(4.5, 0, -45),
        dialogue: '「欸！表弟！這裡啦！你那台車改得很秋喔！剛剛那台發財車在前面被三寶卡住了，快幫我去重慶南路送這箱特級茶葉！限時 65 秒，小費算你 $1200！」',
        rewardText: '現金 $1200 ＋ 滿格氮氣瓶',
        rewardMoney: 1200,
        timeLimit: 65,
        targetPos: new THREE.Vector3(0, 0, 130),
        color: 0xf59e0b,
        symbol: '明',
        completed: false
      },
      {
        id: 'xiaomei_betelnut',
        npcName: '檳榔西施小美',
        npcTitle: '雙子星檳榔旗艦攤',
        avatar: '💃',
        pos: new THREE.Vector3(-6.8, 0, 15),
        dialogue: '「帥哥～幫我送兩盒幼齒雙子星去給前方的修車廠阿國師！路上很多檢舉魔人，千萬別被測速拍到喔～小費算你雙倍啦！」',
        rewardText: '現金 $1500 ＋ 結冰水補給',
        rewardMoney: 1500,
        timeLimit: 75,
        targetPos: new THREE.Vector3(0, 0, -110),
        color: 0xec4899,
        symbol: '美',
        completed: false
      },
      {
        id: 'strong_race',
        npcName: '北宜過彎王阿強',
        npcTitle: '傳說中的山道車神',
        avatar: '🏍️',
        pos: new THREE.Vector3(0, 0, -145),
        dialogue: '「少年欸！看你過彎都在壓車喔？敢不敢跟我比一場北門圓環到台北橋的極速衝刺？限時內飆過 4 個路口！輸的請吃大腸包小腸！」',
        rewardText: '現金 $2000 ＋ 傳奇白鐵管榮譽',
        rewardMoney: 2000,
        timeLimit: 55,
        targetPos: new THREE.Vector3(0, 0, 160),
        color: 0x06b6d4,
        symbol: '強',
        completed: false
      }
    ];

    this.activeQuest = null;
    this.questTimer = 0;
    this.beaconMeshes = [];
    this.createQuestBeacons();

    // 3. Meme Horn Shoutout List
    this.shoutVoices = [
      '叭三小啦！',
      '阿伯初四了啦！',
      '閃啦閃啦，撞到不賠喔！',
      '借過借過！趕送單啦！',
      '跨蝦小！沒看過壓車喔！',
      '前面的會不會開車啦！',
      '油門催到底啦！'
    ];

    // 4. UI References
    this.dom = {
      prompt: document.getElementById('vehicle-interact-prompt'),
      promptText: document.getElementById('prompt-text'),
      wantedBadge: document.getElementById('wanted-badge'),
      wantedStars: document.getElementById('wanted-stars'),
      wantedSub: document.getElementById('wanted-sub'),
      questModal: document.getElementById('quest-dialog-modal'),
      questAvatar: document.getElementById('quest-avatar'),
      questNpcName: document.getElementById('quest-npc-name'),
      questNpcTitle: document.getElementById('quest-npc-title'),
      questDialogueText: document.getElementById('quest-dialogue-text'),
      questRewardVal: document.getElementById('quest-reward-val'),
      btnAcceptQuest: document.getElementById('btn-accept-quest'),
      btnDeclineQuest: document.getElementById('btn-decline-quest'),
      speechBubble: document.getElementById('speech-bubble'),
      speechText: document.getElementById('speech-text'),
      btnHijack: document.getElementById('btn-hijack')
    };

    this.setupUIHandlers();
  }

  createQuestBeacons() {
    this.quests.forEach(quest => {
      const beaconGroup = new THREE.Group();
      beaconGroup.position.copy(quest.pos);

      // 1. Glowing Light Cylinder
      const lightGeo = new THREE.CylinderGeometry(1.2, 1.2, 18, 16, 1, true);
      const lightMat = new THREE.MeshBasicMaterial({
        color: quest.color,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const lightMesh = new THREE.Mesh(lightGeo, lightMat);
      lightMesh.position.y = 9;
      beaconGroup.add(lightMesh);

      // 2. Ground Energy Rings
      const ringGeo = new THREE.RingGeometry(0.6, 2.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: quest.color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.05;
      beaconGroup.add(ringMesh);

      // 3. Rotating 3D Glyph / Disc
      const discGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 16);
      const discMat = new THREE.MeshStandardMaterial({
        color: quest.color,
        emissive: quest.color,
        emissiveIntensity: 0.6
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.y = 2.4;
      disc.rotation.x = Math.PI / 2;
      beaconGroup.add(disc);

      this.scene.add(beaconGroup);
      this.beaconMeshes.push({ group: beaconGroup, disc, ring: ringMesh, quest });
    });
  }

  setupUIHandlers() {
    this.dom.btnAcceptQuest?.addEventListener('click', () => {
      if (this.pendingQuest) {
        this.startQuest(this.pendingQuest);
      }
      this.closeQuestModal();
    });

    this.dom.btnDeclineQuest?.addEventListener('click', () => {
      this.closeQuestModal();
    });

    this.dom.btnHijack?.addEventListener('click', () => {
      this.handleHijackOrDismount();
    });
  }

  openQuestModal(quest) {
    this.pendingQuest = quest;
    if (this.dom.questAvatar) this.dom.questAvatar.textContent = quest.avatar;
    if (this.dom.questNpcName) this.dom.questNpcName.textContent = quest.npcName;
    if (this.dom.questNpcTitle) this.dom.questNpcTitle.textContent = quest.npcTitle;
    if (this.dom.questDialogueText) this.dom.questDialogueText.textContent = quest.dialogue;
    if (this.dom.questRewardVal) this.dom.questRewardVal.textContent = quest.rewardText;
    if (this.dom.questModal) this.dom.questModal.classList.remove('hidden');

    // Trigger voice dialogue via speech synth or chimes
    this.speakVoice(`${quest.npcName}：${quest.dialogue.slice(1, 20)}`);
  }

  closeQuestModal() {
    this.pendingQuest = null;
    if (this.dom.questModal) this.dom.questModal.classList.add('hidden');
  }

  startQuest(quest) {
    this.activeQuest = quest;
    this.questTimer = quest.timeLimit;
    this.sound?.playCelebrationChime();
    this.gameMode?.addCombo(`接受任務：${quest.npcName}`, 300);

    // Speak acceptance
    this.speakVoice('任務開始！出發！');

    // Set delivery waypoint in game mode
    if (this.gameMode) {
      this.gameMode.activeDelivery = {
        name: quest.npcName,
        customer: `${quest.npcName}的急件託運`,
        cargo: '特級高山茶葉',
        destination: { x: quest.targetPos.x, z: quest.targetPos.z },
        payout: quest.rewardMoney,
        tip: 500,
        timeLimit: quest.timeLimit
      };
    }
  }

  /**
   * Toggle on-foot or hijack nearby vehicle
   */
  handleHijackOrDismount() {
    if (this.playerMode === 'driving') {
      // Dismount to on-foot
      this.dismountToOnFoot();
    } else {
      // On foot: check if close to any vehicle to enter
      const nearby = this.findNearbyVehicle();
      if (nearby) {
        this.mountVehicle(nearby);
      } else {
        // Return to parked scooter if nearby
        const distToScooter = this.footPos.distanceTo(this.controller.scooterMesh?.position || this.controller.position);
        if (distToScooter < 4.0) {
          this.mountScooter();
        } else {
          this.showActionToast('🚶 請走到車輛旁邊再按 [F] 上車！');
        }
      }
    }
  }

  dismountToOnFoot() {
    this.playerMode = 'on_foot';
    this.footPos.copy(this.controller.position);
    this.footPos.x -= 1.2; // Step off to left
    this.footHeading = this.controller.heading;
    this.footSpeed = 0;

    // Stop vehicle movement
    this.controller.speed = 0;
    this.controller.velocity.set(0, 0, 0);

    // Show on-foot 3D mesh
    this.footRider.position.copy(this.footPos);
    this.footRider.rotation.y = this.footHeading;
    this.footRider.visible = true;

    // Hide rider on scooter
    const scooterRider = this.controller.mesh?.getObjectByName('scooterRider');
    if (scooterRider) scooterRider.visible = false;

    if (this.dom.btnHijack) this.dom.btnHijack.textContent = '🛵 上車 (F)';
    this.showActionToast('🚶 已下車！使用 W/A/S/D 步行，Shift 跑步，靠近車輛按 [F] 上車！');
    this.sound?.playDoorOpen?.();
  }

  mountScooter() {
    this.playerMode = 'driving';
    this.footRider.visible = false;

    // Restore rider on scooter
    const scooterRider = this.controller.mesh?.getObjectByName('scooterRider');
    if (scooterRider) scooterRider.visible = true;

    // Remove hijacked car if any
    if (this.hijackedMesh) {
      this.scene.remove(this.hijackedMesh);
      this.hijackedMesh = null;
    }
    if (this.controller.mesh) this.controller.mesh.visible = true;

    this.drivenVehicleType = 'scooter';
    if (this.dom.btnHijack) this.dom.btnHijack.textContent = '🚶 下車 (F)';
    this.showActionToast('🛵 已回到神車上！油門催下去！');
    this.sound?.playDoorOpen?.();
  }

  mountVehicle(veh) {
    this.playerMode = 'driving';
    this.footRider.visible = false;

    // If it's a traffic vehicle, steal it!
    if (veh.isTraffic) {
      this.drivenVehicleType = veh.type;
      
      // Hide scooter mesh and replace with hijacked vehicle model
      if (this.controller.mesh) this.controller.mesh.visible = false;
      if (this.hijackedMesh) this.scene.remove(this.hijackedMesh);

      this.hijackedMesh = veh.group.clone();
      this.hijackedMesh.position.copy(this.controller.position);
      this.scene.add(this.hijackedMesh);

      // Remove stolen vehicle from traffic
      veh.group.visible = false;
      veh.group.position.set(999, -100, 999);

      // Increase Wanted Level!
      this.traffic?.addWantedHeat(1);
      this.gameMode?.addCombo(`街頭劫車：${veh.name}`, 800);
      this.showActionToast(`🚗 街頭劫車成功！開走了【${veh.name}】！警網通緝上升！`);
      this.sound?.playCrash?.();
      this.speakVoice('我的車被搶了啦！');
    } else {
      this.mountScooter();
    }

    if (this.dom.btnHijack) this.dom.btnHijack.textContent = '🚶 下車 (F)';
    this.sound?.playDoorOpen?.();
  }

  findNearbyVehicle() {
    const pPos = this.footPos;
    let closest = null;
    let minDist = 4.0;

    // Check traffic cars: taxis, alphards, trucks
    const collections = [
      { list: this.traffic?.taxis || [], name: '🚕 台灣小黃計程車', type: 'taxi' },
      { list: this.traffic?.alphards || [], name: '🚐 豪華保母車 Alphard', type: 'van' },
      { list: this.traffic?.trucks || [], name: '🚚 藍色發財車 (得利卡)', type: 'truck' }
    ];

    collections.forEach(col => {
      col.list.forEach(item => {
        const grp = item.group || item;
        if (grp && grp.visible) {
          const d = pPos.distanceTo(grp.position);
          if (d < minDist) {
            minDist = d;
            closest = { group: grp, name: col.name, type: col.type, isTraffic: true };
          }
        }
      });
    });

    return closest;
  }

  /**
   * Meme Horn Shoutout
   */
  triggerMemeHorn() {
    // 1. Play Horn Sound
    this.sound?.playHorn();

    // 2. Select random Taiwanese shout phrase
    const phrase = this.shoutVoices[Math.floor(Math.random() * this.shoutVoices.length)];

    // 3. Show Comic Speech Bubble
    this.showSpeechBubble(phrase);

    // 4. Speak Voice via Speech Synthesis
    this.speakVoice(phrase);

    // 5. Surrounding Pedestrians dodge in surprise!
    const playerPos = this.playerMode === 'on_foot' ? this.footPos : this.controller.position;
    if (this.traffic?.pedestrians) {
      this.traffic.pedestrians.forEach(ped => {
        const pGrp = ped.group || ped;
        if (pGrp && pGrp.position.distanceTo(playerPos) < 14) {
          // Panic hop!
          pGrp.position.y += 0.45;
          setTimeout(() => { if (pGrp) pGrp.position.y = 0; }, 350);
        }
      });
    }

    this.gameMode?.addCombo(`街頭狂按喇叭`, 100);
  }

  showSpeechBubble(text) {
    if (!this.dom.speechBubble || !this.dom.speechText) return;
    this.dom.speechText.textContent = `🗯️ ${text}`;
    this.dom.speechBubble.classList.remove('hidden');

    clearTimeout(this.bubbleTimeout);
    this.bubbleTimeout = setTimeout(() => {
      this.dom.speechBubble?.classList.add('hidden');
    }, 2200);
  }

  speakVoice(text) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'zh-TW';
        utter.pitch = 1.15;
        utter.rate = 1.25;
        window.speechSynthesis.speak(utter);
      } catch (_) {}
    }
  }

  showActionToast(text) {
    if (this.gameMode?.onComboPopup) {
      this.gameMode.onComboPopup(text, 0);
    }
  }

  update(dt, keys) {
    // 1. On-Foot Player Movement
    if (this.playerMode === 'on_foot') {
      const isSprint = keys['ShiftLeft'] || keys['ShiftRight'];
      const speedMax = isSprint ? 7.2 : 3.6; // m/s
      let moveX = 0, moveZ = 0;

      if (keys['KeyW'] || keys['ArrowUp']) moveZ += 1;
      if (keys['KeyS'] || keys['ArrowDown']) moveZ -= 1;
      if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

      if (moveX !== 0 || moveZ !== 0) {
        const len = Math.hypot(moveX, moveZ);
        const normX = moveX / len;
        const normZ = moveZ / len;
        this.footHeading = Math.atan2(normX, normZ);

        this.footSpeed = THREE.MathUtils.lerp(this.footSpeed, speedMax, dt * 10);
        this.footPos.x += normX * this.footSpeed * dt;
        this.footPos.z += normZ * this.footSpeed * dt;

        // Walk Animation (Swing limbs)
        this.walkAnimPhase += dt * (isSprint ? 16 : 9);
        this.animateRiderLimbs(this.footRider, this.walkAnimPhase);
      } else {
        this.footSpeed = THREE.MathUtils.lerp(this.footSpeed, 0, dt * 12);
        this.resetRiderLimbs(this.footRider);
      }

      // Bound player within city road and sidewalk corridor
      this.footPos.x = THREE.MathUtils.clamp(this.footPos.x, -75, 75);
      this.footPos.z = THREE.MathUtils.clamp(this.footPos.z, -190, 190);

      // Sync 3D Foot Mesh
      this.footRider.position.copy(this.footPos);
      this.footRider.rotation.y = this.footHeading;

      // Sync controller position so camera and minimap follow seamlessly
      this.controller.position.copy(this.footPos);
      this.controller.heading = this.footHeading;

      // Check nearby vehicle for hijack prompt
      const nearbyVeh = this.findNearbyVehicle();
      const distToScooter = this.footPos.distanceTo(this.controller.scooterMesh?.position || this.controller.position);

      if (nearbyVeh && this.dom.prompt) {
        this.dom.prompt.classList.remove('hidden');
        if (this.dom.promptText) this.dom.promptText.textContent = `搶奪並駕駛 ${nearbyVeh.name} [F]`;
      } else if (distToScooter < 3.5 && this.dom.prompt) {
        this.dom.prompt.classList.remove('hidden');
        if (this.dom.promptText) this.dom.promptText.textContent = `騎上機車出發 [F]`;
      } else {
        this.dom.prompt?.classList.add('hidden');
      }
    } else {
      // In Driving Mode
      if (this.hijackedMesh) {
        this.hijackedMesh.position.copy(this.controller.position);
        this.hijackedMesh.rotation.y = this.controller.heading;
      }
      this.dom.prompt?.classList.add('hidden');
    }

    // 2. Animate Quest Beacons and Check Distance
    const playerPos = this.playerMode === 'on_foot' ? this.footPos : this.controller.position;
    this.beaconMeshes.forEach(b => {
      b.disc.rotation.z += dt * 2.2;
      b.ring.rotation.z += dt * 1.5;

      const dist = b.group.position.distanceTo(playerPos);
      if (dist < 3.2 && !this.activeQuest && !b.quest.completed) {
        // Close to beacon! Trigger dialogue!
        this.openQuestModal(b.quest);
      }
    });

    // 3. Update Active Quest Timer & Destination
    if (this.activeQuest) {
      this.questTimer -= dt;
      const distToDest = playerPos.distanceTo(this.activeQuest.targetPos);

      if (distToDest < 6.0) {
        // Quest Completed!
        this.completeQuest(this.activeQuest);
      } else if (this.questTimer <= 0) {
        // Quest Failed Timeout
        this.showActionToast(`⏱️ 任務超時失敗！未能及時送達！`);
        this.activeQuest = null;
      }
    }

    // 4. Update Wanted Stars HUD
    this.updateWantedHUD();
  }

  completeQuest(quest) {
    this.sound?.playCelebrationChime();
    this.gameMode?.addCombo(`【${quest.npcName}】委託圓滿達成！`, 2000);
    if (this.gameMode) this.gameMode.totalEarnings += quest.rewardMoney;

    this.showActionToast(`🎉 任務完成！獲得小費 +$${quest.rewardMoney}！`);
    this.speakVoice('讚啦！任務完成了！');
    quest.completed = true;
    this.activeQuest = null;
  }

  updateWantedHUD() {
    const heat = this.traffic?.wantedHeat || 0;
    if (!this.dom.wantedBadge) return;

    if (heat > 0) {
      this.dom.wantedBadge.classList.remove('hidden');
      const starText = '★'.repeat(heat) + '☆'.repeat(5 - heat);
      if (this.dom.wantedStars) this.dom.wantedStars.textContent = starText;

      const loseTimer = this.traffic?.pursuitLoseSightTimer || 0;
      if (loseTimer > 0) {
        const remaining = Math.max(0, (4.5 - loseTimer).toFixed(1));
        if (this.dom.wantedSub) this.dom.wantedSub.textContent = `🚨 脫離視線中... 剩餘 ${remaining} 秒！`;
      } else {
        if (this.dom.wantedSub) this.dom.wantedSub.textContent = `🚨 警網高速攔截追逐中！`;
      }
    } else {
      this.dom.wantedBadge.classList.add('hidden');
    }
  }

  animateRiderLimbs(rider, phase) {
    // Subtle leg & arm rotation during walk
    const legSwing = Math.sin(phase) * 0.35;
    const armSwing = -Math.sin(phase) * 0.35;
    
    // Find limbs if available
    rider.traverse(child => {
      if (child.name?.includes('Arm') || child.name?.includes('Leg')) {
        child.rotation.x = legSwing;
      }
    });
  }

  resetRiderLimbs(rider) {
    rider.traverse(child => {
      if (child.name?.includes('Arm') || child.name?.includes('Leg')) {
        child.rotation.x = 0;
      }
    });
  }
}
