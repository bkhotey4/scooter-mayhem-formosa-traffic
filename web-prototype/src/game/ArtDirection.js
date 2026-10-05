import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export class ArtDirection {
  constructor(scene, renderer) {
    this.scene = scene;
    // Local procedural reflection studio, no external asset downloads.
    const generator = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    this.environment = generator.fromScene(room, 0.04);
    scene.environment = this.environment.texture;
    scene.environmentIntensity = 0.55;
    room.dispose();
    generator.dispose();
    this.fill = new THREE.HemisphereLight(0xc1d7e3, 0x776047, 1.7);
    scene.add(this.fill);
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(240, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { top: { value: new THREE.Color(0x527d94) }, bottom: { value: new THREE.Color(0xe7b88c) } },
      vertexShader: 'varying vec3 direction; void main(){direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 direction; void main(){float h=clamp(normalize(direction).y*1.8,0.0,1.0); gl_FragColor=vec4(mix(bottom,top,smoothstep(0.0,1.0,h)),1.0); #include <tonemapping_fragment>\n #include <colorspace_fragment>\n}'
    }));
    // Shader directives must start on their own line.
    this.sky.material.fragmentShader = this.sky.material.fragmentShader.replace('; #include', ';\n#include');
    this.sky.frustumCulled = false;
    scene.add(this.sky);
    const rainCount = 900;
    this.rainPositions = new Float32Array(rainCount * 6);
    for (let i = 0; i < rainCount; i++) {
      const j = i * 6;
      this.rainPositions[j] = Math.random() * 60 - 30;
      this.rainPositions[j + 1] = Math.random() * 28;
      this.rainPositions[j + 2] = Math.random() * 90 - 45;
      this.copyRainEnd(j);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));
    this.rain = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xb9d6dd, transparent: true, opacity: 0.45, depthWrite: false }));
    this.rain.frustumCulled = false;
    this.rain.visible = false;
    scene.add(this.rain);
  }
  copyRainEnd(j) {
    this.rainPositions[j + 3] = this.rainPositions[j] - 0.07;
    this.rainPositions[j + 4] = this.rainPositions[j + 1] + 0.75;
    this.rainPositions[j + 5] = this.rainPositions[j + 2];
  }
  setMode(mode, factory) {
    const night = mode.id === 'MIDNIGHT', storm = mode.id === 'STORM';
    this.fill.intensity = night ? 0.65 : storm ? 1 : 1.7;
    this.scene.environmentIntensity = night ? 0.3 : 0.55;
    this.sky.material.uniforms.top.value.setHex(night ? 0x101e36 : storm ? 0x304853 : 0x527d94);
    this.sky.material.uniforms.bottom.value.setHex(night ? 0x455168 : storm ? 0x72868a : 0xe7b88c);
    this.rain.visible = storm;
    factory.materials.asphalt.roughness = storm ? 0.32 : 0.88;
    factory.materials.asphalt.metalness = storm ? 0.2 : 0.04;
    ['neonYellow', 'neonRed', 'neonCyan', 'neonGreen'].forEach(key => {
      factory.materials[key].emissiveIntensity = mode.neonMultiplier;
    });
  }
  update(dt, position) {
    this.sky.position.copy(position);
    if (!this.rain.visible) return;
    this.rain.position.set(position.x, 0, position.z);
    for (let j = 0; j < this.rainPositions.length; j += 6) {
      this.rainPositions[j + 1] -= dt * 21;
      if (this.rainPositions[j + 1] < 0) this.rainPositions[j + 1] += 28;
      this.copyRainEnd(j);
    }
    this.rain.geometry.attributes.position.needsUpdate = true;
  }
}
