// Shadow Vault — tuning constants and the three museum levels.
// Every level is data: walls and display cases block movement and sight,
// statues and crates are solid cover, shadow patches hide the thief.
// Coordinates are canvas pixels; the HUD occupies the top 64 px, so no
// level geometry starts above y = 76.

// --- Tuning ---------------------------------------------------------------
export const TUNING = {
  canvasWidth: 1280,
  canvasHeight: 800,
  hudHeight: 64,
  playerRadius: 13,
  playerWalkSpeed: 175, // px per second
  playerSneakSpeed: 88, // Shift: half speed, half the noise
  guardRadius: 14,
  guardChaseSpeed: 150,
  visionRange: 250, // how far a guard can spot the thief
  visionHalfAngle: 0.62, // radians either side of the guard's facing
  shadowVisionRange: 130, // a thief standing in shadow is spotted much later
  coverSpotRange: 62, // a thief crouched behind cover is seen only up close
  alarmFillNear: 55, // alarm points per second while spotted up close
  alarmFillFar: 26, // alarm points per second while spotted at range
  alarmDecay: 14, // alarm points per second while unseen
  alarmSuspicious: 25, // guard turns toward the last seen position
  alarmChase: 55, // guard breaks patrol and hunts the thief
  alarmCaught: 100,
  sneakFillFactor: 0.45, // sneaking fills the alarm this much slower
  sneakRangeFactor: 0.85, // sneaking shrinks the spot range a little
  lootPickupRadius: 42, // press E this close to pocket an artefact
  lootScore: 500,
  levelClearScore: 1000,
  ghostBonus: 500, // finishing a level with peak alarm under 50
  ghostAlarmCeiling: 50,
  guardMemorySeconds: 3, // how long a guard hunts after losing sight
};

// --- Level geometry -------------------------------------------------------
// wall: solid stone, blocks movement and sight.
// cover: statue / display case / crate — solid, blocks sight, hides the thief.
// shadow: dark patch on the floor — not solid, halves the spot range.
// loot: { x, y, name } — golden artefacts to pocket with E.
// exit: green door, locked until every artefact in the level is pocketed.
// guard: { path: [[x, y], ...], speed, pause } — patrol waypoints.

