const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const statusEl = document.querySelector("#status");
const timerEl = document.querySelector("#timer");
const deathsEl = document.querySelector("#deaths");
const touchControlsEl = document.querySelector(".touch-controls");

ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;
const FRAME_MS = 1000 / 60;
const GRAVITY = 0.72;
const keys = new Set();
const touch = new Set();
const pointer = { x: 0, y: 0, clicked: false };

const audio = {
  context: null,
  volume: 0.6,
  labels: ["100%", "50%", "0%"],
  index: 1,
};

const player = {
  x: 0,
  y: 0,
  w: 22,
  h: 28,
  vx: 0,
  vy: 0,
  grounded: false,
  facing: 1,
  frame: 0,
  checkpoint: null,
  deadUntil: 0,
};

const state = {
  mode: "menu",
  menuMessage: "",
  startTime: performance.now(),
  deaths: 0,
  finalStats: null,
  won: false,
  levelIndex: 0,
  level: null,
  cameraX: 0,
  shake: 0,
  flash: 0,
  triggered: new Set(),
};

const menuButtons = [
  { id: "play", label: "Jogar", x: 372, y: 286, w: 216, h: 48 },
  { id: "volume", label: "Volume", x: 372, y: 346, w: 216, h: 48 },
  { id: "exit", label: "Sair", x: 372, y: 406, w: 216, h: 48 },
];
const pauseButtons = [{ id: "menu", label: "Sair", x: 372, y: 336, w: 216, h: 48 }];

const levelDefinitions = makeLevels();

function rect(x, y, w, h, type, extra = {}) {
  return { x, y, w, h, type, ...extra };
}

