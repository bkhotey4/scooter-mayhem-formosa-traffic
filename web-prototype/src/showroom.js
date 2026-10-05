import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ModelFactory } from './models/ModelFactory.js';
import { ScooterController } from './physics/ScooterController.js';
import { modelLoader } from './models/ModelLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x233438);
scene.fog = new THREE.Fog(0x233438, 12, 34);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('showroom-canvas'), antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment();
const environment = pmrem.fromScene(room, 0.04);
scene.environment = environment.texture;
scene.environmentIntensity = 0.85;
room.dispose(); pmrem.dispose();

scene.add(new THREE.HemisphereLight(0xd7e6ea, 0x50442d, 1.4));
const key = new THREE.DirectionalLight(0xffdfb7, 3.3);
key.position.set(3, 7, 5); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = key.shadow.camera.bottom = -5;
key.shadow.camera.right = key.shadow.camera.top = 5;
key.shadow.normalBias = 0.035;
scene.add(key);

const rim = new THREE.DirectionalLight(0xa4d9db, 2.4); rim.position.set(-4, 4, -3); scene.add(rim);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x485653, roughness: 0.82 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

const plinth = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.12, 72), new THREE.MeshStandardMaterial({ color: 0x60706a, roughness: 0.6, metalness: 0.12 }));
plinth.position.y = -0.045; plinth.receiveShadow = true; scene.add(plinth);

const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 150);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.enablePan = false;
controls.minPolarAngle = 0.22; controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.minDistance = 1.8; controls.maxDistance = 11; controls.autoRotateSpeed = 0.8;

const factory = new ModelFactory();
const models = new Map();
const metadata = {
  cygnus: ['勁戰 · 城市外送', '高精度曲面車殼、金屬避震、輪框、座椅滾邊與外送裝備。'],
  vespa: ['象牙白 · 復古風格', '寬版前盾、圓潤側蓋與象牙白車漆；沿用遊戲實際換車造型。'],
  van: ['都會廂型車 · 街邊日常', '獨立玻璃座艙、鍍鉻水箱罩、LED 燈組、多幅輪圈與可開啟車門。'],
  taxi: ['台灣小黃 · 城市穿梭', '傾斜擋風玻璃、獨立車頂、金黃色車漆與發光 TAXI 頂燈。'],
  truck: ['藍色發財車 · 老城生活', '圓角駕駛室、側窗後視鏡、貨斗護欄與六支瓦斯桶。']
};

let current;
let customModelLoaded = null;

