// audio.js — all sound is synthesised with the Web Audio API. No audio files.
// Every effect is a tiny envelope over an oscillator, so the game stays
// fully offline and dependency-free.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
  }

  // Browsers only allow audio after a user gesture; call from any click/key.
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  }

  // One note: {freq, at (seconds from now), dur, type, vol, slideTo?}
  note(freq, { at = 0, dur = 0.12, type = 'sine', vol = 0.5, slideTo = 0 } = {}) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + at;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  click() { this.note(720, { dur: 0.05, type: 'square', vol: 0.18 }); }
  pick() { this.note(520, { dur: 0.07, type: 'triangle', vol: 0.35 }); this.note(780, { at: 0.05, dur: 0.07, type: 'triangle', vol: 0.25 }); }
  serve() { this.note(659, { dur: 0.1, vol: 0.4 }); this.note(880, { at: 0.08, dur: 0.16, vol: 0.4 }); }
  coin() { this.note(988, { dur: 0.09, vol: 0.35 }); this.note(1319, { at: 0.07, dur: 0.09, vol: 0.35 }); this.note(1568, { at: 0.14, dur: 0.18, vol: 0.3 }); }
  error() { this.note(160, { dur: 0.18, type: 'sawtooth', vol: 0.3, slideTo: 110 }); }
  angry() { this.note(220, { dur: 0.16, type: 'sawtooth', vol: 0.32, slideTo: 130 }); this.note(165, { at: 0.14, dur: 0.22, type: 'sawtooth', vol: 0.3, slideTo: 98 }); }
  tick() { this.note(1047, { dur: 0.05, type: 'square', vol: 0.16 }); }
  rush() { this.note(392, { dur: 0.1, vol: 0.35 }); this.note(523, { at: 0.09, dur: 0.1, vol: 0.35 }); this.note(659, { at: 0.18, dur: 0.14, vol: 0.35 }); }
  dayClear() {
    [523, 659, 784, 1047].forEach((f, i) => this.note(f, { at: i * 0.11, dur: 0.2, vol: 0.4 }));
    this.note(1319, { at: 0.48, dur: 0.35, vol: 0.35 });
  }
  gameOver() {
    [392, 370, 349, 311].forEach((f, i) => this.note(f, { at: i * 0.16, dur: 0.24, type: 'triangle', vol: 0.38 }));
  }
}
