[![best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/Cervus121212/silent-owl-23/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/Cervus121212/silent-owl-23/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)

# Shadow Vault — Stealth

An original top-down stealth game for the [make.fun best-stealth-game-20261121-1759 bounty](https://make.fun/bounty/best-stealth-game-20261121-1759) ($50, top 10 paid). A thief slips through a museum at night, pockets every artefact, and reaches the green exit without being seen. Vanilla JS + Canvas 2D, no libraries, no network, every pixel drawn procedurally from code.

## Play

```sh
node serve.ts          # serves game/ on http://localhost:8093
```

WASD / arrows — move · Shift — sneak (slower, harder to spot) · E — pocket loot · R — restart level · Enter — start / next level.

## The game

- **3 levels** — Gallery of Kings (2 guards, 3 artefacts), Hall of Relics (3 guards, 4 artefacts), The Vault (4 guards, 5 artefacts). Rooms get bigger, patrols faster.
- **Vision cones** — each guard sweeps a cone of light, raycast-clipped by walls so light stops at stone. Step into a cone with a clear line of sight and the alarm climbs; stay unseen and it drains.
- **Cover that works** — hide behind statues, display cases and crates (guards must be almost on top of you to spot you), or vanish into shadow patches (spot range halved). A `HIDDEN` tag shows when you are concealed.
- **Detection with a second chance** — the alarm fills faster up close and slower while sneaking. At 25 the guards turn suspicious, at 55 they hunt your last seen position, at 100 you are caught. Lose them for 3 seconds and they go back to patrol.
- **Objective** — pocket all loot with E, then slip out the green EXIT (locked until the last artefact). Clearing a level with peak alarm under 50 earns a +500 GHOST bonus.
- **HUD** — alarm meter, loot counter, timer, level and score, always visible.

## Structure

- `game/src/config.js` — tuning constants + the three levels as data (walls, cover, shadows, loot, patrols)
- `game/src/world.js` — collision, line of sight, vision-ray casting
- `game/src/guards.js` — patrol AI, vision cones, detection model
- `game/src/player.js` — movement, sneaking, pocketing loot
- `game/src/render.js` — all procedural canvas art + HUD + overlays
- `game/src/shots.js` — deterministic `?shot=cover|start|level2|win` states for screenshots
- `game/src/input.js` — keyboard input
- `game/src/main.js` — state machine (title → play → level clear → win / caught) and game loop
- `main.ts` — hands game/ + screenshots/ to `/output` with `dossier.json`
