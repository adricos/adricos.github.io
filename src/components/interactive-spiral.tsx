"use client";

import { useState } from "react";
import Link from "next/link";
import { EspiralSvg } from "../app/espiral-svg";

export function InteractiveSpiral() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleMouseEnter = () => {
    setRotation((prev) => prev + 180);
  };

  const handleClick = () => {
    setIsSpinning(true);
    setRotation((prev) => prev + 720);
  };

  return (
    <Link
      href="/pipe"
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className="group relative inline-flex items-center justify-center p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 transition-transform active:scale-90"
      title="Ceci n'est pas une pipe (Click to explore)"
      aria-label="Ceci n'est pas une pipe"
    >
      <div
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning
            ? "transform 0.8s cubic-bezier(0.2, 0.9, 0.3, 1)"
            : "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        className="flex items-center justify-center will-change-transform"
      >
        <EspiralSvg className="h-8 w-auto sm:h-9 text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors" />
      </div>
      <span className="sr-only">Explore hidden pipe route</span>
    </Link>
  );
}
