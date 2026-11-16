// game.js — the game itself: state machine, loop, spawning, serving,
// scoring, days, hearts, timer, combo, input and the screen shake/flash.
// Rendering lives in render.js / screens.js; sound in audio.js.

import { goodsForDay, goodById, formatRp } from './goods.js';
import { Customer } from './customers.js';
import { Particles } from './particles.js';
import { SoundFX } from './audio.js';
import { drawBackground, drawStall, drawHUD, W, H } from './render.js';
import { drawTitle, drawDayClear, drawGameOver, drawPause } from './screens.js';

const SLOTS = [
  { x: 280, y: 400, side: 'left' },
  { x: 520, y: 400, side: 'left' },
  { x: 760, y: 400, side: 'right' },
  { x: 1000, y: 400, side: 'right' },
];
const DAY_TIME = (day) => Math.max(60, 90 - (day - 1) * 4);
const DAY_TARGET = (day) => (day === 1 ? 40000 : day === 2 ? 70000 : 110000 + (day - 3) * 40000);
const SPAWN_EVERY = (day) => Math.max(2.0, 4.6 - day * 0.45);
const BEST_KEY = 'pasarPagiRushBest';

export class Game {
  constructor() {
    this.sound = new SoundFX();
    this.particles = new Particles();
    this.phase = 'title';
    this.time = 0;
    this.best = 0;
    try { this.best = Number(localStorage.getItem(BEST_KEY)) || 0; } catch (e) { /* no storage */ }
    this.mouse = { x: 640, y: 360 };
    this.mouseSeen = false;
    this.hoverGood = null;
    this.hoverButton = null;
    this.buttons = [];
    this.reset();
  }

  reset() {
    this.day = 1;
    this.coins = 0;
    this.dayCoins = 0;
    this.target = DAY_TARGET(1);
    this.timeLeft = DAY_TIME(1);
    this.hearts = 3;
    this.combo = 0;
    this.bestCombo = 0;
    this.served = 0;
    this.customers = [];
    this.selectedGood = null;
    this.selectedCustomer = null;
    this.spawnTimer = 1.2;
    this.rushTimer = 26;
    this.rushBanner = 0;
    this.shake = 0;
    this.flash = 0;
    this.endReason = '';
    this.lastTickSecond = -1;
    this.particles = new Particles();
  }

  get multiplier() { return this.combo >= 10 ? 3 : this.combo >= 5 ? 2 : 1; }
  get dayProgress() { return Math.min(1, this.dayCoins / this.target); }
  get goods() { return goodsForDay(this.day); }

  start() {
    this.reset();
    this.phase = 'playing';
    this.sound.ensure();
    this.sound.click();
  }

  nextDay() {
    this.day += 1;
    this.dayCoins = 0;
    this.target = DAY_TARGET(this.day);
    this.timeLeft = DAY_TIME(this.day);
    this.customers = [];
    this.selectedGood = null;
    this.selectedCustomer = null;
    this.spawnTimer = 1.5;
    this.rushTimer = 26;
    this.phase = 'playing';
    this.sound.dayClear();
  }

  gameOver(reason) {
    this.phase = 'gameover';
    this.endReason = reason;
    this.sound.gameOver();
    if (this.coins > this.best) {
      this.best = this.coins;
      try { localStorage.setItem(BEST_KEY, String(this.best)); } catch (e) { /* no storage */ }
    }
  }

  freeSlot() {
    const busy = new Set(this.customers.filter((c) => c.state !== 'leaving').map((c) => c.slot.x));
    return SLOTS.find((s) => !busy.has(s.x)) || null;
  }

  spawnCustomer(forceVip = false) {
    const slot = this.freeSlot();
    if (!slot) return null;
    const vip = forceVip || Math.random() < 0.12;
    const c = new Customer(slot, this.day, vip);
    this.customers.push(c);
    return c;
  }

