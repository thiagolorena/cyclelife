# Cyclelife

Cyclelife is a tiny 2D pixel-art platformer prototype built around one cruel rule: the level is trying to kill you.

The player has one life. Death sends them back to the latest checkpoint. The exit is a door at the end of the stage, but the scenario itself becomes the enemy: homing falling blocks, fake floors, hidden saws, expanding spikes, pits, and even a checkpoint that lies.

## Play

Open `index.html` in a browser.

Controls:

- Move: Arrow keys or A/D
- Jump: Space, W, or Up
- Run: Shift
- Restart: R

## Project shape

- `index.html` contains the game shell.
- `style.css` handles the responsive pixel-art frame and touch controls.
- `game.js` contains the canvas game loop, physics, traps, checkpoints, and level data.

## Next ideas

- Add more levels with a small level editor format.
- Add tile sprites and player sprite sheets.
- Add sound effects for traps, checkpoints, and death.
- Add a replay ghost so players can learn from previous attempts.
