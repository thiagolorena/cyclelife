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
- `docs/PROJECT_DOCUMENTATION.md` is the living project documentation and should be updated with every build.

## Build notes

Every build should include:

- Updated project documentation.
- A playable link.
- A summary of changes.
- Validation details.
- The pushed commit when changes are sent to GitHub.

## Next ideas

- Add more levels with a small level editor format.
- Add tile sprites and player sprite sheets.
- Add sound effects for traps, checkpoints, and death.
- Add a replay ghost so players can learn from previous attempts.
