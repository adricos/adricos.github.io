// -------------------------------------------------------------
// Galaga HUD & Overlay Components (SRP: User Interface)
// -------------------------------------------------------------

import React from "react";
import Link from "next/link";
import { EspiralSvg } from "../espiral-svg";
import type { GameState, WeaponType } from "./types";

interface GalagaHudProps {
  score: number;
  highScore: number;
  wave: number;
  lives: number;
  bombs: number;
  activeWeapon: WeaponType;
  weaponTimer: number;
  hasShield: boolean;
  isDualFighter: boolean;
  bossHpPercent: number | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onTriggerBomb: () => void;
}

export function GalagaHud({
  score,
  highScore,
  wave,
  lives,
  bombs,
  activeWeapon,
  weaponTimer,
  hasShield,
  isDualFighter,
  bossHpPercent,
  isMuted,
  onToggleMute,
  onTriggerBomb,
}: GalagaHudProps) {
  return (
    <>
      {/* Top Arcade HUD Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-2.5 sm:px-8 py-2 sm:py-3 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none box-border max-w-full overflow-hidden">
        <div className="flex items-center gap-2.5 sm:gap-10 shrink-0">
          <div>
            <div className="text-[10px] sm:text-xs text-rose-500 font-bold tracking-wider">1UP</div>
            <div className="text-xs sm:text-lg font-bold text-white tracking-widest">
              {score.toString().padStart(6, "0")}
            </div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-sky-400 font-bold tracking-wider">HIGH SCORE</div>
            <div className="text-xs sm:text-lg font-bold text-white tracking-widest">
              {highScore.toString().padStart(6, "0")}
            </div>
          </div>
        </div>

        {/* Flagship Boss Health Bar (if active) */}
        {bossHpPercent !== null && (
          <div className="hidden sm:flex flex-col items-center pointer-events-auto">
            <div className="text-[10px] sm:text-xs text-purple-400 font-bold tracking-widest animate-pulse">
              FLAGSHIP DREADNOUGHT
            </div>
            <div className="w-36 sm:w-64 h-2.5 sm:h-3 rounded-full bg-zinc-900 border border-purple-500/50 overflow-hidden mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-150"
                style={{ width: `${bossHpPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-6 pointer-events-auto shrink-0 pr-1 sm:pr-0">
          {/* Mute Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            className="p-1 sm:p-2 rounded-full text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer shrink-0"
          >
            {isMuted ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          <div className="text-right shrink-0">
            <div className="text-[10px] sm:text-xs text-amber-400 font-bold tracking-wider">STAGE</div>
            <div className="text-xs sm:text-lg font-bold text-white tracking-widest text-right">{wave}</div>
          </div>

          <Link
            href="/"
            aria-label="Volver al inicio"
            className="group inline-flex items-center justify-center p-1 sm:p-2 rounded-full text-zinc-400 hover:text-white transition-all opacity-70 hover:opacity-100 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0"
          >
            <EspiralSvg className="h-5 w-auto sm:h-7 md:h-8 text-current transition-all duration-700 ease-out group-hover:rotate-180 group-hover:text-amber-400 drop-shadow-md" />
          </Link>
        </div>
      </header>

      {/* Bottom HUD: Lives, Shields, Bombs, Weapon Status */}
      <footer className="absolute bottom-3 left-0 right-0 px-2.5 sm:px-8 z-20 flex items-center justify-between pointer-events-none box-border max-w-full">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Ships Remaining */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-xs text-zinc-400 font-medium mr-1">SHIPS:</span>
            {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 stroke-current fill-none stroke-2 drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]"
              >
                <polygon points="12,2 20,20 16,18 12,14 8,18 4,20" />
              </svg>
            ))}
          </div>

          {/* EMP Bombs */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] sm:text-xs text-zinc-400 font-medium mr-0.5">EMP:</span>
            {Array.from({ length: Math.max(0, bombs) }).map((_, i) => (
              <span key={i} className="text-xs text-rose-500 font-black animate-pulse">
                💣
              </span>
            ))}
          </div>
        </div>

        {/* Active Power-Up Status Pill */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {isDualFighter && (
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border border-rose-500/50 bg-rose-500/20 text-rose-300">
              DUAL 2X
            </span>
          )}
          {hasShield && (
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border border-emerald-500/50 bg-emerald-500/20 text-emerald-300">
              SHIELD
            </span>
          )}
          {activeWeapon !== "standard" && (
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border border-cyan-500/50 bg-cyan-500/20 text-cyan-300">
              {activeWeapon.toUpperCase()} ({weaponTimer}s)
            </span>
          )}
          {bombs > 0 && (
            <button
              type="button"
              onClick={onTriggerBomb}
              className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-rose-500 bg-rose-600 hover:bg-rose-500 text-white shadow-md active:scale-95 cursor-pointer"
            >
              TRIGGER EMP [B]
            </button>
          )}
        </div>
      </footer>
    </>
  );
}

interface GalagaOverlaysProps {
  gameState: GameState;
  score: number;
  wave: number;
  onRestart: () => void;
}

export function GalagaOverlays({ gameState, score, wave, onRestart }: GalagaOverlaysProps) {
  return (
    <>
      {/* Warning Overlay for Flagship Boss */}
      {gameState === "boss_alert" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 pointer-events-none text-center p-4">
          <h2 className="text-3xl sm:text-5xl font-black text-purple-400 tracking-widest animate-ping mb-2">
            ⚠️ WARNING ⚠️
          </h2>
          <p className="text-lg sm:text-2xl font-bold text-white tracking-widest">
            FLAGSHIP MOTHERSHIP APPROACHING
          </p>
        </div>
      )}

      {/* Game Over Banner */}
      {gameState === "game_over" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-xs text-center p-4">
          <h2 className="text-3xl sm:text-5xl font-black text-rose-500 tracking-widest mb-3 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]">
            GAME OVER
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 mb-6">
            FINAL SCORE: <span className="text-amber-400 font-bold">{score}</span>
          </p>
          <button
            type="button"
            onClick={onRestart}
            className="px-6 py-2.5 rounded-full border border-sky-400 bg-sky-500/20 hover:bg-sky-500/30 text-white font-bold text-sm sm:text-base tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            PLAY AGAIN (SPACE / TAP)
          </button>
        </div>
      )}

      {/* Stage Clear Banner */}
      {gameState === "stage_clear" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none text-center p-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-amber-300 tracking-widest drop-shadow-[0_0_15px_rgba(251,191,36,0.9)] animate-pulse">
            STAGE {wave} CLEAR
          </h2>
        </div>
      )}

      {/* Mobile control hint */}
      <div className="sm:hidden absolute bottom-3 right-4 z-20 text-[10px] text-zinc-500 pointer-events-none">
        Drag to Move &bull; Tap to Fire &bull; EMP Button
      </div>
    </>
  );
}
