// lobby_server.js - Lightweight Taiwanese Scooter Mayhem WebSocket Lobby Server
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

const PORT = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({
      status: 'online',
      game: 'Scooter Mayhem: Formosa Traffic',
      onlinePlayers: wss.clients.size,
      rooms: getRoomSummary(),
      uptime: process.uptime()
    }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });
const players = new Map(); // ws -> { id, callsign, room, lastSeen }

function getRoomSummary() {
  const summary = {};
  for (const p of players.values()) {
    summary[p.room] = (summary[p.room] || 0) + 1;
  }
  return summary;
}

wss.on('connection', (ws) => {
  const playerId = 'player_' + Math.random().toString(36).substring(2, 9);
  const playerInfo = {
    id: playerId,
    callsign: '車友_' + playerId.substring(7),
    room: 'public_lobby',
    lastSeen: Date.now()
  };
  players.set(ws, playerInfo);

  console.log(`[Lobby Server] 🛵 車手連線: ${playerId}`);

  // Send welcome packet
  ws.send(JSON.stringify({
    type: 'welcome',
    playerId: playerId,
    serverTime: Date.now()
  }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      playerInfo.lastSeen = Date.now();

      switch (msg.type) {
        case 'join': {
          playerInfo.callsign = msg.callsign || playerInfo.callsign;
          playerInfo.room = msg.room || 'public_lobby';
          playerInfo.vehicle = msg.vehicle || 'cygnus';

          // Notify existing players in room
          broadcastToRoom(playerInfo.room, ws, {
            type: 'peer_joined',
            id: playerInfo.id,
            callsign: playerInfo.callsign,
            vehicle: playerInfo.vehicle
          });

          // Send current player list to newcomer
          const roomPeers = [];
          for (const [otherWs, otherP] of players.entries()) {
            if (otherWs !== ws && otherP.room === playerInfo.room) {
              roomPeers.push({
                id: otherP.id,
                callsign: otherP.callsign,
                vehicle: otherP.vehicle
              });
            }
          }
          ws.send(JSON.stringify({
            type: 'room_info',
            room: playerInfo.room,
            peers: roomPeers
          }));
          break;
        }

        case 'state': {
          // Relay transform & controls to room peers
          broadcastToRoom(playerInfo.room, ws, {
            type: 'peer_state',
            id: playerInfo.id,
            callsign: playerInfo.callsign,
            vehicle: playerInfo.vehicle,
            pos: msg.pos,
            rot: msg.rot,
            speed: msg.speed,
            wheelie: msg.wheelie,
            horn: msg.horn
          });
          break;
        }

        case 'horn': {
          broadcastToRoom(playerInfo.room, ws, {
            type: 'peer_horn',
            id: playerInfo.id
          });
          break;
        }

        case 'ping': {
          ws.send(JSON.stringify({ type: 'pong', time: msg.time }));
          break;
        }
      }
    } catch (err) {
      console.warn('[Lobby Server] 封包解析失敗:', err);
    }
  });

  ws.on('close', () => {
    console.log(`[Lobby Server] 💨 車手離線: ${playerInfo.id} (${playerInfo.callsign})`);
    broadcastToRoom(playerInfo.room, ws, {
      type: 'peer_left',
      id: playerInfo.id
    });
    players.delete(ws);
  });

  ws.on('error', (err) => {
    console.warn(`[Lobby Server] 連線異常 (${playerInfo.id}):`, err.message);
  });
});

function broadcastToRoom(room, senderWs, payload) {
  const data = JSON.stringify(payload);
  for (const [ws, info] of players.entries()) {
    if (ws !== senderWs && info.room === room && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

// Heartbeat interval
setInterval(() => {
  const now = Date.now();
  for (const [ws, info] of players.entries()) {
    if (now - info.lastSeen > 35000) {
      ws.terminate();
      players.delete(ws);
    }
  }
}, 15000);

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌐 [Scooter Mayhem 多人連線大廳伺服器 (方案 B)] 啟動成功！`);
  console.log(`📍 監聽端口：ws://localhost:${PORT}`);
  console.log(`📡 健康檢查：http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});