  // --- serving ---
  tryServe(customer, goodId) {
    if (!customer || customer.state !== 'waiting') return;
    const good = goodById(goodId);
    if (!good) return;
    const res = customer.serve(goodId);
    const cx = customer.x, cy = customer.y - 60;
    if (res === 'ok' || res === 'served') {
      this.combo += 1;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      const amount = good.price * this.multiplier;
      this.particles.burst(cx, cy, { count: 12, color: '#F2B705' });
      this.particles.floatText(cx, cy - 30, '+' + formatRp(amount), '#14564A', 24);
      this.sound.serve();
      if (res === 'served') {
        const tip = customer.patienceRatio > 0.5 ? Math.round(amount * 0.2) : 0;
        const vipBonus = customer.vip ? Math.round(amount * 0.5) : 0;
        const total = amount + tip + vipBonus;
        this.coins += total;
        this.dayCoins += total;
        this.served += 1;
        this.particles.burst(cx, cy - 20, { count: 22, color: '#F2B705', speed: 340 });
        if (tip > 0) this.particles.floatText(cx, cy - 64, `Tip +${formatRp(tip)}`, '#B8860B', 20);
        if (customer.vip) this.particles.floatText(cx, cy - 92, 'VIP!', '#D7263D', 22);
        this.sound.coin();
        customer.state = 'leaving';
        customer.mood = 'happy';
        if (this.selectedCustomer === customer) this.selectedCustomer = null;
        if (this.dayCoins >= this.target) this.dayClear();
      }
    } else if (res === 'wrong') {
      this.combo = 0;
      this.sound.error();
      this.particles.floatText(cx, cy - 30, 'Bukan itu!', '#D64541', 22);
      this.shake = 0.25;
    } else if (res === 'already') {
      this.sound.click();
      this.particles.floatText(cx, cy - 30, 'Sudah diberi!', '#7A6A5A', 20);
    }
  }

  dayClear() {
    this.phase = 'dayclear';
    this.particles.confetti(640, 200, 80);
    this.sound.dayClear();
  }

  // --- input ---
  handleClick(x, y) {
    this.sound.ensure();
    if (this.phase === 'title') { this.start(); return; }
    if (this.phase === 'gameover') { this.start(); return; }
    if (this.phase === 'dayclear') { this.nextDay(); return; }
    if (this.phase === 'paused') { this.phase = 'playing'; return; }
    if (this.phase !== 'playing') return;

    // shelf good?
    const g = this.goodAt(x, y);
    if (g) {
      if (this.selectedCustomer && this.selectedCustomer.state === 'waiting') {
        this.tryServe(this.selectedCustomer, g.id);
      } else {
        this.selectedGood = this.selectedGood === g.id ? null : g.id;
        if (this.selectedGood) this.sound.pick();
      }
      return;
    }
    // customer?
    const c = this.customerAt(x, y);
    if (c && c.state === 'waiting') {
      if (this.selectedGood) {
        this.tryServe(c, this.selectedGood);
      } else {
        this.selectedCustomer = this.selectedCustomer === c ? null : c;
        this.sound.click();
      }
      return;
    }
    // empty space: clear selection
    this.selectedGood = null;
    this.selectedCustomer = null;
  }

