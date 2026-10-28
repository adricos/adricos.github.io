"use client";

import { useEffect, useRef, useState } from "react";

interface PolarStar {
  r: number; // Normalized radial distance from South Celestial Pole [0..1]
  theta: number; // Polar angle in radians [0..2*PI]
  color?: string;
  size?: number;
}

interface Constellation {
  name: string;
  stars: PolarStar[];
  edges: [number, number][];
}

interface BackgroundStar {
  r: number;
  theta: number;
  size: number;
  baseBrightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

// Authentic Southern Hemisphere Constellations visible from Rosario, Argentina (-33° S, -60.6° W)
const SOUTHERN_CONSTELLATIONS: Constellation[] = [
  {
    name: "La Cruz del Sur (Crux)",
    stars: [
      { r: 0.28, theta: 1.95, size: 3.2, color: "#e0f2fe" }, // Acrux (Alpha Crucis)
      { r: 0.29, theta: 1.83, size: 2.8, color: "#bae6fd" }, // Mimosa (Beta Crucis)
      { r: 0.23, theta: 1.93, size: 2.9, color: "#fdba74" }, // Gacrux (Gamma - Red/orange giant)
      { r: 0.24, theta: 1.84, size: 2.2, color: "#f0f9ff" }, // Imai (Delta Crucis)
      { r: 0.27, theta: 1.90, size: 1.8, color: "#ffffff" }, // Ginan (Epsilon Crucis)
    ],
    edges: [
      [2, 0], // Gacrux to Acrux
      [1, 3], // Mimosa to Imai
    ],
  },
  {
    name: "Los Punteros (Alfa y Beta Centauri)",
    stars: [
      { r: 0.35, theta: 1.68, size: 3.6, color: "#fef08a" }, // Rigil Kentaurus (Alpha Centauri)
      { r: 0.33, theta: 1.74, size: 3.0, color: "#bae6fd" }, // Hadar (Beta Centauri)
      { r: 0.42, theta: 1.76, size: 2.2, color: "#ffffff" }, // Muhlifain
      { r: 0.52, theta: 1.82, size: 2.4, color: "#ffffff" }, // Menkent
    ],
    edges: [
      [0, 1], // The Pointers pointing directly to Crux!
      [1, 2],
      [2, 3],
    ],
  },
  {
    name: "Carina y Canopus",
    stars: [
      { r: 0.38, theta: 2.95, size: 3.8, color: "#ffffff" }, // Canopus (2nd brightest star in the sky!)
      { r: 0.22, theta: 2.70, size: 2.6, color: "#bae6fd" }, // Miaplacidus
      { r: 0.32, theta: 2.60, size: 2.5, color: "#fdba74" }, // Avior
      { r: 0.36, theta: 2.65, size: 2.3, color: "#ffffff" }, // Aspidiske
    ],
    edges: [
      [1, 2],
      [2, 3],
      [3, 0],
    ],
  },
  {
    name: "Escorpión (Scorpius)",
    stars: [
      { r: 0.62, theta: 0.85, size: 3.5, color: "#f87171" }, // Antares (Red supergiant heart of Scorpion)
      { r: 0.68, theta: 0.95, size: 2.4, color: "#bae6fd" }, // Graffias
      { r: 0.65, theta: 0.91, size: 2.5, color: "#bae6fd" }, // Dschubba
      { r: 0.63, theta: 0.96, size: 2.2, color: "#ffffff" }, // Pi Scorpii
      { r: 0.58, theta: 0.78, size: 2.3, color: "#fed7aa" }, // Wei
      { r: 0.52, theta: 0.68, size: 2.5, color: "#ffffff" }, // Sargas
      { r: 0.55, theta: 0.60, size: 2.7, color: "#bae6fd" }, // Shaula (The Stinger)
      { r: 0.56, theta: 0.58, size: 2.1, color: "#ffffff" }, // Lesath
    ],
    edges: [
      [1, 2],
      [2, 3],
      [2, 0],
      [0, 4],
      [4, 5],
      [5, 6],
      [6, 7],
    ],
  },
  {
    name: "Orión (Las Tres Marías)",
    stars: [
      { r: 0.72, theta: 4.25, size: 3.2, color: "#fb923c" }, // Betelgeuse (Red supergiant)
      { r: 0.78, theta: 4.18, size: 2.6, color: "#bae6fd" }, // Bellatrix
      { r: 0.74, theta: 4.35, size: 2.5, color: "#bae6fd" }, // Alnitak
      { r: 0.75, theta: 4.38, size: 2.6, color: "#ffffff" }, // Alnilam (Middle Maria)
      { r: 0.76, theta: 4.41, size: 2.5, color: "#bae6fd" }, // Mintaka
      { r: 0.71, theta: 4.48, size: 2.4, color: "#ffffff" }, // Saiph
      { r: 0.82, theta: 4.42, size: 3.4, color: "#93c5fd" }, // Rigel (Bright blue-white supergiant)
    ],
    edges: [
      [0, 2],
      [1, 4],
      [2, 3], // Las Tres Marías
      [3, 4], // Las Tres Marías
      [2, 5],
      [4, 6],
    ],
  },
  {
    name: "Can Mayor y Sirio",
    stars: [
      { r: 0.65, theta: 3.65, size: 4.0, color: "#e0f2fe" }, // Sirius (Brightest star in the sky!)
      { r: 0.60, theta: 3.52, size: 2.5, color: "#bae6fd" }, // Adhara
      { r: 0.58, theta: 3.58, size: 2.4, color: "#fed7aa" }, // Wezen
      { r: 0.71, theta: 3.72, size: 2.3, color: "#ffffff" }, // Murzim
    ],
    edges: [
      [3, 0],
      [0, 2],
      [2, 1],
    ],
  },
];

// Helper to interpolate between two RGB colors
function lerpColor(
  c1: [number, number, number],
  c2: [number, number, number],
  t: number
): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * clamped),
    Math.round(c1[1] + (c2[1] - c1[1]) * clamped),
    Math.round(c1[2] + (c2[2] - c1[2]) * clamped),
  ];
}