async function selectModel(id) {
  if (current) current.visible = false;
  
  if (!models.has(id)) {
    let model = null;
    
    // Check if a real .glb exists in /models/ or memory
    try {
      model = await modelLoader.loadVehicle(id);
    } catch (_) {}

    if (!model) {
      if (id === 'van') model = factory.createAlphardVan();
      else if (id === 'taxi') model = factory.createTaxi();
      else if (id === 'truck') model = factory.createBlueTruck();
      else {
        model = factory.createPlayerScooter({ lights: false });
        ScooterController.prototype.updateVisualUpgrades.call({ mesh: model, currentCargoType: 'boba' }, { vehicle: id, exhaust: 'stock' }, factory);
      }
    }

    model.position.y = 0.025;
    models.set(id, model); scene.add(model);
  }

  current = models.get(id); current.visible = true;
  if (metadata[id]) {
    document.getElementById('model-title').textContent = metadata[id][0];
    document.getElementById('model-detail').textContent = metadata[id][1];
  }
  document.querySelectorAll('[data-model]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.model === id)));
  
  const small = id === 'cygnus' || id === 'vespa';
  controls.target.set(0, small ? 0.8 : 0.95, 0);
  camera.position.set(small ? 2.2 : 5, small ? 1.65 : 3.0, small ? 2.8 : 6);
  controls.update();
}

document.querySelectorAll('[data-model]').forEach(b => b.addEventListener('click', () => selectModel(b.dataset.model)));

document.getElementById('toggle-rotation').addEventListener('click', e => {
  controls.autoRotate = !controls.autoRotate;
  e.currentTarget.textContent = `自動旋轉：${controls.autoRotate ? '開' : '關'}`;
  e.currentTarget.setAttribute('aria-pressed', String(controls.autoRotate));
});

// ==========================================
// Drag & Drop / File Input for External GLB
// ==========================================
async function handleGlbFile(file) {
  if (!file || (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf'))) {
    alert('請提供 .glb 或 .gltf 格式的 3D 模型檔案！');
    return;
  }

  try {
    document.getElementById('model-title').textContent = `載入中：${file.name}...`;
    const buffer = await file.arrayBuffer();
    const { model, stats } = await modelLoader.parse(buffer, {
      targetLength: 1.85,
      name: file.name
    });

    if (current) current.visible = false;
    
    // Remove old custom model if any
    if (models.has('custom')) {
      scene.remove(models.get('custom'));
      models.delete('custom');
    }

    model.position.y = 0.025;
    models.set('custom', model);
    scene.add(model);
    current = model;
    current.visible = true;
    customModelLoaded = model;

    // Deselect other buttons
    document.querySelectorAll('[data-model]').forEach(b => b.setAttribute('aria-pressed', 'false'));

    // Update UI Stats
    document.getElementById('model-title').textContent = file.name;
    document.getElementById('model-detail').textContent = `外部匯入 3D 模型 · ${stats.triangles.toLocaleString()} 面 · 長 ${stats.dimensions.length}m`;

    const statsCard = document.getElementById('model-stats-card');
    if (statsCard) {
      statsCard.style.display = 'block';
      document.getElementById('stat-filename').textContent = file.name;
      document.getElementById('stat-tris').textContent = stats.triangles.toLocaleString();
      document.getElementById('stat-verts').textContent = stats.vertices.toLocaleString();
      document.getElementById('stat-size').textContent = `${stats.dimensions.width} × ${stats.dimensions.height} × ${stats.dimensions.length}`;
      document.getElementById('stat-mats').textContent = stats.materials;
    }

    // Adjust camera to focus on new model
    controls.target.set(0, stats.dimensions.height * 0.5, 0);
    camera.position.set(2.4, stats.dimensions.height * 1.2, 2.8);
    controls.update();

  } catch (err) {
    alert(`模型載入失敗：${err.message || '檔案格式損毀或不支援'}`);
    document.getElementById('model-title').textContent = '載入失敗';
  }
}

// File Input listener
const fileInput = document.getElementById('glb-file-input');
if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleGlbFile(e.target.files[0]);
    }
  });
}

// Apply custom model to game
const btnApply = document.getElementById('btn-apply-custom');
if (btnApply) {
  btnApply.addEventListener('click', () => {
    if (customModelLoaded) {
      modelLoader.registerCustomVehicle('cygnus', customModelLoaded);
      btnApply.textContent = '✅ 已成功套用至遊戲！';
      btnApply.style.background = '#10b981';
      setTimeout(() => {
        btnApply.textContent = '🛵 套用至本局遊戲神車！';
        btnApply.style.background = 'linear-gradient(135deg, #0284c7, #2563eb)';
      }, 3000);
    }
  });
}

// Drag & Drop Window Listeners
const dropOverlay = document.getElementById('drop-overlay');
let dragCounter = 0;

window.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dragCounter++;
  if (dropOverlay) dropOverlay.style.display = 'flex';
});

window.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dragCounter--;
  if (dragCounter <= 0) {
    dragCounter = 0;
    if (dropOverlay) dropOverlay.style.display = 'none';
  }
});

window.addEventListener('dragover', (e) => {
  e.preventDefault();
});

window.addEventListener('drop', (e) => {
  e.preventDefault();
  dragCounter = 0;
  if (dropOverlay) dropOverlay.style.display = 'none';
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleGlbFile(e.dataTransfer.files[0]);
  }
});

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);
resize();
selectModel('cygnus');

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
