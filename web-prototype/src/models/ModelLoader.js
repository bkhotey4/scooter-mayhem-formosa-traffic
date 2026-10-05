import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class ModelLoader {
  constructor() {
    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    this.loader.setDRACOLoader(this.dracoLoader);

    this.cache = new Map();
    this.customModels = new Map(); // Store user-uploaded or runtime-registered GLB models
    this.onModelChangeCallbacks = new Set();
  }

  /**
   * Default target dimensions for realistic scaling (in meters)
   */
  getVehicleSpecs(vehicleId) {
    const specs = {
      cygnus: { length: 1.85, height: 1.12, width: 0.72 },
      haomai: { length: 1.80, height: 1.08, width: 0.68 },
      vespa: { length: 1.76, height: 1.06, width: 0.70 },
      many: { length: 1.70, height: 1.02, width: 0.66 },
      gas_tank: { length: 1.95, height: 1.15, width: 0.76 },
      van: { length: 4.95, height: 1.90, width: 1.85 },
      taxi: { length: 4.60, height: 1.50, width: 1.75 },
      truck: { length: 4.25, height: 1.90, width: 1.72 }
    };
    return specs[vehicleId] || { length: 1.85, height: 1.12, width: 0.72 };
  }

  /**
   * Load a GLTF/GLB file from a URL with automatic scale normalization and ground alignment.
   */
  async load(url, options = {}) {
    if (this.cache.has(url)) {
      const cached = this.cache.get(url);
      return cached.clone(true);
    }

    try {
      const gltf = await this.loader.loadAsync(url);
      const processed = this.processScene(gltf.scene, options);
      this.cache.set(url, processed);
      return processed.clone(true);
    } catch (err) {
      console.warn(`[ModelLoader] Failed to load model from ${url}:`, err);
      return null;
    }
  }

  /**
   * Parse a GLB file from ArrayBuffer (e.g. from drag-and-drop or local file input).
   */
  async parse(arrayBuffer, options = {}) {
    try {
      const gltf = await this.loader.parseAsync(arrayBuffer, '');
      const stats = this.analyzeStats(gltf.scene);
      const processed = this.processScene(gltf.scene, options);
      return { model: processed, stats };
    } catch (err) {
      console.error('[ModelLoader] Failed to parse GLB data:', err);
      throw err;
    }
  }

  /**
   * Check if a custom model exists for the vehicle ID, or attempt to load from public /models/${id}.glb.
   * Returns null if no custom file exists so the app seamlessly falls back to procedural meshes.
   */
  async loadVehicle(vehicleId, options = {}) {
    // 1. Check in-memory custom models (e.g. uploaded via Showroom)
    if (this.customModels.has(vehicleId)) {
      return this.customModels.get(vehicleId).clone(true);
    }

    // 2. Check public static directory
    const url = `/models/${vehicleId}.glb`;
    try {
      const headCheck = await fetch(url, { method: 'HEAD' });
      if (!headCheck.ok) {
        return null;
      }
      const specs = this.getVehicleSpecs(vehicleId);
      const opts = {
        targetLength: specs.length,
        targetHeight: specs.height,
        ...options
      };
      return await this.load(url, opts);
    } catch (_) {
      return null;
    }
  }

  /**
   * Register a user-uploaded model for a specific vehicle slot
   */
  registerCustomVehicle(vehicleId, modelGroup) {
    this.customModels.set(vehicleId, modelGroup);
    this.notifyModelChange(vehicleId, modelGroup);
  }

  onModelChange(callback) {
    this.onModelChangeCallbacks.add(callback);
    return () => this.onModelChangeCallbacks.delete(callback);
  }

  notifyModelChange(vehicleId, model) {
    this.onModelChangeCallbacks.forEach(cb => {
      try { cb(vehicleId, model); } catch (e) { console.error(e); }
    });
  }

  /**
   * Analyze geometry stats (triangles, vertices, meshes, materials, dimensions)
   */
  analyzeStats(root) {
    let triangles = 0;
    let vertices = 0;
    let meshes = 0;
    const materialSet = new Set();

    root.traverse(child => {
      if (child.isMesh && child.geometry) {
        meshes++;
        const geom = child.geometry;
        if (geom.index) {
          triangles += geom.index.count / 3;
        } else if (geom.attributes.position) {
          triangles += geom.attributes.position.count / 3;
        }
        if (geom.attributes.position) {
          vertices += geom.attributes.position.count;
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => materialSet.add(m));
          } else {
            materialSet.add(child.material);
          }
        }
      }
    });

    const bbox = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    return {
      triangles: Math.round(triangles),
      vertices: Math.round(vertices),
      meshes,
      materials: materialSet.size,
      dimensions: {
        width: Number(size.x.toFixed(2)),
        height: Number(size.y.toFixed(2)),
        length: Number(size.z.toFixed(2))
      }
    };
  }

  /**
   * Process and normalize a 3D scene (scale, orientation, ground contact, shadows)
   */
  processScene(scene, options = {}) {
    const root = new THREE.Group();
    root.name = options.name || 'customGlbRoot';

    // Enable shadows and configure materials
    scene.traverse(child => {
      if (child.isMesh) {
        child.castShadow = options.castShadow !== false;
        child.receiveShadow = options.receiveShadow !== false;

        if (child.material) {
          // Ensure double sided or front side rendering
          if (options.doubleSided) child.material.side = THREE.DoubleSide;
        }
        if (child.geometry && !child.geometry.attributes.normal) {
          child.geometry.computeVertexNormals();
        }
      }
    });

    root.add(scene);

    // Compute raw bounding box
    const bbox = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const center = new THREE.Vector3();
    bbox.getCenter(center);

    // Calculate scaling factor
    let scale = options.scale || 1.0;
    if (options.targetLength && size.z > 0.001) {
      // If the model is aligned with X rather than Z, check dimensions
      const maxHorizontal = Math.max(size.x, size.z);
      if (size.x > size.z * 1.3 && !options.noAutoRotate) {
        // Model oriented sideways (along X axis): rotate 90 deg around Y
        scene.rotation.y = Math.PI / 2;
        bbox.setFromObject(root);
        bbox.getSize(size);
        bbox.getCenter(center);
      }
      scale = options.targetLength / size.z;
    } else if (options.targetHeight && size.y > 0.001) {
      scale = options.targetHeight / size.y;
    }

    scene.scale.set(scale, scale, scale);

    // Recalculate after scaling
    const finalBox = new THREE.Box3().setFromObject(root);
    const finalCenter = new THREE.Vector3();
    finalBox.getCenter(finalCenter);

    // Align center in X and Z, set bottom at y = 0
    scene.position.x = -finalCenter.x;
    scene.position.z = -finalCenter.z;
    scene.position.y = -finalBox.min.y + (options.yOffset || 0);

    // Optional custom rotation offset
    if (options.rotationY) {
      root.rotation.y = options.rotationY;
    }

    return root;
  }
}

export const modelLoader = new ModelLoader();
