// Shadow Vault — every pixel the judge sees: the night museum, the guards
// and their cones of light, the thief, the loot, the exit, and the HUD.
// All art is drawn procedurally on the canvas; no outside assets.

import { TUNING } from './config.js';
import { visionConePolygon } from './guards.js';

const GOLD = '#d9a441';
const FLOOR_A = '#141a2e';
const FLOOR_B = '#10152a';

export function drawFloor(ctx, level, time) {
  // Marble tiles, two tones, with a faint gold grout line.
  const tile = 80;
  for (let y = TUNING.hudHeight; y < TUNING.canvasHeight; y += tile) {
    for (let x = 0; x < TUNING.canvasWidth; x += tile) {
      const even = ((x / tile) + (y / tile)) % 2 === 0;
      ctx.fillStyle = even ? FLOOR_A : FLOOR_B;
      ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.strokeStyle = 'rgba(217,164,65,0.10)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= TUNING.canvasWidth; x += tile) {
    ctx.beginPath(); ctx.moveTo(x, TUNING.hudHeight); ctx.lineTo(x, TUNING.canvasHeight); ctx.stroke();
  }
  for (let y = TUNING.hudHeight; y <= TUNING.canvasHeight; y += tile) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TUNING.canvasWidth, y); ctx.stroke();
  }
  // A red carpet runner down the middle of each hall, for the eye to follow.
  ctx.fillStyle = 'rgba(122,28,44,0.35)';
  ctx.fillRect(0, 396, TUNING.canvasWidth, 56);
  ctx.fillStyle = 'rgba(217,164,65,0.25)';
  ctx.fillRect(0, 396, TUNING.canvasWidth, 2);
  ctx.fillRect(0, 450, TUNING.canvasWidth, 2);
  void level; void time;
}

export function drawShadows(ctx, level) {
  for (const shadow of level.shadows) {
    ctx.fillStyle = 'rgba(2,4,12,0.55)';
    roundRect(ctx, shadow.x, shadow.y, shadow.w, shadow.h, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140,170,255,0.18)';
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(160,185,255,0.5)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHADOW — HIDDEN', shadow.x + shadow.w / 2, shadow.y + shadow.h / 2 + 4);
  }
}

export function drawWalls(ctx, level) {
  for (const wall of level.walls) {
    ctx.fillStyle = '#2a2f45';
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = GOLD;
    if (wall.w >= wall.h) {
      ctx.fillRect(wall.x, wall.y, wall.w, 3);
    } else {
      ctx.fillRect(wall.x, wall.y, 3, wall.h);
    }
  }
}

export function drawCover(ctx, level, time) {
  for (const item of level.cover) {
    const cx = item.x + item.w / 2;
    const cy = item.y + item.h / 2;
    if (item.kind === 'statue') {
      ctx.fillStyle = '#3d4459';
      ctx.fillRect(item.x + 8, item.y + item.h - 14, item.w - 16, 14);
      ctx.fillStyle = '#c8ccd8';
      ctx.beginPath(); ctx.arc(cx, cy - 6, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9aa1b5';
      ctx.fillRect(cx - 12, cy + 6, 24, 16);
      ctx.fillStyle = GOLD;
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, cx, item.y + item.h + 14);
    } else if (item.kind === 'case') {
      ctx.fillStyle = '#241a10';
      ctx.fillRect(item.x, item.y + item.h - 12, item.w, 12);
      ctx.fillStyle = 'rgba(150,200,255,0.20)';
      ctx.fillRect(item.x + 4, item.y + 4, item.w - 8, item.h - 16);
      ctx.strokeStyle = 'rgba(200,220,255,0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(item.x + 4, item.y + 4, item.w - 8, item.h - 16);
      const pulse = 0.6 + 0.4 * Math.sin(time * 2 + item.x);
      ctx.fillStyle = `rgba(255,215,110,${pulse.toFixed(2)})`;
      ctx.beginPath(); ctx.arc(cx, cy - 4, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(220,225,240,0.85)';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, cx, item.y + item.h + 14);
    } else { // crate
      ctx.fillStyle = '#5a4023';
      ctx.fillRect(item.x, item.y, item.w, item.h);
      ctx.strokeStyle = '#7d5a30';
      ctx.lineWidth = 2;
      ctx.strokeRect(item.x + 3, item.y + 3, item.w - 6, item.h - 6);
      ctx.beginPath();
      ctx.moveTo(item.x, item.y); ctx.lineTo(item.x + item.w, item.y + item.h);
      ctx.moveTo(item.x + item.w, item.y); ctx.lineTo(item.x, item.y + item.h);
      ctx.stroke();
      ctx.fillStyle = 'rgba(220,225,240,0.85)';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, cx, item.y + item.h + 14);
    }
  }
}

