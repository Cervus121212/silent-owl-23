// Shadow Vault — the thief: movement, sneaking, pocketing artefacts.
// The thief walks with WASD or arrows, sneaks (slower, harder to spot)
// while Shift is held, and pockets a nearby artefact with E.

import { TUNING } from './config.js';
import { pointInRect, slideCircle, solidRects } from './world.js';

export function makePlayer(start) {
  return {
    x: start.x,
    y: start.y,
    facing: 0,
    sneaking: false,
    moving: false,
    hidden: false, // standing in shadow or tucked behind cover
    inShadow: false,
    inCover: false,
  };
}

export function updatePlayer(player, keys, dt, level) {
  let mx = 0;
  let my = 0;
  if (keys.has('arrowleft') || keys.has('a')) mx -= 1;
  if (keys.has('arrowright') || keys.has('d')) mx += 1;
  if (keys.has('arrowup') || keys.has('w')) my -= 1;
  if (keys.has('arrowdown') || keys.has('s')) my += 1;
  player.sneaking = keys.has('shift');
  player.moving = mx !== 0 || my !== 0;
  if (!player.moving) return;
  const len = Math.hypot(mx, my);
  const speed = player.sneaking ? TUNING.playerSneakSpeed : TUNING.playerWalkSpeed;
  const stepX = (mx / len) * speed * dt;
  const stepY = (my / len) * speed * dt;
  const next = slideCircle(player.x, player.y, TUNING.playerRadius, stepX, stepY, solidRects(level));
  player.facing = Math.atan2(stepY, stepX);
  player.x = next.x;
  player.y = next.y;
}

// Refresh the hiding flags after every move: they drive both the spot
// range (guards.js) and the "HIDDEN" tag drawn above the thief.
export function updateHiding(player, level) {
  player.inShadow = level.shadows.some((s) => pointInRect(player.x, player.y, s));
  player.inCover = level.cover.some((c) => pointInRect(player.x, player.y, c));
  player.hidden = player.inShadow || player.inCover;
}

// The nearest unpocketed artefact within reach, or null.
export function nearestLoot(player, loot) {
  let best = null;
  let bestDist = TUNING.lootPickupRadius;
  for (const item of loot) {
    if (item.taken) continue;
    const dist = Math.hypot(item.x - player.x, item.y - player.y);
    if (dist <= bestDist) { best = item; bestDist = dist; }
  }
  return best;
}

export function pocketLoot(item) {
  item.taken = true;
}
