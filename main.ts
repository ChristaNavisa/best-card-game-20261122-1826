// Ember Harbor — entrypoint (Node 22, standard library only).
// Hands the game in: copies game/ and screenshots/ from this repository into
// the output directory and writes dossier.json with the vendored make.fun
// library, using the gate's own caps so a local run matches the scorer.
// Run it as: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Outside the grader MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

function sortedTreeNames(dir) {
  return readdirSync(dir).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

function assertPlainTree(dir, label) {
  for (const name of sortedTreeNames(dir)) {
    const full = join(dir, name);
    const info = statSync(full);
    if (info.isSymbolicLink()) throw new Error(`${label}: symlink not allowed: ${full}`);
    if (info.isDirectory()) assertPlainTree(full, label);
  }
}

function copyTree(source, target) {
  assertPlainTree(source, source);
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true, dereference: false });
}

// A deterministic hand-in: start from a clean output directory so stale
// files from an earlier run can never leak into the dossier.
// Never remove the output directory itself: in the grader it is a mount
// whose parent is read-only, so only clear what sits inside it.
mkdirSync(outputDir, { recursive: true });
for (const name of readdirSync(outputDir)) {
  rmSync(join(outputDir, name), { recursive: true, force: true });
}

const gameSource = join(repoRoot, 'game');
const shotsSource = join(repoRoot, 'screenshots');
if (!existsSync(gameSource)) throw new Error('game/ is missing from the repository');
copyTree(gameSource, join(outputDir, 'game'));
if (existsSync(shotsSource)) copyTree(shotsSource, join(outputDir, 'screenshots'));

// The scorer's caps, from the kit's gate: text 160 KiB, at most 4 screenshots
// of 256 KiB each, game/ at most 993 files and 48 MiB, paths at most 1000 bytes.
const dossierBytes = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossierBytes);
console.log(`Ember Harbor handed in: ${outputDir} (${dossierBytes.length} byte dossier)`);
