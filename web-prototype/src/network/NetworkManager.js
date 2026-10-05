// NetworkManager.js - Multiplayer Networking Hub for Option A (WebRTC P2P) & Option B (WebSocket Lobby)
import * as THREE from 'three';
import Peer from 'peerjs';

export class NetworkManager {
  constructor(scene, modelFactory, soundManager) {
    this.scene = scene;
    this.factory = modelFactory;
    this.sound = soundManager;

    // Networking state
    this.mode = 'solo'; // 'solo' | 'webrtc' | 'websocket'
    this.status = 'disconnected'; // 'disconnected' | 'connecting' | 'connected'
    this.role = 'solo'; // 'host' | 'client' | 'solo'
    this.callsign = '北宜過彎王';
    this.roomCode = '';
    this.localId = 'driver_' + Math.random().toString(36).substring(2, 8);
    this.wsUrl = 'ws://localhost:8080';

    // Connections
    this.peer = null;
    this.peerConnections = new Map(); // peerId -> DataConnection
    this.ws = null;
    this.broadcastChannel = null;

    // Remote player entities
    this.remotePlayers = new Map(); // id -> RemotePlayer

    // Sync throttling
    this.lastSendTime = 0;
    this.sendInterval = 50; // 20Hz (every 50ms)

    // Callbacks for UI
    this.onStatusChange = null;
    this.onPeersUpdate = null;
    this.onRemoteHorn = null;
    this.onToastMessage = null;

    // Setup local cross-tab fallback
    this.initBroadcastChannel();
  }

  setCallsign(name) {
    if (!name || !name.trim()) return;
    this.callsign = name.trim().substring(0, 14);
  }

