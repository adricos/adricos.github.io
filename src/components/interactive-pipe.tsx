"use client";

import Link from "next/link";
import { useState } from "react";
import { PIPE_PATH_DATA } from "../app/pipe/pipe-svg";

export function InteractivePipe() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href="/pipe"
      aria-label="Ceci n'est pas une pipe"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 inline-flex items-center justify-center p-2 rounded-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      {/* SVG Container with pipe, ember glow, and rising procedural smoke */}
      <div className="relative h-6 w-auto sm:h-7 md:h-8 transition-transform duration-300 group-hover:scale-110 active:scale-95">
        <svg
          viewBox="0 0 1316 965"
          className="h-full w-auto overflow-visible select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ember breathing radial glow */}
            <radialGradient id="ember-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
              <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#d97706" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
            </radialGradient>

            {/* Smoke wisp linear gradients for gradual vertical dissipation */}
            <linearGradient id="smoke-grad-1" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="15%" stopColor="#e2e8f0" stopOpacity="0.55" />
              <stop offset="65%" stopColor="#94a3b8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="smoke-grad-2" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#fed7aa" stopOpacity="0" />
              <stop offset="20%" stopColor="#fde68a" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#cbd5e1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
            </linearGradient>

            {/* Soft smoke blur filter */}
            <filter id="smoke-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* RISING PROCEDURAL SMOKE WISPS (aligned to pipe bowl center at X ~ 200) */}
          <g className="smoke-group" transform="translate(-40, 0)" filter="url(#smoke-blur)" pointerEvents="none">
            {/* Wisp 1: Slow, gentle central ambient swirl */}
            <path
              d="M 235 125 Q 210 30 255 -60 T 225 -160 T 260 -260"
              fill="none"
              stroke="url(#smoke-grad-1)"
              strokeWidth="20"
              strokeLinecap="round"
              className="smoke-wisp smoke-wisp-1"
            />

            {/* Wisp 2: Wider, ethereal secondary ribbon */}
            <path
              d="M 250 120 Q 280 20 220 -70 T 270 -180 T 230 -290"
              fill="none"
              stroke="url(#smoke-grad-2)"
              strokeWidth="24"
              strokeLinecap="round"
              className="smoke-wisp smoke-wisp-2"
            />

            {/* Wisp 3: Swirling curl, blossoms on hover */}
            <path
              d="M 220 128 Q 180 40 230 -50 T 200 -150 T 250 -240"
              fill="none"
              stroke="url(#smoke-grad-1)"
              strokeWidth="16"
              strokeLinecap="round"
              className="smoke-wisp smoke-wisp-3"
            />
          </g>

          {/* EMBER GLOW AT PIPE BOWL RIM */}
          <g
            className={`transition-all duration-500 ease-out ${
              isHovered ? "opacity-100 scale-110" : "opacity-35 scale-95"
            }`}
            style={{ transformOrigin: "200px 125px" }}
          >
            {/* Outer halo */}
            <ellipse
              cx="200"
              cy="125"
              rx="70"
              ry="20"
              fill="url(#ember-glow)"
              className="animate-pulse"
              style={{ animationDuration: "2.5s" }}
            />
            {/* Inner burning ember core */}
            <ellipse
              cx="200"
              cy="125"
              rx="38"
              ry="9"
              fill="#fef08a"
              opacity={isHovered ? 0.95 : 0.6}
            />
          </g>

          {/* MAIN PIPE SILHOUETTE */}
          <path
            d={PIPE_PATH_DATA}
            stroke="none"
            fill="currentColor"
            fillRule="evenodd"
            className={`transition-all duration-300 ${
              isHovered
                ? "text-zinc-900 dark:text-zinc-100 drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]"
                : "text-zinc-500 dark:text-zinc-500 opacity-40 hover:opacity-100"
            }`}
          />
        </svg>
      </div>

      <style jsx>{`
        .smoke-wisp {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: smoke-rise 4.5s ease-in-out infinite;
        }

        .smoke-wisp-1 {
          animation-duration: 4.8s;
          animation-delay: 0s;
        }

        .smoke-wisp-2 {
          animation-duration: 5.4s;
          animation-delay: 1.6s;
          opacity: ${isHovered ? 0.9 : 0.45};
        }

        .smoke-wisp-3 {
          animation-duration: 6s;
          animation-delay: 3s;
          opacity: ${isHovered ? 0.85 : 0.3};
        }

        @keyframes smoke-rise {
          0% {
            stroke-dashoffset: 600;
            transform: translateY(0) scaleX(1);
            opacity: 0;
          }
          20% {
            opacity: 0.8;
          }
          60% {
            transform: translateY(-40px) scaleX(1.3);
            opacity: 0.5;
          }
          100% {
            stroke-dashoffset: 0;
            transform: translateY(-90px) scaleX(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </Link>
  );
}