export function drawLoot(ctx, loot, time) {
  for (const item of loot) {
    if (item.taken) continue;
    const glow = 0.25 + 0.15 * Math.sin(time * 3 + item.x);
    const gradient = ctx.createRadialGradient(item.x, item.y, 4, item.x, item.y, 34);
    gradient.addColorStop(0, `rgba(255,215,110,${glow + 0.35})`);
    gradient.addColorStop(1, 'rgba(255,215,110,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.arc(item.x, item.y, 34, 0, Math.PI * 2); ctx.fill();
    // A golden artefact: diamond gem on a small plinth.
    ctx.fillStyle = '#3d4459';
    ctx.fillRect(item.x - 12, item.y + 8, 24, 8);
    ctx.fillStyle = '#ffd76e';
    ctx.beginPath();
    ctx.moveTo(item.x, item.y - 14);
    ctx.lineTo(item.x + 10, item.y);
    ctx.lineTo(item.x, item.y + 8);
    ctx.lineTo(item.x - 10, item.y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.moveTo(item.x, item.y - 14);
    ctx.lineTo(item.x + 5, item.y - 2);
    ctx.lineTo(item.x, item.y);
    ctx.lineTo(item.x - 5, item.y - 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.name.toUpperCase(), item.x, item.y + 32);
  }
}

export function drawExit(ctx, level, allLootTaken, time) {
  const exit = level.exit;
  const open = allLootTaken;
  const glow = open ? 0.5 + 0.3 * Math.sin(time * 4) : 0.12;
  ctx.fillStyle = `rgba(46,204,113,${glow})`;
  ctx.fillRect(exit.x - 8, exit.y - 8, exit.w + 16, exit.h + 16);
  ctx.fillStyle = open ? '#27ae60' : '#5d6d5a';
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.fillStyle = open ? '#1e8449' : '#4a5548';
  ctx.fillRect(exit.x + exit.w / 2 - 2, exit.y, 4, exit.h);
  ctx.fillStyle = open ? '#eafff1' : '#c9d4c9';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', exit.x + exit.w / 2, exit.y - 16);
  ctx.font = 'bold 11px sans-serif';
  // Right-aligned to the door's edge: the door sits near the canvas edge,
  // so a centred status label would run off the screen.
  ctx.textAlign = 'right';
  ctx.fillText(open ? 'OPEN — GO!' : 'LOCKED', exit.x + exit.w, exit.y + exit.h + 18);
}

export function drawGuard(ctx, guard, player, level) {
  // The cone is always drawn at full vision range: it shows what the
  // guard can see out in the open. (Detection itself is shorter when the
  // thief is hidden — see guards.js — but the light does not shrink.)
  const range = TUNING.visionRange;
  const polygon = visionConePolygon(guard, level, range);
  const alert = guard.seesPlayer;
  const color = guard.state === 'chase' ? '255,70,60'
    : guard.state === 'suspicious' ? '255,170,40' : '255,214,90';
  ctx.fillStyle = `rgba(${color},0.20)`;
  ctx.beginPath();
  ctx.moveTo(polygon[0].x, polygon[0].y);
  for (let i = 1; i < polygon.length; i++) ctx.lineTo(polygon[i].x, polygon[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(${color},0.45)`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Guard: maroon uniform, brass helmet, facing tick.
  ctx.fillStyle = '#7a1f2b';
  ctx.beginPath(); ctx.arc(guard.x, guard.y, TUNING.guardRadius, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e8c268';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#e8c268';
  ctx.beginPath(); ctx.arc(guard.x, guard.y, 6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffd76e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.lineTo(guard.x + Math.cos(guard.facing) * 20, guard.y + Math.sin(guard.facing) * 20);
  ctx.stroke();
  const mark = alert ? '!' : guard.state === 'suspicious' ? '?' : '';
  if (mark) {
    ctx.fillStyle = alert ? '#ff463c' : '#ffaa28';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(mark, guard.x, guard.y - 24);
  }
}

export function drawPlayer(ctx, player, time) {
  // The thief: dark hooded figure; crouched smaller while sneaking.
  const radius = player.sneaking ? TUNING.playerRadius - 3 : TUNING.playerRadius;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.ellipse(player.x, player.y + radius - 2, radius + 3, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1c2438';
  ctx.beginPath(); ctx.arc(player.x, player.y, radius, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#8fa8ff';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Hood point + eyes in the facing direction.
  const fx = Math.cos(player.facing);
  const fy = Math.sin(player.facing);
  ctx.fillStyle = '#1c2438';
  ctx.beginPath();
  ctx.moveTo(player.x + fx * (radius + 7), player.y + fy * (radius + 7));
  ctx.lineTo(player.x - fy * 6, player.y + fx * 6);
  ctx.lineTo(player.x + fy * 6, player.y - fx * 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#cfe0ff';
  ctx.beginPath(); ctx.arc(player.x + fx * 5 - fy * 4, player.y + fy * 5 + fx * 4, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(player.x + fx * 5 + fy * 4, player.y + fy * 5 - fx * 4, 1.8, 0, Math.PI * 2); ctx.fill();
  if (player.hidden) {
    ctx.fillStyle = '#9fd8ff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.sneaking ? 'HIDDEN · SNEAKING' : 'HIDDEN', player.x, player.y - radius - 10);
  } else if (player.sneaking) {
    ctx.fillStyle = 'rgba(200,215,255,0.75)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SNEAKING', player.x, player.y - radius - 10);
  }
  void time;
}

export function drawHud(ctx, game) {
  const level = game.level;
  ctx.fillStyle = '#0a0e1a';
  ctx.fillRect(0, 0, TUNING.canvasWidth, TUNING.hudHeight);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, TUNING.hudHeight - 2, TUNING.canvasWidth, 2);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f2e6c9';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('SHADOW VAULT', 20, 28);
  ctx.fillStyle = '#9fb2d8';
  ctx.font = '14px sans-serif';
  ctx.fillText(level.name, 20, 50);
  // Loot counter reads the live loot array (taken flags live there, not
  // on the level data), so the HUD always matches the real count.
  const taken = game.loot.filter((item) => item.taken).length;
  ctx.fillStyle = '#ffd76e';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText(`◆ LOOT ${taken}/${game.loot.length}`, 380, 30);
  ctx.fillStyle = '#9fb2d8';
  ctx.font = '13px sans-serif';
  ctx.fillText('E to pocket · Shift to sneak', 380, 50);
  // Alarm meter: green to red as the guards close in.
  const alarm = game.alarm;
  ctx.fillStyle = '#9fb2d8';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('ALARM', 640, 22);
  ctx.fillStyle = '#1a2138';
  ctx.fillRect(640, 30, 220, 16);
  const alarmColor = alarm < 25 ? '#2ecc71' : alarm < 55 ? '#f39c12' : '#e74c3c';
  ctx.fillStyle = alarmColor;
  ctx.fillRect(640, 30, 220 * Math.min(1, alarm / 100), 16);
  ctx.strokeStyle = '#5a6a8a';
  ctx.strokeRect(640, 30, 220, 16);
  ctx.fillStyle = alarm >= 55 ? '#ff6b5e' : '#c8d4ea';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(alarm >= 55 ? 'HUNTED!' : alarm >= 25 ? 'SUSPICIOUS' : 'UNSEEN', 640, 60);
  // Timer, level, score.
  ctx.fillStyle = '#f2e6c9';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`⏱ ${formatTime(game.elapsed)}`, 1260, 30);
  ctx.fillStyle = '#9fb2d8';
  ctx.font = '14px sans-serif';
  ctx.fillText(`LEVEL ${game.levelIndex + 1}/3   SCORE ${game.score}`, 1260, 50);
  ctx.textAlign = 'left';
}

export function formatTime(seconds) {
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function overlay(ctx, title, titleColor, lines, footer) {
  ctx.fillStyle = 'rgba(4,6,14,0.78)';
  ctx.fillRect(0, TUNING.hudHeight, TUNING.canvasWidth, TUNING.canvasHeight - TUNING.hudHeight);
  ctx.textAlign = 'center';
  ctx.fillStyle = titleColor;
  ctx.font = 'bold 54px sans-serif';
  ctx.fillText(title, 640, 300);
  ctx.fillStyle = '#e8e2cf';
  ctx.font = '20px sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, 640, 350 + i * 32));
  if (footer) {
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(footer, 640, 350 + lines.length * 32 + 24);
  }
}

export function drawTitle(ctx) {
  ctx.fillStyle = '#070a12';
  ctx.fillRect(0, 0, TUNING.canvasWidth, TUNING.canvasHeight);
  // A moonlit museum silhouette behind the title.
  ctx.fillStyle = '#f5e9c8';
  ctx.beginPath(); ctx.arc(1060, 150, 52, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#131a30';
  for (let i = 0; i < 5; i++) {
    const x = 120 + i * 220;
    ctx.fillRect(x, 560, 130, 240);
    ctx.beginPath(); ctx.moveTo(x - 10, 560); ctx.lineTo(x + 65, 470); ctx.lineTo(x + 140, 560); ctx.closePath(); ctx.fill();
  }
  ctx.textAlign = 'center';
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 76px sans-serif';
  ctx.fillText('SHADOW VAULT', 640, 260);
  ctx.fillStyle = '#f2e6c9';
  ctx.font = '24px sans-serif';
  ctx.fillText('A night at the museum. Their gold. Your shadow.', 640, 310);
  ctx.fillStyle = '#c8d4ea';
  ctx.font = '18px sans-serif';
  ctx.fillText('Pocket every artefact, then reach the green EXIT without being seen.', 640, 380);
  ctx.fillText('Guards patrol with cones of light — hide behind statues and crates,', 640, 410);
  ctx.fillText('vanish into shadow patches, and sneak with Shift when a guard is near.', 640, 440);
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('WASD / Arrows — move      Shift — sneak      E — pocket loot      R — restart', 640, 520);
  ctx.fillStyle = '#f2e6c9';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('Press ENTER to slip inside', 640, 580);
  ctx.fillStyle = '#8fa0c0';
  ctx.font = '15px sans-serif';
  ctx.fillText('3 levels · 4 guards at the vault · one wrong step from the alarm', 640, 630);
}

export function drawCaught(ctx, game) {
  overlay(ctx, 'CAUGHT!', '#ff5a4e',
    [`The guards caught you on ${game.level.name} with ${game.lootTaken()} of ${game.level.loot.length} artefacts.`,
     `Score ${game.score} · Time ${formatTime(game.elapsed)}`],
    'Press R to try the level again');
}

export function drawLevelClear(ctx, game) {
  overlay(ctx, 'LEVEL CLEAR', '#2ecc71',
    [`${game.level.name} — all artefacts pocketed, unseen enough to walk out.`,
     game.ghost ? 'GHOST BONUS +500 — peak alarm stayed under 50.' : `Peak alarm ${Math.round(game.peakAlarm)} — a ghost run needs under 50.`,
     `Score ${game.score}`],
    'Press ENTER for the next hall');
}

export function drawWin(ctx, game) {
  overlay(ctx, 'VANISHED', GOLD,
    ['Every artefact in the museum is yours. The guards never saw a thing.',
     `Final score ${game.score} · Total time ${formatTime(game.elapsed)}`,
     `Levels cleared 3/3 · Ghost bonuses ${game.ghostLevels}/3`],
    'Press R to play again from Level 1');
}

export function drawPrompt(ctx, game) {
  const near = game.nearestLootItem();
  if (near) {
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Press E — pocket the ${near.name}`, 640, 776);
  } else if (game.allLootTaken() && !game.nearExit()) {
    ctx.fillStyle = '#7be2a0';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('All loot pocketed — reach the green EXIT!', 640, 776);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
