import { ExplorationProgress } from '../city/ExplorationWorld.js';

export class WorldMap {
  constructor(app) {
    this.app = app;
    let storage;
    try { storage = localStorage; } catch { /* Storage can be unavailable. */ }
    this.progress = new ExplorationProgress(storage);
    this.button = document.createElement('button');
    this.button.id = 'btn-world-map';
    this.button.textContent = '全區地圖 · M';
    this.button.setAttribute('aria-haspopup', 'dialog');
    document.getElementById('btn-pause').insertAdjacentElement('afterend', this.button);
    this.dialog = document.createElement('dialog');
    this.dialog.id = 'world-map';
    this.dialog.setAttribute('aria-labelledby', 'world-map-title');
    this.dialog.innerHTML = `<header><div><h2 id="world-map-title">福爾摩沙・街區散策</h2><p>河堤、老街、住宅街與夜市，沿環道繞回起點</p></div><button id="close-world-map" aria-label="關閉全區地圖">關閉 ×</button></header><div class="world-map-body"><canvas width="640" height="760" aria-label="全區道路、玩家方向、外送目的地與探索地標"></canvas><aside><h3>散策手帳</h3><p id="exploration-count"></p><ul id="exploration-list"></ul><p>靠近地標 5 公尺內，自動獲得紀念章。集滿獲得「全區散策家」稱號。</p><p>藍色箭頭：你的位置<br>粉紅圓點：外送目的地<br>金色圓點：已造訪地標</p><p>地圖開啟時，你的騎乘與送單倒數暫停。M 或 Esc 關閉。</p></aside></div>`;
    document.body.append(this.dialog);
    this.canvas = this.dialog.querySelector('canvas');
    this.button.addEventListener('click', () => this.toggle());
    this.dialog.querySelector('#close-world-map').addEventListener('click', () => this.close());
    this.dialog.addEventListener('cancel', e => { e.preventDefault(); this.close(); });
    this.dialog.addEventListener('close', () => { app.mapOpen = false; app.controller.keys = {}; });
    this.toast = document.createElement('div');
    this.toast.id = 'exploration-toast'; this.toast.setAttribute('role', 'status');
    document.body.append(this.toast);
  }
  toggle() {
    if (this.dialog.open) return this.close();
    if (!this.app.running) return;
    this.app.mapOpen = true;
    this.app.controller.keys = {};
    this.app.sound.updateEngine(0, false);
    this.render(); this.dialog.showModal();
  }
  close() {
    this.dialog.close(); this.app.mapOpen = false; this.app.controller.keys = {};
    this.button.focus();
  }
  update(active) {
    if (!active) return;
    const found = this.progress.visit(this.app.controller.position);
    if (!found) return;
    const count = this.progress.visited.size;
    this.toast.textContent = count === this.app.cityData.landmarks.length ? '全區散策家！六枚紀念章收集完成' : `發現 ${found.name} · 紀念章 ${count}/6`;
    this.toast.classList.add('visible');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.classList.remove('visible'), 4500);
  }
  render() {
    const { cityData, controller, gameMode } = this.app;
    const visited = this.progress.visited;
    this.dialog.querySelector('#exploration-count').textContent = visited.size === cityData.landmarks.length ? '全區散策家 · 全部完成' : `已收集 ${visited.size} / ${cityData.landmarks.length} 枚紀念章`;
    this.dialog.querySelector('#exploration-list').replaceChildren(...cityData.landmarks.map(p => {
      const li = document.createElement('li'); li.textContent = `${visited.has(p.id) ? '●' : '○'} ${p.name}`; return li;
    }));
    const ctx = this.canvas.getContext('2d');
    const scale = 1.18;
    const point = (x, z) => [320 + x * scale, 380 + z * scale];
    ctx.fillStyle = '#182f31'; ctx.fillRect(0, 0, 640, 760);
    ctx.fillStyle = '#2b5c69'; ctx.fillRect(320 - 146 * scale - 12 * scale, 380 - 270 * scale, 24 * scale, 540 * scale);
    ctx.strokeStyle = '#658078'; ctx.lineCap = 'round';
    for (const r of cityData.roads) {
      ctx.lineWidth = r.width * scale;
      ctx.beginPath(); ctx.moveTo(...point(r.x1, r.z1)); ctx.lineTo(...point(r.x2, r.z2)); ctx.stroke();
    }
    ctx.font = '20px sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = '#ede2c2';
    ctx.fillText('北 ↑', 28, 35);
    ctx.font = '16px sans-serif';
    for (const p of cityData.landmarks) {
      const [x, y] = point(p.x, p.z);
      ctx.fillStyle = visited.has(p.id) ? '#f3c86b' : '#e3e5d6';
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.textAlign = p.x < 0 ? 'right' : 'left';
      ctx.fillText(p.name, x + (p.x < 0 ? -12 : 12), y - 10);
    }
    if (gameMode.state === 'DELIVERING' && gameMode.currentTarget) {
      const p = gameMode.currentTarget.pos;
      ctx.fillStyle = '#ff89a1'; ctx.beginPath(); ctx.arc(...point(p.x, p.z), 8, 0, Math.PI * 2); ctx.fill();
    }
    const [x, y] = point(controller.position.x, controller.position.z);
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI - controller.heading);
    ctx.fillStyle = '#65e9ee'; ctx.strokeStyle = '#10292c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(8, 9); ctx.lineTo(0, 5); ctx.lineTo(-8, 9); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
}
