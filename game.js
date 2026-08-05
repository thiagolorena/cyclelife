const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const statusEl = document.querySelector("#status");
const timerEl = document.querySelector("#timer");
const deathsEl = document.querySelector("#deaths");

ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;
const TILE = 32;
const GRAVITY = 0.72;
const keys = new Set();
const touch = new Set();

const checkpointStart = { x: 58, y: 397, label: "Start" };
const player = {
  x: checkpointStart.x,
  y: checkpointStart.y,
  w: 22,
  h: 28,
  vx: 0,
  vy: 0,
  grounded: false,
  facing: 1,
  frame: 0,
  checkpoint: checkpointStart,
  deadUntil: 0,
};

const state = {
  startTime: performance.now(),
  deaths: 0,
  won: false,
  cameraX: 0,
  shake: 0,
  flash: 0,
  triggered: new Set(),
};

const solids = [
  rect(0, 458, 544, 38, "grass"),
  rect(640, 458, 260, 38, "grass"),
  rect(992, 458, 290, 38, "grass"),
  rect(1390, 458, 470, 38, "grass"),
  rect(1988, 458, 390, 38, "grass"),
  rect(2450, 458, 360, 38, "grass"),
  rect(2930, 458, 720, 38, "grass"),
];

const hazards = [
  rect(552, 472, 88, 24, "pit"),
  rect(900, 444, 92, 52, "spikes", { expandable: true, triggerRange: 92, baseY: 444, baseH: 52, expandedY: 384, expandedH: 112 }),
  rect(1280, 472, 110, 24, "pit"),
  rect(1458, 444, 84, 52, "spikes", { expandable: true, triggerRange: 84, baseY: 444, baseH: 52, expandedY: 396, expandedH: 100 }),
  rect(1860, 472, 128, 24, "pit"),
  rect(2378, 472, 72, 24, "pit"),
  rect(2810, 444, 120, 52, "spikes", { expandable: true, triggerRange: 110, baseY: 444, baseH: 52, expandedY: 372, expandedH: 124 }),
  rect(3650, 472, 180, 24, "pit"),
  rect(1210, 430, 28, 28, "saw"),
  rect(2658, 430, 28, 28, "saw"),
];

const checkpoints = [
  rect(1040, 408, 28, 50, "cp", { label: "Old Switch" }),
  rect(2328, 408, 28, 50, "cp", { label: "Quiet Floor", explosive: true, exploded: false }),
  rect(3170, 408, 28, 50, "cp", { label: "Last Door" }),
];

const traps = [
  {
    id: "ceiling-1",
    trigger: rect(330, 0, 80, H),
    block: rect(390, 238, 122, 90, "falling"),
    vx: 0,
    vy: 0,
    delay: 80,
    activeAt: 0,
  },
  {
    id: "floor-saw-1",
    trigger: rect(700, 0, 96, H),
    block: rect(792, 430, 96, 28, "hiddenSaw"),
    armed: false,
  },
  {
    id: "fake-bridge",
    trigger: rect(1515, 0, 60, H),
    block: rect(1584, 458, 136, 38, "crumbly"),
    activeAt: 0,
  },
  {
    id: "ceiling-2",
    trigger: rect(2050, 0, 80, H),
    block: rect(2138, 196, 120, 110, "falling"),
    vx: 0,
    vy: 0,
    delay: 45,
    activeAt: 0,
  },
  {
    id: "runway",
    trigger: rect(2470, 0, 110, H),
    block: rect(2572, 458, 128, 38, "crumbly"),
    activeAt: 0,
  },
  {
    id: "last-lie",
    trigger: rect(3316, 0, 78, H),
    block: rect(3420, 244, 98, 74, "falling"),
    vx: 0,
    vy: 0,
    delay: 60,
    activeAt: 0,
  },
];

const door = rect(3568, 386, 44, 72, "door");
const levelWidth = 3720;

function rect(x, y, w, h, type, extra = {}) {
  return { x, y, w, h, type, ...extra };
}

function inputDown(code) {
  return keys.has(code) || touch.has(code);
}

