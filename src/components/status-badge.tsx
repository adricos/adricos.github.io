"use client";

export function StatusBadge() {
  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-xs text-xs text-zinc-600 dark:text-zinc-400">
      <span className="inline-flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        Available for select projects
      </span>
      <span className="text-zinc-300 dark:text-zinc-700 select-none">&bull;</span>
      <span className="text-zinc-500 dark:text-zinc-400">
        Buenos Aires (UTC-3)
      </span>
    </div>
  );
}
