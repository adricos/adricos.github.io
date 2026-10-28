"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PIPE_PATH_DATA } from "./pipe-svg";

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

/**
 * Magritte Surrealist Clouds
 * Distinctive pillowy cumulus clouds with soft horizontal bases and billowing domes.
 */
function MagritteClouds() {
  return (
    <g className="transition-transform duration-1000 ease-out">
      {/* Cloud 1: Main majestic cloud inside the large pipe bowl */}
      <g transform="translate(240, 390) scale(0.95)">
        <path
          d="M -130,20 C -105,34 105,34 130,20 C 148,12 158,-5 146,-24 C 138,-36 118,-38 104,-32 C 96,-58 64,-78 26,-72 C 8,-92 -36,-92 -60,-70 C -82,-76 -116,-52 -110,-24 C -130,-12 -138,5 -130,20 Z"
          fill="#8eb4d7"
          opacity="0.5"
          transform="translate(0, 8)"
        />
        <path
          d="M -130,20 C -105,34 105,34 130,20 C 148,12 158,-5 146,-24 C 138,-36 118,-38 104,-32 C 96,-58 64,-78 26,-72 C 8,-92 -36,-92 -60,-70 C -82,-76 -116,-52 -110,-24 C -130,-12 -138,5 -130,20 Z"
          fill="url(#cloud-shading)"
        />
        {/* Soft sunlit highlight domes */}
        <path
          d="M -50,-56 C -32,-78 4,-78 22,-60 C 50,-64 78,-50 82,-30 C 58,-38 24,-34 2,-42 C -24,-48 -44,-44 -50,-56 Z"
          fill="#ffffff"
          opacity="0.95"
        />
        <path
          d="M -100,-15 C -85,-38 -60,-36 -46,-22 C -65,-18 -85,-16 -100,-15 Z"
          fill="#ffffff"
          opacity="0.8"
        />
      </g>

      {/* Cloud 2: Upper bowl rim puff */}
      <g transform="translate(170, 210) scale(0.6)">
        <path
          d="M -90,16 C -70,26 70,26 90,16 C 105,10 110,-5 98,-18 C 88,-28 72,-26 62,-20 C 55,-40 30,-52 5,-48 C -8,-60 -38,-60 -55,-45 C -70,-50 -92,-32 -88,-14 C -102,-6 -108,4 -90,16 Z"
          fill="#8eb4d7"
          opacity="0.45"
          transform="translate(0, 6)"
        />
        <path
          d="M -90,16 C -70,26 70,26 90,16 C 105,10 110,-5 98,-18 C 88,-28 72,-26 62,-20 C 55,-40 30,-52 5,-48 C -8,-60 -38,-60 -55,-45 C -70,-50 -92,-32 -88,-14 C -102,-6 -108,4 -90,16 Z"
          fill="url(#cloud-shading)"
        />
        <path
          d="M -40,-35 C -25,-50 0,-50 15,-38 C 35,-42 55,-32 58,-18 C 40,-24 18,-22 2,-28 C -18,-32 -32,-28 -40,-35 Z"
          fill="#ffffff"
          opacity="0.9"
        />
      </g>

      {/* Cloud 3: Curve transition cloud (bowl to stem) */}
      <g transform="translate(460, 480) scale(0.8)">
        <path
          d="M -110,18 C -85,28 85,28 110,18 C 124,10 130,-6 118,-18 C 108,-28 92,-26 80,-20 C 72,-42 46,-56 18,-52 C 4,-66 -30,-66 -48,-50 C -65,-54 -90,-36 -86,-16 C -102,-8 -108,3 -110,18 Z"
          fill="#8eb4d7"
          opacity="0.45"
          transform="translate(0, 6)"
        />
        <path
          d="M -110,18 C -85,28 85,28 110,18 C 124,10 130,-6 118,-18 C 108,-28 92,-26 80,-20 C 72,-42 46,-56 18,-52 C 4,-66 -30,-66 -48,-50 C -65,-54 -90,-36 -86,-16 C -102,-8 -108,3 -110,18 Z"
          fill="url(#cloud-shading)"
        />
        <path
          d="M -40,-40 C -22,-55 5,-55 20,-42 C 44,-46 66,-36 70,-22 C 50,-28 20,-26 0,-32 C -20,-36 -34,-32 -40,-40 Z"
          fill="#ffffff"
          opacity="0.9"
        />
      </g>

      {/* Cloud 4: Long sweeping cloud along the stem */}
      <g transform="translate(820, 240) scale(0.9)">
        <path
          d="M -140,16 C -110,28 110,28 140,16 C 158,8 164,-10 148,-24 C 134,-34 116,-32 102,-26 C 94,-50 62,-68 28,-62 C 10,-78 -28,-78 -50,-60 C -72,-66 -104,-44 -98,-20 C -122,-8 -134,2 -140,16 Z"
          fill="#8eb4d7"
          opacity="0.5"
          transform="translate(0, 7)"
        />
        <path
          d="M -140,16 C -110,28 110,28 140,16 C 158,8 164,-10 148,-24 C 134,-34 116,-32 102,-26 C 94,-50 62,-68 28,-62 C 10,-78 -28,-78 -50,-60 C -72,-66 -104,-44 -98,-20 C -122,-8 -134,2 -140,16 Z"
          fill="url(#cloud-shading)"
        />
        <path
          d="M -42,-48 C -22,-65 8,-65 25,-50 C 55,-54 82,-42 86,-25 C 62,-32 28,-30 4,-38 C -22,-42 -36,-38 -42,-48 Z"
          fill="#ffffff"
          opacity="0.95"
        />
      </g>

      {/* Cloud 5: Mouthpiece tip puff */}
      <g transform="translate(1140, 175) scale(0.65)">
        <path
          d="M -80,14 C -60,22 60,22 80,14 C 92,8 96,-5 86,-15 C 76,-24 62,-22 54,-16 C 48,-34 26,-44 6,-40 C -4,-50 -28,-50 -42,-38 C -54,-42 -72,-26 -68,-12 C -80,-5 -84,4 -80,14 Z"
          fill="#8eb4d7"
          opacity="0.45"
          transform="translate(0, 5)"
        />
        <path
          d="M -80,14 C -60,22 60,22 80,14 C 92,8 96,-5 86,-15 C 76,-24 62,-22 54,-16 C 48,-34 26,-44 6,-40 C -4,-50 -28,-50 -42,-38 C -54,-42 -72,-26 -68,-12 C -80,-5 -84,4 -80,14 Z"
          fill="url(#cloud-shading)"
        />
        <path
          d="M -30,-30 C -18,-42 2,-42 14,-32 C 30,-35 48,-26 50,-15 C 36,-20 18,-18 5,-23 C -10,-26 -22,-24 -30,-30 Z"
          fill="#ffffff"
          opacity="0.9"
        />
      </g>

      {/* Cloud 6: Cursive text lower left cloud */}
      <g transform="translate(420, 840) scale(1.05)">
        <path
          d="M -150,18 C -115,30 115,30 150,18 C 170,10 176,-10 158,-24 C 142,-36 120,-34 106,-26 C 96,-52 64,-70 28,-64 C 10,-82 -30,-82 -54,-62 C -78,-68 -110,-46 -104,-20 C -130,-10 -142,2 -150,18 Z"
          fill="#8eb4d7"
          opacity="0.45"
          transform="translate(0, 7)"
        />
        <path
          d="M -150,18 C -115,30 115,30 150,18 C 170,10 176,-10 158,-24 C 142,-36 120,-34 106,-26 C 96,-52 64,-70 28,-64 C 10,-82 -30,-82 -54,-62 C -78,-68 -110,-46 -104,-20 C -130,-10 -142,2 -150,18 Z"
          fill="url(#cloud-shading)"
        />
        <path
          d="M -45,-50 C -25,-68 6,-68 24,-52 C 54,-56 82,-44 86,-26 C 60,-34 26,-32 2,-40 C -22,-44 -38,-40 -45,-50 Z"
          fill="#ffffff"
          opacity="0.9"
        />
      </g>

      {/* Cloud 7: Cursive text lower right cloud */}
      <g transform="translate(920, 845) scale(0.95)">
        <path
          d="M -130,16 C -100,26 100,26 130,16 C 146,8 152,-8 136,-22 C 122,-32 104,-30 92,-24 C 84,-46 56,-62 24,-58 C 8,-72 -24,-72 -44,-55 C -65,-60 -92,-40 -88,-18 C -110,-8 -122,2 -130,16 Z"
          fill="#8eb4d7"
          opacity="0.45"
          transform="translate(0, 6)"
        />
        <path
          d="M -130,16 C -100,26 100,26 130,16 C 146,8 152,-8 136,-22 C 122,-32 104,-30 92,-24 C 84,-46 56,-62 24,-58 C 8,-72 -24,-72 -44,-55 C -65,-60 -92,-40 -88,-18 C -110,-8 -122,2 -130,16 Z"
          fill="url(#cloud-shading)"
        />
        <path
          d="M -38,-44 C -20,-58 5,-58 20,-45 C 46,-48 68,-38 72,-24 C 52,-30 22,-28 2,-35 C -18,-38 -32,-35 -38,-44 Z"
          fill="#ffffff"
          opacity="0.9"
        />
      </g>
    </g>
  );
}

