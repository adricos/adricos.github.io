import Image from "next/image";
import { CelestialNightSky } from "../components/celestial-night-sky";
import { TiltCard } from "../components/tilt-card";
import { InteractiveSpiral } from "../components/interactive-spiral";
import { LensSwitcher } from "../components/lens-switcher";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="relative h-screen h-[100dvh] max-h-screen overflow-hidden flex flex-col items-center justify-between p-3 sm:p-6">
      {/* Night Sky: Real 360° Milky Way, Dawn cycle on spiral hover */}
      <CelestialNightSky />

      {/* Main Presentation Card */}
      <main className="flex flex-1 flex-col items-center justify-center text-center max-w-lg mx-auto z-10 w-full my-auto px-2">
        <div className="w-full rounded-3xl border border-white/30 dark:border-white/10 bg-white/75 dark:bg-zinc-950/75 backdrop-blur-xl shadow-2xl p-5 sm:p-7 space-y-4 sm:space-y-5">
          {/* Interactive 3D tilt avatar */}
          <TiltCard maxTilt={10}>
            <div className="relative group cursor-pointer inline-block">
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-full ring-4 ring-zinc-300/80 dark:ring-zinc-700/80 shadow-xl transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/images/adrian.jpg"
                  alt="Adrian Costa"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 96px, 112px"
                />
              </div>
            </div>
          </TiltCard>

          {/* Name with interactive spinning spiral celestial time dial */}
          <div className="space-y-0.5 sm:space-y-1">
            <h1 className="flex items-center justify-center gap-2 sm:gap-2.5 text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 drop-shadow-xs">
              <InteractiveSpiral />
              <span>Adrian Costa</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium tracking-wide uppercase text-zinc-600 dark:text-zinc-400">
              Tech Lead
            </p>
          </div>

          {/* Dimension / Lens switcher with micro-stack */}
          <LensSwitcher />

          {/* Primary Action Brand Icons (GitHub, LinkedIn, Email) */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <a
              href="https://github.com/adricos"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              title="GitHub"
              className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-zinc-300/80 dark:border-zinc-700/80 bg-white/90 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-200 shadow-sm backdrop-blur-md transition-all hover:bg-white dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white hover:scale-110 active:scale-95"
            >
              <GithubIcon className="h-5 w-5" />
            </a>

            <a
              href="https://www.linkedin.com/in/adriancosta"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              title="LinkedIn"
              className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-zinc-300/80 dark:border-zinc-700/80 bg-white/90 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-200 shadow-sm backdrop-blur-md transition-all hover:bg-white dark:hover:bg-zinc-800 hover:text-[#0a66c2] dark:hover:text-[#0a66c2] hover:scale-110 active:scale-95"
            >
              <LinkedinIcon className="h-5 w-5" />
            </a>

            <a
              href="mailto:info@adriancosta.com.ar"
              aria-label="Send Email"
              title="Contact via Email"
              className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md backdrop-blur-md transition-all hover:bg-zinc-800 dark:hover:bg-white hover:scale-110 active:scale-95"
            >
              <MailIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-2 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 z-10 font-medium">
        &copy; {new Date().getFullYear()} Adrian Costa.
      </footer>
    </div>
  );
}
