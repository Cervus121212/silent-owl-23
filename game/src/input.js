// Shadow Vault — keyboard input. One shared Set of held keys, plus a
// queue of single presses (E to loot, R to restart, Enter to start) that
// the game loop consumes once per frame.

export function createInput() {
  const keys = new Set();
  const pressed = [];
  const handler = (event) => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
      event.preventDefault();
    }
    if (event.type === 'keydown') {
      if (!event.repeat) pressed.push(key);
      keys.add(key);
    } else {
      keys.delete(key);
    }
  };
  window.addEventListener('keydown', handler);
  window.addEventListener('keyup', handler);
  return {
    keys,
    // Take and clear the presses since the last frame.
    takePressed() {
      return pressed.splice(0, pressed.length);
    },
  };
}
