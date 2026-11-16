// screens.js — the title, day-clear, game-over and pause overlays. Each one
// is drawn on the canvas and returns its clickable buttons as {x, y, w, h,
// action} so the game can hit-test them.

import { formatRp } from './goods.js';

function panel(ctx, x, y, w, h, fill = 'rgba(255,246,227,0.97)') {
  ctx.fillStyle = 'rgba(20,40,32,0.45)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 20);
  ctx.fill();
  ctx.strokeStyle = '#B4552D';
  ctx.lineWidth = 4;
  ctx.stroke();
}

function button(ctx, x, y, w, h, label, sub, hover) {
  ctx.fillStyle = hover ? '#F2B705' : '#2E7D6B';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = '#14564A';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = hover ? '#14564A' : '#FFF6E3';
  ctx.font = 'bold 26px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 - (sub ? 10 : 0));
  if (sub) {
    ctx.font = 'bold 15px "Trebuchet MS", Verdana, sans-serif';
    ctx.fillText(sub, x + w / 2, y + h / 2 + 18);
  }
  return { x, y, w, h };
}

export function drawTitle(ctx, s, hover) {
  ctx.textBaseline = 'alphabetic';
  // big sunrise title
  ctx.fillStyle = '#B4552D';
  ctx.font = 'bold 84px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#FFF6E3';
  ctx.strokeText('PASAR PAGI', 640, 150);
  ctx.fillText('PASAR PAGI', 640, 150);
  ctx.fillStyle = '#2E7D6B';
  ctx.font = 'bold 84px "Trebuchet MS", Verdana, sans-serif';
  ctx.strokeText('RUSH', 640, 235);
  ctx.fillText('RUSH', 640, 235);
  ctx.fillStyle = '#5D4037';
  ctx.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Layani pelanggan sebelum kesabaran mereka habis!', 640, 285);

  // how to play card
  ctx.fillStyle = 'rgba(255,246,227,0.95)';
  ctx.beginPath();
  ctx.roundRect(340, 315, 600, 165, 16);
  ctx.fill();
  ctx.strokeStyle = '#B4552D';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#14564A';
  ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Cara main', 370, 348);
  ctx.fillStyle = '#3E2723';
  ctx.font = '19px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('1. Klik barang di rak, lalu klik pelanggan yang memesannya.', 370, 380);
  ctx.fillText('2. Selesaikan pesanan sebelum bar kesabaran habis.', 370, 408);
  ctx.fillText('3. Capai target harian sebelum waktu habis.', 370, 436);
  ctx.fillText('4. 3 pelanggan marah = harimu berakhir. Kombo = harga berlipat!', 370, 464);

  const btn = button(ctx, 490, 500, 300, 64, 'MULAI JUALAN', 'Enter / klik', hover === 'start');
  ctx.fillStyle = '#5D4037';
  ctx.font = 'bold 18px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Skor terbaik: ${formatRp(s.best)}`, 640, 600);
  ctx.fillStyle = '#7A6A5A';
  ctx.font = '16px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Tombol 1–7 pilih barang · P jeda · M suara', 640, 632);
  return [{ ...btn, action: 'start' }];
}

export function drawDayClear(ctx, s, hover) {
  panel(ctx, 340, 210, 600, 300);
  ctx.fillStyle = '#2E7D6B';
  ctx.font = 'bold 52px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`HARI ${s.day} SELESAI!`, 640, 300);
  ctx.fillStyle = '#3E2723';
  ctx.font = 'bold 24px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(`Target ${formatRp(s.target)} tercapai — ${formatRp(s.coins)} terkumpul`, 640, 352);
  ctx.font = '19px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Hari berikutnya: pelanggan lebih cepat, barang baru,', 640, 392);
  ctx.fillText('target lebih tinggi. Siap?', 640, 420);
  const btn = button(ctx, 490, 440, 300, 56, 'LANJUT HARI ' + (s.day + 1), 'Enter / klik', hover === 'next');
  return [{ ...btn, action: 'next' }];
}

export function drawGameOver(ctx, s, hover) {
  panel(ctx, 300, 130, 680, 470);
  ctx.fillStyle = '#D64541';
  ctx.font = 'bold 52px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HARI BERAKHIR', 640, 210);
  ctx.fillStyle = '#3E2723';
  ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText(s.endReason, 640, 252);
  const rows = [
    ['Koin hari ini', formatRp(s.dayCoins)],
    ['Hari dicapai', 'Hari ' + s.day],
    ['Pelanggan dilayani', String(s.served)],
    ['Kombo terbaik', 'x' + s.bestCombo],
    ['Skor terbaik', formatRp(s.best)],
  ];
  ctx.font = '20px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'left';
  rows.forEach(([k, v], i) => {
    const y = 300 + i * 34;
    ctx.fillStyle = '#5D4037';
    ctx.fillText(k, 380, y);
    ctx.fillStyle = '#14564A';
    ctx.font = 'bold 20px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(v, 900, y);
    ctx.textAlign = 'left';
    ctx.font = '20px "Trebuchet MS", Verdana, sans-serif';
  });
  if (s.coins >= s.best && s.coins > 0) {
    ctx.fillStyle = '#B8860B';
    ctx.font = 'bold 22px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ REKOR BARU! ★', 640, 300 + rows.length * 34 + 6);
  }
  const btn = button(ctx, 490, 520, 300, 60, 'MAIN LAGI', 'Enter / klik', hover === 'restart');
  return [{ ...btn, action: 'restart' }];
}

export function drawPause(ctx, hover) {
  panel(ctx, 440, 250, 400, 220, 'rgba(255,246,227,0.97)');
  ctx.fillStyle = '#14564A';
  ctx.font = 'bold 44px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('JEDA', 640, 330);
  ctx.fillStyle = '#5D4037';
  ctx.font = '19px "Trebuchet MS", Verdana, sans-serif';
  ctx.fillText('Tekan P atau klik untuk lanjut', 640, 370);
  const btn = button(ctx, 540, 400, 200, 52, 'LANJUT', '', hover === 'resume');
  return [{ ...btn, action: 'resume' }];
}