function makeLevels() {
  return [
    {
      name: "Fase 1",
      width: 3720,
      spawn: { x: 58, y: 397, label: "Start" },
      solids: [
        rect(0, 458, 544, 38, "grass"),
        rect(640, 458, 260, 38, "grass"),
        rect(992, 458, 290, 38, "grass"),
        rect(1390, 458, 470, 38, "grass"),
        rect(1988, 458, 390, 38, "grass"),
        rect(2450, 458, 360, 38, "grass"),
        rect(2930, 458, 720, 38, "grass"),
      ],
      hazards: [
        rect(552, 496, 88, 80, "pit"),
        spikePit(560, 496, 72, 112, 2600, 250),
        rect(900, 496, 92, 80, "pit"),
        spikePit(912, 496, 68, 104, 3300, 1200),
        rect(1280, 496, 110, 80, "pit"),
        spikePit(1294, 496, 82, 112, 4100, 800),
        rect(1860, 496, 128, 80, "pit"),
        rect(2378, 496, 72, 80, "pit"),
        rect(2810, 496, 120, 80, "pit"),
        spikePit(2822, 496, 96, 124, 3600, 400),
        rect(3650, 496, 180, 80, "pit"),
        rect(1210, 430, 28, 28, "saw"),
        rect(2658, 430, 28, 28, "saw"),
      ],
      checkpoints: [
        rect(1040, 408, 28, 50, "cp", { label: "Old Switch" }),
        rect(2328, 408, 28, 50, "cp", { label: "Quiet Floor", explosive: true }),
        rect(3170, 408, 28, 50, "cp", { label: "Last Door" }),
      ],
      traps: [
        cloudTrap("cloud-1", 330, 390, 104, 132, 66, 80),
        crumbly("fake-bridge", 1515, 1584, 458, 136, 38),
        cloudTrap("cloud-2", 2050, 2138, 92, 132, 72, 45),
        crumbly("runway", 2470, 2572, 458, 128, 38),
        cloudTrap("last-lie", 3316, 3420, 116, 112, 62, 60),
      ],
      door: rect(3568, 386, 44, 72, "door"),
    },
    {
      name: "Fase 2",
      width: 3140,
      spawn: { x: 54, y: 397, label: "Start" },
      solids: [
        rect(0, 458, 420, 38, "grass"),
        rect(528, 458, 420, 38, "grass"),
        rect(1070, 458, 360, 38, "grass"),
        rect(1545, 458, 390, 38, "grass"),
        rect(2048, 458, 392, 38, "grass"),
        rect(2536, 458, 520, 38, "grass"),
      ],
      hazards: [
        rect(420, 496, 108, 80, "pit"),
        spikePit(436, 496, 76, 124, 2900, 700),
        rect(948, 496, 122, 80, "pit"),
        spikePit(964, 496, 90, 116, 3600, 120),
        rect(1430, 496, 115, 80, "pit"),
        rect(1935, 496, 113, 80, "pit"),
        spikePit(1950, 496, 82, 120, 2600, 1550),
        rect(2440, 496, 96, 80, "pit"),
        spikePit(2452, 496, 70, 104, 4200, 500),
      ],
      checkpoints: [
        rect(1130, 408, 28, 50, "cp", { label: "No Return" }),
        rect(2132, 408, 28, 50, "cp", { label: "Free Flag", explosive: true }),
      ],
      traps: [
        cloudTrap("soft-cloud", 610, 698, 86, 124, 64, 60),
        crumbly("quiet-bridge", 1225, 1308, 458, 116, 38),
        hiddenSaw("floor-smile", 1660, 1730, 430, 92, 28),
        cloudTrap("wide-cloud", 2210, 2260, 88, 142, 72, 80),
      ],
      door: rect(2972, 386, 44, 72, "door"),
    },
    {
      name: "Fase 3",
      width: 3320,
      spawn: { x: 58, y: 397, label: "Start" },
      solids: [
        rect(0, 458, 500, 38, "grass"),
        rect(610, 458, 500, 38, "grass"),
        rect(1240, 458, 460, 38, "grass"),
        rect(1810, 458, 450, 38, "grass"),
        rect(2380, 458, 820, 38, "grass"),
      ],
      hazards: [
        rect(500, 496, 110, 80, "pit"),
        spikePit(516, 496, 76, 112, 3000, 400),
        rect(1110, 496, 130, 80, "pit"),
        spikePit(1128, 496, 94, 128, 3800, 900),
        rect(1700, 496, 110, 80, "pit"),
        spikePit(1715, 496, 80, 116, 3300, 1800),
        rect(2260, 496, 120, 80, "pit"),
      ],
      checkpoints: [
        rect(1320, 408, 28, 50, "cp", { label: "Fuse" }),
        rect(2500, 408, 28, 50, "cp", { label: "Smoke" }),
      ],
      traps: [
        cloudTrap("final-cloud", 740, 806, 86, 132, 66, 65),
        crumbly("final-bridge", 1900, 2030, 458, 120, 38),
        hiddenSaw("final-saw", 2650, 2730, 430, 92, 28),
      ],
      bomb: {
        x: 1540,
        y: 394,
        w: 58,
        h: 64,
        speed: 1.25,
        state: "chase",
        stateStarted: 0,
        countdownMs: 5000,
        blastRadius: 158,
        secondBlastMs: 520,
        activeAfterX: 1420,
      },
      door: rect(3124, 386, 44, 72, "door"),
    },
  ];
}

function spikePit(x, bottom, w, maxH, period, offset) {
  return rect(x, bottom, w, 0, "spikes", {
    cycling: true,
    bottom,
    minH: 0,
    maxH,
    period,
    offset,
  });
}

function cloudTrap(id, triggerX, x, y, w, h, delay) {
  return {
    id,
    trigger: rect(triggerX, 0, 80, H),
    block: rect(x, y, w, h, "falling"),
    start: rect(x, y, w, h, "falling"),
    vx: 0,
    vy: 0,
    delay,
    activeAt: 0,
  };
}

function hiddenSaw(id, triggerX, x, y, w, h) {
  return {
    id,
    trigger: rect(triggerX, 0, 96, H),
    block: rect(x, y, w, h, "hiddenSaw"),
    start: rect(x, y, w, h, "hiddenSaw"),
    armed: false,
  };
}

