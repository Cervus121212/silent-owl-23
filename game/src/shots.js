// Shadow Vault — deterministic screenshot states. ?shot=cover|start|level2|win
// renders one frozen frame straight from the game's own code, so the
// screenshots are real renders, never edits. Anything else plays normally.

import { LEVELS } from './config.js';
import { makeGuard } from './guards.js';
import { makePlayer } from './player.js';

export function shotParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('shot');
}

// Build the frozen game state for a shot name. Returns null for normal play.
export function buildShotState(shot) {
  if (shot === 'start') return { mode: 'title' };
  if (shot === 'win') {
    return {
      mode: 'win',
      levelIndex: 2,
      level: LEVELS[2],
      score: 7450,
      elapsed: 342,
      ghostLevels: 2,
      lootTaken: () => LEVELS[2].loot.length,
      peakAlarm: 31,
    };
  }
  if (shot === 'cover' || shot === 'level2') {
    const levelIndex = shot === 'cover' ? 0 : 1;
    const level = LEVELS[levelIndex];
    const loot = level.loot.map((item) => ({ ...item, taken: false }));
    const guards = level.guards.map((def) => makeGuard(def));
    const player = makePlayer(level.playerStart);
    if (shot === 'cover') {
      // The thief crouched behind the king statue, a guard's cone sweeping
      // just past them, one artefact already pocketed, alarm climbing.
      loot[0].taken = true;
      player.x = 195;
      player.y = 210;
      player.sneaking = true;
      player.facing = 0;
      guards[0].x = 480;
      guards[0].y = 330;
      guards[0].facing = Math.PI;
      guards[0].state = 'suspicious';
      guards[0].seesPlayer = false;
      guards[1].x = 900;
      guards[1].y = 560;
      guards[1].facing = -Math.PI / 2;
      return {
        mode: 'play', frozen: true, levelIndex, level, loot, guards, player,
        alarm: 35, elapsed: 47, score: 500, peakAlarm: 35, ghost: false,
      };
    }
    // Level 2 mid-game: two artefacts pocketed, thief in a shadow patch,
    // two cones crossing the hall ahead.
    loot[0].taken = true;
    loot[1].taken = true;
    player.x = 425;
    player.y = 175;
    player.sneaking = true;
    player.facing = 0;
    guards[0].x = 400;
    guards[0].y = 330;
    guards[0].facing = Math.PI / 2;
    guards[1].x = 900;
    guards[1].y = 330;
    guards[1].facing = Math.PI / 2;
    guards[2].x = 700;
    guards[2].y = 300;
    guards[2].facing = 0;
    return {
      mode: 'play', frozen: true, levelIndex, level, loot, guards, player,
      alarm: 18, elapsed: 96, score: 1000, peakAlarm: 22, ghost: false,
    };
  }
  return null;
}
