// GameMode.js - Crazy Taxi Style Delivery Mission Loop & Scoring
import * as THREE from 'three';

export class GameMode {
  constructor(soundManager, bobaPhysics) {
    this.sound = soundManager;
    this.boba = bobaPhysics;

    this.state = 'START'; // START, DELIVERING, SUMMARY, GAME_OVER
    this.score = 0;
    this.combos = [];
    this.comboMultiplier = 1;

    // Mission specs
    this.currentOrderIdx = 0;
    this.orders = [];
    this.currentTarget = null;
    this.timeRemaining = 60; // seconds
    this.totalEarnings = 0;

    // 3D Navigation Arrow
    this.navArrow = this.createNavArrow();

    // Callbacks for UI updates
    this.onStateChange = null;
    this.onComboPopup = null;
  }

  createNavArrow() {
    const arrow = new THREE.Group();
    // 3D Direction Arrow floating above scooter
    const coneGeo = new THREE.ConeGeometry(0.35, 0.8, 12);
    coneGeo.rotateX(Math.PI / 2);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    arrow.add(cone);
    return arrow;
  }

  initMissions(destinations) {
    this.orders = destinations;
    this.currentOrderIdx = 0;
    this.currentTarget = this.orders[0];
    this.timeRemaining = 65;
  }

  startDelivery() {
    this.state = 'DELIVERING';
    this.timeRemaining = 65;
    this.sound?.speak('新訂單！黑糖珍珠鮮奶兩杯，請儘速送達！');
    if (this.onStateChange) this.onStateChange(this.state);
  }

  addCombo(title, points) {
    const totalPoints = points * this.comboMultiplier;
    this.score += totalPoints;

    // Time extension reward for stylish driving!
    this.timeRemaining = Math.min(this.timeRemaining + 3, 99);

    if (this.onComboPopup) {
      this.onComboPopup(title, totalPoints);
    }
  }

  update(dt, playerPos) {
    if (this.state !== 'DELIVERING') return;

    // 1. Countdown timer
    this.timeRemaining -= dt;

    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.gameOver('時間到！外送逾時，顧客取消訂單！');
      return;
    }

    // If all tea is spilled, fail immediately
    if (this.boba.liquid <= 0) {
      this.gameOver('珍奶全灑光了！顧客憤怒退單！');
      return;
    }

    // 2. Check Arrival at Destination Beacon
    if (this.currentTarget) {
      const dist = playerPos.distanceTo(this.currentTarget.pos);
      if (dist < 2.5) {
        this.completeOrder();
      }

      // Update Nav Arrow
      if (this.navArrow) {
        this.navArrow.position.set(playerPos.x, playerPos.y + 2.4, playerPos.z);
        this.navArrow.lookAt(this.currentTarget.pos.x, this.navArrow.position.y, this.currentTarget.pos.z);
      }
    }
  }

  completeOrder() {
    this.state = 'SUMMARY';
    const result = this.boba.getDeliveryResult();

    // Calculate delivery earnings
    const baseTip = result.stars * 80;
    const speedBonus = Math.floor(this.timeRemaining * 15);
    const orderTotal = baseTip + speedBonus;
    this.totalEarnings += orderTotal;
    this.score += orderTotal * 2;

    this.sound?.speak(`訂單完成！獲得 ${result.stars} 顆星！`);
    if (this.onStateChange) {
      this.onStateChange(this.state, {
        result,
        orderTotal,
        totalEarnings: this.totalEarnings,
        customer: this.currentTarget.name
      });
    }
  }

  nextOrder() {
    this.currentOrderIdx++;
    if (this.currentOrderIdx >= this.orders.length) {
      // Loop back or victory!
      this.currentOrderIdx = 0;
    }

    this.currentTarget = this.orders[this.currentOrderIdx];
    this.timeRemaining = 60;
    // Reset cup with fresh order
    this.boba.liquid = 100;
    this.boba.sealHp = 100;
    this.boba.isSealBroken = false;
    this.boba.pearlsLost = 0;

    this.state = 'DELIVERING';
    this.sound?.speak(`前往下一單：${this.currentTarget.name}`);
    if (this.onStateChange) this.onStateChange(this.state);
  }

  gameOver(reason) {
    this.state = 'GAME_OVER';
    this.sound?.speak('外送失敗！');
    if (this.onStateChange) {
      this.onStateChange(this.state, { reason, score: this.score, earnings: this.totalEarnings });
    }
  }

  getDistanceToTarget(playerPos) {
    if (!this.currentTarget) return 0;
    return Math.round(playerPos.distanceTo(this.currentTarget.pos));
  }
}