function crumbly(id, triggerX, x, y, w, h) {
  return {
    id,
    trigger: rect(triggerX, 0, 70, H),
    block: rect(x, y, w, h, "crumbly"),
    start: rect(x, y, w, h, "crumbly"),
    activeAt: 0,
  };
}

function cloneRect(item) {
  return { ...item };
}

function cloneTrap(trap) {
  return {
    ...trap,
    trigger: cloneRect(trap.trigger),
    block: cloneRect(trap.start),
    start: cloneRect(trap.start),
    vx: 0,
    vy: 0,
    armed: false,
    activeAt: 0,
  };
}

function cloneLevel(definition) {
  return {
    ...definition,
    spawn: { ...definition.spawn },
    solids: definition.solids.map(cloneRect),
    hazards: definition.hazards.map(cloneRect),
    checkpoints: definition.checkpoints.map(cloneRect),
    traps: definition.traps.map(cloneTrap),
    door: cloneRect(definition.door),
    bomb: definition.bomb ? { ...definition.bomb, state: "chase", stateStarted: performance.now() } : null,
  };
}

function inputDown(code) {
  return keys.has(code) || touch.has(code);
}

function setHudVisible(visible) {
  const visibility = visible ? "visible" : "hidden";
  statusEl.style.visibility = visibility;
  timerEl.style.visibility = visibility;
  deathsEl.style.visibility = visibility;
}

function startGame() {
  state.mode = "game";
  state.won = false;
  state.deaths = 0;
  state.finalStats = null;
  state.levelIndex = 0;
  state.startTime = performance.now();
  deathsEl.textContent = "Deaths: 0";
  loadLevel(0);
  playTone(220, 0.08);
}

function loadLevel(index) {
  state.levelIndex = index;
  state.level = cloneLevel(levelDefinitions[index]);
  state.triggered.clear();
  state.cameraX = 0;
  state.shake = 0;
  state.flash = 0;
  player.checkpoint = { ...state.level.spawn };
  reset(false);
}

function reset(toCheckpoint = true) {
  const spawn = toCheckpoint ? player.checkpoint : state.level.spawn;
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.deadUntil = performance.now() + 250;
  state.triggered.clear();
  state.shake = 8;
  state.flash = 0;

  for (const cp of state.level.checkpoints) cp.exploded = false;
  for (const trap of state.level.traps) {
    trap.vx = 0;
    trap.vy = 0;
    trap.armed = false;
    trap.activeAt = 0;
    Object.assign(trap.block, cloneRect(trap.start));
  }
  if (state.level.bomb) {
    const bomb = state.level.bomb;
    bomb.x = levelDefinitions[state.levelIndex].bomb.x;
    bomb.y = levelDefinitions[state.levelIndex].bomb.y;
    bomb.state = "chase";
    bomb.stateStarted = performance.now();
    bomb.active = false;
  }
  statusEl.textContent = `${state.level.name} - Checkpoint: ${spawn.label}`;
}

function kill() {
  if (player.deadUntil > performance.now() || state.mode !== "game" || state.won) return;
  state.deaths += 1;
  deathsEl.textContent = `Deaths: ${state.deaths}`;
  playTone(90, 0.16);
  reset(true);
}

function completeLevel() {
  playTone(520, 0.12);
  if (state.levelIndex < levelDefinitions.length - 1) {
    loadLevel(state.levelIndex + 1);
    return;
  }
  state.finalStats = {
    deaths: state.deaths,
    timeMs: performance.now() - state.startTime,
  };
  state.won = true;
  state.mode = "win";
  statusEl.textContent = "Cycle complete";
}

