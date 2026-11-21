// Shadow Vault — Stealth: the hand-in program (Node 22, standard library only).
//
// It stages this repository's game/ and screenshots/ into the grader's
// output directory and writes /output/dossier.json with the vendored
// make.fun library, so the judge reads exactly the game that was built.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The output directory is a bind mount on the grader, so this program
// never removes it — it only creates it and writes inside it.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Refuse a hand-in that the sealed scorer would refuse, with a plain
// message, instead of writing a dossier for it: at most 4 screenshots,
// each a whole PNG or JPEG under 256 KiB.
function checkScreenshots(dir) {
  const shots = readdirSync(dir)
    .filter((name) => !name.startsWith('.'))
    .sort();
  if (shots.length < 3 || shots.length > 4) {
    throw new Error(`screenshots/: expected 3 or 4 files, found ${shots.length}`);
  }
  for (const name of shots) {
    const file = join(dir, name);
    const size = statSync(file).size;
    if (!/\.(png|jpe?g)$/i.test(name)) throw new Error(`screenshots/${name}: not a PNG or JPEG`);
    if (size > 262144) throw new Error(`screenshots/${name}: ${size} bytes, over the 256 KiB cap`);
  }
  return shots;
}

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });

const shotsDir = join(repoRoot, 'screenshots');
if (!existsSync(shotsDir)) throw new Error('screenshots/ is missing from the repository');
const shots = checkScreenshots(shotsDir);
cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

// The scorer's own caps, as the kit's RULES.txt states them: the dossier
// text is capped at 160 KiB, and game/ plus screenshots/ share /output's
// 1,000-entry, 64 MiB room with dossier.json.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(`Shadow Vault handed in: game/ + ${shots.length} screenshots (${shots.join(', ')}) + dossier.json`);