function reset(toCheckpoint = true) {
  const spawn = toCheckpoint ? player.checkpoint : checkpointStart;
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.deadUntil = performance.now() + 250;
  state.triggered.clear();
  state.shake = 8;
  state.flash = 0;
  for (const hazard of hazards) {
    if (!hazard.expandable) continue;
    hazard.y = hazard.baseY;
    hazard.h = hazard.baseH;
    hazard.expanded = false;
  }
  for (const cp of checkpoints) cp.exploded = false;
  for (const trap of traps) {
    trap.vx = 0;
    trap.vy = 0;
    trap.armed = false;
    trap.activeAt = 0;
    if (trap.id === "ceiling-1") Object.assign(trap.block, rect(390, 238, 122, 90, "falling"));
    if (trap.id === "fake-bridge") Object.assign(trap.block, rect(1584, 458, 136, 38, "crumbly"));
    if (trap.id === "ceiling-2") Object.assign(trap.block, rect(2138, 196, 120, 110, "falling"));
    if (trap.id === "runway") Object.assign(trap.block, rect(2572, 458, 128, 38, "crumbly"));
    if (trap.id === "last-lie") Object.assign(trap.block, rect(3420, 244, 98, 74, "falling"));
  }
  statusEl.textContent = `Checkpoint: ${spawn.label}`;
}

function kill() {
  if (player.deadUntil > performance.now() || state.won) return;
  state.deaths += 1;
  deathsEl.textContent = `Deaths: ${state.deaths}`;
  reset(true);
}

function update(dt, now) {
  if (state.won) return;

  const left = inputDown("ArrowLeft") || inputDown("KeyA");
  const right = inputDown("ArrowRight") || inputDown("KeyD");
  const run = inputDown("ShiftLeft") || inputDown("ShiftRight") || inputDown("Run");
  const jump = inputDown("Space") || inputDown("ArrowUp") || inputDown("KeyW");
  const speed = run ? 5.2 : 3.25;

  if (left) {
    player.vx = Math.max(player.vx - 0.9, -speed);
    player.facing = -1;
  } else if (right) {
    player.vx = Math.min(player.vx + 0.9, speed);
    player.facing = 1;
  } else {
    player.vx *= 0.76;
    if (Math.abs(player.vx) < 0.04) player.vx = 0;
  }

  if (jump && player.grounded) {
    player.vy = -13.2;
    player.grounded = false;
  }

  player.vy = Math.min(player.vy + GRAVITY, 15);
  move(player.vx, 0);
  move(0, player.vy);

  for (const cp of checkpoints) {
    if (overlaps(player, cp)) {
      if (cp.explosive && !cp.exploded) {
        cp.exploded = true;
        kill();
        state.flash = 18;
        state.shake = 18;
        continue;
      }
      player.checkpoint = { x: cp.x + 5, y: cp.y - player.h, label: cp.label };
      statusEl.textContent = `Checkpoint: ${cp.label}`;
    }
  }

  for (const trap of traps) updateTrap(trap, now);
  for (const hazard of hazards) updateHazard(hazard);
  for (const hazard of hazards) if (overlaps(player, hazard)) kill();
  for (const trap of traps) {
    if ((trap.block.type === "falling" || trap.block.type === "hiddenSaw") && overlaps(player, trap.block)) kill();
  }
  if (player.y > H + 120) kill();
  if (overlaps(player, door)) win();

  state.cameraX = clamp(player.x - W * 0.38, 0, levelWidth - W);
  state.shake = Math.max(0, state.shake - dt * 0.05);
  state.flash = Math.max(0, state.flash - dt * 0.08);
  player.frame += Math.abs(player.vx) * 0.08 + (player.grounded ? 0 : 0.04);
}

