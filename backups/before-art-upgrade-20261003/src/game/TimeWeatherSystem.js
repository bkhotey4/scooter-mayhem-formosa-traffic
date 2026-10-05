// TimeWeatherSystem.js - Day, Midnight Cyberpunk & Thunderstorm Weather Engine
import * as THREE from 'three';

export const TIME_MODES = {
  DUSK: {
    id: 'DUSK',
    name: '🌅 逢甲黃昏',
    skyColor: 0x0f1420,
    fogColor: 0x0f1420,
    fogDensity: 0.008,
    ambientColor: 0x8899aa,
    ambientIntensity: 0.65,
    sunColor: 0xffeedd,
    sunIntensity: 1.2,
    neonMultiplier: 1.2
  },
  MIDNIGHT: {
    id: 'MIDNIGHT',
    name: '🌃 通化深夜',
    skyColor: 0x05070c,
    fogColor: 0x05070c,
    fogDensity: 0.012,
    ambientColor: 0x223355,
    ambientIntensity: 0.35,
    sunColor: 0x4466aa,
    sunIntensity: 0.45,
    neonMultiplier: 2.4
  },
  STORM: {
    id: 'STORM',
    name: '⛈️ 狂暴雷雨',
    skyColor: 0x0a1018,
    fogColor: 0x0a1018,
    fogDensity: 0.016,
    ambientColor: 0x334455,
    ambientIntensity: 0.4,
    sunColor: 0x667799,
    sunIntensity: 0.5,
    neonMultiplier: 1.6
  }
};

export class TimeWeatherSystem {
  constructor(scene, dirLight, ambientLight, soundManager) {
    this.scene = scene;
    this.dirLight = dirLight;
    this.ambientLight = ambientLight;
    this.sound = soundManager;

    this.currentMode = TIME_MODES.DUSK;
    this.lightningTimer = 0;
    this.isLightning = false;
    this.flashDuration = 0;

    // Callbacks
    this.onModeChange = null;
    this.onLightningFlash = null;
  }

  setMode(modeKey) {
    if (!TIME_MODES[modeKey]) return;
    this.currentMode = TIME_MODES[modeKey];

    const m = this.currentMode;
    // Apply Scene Fog & Background
    if (this.scene) {
      this.scene.background.setHex(m.skyColor);
      if (this.scene.fog) {
        this.scene.fog.color.setHex(m.fogColor);
        this.scene.fog.density = m.fogDensity;
      }
    }

    // Apply Lighting
    if (this.ambientLight) {
      this.ambientLight.color.setHex(m.ambientColor);
      this.ambientLight.intensity = m.ambientIntensity;
    }

    if (this.dirLight) {
      this.dirLight.color.setHex(m.sunColor);
      this.dirLight.intensity = m.sunIntensity;
    }

    if (this.onModeChange) {
      this.onModeChange(this.currentMode);
    }
  }

  nextMode() {
    const keys = ['DUSK', 'MIDNIGHT', 'STORM'];
    const idx = keys.indexOf(this.currentMode.id);
    const nextKey = keys[(idx + 1) % keys.length];
    this.setMode(nextKey);
  }

  update(dt) {
    // Thunderstorm lightning flashes
    if (this.currentMode.id === 'STORM') {
      this.lightningTimer += dt;
      if (!this.isLightning && this.lightningTimer > (4.0 + Math.random() * 6.0)) {
        this.triggerLightning();
      }

      if (this.isLightning) {
        this.flashDuration -= dt;
        if (this.flashDuration <= 0) {
          this.isLightning = false;
          // Restore storm lighting
          if (this.dirLight) this.dirLight.intensity = this.currentMode.sunIntensity;
          if (this.ambientLight) this.ambientLight.intensity = this.currentMode.ambientIntensity;
        }
      }
    }
  }

  triggerLightning() {
    this.lightningTimer = 0;
    this.isLightning = true;
    this.flashDuration = 0.12;

    // Surge light intensity to bright white flash
    if (this.dirLight) this.dirLight.intensity = 4.5;
    if (this.ambientLight) this.ambientLight.intensity = 2.5;

    if (this.onLightningFlash) {
      this.onLightningFlash();
    }

    // Thunder rumble sound
    setTimeout(() => {
      this.sound?.playCrash(8); // deep low rumble
    }, 180);
  }
}