function update(dt, now) {
  const step = dt / FRAME_MS;

  if (state.mode === "menu" || state.mode === "closed") {
    updateMenuInput();
    return;
  }
  if (state.mode === "paused") {
    updatePauseInput();
    return;
  }
  if (state.mode === "win") {
    if (inputDown("Enter") || inputDown("Space")) state.mode = "menu";
    return;
  }

  const left = inputDown("ArrowLeft") || inputDown("KeyA");
  const right = inputDown("ArrowRight") || inputDown("KeyD");
  const run = inputDown("ShiftLeft") || inputDown("ShiftRight") || inputDown("Run");
  const jump = inputDown("Space") || inputDown("ArrowUp") || inputDown("KeyW");
  const speed = run ? 5.2 : 3.25;

  if (left) {
    player.vx = Math.max(player.vx - 0.9 * step, -speed);
    player.facing = -1;
  } else if (right) {
    player.vx = Math.min(player.vx + 0.9 * step, speed);
    player.facing = 1;
  } else {
    player.vx *= Math.pow(0.76, step);
    if (Math.abs(player.vx) < 0.04) player.vx = 0;
  }

  if (jump && player.grounded) {
    player.vy = -13.2;
    player.grounded = false;
    playTone(310, 0.04);
  }

  player.vy = Math.min(player.vy + GRAVITY * step, 15);
  move(player.vx * step, 0);
  move(0, player.vy * step);

  for (const cp of state.level.checkpoints) {
    if (!overlaps(player, cp)) continue;
    if (cp.explosive && !cp.exploded) {
      cp.exploded = true;
      kill();
      state.flash = 18;
      state.shake = 18;
      continue;
    }
    player.checkpoint = { x: cp.x + 5, y: cp.y - player.h, label: cp.label };
    statusEl.textContent = `${state.level.name} - Checkpoint: ${cp.label}`;
  }

  for (const trap of state.level.traps) updateTrap(trap, now, step);
  for (const hazard of state.level.hazards) updateHazard(hazard, now);
  if (state.level.bomb) updateBomb(state.level.bomb, now, step);

  for (const hazard of state.level.hazards) {
    if (hazard.type === "spikes" && hazard.h <= 4) continue;
    if (overlaps(player, hazard)) kill();
  }
  for (const trap of state.level.traps) {
    if (trap.block.type === "hiddenSaw" && !trap.armed) continue;
    if ((trap.block.type === "falling" || trap.block.type === "hiddenSaw") && overlaps(player, trap.block)) kill();
  }
  if (player.y > H + 120) kill();
  if (overlaps(player, state.level.door)) completeLevel();

  state.cameraX = clamp(player.x - W * 0.38, 0, state.level.width - W);
  state.shake = Math.max(0, state.shake - dt * 0.05);
  state.flash = Math.max(0, state.flash - dt * 0.08);
  player.frame += (Math.abs(player.vx) * 0.08 + (player.grounded ? 0 : 0.04)) * step;
}

function updateMenuInput() {
  if (!pointer.clicked) return;
  const clicked = menuButtons.find((button) => pointInRect(pointer, button));
  pointer.clicked = false;
  if (!clicked) return;
  if (clicked.id === "play") startGame();
  if (clicked.id === "volume") cycleVolume();
  if (clicked.id === "exit") {
    state.mode = "closed";
    state.menuMessage = "Obrigado por jogar. Pode fechar a aba.";
    playTone(120, 0.08);
    window.close();
  }
}

function updatePauseInput() {
  if (!pointer.clicked) return;
  const clicked = pauseButtons.find((button) => pointInRect(pointer, button));
  pointer.clicked = false;
  if (!clicked) return;
  state.mode = "menu";
  state.menuMessage = "";
  playTone(140, 0.08);
}

function updateTrap(trap, now, step) {
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
    trap.vx = clamp((trap.vx || 0) + direction * 0.9 * step, -8.6, 8.6);
    trap.vy = Math.min((trap.vy || 3.5) + 1.75 * step, 24);
    trap.block.x += trap.vx * step;
    trap.block.y += trap.vy * step;
  }

  if (trap.block.type === "crumbly") {
    trap.block.y += 7 * step;
    trap.block.h = Math.max(0, trap.block.h - 1 * step);
  }
}

function updateHazard(hazard, now) {
  if (!hazard.cycling) return;
  const position = (now + hazard.offset) % hazard.period;
  const safe = hazard.period * 0.34;
  const grow = hazard.period * 0.2;
  const high = hazard.period * 0.26;
  let t = 0;

  if (position < safe) t = 0;
  else if (position < safe + grow) t = (position - safe) / grow;
  else if (position < safe + grow + high) t = 1;
  else t = 1 - (position - safe - grow - high) / (hazard.period - safe - grow - high);

  const eased = t * t * (3 - 2 * t);
  hazard.h = Math.round(hazard.minH + (hazard.maxH - hazard.minH) * eased);
  hazard.y = hazard.bottom - hazard.h;
}

