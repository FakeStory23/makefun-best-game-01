// render.js — draws the world: dawn sky, street, the stall with its striped
// awning and goods shelf, and the HUD bar. All vector art, no images.

import { formatRp } from './goods.js';

export const W = 1280;
export const H = 720;

const SHELF_Y = 560;

export function drawBackground(ctx, t) {
  // dawn sky
  const sky = ctx.createLinearGradient(0, 0, 0, 480);
  sky.addColorStop(0, '#FFE9B8');
  sky.addColorStop(0.55, '#FFD9A0');
  sky.addColorStop(1, '#FFC98A');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, 480);
  // sun with soft glow
  const glow = ctx.createRadialGradient(1050, 110, 10, 1050, 110, 190);
  glow.addColorStop(0, 'rgba(255,214,90,0.9)');
  glow.addColorStop(1, 'rgba(255,214,90,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(860, -80, 380, 380);
  ctx.fillStyle = '#FFD65A';
  ctx.beginPath();
  ctx.arc(1050, 110, 46, 0, Math.PI * 2);
  ctx.fill();
  // drifting clouds
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (let i = 0; i < 3; i++) {
    const cx = ((t * 6 + i * 430) % 1500) - 120;
    const cy = 60 + i * 46;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 62, 17, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 44, cy + 6, 46, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // distant rooftops
  ctx.fillStyle = '#C98A5E';
  const roofs = [[0, 330, 210, 90], [190, 300, 240, 120], [410, 340, 200, 80], [590, 310, 260, 110], [830, 340, 220, 80], [1030, 315, 250, 105]];
  for (const [x, y, w, h] of roofs) {
    ctx.fillRect(x, y, w, h);
    ctx.beginPath();
    ctx.moveTo(x - 12, y);
    ctx.lineTo(x + w / 2, y - 42);
    ctx.lineTo(x + w + 12, y);
    ctx.closePath();
    ctx.fillStyle = '#A8663F';
    ctx.fill();
    ctx.fillStyle = '#C98A5E';
  }
  // street
  ctx.fillStyle = '#E3B77E';
  ctx.fillRect(0, 420, W, 300);
  ctx.fillStyle = '#D9A86B';
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(0, 470 + i * 28, W, 3);
  }
  // a few baskets and a cart on the street edges
  drawBasket(ctx, 60, 640);
  drawBasket(ctx, 1210, 650);
  drawCart(ctx, 1140, 470);
}

