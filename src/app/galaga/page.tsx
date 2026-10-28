"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Pure vector game entities
interface Laser {
  x: number;
  y: number;
  vy: number;
}

interface EnemyBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  len: number;
  angle: number;
  vRot: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

type EnemyType = "boss" | "butterfly" | "wasp";

interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  state: "entering" | "in_grid" | "diving" | "returning";
  health: number;
  enterProgress: number;
  diveProgress: number;
  diveStartX: number;
  diveStartY: number;
  diveCurve: number; // direction factor
  wingPhase: number;
}

interface Star {
  x: number;
  y: number;
  speed: number;
  len: number;
  brightness: number;
}

export default function GalagaPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<"ready" | "playing" | "game_over" | "stage_clear">("ready");

  // Keep live references for the 60fps requestAnimationFrame loop
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const waveRef = useRef(1);
  const gameStateRef = useRef<"ready" | "playing" | "game_over" | "stage_clear">("ready");

  const playerRef = useRef({
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    speed: 5.5,
    isInvulnerable: false,
    invulnerableTimer: 0,
  });

  const keysRef = useRef<{ left: boolean; right: boolean; fire: boolean }>({
    left: false,
    right: false,
    fire: false,
  });

  const lasersRef = useRef<Laser[]>([]);
  const enemyBulletsRef = useRef<EnemyBullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const lastFireTimeRef = useRef(0);
  const gridOffsetRef = useRef({ x: 0, dir: 1, timer: 0 });

  // Sync state to ref
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    waveRef.current = wave;
  }, [wave]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Load high score from local storage
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem("galaga_vector_highscore");
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed)) setHighScore(parsed);
        }
      } catch {
        // localStorage not available
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Initialize Wave
  const spawnWave = useCallback((stageNum: number) => {
    const enemies: Enemy[] = [];
    let id = 0;
    const enterSpeedFactor = 0.08 / Math.min(1.5, 1 + (stageNum - 1) * 0.05);

    // Grid: 4 rows x 8 columns
    // Row 0: 4 Bosses (centered)
    // Row 1: 8 Butterflies
    // Row 2-3: 8 Wasps each
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
        enterProgress: -id * enterSpeedFactor,
        diveProgress: 0,
        diveStartX: 0,
        diveStartY: 0,
        diveCurve: c % 2 === 0 ? 1 : -1,
        wingPhase: 0,
      });
    }

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
        enterProgress: -id * enterSpeedFactor,
        diveProgress: 0,
        diveStartX: 0,
        diveStartY: 0,
        diveCurve: c < 4 ? -1 : 1,
        wingPhase: 0,
      });
    }

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
          enterProgress: -id * enterSpeedFactor,
          diveProgress: 0,
          diveStartX: 0,
          diveStartY: 0,
          diveCurve: c < 4 ? -1 : 1,
          wingPhase: 0,
        });
      }
    }

    enemiesRef.current = enemies;
    lasersRef.current = [];
    enemyBulletsRef.current = [];
    setGameState("playing");
  }, []);

  // Reset Game
  const restartGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setWave(1);
    playerRef.current.invulnerableTimer = 120;
    playerRef.current.isInvulnerable = true;
    spawnWave(1);
  }, [spawnWave]);

  // Main Canvas & Game Loop
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

    // Initialize parallax stars
    const stars: Star[] = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: 0.3 + Math.random() * 1.2,
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

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysRef.current.left = true;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysRef.current.right = true;
      }
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        keysRef.current.fire = true;
        if (gameStateRef.current === "game_over") {
          restartGame();
        }
      }
      if (e.key === "Escape") {
        router.push("/");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysRef.current.left = false;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysRef.current.right = false;
      }
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        keysRef.current.fire = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Touch / Mouse controls
    let isPointerDown = false;
    const handlePointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      keysRef.current.fire = true;
      playerRef.current.x = Math.max(25, Math.min(width - 25, e.clientX));
      if (gameStateRef.current === "game_over") {
        restartGame();
      }
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (isPointerDown) {
        playerRef.current.x = Math.max(25, Math.min(width - 25, e.clientX));
      }
    };
    const handlePointerUp = () => {
      isPointerDown = false;
      keysRef.current.fire = false;
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // Spawn first wave
    spawnWave(1);

    // Vector Drawing Helpers
    const drawVectorPlayer = (x: number, y: number, isFlicker: boolean) => {
      if (isFlicker) return;
      ctx.save();
      ctx.translate(x, y);

      // Glowing Neon Cyan Vector Starfighter
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.2;
      ctx.shadowColor = "#0284c7";
      ctx.shadowBlur = 10;

      // Outer hull
      ctx.beginPath();
      ctx.moveTo(0, -18); // Nose
      ctx.lineTo(8, -4);
      ctx.lineTo(16, 12); // Right wing tip
      ctx.lineTo(11, 14);
      ctx.lineTo(6, 6);
      ctx.lineTo(5, 14); // Right engine
      ctx.lineTo(-5, 14); // Left engine
      ctx.lineTo(-6, 6);
      ctx.lineTo(-11, 14);
      ctx.lineTo(-16, 12); // Left wing tip
      ctx.lineTo(-8, -4);
      ctx.closePath();
      ctx.stroke();

      // Cockpit wireframe
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(3, -2);
      ctx.lineTo(0, 4);
      ctx.lineTo(-3, -2);
      ctx.closePath();
      ctx.stroke();

      // Twin vector thrust exhaust (flickering orange/cyan lines)
      const thrust = 4 + Math.random() * 8;
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-3, 14);
      ctx.lineTo(-3, 14 + thrust);
      ctx.moveTo(3, 14);
      ctx.lineTo(3, 14 + thrust);
      ctx.stroke();

      ctx.restore();
    };

    const drawVectorBoss = (x: number, y: number, health: number, wingPhase: number) => {
      ctx.save();
      ctx.translate(x, y);

      // Color shifts to emerald green on hit 1
      const isDamaged = health === 1;
      ctx.strokeStyle = isDamaged ? "#10b981" : "#eab308";
      ctx.lineWidth = 2;
      ctx.shadowColor = isDamaged ? "#059669" : "#ca8a04";
      ctx.shadowBlur = 8;

      const flap = Math.sin(wingPhase) * 3;

      // Hexagonal outer vector frame
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(12 + flap, -6);
      ctx.lineTo(16 + flap, 6);
      ctx.lineTo(8, 12);
      ctx.lineTo(0, 8);
      ctx.lineTo(-8, 12);
      ctx.lineTo(-16 - flap, 6);
      ctx.lineTo(-12 - flap, -6);
      ctx.closePath();
      ctx.stroke();

      // Inner command core (neon cyan diamond)
      ctx.strokeStyle = "#38bdf8";
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 6);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.stroke();

      ctx.restore();
    };

    const drawVectorButterfly = (x: number, y: number, wingPhase: number) => {
      ctx.save();
      ctx.translate(x, y);

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#dc2626";
      ctx.shadowBlur = 8;

      const wing = Math.sin(wingPhase) * 6;

      // Flapping chevron wings
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(8 + wing, -12);
      ctx.lineTo(14 + wing, 0);
      ctx.lineTo(6, 8);
      ctx.lineTo(0, 4);
      ctx.lineTo(-6, 8);
      ctx.lineTo(-14 - wing, 0);
      ctx.lineTo(-8 - wing, -12);
      ctx.closePath();
      ctx.stroke();

      // Wing center rib
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(0, 6);
      ctx.stroke();

      ctx.restore();
    };

    const drawVectorWasp = (x: number, y: number, wingPhase: number) => {
      ctx.save();
      ctx.translate(x, y);

      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#0891b2";
      ctx.shadowBlur = 8;

      const flutter = Math.sin(wingPhase) * 2;

      // Dart arrow body
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.lineTo(8, -2 + flutter);
      ctx.lineTo(12, -8);
      ctx.lineTo(0, -12);
      ctx.lineTo(-12, -8);
      ctx.lineTo(-8, -2 + flutter);
      ctx.closePath();
      ctx.stroke();

      // Stinger
      ctx.strokeStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(0, 14);
      ctx.stroke();

      ctx.restore();
    };

    const createExplosion = (x: number, y: number, color: string) => {
      const parts = particlesRef.current;
      for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 5;
        parts.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          len: 4 + Math.random() * 8,
          angle: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.3,
          color,
          alpha: 1,
          life: 0,
          maxLife: 25 + Math.random() * 20,
        });
      }
    };

    // Main 60fps Game Loop
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // 1. Clear with deep space backdrop
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, width, height);

      // 2. Parallax Vector Stars
      ctx.lineWidth = 1.2;
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.y += s.speed;
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

      // 3. Grid sway calculation (classic Galaga breathing formation)
      const grid = gridOffsetRef.current;
      grid.timer += dt * 1.5;
      grid.x = Math.sin(grid.timer) * 35;

      const gridOriginX = width / 2 - 160 + grid.x;
      const gridOriginY = 90;
      const colSpacing = 44;
      const rowSpacing = 38;

      // 4. Update and Draw Enemies
      const enemies = enemiesRef.current;
      let activeEnemiesCount = 0;

      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        activeEnemiesCount++;
        e.wingPhase += dt * 8;

        const targetX = gridOriginX + e.gridX * colSpacing;
        const targetY = gridOriginY + e.gridY * rowSpacing;

        if (e.state === "entering") {
          e.enterProgress += dt * 0.75;
          if (e.enterProgress > 0) {
            const t = Math.min(e.enterProgress, 1);
            // Swooping bezier entrance curve
            const startX = e.diveCurve > 0 ? -40 : width + 40;
            const startY = 80;
            const midX = width / 2 + e.diveCurve * 150;
            const midY = height * 0.45;

            // Quadratic bezier calculation
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

          // Random dive-bombing trigger
          if (Math.random() < 0.002 * waveRef.current) {
            e.state = "diving";
            e.diveProgress = 0;
            e.diveStartX = e.x;
            e.diveStartY = e.y;
            e.diveCurve = Math.random() > 0.5 ? 1 : -1;
          }
        } else if (e.state === "diving") {
          e.diveProgress += dt * (0.65 + waveRef.current * 0.08);
          const t = e.diveProgress;

          // Parabolic dive through screen towards player
          e.x = e.diveStartX + Math.sin(t * Math.PI * 2) * (70 * e.diveCurve);
          e.y = e.diveStartY + t * (height - 40);

          // Enemy shoots laser at player during dive
          if (Math.random() < 0.025 && enemyBulletsRef.current.length < 8) {
            enemyBulletsRef.current.push({
              x: e.x,
              y: e.y + 10,
              vx: (Math.random() - 0.5) * 1.2,
              vy: 3.8 + waveRef.current * 0.3,
            });
          }

          if (t >= 1.2 || e.y > height + 20) {
            // Loop back from top of screen into formation
            e.state = "returning";
            e.y = -30;
          }
        } else if (e.state === "returning") {
          e.y += dt * 110;
          e.x += (targetX - e.x) * 0.06;
          if (e.y >= targetY) {
            e.state = "in_grid";
            e.x = targetX;
            e.y = targetY;
          }
        }

        // Draw enemy based on type
        if (e.enterProgress > 0) {
          if (e.type === "boss") {
            drawVectorBoss(e.x, e.y, e.health, e.wingPhase);
          } else if (e.type === "butterfly") {
            drawVectorButterfly(e.x, e.y, e.wingPhase);
          } else {
            drawVectorWasp(e.x, e.y, e.wingPhase);
          }
        }
      }

      // Check wave clear
      if (activeEnemiesCount === 0 && gameStateRef.current === "playing") {
        setGameState("stage_clear");
        setTimeout(() => {
          setWave((w) => {
            const next = w + 1;
            spawnWave(next);
            return next;
          });
        }, 1800);
      }

      // 5. Update and Draw Player
      const player = playerRef.current;
      if (gameStateRef.current === "playing" || gameStateRef.current === "ready") {
        if (keysRef.current.left) player.x -= player.speed;
        if (keysRef.current.right) player.x += player.speed;
        player.x = Math.max(25, Math.min(width - 25, player.x));

        // Fire laser
        if (keysRef.current.fire && time - lastFireTimeRef.current > 180) {
          lastFireTimeRef.current = time;
          lasersRef.current.push({ x: player.x - 7, y: player.y - 18, vy: -12 });
          lasersRef.current.push({ x: player.x + 7, y: player.y - 18, vy: -12 });
        }

        // Invulnerability flicker
        let isFlicker = false;
        if (player.isInvulnerable) {
          player.invulnerableTimer--;
          if (player.invulnerableTimer <= 0) {
            player.isInvulnerable = false;
          }
          isFlicker = Math.floor(player.invulnerableTimer / 4) % 2 === 0;
        }

        drawVectorPlayer(player.x, player.y, isFlicker);
      }

      // 6. Update and Draw Player Lasers
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#ffffff";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 10;
      const lasers = lasersRef.current;

      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i];
        l.y += l.vy;

        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x, l.y + 10);
        ctx.stroke();

        // Laser vs Enemy Collision
        let laserUsed = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (e.enterProgress <= 0) continue;

          const dist = Math.hypot(l.x - e.x, l.y - e.y);
          if (dist < 18) {
            laserUsed = true;
            e.health--;

            if (e.health <= 0) {
              const points = e.type === "boss" ? 200 : e.type === "butterfly" ? 100 : 80;
              setScore((s) => {
                const nextScore = s + points;
                if (nextScore > highScore) {
                  setHighScore(nextScore);
                  localStorage.setItem("galaga_vector_highscore", nextScore.toString());
                }
                return nextScore;
              });

              const expColor =
                e.type === "boss" ? "#eab308" : e.type === "butterfly" ? "#ef4444" : "#06b6d4";
              createExplosion(e.x, e.y, expColor);
              enemies.splice(j, 1);
            } else {
              // Boss took 1 hit
              createExplosion(e.x, e.y, "#ffffff");
            }
            break;
          }
        }

        if (laserUsed || l.y < -20) {
          lasers.splice(i, 1);
        }
      }

      // 7. Update and Draw Enemy Bullets
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#f43f5e";
      ctx.shadowColor = "#e11d48";
      ctx.shadowBlur = 8;
      const enemyBullets = enemyBulletsRef.current;

      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const b = enemyBullets[i];
        b.x += b.vx;
        b.y += b.vy;

        // Draw diamond vector bullet
        ctx.beginPath();
        ctx.moveTo(b.x, b.y - 4);
        ctx.lineTo(b.x + 3, b.y);
        ctx.lineTo(b.x, b.y + 4);
        ctx.lineTo(b.x - 3, b.y);
        ctx.closePath();
        ctx.stroke();

        // Collision with player
        if (!player.isInvulnerable && gameStateRef.current === "playing") {
          const dist = Math.hypot(b.x - player.x, b.y - player.y);
          if (dist < 16) {
            enemyBullets.splice(i, 1);
            createExplosion(player.x, player.y, "#38bdf8");
            setLives((curr) => {
              const nextLives = curr - 1;
              if (nextLives <= 0) {
                setGameState("game_over");
              } else {
                player.x = width / 2;
                player.isInvulnerable = true;
                player.invulnerableTimer = 140;
              }
              return nextLives;
            });
            break;
          }
        }

        if (b.y > height + 20) {
          enemyBullets.splice(i, 1);
        }
      }

      // 8. Enemy Ship Collision with Player (dive-bomb ramming)
      if (!player.isInvulnerable && gameStateRef.current === "playing") {
        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i];
          if (e.enterProgress <= 0) continue;
          const dist = Math.hypot(e.x - player.x, e.y - player.y);
          if (dist < 22) {
            createExplosion(e.x, e.y, "#ef4444");
            createExplosion(player.x, player.y, "#38bdf8");
            enemies.splice(i, 1);

            setLives((curr) => {
              const nextLives = curr - 1;
              if (nextLives <= 0) {
                setGameState("game_over");
              } else {
                player.x = width / 2;
                player.isInvulnerable = true;
                player.invulnerableTimer = 140;
              }
              return nextLives;
            });
            break;
          }
        }
      }

      // 9. Update and Draw Vector Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.vRot;
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

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      ctx.shadowBlur = 0;
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
  }, [spawnWave, restartGame, highScore, router]);

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-black select-none font-mono">
      {/* 100% Vector Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full block touch-none" />

      {/* Top Arcade HUD Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-8 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-6 sm:gap-10">
          <div>
            <div className="text-[10px] sm:text-xs text-rose-500 font-bold tracking-wider">
              1UP
            </div>
            <div className="text-sm sm:text-lg font-bold text-white tracking-widest">
              {score.toString().padStart(6, "0")}
            </div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-sky-400 font-bold tracking-wider">
              HIGH SCORE
            </div>
            <div className="text-sm sm:text-lg font-bold text-white tracking-widest">
              {highScore.toString().padStart(6, "0")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 pointer-events-auto">
          <div className="text-right">
            <div className="text-[10px] sm:text-xs text-amber-400 font-bold tracking-wider">
              STAGE
            </div>
            <div className="text-sm sm:text-lg font-bold text-white tracking-widest text-right">
              {wave}
            </div>
          </div>

          {/* Exit / Return Home */}
          <Link
            href="/"
            aria-label="Return to Earth"
            className="px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-xs sm:text-sm text-zinc-300 hover:text-white transition-all shadow-md active:scale-95"
          >
            &larr; Earth [Esc]
          </Link>
        </div>
      </header>

      {/* Bottom HUD: Lives */}
      <footer className="absolute bottom-3 left-4 sm:left-8 z-20 flex items-center gap-2 pointer-events-none">
        <span className="text-[11px] sm:text-xs text-zinc-400 font-medium mr-1">SHIPS:</span>
        {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className="w-5 h-5 text-sky-400 stroke-current fill-none stroke-2 drop-shadow-[0_0_4px_rgba(56,189,248,0.8)]"
          >
            <polygon points="12,2 20,20 16,18 12,14 8,18 4,20" />
          </svg>
        ))}
      </footer>

      {/* On-screen Banner Overlay */}
      {gameState === "game_over" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/65 backdrop-blur-xs text-center p-4">
          <h2 className="text-3xl sm:text-5xl font-black text-rose-500 tracking-widest mb-3 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]">
            GAME OVER
          </h2>
          <p className="text-sm sm:text-base text-zinc-300 mb-6">
            FINAL SCORE: <span className="text-amber-400 font-bold">{score}</span>
          </p>
          <button
            type="button"
            onClick={restartGame}
            className="px-6 py-2.5 rounded-full border border-sky-400 bg-sky-500/20 hover:bg-sky-500/30 text-white font-bold text-sm sm:text-base tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            PLAY AGAIN (SPACE / TAP)
          </button>
        </div>
      )}

      {gameState === "stage_clear" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none text-center p-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-amber-300 tracking-widest drop-shadow-[0_0_15px_rgba(251,191,36,0.9)] animate-pulse">
            STAGE {wave} CLEAR
          </h2>
        </div>
      )}

      {/* Mobile control hint */}
      <div className="sm:hidden absolute bottom-3 right-4 z-20 text-[10px] text-zinc-500 pointer-events-none">
        Drag to Move &bull; Tap to Fire
      </div>
    </div>
  );
}
