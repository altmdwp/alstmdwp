const canvas = document.getElementById("legionCanvas");
const ctx = canvas.getContext("2d");

const DPR = Math.max(1, window.devicePixelRatio || 1);
const BASE_WIDTH = 980;
const BASE_HEIGHT = 720;

const core = {
  x: BASE_WIDTH / 2,
  y: BASE_HEIGHT / 2,
  radius: 64,
  pulse: 0,
};

const cellCount = 40;
const cells = Array.from({ length: cellCount }, (_, index) => {
  const angle = (Math.PI * 2 * index) / cellCount;
  const distance = 175 + Math.random() * 120;
  const orbitSpeed = 0.0018 + Math.random() * 0.0018;

  return {
    angle,
    distance,
    orbitSpeed,
    radius: 6 + Math.random() * 6,
    phase: Math.random() * Math.PI * 2,
    spikeCount: 8 + Math.floor(Math.random() * 6),
    linkAlpha: 0.28 + Math.random() * 0.32,
  };
});

function resize() {
  const rect = canvas.getBoundingClientRect();
  const width = Math.floor(rect.width * DPR);
  const height = Math.floor((rect.width * (BASE_HEIGHT / BASE_WIDTH)) * DPR);

  canvas.width = width;
  canvas.height = height;
  ctx.setTransform(width / BASE_WIDTH, 0, 0, height / BASE_HEIGHT, 0, 0);
}

function drawBackground(time) {
  const gradient = ctx.createRadialGradient(
    core.x,
    core.y,
    20,
    core.x,
    core.y,
    520
  );
  gradient.addColorStop(0, "rgba(40, 78, 134, 0.22)");
  gradient.addColorStop(0.45, "rgba(13, 30, 62, 0.55)");
  gradient.addColorStop(1, "rgba(3, 8, 20, 0.94)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

  for (let i = 0; i < 80; i += 1) {
    const noise = Math.sin(time * 0.0003 + i * 133.7) * 0.5 + 0.5;
    const x = (i * 97.23) % BASE_WIDTH;
    const y = (i * 53.47 + time * 0.02) % BASE_HEIGHT;
    ctx.fillStyle = `rgba(120, 178, 255, ${0.03 + noise * 0.05})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.2 + noise * 1.7, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCore(time) {
  core.pulse = Math.sin(time * 0.003) * 0.5 + 0.5;

  ctx.save();
  ctx.translate(core.x, core.y);

  const outerRadius = core.radius + core.pulse * 14;

  ctx.beginPath();
  ctx.arc(0, 0, outerRadius + 22, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(81, 245, 255, 0.09)";
  ctx.fill();

  const radial = ctx.createRadialGradient(0, 0, 8, 0, 0, outerRadius);
  radial.addColorStop(0, "rgba(218, 245, 255, 0.95)");
  radial.addColorStop(0.35, "rgba(79, 202, 255, 0.8)");
  radial.addColorStop(1, "rgba(13, 46, 88, 0.85)");

  ctx.beginPath();
  ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
  ctx.fillStyle = radial;
  ctx.fill();

  ctx.strokeStyle = "rgba(130, 250, 255, 0.75)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, outerRadius + 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(230, 250, 255, 0.85)";
  ctx.font = "700 18px Pretendard, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("CORE AI", 0, 0);

  ctx.restore();
}

function drawCell(cell, time) {
  const orbitWave = Math.sin(time * 0.0014 + cell.phase) * 16;
  const distance = cell.distance + orbitWave;
  const x = core.x + Math.cos(cell.angle) * distance;
  const y = core.y + Math.sin(cell.angle) * distance;

  ctx.strokeStyle = `rgba(99, 189, 255, ${cell.linkAlpha})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(core.x, core.y);
  ctx.lineTo(x, y);
  ctx.stroke();

  ctx.save();
  ctx.translate(x, y);

  const pulse = Math.sin(time * 0.004 + cell.phase) * 0.4 + 0.6;
  const bodyRadius = cell.radius + pulse * 2;

  ctx.beginPath();
  ctx.arc(0, 0, bodyRadius + 5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(75, 255, 220, 0.18)";
  ctx.fill();

  for (let i = 0; i < cell.spikeCount; i += 1) {
    const a = (Math.PI * 2 * i) / cell.spikeCount + time * 0.0009;
    const spikeLen = bodyRadius + 7 + Math.sin(time * 0.003 + i + cell.phase) * 3;

    ctx.strokeStyle = "rgba(132, 255, 234, 0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * bodyRadius, Math.sin(a) * bodyRadius);
    ctx.lineTo(Math.cos(a) * spikeLen, Math.sin(a) * spikeLen);
    ctx.stroke();
  }

  const cellGradient = ctx.createRadialGradient(0, 0, 1, 0, 0, bodyRadius + 1);
  cellGradient.addColorStop(0, "rgba(208, 255, 242, 0.95)");
  cellGradient.addColorStop(0.6, "rgba(73, 218, 196, 0.9)");
  cellGradient.addColorStop(1, "rgba(15, 76, 75, 0.9)");

  ctx.beginPath();
  ctx.arc(0, 0, bodyRadius, 0, Math.PI * 2);
  ctx.fillStyle = cellGradient;
  ctx.fill();

  ctx.restore();
}

function drawNetworkMesh(time) {
  ctx.lineWidth = 0.8;
  for (let i = 0; i < cells.length; i += 1) {
    const a = cells[i];
    const b = cells[(i + 3) % cells.length];

    const ax = core.x + Math.cos(a.angle) * (a.distance + Math.sin(time * 0.0014 + a.phase) * 16);
    const ay = core.y + Math.sin(a.angle) * (a.distance + Math.sin(time * 0.0014 + a.phase) * 16);
    const bx = core.x + Math.cos(b.angle) * (b.distance + Math.sin(time * 0.0014 + b.phase) * 16);
    const by = core.y + Math.sin(b.angle) * (b.distance + Math.sin(time * 0.0014 + b.phase) * 16);

    ctx.strokeStyle = "rgba(80, 132, 255, 0.12)";
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }
}

function render(time) {
  drawBackground(time);
  drawNetworkMesh(time);

  cells.forEach((cell) => {
    cell.angle += cell.orbitSpeed;
    drawCell(cell, time);
  });

  drawCore(time);
  requestAnimationFrame(render);
}

window.addEventListener("resize", resize);
resize();
requestAnimationFrame(render);
