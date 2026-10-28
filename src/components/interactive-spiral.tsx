"use client";

import { useState, useEffect, useRef } from "react";
import { EspiralSvg } from "../app/espiral-svg";

export function InteractiveSpiral() {
  const [isActive, setIsActive] = useState(false);
  const spiralRef = useRef<HTMLDivElement | null>(null);
  const rotationRef = useRef(0);

  const startAdvance = () => {
    setIsActive(true);
    window.dispatchEvent(new CustomEvent("celestial-time-advance-start"));
  };

  const stopAdvance = () => {
    setIsActive(false);
    window.dispatchEvent(new CustomEvent("celestial-time-advance-end"));
  };

  // Accelerating warp velocity spin directly updating DOM for 60/120fps butter-smooth rotation
  useEffect(() => {
    if (!isActive) return;
    let animId: number;
    let lastTime = performance.now();
    let speed = 120; // initial deg per sec

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Exponential warp acceleration: smoothly ramps up
      speed += dt * 360;
      rotationRef.current += speed * dt;

      if (spiralRef.current) {
        spiralRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isActive]);

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={startAdvance}
      onMouseLeave={stopAdvance}
      onTouchStart={startAdvance}
      onTouchEnd={stopAdvance}
      onTouchCancel={stopAdvance}
      onContextMenu={(e) => e.preventDefault()}
      className="group relative inline-flex items-center justify-center p-1 rounded-full select-none touch-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:focus-visible:ring-amber-500 transition-transform active:scale-95"
      aria-label="Celestial time dial"
    >
      <div
        ref={spiralRef}
        style={{
          transition: isActive ? "none" : "transform 0.6s ease-out",
        }}
        className="flex items-center justify-center will-change-transform"
      >
        <EspiralSvg
          className={`h-8 w-auto sm:h-10 md:h-11 transition-colors duration-300 ${
            isActive
              ? "text-amber-400 dark:text-amber-300 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
              : "text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white"
          }`}
        />
      </div>
    </div>
  );
}
