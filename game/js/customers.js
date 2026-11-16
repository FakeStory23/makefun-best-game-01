// customers.js — the shoppers. Each one walks to a counter slot, shows an
// order bubble, waits with a draining patience bar, and leaves happy (paid)
// or angry (a heart is lost). Looks are randomised from palettes.

import { goodById } from './goods.js';

const SKINS = ['#F2C09A', '#E8A87C', '#C98A5E', '#8A5A33', '#F7D7B0'];
const SHIRTS = ['#D7263D', '#2E7D6B', '#5B8DBF', '#F2B705', '#8E44AD', '#E67E22', '#16A085'];
const PANTS = ['#2C3E50', '#5D4037', '#37474F', '#6D4C41'];
const HEADS = ['cap', 'hijab', 'hair', 'bun', 'hat'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export class Customer {
  constructor(slot, day, vip = false) {
    this.slot = slot;
    this.day = day;
    this.vip = vip;
    this.x = slot.x;
    this.targetX = slot.x;
    this.y = slot.y;
    this.state = 'entering'; // entering | waiting | leaving
    this.mood = 'ok'; // ok | happy | angry
    this.skin = pick(SKINS);
    this.shirt = pick(SHIRTS);
    this.pants = pick(PANTS);
    this.head = pick(HEADS);
    this.headColor = pick(['#2C2C2C', '#5D4037', '#8A5A33', '#D7263D', '#2E7D6B', '#F2B705']);
    this.walkPhase = Math.random() * 10;
    this.enterFrom = Math.random() < 0.5 ? -90 : 1370;
    this.x = this.enterFrom;
    this.speed = 170 + Math.random() * 60;
    this.bob = 0;

    // Order: 1-3 goods from today's catalogue, weighted to cheap goods early.
    const pool = day === 1 ? ['mangga', 'pisang', 'telur'] : day === 2
      ? ['mangga', 'pisang', 'telur', 'cabai', 'kelapa']
      : ['mangga', 'pisang', 'telur', 'cabai', 'kelapa', 'ikan', 'durian'];
    const count = vip ? 3 : (day === 1 ? (Math.random() < 0.6 ? 1 : 2) : (Math.random() < 0.45 ? 2 : 3));
    this.order = [];
    for (let i = 0; i < count; i++) {
      const id = pick(pool);
      if (!this.order.includes(id)) this.order.push(id);
    }
    if (this.order.length === 0) this.order.push('pisang');
    this.given = new Set();
    this.patienceMax = Math.max(7, (vip ? 11 : 15) - day * 0.9 - Math.random() * 2);
    this.patience = this.patienceMax;
    this.tipped = false;
  }

  get done() { return this.order.every((id) => this.given.has(id)); }
  get patienceRatio() { return Math.max(0, this.patience / this.patienceMax); }
  get remaining() { return this.order.filter((id) => !this.given.has(id)); }

  // Returns 'served' when the last item lands, 'wrong' when the good is not
  // wanted, 'already' when it was given before, else 'ok'.
  serve(goodId) {
    if (this.state !== 'waiting') return 'gone';
    if (this.given.has(goodId)) return 'already';
    if (!this.order.includes(goodId)) return 'wrong';
    this.given.add(goodId);
    return this.done ? 'served' : 'ok';
  }

  update(dt) {
    this.bob += dt * 10;
    if (this.state === 'entering') {
      const dir = Math.sign(this.targetX - this.x);
      this.x += dir * this.speed * dt;
      if ((dir > 0 && this.x >= this.targetX) || (dir < 0 && this.x <= this.targetX)) {
        this.x = this.targetX;
        this.state = 'waiting';
      }
    } else if (this.state === 'waiting') {
      this.patience -= dt;
      if (this.patience <= 0) {
        this.patience = 0;
        this.state = 'leaving';
        this.mood = 'angry';
      }
    } else if (this.state === 'leaving') {
      const dir = this.mood === 'angry' ? (this.x < 640 ? -1 : 1) : (this.slot.side === 'left' ? -1 : 1);
      this.x += dir * (this.mood === 'angry' ? 320 : 200) * dt;
    }
  }

  get gone() { return this.state === 'leaving' && (this.x < -120 || this.x > 1400); }

  draw(ctx) {
    const x = this.x, y = this.y;
    const walk = this.state === 'entering' || this.state === 'leaving' ? Math.sin(this.bob) * 3 : Math.sin(this.bob * 0.5) * 1;
    const urgent = this.state === 'waiting' && this.patienceRatio < 0.3;
    const shake = urgent ? Math.sin(this.bob * 3) * 1.5 : 0;

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(x, y + 78, 34, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // legs
    ctx.fillStyle = this.pants;
    ctx.fillRect(x - 14 + walk, y + 44, 11, 32);
    ctx.fillRect(x + 3 - walk, y + 44, 11, 32);
    // body
    ctx.fillStyle = this.shirt;
    ctx.beginPath();
    ctx.roundRect(x - 22 + shake, y - 2, 44, 48, 10);
    ctx.fill();
    // arms
    ctx.strokeStyle = this.shirt;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    const armSwing = this.state === 'entering' || this.state === 'leaving' ? Math.sin(this.bob) * 8 : 0;
    ctx.beginPath();
    ctx.moveTo(x - 20 + shake, y + 8);
    ctx.lineTo(x - 30 + shake, y + 26 + armSwing);
    ctx.moveTo(x + 20 + shake, y + 8);
    ctx.lineTo(x + 30 + shake, y + 26 - armSwing);
    ctx.stroke();
    // head
    circle(ctx, x + shake, y - 18, 17, this.skin);
    // headwear / hair
    if (this.head === 'cap' || this.head === 'hat') {
      ctx.fillStyle = this.headColor;
      ctx.beginPath();
      ctx.arc(x + shake, y - 22, 17, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(x + shake - 2, y - 40, 26, 5);
      if (this.head === 'hat') {
        ctx.fillRect(x + shake - 17, y - 40, 34, 5);
        ctx.fillRect(x + shake - 12, y - 52, 24, 13);
      }
    } else if (this.head === 'hijab') {
      ctx.fillStyle = this.headColor;
      ctx.beginPath();
      ctx.arc(x + shake, y - 18, 19, 0, Math.PI * 2);
      ctx.fill();
      circle(ctx, x + shake, y - 16, 13, this.skin);
    } else if (this.head === 'bun') {
      circle(ctx, x + shake, y - 36, 7, '#2C2C2C');
      ctx.fillStyle = '#2C2C2C';
      ctx.beginPath();
      ctx.arc(x + shake, y - 22, 17, Math.PI, 0);
      ctx.fill();
    } else {
      ctx.fillStyle = '#2C2C2C';
      ctx.beginPath();
      ctx.arc(x + shake, y - 22, 17, Math.PI, 0);
      ctx.fill();
    }
    // eyes
    ctx.fillStyle = '#222';
    circle(ctx, x - 6 + shake, y - 18, 2, '#222');
    circle(ctx, x + 6 + shake, y - 18, 2, '#222');
    // mouth: smile / flat / frown by mood
    ctx.strokeStyle = '#7A3B1E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (this.mood === 'happy') ctx.arc(x + shake, y - 12, 6, 0.15 * Math.PI, 0.85 * Math.PI);
    else if (this.mood === 'angry') ctx.arc(x + shake, y - 6, 6, 1.15 * Math.PI, 1.85 * Math.PI);
    else { ctx.moveTo(x - 5 + shake, y - 10); ctx.lineTo(x + 5 + shake, y - 10); }
    ctx.stroke();

    // VIP crown
    if (this.vip) {
      ctx.fillStyle = '#F2B705';
      ctx.beginPath();
      ctx.moveTo(x - 12 + shake, y - 44);
      ctx.lineTo(x - 12 + shake, y - 56);
      ctx.lineTo(x - 4 + shake, y - 48);
      ctx.lineTo(x + shake, y - 58);
      ctx.lineTo(x + 4 + shake, y - 48);
      ctx.lineTo(x + 12 + shake, y - 56);
      ctx.lineTo(x + 12 + shake, y - 44);
      ctx.closePath();
      ctx.fill();
    }

    if (this.state === 'waiting') this.drawOrder(ctx, x, y);
  }

  drawOrder(ctx, x, y) {
    // speech bubble above the head
    const items = this.order;
    const w = 30 + items.length * 34;
    const bx = x - w / 2, by = y - 132;
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.strokeStyle = '#14564A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, w, 52, 12);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 8, by + 52);
    ctx.lineTo(x + 8, by + 52);
    ctx.lineTo(x, by + 66);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.fill();
    items.forEach((id, i) => {
      const ix = bx + 24 + i * 34;
      const iy = by + 26;
      const good = goodById(id);
      if (this.given.has(id)) {
        ctx.globalAlpha = 0.35;
        good.icon(ctx, ix, iy, 30);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#3E9B4F';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ix - 9, iy);
        ctx.lineTo(ix - 2, iy + 8);
        ctx.lineTo(ix + 10, iy - 8);
        ctx.stroke();
      } else {
        good.icon(ctx, ix, iy, 30);
      }
    });
    // patience bar under the bubble
    const ratio = this.patienceRatio;
    const barW = w - 16;
    const barX = bx + 8, barY = by + 58;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, 7, 3.5);
    ctx.fill();
    ctx.fillStyle = ratio > 0.5 ? '#3E9B4F' : ratio > 0.25 ? '#F2B705' : '#D64541';
    ctx.beginPath();
    ctx.roundRect(barX, barY, Math.max(0, barW * ratio), 7, 3.5);
    ctx.fill();
    if (ratio < 0.25) {
      ctx.fillStyle = '#D64541';
      ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', x, by - 8);
    }
  }
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