export const LEVELS = [
  {
    name: 'Level 1 — Gallery of Kings',
    hint: 'Pocket all 3 artefacts, then slip out the green door unseen.',
    playerStart: { x: 90, y: 700 },
    exit: { x: 1170, y: 330, w: 40, h: 110 },
    walls: [
      { x: 0, y: 64, w: 1280, h: 12 },
      { x: 0, y: 788, w: 1280, h: 12 },
      { x: 0, y: 64, w: 12, h: 736 },
      { x: 1224, y: 64, w: 56, h: 736 },
      { x: 300, y: 76, w: 16, h: 220 },
      { x: 300, y: 460, w: 16, h: 200 },
      { x: 640, y: 200, w: 16, h: 240 },
      { x: 640, y: 560, w: 16, h: 160 },
      { x: 940, y: 76, w: 16, h: 180 },
      { x: 940, y: 420, w: 16, h: 220 },
    ],
    cover: [
      { x: 150, y: 180, w: 90, h: 60, kind: 'statue', label: 'KING STATUE' },
      { x: 420, y: 560, w: 110, h: 64, kind: 'case', label: 'DISPLAY CASE' },
      { x: 760, y: 140, w: 90, h: 60, kind: 'statue', label: 'QUEEN STATUE' },
      { x: 760, y: 620, w: 110, h: 64, kind: 'crate', label: 'CRATES' },
      { x: 1060, y: 560, w: 90, h: 60, kind: 'case', label: 'DISPLAY CASE' },
    ],
    shadows: [
      { x: 120, y: 420, w: 150, h: 120 },
      { x: 480, y: 120, w: 140, h: 110 },
      { x: 1010, y: 180, w: 150, h: 110 },
    ],
    loot: [
      { x: 195, y: 130, name: 'Golden Scarab' },
      { x: 815, y: 700, name: 'Jade Idol' },
      { x: 1120, y: 120, name: 'Ruby Crown' },
    ],
    guards: [
      { path: [[480, 320], [480, 640], [860, 640], [860, 320]], speed: 72, pause: 1.2 },
      { path: [[1080, 300], [1080, 660], [700, 660]], speed: 78, pause: 1.0 },
    ],
  },
  {
    name: 'Level 2 — Hall of Relics',
    hint: 'More guards, faster patrols. Shadows are your friends — sneak in them.',
    playerStart: { x: 90, y: 700 },
    exit: { x: 1170, y: 150, w: 40, h: 110 },
    walls: [
      { x: 0, y: 64, w: 1280, h: 12 },
      { x: 0, y: 788, w: 1280, h: 12 },
      { x: 0, y: 64, w: 12, h: 736 },
      { x: 1224, y: 64, w: 56, h: 736 },
      { x: 260, y: 76, w: 16, h: 180 },
      { x: 260, y: 400, w: 16, h: 280 },
      { x: 520, y: 300, w: 16, h: 380 },
      { x: 780, y: 76, w: 16, h: 260 },
      { x: 780, y: 500, w: 16, h: 220 },
      { x: 1020, y: 300, w: 16, h: 240 },
    ],
    cover: [
      { x: 130, y: 150, w: 90, h: 60, kind: 'statue', label: 'WARRIOR STATUE' },
      { x: 350, y: 620, w: 110, h: 64, kind: 'case', label: 'DISPLAY CASE' },
      { x: 600, y: 130, w: 90, h: 60, kind: 'statue', label: 'PHARAOH STATUE' },
      { x: 600, y: 620, w: 110, h: 64, kind: 'crate', label: 'CRATES' },
      { x: 880, y: 620, w: 90, h: 60, kind: 'case', label: 'DISPLAY CASE' },
      { x: 1080, y: 430, w: 90, h: 60, kind: 'statue', label: 'GUARDIAN STATUE' },
    ],
    shadows: [
      { x: 110, y: 420, w: 140, h: 120 },
      { x: 350, y: 120, w: 140, h: 110 },
      { x: 620, y: 380, w: 150, h: 110 },
      { x: 900, y: 130, w: 140, h: 110 },
      { x: 1080, y: 620, w: 120, h: 100 },
    ],
    loot: [
      { x: 175, y: 120, name: 'Emerald Mask' },
      { x: 655, y: 720, name: 'Sapphire Orb' },
      { x: 1130, y: 300, name: 'Ivory Dagger' },
      { x: 920, y: 430, name: 'Opal Chalice' },
    ],
    guards: [
      { path: [[400, 200], [400, 620], [680, 620], [680, 200]], speed: 88, pause: 0.9 },
      { path: [[900, 200], [900, 620], [1140, 620], [1140, 200]], speed: 92, pause: 0.9 },
      { path: [[180, 300], [1150, 300]], speed: 84, pause: 1.4 },
    ],
  },
  {
    name: 'Level 3 — The Vault',
    hint: 'The vault holds 5 artefacts and 4 guards. Stay in shadow, move slow, vanish.',
    playerStart: { x: 90, y: 700 },
    exit: { x: 1170, y: 420, w: 40, h: 110 },
    walls: [
      { x: 0, y: 64, w: 1280, h: 12 },
      { x: 0, y: 788, w: 1280, h: 12 },
      { x: 0, y: 64, w: 12, h: 736 },
      { x: 1224, y: 64, w: 56, h: 736 },
      { x: 230, y: 76, w: 16, h: 170 },
      { x: 230, y: 380, w: 16, h: 300 },
      { x: 460, y: 250, w: 16, h: 280 },
      { x: 460, y: 640, w: 16, h: 80 },
      { x: 700, y: 76, w: 16, h: 200 },
      { x: 700, y: 420, w: 16, h: 300 },
      { x: 950, y: 250, w: 16, h: 280 },
      { x: 950, y: 640, w: 16, h: 80 },
      { x: 1120, y: 76, w: 16, h: 170 },
    ],
    cover: [
      { x: 110, y: 150, w: 90, h: 60, kind: 'statue', label: 'TITAN STATUE' },
      { x: 320, y: 600, w: 110, h: 64, kind: 'case', label: 'DISPLAY CASE' },
      { x: 560, y: 130, w: 90, h: 60, kind: 'statue', label: 'SPHINX STATUE' },
      { x: 560, y: 560, w: 110, h: 64, kind: 'crate', label: 'CRATES' },
      { x: 800, y: 620, w: 90, h: 60, kind: 'case', label: 'DISPLAY CASE' },
      { x: 1040, y: 560, w: 90, h: 60, kind: 'statue', label: 'ANGEL STATUE' },
      { x: 1040, y: 130, w: 90, h: 60, kind: 'crate', label: 'CRATES' },
    ],
    shadows: [
      { x: 110, y: 400, w: 140, h: 120 },
      { x: 320, y: 120, w: 140, h: 110 },
      { x: 560, y: 350, w: 130, h: 110 },
      { x: 800, y: 130, w: 140, h: 110 },
      { x: 800, y: 420, w: 130, h: 110 },
      { x: 1060, y: 350, w: 130, h: 110 },
    ],
    loot: [
      { x: 155, y: 120, name: 'Diamond Skull' },
      { x: 375, y: 720, name: 'Golden Ankh' },
      { x: 605, y: 450, name: 'Moon Pearl' },
      { x: 850, y: 720, name: 'Sun Disc' },
      { x: 1130, y: 300, name: 'Crown Jewels' },
    ],
    guards: [
      { path: [[350, 180], [350, 620], [600, 620], [600, 180]], speed: 102, pause: 0.7 },
      { path: [[830, 180], [830, 620], [1080, 620], [1080, 180]], speed: 106, pause: 0.7 },
      { path: [[140, 300], [1140, 300]], speed: 96, pause: 1.2 },
      { path: [[140, 560], [1140, 560]], speed: 98, pause: 1.2 },
    ],
  },
];