// Compute sky gradient colors and star visibility across 24h cycle
function getSkyParameters(hour: number) {
  const h = ((hour % 24) + 24) % 24;

  let topColor: [number, number, number];
  let bottomColor: [number, number, number];
  let starOpacity = 0;
  let phaseName = "Night";
  let phaseIcon = "✨";

  if (h >= 21 || h < 5.0) {
    // Night in Rosario
    topColor = [3, 7, 18]; // zinc-950
    bottomColor = [15, 23, 42]; // slate-900
    starOpacity = 1;
    phaseName = "Night";
    phaseIcon = "✨";
  } else if (h >= 5.0 && h < 7.5) {
    // Dawn / Sunrise
    const progress = (h - 5.0) / 2.5;
    topColor = lerpColor([3, 7, 18], [56, 189, 248], progress);
    bottomColor = lerpColor([15, 23, 42], [249, 115, 22], Math.min(1, progress * 1.3));
    if (progress > 0.5) {
      bottomColor = lerpColor([249, 115, 22], [254, 215, 170], (progress - 0.5) / 0.5);
    }
    starOpacity = Math.max(0, 1 - progress * 1.4);
    phaseName = "Dawn";
    phaseIcon = "🌅";
  } else if (h >= 7.5 && h < 17.0) {
    // Full Daylight
    topColor = [14, 165, 233]; // sky-500
    bottomColor = [224, 242, 254]; // sky-100
    starOpacity = 0;
    phaseName = "Daylight";
    phaseIcon = "☀️";
  } else {
    // Dusk / Sunset (17.0 .. 21.0)
    const progress = (h - 17.0) / 4.0;
    topColor = lerpColor([14, 165, 233], [3, 7, 18], progress);
    if (progress < 0.5) {
      bottomColor = lerpColor([224, 242, 254], [244, 63, 94], progress * 2);
    } else {
      bottomColor = lerpColor([244, 63, 94], [15, 23, 42], (progress - 0.5) * 2);
    }
    starOpacity = Math.max(0, (progress - 0.25) / 0.75);
    phaseName = "Dusk";
    phaseIcon = "🌇";
  }

  return { topColor, bottomColor, starOpacity, phaseName, phaseIcon, hour: h };
}

