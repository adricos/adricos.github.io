"use client";

import { useState, useEffect, useRef } from "react";
import { EspiralSvg } from "../app/espiral-svg";

export function InteractiveSpiral() {
  const [isActive, setIsActive] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isTrembling, setIsTrembling] = useState(false);

  const spiralRef = useRef<HTMLDivElement | null>(null);
  const rotationRef = useRef(0);
  const hasInteractedRef = useRef(false);

  const startAdvance = () => {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      setHasInteracted(true);
      setIsTrembling(false);
    }
    setIsActive(true);
    window.dispatchEvent(new CustomEvent("celestial-time-advance-start"));
  };

  const stopAdvance = () => {
    setIsActive(false);
    window.dispatchEvent(new CustomEvent("celestial-time-advance-end"));
  };

  // Random subtle tremble if the user hasn't hovered/interacted yet
  useEffect(() => {
    if (hasInteracted) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let durationId: ReturnType<typeof setTimeout>;

    const triggerTremble = () => {
      if (hasInteractedRef.current) return;
      setIsTrembling(true);

      durationId = setTimeout(() => {
        setIsTrembling(false);
        scheduleNext();
      }, 550);
    };

    const scheduleNext = () => {
      if (hasInteractedRef.current) return;
      // Random delay between 4s and 8s
      const delay = 4000 + Math.random() * 4000;
      timeoutId = setTimeout(triggerTremble, delay);
    };

    // First subtle tremble shortly after page load (~2.5s)
    const initialDelay = 2500 + Math.random() * 1500;
    timeoutId = setTimeout(triggerTremble, initialDelay);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(durationId);
    };
  }, [hasInteracted]);

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
        <div
          className={`flex items-center justify-center ${
            isTrembling ? "spiral-tremble" : ""
          }`}
        >
          <EspiralSvg
            className={`h-8 w-auto sm:h-10 md:h-11 transition-all duration-300 ${
              isActive
                ? "text-amber-400 dark:text-amber-300 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                : isTrembling
                ? "text-amber-500/85 dark:text-amber-400/85 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.35)]"
                : "text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white"
            }`}
          />
        </div>
      </div>

      <style jsx>{`
        .spiral-tremble {
          animation: subtle-tremble 0.55s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        @keyframes subtle-tremble {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          15% {
            transform: translate(-0.7px, 0.4px) rotate(-2.5deg);
          }
          30% {
            transform: translate(0.6px, -0.5px) rotate(2.8deg);
          }
          45% {
            transform: translate(-0.5px, 0.3px) rotate(-1.8deg);
          }
          60% {
            transform: translate(0.4px, -0.2px) rotate(1.2deg);
          }
          75% {
            transform: translate(-0.2px, 0.1px) rotate(-0.6deg);
          }
          90% {
            transform: translate(0.1px, 0px) rotate(0.2deg);
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
