// Shadow Vault — world geometry: collision, line of sight, vision rays.
// Walls and cover are axis-aligned rectangles. A circle (the thief or a
// guard) collides with them; a sight line is blocked when it crosses one.

export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

// True when the circle at (cx, cy) with radius r overlaps the rectangle.
export function circleHitsRect(cx, cy, r, rect) {
  const nearestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < r * r;
}

// True when the segment (x1,y1)-(x2,y2) crosses the rectangle's border.
export function segmentHitsRect(x1, y1, x2, y2, rect) {
  if (pointInRect(x1, y1, rect) || pointInRect(x2, y2, rect)) return true;
  const edges = [
    [rect.x, rect.y, rect.x + rect.w, rect.y],
    [rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h],
    [rect.x + rect.w, rect.y + rect.h, rect.x, rect.y + rect.h],
    [rect.x, rect.y + rect.h, rect.x, rect.y],
  ];
  for (const [ax, ay, bx, by] of edges) {
    if (segmentsCross(x1, y1, x2, y2, ax, ay, bx, by)) return true;
  }
  return false;
}

export function segmentsCross(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d1 = direction(x3, y3, x4, y4, x1, y1);
  const d2 = direction(x3, y3, x4, y4, x2, y2);
  const d3 = direction(x1, y1, x2, y2, x3, y3);
  const d4 = direction(x1, y1, x2, y2, x4, y4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function direction(x1, y1, x2, y2, x3, y3) {
  return (x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1);
}

// Distance from (ox, oy) along the ray at `angle` to the nearest rectangle
// edge, or Infinity when the ray hits nothing. Used to clip vision cones
// against walls so light stops at stone, the way a real cone would.
export function rayHitDistance(ox, oy, angle, maxDist, blockers) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best = maxDist;
  for (const rect of blockers) {
    const hit = rayRectDistance(ox, oy, dx, dy, rect);
    if (hit !== null && hit < best) best = hit;
  }
  return best;
}

function rayRectDistance(ox, oy, dx, dy, rect) {
  let tMin = 0;
  let tMax = Infinity;
  const slabs = [
    [ox, dx, rect.x, rect.x + rect.w],
    [oy, dy, rect.y, rect.y + rect.h],
  ];
  for (const [o, d, lo, hi] of slabs) {
    if (Math.abs(d) < 1e-9) {
      if (o < lo || o > hi) return null;
    } else {
      let t1 = (lo - o) / d;
      let t2 = (hi - o) / d;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);
      if (tMin > tMax) return null;
    }
  }
  return tMin;
}

// Move a circle through the level one axis at a time so it slides along
// walls instead of sticking to corners. Returns the new position.
export function slideCircle(x, y, radius, dx, dy, blockers) {
  let nx = x + dx;
  for (const rect of blockers) {
    if (circleHitsRect(nx, y, radius, rect)) { nx = x; break; }
  }
  let ny = y + dy;
  for (const rect of blockers) {
    if (circleHitsRect(nx, ny, radius, rect)) { ny = y; break; }
  }
  return { x: nx, y: ny };
}

// Every solid rectangle in a level: stone walls plus statues, cases, crates.
export function solidRects(level) {
  return level.walls.concat(level.cover);
}
