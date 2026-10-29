"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  WeaponType,
  PowerUpType,
  GameState,
  Laser,
  EnemyBullet,
  Particle,
  ScorePopup,
  PowerUp,
  Enemy,
  FlagshipBoss,
  Star,
  PlayerState,
} from "./types";
import { arcadeAudio } from "./audio";
import {
  drawVectorPlayer,
  drawVectorBoss,
  drawVectorButterfly,
  drawVectorWasp,
  drawTractorBeam,
  drawFlagshipBoss,
  drawPowerUp,
} from "./renderer";
import { GalagaHud, GalagaOverlays } from "./hud";

export default function GalagaPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);
  const [bombs, setBombs] = useState(1);
  const [activeWeapon, setActiveWeapon] = useState<WeaponType>("standard");
  const [weaponTimer, setWeaponTimer] = useState(0);
  const [hasShield, setHasShield] = useState(false);
  const [isDualFighter, setIsDualFighter] = useState(false);
  const [bossHpPercent, setBossHpPercent] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [isEnteringWarp, setIsEnteringWarp] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsEnteringWarp(false), 60);
    return () => clearTimeout(timer);
  }, []);

  // 60fps Refs
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const livesRef = useRef(3);
  const waveRef = useRef(1);
  const bombsRef = useRef(1);
  const gameStateRef = useRef<GameState>("ready");

  const playerRef = useRef<PlayerState>({
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    speed: 4.6,
    isInvulnerable: false,
    invulnerableTimer: 0,
    weapon: "standard",
    weaponDuration: 0,
    hasShield: false,
    isDual: false,
    isCaptured: false,
    captureProgress: 0,
  });

  const keysRef = useRef<{ left: boolean; right: boolean; fire: boolean }>({
    left: false,
    right: false,
    fire: false,
  });

  const lasersRef = useRef<Laser[]>([]);
  const enemyBulletsRef = useRef<EnemyBullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const flagshipRef = useRef<FlagshipBoss | null>(null);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scorePopupsRef = useRef<ScorePopup[]>([]);
  const starsRef = useRef<Star[]>([]);
  const lastFireTimeRef = useRef(0);
  const gridOffsetRef = useRef({ x: 0, dir: 1, timer: 0 });
  const screenShakeRef = useRef(0);

  const spawnWaveRef = useRef<(stageNum: number) => void>(() => {});
  const restartGameRef = useRef<() => void>(() => {});
  const triggerEmpBombRef = useRef<() => void>(() => {});

  // High score from local storage (deferred via rAF to avoid cascading renders in React 19)
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem("galaga_vector_highscore");
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed)) {
            highScoreRef.current = parsed;
            setHighScore(parsed);
          }
        }
      } catch {}
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Trigger EMP Bomb
  const triggerEmpBomb = useCallback(() => {
    if (bombsRef.current <= 0 || gameStateRef.current !== "playing") return;
    bombsRef.current -= 1;
    setBombs(bombsRef.current);
    arcadeAudio.playBomb();
    screenShakeRef.current = 24;

    enemyBulletsRef.current = [];
    const enemies = enemiesRef.current;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.state === "diving" || e.state === "tractor_beam") {
        e.health -= 3;
        if (e.health <= 0) {
          scoreRef.current += 300;
          setScore(scoreRef.current);
          enemies.splice(i, 1);
        }
      }
    }

    if (flagshipRef.current) {
      flagshipRef.current.coreHealth = Math.max(0, flagshipRef.current.coreHealth - 30);
    }

    for (let i = 0; i < 40; i++) {
      const angle = (Math.PI * 2 * i) / 40;
      particlesRef.current.push({
        x: playerRef.current.x,
        y: playerRef.current.y,
        vx: Math.cos(angle) * 12,
        vy: Math.sin(angle) * 12,
        len: 16,
        angle,
        vRot: 0,
        color: "#38bdf8",
        alpha: 1,
        life: 0,
        maxLife: 30,
      });
    }
  }, []);

  // Spawn Wave or Flagship Boss
  const spawnWave = useCallback((stageNum: number) => {
    lasersRef.current = [];
    enemyBulletsRef.current = [];
    powerUpsRef.current = [];

    // Stage 3, 6, 9... Flagship Boss
    if (stageNum % 3 === 0) {
      gameStateRef.current = "boss_alert";
      setGameState("boss_alert");
      arcadeAudio.playWarning();
      screenShakeRef.current = 15;

      setTimeout(() => {
        const bossHp = 80 + stageNum * 25;
        flagshipRef.current = {
          x: window.innerWidth / 2,
          y: -150,
          targetY: 130,
          vx: 2.2,
          coreHealth: bossHp,
          maxCoreHealth: bossHp,
          turretLeftHealth: 25 + stageNum * 5,
          turretRightHealth: 25 + stageNum * 5,
          phase: 1,
          shieldActive: true,
          attackTimer: 0,
          specialTimer: 0,
          sweepAngle: 0,
        };
        enemiesRef.current = [];
        setBossHpPercent(100);
        gameStateRef.current = "playing";
        setGameState("playing");
      }, 2000);
      return;
    }

    flagshipRef.current = null;
    setBossHpPercent(null);

    const enemies: Enemy[] = [];
    let id = 0;
    const enterSpeedFactor = 0.12 / Math.min(1.5, 1 + (stageNum - 1) * 0.05);

    // Row 0: 4 Bosses
    for (let c = 2; c <= 5; c++) {
      enemies.push({
        id: ++id,
        type: "boss",
        x: 0,
        y: 0,
        gridX: c,
        gridY: 0,
        state: "entering",
        health: 2,
        maxHealth: 2,
        enterProgress: -id * enterSpeedFactor,
        diveProgress: 0,
        diveStartX: 0,
        diveStartY: 0,
        diveCurve: c % 2 === 0 ? 1 : -1,
        divePattern: Math.random() > 0.45 ? "tractor" : "escort",
        wingPhase: 0,
      });
    }

    // Row 1: 8 Butterflies
    for (let c = 0; c < 8; c++) {
      enemies.push({
        id: ++id,
        type: "butterfly",
        x: 0,
        y: 0,
        gridX: c,
        gridY: 1,
        state: "entering",
        health: 1,
        maxHealth: 1,
        enterProgress: -id * enterSpeedFactor,
        diveProgress: 0,
        diveStartX: 0,
        diveStartY: 0,
        diveCurve: c < 4 ? -1 : 1,
        divePattern: "figure8",
        wingPhase: 0,
      });
    }

    // Rows 2-3: 8 Wasps each
    for (let r = 2; r <= 3; r++) {
      for (let c = 0; c < 8; c++) {
        enemies.push({
          id: ++id,
          type: "wasp",
          x: 0,
          y: 0,
          gridX: c,
          gridY: r,
          state: "entering",
          health: 1,
          maxHealth: 1,
          enterProgress: -id * enterSpeedFactor,
          diveProgress: 0,
          diveStartX: 0,
          diveStartY: 0,
          diveCurve: c < 4 ? -1 : 1,
          divePattern: "zigzag",
          wingPhase: 0,
        });
      }
    }

    enemiesRef.current = enemies;
    gameStateRef.current = "playing";
    setGameState("playing");
  }, []);

  const restartGame = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    livesRef.current = 3;
    setLives(3);
    waveRef.current = 1;
    setWave(1);
    bombsRef.current = 1;
    setBombs(1);
    playerRef.current.invulnerableTimer = 120;
    playerRef.current.isInvulnerable = true;
    playerRef.current.weapon = "standard";
    playerRef.current.weaponDuration = 0;
    playerRef.current.hasShield = false;
    playerRef.current.isDual = false;
    playerRef.current.isCaptured = false;
    setActiveWeapon("standard");
    setHasShield(false);
    setIsDualFighter(false);
    setBossHpPercent(null);
    spawnWave(1);
  }, [spawnWave]);

  useEffect(() => {
    spawnWaveRef.current = spawnWave;
    restartGameRef.current = restartGame;
    triggerEmpBombRef.current = triggerEmpBomb;
  }, [spawnWave, restartGame, triggerEmpBomb]);

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    playerRef.current.x = width / 2;
    playerRef.current.y = height - 70;

    const stars: Star[] = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.3 + Math.random() * 1.5,
        len: 1 + Math.random() * 3,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }
    starsRef.current = stars;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      playerRef.current.y = height - 70;
    };
    window.addEventListener("resize", handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keysRef.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keysRef.current.right = true;
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        keysRef.current.fire = true;
        if (gameStateRef.current === "game_over") restartGameRef.current();
      }
      if (e.key === "b" || e.key === "B") triggerEmpBombRef.current();
      if (e.key === "Escape") router.push("/");
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keysRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keysRef.current.right = false;
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") keysRef.current.fire = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let isPointerDown = false;
    const clampToArena = (clientX: number) => {
      const playWidth = Math.min(width - 40, 640);
      const playMinX = width / 2 - playWidth / 2;
      const playMaxX = width / 2 + playWidth / 2;
      return Math.max(playMinX + 18, Math.min(playMaxX - 18, clientX));
    };

    const handlePointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      keysRef.current.fire = true;
      playerRef.current.x = clampToArena(e.clientX);
      if (gameStateRef.current === "game_over") restartGameRef.current();
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (isPointerDown) playerRef.current.x = clampToArena(e.clientX);
    };
    const handlePointerUp = () => {
      isPointerDown = false;
      keysRef.current.fire = false;
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    spawnWaveRef.current(1);

    const createExplosion = (x: number, y: number, color: string, isBig = false) => {
      const parts = particlesRef.current;
      const count = isBig ? 32 : 16;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = (isBig ? 3 : 2) + Math.random() * 6;
        parts.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          len: 4 + Math.random() * (isBig ? 12 : 8),
          angle: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.3,
          color,
          alpha: 1,
          life: 0,
          maxLife: (isBig ? 35 : 25) + Math.random() * 20,
        });
      }
    };

    const addScorePopup = (x: number, y: number, text: string, color = "#facc15") => {
      scorePopupsRef.current.push({ x, y, text, color, alpha: 1, life: 0 });
    };

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      const timeScale = Math.min(dt * 60, 2.0);

      // Screen Shake
      ctx.save();
      if (screenShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        const shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(shakeX, shakeY);
        screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
      }

      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, width, height);

      // Parallax Stars
      ctx.lineWidth = 1.2;
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.y += s.speed * 0.7 * timeScale;
        if (s.y > height) {
          s.y = 0;
          s.x = Math.random() * width;
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.brightness})`;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + s.len);
        ctx.stroke();
      }

      // Arena bounds
      const playWidth = Math.min(width - 40, 640);
      const playMinX = width / 2 - playWidth / 2;
      const playMaxX = width / 2 + playWidth / 2;

      ctx.save();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(playMinX, 60);
      ctx.lineTo(playMinX, height - 20);
      ctx.moveTo(playMaxX, 60);
      ctx.lineTo(playMaxX, height - 20);
      ctx.stroke();
      ctx.restore();

      const grid = gridOffsetRef.current;
      grid.timer += dt * 0.9;
      grid.x = Math.sin(grid.timer) * 24;

      const colSpacing = 42;
      const rowSpacing = 36;
      const gridTotalWidth = 7 * colSpacing;
      const gridOriginX = width / 2 - gridTotalWidth / 2 + grid.x;
      const gridOriginY = 85;

      const player = playerRef.current;

      // 1. Flagship Boss
      const flagship = flagshipRef.current;
      if (flagship && gameStateRef.current === "playing") {
        if (flagship.y < flagship.targetY) {
          flagship.y += dt * 80;
        } else {
          flagship.x += flagship.vx * timeScale;
          if (flagship.x < playMinX + 130 || flagship.x > playMaxX - 130) {
            flagship.vx *= -1;
          }

          flagship.attackTimer += dt;
          if (flagship.attackTimer > 1.4) {
            flagship.attackTimer = 0;
            if (flagship.turretLeftHealth > 0) {
              enemyBulletsRef.current.push({ x: flagship.x - 80, y: flagship.y + 36, vx: -1.2, vy: 4.2, type: "standard" });
            }
            if (flagship.turretRightHealth > 0) {
              enemyBulletsRef.current.push({ x: flagship.x + 80, y: flagship.y + 36, vx: 1.2, vy: 4.2, type: "standard" });
            }
            if (!flagship.shieldActive) {
              for (let a = -2; a <= 2; a++) {
                enemyBulletsRef.current.push({ x: flagship.x, y: flagship.y + 20, vx: a * 1.4, vy: 3.8, type: "boss_orb" });
              }
            }
          }

          flagship.specialTimer += dt;
          if (flagship.turretLeftHealth <= 0 && flagship.turretRightHealth <= 0) {
            flagship.shieldActive = false;
          } else {
            flagship.shieldActive = Math.sin(flagship.specialTimer * 0.8) > -0.2;
          }
        }

        drawFlagshipBoss(ctx, flagship);
        setBossHpPercent(Math.max(0, Math.round((flagship.coreHealth / flagship.maxCoreHealth) * 100)));

        if (flagship.coreHealth <= 0) {
          arcadeAudio.playExplosion("boss");
          screenShakeRef.current = 30;
          createExplosion(flagship.x, flagship.y, "#a855f7", true);
          createExplosion(flagship.x - 80, flagship.y, "#ec4899", true);
          createExplosion(flagship.x + 80, flagship.y, "#ec4899", true);
          scoreRef.current += 3000;
          setScore(scoreRef.current);
          addScorePopup(flagship.x, flagship.y, "+3000 FLAGSHIP DESTROYED", "#a855f7");

          powerUpsRef.current.push({ x: flagship.x, y: flagship.y, vy: 2.2, type: "dual", spin: 0 });
          flagshipRef.current = null;
          setBossHpPercent(null);

          gameStateRef.current = "stage_clear";
          setGameState("stage_clear");
          setTimeout(() => {
            waveRef.current += 1;
            setWave(waveRef.current);
            spawnWaveRef.current(waveRef.current);
          }, 2000);
        }
      }

      // 2. Enemies AI
      const enemies = enemiesRef.current;
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        e.wingPhase += dt * 5;

        const targetX = gridOriginX + e.gridX * colSpacing;
        const targetY = gridOriginY + e.gridY * rowSpacing;

        if (e.state === "entering") {
          e.enterProgress += dt * 0.38;
          if (e.enterProgress > 0) {
            const t = Math.min(e.enterProgress, 1);
            const startX = e.diveCurve > 0 ? -40 : width + 40;
            const startY = 80;
            const midX = width / 2 + e.diveCurve * 150;
            const midY = height * 0.45;

            const u = 1 - t;
            e.x = u * u * startX + 2 * u * t * midX + t * t * targetX;
            e.y = u * u * startY + 2 * u * t * midY + t * t * targetY;

            if (t >= 1) {
              e.state = "in_grid";
              e.x = targetX;
              e.y = targetY;
            }
          }
        } else if (e.state === "in_grid") {
          e.x = targetX;
          e.y = targetY;

          if (Math.random() < 0.0035 * timeScale * Math.min(2.5, 1 + (waveRef.current - 1) * 0.25)) {
            e.state = e.divePattern === "tractor" && Math.random() > 0.4 ? "tractor_beam" : "diving";
            e.diveProgress = 0;
            e.diveStartX = e.x;
            e.diveStartY = e.y;
            e.diveCurve = Math.random() > 0.5 ? 1 : -1;
            e.tractorTimer = 0;
            e.hasFiredDive = false;
            e.hasFiredDive2 = false;

            if (e.type === "boss" && e.divePattern === "escort") {
              const escorts = enemies.filter((other) => other.type === "butterfly" && other.state === "in_grid");
              escorts.slice(0, 2).forEach((esc, idx) => {
                esc.state = "diving";
                esc.diveProgress = 0;
                esc.diveStartX = esc.x;
                esc.diveStartY = esc.y;
                esc.diveCurve = idx === 0 ? -1 : 1;
                esc.hasFiredDive = false;
                esc.hasFiredDive2 = false;
              });
            }
          }

          // Harassing fire from formation
          if (Math.random() < 0.002 * timeScale && enemyBulletsRef.current.length < 18) {
            if (Math.abs(player.x - e.x) < 130) {
              const angle = Math.atan2(player.y - e.y, player.x - e.x);
              enemyBulletsRef.current.push({
                x: e.x,
                y: e.y + 12,
                vx: Math.cos(angle) * 3.0,
                vy: Math.sin(angle) * 3.0,
                type: "standard",
              });
              arcadeAudio.playEnemyLaser();
            }
          }
        } else if (e.state === "tractor_beam") {
          e.tractorTimer = (e.tractorTimer || 0) + dt;
          if (e.y < height * 0.35) {
            e.y += dt * 100;
          } else {
            drawTractorBeam(ctx, e.x, e.y + 16, height - 60);
            if (Math.random() < 0.1) arcadeAudio.playTractorBeam();

            const beamSpreadAtPlayer = 90;
            if (
              !player.isInvulnerable &&
              !player.isCaptured &&
              player.y > height * 0.7 &&
              Math.abs(player.x - e.x) < beamSpreadAtPlayer * 0.7
            ) {
              player.isCaptured = true;
              arcadeAudio.playExplosion("player");
              livesRef.current -= 1;
              setLives(livesRef.current);
              addScorePopup(player.x, player.y - 30, "SHIP CAPTURED!", "#ef4444");

              if (livesRef.current <= 0) {
                gameStateRef.current = "game_over";
                setGameState("game_over");
              } else {
                setTimeout(() => {
                  player.isCaptured = false;
                  player.x = width / 2;
                  player.isInvulnerable = true;
                  player.invulnerableTimer = 140;
                }, 1500);
              }
            }

            if (e.tractorTimer > 4.5) {
              e.state = "returning";
              e.y = -30;
            }
          }
        } else if (e.state === "diving") {
          e.diveProgress += dt * (0.34 + Math.min(0.2, (waveRef.current - 1) * 0.03));
          const t = e.diveProgress;

          if (e.type === "wasp") {
            e.x = e.diveStartX + Math.sin(t * Math.PI * 6) * 55 + (player.x - e.diveStartX) * (t * 0.6);
            e.y = e.diveStartY + t * (height - 30);

            // Stinger 1
            if (t >= 0.28 && !e.hasFiredDive && enemyBulletsRef.current.length < 22) {
              e.hasFiredDive = true;
              const angle = Math.atan2(player.y - e.y, player.x - e.x);
              enemyBulletsRef.current.push({
                x: e.x,
                y: e.y + 10,
                vx: Math.cos(angle) * 4.0,
                vy: Math.sin(angle) * 4.0,
                type: "stinger",
              });
              arcadeAudio.playEnemyLaser();
            }
            // Stinger 2
            if (t >= 0.58 && !e.hasFiredDive2 && enemyBulletsRef.current.length < 22) {
              e.hasFiredDive2 = true;
              const angle = Math.atan2(player.y - e.y, player.x - e.x);
              enemyBulletsRef.current.push({
                x: e.x,
                y: e.y + 10,
                vx: Math.cos(angle) * 4.2,
                vy: Math.sin(angle) * 4.2,
                type: "stinger",
              });
              arcadeAudio.playEnemyLaser();
            }
          } else if (e.type === "butterfly") {
            e.x = e.diveStartX + Math.sin(t * Math.PI * 2) * (110 * e.diveCurve);
            e.y = e.diveStartY + Math.sin(t * Math.PI) * (height - 60);

            // Dual spread shot on dive
            if (t >= 0.32 && !e.hasFiredDive && enemyBulletsRef.current.length < 22) {
              e.hasFiredDive = true;
              enemyBulletsRef.current.push({ x: e.x - 7, y: e.y + 10, vx: -0.9, vy: 3.2, type: "standard" });
              enemyBulletsRef.current.push({ x: e.x + 7, y: e.y + 10, vx: 0.9, vy: 3.2, type: "standard" });
              arcadeAudio.playEnemyLaser();
            }
          } else {
            // Boss Galaga aimed dual torpedoes
            e.x = e.diveStartX + Math.sin(t * Math.PI * 2) * (70 * e.diveCurve);
            e.y = e.diveStartY + t * (height - 40);

            if (t >= 0.28 && !e.hasFiredDive && enemyBulletsRef.current.length < 22) {
              e.hasFiredDive = true;
              const angle = Math.atan2(player.y - e.y, player.x - e.x);
              enemyBulletsRef.current.push({
                x: e.x - 9,
                y: e.y + 12,
                vx: Math.cos(angle - 0.15) * 3.6,
                vy: Math.sin(angle - 0.15) * 3.6,
                type: "standard",
              });
              enemyBulletsRef.current.push({
                x: e.x + 9,
                y: e.y + 12,
                vx: Math.cos(angle + 0.15) * 3.6,
                vy: Math.sin(angle + 0.15) * 3.6,
                type: "standard",
              });
              arcadeAudio.playEnemyLaser();
            }
          }

          if (t >= 1.25 || e.y > height + 20) {
            e.state = "returning";
            e.y = -30;
          }
        } else if (e.state === "returning") {
          e.y += dt * 85;
          e.x += (targetX - e.x) * 0.05;
          if (e.y >= targetY) {
            e.state = "in_grid";
            e.x = targetX;
            e.y = targetY;
          }
        }

        if (e.enterProgress > 0) {
          if (e.type === "boss") drawVectorBoss(ctx, e.x, e.y, e.health, e.wingPhase);
          else if (e.type === "butterfly") drawVectorButterfly(ctx, e.x, e.y, e.wingPhase);
          else drawVectorWasp(ctx, e.x, e.y, e.wingPhase);
        }
      }

      // Check wave clear
      if (enemies.length === 0 && !flagship && gameStateRef.current === "playing") {
        gameStateRef.current = "stage_clear";
        setGameState("stage_clear");
        setTimeout(() => {
          waveRef.current += 1;
          setWave(waveRef.current);
          spawnWaveRef.current(waveRef.current);
        }, 1800);
      }

      // 3. Player updates
      if (gameStateRef.current === "playing" || gameStateRef.current === "ready") {
        const moveDist = player.speed * timeScale;
        if (keysRef.current.left) player.x -= moveDist;
        if (keysRef.current.right) player.x += moveDist;

        const margin = player.isDual ? 38 : 18;
        player.x = Math.max(playMinX + margin, Math.min(playMaxX - margin, player.x));

        if (player.weaponDuration > 0) {
          player.weaponDuration -= dt;
          setWeaponTimer(Math.max(0, Math.ceil(player.weaponDuration)));
          if (player.weaponDuration <= 0) {
            player.weapon = "standard";
            setActiveWeapon("standard");
          }
        }

        const fireCooldown = player.weapon === "rapid" ? 95 : 190;
        if (keysRef.current.fire && time - lastFireTimeRef.current > fireCooldown) {
          lastFireTimeRef.current = time;
          arcadeAudio.playLaser(player.weapon);

          const spawnAtOffset = (ox: number) => {
            const px = player.x + ox;
            if (player.weapon === "spread") {
              lasersRef.current.push({ x: px, y: player.y - 18, vx: -2.5, vy: -8.5, type: "spread", damage: 1, penetrating: false });
              lasersRef.current.push({ x: px, y: player.y - 18, vx: 0, vy: -9.0, type: "spread", damage: 1, penetrating: false });
              lasersRef.current.push({ x: px, y: player.y - 18, vx: 2.5, vy: -8.5, type: "spread", damage: 1, penetrating: false });
            } else if (player.weapon === "plasma") {
              lasersRef.current.push({ x: px, y: player.y - 20, vx: 0, vy: -7.0, type: "plasma", damage: 3, penetrating: true });
            } else {
              lasersRef.current.push({ x: px - 7, y: player.y - 18, vx: 0, vy: -8.8, type: player.weapon, damage: 1, penetrating: false });
              lasersRef.current.push({ x: px + 7, y: player.y - 18, vx: 0, vy: -8.8, type: player.weapon, damage: 1, penetrating: false });
            }
          };

          if (player.isDual) {
            spawnAtOffset(-22);
            spawnAtOffset(22);
          } else {
            spawnAtOffset(0);
          }
        }

        let isFlicker = false;
        if (player.isInvulnerable) {
          player.invulnerableTimer -= timeScale;
          if (player.invulnerableTimer <= 0) player.isInvulnerable = false;
          isFlicker = Math.floor(player.invulnerableTimer / 4) % 2 === 0;
        }

        drawVectorPlayer(ctx, player.x, player.y, isFlicker, player.isDual, player.hasShield);
      }

      // 4. Lasers
      const lasers = lasersRef.current;
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i];
        l.x += l.vx * timeScale;
        l.y += l.vy * timeScale;

        ctx.save();
        if (l.type === "plasma") {
          ctx.strokeStyle = "#c084fc";
          ctx.lineWidth = 4;
          ctx.shadowColor = "#a855f7";
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(l.x, l.y, 6, 0, Math.PI * 2);
          ctx.stroke();
        } else if (l.type === "spread") {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#0284c7";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(l.x, l.y);
          ctx.lineTo(l.x + l.vx * 2, l.y + 10);
          ctx.stroke();
        } else {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(l.x, l.y);
          ctx.lineTo(l.x, l.y + 10);
          ctx.stroke();
        }
        ctx.restore();

        let laserUsed = false;
        if (flagship) {
          if (flagship.turretLeftHealth > 0 && Math.hypot(l.x - (flagship.x - 80), l.y - (flagship.y + 15)) < 22) {
            flagship.turretLeftHealth -= l.damage;
            arcadeAudio.playExplosion("small");
            laserUsed = !l.penetrating;
            if (flagship.turretLeftHealth <= 0) {
              scoreRef.current += 500;
              setScore(scoreRef.current);
              addScorePopup(flagship.x - 80, flagship.y, "+500 TURRET DESTROYED", "#ec4899");
              createExplosion(flagship.x - 80, flagship.y, "#ec4899");
            }
          } else if (flagship.turretRightHealth > 0 && Math.hypot(l.x - (flagship.x + 80), l.y - (flagship.y + 15)) < 22) {
            flagship.turretRightHealth -= l.damage;
            arcadeAudio.playExplosion("small");
            laserUsed = !l.penetrating;
            if (flagship.turretRightHealth <= 0) {
              scoreRef.current += 500;
              setScore(scoreRef.current);
              addScorePopup(flagship.x + 80, flagship.y, "+500 TURRET DESTROYED", "#ec4899");
              createExplosion(flagship.x + 80, flagship.y, "#ec4899");
            }
          } else if (!flagship.shieldActive && Math.hypot(l.x - flagship.x, l.y - flagship.y) < 32) {
            flagship.coreHealth -= l.damage;
            arcadeAudio.playExplosion("small");
            laserUsed = !l.penetrating;
            createExplosion(l.x, l.y, "#ffffff");
          }
        }

        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (e.enterProgress <= 0) continue;

          const dist = Math.hypot(l.x - e.x, l.y - e.y);
          if (dist < 18) {
            laserUsed = !l.penetrating;
            e.health -= l.damage;

            if (e.health <= 0) {
              arcadeAudio.playExplosion(e.type === "boss" ? "medium" : "small");
              const basePoints = e.type === "boss" ? 200 : e.type === "butterfly" ? 100 : 80;
              const divingBonus = e.state === "diving" || e.state === "tractor_beam" ? 2 : 1;
              const points = basePoints * divingBonus;
              scoreRef.current += points;
              setScore(scoreRef.current);
              addScorePopup(e.x, e.y, `+${points}`);

              if (divingBonus > 1 && Math.random() < 0.28) {
                const types: PowerUpType[] = ["spread", "plasma", "rapid", "shield", "bomb"];
                const dropType = types[Math.floor(Math.random() * types.length)];
                powerUpsRef.current.push({ x: e.x, y: e.y, vy: 2.0, type: dropType, spin: 0 });
              }

              if (scoreRef.current > highScoreRef.current) {
                highScoreRef.current = scoreRef.current;
                setHighScore(scoreRef.current);
                try {
                  localStorage.setItem("galaga_vector_highscore", scoreRef.current.toString());
                } catch {}
              }

              const expColor = e.type === "boss" ? "#eab308" : e.type === "butterfly" ? "#ef4444" : "#06b6d4";
              createExplosion(e.x, e.y, expColor);
              enemies.splice(j, 1);
            } else {
              createExplosion(e.x, e.y, "#ffffff");
            }
            break;
          }
        }

        if (laserUsed || l.y < -20) lasers.splice(i, 1);
      }

      // 5. Power-ups
      const powerUps = powerUpsRef.current;
      for (let i = powerUps.length - 1; i >= 0; i--) {
        const p = powerUps[i];
        p.y += p.vy * timeScale;
        drawPowerUp(ctx, p);

        const hitDist = player.isDual ? 32 : 22;
        if (Math.hypot(p.x - player.x, p.y - player.y) < hitDist) {
          arcadeAudio.playPowerUp();
          if (p.type === "shield") {
            player.hasShield = true;
            setHasShield(true);
            addScorePopup(p.x, p.y, "SHIELD ACTIVATED", "#10b981");
          } else if (p.type === "bomb") {
            bombsRef.current = Math.min(3, bombsRef.current + 1);
            setBombs(bombsRef.current);
            addScorePopup(p.x, p.y, "+1 EMP BOMB (KEY: B)", "#ef4444");
          } else if (p.type === "dual") {
            player.isDual = true;
            setIsDualFighter(true);
            addScorePopup(p.x, p.y, "DUAL FIGHTER DOCKED!", "#f43f5e");
          } else {
            player.weapon = p.type;
            player.weaponDuration = 12;
            setActiveWeapon(p.type);
            setWeaponTimer(12);
            addScorePopup(p.x, p.y, `${p.type.toUpperCase()} CANNONS!`, "#38bdf8");
          }
          powerUps.splice(i, 1);
        } else if (p.y > height + 20) {
          powerUps.splice(i, 1);
        }
      }

      // 6. Enemy bullets
      const enemyBullets = enemyBulletsRef.current;
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        b.x += b.vx * timeScale;
        b.y += b.vy * timeScale;

        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = b.type === "boss_orb" ? "#a855f7" : b.type === "stinger" ? "#facc15" : "#f43f5e";
        ctx.shadowColor = b.type === "boss_orb" ? "#9333ea" : "#e11d48";
        ctx.shadowBlur = 8;

        if (b.type === "boss_orb") {
          ctx.beginPath();
          ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(b.x, b.y - 4);
          ctx.lineTo(b.x + 3, b.y);
          ctx.lineTo(b.x, b.y + 4);
          ctx.lineTo(b.x - 3, b.y);
          ctx.closePath();
          ctx.stroke();
        }
        ctx.restore();

        if (!player.isInvulnerable && gameStateRef.current === "playing") {
          const hitRadius = player.isDual ? 32 : 18;
          if (Math.hypot(b.x - player.x, b.y - player.y) < hitRadius) {
            enemyBullets.splice(i, 1);

            if (player.hasShield) {
              player.hasShield = false;
              setHasShield(false);
              arcadeAudio.playExplosion("small");
              screenShakeRef.current = 10;
              addScorePopup(player.x, player.y, "SHIELD DEFLECTED!", "#06b6d4");
              break;
            }

            if (player.isDual) {
              player.isDual = false;
              setIsDualFighter(false);
              arcadeAudio.playExplosion("medium");
              screenShakeRef.current = 14;
              createExplosion(player.x, player.y, "#f43f5e");
              player.isInvulnerable = true;
              player.invulnerableTimer = 80;
              addScorePopup(player.x, player.y, "WINGMAN LOST", "#ef4444");
              break;
            }

            arcadeAudio.playExplosion("player");
            screenShakeRef.current = 18;
            createExplosion(player.x, player.y, "#38bdf8");
            livesRef.current -= 1;
            setLives(livesRef.current);

            if (livesRef.current <= 0) {
              gameStateRef.current = "game_over";
              setGameState("game_over");
            } else {
              player.x = width / 2;
              player.isInvulnerable = true;
              player.invulnerableTimer = 140;
            }
            break;
          }
        }

        if (b.y > height + 25 || b.y < -40 || b.x < -40 || b.x > width + 40) enemyBullets.splice(i, 1);
      }

      // 7. Enemy ramming
      if (!player.isInvulnerable && gameStateRef.current === "playing") {
        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i];
          if (e.enterProgress <= 0) continue;
          const hitRadius = player.isDual ? 32 : 22;
          if (Math.hypot(e.x - player.x, e.y - player.y) < hitRadius) {
            createExplosion(e.x, e.y, "#ef4444");
            enemies.splice(i, 1);

            if (player.hasShield) {
              player.hasShield = false;
              setHasShield(false);
              arcadeAudio.playExplosion("small");
              screenShakeRef.current = 10;
              addScorePopup(player.x, player.y, "RAM ABSORBED", "#10b981");
              break;
            }

            arcadeAudio.playExplosion("player");
            screenShakeRef.current = 20;
            createExplosion(player.x, player.y, "#38bdf8");
            livesRef.current -= 1;
            setLives(livesRef.current);

            if (livesRef.current <= 0) {
              gameStateRef.current = "game_over";
              setGameState("game_over");
            } else {
              player.x = width / 2;
              player.isInvulnerable = true;
              player.invulnerableTimer = 140;
            }
            break;
          }
        }
      }

      // 8. Particles & Popups
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += timeScale;
        p.x += p.vx * timeScale;
        p.y += p.vy * timeScale;
        p.angle += p.vRot * timeScale;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.moveTo(-p.len / 2, 0);
        ctx.lineTo(p.len / 2, 0);
        ctx.stroke();
        ctx.restore();

        if (p.life >= p.maxLife) particles.splice(i, 1);
      }

      const scorePopups = scorePopupsRef.current;
      for (let i = scorePopups.length - 1; i >= 0; i--) {
        const pop = scorePopups[i];
        pop.life += dt;
        pop.y -= dt * 32;
        pop.alpha = Math.max(0, 1 - pop.life / 1.2);

        ctx.save();
        ctx.fillStyle = pop.color;
        ctx.globalAlpha = pop.alpha;
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.restore();

        if (pop.life >= 1.2) scorePopups.splice(i, 1);
      }

      ctx.restore(); // Restore screen shake
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [router]);

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-black select-none font-mono">
      {/* Seamless Warp Entry Flash */}
      <div
        className={`fixed inset-0 z-50 bg-white pointer-events-none transition-opacity duration-700 ease-out ${
          isEnteringWarp ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* 100% Vector Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full block touch-none" />

      {/* Top Arcade HUD & Bottom Controls */}
      <GalagaHud
        score={score}
        highScore={highScore}
        wave={wave}
        lives={lives}
        bombs={bombs}
        activeWeapon={activeWeapon}
        weaponTimer={weaponTimer}
        hasShield={hasShield}
        isDualFighter={isDualFighter}
        bossHpPercent={bossHpPercent}
        isMuted={isMuted}
        onToggleMute={() => {
          arcadeAudio.isMuted = !arcadeAudio.isMuted;
          setIsMuted(arcadeAudio.isMuted);
        }}
        onTriggerBomb={triggerEmpBomb}
      />

      {/* Status Overlays */}
      <GalagaOverlays
        gameState={gameState}
        score={score}
        wave={wave}
        onRestart={restartGame}
      />
    </div>
  );
}
