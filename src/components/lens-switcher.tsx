"use client";

import { useState } from "react";

export type LensType = "engineer" | "architect" | "surrealist";

interface LensData {
  title: string;
  subtitle: string;
  chips: string[];
  note: string;
  accent: string;
}

const LENSES: Record<LensType, LensData> = {
  engineer: {
    title: "Software Engineer",
    subtitle: "Shipping resilient code & scalable full-stack web applications",
    chips: ["TypeScript", "Next.js", "React", "Node.js", "Modern Web APIs"],
    note: "Crafting fast, accessible, high-performance interfaces and services.",
    accent: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  architect: {
    title: "Systems Architect",
    subtitle: "Designing distributed architectures & fault-tolerant cloud backends",
    chips: ["Distributed Systems", "Cloud & CI/CD", "API Design", "High Availability", "Simplicity"],
    note: "Believer in: simple code scales better than complex architecture.",
    accent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  surrealist: {
    title: "Curious Technologist",
    subtitle: "Ceci n'est pas un développeur — exploring AI agents & playful interfaces",
    chips: ["Agentic AI", "Creative Computing", "Interactive WebGL", "Philosophy of Code"],
    note: "Software is an art of thought. What you see is only the surface.",
    accent: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
};

export function LensSwitcher() {
  const [activeLens, setActiveLens] = useState<LensType>("engineer");
  const current = LENSES[activeLens];

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Lens selector segmented control */}
      <div className="inline-flex items-center p-1 rounded-full bg-zinc-200/70 dark:bg-zinc-800/70 border border-zinc-300/60 dark:border-zinc-700/60 text-xs font-medium backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setActiveLens("engineer")}
          className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
            activeLens === "engineer"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          Engineer
        </button>
        <button
          type="button"
          onClick={() => setActiveLens("architect")}
          className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
            activeLens === "architect"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          Architect
        </button>
        <button
          type="button"
          onClick={() => setActiveLens("surrealist")}
          className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
            activeLens === "surrealist"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          Surrealist
        </button>
      </div>

      {/* Dynamic subtitle */}
      <div className="space-y-2 min-h-[4rem] flex flex-col items-center justify-center transition-opacity duration-300">
        <p className="text-base sm:text-lg font-medium text-zinc-800 dark:text-zinc-200">
          {current.title}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          {current.subtitle}
        </p>
      </div>

      {/* Micro-stack chips */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 max-w-lg">
        {current.chips.map((chip) => (
          <span
            key={chip}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border transition-all duration-200 ${current.accent}`}
          >
            {chip}
          </span>
        ))}
      </div>

      <p className="text-xs italic text-zinc-400 dark:text-zinc-500 pt-1">
        &ldquo;{current.note}&rdquo;
      </p>
    </div>
  );
}