function updateBomb(bomb, now, step) {
  if (!bomb.active && player.x >= bomb.activeAfterX) {
    bomb.active = true;
    bomb.stateStarted = now;
  }
  if (!bomb.active) return;
  const elapsed = now - bomb.stateStarted;
  const playerCenter = player.x + player.w / 2;
  const bombCenter = bomb.x + bomb.w / 2;

  if (bomb.state === "chase") {
    bomb.x += Math.sign(playerCenter - bombCenter) * bomb.speed * step;
    bomb.countdownMs = Math.max(0, 5000 - elapsed);
    if (bomb.countdownMs <= 0) explodeBomb(bomb, now, "fakeout");
  } else if (bomb.state === "fakeout") {
    if (elapsed > 620) {
      bomb.state = "return";
      bomb.stateStarted = now;
      bomb.x = clamp(player.x - 132, 0, state.level.width - bomb.w);
      bomb.y = 394;
      bomb.countdownMs = bomb.secondBlastMs;
      state.flash = 10;
    }
  } else if (bomb.state === "return") {
    bomb.x += Math.sign(playerCenter - bombCenter) * (bomb.speed * 1.4) * step;
    bomb.countdownMs = Math.max(0, bomb.secondBlastMs - elapsed);
    if (bomb.countdownMs <= 0) explodeBomb(bomb, now, "chase");
  }

  if (bomb.state !== "fakeout" && overlaps(player, bomb)) {
    kill();
    return;
  }
}

function explodeBomb(bomb, now, nextState) {
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;
  const bx = bomb.x + bomb.w / 2;
  const by = bomb.y + bomb.h / 2;
  const distance = Math.hypot(px - bx, py - by);
  state.flash = 22;
  state.shake = 18;
  playTone(55, 0.18);
  if (distance < bomb.blastRadius) {
    kill();
    state.flash = 22;
    state.shake = 18;
    return;
  }
  bomb.state = nextState;
  bomb.stateStarted = now;
  bomb.countdownMs = nextState === "chase" ? 5000 : bomb.secondBlastMs;
  if (nextState === "chase") {
    bomb.x = clamp(player.x - 220, 0, state.level.width - bomb.w);
    bomb.y = 394;
  }
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
  player.x = clamp(player.x, 0, state.level.width - player.w);
}