function drawBasket(ctx, x, y) {
  ctx.fillStyle = '#8A5A33';
  ctx.beginPath();
  ctx.moveTo(x - 26, y);
  ctx.lineTo(x + 26, y);
  ctx.lineTo(x + 18, y + 26);
  ctx.lineTo(x - 18, y + 26);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#F5820B';
  ctx.beginPath();
  ctx.arc(x - 10, y - 4, 9, 0, Math.PI * 2);
  ctx.arc(x + 8, y - 6, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3E9B4F';
  ctx.beginPath();
  ctx.ellipse(x + 2, y - 14, 14, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawCart(ctx, x, y) {
  ctx.fillStyle = '#7A4A12';
  ctx.fillRect(x - 34, y, 68, 26);
  ctx.fillStyle = '#B4552D';
  ctx.fillRect(x - 34, y - 8, 68, 10);
  ctx.strokeStyle = '#5C3A1A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x - 20, y + 32, 8, 0, Math.PI * 2);
  ctx.arc(x + 20, y + 32, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#F2C200';
  ctx.beginPath();
  ctx.arc(x - 10, y - 14, 8, 0, Math.PI * 2);
  ctx.arc(x + 12, y - 12, 9, 0, Math.PI * 2);
  ctx.fill();
}

export function drawStall(ctx, goods, selectedId, hoverId, t, opts = {}) {
  const showSign = opts.sign !== false;
  const showShelf = opts.shelf !== false;
  // awning
  const stripes = 9;
  const awX = 150, awW = 980, awY = 96, awH = 64;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#2E7D6B' : '#FFF6E3';
    ctx.fillRect(awX + (i * awW) / stripes, awY, awW / stripes + 1, awH);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(awX, awY + awH - 8, awW, 8);
  // awning scallops
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#2E7D6B' : '#FFF6E3';
    ctx.beginPath();
    ctx.arc(awX + ((i + 0.5) * awW) / stripes, awY + awH, awW / stripes / 2, 0, Math.PI);
    ctx.fill();
  }
  // sign board (sits between the HUD bar and the awning)
  if (showSign) {
    ctx.fillStyle = '#B4552D';
    ctx.beginPath();
    ctx.roundRect(470, 58, 340, 32, 10);
    ctx.fill();
    ctx.strokeStyle = '#F2B705';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#FFF6E3';
    ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PASAR PAGI RUSH', 640, 75);
  }
  // posts
  ctx.fillStyle = '#8A5A33';
  ctx.fillRect(160, 160, 16, 400);
  ctx.fillRect(1104, 160, 16, 400);
  // counter
  ctx.fillStyle = '#A8663F';
  ctx.beginPath();
  ctx.roundRect(120, 470, 1040, 92, 10);
  ctx.fill();
  ctx.fillStyle = '#8A5A33';
  ctx.fillRect(120, 470, 1040, 12);
  // shelf with goods
  if (!showShelf) return;
  ctx.fillStyle = '#7A4A12';
  ctx.beginPath();
  ctx.roundRect(150, SHELF_Y, 980, 96, 12);
  ctx.fill();
  const n = goods.length;
  const cellW = 980 / Math.max(n, 1);
  goods.forEach((g, i) => {
    const cx = 150 + cellW * (i + 0.5);
    const cy = SHELF_Y + 40;
    const isSel = g.id === selectedId;
    const isHov = g.id === hoverId;
    if (isSel) {
      ctx.fillStyle = 'rgba(242,183,5,0.35)';
      ctx.beginPath();
      ctx.roundRect(cx - 58, SHELF_Y + 8, 116, 80, 10);
      ctx.fill();
      ctx.strokeStyle = '#F2B705';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (isHov) {
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.beginPath();
      ctx.roundRect(cx - 58, SHELF_Y + 8, 116, 80, 10);
      ctx.fill();
    }
    // little plate
    ctx.fillStyle = '#FFF6E3';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 22, 40, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    g.icon(ctx, cx, cy - 4, 46);
    ctx.fillStyle = '#FFF6E3';
    ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.name, cx, SHELF_Y + 74);
    ctx.fillStyle = '#F2B705';
    ctx.font = 'bold 12px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText(formatRp(g.price), cx, SHELF_Y + 90);
    // key badge
    ctx.fillStyle = '#14564A';
    ctx.beginPath();
    ctx.arc(cx + 44, SHELF_Y + 16, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF6E3';
    ctx.font = 'bold 12px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText(g.key, cx + 44, SHELF_Y + 17);
  });
  // shelf label
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = 'bold 13px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Klik barang, lalu klik pelanggan — atau tekan 1–7', 170, SHELF_Y + 108);
  ctx.textAlign = 'right';
  ctx.fillText('P = jeda · M = suara', 1110, SHELF_Y + 108);
}

export function drawHUD(ctx, s) {
  // coins
  ctx.fillStyle = '#14564A';
  ctx.beginPath();
  ctx.roundRect(14, 8, 250, 46, 12);
  ctx.fill();
  ctx.fillStyle = '#F2B705';
  ctx.beginPath();
  ctx.arc(42, 31, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8A5A33';
  ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Rp', 42, 32);
  ctx.fillStyle = '#FFF6E3';
  ctx.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(formatRp(s.coins), 64, 33);
  // day + target
  ctx.fillStyle = '#14564A';
  ctx.beginPath();
  ctx.roundRect(280, 8, 340, 46, 12);
  ctx.fill();
  ctx.fillStyle = '#FFF6E3';
  ctx.font = 'bold 19px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`HARI ${s.day}`, 296, 32);
  const tw = 118;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.roundRect(372, 20, tw, 12, 6);
  ctx.fill();
  ctx.fillStyle = s.dayProgress >= 1 ? '#F2B705' : '#3E9B4F';
  ctx.beginPath();
  ctx.roundRect(372, 20, Math.max(10, tw * Math.min(1, s.dayProgress)), 12, 6);
  ctx.fill();
  ctx.fillStyle = '#FFF6E3';
  ctx.font = 'bold 14px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`Target ${formatRp(s.target)}`, 500, 32);
  // timer
  const low = s.timeLeft <= 10;
  ctx.fillStyle = low ? '#D64541' : '#14564A';
  ctx.beginPath();
  ctx.roundRect(636, 8, 120, 46, 12);
  ctx.fill();
  ctx.fillStyle = '#FFF6E3';
  ctx.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.ceil(s.timeLeft)} dtk`, 696, 33);
  ctx.textAlign = 'left';
  // hearts
  ctx.fillStyle = '#14564A';
  ctx.beginPath();
  ctx.roundRect(772, 8, 130, 46, 12);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const hx = 798 + i * 36;
    drawHeart(ctx, hx, 31, 13, i < s.hearts ? '#FF5A6E' : 'rgba(255,255,255,0.25)');
  }
  // combo
  if (s.combo >= 2) {
    const label = s.multiplier > 1 ? `KOMBO ${s.combo} · x${s.multiplier}` : `KOMBO ${s.combo}`;
    ctx.fillStyle = '#F2B705';
    ctx.beginPath();
    ctx.roundRect(918, 8, 150, 46, 12);
    ctx.fill();
    ctx.fillStyle = '#14564A';
    ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 993, 33);
    ctx.textAlign = 'left';
  }
  // best
  ctx.fillStyle = 'rgba(20,86,74,0.85)';
  ctx.beginPath();
  ctx.roundRect(1084, 8, 182, 46, 12);
  ctx.fill();
  ctx.fillStyle = '#FFF6E3';
  ctx.font = 'bold 16px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`Terbaik ${formatRp(s.best)}`, 1100, 32);
}

function drawHeart(ctx, x, y, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.9);
  ctx.bezierCurveTo(x - s * 1.3, y, x - s * 0.7, y - s, x, y - s * 0.3);
  ctx.bezierCurveTo(x + s * 0.7, y - s, x + s * 1.3, y, x, y + s * 0.9);
  ctx.fill();
}
