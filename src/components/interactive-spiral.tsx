"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EspiralSvg } from "../app/espiral-svg";

export function InteractiveSpiral() {
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleMouseEnter = () => {
    setIsHovered(true);
    window.dispatchEvent(new CustomEvent("celestial-time-advance-start"));
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    window.dispatchEvent(new CustomEvent("celestial-time-advance-end"));
  };

  // Continuous smooth spin while hovered as hours cycle
  useEffect(() => {
    if (!isHovered) return;
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 30) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <Link
      href="/pipe"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative inline-flex items-center justify-center p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:focus-visible:ring-amber-500 transition-transform active:scale-95"
      aria-label="Ceci n'est pas une pipe — Celestial time dial"
    >
      <div
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isHovered ? "transform 0.05s linear" : "transform 0.5s ease-out",
        }}
        className="flex items-center justify-center will-change-transform"
      >
        <EspiralSvg
          className={`h-8 w-auto sm:h-10 md:h-11 transition-colors duration-300 ${
            isHovered
              ? "text-amber-400 dark:text-amber-300 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
              : "text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white"
          }`}
        />
      </div>
      <span className="sr-only">Explore hidden pipe route</span>
    </Link>
  );
}