interface StrikeKeypoint {
  t: number;
  sky: number;
  core: number;
  amb: number;
}

/**
 * Generates an unpredictable random lightning profile with variable duration.
 * Durations range from quick snappy strikes (~180ms) to prolonged rumbling thunderstorms (~1700ms).
 */
function generateStrikeKeypoints(): StrikeKeypoint[] {
  const rand = Math.random();
  let duration: number;
  if (rand < 0.35) {
    // Snappy split-second flash: 180ms - 380ms
    duration = Math.random() * 200 + 180;
  } else if (rand < 0.70) {
    // Medium multi-strike: 420ms - 800ms
    duration = Math.random() * 380 + 420;
  } else {
    // Extended rolling thunderstorm flash: 850ms - 1700ms
    duration = Math.random() * 850 + 850;
  }

  const points: StrikeKeypoint[] = [];

  // Phase 1: Initial sudden leader burst
  points.push({ t: 0, sky: 1.0, core: 0.9, amb: 0.28 });
  const firstDipT = Math.min(40, duration * 0.12);
  points.push({ t: firstDipT, sky: 0.3, core: 0.05, amb: 0.08 });

  // Phase 2: Active multi-pulse flickers
  const decayDuration = Math.min(450, Math.max(120, duration * 0.32));
  const activeEnd = duration - decayDuration;

  let pulseCount = 1;
  if (duration > 400) pulseCount = Math.floor(Math.random() * 2) + 2; // 2 to 3
  if (duration > 850) pulseCount = Math.floor(Math.random() * 3) + 4; // 4 to 6

  let currentT = firstDipT;
  const timePerPulse = (activeEnd - currentT) / pulseCount;

  for (let i = 0; i < pulseCount; i++) {
    const peakT = currentT + timePerPulse * (0.3 + Math.random() * 0.2);
    const dipT = currentT + timePerPulse;
    const peakIntensity = 0.8 + Math.random() * 0.2; // 0.8 to 1.0
    const dipIntensity = 0.3 + Math.random() * 0.3; // 0.3 to 0.6

    points.push({
      t: peakT,
      sky: peakIntensity,
      core: i === 0 ? 0.35 : (Math.random() < 0.35 ? 0.2 : 0),
      amb: 0.18 + peakIntensity * 0.1,
    });

    if (i < pulseCount - 1) {
      points.push({
        t: dipT,
        sky: dipIntensity,
        core: 0,
        amb: 0.06 + dipIntensity * 0.05,
      });
    }
    currentT = dipT;
  }

  // Phase 3: Final smooth afterglow decay to solid white
  points.push({ t: duration, sky: 0, core: 0, amb: 0 });

  return points;
}

