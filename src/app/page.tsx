import Image from "next/image";
import { CelestialSky } from "../components/celestial-sky";
import { TiltCard } from "../components/tilt-card";
import { InteractiveSpiral } from "../components/interactive-spiral";
import { LensSwitcher } from "../components/lens-switcher";
import { StatusBadge } from "../components/status-badge";
import { CommandPalette } from "../components/command-palette";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between p-6 sm:p-12 md:p-16 overflow-x-hidden">
      {/* Dynamic Celestial Sky: Night sky, constellations on hover, time dial */}
      <CelestialSky />

      {/* Top command palette bar */}
      <header className="w-full max-w-2xl flex items-center justify-end z-20">
        <CommandPalette />
      </header>

      {/* Main card presentation */}
      <main className="flex flex-1 flex-col items-center justify-center text-center max-w-xl mx-auto space-y-7 z-10 py-6">
        {/* Interactive 3D tilt avatar */}
        <TiltCard maxTilt={10}>
          <div className="relative group cursor-pointer">
            <div className="relative h-36 w-36 sm:h-44 sm:w-44 overflow-hidden rounded-full ring-4 ring-zinc-200/80 dark:ring-zinc-800/80 shadow-2xl transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/adrian.jpg"
                alt="Adrian Costa"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 144px, 176px"
              />
            </div>
          </div>
        </TiltCard>

        {/* Name with interactive spinning spiral celestial time dial */}
        <div className="space-y-3">
          <h1 className="flex items-center justify-center gap-2.5 sm:gap-3 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 drop-shadow-sm">
            <InteractiveSpiral />
            <span>Adrian Costa</span>
          </h1>

          {/* Live pulse status */}
          <StatusBadge />
        </div>

        {/* Dimension / Lens switcher with micro-stack */}
        <LensSwitcher />

        {/* Primary Action Links */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
          <a
            href="https://github.com/adricos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300/80 dark:border-zinc-700/80 bg-white/80 dark:bg-zinc-900/80 px-5 py-2.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 shadow-sm backdrop-blur-md transition-all hover:bg-white dark:hover:bg-zinc-800 hover:scale-105 active:scale-95"
          >
            <span>GitHub</span>
            <span className="text-zinc-400 dark:text-zinc-500 font-mono text-xs">&nearr;</span>
          </a>
          <a
            href="https://www.linkedin.com/in/adriancosta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300/80 dark:border-zinc-700/80 bg-white/80 dark:bg-zinc-900/80 px-5 py-2.5 text-sm font-medium text-zinc-800 dark:text-zinc-200 shadow-sm backdrop-blur-md transition-all hover:bg-white dark:hover:bg-zinc-800 hover:scale-105 active:scale-95"
          >
            <span>LinkedIn</span>
            <span className="text-zinc-400 dark:text-zinc-500 font-mono text-xs">&nearr;</span>
          </a>
          <a
            href="mailto:info@adriancosta.com.ar"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900/90 dark:bg-zinc-100/90 px-5 py-2.5 text-sm font-medium text-zinc-50 dark:text-zinc-900 shadow-md backdrop-blur-md transition-all hover:bg-zinc-900 dark:hover:bg-white hover:scale-105 active:scale-95"
          >
            <span>Contact</span>
            <span className="text-zinc-400 dark:text-zinc-500 text-xs">&rarr;</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-zinc-400 dark:text-zinc-500 space-y-1 z-10">
        <div>&copy; {new Date().getFullYear()} Adrian Costa.</div>
        <div className="hidden sm:block text-[11px] text-zinc-400/80 dark:text-zinc-600 font-mono">
          Press <kbd className="bg-zinc-200/50 dark:bg-zinc-800/50 px-1 py-0.5 rounded border border-zinc-300/50 dark:border-zinc-700/50">⌘K</kbd> anywhere for quick actions
        </div>
      </footer>
    </div>
  );
}
