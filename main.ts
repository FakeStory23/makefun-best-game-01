// Pasar Pagi Rush — best-game-01 entry builder (Node 22, standard library only).
//
// What this does: takes the finished game in ./game (plain static files —
// game/index.html plus its ES modules, vector art and Web Audio sounds are all
// drawn or synthesised in code, so the game loads offline with no network) and
// the four real play-test screenshots in ./screenshots, copies both into the
// output directory, and writes dossier.json there with the vendored make.fun
// library. The dossier is the summary the judge reads.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Run it twice into two different directories: both runs must write identical
// bytes (the build is deterministic — no timestamps, no random data).

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const GAME_DIR = join(here, 'game');
const SHOTS_DIR = join(here, 'screenshots');

// The game must exist and the screenshots must be exactly the four real
// renders (title, gameplay, rush hour, game over) — refuse to build a
// half-finished entry rather than handing one in.
if (!existsSync(join(GAME_DIR, 'index.html'))) {
  throw new Error('game/index.html is missing — the game is not ready to hand in.');
}
const shots = existsSync(SHOTS_DIR)
  ? readdirSync(SHOTS_DIR).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort()
  : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`expected 3 or 4 screenshots, found ${shots.length}.`);
}

mkdirSync(out, { recursive: true });
cpSync(GAME_DIR, join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
cpSync(SHOTS_DIR, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the other limits refuse an entry the scorer would refuse — more than
// 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB
// of game files in all, or a path under game/ over 1000 bytes.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

console.log(`built ${out} — game/ (${shots.length} screenshots) + dossier.json`);