function updateTrap(trap, now) {
  if (!state.triggered.has(trap.id) && overlaps(player, trap.trigger)) {
    state.triggered.add(trap.id);
    trap.activeAt = now + trap.delay;
    trap.armed = true;
    state.shake = 6;
  }

  if (!trap.armed || now < trap.activeAt) return;

  if (trap.block.type === "falling") {
    const blockCenter = trap.block.x + trap.block.w / 2;
    const playerCenter = player.x + player.w / 2;
    const direction = Math.sign(playerCenter - blockCenter) || 1;
    trap.vx = clamp((trap.vx || 0) + direction * 0.9, -8.6, 8.6);
    trap.vy = Math.min((trap.vy || 3.5) + 1.75, 24);
    trap.block.x += trap.vx;
    trap.block.y += trap.vy;
  }

  if (trap.block.type === "crumbly") {
    trap.block.y += 7;
    trap.block.h = Math.max(0, trap.block.h - 1);
  }
}

function updateHazard(hazard) {
  if (!hazard.expandable || hazard.expanded) return;
  const playerCenter = player.x + player.w / 2;
  const hazardCenter = hazard.x + hazard.w / 2;
  const closeX = Math.abs(playerCenter - hazardCenter) < hazard.w / 2 + hazard.triggerRange;
  const nearFloor = player.y + player.h > hazard.baseY - 96;
  if (!closeX || !nearFloor) return;
  hazard.expanded = true;
  hazard.y = hazard.expandedY;
  hazard.h = hazard.expandedH;
  state.shake = Math.max(state.shake, 10);
  state.flash = Math.max(state.flash, 8);
}

function move(dx, dy) {
  player.x += dx;
  player.y += dy;
  player.grounded = false;

  for (const solid of activeSolids()) {
    if (!overlaps(player, solid)) continue;

    if (dx > 0) player.x = solid.x - player.w;
    if (dx < 0) player.x = solid.x + solid.w;
    if (dy > 0) {
      player.y = solid.y - player.h;
      player.vy = 0;
      player.grounded = true;
    }
    if (dy < 0) {
      player.y = solid.y + solid.h;
      player.vy = 0;
    }
  }
  player.x = clamp(player.x, 0, levelWidth - player.w);
}

function activeSolids() {
  const trapSolids = traps
    .filter((trap) => trap.block.type !== "hiddenSaw" && trap.block.h > 0 && trap.block.y < H + 80)
    .map((trap) => trap.block);
  return solids.concat(trapSolids);
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function win() {
  state.won = true;
  statusEl.textContent = "Door reached";
}

function draw(now) {
  const shakeX = state.shake ? (Math.random() - 0.5) * state.shake : 0;
  const shakeY = state.shake ? (Math.random() - 0.5) * state.shake : 0;
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(Math.round(-state.cameraX + shakeX), Math.round(shakeY));
  drawBackground();
  drawTiles();
  drawDoor();
  drawCheckpoints();
  drawPlayer(now);
  ctx.restore();
  drawOverlay();
}

function drawBackground() {
  ctx.fillStyle = "#092334";
  ctx.fillRect(state.cameraX, 0, W, H);
  ctx.fillStyle = "#123e4f";
  for (let x = Math.floor(state.cameraX / 96) * 96; x < state.cameraX + W + 96; x += 96) {
    ctx.fillRect(x, 104 + ((x / 96) % 3) * 18, 48, 12);
    ctx.fillRect(x + 20, 122 + ((x / 96) % 3) * 18, 34, 10);
  }
  ctx.fillStyle = "#071018";
  ctx.fillRect(state.cameraX, 496, W, 80);
}

function drawTiles() {
  for (const solid of activeSolids()) drawBlock(solid);
  for (const hazard of hazards) drawHazard(hazard);
  for (const trap of traps) {
    if (trap.block.type === "hiddenSaw" && trap.armed) drawHazard(trap.block);
  }
}

function drawBlock(block) {
  const color = block.type === "falling" ? "#7a4f39" : "#3e7f4f";
  ctx.fillStyle = color;
  ctx.fillRect(block.x, block.y, block.w, block.h);
  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fillRect(block.x, block.y, block.w, 5);
  ctx.fillStyle = "rgba(0,0,0,0.24)";
  ctx.fillRect(block.x, block.y + block.h - 6, block.w, 6);
  if (block.type === "crumbly") {
    ctx.fillStyle = "#261f1b";
    for (let x = block.x + 8; x < block.x + block.w; x += 26) ctx.fillRect(x, block.y + 13, 10, 4);
  }
}

function drawHazard(h) {
  ctx.fillStyle = h.type === "pit" ? "#05080c" : "#8d1730";
  ctx.fillRect(h.x, h.y, h.w, h.h);
  ctx.fillStyle = h.expandable && h.expanded ? "#ffd166" : "#ff3864";
  for (let x = h.x; x < h.x + h.w; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, h.y + h.h);
    ctx.lineTo(x + 8, h.y);
    ctx.lineTo(x + 16, h.y + h.h);
    ctx.fill();
  }
}

