// main.js — bootstrap: fits the 1280x720 canvas to the window, maps mouse
// and touch to game coordinates, and runs the fixed-step loop.

import { Game } from './game.js';
import { W, H } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const game = new Game();
window.__pasar = game; // exposed for play-testing and screenshots

function fit() {
  const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.style.width = Math.floor(W * scale) + 'px';
  canvas.style.height = Math.floor(H * scale) + 'px';
}
window.addEventListener('resize', fit);
fit();

function toGame(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * W,
    y: ((e.clientY - r.top) / r.height) * H,
  };
}

canvas.addEventListener('click', (e) => {
  const p = toGame(e);
  game.handleClick(p.x, p.y);
});
canvas.addEventListener('mousemove', (e) => {
  const p = toGame(e);
  game.handleMove(p.x, p.y);
});
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const t = e.touches[0];
  const p = toGame(t);
  game.handleClick(p.x, p.y);
}, { passive: false });
window.addEventListener('keydown', (e) => {
  if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
  game.handleKey(e.code);
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.update(dt);
  game.draw(ctx);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
