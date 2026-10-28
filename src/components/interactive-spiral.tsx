"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { EspiralSvg } from "../app/espiral-svg";

export function InteractiveSpiral() {
  const [isActive, setIsActive] = useState(false);
  const [rotation, setRotation] = useState(0);
  const pressStartTimeRef = useRef(0);

  const startAdvance = () => {
    pressStartTimeRef.current = Date.now();
    setIsActive(true);
    window.dispatchEvent(new CustomEvent("celestial-time-advance-start"));
  };

  const stopAdvance = () => {
    setIsActive(false);
    window.dispatchEvent(new CustomEvent("celestial-time-advance-end"));
  };

  // Continuous smooth, graceful spin while hovered or held (calibrated pace)
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 7) % 360);
    }, 35);

    return () => clearInterval(interval);
  }, [isActive]);

  const handleClick = (e: React.MouseEvent) => {
    const holdDuration = Date.now() - pressStartTimeRef.current;
    // If held for more than 400ms, prevent navigating to /pipe so user can enjoy the celestial sunrise into Galaga
    if (holdDuration > 400) {
      e.preventDefault();
    }
  };

  return (
    <Link
      href="/pipe"
      onClick={handleClick}
      onMouseEnter={startAdvance}
      onMouseLeave={stopAdvance}
      onTouchStart={startAdvance}
      onTouchEnd={stopAdvance}
      onTouchCancel={stopAdvance}
      onContextMenu={(e) => e.preventDefault()}
      className="group relative inline-flex items-center justify-center p-1 rounded-full select-none touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:focus-visible:ring-amber-500 transition-transform active:scale-95"
      aria-label="Ceci n'est pas une pipe — Celestial time dial"
    >
      <div
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isActive ? "transform 0.05s linear" : "transform 0.6s ease-out",
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
      <span className="sr-only">Explore hidden pipe route</span>
    </Link>
  );
}