function drawCheckpoints() {
  for (const cp of checkpoints) {
    ctx.fillStyle = cp.explosive ? "#ff3864" : player.checkpoint.label === cp.label ? "#a6ff3d" : "#ffd166";
    ctx.fillRect(cp.x + 10, cp.y, 6, cp.h);
    ctx.fillRect(cp.x + 16, cp.y + 4, 20, 14);
    if (cp.explosive) {
      ctx.fillStyle = "#05080c";
      ctx.fillRect(cp.x + 22, cp.y + 8, 4, 4);
      ctx.fillRect(cp.x + 28, cp.y + 14, 4, 4);
    }
  }
}

function drawDoor() {
  ctx.fillStyle = "#17100c";
  ctx.fillRect(door.x, door.y, door.w, door.h);
  ctx.fillStyle = "#835531";
  ctx.fillRect(door.x + 6, door.y + 6, door.w - 12, door.h - 6);
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(door.x + door.w - 14, door.y + 36, 5, 5);
}

function drawPlayer(now) {
  const blink = player.deadUntil > now && Math.floor(now / 60) % 2 === 0;
  if (blink) return;
  const bob = player.grounded ? Math.sin(player.frame) * 2 : 0;
  ctx.fillStyle = "#e7edf2";
  ctx.fillRect(Math.round(player.x), Math.round(player.y + bob), player.w, player.h);
  ctx.fillStyle = "#2e6f95";
  ctx.fillRect(Math.round(player.x + 4), Math.round(player.y + 7 + bob), 14, 8);
  ctx.fillStyle = "#05080c";
  ctx.fillRect(player.facing > 0 ? player.x + 15 : player.x + 4, player.y + 6 + bob, 4, 4);
  ctx.fillStyle = "#ffd166";
  const leg = Math.floor(player.frame) % 2 === 0 ? 3 : -1;
  ctx.fillRect(player.x + 3, player.y + player.h - 2 + bob, 7, 4 + leg);
  ctx.fillRect(player.x + 13, player.y + player.h - 2 + bob, 7, 4 - leg);
}

function drawOverlay() {
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(255, 56, 100, ${Math.min(0.34, state.flash / 30)})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (!state.won) return;
  ctx.fillStyle = "rgba(5, 8, 12, 0.72)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#e7edf2";
  ctx.font = "700 42px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("CYCLE COMPLETE", W / 2, 236);
  ctx.font = "18px Courier New";
  ctx.fillText("Press R to restart the level", W / 2, 278);
}

function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(32, now - last);
  last = now;
  update(dt, now);
  draw(now);
  timerEl.textContent = formatTime(now - state.startTime);
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "KeyR") {
    state.won = false;
    state.deaths = 0;
    state.startTime = performance.now();
    player.checkpoint = checkpointStart;
    deathsEl.textContent = "Deaths: 0";
    reset(false);
  }
});

window.addEventListener("keyup", (event) => keys.delete(event.code));

for (const [id, code] of [
  ["left", "ArrowLeft"],
  ["right", "ArrowRight"],
  ["jump", "Space"],
  ["run", "Run"],
]) {
  const button = document.querySelector(`#${id}`);
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    touch.add(code);
  });
  button.addEventListener("pointerup", () => touch.delete(code));
  button.addEventListener("pointercancel", () => touch.delete(code));
  button.addEventListener("pointerleave", () => touch.delete(code));
}

reset(false);
requestAnimationFrame(loop);
