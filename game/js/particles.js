// particles.js — juice: coin bursts, floating "+Rp" texts, angry puffs and
// day-clear confetti. Pure canvas, no assets.

export class Particles {
  constructor() {
    this.bits = [];
    this.texts = [];
  }

  burst(x, y, { count = 14, color = '#F2B705', speed = 260, size = 5, gravity = 500 } = {}) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.4 + Math.random() * 0.8);
      this.bits.push({
        x, y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120,
        life: 0.7 + Math.random() * 0.4, age: 0,
        size: size * (0.6 + Math.random() * 0.8),
        color, gravity,
      });
    }
  }

  puff(x, y, color = '#D64541') {
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 60 + Math.random() * 120;
      this.bits.push({
        x, y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: 0.5 + Math.random() * 0.3, age: 0,
        size: 6 + Math.random() * 8, color, gravity: -40,
      });
    }
  }

  confetti(x, y, count = 60) {
    const colors = ['#F2B705', '#D7263D', '#2E7D6B', '#5B8DBF', '#F5820B', '#3E9B4F'];
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const v = 300 + Math.random() * 380;
      this.bits.push({
        x: x + (Math.random() - 0.5) * 500, y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: 1.4 + Math.random() * 0.8, age: 0,
        size: 5 + Math.random() * 5,
        color: colors[i % colors.length], gravity: 620, spin: (Math.random() - 0.5) * 12,
      });
    }
  }

  floatText(x, y, text, color = '#14564A', size = 26) {
    this.texts.push({ x, y, text, color, size, life: 1.1, age: 0 });
  }

  update(dt) {
    for (const b of this.bits) {
      b.age += dt;
      b.vy += b.gravity * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.spin) b.vx *= 1 - 0.4 * dt;
    }
    this.bits = this.bits.filter((b) => b.age < b.life);
    for (const t of this.texts) {
      t.age += dt;
      t.y -= 46 * dt;
    }
    this.texts = this.texts.filter((t) => t.age < t.life);
  }

  draw(ctx) {
    for (const b of this.bits) {
      const k = 1 - b.age / b.life;
      ctx.globalAlpha = Math.max(0, k);
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, Math.max(0.5, b.size * k), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const t of this.texts) {
      const k = 1 - t.age / t.life;
      ctx.globalAlpha = Math.min(1, k * 1.6);
      ctx.font = `bold ${t.size}px "Trebuchet MS", Verdana, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }
}
