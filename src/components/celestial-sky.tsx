"use client";

import { useEffect, useRef, useState } from "react";

interface ConstellationStar {
  x: number;
  y: number;
}

interface Constellation {
  name: string;
  stars: ConstellationStar[];
  edges: [number, number][];
}

interface TwinkleStar {
  x: number;
  y: number;
  size: number;
  baseBrightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

const CONSTELLATIONS: Constellation[] = [
  {
    name: "Crux (Southern Cross)",
    stars: [
      { x: 0.16, y: 0.65 }, // Gacrux
      { x: 0.19, y: 0.83 }, // Acrux
      { x: 0.11, y: 0.73 }, // Mimosa
      { x: 0.23, y: 0.74 }, // Imai
      { x: 0.20, y: 0.77 }, // Ginan
    ],
    edges: [
      [0, 1],
      [2, 3],
    ],
  },
  {
    name: "Ursa Major",
    stars: [
      { x: 0.74, y: 0.15 },
      { x: 0.79, y: 0.17 },
      { x: 0.83, y: 0.20 },
      { x: 0.87, y: 0.23 },
      { x: 0.93, y: 0.20 },
      { x: 0.92, y: 0.28 },
      { x: 0.86, y: 0.30 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 3],
    ],
  },
  {
    name: "Cassiopeia",
    stars: [
      { x: 0.12, y: 0.22 },
      { x: 0.16, y: 0.28 },
      { x: 0.21, y: 0.23 },
      { x: 0.26, y: 0.29 },
      { x: 0.31, y: 0.24 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  {
    name: "Orion",
    stars: [
      { x: 0.78, y: 0.63 }, // Betelgeuse
      { x: 0.88, y: 0.61 }, // Bellatrix
      { x: 0.81, y: 0.71 }, // Alnitak
      { x: 0.83, y: 0.72 }, // Alnilam
      { x: 0.85, y: 0.73 }, // Mintaka
      { x: 0.79, y: 0.82 }, // Saiph
      { x: 0.89, y: 0.80 }, // Rigel
    ],
    edges: [
      [0, 1],
      [0, 2],
      [1, 4],
      [2, 3],
      [3, 4],
      [2, 5],
      [4, 6],
      [5, 6],
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

// Compute sky gradient colors and star opacity for any given hour [0..24)
function getSkyParameters(hour: number) {
  // Normalize hour into 0..24
  const h = ((hour % 24) + 24) % 24;

  let topColor: [number, number, number];
  let bottomColor: [number, number, number];
  let starOpacity = 0;
  let phaseName = "Night";
  let phaseIcon = "✨";

  if (h >= 21 || h < 4.5) {
    // Deep Night
    topColor = [3, 7, 18]; // zinc-950
    bottomColor = [15, 23, 42]; // slate-900
    starOpacity = 1;
    phaseName = "Night";
    phaseIcon = "✨";
  } else if (h >= 4.5 && h < 7.5) {
    // Dawn / Sunrise
    const progress = (h - 4.5) / 3;
    topColor = lerpColor([3, 7, 18], [56, 189, 248], progress);
    bottomColor = lerpColor([15, 23, 42], [249, 115, 22], Math.min(1, progress * 1.2));
    if (progress > 0.6) {
      bottomColor = lerpColor([249, 115, 22], [254, 215, 170], (progress - 0.6) / 0.4);
    }
    starOpacity = Math.max(0, 1 - progress * 1.5);
    phaseName = "Dawn";
    phaseIcon = "🌅";
  } else if (h >= 7.5 && h < 16.5) {
    // Full Daylight
    topColor = [14, 165, 233]; // sky-500
    bottomColor = [224, 242, 254]; // sky-100
    starOpacity = 0;
    phaseName = "Daylight";
    phaseIcon = "☀️";
  } else {
    // Dusk / Sunset (16.5 .. 21.0)
    const progress = (h - 16.5) / 4.5;
    topColor = lerpColor([14, 165, 233], [3, 7, 18], progress);
    if (progress < 0.5) {
      bottomColor = lerpColor([224, 242, 254], [244, 63, 94], progress * 2);
    } else {
      bottomColor = lerpColor([244, 63, 94], [15, 23, 42], (progress - 0.5) * 2);
    }
    starOpacity = Math.max(0, (progress - 0.3) / 0.7);
    phaseName = "Dusk";
    phaseIcon = "🌇";
  }

  return { topColor, bottomColor, starOpacity, phaseName, phaseIcon, hour: h };
}

export function CelestialSky() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hourRef = useRef<number>(23); // Start at deep night (23:00)
  const isAdvancingRef = useRef<boolean>(false);
  const [celestialInfo, setCelestialInfo] = useState<{
    phaseName: string;
    phaseIcon: string;
    formattedTime: string;
    isAdvancing: boolean;
  }>({
    phaseName: "Night",
    phaseIcon: "✨",
    formattedTime: "23:00",
    isAdvancing: false,
  });

  useEffect(() => {
    // Listen to spiral hover events to advance celestial time
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

    // Mouse coordinates for constellation proximity
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

    // Initialize 140 random twinkling stars across the sky
    const stars: TwinkleStar[] = [];
    const starCount = 140;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.5 + 0.8,
        baseBrightness: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    let lastTime = performance.now();
    let tickCounter = 0;

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // If user is hovering the spiral, advance hour forward continuously!
      if (isAdvancingRef.current) {
        // Advance ~2.8 hours per second (completes full 24h cycle in ~8.5 seconds)
        hourRef.current = (hourRef.current + dt * 2.8) % 24;
      }

      // Update UI state periodically (every ~10 frames)
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

      // Draw Sky Gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, `rgb(${topColor[0]}, ${topColor[1]}, ${topColor[2]})`);
      gradient.addColorStop(1, `rgb(${bottomColor[0]}, ${bottomColor[1]}, ${bottomColor[2]})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Render Stars & Constellations only if night/dawn/dusk allows stars
      if (starOpacity > 0.02) {
        // 1. Background Twinkling Stars
        for (const star of stars) {
          star.twinklePhase += star.twinkleSpeed;
          const twinkle = (Math.sin(star.twinklePhase) + 1) / 2;
          const alpha = star.baseBrightness * (0.4 + twinkle * 0.6) * starOpacity;

          const px = star.x * width;
          const py = star.y * height;

          ctx.beginPath();
          ctx.arc(px, py, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
          ctx.fill();
        }

        // 2. Constellations with Interactive Hover Connections
        for (const constellation of CONSTELLATIONS) {
          // Compute screen coordinates for each star
          const screenStars = constellation.stars.map((s) => ({
            x: s.x * width,
            y: s.y * height,
          }));

          // Measure distance from mouse to any star in this constellation
          let minDist = Infinity;
          for (const s of screenStars) {
            const dx = s.x - mouse.x;
            const dy = s.y - mouse.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < minDist) minDist = d;
          }

          // If mouse is near (within 130px), activate constellation joining lines!
          const hoverThreshold = 130;
          const hoverFactor =
            minDist < hoverThreshold ? (1 - minDist / hoverThreshold) : 0;

          // Draw Constellation Connection Lines
          // Always faint in the dark, glows brightly when hovered!
          const lineAlpha = (0.12 + hoverFactor * 0.75) * starOpacity;
          ctx.lineWidth = 1 + hoverFactor * 1.5;
          ctx.strokeStyle = `rgba(186, 230, 253, ${lineAlpha.toFixed(3)})`;

          for (const [fromIdx, toIdx] of constellation.edges) {
            const p1 = screenStars[fromIdx];
            const p2 = screenStars[toIdx];
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }

          // Draw Constellation Stars (with halo glow when hovered)
          for (const s of screenStars) {
            // Outer glow if hovered
            if (hoverFactor > 0.1) {
              const glowGrad = ctx.createRadialGradient(s.x, s.y, 1, s.x, s.y, 14 * hoverFactor);
              glowGrad.addColorStop(0, `rgba(186, 230, 253, ${(0.6 * hoverFactor * starOpacity).toFixed(2)})`);
              glowGrad.addColorStop(1, "rgba(186, 230, 253, 0)");
              ctx.fillStyle = glowGrad;
              ctx.beginPath();
              ctx.arc(s.x, s.y, 14 * hoverFactor, 0, Math.PI * 2);
              ctx.fill();
            }

            // Central bright star
            ctx.beginPath();
            ctx.arc(s.x, s.y, 2.2 + hoverFactor * 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, (0.7 + hoverFactor * 0.3) * starOpacity)})`;
            ctx.fill();
          }

          // Show Constellation Name when actively hovered
          if (hoverFactor > 0.35 && screenStars[0]) {
            const labelX = screenStars[0].x;
            const labelY = screenStars[0].y - 14;
            ctx.font = "11px var(--font-sans), system-ui, sans-serif";
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
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full transition-opacity duration-700"
        aria-hidden="true"
      />

      {/* Floating celestial status indicator */}
      <div
        className={`fixed bottom-4 right-4 z-20 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-zinc-950/60 text-zinc-300 backdrop-blur-md text-xs font-mono transition-all duration-300 ${
          celestialInfo.isAdvancing
            ? "scale-105 border-amber-400/40 text-amber-200 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/20"
            : "opacity-80 hover:opacity-100"
        }`}
        title="Celestial Time Dial (Hover the spiral to cycle time)"
      >
        <span className="text-sm">{celestialInfo.phaseIcon}</span>
        <span>{celestialInfo.formattedTime}</span>
        <span className="text-zinc-500">&bull;</span>
        <span className="text-[11px] uppercase tracking-wider">{celestialInfo.phaseName}</span>
        {celestialInfo.isAdvancing && (
          <span className="text-[10px] text-amber-400 animate-pulse font-semibold">
            &Delta; Cycling
          </span>
        )}
      </div>
    </>
  );
}