function activeSolids() {
  const trapSolids = state.level.traps
    .filter((trap) => trap.block.type !== "hiddenSaw" && trap.block.h > 0 && trap.block.y < H + 80)
    .map((trap) => trap.block);
  return state.level.solids.concat(trapSolids);
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function pointInRect(point, box) {
  return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function draw(now) {
  setHudVisible(state.mode === "game" || state.mode === "paused");
  touchControlsEl.style.visibility = state.mode === "game" ? "visible" : "hidden";
  ctx.clearRect(0, 0, W, H);
  if (state.mode === "menu" || state.mode === "closed") {
    drawMenu(now);
    return;
  }
  if (state.mode === "win") {
    drawWin(now);
    return;
  }

  const shakeX = state.shake ? (Math.random() - 0.5) * state.shake : 0;
  const shakeY = state.shake ? (Math.random() - 0.5) * state.shake : 0;
  ctx.save();
  ctx.translate(Math.round(-state.cameraX + shakeX), Math.round(shakeY));
  drawBackground(now);
  drawTiles();
  drawDoor(state.level.door);
  drawCheckpoints();
  if (state.level.bomb) drawBomb(state.level.bomb);
  drawPlayer(now);
  drawStartHint(now);
  ctx.restore();
  drawOverlay();
}

function drawMenu(now) {
  ctx.fillStyle = "#071018";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#0d2d3e";
  for (let i = 0; i < 18; i += 1) {
    const x = (i * 120 + now * 0.035) % (W + 160) - 100;
    const y = 80 + Math.sin(now * 0.001 + i) * 34 + (i % 3) * 54;
    drawMenuCloud(x, y, 1 + (i % 2) * 0.25);
  }
  ctx.fillStyle = "#05080c";
  ctx.fillRect(0, 464, W, 76);
  ctx.fillStyle = "#3e7f4f";
  ctx.fillRect(0, 448, W, 28);
  ctx.fillStyle = "#e7edf2";
  ctx.font = "700 76px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("CYCLELIFE", W / 2, 182);
  ctx.fillStyle = "#ffd166";
  ctx.font = "18px Courier New";
  ctx.fillText("3 fases. 1 vida. O cenario nao e seu amigo.", W / 2, 220);

  for (const button of menuButtons) {
    const hover = pointInRect(pointer, button);
    ctx.fillStyle = hover ? "#ffd166" : "#121820";
    ctx.fillRect(button.x, button.y, button.w, button.h);
    ctx.strokeStyle = hover ? "#e7edf2" : "#4e6375";
    ctx.lineWidth = 3;
    ctx.strokeRect(button.x, button.y, button.w, button.h);
    ctx.fillStyle = hover ? "#05080c" : "#e7edf2";
    ctx.font = "700 22px Courier New";
    const label = button.id === "volume" ? `Volume ${audio.labels[audio.index]}` : button.label;
    ctx.fillText(label, button.x + button.w / 2, button.y + 31);
  }

  if (state.menuMessage) {
    ctx.fillStyle = "#ff3864";
    ctx.font = "16px Courier New";
    ctx.fillText(state.menuMessage, W / 2, 488);
  }
}

function drawMenuCloud(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#d7e6ee";
  ctx.fillRect(10, 22, 86, 22);
  ctx.fillRect(26, 10, 26, 22);
  ctx.fillRect(50, 4, 30, 28);
  ctx.fillStyle = "#9fb7c6";
  ctx.fillRect(10, 40, 86, 6);
  ctx.restore();
}

function drawWin() {
  drawMenu(performance.now());
  ctx.fillStyle = "rgba(5, 8, 12, 0.78)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#a6ff3d";
  ctx.font = "700 44px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("CYCLE COMPLETE", W / 2, 240);
  ctx.fillStyle = "#e7edf2";
  ctx.font = "18px Courier New";
  const stats = state.finalStats || { deaths: state.deaths, timeMs: performance.now() - state.startTime };
  ctx.fillText(`Mortes: ${stats.deaths}`, W / 2, 286);
  ctx.fillText(`Tempo: ${formatTime(stats.timeMs)}`, W / 2, 316);
  ctx.fillStyle = "#8ea2b1";
  ctx.font = "16px Courier New";
  ctx.fillText("Pressione Enter ou Espaco para voltar ao menu", W / 2, 358);
}

function drawBackground(now) {
  ctx.fillStyle = state.levelIndex === 2 ? "#1a1a2f" : "#092334";
  ctx.fillRect(state.cameraX, 0, W, H);
  ctx.fillStyle = state.levelIndex === 2 ? "#4e2448" : "#123e4f";
  for (let x = Math.floor(state.cameraX / 96) * 96; x < state.cameraX + W + 96; x += 96) {
    ctx.fillRect(x, 104 + ((x / 96) % 3) * 18, 48, 12);
    ctx.fillRect(x + 20, 122 + ((x / 96) % 3) * 18, 34, 10);
  }
  ctx.fillStyle = "#071018";
  ctx.fillRect(state.cameraX, 496, W, 80);
}

function drawTiles() {
  for (const solid of activeSolids()) drawBlock(solid);
  for (const hazard of state.level.hazards) drawHazard(hazard);
  for (const trap of state.level.traps) {
    if (trap.block.type === "hiddenSaw" && trap.armed) drawHazard(trap.block);
  }
}

function drawBlock(block) {
  if (block.type === "falling") {
    drawCloudTrap(block);
    return;
  }

  ctx.fillStyle = "#3e7f4f";
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

function drawCloudTrap(block) {
  ctx.fillStyle = "#d7e6ee";
  ctx.fillRect(block.x + 18, block.y + 26, block.w - 28, 30);
  ctx.fillRect(block.x + 34, block.y + 12, 36, 28);
  ctx.fillRect(block.x + 68, block.y + 6, 42, 34);
  ctx.fillRect(block.x + 94, block.y + 22, 32, 26);
  ctx.fillStyle = "#9fb7c6";
  ctx.fillRect(block.x + 18, block.y + 50, block.w - 28, 8);
  ctx.fillRect(block.x + 46, block.y + 34, 16, 6);
  ctx.fillRect(block.x + 88, block.y + 30, 18, 6);
  ctx.fillStyle = "#263746";
  ctx.fillRect(block.x + 40, block.y + 44, 10, 5);
  ctx.fillRect(block.x + block.w - 50, block.y + 44, 10, 5);
  ctx.fillStyle = "#ff3864";
  ctx.fillRect(block.x + block.w / 2 - 5, block.y + block.h - 4, 10, 8);
}

function drawHazard(h) {
  if (h.type === "spikes" && h.h <= 2) {
    ctx.fillStyle = "#4d1826";
    ctx.fillRect(h.x, h.bottom - 4, h.w, 4);
    return;
  }

  ctx.fillStyle = h.type === "pit" ? "#05080c" : "#8d1730";
  ctx.fillRect(h.x, h.y, h.w, h.h);
  ctx.fillStyle = h.cycling && h.h > h.maxH * 0.7 ? "#ffd166" : "#ff3864";
  for (let x = h.x; x < h.x + h.w; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, h.y + h.h);
    ctx.lineTo(x + 8, h.y);
    ctx.lineTo(x + 16, h.y + h.h);
    ctx.fill();
  }
}

function drawCheckpoints() {
  for (const cp of state.level.checkpoints) {
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

function drawDoor(door) {
  ctx.fillStyle = "#17100c";
  ctx.fillRect(door.x, door.y, door.w, door.h);
  ctx.fillStyle = "#835531";
  ctx.fillRect(door.x + 6, door.y + 6, door.w - 12, door.h - 6);
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(door.x + door.w - 14, door.y + 36, 5, 5);
}

function drawBomb(bomb) {
  if (!bomb.active) return;
  const screenX = bomb.x - state.cameraX;
  const offscreen = screenX < -bomb.w || screenX > W;
  if (offscreen) {
    const markerX = clamp(screenX, 18, W - 42) + state.cameraX;
    ctx.fillStyle = "#ff3864";
    ctx.fillRect(markerX, 388, 24, 24);
    ctx.fillStyle = "#ffd166";
    ctx.font = "700 16px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("!", markerX + 12, 407);
    return;
  }
  if (bomb.state === "fakeout") {
    ctx.fillStyle = "#2a1a20";
    ctx.fillRect(bomb.x - 22, bomb.y + 28, bomb.w + 44, 20);
    ctx.fillStyle = "#ff3864";
    ctx.fillRect(bomb.x + 18, bomb.y + 16, 22, 22);
    return;
  }
  ctx.fillStyle = "#111820";
  ctx.fillRect(bomb.x + 7, bomb.y + 12, bomb.w - 14, bomb.h - 8);
  ctx.fillRect(bomb.x + 14, bomb.y + 2, bomb.w - 28, 14);
  ctx.fillStyle = "#31475b";
  ctx.fillRect(bomb.x + 13, bomb.y + 18, bomb.w - 26, bomb.h - 22);
  ctx.fillStyle = "#ff3864";
  ctx.fillRect(bomb.x + 24, bomb.y - 8, 10, 12);
  ctx.fillStyle = "#ffd166";
  ctx.font = "700 20px Courier New";
  ctx.textAlign = "center";
  const count = Math.ceil(bomb.countdownMs / 1000);
  ctx.fillText(String(Math.max(1, count)), bomb.x + bomb.w / 2, bomb.y + 44);
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

function drawStartHint(now) {
  if (state.levelIndex !== 0 || player.x > state.level.spawn.x + 135) return;
  const alpha = clamp(1 - Math.max(0, player.x - state.level.spawn.x - 70) / 65, 0, 1);
  const x = state.level.spawn.x + 78;
  const y = 306 + Math.sin(now * 0.003) * 3;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(5, 8, 12, 0.78)";
  ctx.fillRect(x, y, 316, 56);
  ctx.strokeStyle = "#ffd166";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, 316, 56);
  ctx.fillStyle = "#e7edf2";
  ctx.font = "700 14px Courier New";
  ctx.textAlign = "left";
  ctx.fillText("A/D ou setas: andar", x + 14, y + 22);
  ctx.fillText("Espaco: pular   Shift: correr", x + 14, y + 42);
  ctx.globalAlpha = 1;
}

function drawOverlay() {
  if (state.flash > 0) {
    ctx.fillStyle = `rgba(255, 56, 100, ${Math.min(0.34, state.flash / 30)})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (state.mode !== "paused") return;
  ctx.fillStyle = "rgba(5, 8, 12, 0.68)";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#e7edf2";
  ctx.font = "700 44px Courier New";
  ctx.textAlign = "center";
  ctx.fillText("PAUSE", W / 2, 272);
  ctx.font = "16px Courier New";
  ctx.fillStyle = "#8ea2b1";
  ctx.fillText("ESC para continuar", W / 2, 306);

  for (const button of pauseButtons) {
    const hover = pointInRect(pointer, button);
    ctx.fillStyle = hover ? "#ffd166" : "#121820";
    ctx.fillRect(button.x, button.y, button.w, button.h);
    ctx.strokeStyle = hover ? "#e7edf2" : "#4e6375";
    ctx.lineWidth = 3;
    ctx.strokeRect(button.x, button.y, button.w, button.h);
    ctx.fillStyle = hover ? "#05080c" : "#e7edf2";
    ctx.font = "700 22px Courier New";
    ctx.fillText(button.label, button.x + button.w / 2, button.y + 31);
  }
}

function cycleVolume() {
  audio.index = (audio.index + 1) % audio.labels.length;
  audio.volume = [1, 0.5, 0][audio.index];
  playTone(220 + audio.index * 90, 0.06);
}

function playTone(frequency, duration) {
  if (audio.volume <= 0) return;
  try {
    audio.context ||= new AudioContext();
    const oscillator = audio.context.createOscillator();
    const gain = audio.context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = "square";
    gain.gain.value = audio.volume * 0.035;
    oscillator.connect(gain);
    gain.connect(audio.context.destination);
    oscillator.start();
    oscillator.stop(audio.context.currentTime + duration);
  } catch {
    // Browsers can block audio until user interaction; gameplay continues silently.
  }
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
  if (state.mode === "game") timerEl.textContent = formatTime(now - state.startTime);
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  keys.add(event.code);
  if (event.code === "Escape" && !event.repeat) {
    if (state.mode === "game") {
      state.mode = "paused";
      pointer.clicked = false;
      playTone(170, 0.05);
    } else if (state.mode === "paused") {
      state.mode = "game";
      pointer.clicked = false;
      playTone(260, 0.05);
    }
  }
  if (state.mode === "menu" && (event.code === "Enter" || event.code === "Space")) startGame();
  if (event.code === "KeyR" && state.mode === "game") {
    state.won = false;
    state.deaths = 0;
    state.startTime = performance.now();
    loadLevel(0);
    deathsEl.textContent = "Deaths: 0";
  }
});

window.addEventListener("keyup", (event) => keys.delete(event.code));

canvas.addEventListener("pointermove", (event) => {
  const bounds = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * W;
  pointer.y = ((event.clientY - bounds.top) / bounds.height) * H;
});

canvas.addEventListener("pointerdown", (event) => {
  const bounds = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * W;
  pointer.y = ((event.clientY - bounds.top) / bounds.height) * H;
  pointer.clicked = true;
});

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

requestAnimationFrame(loop);