  // ==========================================
  // Cross-Tab Broadcast Channel (Local multi-window bridge)
  // ==========================================
  initBroadcastChannel() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel('scooter_mayhem_local_bus');
        this.broadcastChannel.onmessage = (e) => {
          if (this.mode === 'solo') return;
          const data = e.data;
          if (!data || data.senderId === this.localId) return;
          this.handleIncomingPacket(data.senderId, data);
        };
      }
    } catch (_) {}
  }

  // ==========================================
  // Option A: WebRTC P2P (PeerJS Zero-Server Cost)
  // ==========================================
  async startWebRTC(action = 'host', targetRoomCode = '') {
    this.disconnect();
    this.mode = 'webrtc';
    this.status = 'connecting';
    this.notifyStatus('正在初始化 WebRTC P2P 點對點連線...');

    const cleanRoom = targetRoomCode.trim().toUpperCase() || this.generateRoomCode();
    this.roomCode = cleanRoom;
    const peerId = action === 'host' ? `sm-room-${cleanRoom}` : `sm-peer-${this.localId}`;

    try {
      this.peer = new Peer(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        console.log(`[WebRTC] Peer 成功建立，ID: ${id}`);
        if (action === 'host') {
          this.role = 'host';
          this.status = 'connected';
          this.notifyStatus(`✅ 房間已建立！房間代碼：${this.roomCode} (等待好友加入)`);
          if (this.onToastMessage) this.onToastMessage(`👑 房間建立成功！房間號：${this.roomCode}`);
        } else {
          this.role = 'client';
          this.connectToHostRoom(cleanRoom);
        }
      });

      this.peer.on('connection', (conn) => {
        console.log(`[WebRTC] 收到車友連線請求: ${conn.peer}`);
        this.setupPeerConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.warn('[WebRTC] 連線警告:', err);
        if (action === 'join' && err.type === 'peer-unavailable') {
          this.notifyStatus(`❌ 找不到房間「${cleanRoom}」，請確認房號是否正確！`);
        } else {
          this.notifyStatus(`⚠️ WebRTC 提示: ${err.type || '連線中'}`);
        }
      });

      this.peer.on('disconnected', () => {
        console.log('[WebRTC] Peer 離線，嘗試重新連線...');
        this.peer.reconnect();
      });

    } catch (err) {
      console.error('[WebRTC] 初始化失敗:', err);
      this.status = 'disconnected';
      this.notifyStatus('❌ WebRTC 啟動失敗，請檢查瀏覽器設定');
    }
  }

  connectToHostRoom(roomCode) {
    const hostPeerId = `sm-room-${roomCode}`;
    this.notifyStatus(`正在連接好友房間「${roomCode}」...`);
    const conn = this.peer.connect(hostPeerId, {
      reliable: true,
      metadata: { callsign: this.callsign, localId: this.localId }
    });
    this.setupPeerConnection(conn);
  }

  setupPeerConnection(conn) {
    conn.on('open', () => {
      console.log(`[WebRTC] 與車友 ${conn.peer} 建立雙向通道！`);
      this.peerConnections.set(conn.peer, conn);
      this.status = 'connected';
      this.notifyStatus(`🏎️ 車友已加入！當前房間：${this.roomCode}`);
      if (this.onToastMessage) this.onToastMessage(`⚡ 車友已連線！一起狂飆！`);
      this.notifyPeersUpdate();

      // Send greeting handshake
      conn.send({
        type: 'handshake',
        senderId: this.localId,
        callsign: this.callsign
      });
    });

    conn.on('data', (data) => {
      this.handleIncomingPacket(conn.peer, data);
    });

    conn.on('close', () => {
      console.log(`[WebRTC] 車友中斷連線: ${conn.peer}`);
      this.peerConnections.delete(conn.peer);
      this.removeRemotePlayer(conn.peer);
      this.notifyPeersUpdate();
    });

    conn.on('error', (err) => {
      console.warn(`[WebRTC] 通道錯誤 (${conn.peer}):`, err);
    });
  }

  // ==========================================
  // Option B: WebSocket Server Lobby
  // ==========================================
  startWebSocket(url = 'ws://localhost:8080') {
    this.disconnect();
    this.mode = 'websocket';
    this.status = 'connecting';
    this.wsUrl = url;
    this.notifyStatus(`正在連線公開伺服器大廳 (${url})...`);

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log(`[WebSocket] 成功連接至伺服器大廳: ${url}`);
        this.status = 'connected';
        this.notifyStatus(`⚡ 已連線至公開大廳！在線車友同步中...`);
        if (this.onToastMessage) this.onToastMessage(`🌐 成功加入公開伺服器大廳！`);

        // Send Join Message
        this.ws.send(JSON.stringify({
          type: 'join',
          callsign: this.callsign,
          room: 'public_lobby'
        }));
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleWebSocketMessage(msg);
        } catch (e) {
          console.warn('[WebSocket] 訊息解析錯誤', e);
        }
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] 與伺服器連線已中斷');
        this.status = 'disconnected';
        this.notifyStatus('⚠️ 與伺服器大廳連線已斷開');
      };

      this.ws.onerror = (err) => {
        console.warn('[WebSocket] 連線失敗:', err);
        this.status = 'disconnected';
        this.notifyStatus(`❌ 無法連線至 ${url}，可啟動 npm run lobby 或改用方案 A (WebRTC 好友開房)`);
      };

    } catch (e) {
      console.error('[WebSocket] 建立連線異常:', e);
      this.status = 'disconnected';
      this.notifyStatus('❌ WebSocket 初始化錯誤');
    }
  }

  handleWebSocketMessage(msg) {
    switch (msg.type) {
      case 'welcome':
        this.localId = msg.playerId || this.localId;
        break;

      case 'room_info':
        if (Array.isArray(msg.peers)) {
          msg.peers.forEach(p => {
            this.getOrCreateRemotePlayer(p.id, p.callsign, p.vehicle);
          });
          this.notifyPeersUpdate();
        }
        break;

      case 'peer_joined':
        this.getOrCreateRemotePlayer(msg.id, msg.callsign, msg.vehicle);
        if (this.onToastMessage) this.onToastMessage(`👋 車友【${msg.callsign}】駛入街區！`);
        this.notifyPeersUpdate();
        break;

      case 'peer_state':
        this.updateRemotePlayerState(msg.id, {
          callsign: msg.callsign,
          vehicle: msg.vehicle,
          pos: msg.pos,
          rot: msg.rot,
          speed: msg.speed,
          wheelie: msg.wheelie,
          horn: msg.horn
        });
        break;

      case 'peer_horn':
        this.triggerRemoteHorn(msg.id);
        break;

      case 'peer_left':
        this.removeRemotePlayer(msg.id);
        this.notifyPeersUpdate();
        break;
    }
  }

  // ==========================================
  // Unified Packet Router
  // ==========================================
  handleIncomingPacket(senderId, data) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'handshake': {
        const rp = this.getOrCreateRemotePlayer(senderId, data.callsign, data.vehicle);
        rp.callsign = data.callsign || rp.callsign;
        this.notifyPeersUpdate();
        break;
      }

      case 'state': {
        this.updateRemotePlayerState(senderId, data);
        break;
      }

      case 'horn': {
        this.triggerRemoteHorn(senderId);
        break;
      }

      case 'bye': {
        this.removeRemotePlayer(senderId);
        this.notifyPeersUpdate();
        break;
      }
    }
  }

  // ==========================================
  // Outbound Synchronization (Sent by main loop at 20Hz)
  // ==========================================
  broadcastState(playerController) {
    if (this.mode === 'solo' || this.status !== 'connected') return;

    const now = performance.now();
    if (now - this.lastSendTime < this.sendInterval) return;
    this.lastSendTime = now;

    const statePacket = {
      type: 'state',
      senderId: this.localId,
      callsign: this.callsign,
      vehicle: playerController.currentVehicleId || 'cygnus',
      pos: {
        x: Number(playerController.position.x.toFixed(2)),
        y: Number(playerController.position.y.toFixed(2)),
        z: Number(playerController.position.z.toFixed(2))
      },
      rot: Number(playerController.heading.toFixed(3)),
      speed: Number(playerController.getSpeedKmH().toFixed(1)),
      wheelie: Boolean(playerController.isWheelie),
      horn: Boolean(playerController.hornPressed)
    };

    // Send via Option A (WebRTC)
    if (this.mode === 'webrtc') {
      for (const conn of this.peerConnections.values()) {
        if (conn.open) {
          try { conn.send(statePacket); } catch (_) {}
        }
      }
    }

    // Send via Option B (WebSocket)
    if (this.mode === 'websocket' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      try { this.ws.send(JSON.stringify(statePacket)); } catch (_) {}
    }

    // Send via local broadcast bus
    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage(statePacket); } catch (_) {}
    }
  }

  broadcastHorn() {
    if (this.mode === 'solo' || this.status !== 'connected') return;
    const hornPacket = { type: 'horn', senderId: this.localId };

    if (this.mode === 'webrtc') {
      for (const conn of this.peerConnections.values()) {
        if (conn.open) {
          try { conn.send(hornPacket); } catch (_) {}
        }
      }
    } else if (this.mode === 'websocket' && this.ws && this.ws.readyState === WebSocket.OPEN) {
      try { this.ws.send(JSON.stringify(hornPacket)); } catch (_) {}
    }

    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage(hornPacket); } catch (_) {}
    }
  }

  // ==========================================
  // Remote 3D Player Entities
  // ==========================================
  getOrCreateRemotePlayer(id, callsign = '車友', vehicleType = 'cygnus') {
    if (this.remotePlayers.has(id)) {
      return this.remotePlayers.get(id);
    }

    console.log(`[Network] 產生遠端車手 3D 模型: ${id} (${callsign})`);
    const remoteModel = this.factory ? this.factory.createScooter(vehicleType) : new THREE.Group();
    this.scene.add(remoteModel);

    // Create 3D Overhead Name Tag Billboard
    const nameTag = this.createNameTagSprite(callsign);
    nameTag.position.set(0, 1.6, 0);
    remoteModel.add(nameTag);

    const remotePlayer = {
      id: id,
      callsign: callsign,
      vehicleType: vehicleType,
      mesh: remoteModel,
      nameTag: nameTag,
      targetPos: new THREE.Vector3(0, 0, 0),
      currentPos: new THREE.Vector3(0, 0, 0),
      targetRot: 0,
      currentRot: 0,
      speed: 0,
      isWheelie: false,
      lastSeen: Date.now()
    };

    this.remotePlayers.set(id, remotePlayer);
    this.notifyPeersUpdate();
    return remotePlayer;
  }

  updateRemotePlayerState(id, data) {
    const rp = this.getOrCreateRemotePlayer(id, data.callsign, data.vehicle);
    rp.lastSeen = Date.now();
    if (data.pos) {
      rp.targetPos.set(data.pos.x, data.pos.y, data.pos.z);
    }
    if (data.rot !== undefined) {
      rp.targetRot = data.rot;
    }
    if (data.speed !== undefined) {
      rp.speed = data.speed;
    }
    rp.isWheelie = Boolean(data.wheelie);

    if (data.horn) {
      this.triggerRemoteHorn(id);
    }
  }

  triggerRemoteHorn(id) {
    const rp = this.remotePlayers.get(id);
    if (!rp) return;

    // Show floating beep comic icon
    this.showHornBubble(rp);

    // Play 3D horn beep
    if (this.sound) {
      this.sound.playHorn();
    }
    if (this.onRemoteHorn) {
      this.onRemoteHorn(rp);
    }
  }

  showHornBubble(remotePlayer) {
    if (remotePlayer.nameTag) {
      remotePlayer.nameTag.scale.set(1.4, 1.4, 1.4);
      setTimeout(() => {
        if (remotePlayer.nameTag) remotePlayer.nameTag.scale.set(1.0, 1.0, 1.0);
      }, 300);
    }
  }

  removeRemotePlayer(id) {
    const rp = this.remotePlayers.get(id);
    if (rp) {
      if (rp.mesh) this.scene.remove(rp.mesh);
      this.remotePlayers.delete(id);
    }
  }

  createNameTagSprite(callsign) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Background pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect ? ctx.roundRect(10, 8, 236, 48, 14) : ctx.fillRect(10, 8, 236, 48);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 3;
    ctx.roundRect ? ctx.roundRect(10, 8, 236, 48, 14) : ctx.strokeRect(10, 8, 236, 48);
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🛵 ${callsign}`, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2.4, 0.6, 1.0);
    return sprite;
  }

  // ==========================================
  // Update Loop (Called by main animate)
  // ==========================================
  update(delta, playerController) {
    // 1. Broadcast local state
    if (playerController) {
      this.broadcastState(playerController);
    }

    // 2. Interpolate remote player positions & wheelie
    const now = Date.now();
    for (const [id, rp] of this.remotePlayers.entries()) {
      // Timeout inactive players (15 seconds)
      if (now - rp.lastSeen > 15000) {
        this.removeRemotePlayer(id);
        continue;
      }

      // Smooth Position Interpolation (Dead Reckoning Lerp)
      rp.currentPos.lerp(rp.targetPos, Math.min(1.0, delta * 14));
      rp.mesh.position.copy(rp.currentPos);

      // Smooth Rotation Interpolation
      let diffRot = rp.targetRot - rp.currentRot;
      while (diffRot > Math.PI) diffRot -= Math.PI * 2;
      while (diffRot < -Math.PI) diffRot += Math.PI * 2;
      rp.currentRot += diffRot * Math.min(1.0, delta * 12);
      rp.mesh.rotation.y = rp.currentRot;

      // Wheelie animation pitch
      if (rp.isWheelie) {
        rp.mesh.rotation.x = THREE.MathUtils.lerp(rp.mesh.rotation.x, -0.42, delta * 10);
      } else {
        rp.mesh.rotation.x = THREE.MathUtils.lerp(rp.mesh.rotation.x, 0, delta * 10);
      }
    }
  }

  // ==========================================
  // Disconnect & Cleanup
  // ==========================================
  disconnect() {
    if (this.peer) {
      try {
        for (const conn of this.peerConnections.values()) conn.close();
        this.peer.destroy();
      } catch (_) {}
      this.peer = null;
      this.peerConnections.clear();
    }

    if (this.ws) {
      try { this.ws.close(); } catch (_) {}
      this.ws = null;
    }

    // Clear remote player models
    for (const [id, rp] of this.remotePlayers.entries()) {
      if (rp.mesh) this.scene.remove(rp.mesh);
    }
    this.remotePlayers.clear();

    this.mode = 'solo';
    this.status = 'disconnected';
    this.role = 'solo';
    this.notifyStatus('已返回單人模式');
    this.notifyPeersUpdate();
  }

  // ==========================================
  // Utilities
  // ==========================================
  generateRoomCode() {
    const prefixes = ['TP', 'KH', 'TC', 'TN', 'BY', 'FM'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const n = Math.floor(1000 + Math.random() * 9000);
    return `${p}-${n}`;
  }

  notifyStatus(statusText) {
    if (this.onStatusChange) this.onStatusChange(this.status, statusText, this.mode);
  }

  notifyPeersUpdate() {
    if (this.onPeersUpdate) {
      const peerList = [];
      for (const [id, rp] of this.remotePlayers.entries()) {
        peerList.push({ id, callsign: rp.callsign, vehicle: rp.vehicleType });
      }
      this.onPeersUpdate(peerList);
    }
  }
}
