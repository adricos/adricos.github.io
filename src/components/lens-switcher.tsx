"use client";

import { useState } from "react";

export type LensType = "fullstack" | "enterprise" | "mobile" | "agentic";

interface LensData {
  title: string;
  subtitle: string;
  chips: string[];
  note: string;
  accent: string;
}

const LENSES: Record<LensType, LensData> = {
  fullstack: {
    title: "Full-Stack & Distributed Systems",
    subtitle: "Next.js, NestJS, TypeScript, GraphQL, .NET / C# & Java Spring",
    chips: [
      "TypeScript",
      "Next.js",
      "NestJS",
      "GraphQL",
      ".NET / C#",
      "Java / Spring",
      "PostgreSQL",
      "Kafka",
    ],
    note: "25+ years delivering scalable enterprise platforms across fintech, energy & healthcare.",
    accent: "bg-blue-500/15 text-blue-900 dark:text-blue-200 border-blue-500/30 dark:bg-blue-950/50",
  },
  enterprise: {
    title: "Complex Data-Intensive Interfaces",
    subtitle: "High-throughput financial grids, geospatial systems & interactive visualization",
    chips: [
      "AG Grid",
      "Mapbox",
      "Deck.gl",
      "Neo4j",
      "Mantine",
      "Material UI",
      "Chart.js",
    ],
    note: "Architecting corporate actions at Vanguard, Finbourne & energy intelligence at ENX.",
    accent: "bg-cyan-500/15 text-cyan-900 dark:text-cyan-200 border-cyan-500/30 dark:bg-cyan-950/50",
  },
  mobile: {
    title: "Mobile Architecture & React Native",
    subtitle: "Cross-platform mobile apps with React Native, Expo & Clean Architecture",
    chips: [
      "React Native",
      "Expo",
      "Clean Architecture",
      "Zustand",
      "Inversify DI",
      "HealthKit",
    ],
    note: "Package-by-Feature design, decoupled state, and high-performance native UX.",
    accent: "bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 border-emerald-500/30 dark:bg-emerald-950/50",
  },
  agentic: {
    title: "Agentic Systems & AI Tooling",
    subtitle: "Autonomous agentic workflows, MCP servers & software factory automation",
    chips: [
      "Agentic Workflows",
      "ElasticClaw",
      "MCP Servers",
      "Vercel AI SDK",
      "Claude Skills",
      "Ollama",
    ],
    note: "Designing agentic software factory workflows that empower modern engineering teams.",
    accent: "bg-purple-500/15 text-purple-900 dark:text-purple-200 border-purple-500/30 dark:bg-purple-950/50",
  },
};

export function LensSwitcher() {
  const [activeLens, setActiveLens] = useState<LensType>("fullstack");
  const current = LENSES[activeLens];

  return (
    <div className="w-full flex flex-col items-center space-y-2.5">
      {/* Lens selector segmented control */}
      <div className="flex flex-wrap items-center justify-center p-1 rounded-full bg-zinc-200/80 dark:bg-zinc-800/80 border border-zinc-300/80 dark:border-zinc-700/80 text-[11px] sm:text-xs font-medium backdrop-blur-md gap-0.5">
        <button
          type="button"
          onClick={() => setActiveLens("fullstack")}
          className={`px-2.5 sm:px-3 py-1 rounded-full transition-all duration-200 ${
            activeLens === "fullstack"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-sm font-semibold"
              : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
          }`}
        >
          Full-Stack
        </button>
        <button
          type="button"
          onClick={() => setActiveLens("enterprise")}
          className={`px-2.5 sm:px-3 py-1 rounded-full transition-all duration-200 ${
            activeLens === "enterprise"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-sm font-semibold"
              : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
          }`}
        >
          Data UI
        </button>
        <button
          type="button"
          onClick={() => setActiveLens("mobile")}
          className={`px-2.5 sm:px-3 py-1 rounded-full transition-all duration-200 ${
            activeLens === "mobile"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-sm font-semibold"
              : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
          }`}
        >
          Mobile
        </button>
        <button
          type="button"
          onClick={() => setActiveLens("agentic")}
          className={`px-2.5 sm:px-3 py-1 rounded-full transition-all duration-200 ${
            activeLens === "agentic"
              ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-sm font-semibold"
              : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white"
          }`}
        >
          Agentic AI
        </button>
      </div>

      {/* Dynamic subtitle */}
      <div className="space-y-1 min-h-[3rem] flex flex-col items-center justify-center transition-opacity duration-300">
        <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
          {current.title}
        </p>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
          {current.subtitle}
        </p>
      </div>

      {/* Micro-stack chips */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5 max-w-lg">
        {current.chips.map((chip) => (
          <span
            key={chip}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-mono font-medium border transition-all duration-200 ${current.accent}`}
          >
            {chip}
          </span>
        ))}
      </div>

      <p className="text-[11px] sm:text-xs italic text-zinc-500 dark:text-zinc-400 pt-0.5">
        &ldquo;{current.note}&rdquo;
      </p>
    </div>
  );
}
