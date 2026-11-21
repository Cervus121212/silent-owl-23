// Shadow Vault — game loop and state machine.
// Modes: title → play → levelclear → win, plus caught. The alarm meter is
// shared across the level: any guard that sees the thief fills it, and it
// drains while nobody has eyes on them. Reach the green exit with every
// artefact pocketed to clear the level.

import { LEVELS, TUNING } from './config.js';
import { createInput } from './input.js';
import { makePlayer, updatePlayer, updateHiding, nearestLoot, pocketLoot } from './player.js';
import { makeGuard, updateGuard } from './guards.js';
import * as render from './render.js';
import { shotParam, buildShotState } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = {
  mode: 'title',
  levelIndex: 0,
  level: LEVELS[0],
  loot: [],
  guards: [],
  player: null,
  alarm: 0,
  peakAlarm: 0,
  elapsed: 0,
  score: 0,
  ghost: false,
  ghostLevels: 0,
  frozen: false,
  time: 0,
};

function loadLevel(index) {
  const level = LEVELS[index];
  game.levelIndex = index;
  game.level = level;
  game.loot = level.loot.map((item) => ({ ...item, taken: false }));
  game.guards = level.guards.map((def) => makeGuard(def));
  game.player = makePlayer(level.playerStart);
  game.alarm = 0;
  game.peakAlarm = 0;
  game.elapsed = 0;
  game.ghost = false;
  updateHiding(game.player, level);
}

game.lootTaken = function () {
  return game.loot.filter((item) => item.taken).length;
};

game.allLootTaken = function () {
  return game.lootTaken() === game.loot.length;
};

game.nearestLootItem = function () {
  return nearestLoot(game.player, game.loot);
};

game.nearExit = function () {
  const exit = game.level.exit;
  return game.player.x > exit.x - 20 && game.player.x < exit.x + exit.w + 20
    && game.player.y > exit.y - 10 && game.player.y < exit.y + exit.h + 10;
};

function clearLevel() {
  game.score += TUNING.levelClearScore;
  game.ghost = game.peakAlarm < TUNING.ghostAlarmCeiling;
  if (game.ghost) {
    game.score += TUNING.ghostBonus;
    game.ghostLevels += 1;
  }
  if (game.levelIndex + 1 >= LEVELS.length) {
    game.mode = 'win';
  } else {
    game.mode = 'levelclear';
  }
}

const input = createInput();

function step(dt) {
  game.time += dt;
  if (game.mode !== 'play' || game.frozen) return;
  game.elapsed += dt;

  updatePlayer(game.player, input.keys, dt, game.level);
  updateHiding(game.player, game.level);

  let anyoneSees = false;
  let fillRate = 0;
  for (const guard of game.guards) {
    updateGuard(guard, dt, game.player, game.level, game.alarm);
    if (guard.seesPlayer) {
      anyoneSees = true;
      const dist = Math.hypot(guard.x - game.player.x, guard.y - game.player.y);
      const rate = dist < 140 ? TUNING.alarmFillNear : TUNING.alarmFillFar;
      fillRate = Math.max(fillRate, rate);
    }
  }
  if (anyoneSees) {
    const factor = game.player.sneaking ? TUNING.sneakFillFactor : 1;
    game.alarm = Math.min(TUNING.alarmCaught, game.alarm + fillRate * factor * dt);
  } else {
    game.alarm = Math.max(0, game.alarm - TUNING.alarmDecay * dt);
  }
  game.peakAlarm = Math.max(game.peakAlarm, game.alarm);
  if (game.alarm >= TUNING.alarmCaught) {
    game.mode = 'caught';
    return;
  }

  for (const key of input.takePressed()) {
    if (key === 'e') {
      const item = nearestLoot(game.player, game.loot);
      if (item) {
        pocketLoot(item);
        game.score += TUNING.lootScore;
      }
    } else if (key === 'r') {
      loadLevel(game.levelIndex);
    }
  }

  if (game.allLootTaken() && game.nearExit()) clearLevel();
}

function handleMenuKeys() {
  // Menu modes own their keys; in play mode step() owns them (E to loot,
  // R to restart), so this stays out of the way while playing.
  if (game.mode === 'play') return;
  for (const key of input.takePressed()) {
    if (game.mode === 'title' && key === 'enter') {
      loadLevel(0);
      game.mode = 'play';
    } else if (game.mode === 'levelclear' && key === 'enter') {
      loadLevel(game.levelIndex + 1);
      game.mode = 'play';
    } else if ((game.mode === 'caught' || game.mode === 'win') && key === 'r') {
      game.score = 0;
      game.ghostLevels = 0;
      loadLevel(0);
      game.mode = 'play';
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, TUNING.canvasWidth, TUNING.canvasHeight);
  if (game.mode === 'title') {
    render.drawTitle(ctx);
    return;
  }
  render.drawFloor(ctx, game.level, game.time);
  render.drawShadows(ctx, game.level);
  render.drawExit(ctx, game.level, game.allLootTaken(), game.time);
  render.drawLoot(ctx, game.loot, game.time);
  render.drawCover(ctx, game.level, game.time);
  render.drawWalls(ctx, game.level);
  for (const guard of game.guards) render.drawGuard(ctx, guard, game.player, game.level);
  render.drawPlayer(ctx, game.player, game.time);
  render.drawHud(ctx, game);
  if (game.mode === 'play') render.drawPrompt(ctx, game);
  if (game.mode === 'caught') render.drawCaught(ctx, game);
  if (game.mode === 'levelclear') render.drawLevelClear(ctx, game);
  if (game.mode === 'win') render.drawWin(ctx, game);
}

// A frozen ?shot= state renders once and never advances; normal play runs
// the requestAnimationFrame loop. Either way the same draw code runs.
const shot = shotParam();
const shotState = shot ? buildShotState(shot) : null;
if (shotState) {
  Object.assign(game, shotState);
  if (shotState.mode === 'title') {
    loadLevel(0); // live objects for the test hook; draw() still shows the title
    game.mode = 'title';
  }
  if (shotState.mode === 'play') {
    updateHiding(game.player, game.level);
  } else if (shotState.mode === 'win') {
    game.player = makePlayer(game.level.playerStart);
    game.loot = game.level.loot.map((item) => ({ ...item, taken: true }));
    game.guards = game.level.guards.map((def) => makeGuard(def));
  }
  draw();
} else {
  loadLevel(0);
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    handleMenuKeys();
    step(dt);
    draw();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// Test hook: the play-tester reads live state through this, never by
// scraping pixels. It exposes no cheats — only what the HUD already shows.
window.__shadowVault = {
  game,
  state() {
    return {
      mode: game.mode,
      level: game.levelIndex + 1,
      alarm: Math.round(game.alarm * 10) / 10,
      loot: game.lootTaken(),
      lootTotal: game.loot.length,
      score: game.score,
      elapsed: Math.round(game.elapsed * 10) / 10,
      player: game.player ? { x: Math.round(game.player.x), y: Math.round(game.player.y) } : null,
      guards: game.guards.map((g) => ({
        x: Math.round(g.x), y: Math.round(g.y), state: g.state, sees: g.seesPlayer,
      })),
    };
  },
};