function sampleStrike(points: StrikeKeypoint[], elapsed: number) {
  const last = points[points.length - 1];
  if (elapsed >= last.t) {
    return { sky: 0, core: 0, amb: 0, isDone: true };
  }

  let i = 0;
  while (i < points.length - 1 && points[i + 1].t <= elapsed) {
    i++;
  }
  const p0 = points[i];
  const p1 = points[i + 1];
  const dt = p1.t - p0.t;
  const progress = dt <= 0 ? 1 : (elapsed - p0.t) / dt;

  const isFinalDecay = i === points.length - 2;

  if (isFinalDecay) {
    // Quadratic smooth dissipation curve
    const decayFactor = 1 - Math.pow(progress, 1.8);
    return {
      sky: p0.sky * decayFactor,
      core: 0,
      amb: p0.amb * decayFactor,
      isDone: false,
    };
  }

  return {
    sky: p0.sky + (p1.sky - p0.sky) * progress,
    core: p0.core + (p1.core - p0.core) * progress,
    amb: p0.amb + (p1.amb - p0.amb) * progress,
    isDone: false,
  };
}

export function MagritteLightningPipe() {
  const router = useRouter();
  const skyRef = useRef<SVGGElement>(null);
  const flashCoreRef = useRef<SVGRectElement>(null);
  const ambientFlashRef = useRef<HTMLDivElement>(null);
  const cloudsDriftRef = useRef<SVGGElement>(null);

  const strikeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isDestroyedRef = useRef(false);

  const scheduleNextStrikeRef = useRef<() => void>(() => {});

  // Trigger a full surreal lightning strike sequence
  const triggerLightning = useCallback(() => {
    if (isDestroyedRef.current) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const startTime = performance.now();
    const strikePoints = generateStrikeKeypoints();

    // Randomize cloud drift position on each strike for a living world glimpse
    if (cloudsDriftRef.current) {
      const driftX = (Math.random() - 0.5) * 50;
      const driftY = (Math.random() - 0.5) * 15;
      cloudsDriftRef.current.style.transform = `translate(${driftX}px, ${driftY}px)`;
    }

    const updateFrame = (now: number) => {
      if (isDestroyedRef.current) return;
      const elapsed = now - startTime;

      const sample = sampleStrike(strikePoints, elapsed);

      if (skyRef.current) {
        skyRef.current.style.opacity = sample.sky.toFixed(3);
      }
      if (flashCoreRef.current) {
        flashCoreRef.current.style.opacity = sample.core.toFixed(3);
      }
      if (ambientFlashRef.current) {
        ambientFlashRef.current.style.opacity = sample.amb.toFixed(3);
      }

      if (!sample.isDone) {
        animFrameRef.current = requestAnimationFrame(updateFrame);
      } else {
        animFrameRef.current = null;
        // Schedule next random strike
        scheduleNextStrikeRef.current();
      }
    };

    animFrameRef.current = requestAnimationFrame(updateFrame);
  }, []);

  // Schedule unpredictable random lightning strikes
  const scheduleNextStrike = useCallback(() => {
    if (isDestroyedRef.current) return;
    if (strikeTimeoutRef.current) {
      clearTimeout(strikeTimeoutRef.current);
    }

    // 25% chance of rapid double strike (400-1100ms), 75% chance of 3.2s - 7.5s
    const isDoubleStrike = Math.random() < 0.25;
    const delay = isDoubleStrike
      ? Math.random() * 700 + 400
      : Math.random() * 4300 + 3200;

    strikeTimeoutRef.current = setTimeout(() => {
      triggerLightning();
    }, delay);
  }, [triggerLightning]);

  useEffect(() => {
    scheduleNextStrikeRef.current = scheduleNextStrike;
  }, [scheduleNextStrike]);

  useEffect(() => {
    isDestroyedRef.current = false;

    // Initial dramatic strike after entering the room (1.2s - 2s)
    const initialTimer = setTimeout(() => {
      triggerLightning();
    }, 1500);

    // Keyboard navigation (Escape to go home)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      isDestroyedRef.current = true;
      clearTimeout(initialTimer);
      if (strikeTimeoutRef.current) clearTimeout(strikeTimeoutRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [triggerLightning, router]);

  return (
    <div className="relative h-full w-full flex items-center justify-center select-none overflow-hidden">
      {/* Ambient background lightning flash */}
      <div
        ref={ambientFlashRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(186,230,253,0.22)_0%,rgba(56,189,248,0.08)_50%,transparent_80%)] opacity-0 transition-opacity duration-75"
      />

      {/* Discreet top-left back link */}
      <Link
        href="/"
        aria-label="Back to home"
        className="fixed top-5 left-5 sm:top-7 sm:left-7 z-20 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/10 backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-lg"
      >
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {/* Interactive Pipe Container */}
      <div
        onClick={triggerLightning}
        className="relative z-10 flex h-full w-full max-h-[85vh] max-w-[90vw] items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99]"
      >
        <svg
          viewBox="0 0 1316 965"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Ceci n'est pas une pipe"
          className="h-full w-full max-h-full max-w-full object-contain drop-shadow-2xl"
        >
          <defs>
            {/* Exact silhouette mask/clip path */}
            <clipPath id="magritte-pipe-clip">
              <path d={PIPE_PATH_DATA} fillRule="evenodd" />
            </clipPath>

            {/* René Magritte Belgian daytime sky gradient */}
            <linearGradient id="magritte-sky-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e5f99" />
              <stop offset="28%" stopColor="#2b82c9" />
              <stop offset="62%" stopColor="#52a9e8" />
              <stop offset="88%" stopColor="#8cc9f5" />
              <stop offset="100%" stopColor="#bde0fe" />
            </linearGradient>

            {/* Cloud shading gradient */}
            <linearGradient id="cloud-shading" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="68%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#bdd8f0" />
            </linearGradient>

            {/* Lightning core flash gradient */}
            <linearGradient id="lightning-core-flash" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#e0f2fe" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Normal state: Pristine white pipe vector on deep dark background */}
          <path
            d={PIPE_PATH_DATA}
            stroke="none"
            fill="#ffffff"
            fillRule="evenodd"
            className="transition-colors duration-200"
          />

          {/* Lightning state: The white pipe flashes revealing Magritte's sky with clouds */}
          <g
            ref={skyRef}
            clipPath="url(#magritte-pipe-clip)"
            style={{ opacity: 0 }}
            className="pointer-events-none"
          >
            {/* Daytime Sky */}
            <rect x="0" y="0" width="1316" height="965" fill="url(#magritte-sky-grad)" />

            {/* Drifting Cumulus Clouds */}
            <g ref={cloudsDriftRef} className="transition-transform duration-700 ease-out">
              <MagritteClouds />
            </g>

            {/* Electric White Lightning Flash Highlight */}
            <rect
              ref={flashCoreRef}
              x="0"
              y="0"
              width="1316"
              height="965"
              fill="url(#lightning-core-flash)"
              style={{ opacity: 0 }}
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
