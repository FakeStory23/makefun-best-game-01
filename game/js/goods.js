// goods.js — the stall's catalogue. Each good knows its name, price (rupiah),
// shelf key, unlock day, and how to draw itself as a little vector icon
// (all art is drawn in code; the game ships no image files).

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, rot, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

// Every icon draws centred on (x, y) inside a box of size s.
const ICONS = {
  mangga(ctx, x, y, s) {
    ellipse(ctx, x, y + s * 0.05, s * 0.34, s * 0.28, -0.5, '#F5820B');
    ellipse(ctx, x - s * 0.05, y - s * 0.02, s * 0.22, s * 0.16, -0.5, '#FFB347');
    ctx.strokeStyle = '#7A4A12';
    ctx.lineWidth = Math.max(1.5, s * 0.05);
    ctx.beginPath();
    ctx.moveTo(x + s * 0.16, y - s * 0.28);
    ctx.quadraticCurveTo(x + s * 0.22, y - s * 0.42, x + s * 0.34, y - s * 0.4);
    ctx.stroke();
    ellipse(ctx, x + s * 0.3, y - s * 0.36, s * 0.16, s * 0.07, -0.6, '#3E9B4F');
  },
  pisang(ctx, x, y, s) {
    ctx.strokeStyle = '#F2C200';
    ctx.lineWidth = s * 0.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y - s * 0.12, s * 0.3, 0.35 * Math.PI, 1.15 * Math.PI);
    ctx.stroke();
    ctx.strokeStyle = '#C79A00';
    ctx.lineWidth = s * 0.06;
    ctx.beginPath();
    ctx.arc(x, y - s * 0.12, s * 0.3, 0.5 * Math.PI, 1.0 * Math.PI);
    ctx.stroke();
    circle(ctx, x - s * 0.3, y - s * 0.34, s * 0.07, '#8A5A33');
  },
  kelapa(ctx, x, y, s) {
    circle(ctx, x, y, s * 0.36, '#6B4226');
    circle(ctx, x, y - s * 0.06, s * 0.26, '#FFF6E3');
    ctx.fillStyle = '#D9C9A8';
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.06, s * 0.12, s * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3E9B4F';
    ctx.lineWidth = Math.max(1.5, s * 0.05);
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.36);
    ctx.quadraticCurveTo(x + s * 0.1, y - s * 0.5, x + s * 0.26, y - s * 0.48);
    ctx.stroke();
  },
  cabai(ctx, x, y, s) {
    ctx.fillStyle = '#D7263D';
    ctx.beginPath();
    ctx.moveTo(x - s * 0.3, y - s * 0.3);
    ctx.quadraticCurveTo(x + s * 0.28, y - s * 0.34, x + s * 0.34, y + s * 0.05);
    ctx.quadraticCurveTo(x + s * 0.36, y + s * 0.34, x + s * 0.1, y + s * 0.3);
    ctx.quadraticCurveTo(x - s * 0.12, y + s * 0.22, x - s * 0.3, y - s * 0.3);
    ctx.fill();
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = Math.max(1.5, s * 0.06);
    ctx.beginPath();
    ctx.moveTo(x - s * 0.3, y - s * 0.3);
    ctx.quadraticCurveTo(x - s * 0.34, y - s * 0.46, x - s * 0.2, y - s * 0.48);
    ctx.stroke();
    ellipse(ctx, x + s * 0.05, y - s * 0.08, s * 0.1, s * 0.04, -0.4, '#FF8A80');
  },
  telur(ctx, x, y, s) {
    ellipse(ctx, x, y, s * 0.26, s * 0.34, 0, '#FFF8EC');
    ctx.strokeStyle = '#E0C9A6';
    ctx.lineWidth = Math.max(1, s * 0.03);
    ctx.beginPath();
    ctx.ellipse(x, y, s * 0.26, s * 0.34, 0, 0, Math.PI * 2);
    ctx.stroke();
    ellipse(ctx, x - s * 0.07, y - s * 0.1, s * 0.08, s * 0.12, -0.3, '#FFFFFF');
  },
  ikan(ctx, x, y, s) {
    ctx.fillStyle = '#5B8DBF';
    ctx.beginPath();
    ctx.moveTo(x - s * 0.38, y);
    ctx.lineTo(x - s * 0.12, y - s * 0.22);
    ctx.lineTo(x - s * 0.12, y + s * 0.22);
    ctx.closePath();
    ctx.fill();
    ellipse(ctx, x + s * 0.05, y, s * 0.3, s * 0.2, 0, '#7FB3E0');
    circle(ctx, x + s * 0.24, y - s * 0.05, s * 0.045, '#12324F');
    ctx.strokeStyle = '#3E6E9E';
    ctx.lineWidth = Math.max(1, s * 0.03);
    ctx.beginPath();
    ctx.arc(x + s * 0.02, y, s * 0.14, -1.1, 1.1);
    ctx.stroke();
  },
  durian(ctx, x, y, s) {
    ctx.fillStyle = '#7A9A3B';
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const px = x + Math.cos(a) * s * 0.3;
      const py = y + Math.sin(a) * s * 0.3;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a - 0.25) * s * 0.2, y + Math.sin(a - 0.25) * s * 0.2);
      ctx.lineTo(px, py);
      ctx.lineTo(x + Math.cos(a + 0.25) * s * 0.2, y + Math.sin(a + 0.25) * s * 0.2);
      ctx.closePath();
      ctx.fill();
    }
    circle(ctx, x, y, s * 0.26, '#8FAE4A');
    ctx.strokeStyle = '#5C7A26';
    ctx.lineWidth = Math.max(1, s * 0.03);
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.26);
    ctx.lineTo(x, y - s * 0.4);
    ctx.stroke();
  },
};

export const GOODS = [
  { id: 'mangga', name: 'Mangga', price: 5000, key: '1', day: 1, icon: ICONS.mangga, tint: '#F5820B' },
  { id: 'pisang', name: 'Pisang', price: 3000, key: '2', day: 1, icon: ICONS.pisang, tint: '#F2C200' },
  { id: 'telur', name: 'Telur', price: 2000, key: '3', day: 1, icon: ICONS.telur, tint: '#FFF8EC' },
  { id: 'cabai', name: 'Cabai', price: 4000, key: '4', day: 2, icon: ICONS.cabai, tint: '#D7263D' },
  { id: 'kelapa', name: 'Kelapa', price: 7000, key: '5', day: 2, icon: ICONS.kelapa, tint: '#6B4226' },
  { id: 'ikan', name: 'Ikan', price: 9000, key: '6', day: 3, icon: ICONS.ikan, tint: '#5B8DBF' },
  { id: 'durian', name: 'Durian', price: 15000, key: '7', day: 3, icon: ICONS.durian, tint: '#7A9A3B' },
];

export function goodsForDay(day) {
  return GOODS.filter((g) => g.day <= day);
}

export function goodById(id) {
  return GOODS.find((g) => g.id === id);
}

export function formatRp(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}
