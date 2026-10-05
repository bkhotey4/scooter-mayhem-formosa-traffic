// SoundManager.js - Procedural Web Audio API sound engine & voice generator
export class SoundManager {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.muted = false;

    // Engine sound nodes
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.noiseNode = null;
    this.noiseGain = null;

    // Music
    this.bgmPlaying = false;
    this.bgmTimer = null;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initEngineAudio();
      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio not supported or blocked", e);
    }
  }

  initEngineAudio() {
    if (!this.ctx) return;
    // 2-Stroke Scooter Engine Synthesizer
    this.engineOsc1 = this.ctx.createOscillator();
    this.engineOsc1.type = 'sawtooth';
    this.engineOsc1.frequency.setValueAtTime(45, this.ctx.currentTime);

    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = 'triangle';
    this.engineOsc2.frequency.setValueAtTime(90, this.ctx.currentTime);

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(400, this.ctx.currentTime);

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

    // Subtle exhaust noise
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(800, this.ctx.currentTime);
    noiseFilter.Q.setValueAtTime(3, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.0005, this.ctx.currentTime);

    this.noiseNode.connect(noiseFilter);
    noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.ctx.destination);

    this.engineOsc1.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);

    this.engineOsc1.start();
    this.engineOsc2.start();
    this.noiseNode.start();
  }

  updateEngine(speedKmH, throttle) {
    if (!this.initialized || this.muted || !this.engineGain) return;
    const now = this.ctx.currentTime;
    const normSpeed = Math.min(speedKmH / 90, 1.2);

    // 2-stroke rev pitch
    const baseFreq = 40 + normSpeed * 120 + (throttle ? 35 : 0);
    this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 2.01, now, 0.08);

    const filterFreq = 300 + normSpeed * 1800 + (throttle ? 500 : 0);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.08);

    const gain = Math.min(0.08 + normSpeed * 0.12 + (throttle ? 0.05 : 0), 0.25);
    this.engineGain.gain.setTargetAtTime(gain, now, 0.05);
    this.noiseGain.gain.setTargetAtTime(0.01 + normSpeed * 0.03, now, 0.05);
  }

  playHorn() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;

    // Classic Taiwanese Scooter dual-tone beep "叭叭！"
    [440, 520].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      // Second beep
      gain.gain.setValueAtTime(0.25, now + 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    });
  }

  playBrakeSqueal() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2600 + Math.random() * 400, now);
    osc.frequency.linearRampToValueAtTime(2100, now + 0.25);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  playDoorOpen() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;

    // Click/Latch + Swing Woosh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playCrash() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;

    // Metal crunch + explosion
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(80, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.6);

    // Also play funny groan or metal bounce
    this.playTone(85, 0.3, 'square', 0.2);
  }

  playBobaSpill() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;

    // Liquid squelch / splat
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playGutterSparks() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400 + Math.random() * 600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playMetalClang() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    // Resonant metallic ping & clank for roadwork steel plates
    [880, 1320, 1760].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() * 50 - 25), now);
      gain.gain.setValueAtTime(0.25 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    });
  }

  playGongDrum() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    // 1. Temple Gong Strike (鑼聲響徹)
    [329.63, 659.25, 987.77].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.9);
    });

    // 2. Taiko Temple Drum Thump (咚！低沉大鼓)
    const drumOsc = this.ctx.createOscillator();
    const drumGain = this.ctx.createGain();
    drumOsc.type = 'sine';
    drumOsc.frequency.setValueAtTime(140, now);
    drumOsc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

    drumGain.gain.setValueAtTime(0.4, now);
    drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    drumOsc.connect(drumGain);
    drumGain.connect(this.ctx.destination);
    drumOsc.start(now);
    drumOsc.stop(now + 0.42);
  }

  playWaterSplash() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.linearRampToValueAtTime(600, now + 0.3);
    filter.Q.setValueAtTime(2.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.35);
  }

  playWindHowl() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.linearRampToValueAtTime(520, now + 0.3);
    osc.frequency.linearRampToValueAtTime(240, now + 0.7);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.72);
  }

  playDogBark() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    [0, 0.18].forEach(delay => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now + delay);
      osc.frequency.exponentialRampToValueAtTime(190, now + delay + 0.14);

      gain.gain.setValueAtTime(0.25, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.16);
    });
  }

  playCameraShutter() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    // Camera click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'highpass';
    osc.frequency.setValueAtTime(3200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);

    // Beep recharge
    setTimeout(() => {
      this.playTone(1800, 0.12, 'sine', 0.15);
    }, 120);
  }

  playFirecrackers() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    // Rapid crackle bursts
    for (let i = 0; i < 8; i++) {
      const delay = i * 0.05 + Math.random() * 0.02;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600 + Math.random() * 1200, now + delay);
      osc.frequency.exponentialRampToValueAtTime(100, now + delay + 0.04);

      gain.gain.setValueAtTime(0.35, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.06);
    }
  }

  playTempleGong() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    // Resonant temple gong & bell
    [220, 440, 660, 880].forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.25);
    });
  }

  playUpgradeChime() {
    if (!this.initialized || this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 0.18, 'triangle', 0.25);
      }, idx * 70);
    });
  }

  playTone(freq, duration = 0.2, type = 'sine', vol = 0.2) {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  playComboSound(comboLevel = 1) {
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    const freq = freqs[Math.min(comboLevel, freqs.length - 1)];
    this.playTone(freq, 0.25, 'triangle', 0.25);
  }

  speak(text) {
    if (!('speechSynthesis' in window) || this.muted) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-TW';
      utter.rate = 1.35;
      utter.pitch = 1.15;
      utter.volume = 0.85;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn("Speech synthesis error", e);
    }
  }

  playEggCrack() {
    if (!this.initialized || this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playGasHiss() {
    if (!this.initialized || this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.45;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.8;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(4, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playSizzle() {
    if (!this.initialized || this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3500, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playCelebrationChime() {
    if (!this.initialized || this.muted || !this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      }, idx * 100);
    });
  }

  startBGM() {
    if (this.bgmPlaying || this.muted || !this.initialized) return;
    this.bgmPlaying = true;

    // Retro Taiwanese 80s City-Pop / Arcade Funky Bass loop
    const chords = [
      [261.63, 329.63, 392.00], // C
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [196.00, 246.94, 293.66], // G
    ];

    const bassNotes = [130.81, 110.00, 87.31, 98.00];
    let step = 0;

    const playBeat = () => {
      if (!this.bgmPlaying || this.muted) return;
      const now = this.ctx.currentTime;
      const chordIdx = Math.floor(step / 4) % chords.length;
      const beatInChord = step % 4;

      // Bass note on each beat
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(bassNotes[chordIdx] * (beatInChord === 2 ? 1.5 : 1), now);
      bassGain.gain.setValueAtTime(0.09, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.26);

      // Hi-hat noise on every 8th
      if (step % 2 === 1) {
        const hhOsc = this.ctx.createOscillator();
        const hhGain = this.ctx.createGain();
        hhOsc.type = 'square';
        hhOsc.frequency.setValueAtTime(8000, now);
        hhGain.gain.setValueAtTime(0.02, now);
        hhGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        hhOsc.connect(hhGain);
        hhGain.connect(this.ctx.destination);
        hhOsc.start(now);
        hhOsc.stop(now + 0.06);
      }

      step++;
      this.bgmTimer = setTimeout(playBeat, 260); // ~115 BPM
    };

    playBeat();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      if (this.engineGain) this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.muted;
  }
}
