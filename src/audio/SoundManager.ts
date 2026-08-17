/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private currentTrack: string | null = null;
  private musicInterval: number | null = null;
  private isMusicPlaying: boolean = false;
  private currentBeat: number = 0;
  private tempo: number = 130; // BPM

  public sfxVolume: number = 0.8;
  public musicVolume: number = 0.5;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  private ensureContext(): boolean {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return !!this.ctx;
  }

  public setVolumes(sfx: number, music: number) {
    this.sfxVolume = sfx;
    this.musicVolume = music;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolumes(this.sfxVolume, this.musicVolume);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- ORIGINAL SOUND EFFECTS SYNTHESIS ---

  public playJump(isHigh: boolean = false) {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const startFreq = isHigh ? 220 : 180;
    const endFreq = isHigh ? 580 : 440;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playLand(intensity: number = 1) {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Sub thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    oscGain.gain.setValueAtTime(Math.min(0.5, 0.25 * intensity), now);
    oscGain.gain.linearRampToValueAtTime(0.01, now + 0.14);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);

    // Dust noise burst
    if (intensity > 1.2) {
      this.playNoise(0.08, 0.15 * intensity, 400);
    }
  }

  public playSkid() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    this.playNoise(0.1, 0.12, 1200);
  }

  public playCoin() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [987.77, 1318.51]; // B5 -> E6
    
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);

      gain.gain.setValueAtTime(0.3, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.3);
    });
  }

  public playPrismShard() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.25, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.36);
    });
  }

  public playStomp() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Pitch pop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.14);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.17);

    // Punch noise
    this.playNoise(0.06, 0.25, 800);
  }

  public playDeflect() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(3200, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playHit() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.2);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.23);
    this.playNoise(0.12, 0.3, 500);
  }

  public playPowerUp() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const chords = [330, 392, 493, 587, 659, 783, 987]; // Rich melodic rise
    
    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.2, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.32);
    });
  }

  public playFireball() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playBounce() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playCheckpoint() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A Major chime
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.3, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.52);
    });
  }

  public playBossRoar() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(45, now + 0.6);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.75);
    this.playNoise(0.5, 0.4, 300);
  }

  public playLevelClear() {
    if (!this.ensureContext() || !this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Triumphant fanfare
    const notes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 0.14 },
      { f: 783.99, d: 0.12, t: 0.28 },
      { f: 1046.50, d: 0.35, t: 0.42 },
      { f: 880, d: 0.15, t: 0.8 },
      { f: 1046.50, d: 0.6, t: 0.98 }
    ];

    notes.forEach(n => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0.35, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.005, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.05);
    });
  }

  private playNoise(duration: number, volume: number, filterFreq: number) {
    if (!this.ctx || !this.sfxGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
  }

  // --- PROCEDURAL DYNAMIC MUSIC ENGINE ---

  public playMusic(track: 'valley' | 'cavern' | 'desert' | 'ice' | 'mystic' | 'volcano' | 'boss' | 'menu') {
    if (this.currentTrack === track && this.isMusicPlaying) return;
    this.stopMusic();

    this.currentTrack = track;
    this.isMusicPlaying = true;
    this.currentBeat = 0;

    switch (track) {
      case 'valley':
        this.tempo = 126;
        break;
      case 'cavern':
        this.tempo = 108;
        break;
      case 'desert':
        this.tempo = 120;
        break;
      case 'ice':
        this.tempo = 132;
        break;
      case 'mystic':
        this.tempo = 115;
        break;
      case 'volcano':
        this.tempo = 140;
        break;
      case 'boss':
        this.tempo = 148;
        break;
      default:
        this.tempo = 120;
    }

    if (!this.ensureContext() || !this.ctx) return;

    const intervalMs = (60000 / this.tempo) / 4; // 16th notes
    this.musicInterval = window.setInterval(() => {
      this.stepMusicLoop();
    }, intervalMs);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
    this.currentTrack = null;
  }

  private stepMusicLoop() {
    if (!this.ctx || !this.musicGain || this.isMuted) {
      this.currentBeat = (this.currentBeat + 1) % 64;
      return;
    }

    const now = this.ctx.currentTime;
    const b = this.currentBeat;

    // Track-specific harmonic progression
    if (this.currentTrack === 'valley') {
      // Upbeat adventure in C Major
      // Bass line on quarters
      if (b % 4 === 0) {
        const bassFreqs = [130.81, 164.81, 196.00, 220.00, 174.61, 196.00, 130.81, 196.00];
        const f = bassFreqs[Math.floor(b / 8) % bassFreqs.length];
        this.synthBass(f, now, 0.15);
      }
      // Lead melody
      const melodyFreqs: { [step: number]: number } = {
        0: 523.25, 3: 587.33, 6: 659.25, 8: 783.99, 12: 659.25, 14: 523.25,
        16: 587.33, 19: 659.25, 22: 783.99, 24: 880.00, 28: 783.99, 30: 659.25,
        32: 698.46, 35: 783.99, 38: 880.00, 40: 1046.50, 44: 880.00, 46: 698.46,
        48: 783.99, 52: 659.25, 56: 587.33, 60: 523.25
      };
      if (melodyFreqs[b]) {
        this.synthLead(melodyFreqs[b], now, 0.2, 'triangle');
      }
      // Hi-hats
      if (b % 2 === 0) {
        this.synthPercussion(b % 4 === 2 ? 'snare' : 'hihat', now);
      }
      if (b % 8 === 0) {
        this.synthPercussion('kick', now);
      }
    } else if (this.currentTrack === 'cavern') {
      // Ambient mystical cave (A minor, echoing arpeggios)
      if (b % 8 === 0) {
        const caveBass = [110, 110, 130.81, 146.83];
        this.synthBass(caveBass[Math.floor(b / 16) % caveBass.length], now, 0.35);
      }
      const arp = [440, 523.25, 659.25, 783.99, 659.25, 523.25];
      if (b % 2 === 0) {
        const note = arp[(b / 2) % arp.length];
        this.synthLead(note, now, 0.25, 'sine');
      }
      if (b % 16 === 8) {
        this.synthPercussion('snare', now);
      }
    } else if (this.currentTrack === 'boss') {
      // Fast, driving intense boss battle
      if (b % 2 === 0) {
        const bossBass = [73.42, 73.42, 87.31, 98.00, 73.42, 110.00, 98.00, 87.31];
        this.synthBass(bossBass[(b / 2) % bossBass.length], now, 0.12);
      }
      if (b % 4 === 0) {
        this.synthPercussion('kick', now);
      }
      if (b % 4 === 2) {
        this.synthPercussion('snare', now);
      }
      if (b % 2 === 1) {
        this.synthPercussion('hihat', now);
      }
      // Lead riff
      if (b % 4 === 0) {
        const lead = [587.33, 698.46, 783.99, 880.00, 1046.50, 880.00, 783.99, 698.46];
        this.synthLead(lead[(b / 4) % lead.length], now, 0.18, 'sawtooth');
      }
    } else {
      // Default / Desert / Ice / Volcano themes
      if (b % 4 === 0) {
        this.synthBass(130.81 + (b % 16) * 10, now, 0.18);
        this.synthPercussion('kick', now);
      }
      if (b % 4 === 2) {
        this.synthPercussion('snare', now);
      }
      if (b % 2 === 0) {
        this.synthLead(523.25 + ((b * 37) % 300), now, 0.15, 'triangle');
      }
    }

    this.currentBeat = (this.currentBeat + 1) % 64;
  }

  private synthBass(freq: number, time: number, dur: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, time);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private synthLead(freq: number, time: number, dur: number, wave: OscillatorType = 'triangle') {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.005, time + dur);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private synthPercussion(type: 'kick' | 'snare' | 'hihat', time: number) {
    if (!this.ctx || !this.musicGain) return;
    if (type === 'kick') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, time);
      osc.frequency.exponentialRampToValueAtTime(35, time + 0.08);

      gain.gain.setValueAtTime(0.28, time);
      gain.gain.linearRampToValueAtTime(0.01, time + 0.09);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.1);
    } else if (type === 'snare') {
      const bufferSize = this.ctx.sampleRate * 0.06;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.linearRampToValueAtTime(0.01, time + 0.06);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.start(time);
    } else if (type === 'hihat') {
      const bufferSize = this.ctx.sampleRate * 0.025;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(6000, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.07, time);
      gain.gain.linearRampToValueAtTime(0.005, time + 0.025);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.start(time);
    }
  }
}

export const soundManager = new SoundManager();