  handleMove(x, y) {
    this.mouse = { x, y };
    this.mouseSeen = true;
    this.hoverGood = this.phase === 'playing' ? (this.goodAt(x, y) || null) : null;
    this.hoverButton = null;
    for (const b of this.buttons) {
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) this.hoverButton = b.action;
    }
  }

  handleKey(code) {
    this.sound.ensure();
    if (code === 'KeyM') { this.sound.toggleMute(); return; }
    if (this.phase === 'title' || this.phase === 'gameover' || this.phase === 'dayclear') {
      if (code === 'Enter' || code === 'Space') {
        if (this.phase === 'title' || this.phase === 'gameover') this.start();
        else this.nextDay();
      }
      return;
    }
    if (code === 'KeyP' || code === 'Escape') {
      if (this.phase === 'playing') this.phase = 'paused';
      else if (this.phase === 'paused') this.phase = 'playing';
      return;
    }
    if (this.phase !== 'playing') return;
    const good = this.goods.find((g) => 'Digit' + g.key === code || 'Numpad' + g.key === code);
    if (good) {
      if (this.selectedCustomer && this.selectedCustomer.state === 'waiting') {
        this.tryServe(this.selectedCustomer, good.id);
      } else {
        this.selectedGood = this.selectedGood === good.id ? null : good.id;
        if (this.selectedGood) this.sound.pick();
      }
    }
  }

  goodAt(x, y) {
    if (y < 560 || y > 656) return null;
    const goods = this.goods;
    const cellW = 980 / Math.max(goods.length, 1);
    const i = Math.floor((x - 150) / cellW);
    if (i < 0 || i >= goods.length) return null;
    return goods[i];
  }

  customerAt(x, y) {
    for (let i = this.customers.length - 1; i >= 0; i--) {
      const c = this.customers[i];
      if (Math.abs(x - c.x) < 52 && y > c.y - 140 && y < c.y + 80) return c;
    }
    return null;
  }

  // --- loop ---
  update(dt) {
    this.time += dt;
    if (this.shake > 0) this.shake -= dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.rushBanner > 0) this.rushBanner -= dt;
    this.particles.update(dt);
    if (this.phase !== 'playing') return;

    // timer
    this.timeLeft -= dt;
    const sec = Math.ceil(this.timeLeft);
    if (sec <= 5 && sec !== this.lastTickSecond && sec > 0) {
      this.lastTickSecond = sec;
      this.sound.tick();
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.gameOver('Waktu habis — target harian tidak tercapai.');
      return;
    }
    // spawns
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnCustomer();
      this.spawnTimer = SPAWN_EVERY(this.day) * (0.8 + Math.random() * 0.4);
    }
    // rush hour
    this.rushTimer -= dt;
    if (this.rushTimer <= 0) {
      this.rushTimer = 26 + Math.random() * 6;
      this.rushBanner = 4;
      this.sound.rush();
      this.spawnCustomer();
      this.spawnCustomer();
    }
    // customers
    for (const c of this.customers) {
      const wasWaiting = c.state === 'waiting';
      c.update(dt);
      if (wasWaiting && c.state === 'leaving' && c.mood === 'angry') {
        this.hearts -= 1;
        this.combo = 0;
        this.shake = 0.4;
        this.flash = 0.5;
        this.sound.angry();
        this.particles.puff(c.x, c.y - 40);
        this.particles.floatText(c.x, c.y - 90, 'Pelanggan marah!', '#D64541', 22);
        if (this.selectedCustomer === c) this.selectedCustomer = null;
        if (this.hearts <= 0) {
          this.hearts = 0;
          this.gameOver('Tiga pelanggan pergi dengan marah.');
          return;
        }
      }
    }
    this.customers = this.customers.filter((c) => !c.gone);
  }

  draw(ctx) {
    ctx.save();
    if (this.shake > 0) {
      const m = this.shake * 22;
      ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
    }
    drawBackground(ctx, this.time);
    // entering customers first, so waiting customers draw on top
    const drawOrder = [...this.customers].sort((a, b) => {
      const rank = (c) => (c.state === 'entering' ? 0 : c.state === 'waiting' ? 1 : 2);
      return rank(a) - rank(b);
    });
    for (const c of drawOrder) c.draw(ctx);
    // selected customer ring
    if (this.selectedCustomer && this.selectedCustomer.state === 'waiting') {
      const c = this.selectedCustomer;
      ctx.strokeStyle = '#F2B705';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y + 78, 44, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    drawStall(ctx, this.goods, this.selectedGood, this.hoverGood ? this.hoverGood.id : null, this.time, {
      sign: this.phase !== 'title',
      shelf: this.phase !== 'title',
    });
    if (this.phase === 'playing' || this.phase === 'paused' || this.phase === 'dayclear') {
      drawHUD(ctx, {
        coins: this.coins, day: this.day, target: this.target,
        dayProgress: this.dayProgress, timeLeft: this.timeLeft,
        hearts: this.hearts, combo: this.combo, multiplier: this.multiplier, best: this.best,
      });
    }
    // picked good follows the cursor (only once the mouse has moved;
    // hidden while hovering a customer — the gold foot-ring marks them instead)
    if (this.selectedGood && this.phase === 'playing' && this.mouseSeen && !this.customerAt(this.mouse.x, this.mouse.y)) {
      const g = goodById(this.selectedGood);
      if (g) {
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = 'rgba(20,86,74,0.45)';
        ctx.beginPath();
        ctx.arc(this.mouse.x, this.mouse.y, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#F2B705';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        g.icon(ctx, this.mouse.x, this.mouse.y, 34);
        ctx.globalAlpha = 1;
      }
    }
    // rush banner (below the sign board, over the awning)
    if (this.rushBanner > 0 && this.phase === 'playing') {
      ctx.fillStyle = 'rgba(214,69,65,0.92)';
      ctx.beginPath();
      ctx.roundRect(440, 118, 400, 44, 12);
      ctx.fill();
      ctx.fillStyle = '#FFF6E3';
      ctx.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ RUSH! Pelanggan berdatangan!', 640, 148);
    }
    this.particles.draw(ctx);
    // red flash on angry walk-off
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(214,69,65,${(this.flash * 0.35).toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    // overlays
    this.buttons = [];
    if (this.phase === 'title') this.buttons = drawTitle(ctx, this, this.hoverButton);
    else if (this.phase === 'dayclear') this.buttons = drawDayClear(ctx, this, this.hoverButton);
    else if (this.phase === 'gameover') this.buttons = drawGameOver(ctx, this, this.hoverButton);
    else if (this.phase === 'paused') this.buttons = drawPause(ctx, this.hoverButton);
  }
}
