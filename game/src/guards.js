// Shadow Vault — guard patrols, vision cones and the detection model.
// A guard walks its waypoint loop, pauses at each stop, and watches a cone
// of light ahead of it. Spotting the thief fills the shared alarm meter;
// losing sight lets the guard hunt the last seen position for a few
// seconds, then return to patrol.

import { TUNING } from './config.js';
import { pointInRect, segmentHitsRect, rayHitDistance, slideCircle, solidRects } from './world.js';

export function makeGuard(def) {
  return {
    path: def.path,
    speed: def.speed,
    pause: def.pause,
    waypoint: 0,
    x: def.path[0][0],
    y: def.path[0][1],
    facing: 0,
    pauseLeft: 0,
    state: 'patrol', // patrol | suspicious | chase | return
    lastSeenX: 0,
    lastSeenY: 0,
    memoryLeft: 0,
    seesPlayer: false,
  };
}

// Where the thief stands decides how easy they are to spot: out in the
// open the full range applies, crouched in shadow the range shrinks, and
// tucked behind a statue or crate a guard must be almost on top of them.
export function spotRangeFor(player, level) {
  for (const shadow of level.shadows) {
    if (pointInRect(player.x, player.y, shadow)) return TUNING.shadowVisionRange;
  }
  for (const cover of level.cover) {
    if (pointInRect(player.x, player.y, cover)) return TUNING.coverSpotRange;
  }
  return TUNING.visionRange;
}

export function guardCanSee(guard, player, level, range) {
  const dx = player.x - guard.x;
  const dy = player.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (dist < 26) return true; // bumped into the thief: no hiding that
  let angleDiff = Math.atan2(dy, dx) - guard.facing;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  if (Math.abs(angleDiff) > TUNING.visionHalfAngle) return false;
  for (const rect of solidRects(level)) {
    if (segmentHitsRect(guard.x, guard.y, player.x, player.y, rect)) return false;
  }
  return true;
}

// The cone's lit polygon: a fan of rays clipped by walls, so the cone
// bends around corners instead of shining through stone.
export function visionConePolygon(guard, level, range) {
  const blockers = solidRects(level);
  const rays = 26;
  const points = [{ x: guard.x, y: guard.y }];
  for (let i = 0; i <= rays; i++) {
    const angle = guard.facing - TUNING.visionHalfAngle
      + (2 * TUNING.visionHalfAngle * i) / rays;
    const dist = rayHitDistance(guard.x, guard.y, angle, range, blockers);
    points.push({ x: guard.x + Math.cos(angle) * dist, y: guard.y + Math.sin(angle) * dist });
  }
  return points;
}

function moveToward(guard, tx, ty, speed, dt, level) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return true;
  const step = Math.min(dist, speed * dt);
  const next = slideCircle(guard.x, guard.y, TUNING.guardRadius,
    (dx / dist) * step, (dy / dist) * step, solidRects(level));
  guard.facing = Math.atan2(dy, dx);
  guard.x = next.x;
  guard.y = next.y;
  return dist - step < 2;
}

export function updateGuard(guard, dt, player, level, alarm) {
  const range = spotRangeFor(player, level);
  const effectiveRange = player.sneaking ? range * TUNING.sneakRangeFactor : range;
  guard.seesPlayer = guardCanSee(guard, player, level, effectiveRange);
  if (guard.seesPlayer) {
    guard.lastSeenX = player.x;
    guard.lastSeenY = player.y;
    guard.memoryLeft = TUNING.guardMemorySeconds;
  } else if (guard.memoryLeft > 0) {
    guard.memoryLeft -= dt;
  }

  if (alarm >= TUNING.alarmChase || (guard.seesPlayer && alarm >= TUNING.alarmSuspicious)) {
    guard.state = 'chase';
  } else if (guard.seesPlayer || guard.memoryLeft > 0) {
    guard.state = 'suspicious';
  } else if (guard.state !== 'patrol' && guard.state !== 'return') {
    guard.state = 'return';
  }

  if (guard.state === 'chase' || guard.state === 'suspicious') {
    const speed = guard.state === 'chase' ? TUNING.guardChaseSpeed : guard.speed * 1.25;
    moveToward(guard, guard.lastSeenX, guard.lastSeenY, speed, dt, level);
    if (guard.state === 'suspicious' && guard.memoryLeft <= 0) guard.state = 'return';
    return;
  }

  if (guard.state === 'return') {
    const target = guard.path[guard.waypoint];
    const arrived = moveToward(guard, target[0], target[1], guard.speed, dt, level);
    if (arrived) guard.state = 'patrol';
    return;
  }

  // Patrol: walk to the next waypoint, pause there, then move on.
  if (guard.pauseLeft > 0) {
    guard.pauseLeft -= dt;
    if (guard.pauseLeft <= 0) guard.waypoint = (guard.waypoint + 1) % guard.path.length;
    return;
  }
  const target = guard.path[guard.waypoint];
  const arrived = moveToward(guard, target[0], target[1], guard.speed, dt, level);
  if (arrived) guard.pauseLeft = guard.pause;
}