export function CelestialSky() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hourRef = useRef<number>(22.5); // Default start: Rosario clear night
  const rotationAngleRef = useRef<number>(0); // Earth rotation angle in radians
  const isAdvancingRef = useRef<boolean>(false);

  const [celestialInfo, setCelestialInfo] = useState<{
    phaseName: string;
    phaseIcon: string;
    formattedTime: string;
    isAdvancing: boolean;
  }>({
    phaseName: "Night",
    phaseIcon: "✨",
    formattedTime: "22:30",
    isAdvancing: false,
  });

  useEffect(() => {
    const handleStart = () => {
      isAdvancingRef.current = true;
      setCelestialInfo((prev) => ({ ...prev, isAdvancing: true }));
    };

    const handleEnd = () => {
      isAdvancingRef.current = false;
      setCelestialInfo((prev) => ({ ...prev, isAdvancing: false }));
    };

    window.addEventListener("celestial-time-advance-start", handleStart);
    window.addEventListener("celestial-time-advance-end", handleEnd);

    return () => {
      window.removeEventListener("celestial-time-advance-start", handleStart);
      window.removeEventListener("celestial-time-advance-end", handleEnd);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("resize", handleResize);

    // 160 Background stars distributed in polar coordinates around South Celestial Pole
    const starColors = ["#ffffff", "#e0f2fe", "#bae6fd", "#fef3c7", "#fed7aa"];
    const backgroundStars: BackgroundStar[] = [];
    const starCount = 160;
    for (let i = 0; i < starCount; i++) {
      backgroundStars.push({
        r: Math.sqrt(Math.random()) * 0.95, // Even polar distribution
        theta: Math.random() * Math.PI * 2,
        size: Math.random() * 1.6 + 0.7,
        baseBrightness: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    let lastTime = performance.now();
    let tickCounter = 0;

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Earth rotation:
      // When idle, smooth slow diurnal rotation (~0.015 rad/sec)
      // When hovering spiral, accelerated rotation linked to advancing hours!
      if (isAdvancingRef.current) {
        const hoursPerSec = 2.8;
        hourRef.current = (hourRef.current + dt * hoursPerSec) % 24;
        rotationAngleRef.current += (hoursPerSec / 24) * Math.PI * 2 * dt;
      } else {
        // Continuous gentle Earth rotation
        rotationAngleRef.current += 0.008 * dt;
      }

      tickCounter++;
      if (tickCounter % 8 === 0) {
        const currentH = Math.floor(hourRef.current);
        const currentM = Math.floor((hourRef.current % 1) * 60);
        const { phaseName, phaseIcon } = getSkyParameters(hourRef.current);
        const formattedTime = `${String(currentH).padStart(2, "0")}:${String(currentM).padStart(2, "0")}`;
        setCelestialInfo((prev) => ({
          ...prev,
          phaseName,
          phaseIcon,
          formattedTime,
        }));
      }

      const { topColor, bottomColor, starOpacity } = getSkyParameters(hourRef.current);

      // 1. Draw Sky Gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, `rgb(${topColor[0]}, ${topColor[1]}, ${topColor[2]})`);
      gradient.addColorStop(1, `rgb(${bottomColor[0]}, ${bottomColor[1]}, ${bottomColor[2]})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Center of Earth's South Celestial Pole rotation (placed slightly below center to mirror Rosario sky)
      const poleX = width * 0.5;
      const poleY = height * 0.62;
      const skyRadius = Math.max(width, height) * 0.85;
      const rot = rotationAngleRef.current;

      // 2. Render Stars & Constellations only when darkness allows
      if (starOpacity > 0.01) {
        // A) Background Twinkling Stars rotating with the Earth
        for (const star of backgroundStars) {
          star.twinklePhase += star.twinkleSpeed;
          const twinkle = (Math.sin(star.twinklePhase) + 1) / 2;
          const alpha = star.baseBrightness * (0.35 + twinkle * 0.65) * starOpacity;

          // Polar to Cartesian with Earth rotation
          const currentTheta = star.theta + rot;
          const sx = poleX + Math.cos(currentTheta) * (star.r * skyRadius);
          const sy = poleY + Math.sin(currentTheta) * (star.r * skyRadius);

          if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) continue;

          ctx.beginPath();
          ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // B) Southern Constellations (Rosario Sky)
        for (const constellation of SOUTHERN_CONSTELLATIONS) {
          // Project stars to screen space with Earth rotation
          const screenStars = constellation.stars.map((s) => {
            const currentTheta = s.theta + rot;
            const sx = poleX + Math.cos(currentTheta) * (s.r * skyRadius);
            const sy = poleY + Math.sin(currentTheta) * (s.r * skyRadius);
            return {
              x: sx,
              y: sy,
              color: s.color || "#ffffff",
              size: s.size || 2.5,
            };
          });

          // Measure distance from mouse cursor to any star in this constellation
          let minDist = Infinity;
          for (const s of screenStars) {
            const dx = s.x - mouse.x;
            const dy = s.y - mouse.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < minDist) minDist = d;
          }

          // Hover threshold: 120px from any star in the constellation
          const hoverThreshold = 120;
          const isHovered = minDist < hoverThreshold;
          const hoverFactor = isHovered ? 1 - minDist / hoverThreshold : 0;

          // ⭐️ CRITICAL REQUIREMENT:
          // The constellation lines should NOT be seen until you hover!
          // We ONLY draw the lines if hoverFactor > 0!
          if (hoverFactor > 0.01) {
            const lineAlpha = hoverFactor * starOpacity;
            ctx.lineWidth = 1.2 + hoverFactor * 1.4;
            ctx.strokeStyle = `rgba(186, 230, 253, ${lineAlpha.toFixed(3)})`;

            for (const [fromIdx, toIdx] of constellation.edges) {
              const p1 = screenStars[fromIdx];
              const p2 = screenStars[toIdx];
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }

          // Draw Constellation Stars
          for (const s of screenStars) {
            // If hovered, draw glowing outer halo
            if (hoverFactor > 0.05) {
              const glowGrad = ctx.createRadialGradient(
                s.x,
                s.y,
                1,
                s.x,
                s.y,
                16 * hoverFactor
              );
              glowGrad.addColorStop(
                0,
                `rgba(186, 230, 253, ${(0.7 * hoverFactor * starOpacity).toFixed(2)})`
              );
              glowGrad.addColorStop(1, "rgba(186, 230, 253, 0)");
              ctx.fillStyle = glowGrad;
              ctx.beginPath();
              ctx.arc(s.x, s.y, 16 * hoverFactor, 0, Math.PI * 2);
              ctx.fill();
            }

            // Star Core
            const currentSize = s.size + hoverFactor * 1.5;
            ctx.beginPath();
            ctx.arc(s.x, s.y, currentSize, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.globalAlpha = Math.min(1, (0.8 + hoverFactor * 0.2) * starOpacity);
            ctx.fill();
            ctx.globalAlpha = 1;
          }

          // Show Constellation Name ONLY when actively hovered
          if (hoverFactor > 0.35 && screenStars[0]) {
            const labelX = screenStars[0].x;
            const labelY = screenStars[0].y - 16;
            ctx.font = "12px var(--font-sans), system-ui, sans-serif";
            ctx.fillStyle = `rgba(224, 242, 254, ${(hoverFactor * starOpacity).toFixed(2)})`;
            ctx.textAlign = "center";
            ctx.fillText(constellation.name, labelX, labelY);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
        aria-hidden="true"
      />

      {/* Floating celestial status indicator */}
      <div
        className={`fixed bottom-4 right-4 z-20 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-zinc-950/70 text-zinc-300 backdrop-blur-md text-xs font-mono transition-all duration-300 ${
          celestialInfo.isAdvancing
            ? "scale-105 border-amber-400/50 text-amber-200 shadow-xl shadow-amber-500/15 ring-2 ring-amber-400/25"
            : "opacity-80 hover:opacity-100"
        }`}
        title="Cielo de Rosario, Argentina • Rotación de la Tierra • Pase el cursor sobre la espiral para avanzar las horas hacia el amanecer"
      >
        <span className="text-sm">{celestialInfo.phaseIcon}</span>
        <span>{celestialInfo.formattedTime}</span>
        <span className="text-zinc-500">&bull;</span>
        <span className="text-[11px] uppercase tracking-wider">{celestialInfo.phaseName}</span>
        <span className="text-zinc-500 hidden sm:inline">&bull;</span>
        <span className="text-[11px] text-zinc-400 hidden sm:inline">Rosario</span>
        {celestialInfo.isAdvancing && (
          <span className="text-[10px] text-amber-400 animate-pulse font-semibold">
            &Delta; Rotando
          </span>
        )}
      </div>
    </>
  );
}
