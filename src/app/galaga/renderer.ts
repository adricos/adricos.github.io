// -------------------------------------------------------------
// Pure Vector Canvas Renderer (SRP: Drawing & Visual Representation)
// -------------------------------------------------------------

import type { FlagshipBoss, PowerUp, PowerUpType } from "./types";

export function drawVectorPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isFlicker: boolean,
  isDual: boolean,
  hasShieldActive: boolean
) {
  if (isFlicker) return;

  const drawShip = (offsetX: number) => {
    ctx.save();
    ctx.translate(x + offsetX, y);

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.2;
    ctx.shadowColor = "#0284c7";
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(0, -18);
    ctx.lineTo(8, -4);
    ctx.lineTo(16, 12);
    ctx.lineTo(11, 14);
    ctx.lineTo(6, 6);
    ctx.lineTo(5, 14);
    ctx.lineTo(-5, 14);
    ctx.lineTo(-6, 6);
    ctx.lineTo(-11, 14);
    ctx.lineTo(-16, 12);
    ctx.lineTo(-8, -4);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(3, -2);
    ctx.lineTo(0, 4);
    ctx.lineTo(-3, -2);
    ctx.closePath();
    ctx.stroke();

    const thrust = 4 + Math.random() * 8;
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3, 14);
    ctx.lineTo(-3, 14 + thrust);
    ctx.moveTo(3, 14);
    ctx.lineTo(3, 14 + thrust);
    ctx.stroke();

    ctx.restore();
  };

  if (isDual) {
    drawShip(-22);
    drawShip(22);
  } else {
    drawShip(0);
  }

  // Energy Shield Bubble
  if (hasShieldActive) {
    ctx.save();
    ctx.translate(x, y);
    const radius = isDual ? 42 : 26;
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#22d3ee";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    const start = (performance.now() * 0.004) % (Math.PI * 2);
    ctx.arc(0, 0, radius, start, start + Math.PI * 0.5);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawVectorBoss(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  health: number,
  wingPhase: number
) {
  ctx.save();
  ctx.translate(x, y);
  const isDamaged = health === 1;
  ctx.strokeStyle = isDamaged ? "#10b981" : "#eab308";
  ctx.lineWidth = 2;
  ctx.shadowColor = isDamaged ? "#059669" : "#ca8a04";
  ctx.shadowBlur = 8;

  const flap = Math.sin(wingPhase) * 3;
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(12 + flap, -6);
  ctx.lineTo(16 + flap, 6);
  ctx.lineTo(8, 12);
  ctx.lineTo(0, 8);
  ctx.lineTo(-8, 12);
  ctx.lineTo(-16 - flap, 6);
  ctx.lineTo(-12 - flap, -6);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = "#38bdf8";
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(5, 0);
  ctx.lineTo(0, 6);
  ctx.lineTo(-5, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

export function drawVectorButterfly(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  wingPhase: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#dc2626";
  ctx.shadowBlur = 8;

  const wing = Math.sin(wingPhase) * 6;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(8 + wing, -12);
  ctx.lineTo(14 + wing, 0);
  ctx.lineTo(6, 8);
  ctx.lineTo(0, 4);
  ctx.lineTo(-6, 8);
  ctx.lineTo(-14 - wing, 0);
  ctx.lineTo(-8 - wing, -12);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(0, 6);
  ctx.stroke();
  ctx.restore();
}

export function drawVectorWasp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  wingPhase: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#06b6d4";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#0891b2";
  ctx.shadowBlur = 8;

  const flutter = Math.sin(wingPhase) * 2;
  ctx.beginPath();
  ctx.moveTo(0, 12);
  ctx.lineTo(8, -2 + flutter);
  ctx.lineTo(12, -8);
  ctx.lineTo(0, -12);
  ctx.lineTo(-12, -8);
  ctx.lineTo(-8, -2 + flutter);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = "#facc15";
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(0, 14);
  ctx.stroke();
  ctx.restore();
}

export function drawTractorBeam(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  targetHeight: number
) {
  ctx.save();
  ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 14;

  const spread = 90;
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX - spread, targetHeight);
  ctx.lineTo(startX + spread, targetHeight);
  ctx.closePath();
  ctx.stroke();

  const t = performance.now() * 0.005;
  for (let y = startY + 20; y < targetHeight; y += 24) {
    const span = ((y - startY) / (targetHeight - startY)) * spread;
    const waveOffset = Math.sin(t + y * 0.05) * 6;
    ctx.strokeStyle = `rgba(147, 197, 253, ${0.3 + Math.sin(t * 2 + y) * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(startX - span + waveOffset, y);
    ctx.lineTo(startX + span + waveOffset, y);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawFlagshipBoss(ctx: CanvasRenderingContext2D, boss: FlagshipBoss) {
  ctx.save();
  ctx.translate(boss.x, boss.y);

  ctx.strokeStyle = "#a855f7";
  ctx.lineWidth = 3;
  ctx.shadowColor = "#9333ea";
  ctx.shadowBlur = 16;

  ctx.beginPath();
  ctx.moveTo(0, 50);
  ctx.lineTo(45, 25);
  ctx.lineTo(110, 40);
  ctx.lineTo(120, -20);
  ctx.lineTo(60, -45);
  ctx.lineTo(0, -35);
  ctx.lineTo(-60, -45);
  ctx.lineTo(-120, -20);
  ctx.lineTo(-110, 40);
  ctx.lineTo(-45, 25);
  ctx.closePath();
  ctx.stroke();

  if (boss.turretLeftHealth > 0) {
    ctx.strokeStyle = "#ec4899";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-80, 15, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.moveTo(-80, 15);
    ctx.lineTo(-80, 36);
    ctx.stroke();
  }

  if (boss.turretRightHealth > 0) {
    ctx.strokeStyle = "#ec4899";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(80, 15, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.moveTo(80, 15);
    ctx.lineTo(80, 36);
    ctx.stroke();
  }

  ctx.strokeStyle = boss.shieldActive ? "#06b6d4" : "#ef4444";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.stroke();

  if (boss.shieldActive) {
    ctx.strokeStyle = "#ffffff";
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    const pulse = 10 + Math.sin(performance.now() * 0.01) * 4;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(0, 0, pulse, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawPowerUp(ctx: CanvasRenderingContext2D, p: PowerUp) {
  ctx.save();
  ctx.translate(p.x, p.y);
  p.spin += 0.04;

  const colors: Record<PowerUpType, string> = {
    spread: "#38bdf8",
    plasma: "#a855f7",
    rapid: "#f59e0b",
    shield: "#10b981",
    bomb: "#ef4444",
    dual: "#f43f5e",
  };

  const color = colors[p.type];
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  ctx.rotate(p.spin);
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(10, 0);
  ctx.lineTo(0, 12);
  ctx.lineTo(-10, 0);
  ctx.closePath();
  ctx.stroke();

  ctx.rotate(-p.spin);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const labels: Record<PowerUpType, string> = {
    spread: "S",
    plasma: "P",
    rapid: "R",
    shield: "D",
    bomb: "B",
    dual: "2X",
  };
  ctx.fillText(labels[p.type], 0, 0);

  ctx.restore();
}
