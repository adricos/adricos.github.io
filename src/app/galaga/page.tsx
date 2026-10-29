"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EspiralSvg } from "../espiral-svg";

// -------------------------------------------------------------
// Pure Vector Web Audio Synthesizer (Zero External Dependencies)
// -------------------------------------------------------------
class ArcadeAudio {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public playLaser(type: "standard" | "spread" | "plasma" | "rapid") {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === "plasma") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.22);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === "spread") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } else {
      // standard & rapid
      osc.type = "square";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  }

  public playExplosion(kind: "small" | "medium" | "boss" | "player") {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * (kind === "boss" ? 0.7 : kind === "player" ? 0.5 : 0.25);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(kind === "boss" ? 400 : 700, now);
    filter.frequency.exponentialRampToValueAtTime(30, now + (kind === "boss" ? 0.7 : 0.3));

    const gain = this.ctx.createGain();
    const peak = kind === "boss" ? 0.45 : kind === "player" ? 0.4 : 0.22;
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (kind === "boss" ? 0.7 : 0.3));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  public playPowerUp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [330, 440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.18, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.1);
    });
  }

  public playTractorBeam() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.15);
    osc.frequency.linearRampToValueAtTime(140, now + 0.3);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playBomb() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.6);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  public playWarning() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [0, 0.25, 0.5].forEach((t) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(440, now + t);
      osc.frequency.setValueAtTime(880, now + t + 0.1);
      gain.gain.setValueAtTime(0.2, now + t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + t + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + t);
      osc.stop(now + t + 0.2);
    });
  }
}

const audio = new ArcadeAudio();

// -------------------------------------------------------------
// Entity Interfaces
// -------------------------------------------------------------
export type WeaponType = "standard" | "spread" | "plasma" | "rapid";

interface Laser {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: WeaponType;
  damage: number;
  penetrating: boolean;
}

interface EnemyBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type?: "standard" | "stinger" | "boss_orb";
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

interface ScorePopup {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
}

export type PowerUpType = "spread" | "plasma" | "rapid" | "shield" | "bomb" | "dual";

interface PowerUp {
  x: number;
  y: number;
  vy: number;
  type: PowerUpType;
  spin: number;
}

type EnemyType = "boss" | "butterfly" | "wasp";

interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  state: "entering" | "in_grid" | "diving" | "returning" | "tractor_beam";
  health: number;
  maxHealth: number;
  enterProgress: number;
  diveProgress: number;
  diveStartX: number;
  diveStartY: number;
  diveCurve: number;
  divePattern: "zigzag" | "figure8" | "escort" | "tractor";
  tractorTimer?: number;
  wingPhase: number;
}

interface BossPart {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  alive: boolean;
  name: "left_turret" | "right_turret" | "core";
}

interface FlagshipBoss {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  coreHealth: number;
  maxCoreHealth: number;
  turretLeftHealth: number;
  turretRightHealth: number;
  phase: 1 | 2 | 3;
  shieldActive: boolean;
  attackTimer: number;
  specialTimer: number;
  sweepAngle: number;
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
  const [bombs, setBombs] = useState(1);
  const [activeWeapon, setActiveWeapon] = useState<WeaponType>("standard");
  const [weaponTimer, setWeaponTimer] = useState(0);
  const [hasShield, setHasShield] = useState(false);
  const [isDualFighter, setIsDualFighter] = useState(false);
  const [bossHpPercent, setBossHpPercent] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [gameState, setGameState] = useState<"ready" | "playing" | "game_over" | "stage_clear" | "boss_alert">("ready");
  const [isEnteringWarp, setIsEnteringWarp] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEnteringWarp(false);
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // 60fps Refs
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const livesRef = useRef(3);
  const waveRef = useRef(1);
  const bombsRef = useRef(1);
  const gameStateRef = useRef<"ready" | "playing" | "game_over" | "stage_clear" | "boss_alert">("ready");

  const playerRef = useRef({
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    speed: 4.6,
    isInvulnerable: false,
    invulnerableTimer: 0,
    weapon: "standard" as WeaponType,
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

  // High score from local storage
  useEffect(() => {
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
  }, []);

  // Trigger EMP Bomb
  const triggerEmpBomb = useCallback(() => {
    if (bombsRef.current <= 0 || gameStateRef.current !== "playing") return;
    bombsRef.current -= 1;
    setBombs(bombsRef.current);
    audio.playBomb();
    screenShakeRef.current = 24;

    // Vaporize bullets & damage diving enemies
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

    // Damage flagship boss if active
    if (flagshipRef.current) {
      flagshipRef.current.coreHealth = Math.max(0, flagshipRef.current.coreHealth - 30);
    }

    // Flash bomb particles
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

    // Stage 3, 6, 9... are Epic Flagship Boss stages!
    if (stageNum % 3 === 0) {
      gameStateRef.current = "boss_alert";
      setGameState("boss_alert");
      audio.playWarning();
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

    // Row 0: 4 Bosses (with tractor beam and escort potential)
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

    // Row 1: 8 Butterflies (figure-8 loops)
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

    // Rows 2-3: 8 Wasps each (fast zig-zags & stingers)
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
      if (e.key === "b" || e.key === "B") {
        triggerEmpBombRef.current();
      }
      if (e.key === "Escape") router.push("/");
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keysRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keysRef.current.right = false;
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") keysRef.current.fire = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Pointer controls
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

    // ---------------------------------------------------------
    // Vector Drawing Helpers
    // ---------------------------------------------------------
    const drawVectorPlayer = (x: number, y: number, isFlicker: boolean, isDual: boolean, hasShieldActive: boolean) => {
      if (isFlicker) return;

      const drawShip = (offsetX: number) => {
        ctx.save();
        ctx.translate(x + offsetX, y);

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.2;
        ctx.shadowColor = "#0284c7";
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(8, -4);
        ctx.lineTo(16, 12);
        ctx.lineTo(11, 14);
        ctx.lineTo(6, 6);
        ctx.lineTo(5, 14);
        ctx.lineTo(-5, 14);
        ctx.lineTo(-6, 6);
        ctx.lineTo(-11, 14);
        ctx.lineTo(-16, 12);
        ctx.lineTo(-8, -4);
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(3, -2);
        ctx.lineTo(0, 4);
        ctx.lineTo(-3, -2);
        ctx.closePath();
        ctx.stroke();

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

      if (isDual) {
        drawShip(-22);
        drawShip(22);
      } else {
        drawShip(0);
      }

      // Energy Shield Bubble
      if (hasShieldActive) {
        ctx.save();
        ctx.translate(x, y);
        const radius = isDual ? 42 : 26;
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#22d3ee";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Shimmer arc
        ctx.strokeStyle = "#ffffff";
        ctx.beginPath();
        const start = (performance.now() * 0.004) % (Math.PI * 2);
        ctx.arc(0, 0, radius, start, start + Math.PI * 0.5);
        ctx.stroke();
        ctx.restore();
      }
    };

    const drawVectorBoss = (x: number, y: number, health: number, wingPhase: number) => {
      ctx.save();
      ctx.translate(x, y);
      const isDamaged = health === 1;
      ctx.strokeStyle = isDamaged ? "#10b981" : "#eab308";
      ctx.lineWidth = 2;
      ctx.shadowColor = isDamaged ? "#059669" : "#ca8a04";
      ctx.shadowBlur = 8;

      const flap = Math.sin(wingPhase) * 3;
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
      ctx.beginPath();
      ctx.moveTo(0, 12);
      ctx.lineTo(8, -2 + flutter);
      ctx.lineTo(12, -8);
      ctx.lineTo(0, -12);
      ctx.lineTo(-12, -8);
      ctx.lineTo(-8, -2 + flutter);
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(0, 14);
      ctx.stroke();
      ctx.restore();
    };

    const drawTractorBeam = (startX: number, startY: number, targetHeight: number) => {
      ctx.save();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 14;

      const spread = 90;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX - spread, targetHeight);
      ctx.lineTo(startX + spread, targetHeight);
      ctx.closePath();
      ctx.stroke();

      // Shimmering vector waves inside beam
      const t = performance.now() * 0.005;
      for (let y = startY + 20; y < targetHeight; y += 24) {
        const span = ((y - startY) / (targetHeight - startY)) * spread;
        const waveOffset = Math.sin(t + y * 0.05) * 6;
        ctx.strokeStyle = `rgba(147, 197, 253, ${0.3 + Math.sin(t * 2 + y) * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(startX - span + waveOffset, y);
        ctx.lineTo(startX + span + waveOffset, y);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawFlagshipBoss = (boss: FlagshipBoss) => {
      ctx.save();
      ctx.translate(boss.x, boss.y);

      // Main vector dreadnought body
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#9333ea";
      ctx.shadowBlur = 16;

      ctx.beginPath();
      ctx.moveTo(0, 50); // Central beak
      ctx.lineTo(45, 25);
      ctx.lineTo(110, 40); // Right wing tip
      ctx.lineTo(120, -20);
      ctx.lineTo(60, -45);
      ctx.lineTo(0, -35); // Rear
      ctx.lineTo(-60, -45);
      ctx.lineTo(-120, -20);
      ctx.lineTo(-110, 40); // Left wing tip
      ctx.lineTo(-45, 25);
      ctx.closePath();
      ctx.stroke();

      // Left Turret
      if (boss.turretLeftHealth > 0) {
        ctx.strokeStyle = "#ec4899";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-80, 15, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.moveTo(-80, 15);
        ctx.lineTo(-80, 36);
        ctx.stroke();
      }

      // Right Turret
      if (boss.turretRightHealth > 0) {
        ctx.strokeStyle = "#ec4899";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(80, 15, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.moveTo(80, 15);
        ctx.lineTo(80, 36);
        ctx.stroke();
      }

      // Central Core
      ctx.strokeStyle = boss.shieldActive ? "#06b6d4" : "#ef4444";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();

      if (boss.shieldActive) {
        ctx.strokeStyle = "#ffffff";
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        // Exposed core pulsating
        const pulse = 10 + Math.sin(performance.now() * 0.01) * 4;
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(0, 0, pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const drawPowerUp = (p: PowerUp) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      p.spin += 0.04;

      const colors: Record<PowerUpType, string> = {
        spread: "#38bdf8",
        plasma: "#a855f7",
        rapid: "#f59e0b",
        shield: "#10b981",
        bomb: "#ef4444",
        dual: "#f43f5e",
      };

      const color = colors[p.type];
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;

      // Rotating diamond vector capsule
      ctx.rotate(p.spin);
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(10, 0);
      ctx.lineTo(0, 12);
      ctx.lineTo(-10, 0);
      ctx.closePath();
      ctx.stroke();

      // Letter identifier inside capsule
      ctx.rotate(-p.spin);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const labels: Record<PowerUpType, string> = {
        spread: "S",
        plasma: "P",
        rapid: "R",
        shield: "D",
        bomb: "B",
        dual: "2X",
      };
      ctx.fillText(labels[p.type], 0, 0);

      ctx.restore();
    };

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
      scorePopupsRef.current.push({
        x,
        y,
        text,
        color,
        alpha: 1,
        life: 0,
      });
    };

    // ---------------------------------------------------------
    // 60FPS Game Loop
    // ---------------------------------------------------------
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      const timeScale = Math.min(dt * 60, 2.0);

      // Handle Screen Shake
      ctx.save();
      if (screenShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        const shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(shakeX, shakeY);
        screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
      }

      // 1. Deep space background
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, width, height);

      // 2. Parallax Vector Stars
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

      // 3. Arcade Boundaries
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

      // -------------------------------------------------------
      // 4. Update Flagship Boss (if active on wave 3, 6, 9)
      // -------------------------------------------------------
      const flagship = flagshipRef.current;
      if (flagship && gameStateRef.current === "playing") {
        if (flagship.y < flagship.targetY) {
          flagship.y += dt * 80;
        } else {
          // Sway side to side
          flagship.x += flagship.vx * timeScale;
          if (flagship.x < playMinX + 130 || flagship.x > playMaxX - 130) {
            flagship.vx *= -1;
          }

          // Attack cycle
          flagship.attackTimer += dt;
          if (flagship.attackTimer > 1.4) {
            flagship.attackTimer = 0;
            // Turret shots
            if (flagship.turretLeftHealth > 0) {
              enemyBulletsRef.current.push({
                x: flagship.x - 80,
                y: flagship.y + 36,
                vx: -1.2,
                vy: 4.2,
                type: "standard",
              });
            }
            if (flagship.turretRightHealth > 0) {
              enemyBulletsRef.current.push({
                x: flagship.x + 80,
                y: flagship.y + 36,
                vx: 1.2,
                vy: 4.2,
                type: "standard",
              });
            }

            // Central core spreads if exposed
            if (!flagship.shieldActive) {
              for (let a = -2; a <= 2; a++) {
                enemyBulletsRef.current.push({
                  x: flagship.x,
                  y: flagship.y + 20,
                  vx: a * 1.4,
                  vy: 3.8,
                  type: "boss_orb",
                });
              }
            }
          }

          // Shield cycle: lower shield when turrets die or every 8s
          flagship.specialTimer += dt;
          if (flagship.turretLeftHealth <= 0 && flagship.turretRightHealth <= 0) {
            flagship.shieldActive = false;
          } else {
            flagship.shieldActive = Math.sin(flagship.specialTimer * 0.8) > -0.2;
          }
        }

        drawFlagshipBoss(flagship);
        setBossHpPercent(Math.max(0, Math.round((flagship.coreHealth / flagship.maxCoreHealth) * 100)));

        // Flagship defeated check
        if (flagship.coreHealth <= 0) {
          audio.playExplosion("boss");
          screenShakeRef.current = 30;
          createExplosion(flagship.x, flagship.y, "#a855f7", true);
          createExplosion(flagship.x - 80, flagship.y, "#ec4899", true);
          createExplosion(flagship.x + 80, flagship.y, "#ec4899", true);
          scoreRef.current += 3000;
          setScore(scoreRef.current);
          addScorePopup(flagship.x, flagship.y, "+3000 FLAGSHIP DESTROYED", "#a855f7");

          // Drop double fighter reward on boss kill!
          powerUpsRef.current.push({
            x: flagship.x,
            y: flagship.y,
            vy: 2.2,
            type: "dual",
            spin: 0,
          });

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

      // -------------------------------------------------------
      // 5. Update & Draw Enemies with Differentiated AI
      // -------------------------------------------------------
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

          // Trigger dives
          if (Math.random() < 0.0008 * timeScale * Math.min(2.2, 1 + (waveRef.current - 1) * 0.2)) {
            e.state = e.divePattern === "tractor" && Math.random() > 0.4 ? "tractor_beam" : "diving";
            e.diveProgress = 0;
            e.diveStartX = e.x;
            e.diveStartY = e.y;
            e.diveCurve = Math.random() > 0.5 ? 1 : -1;
            e.tractorTimer = 0;

            // Escort dives: Boss summons adjacent butterflies
            if (e.type === "boss" && e.divePattern === "escort") {
              const escorts = enemies.filter((other) => other.type === "butterfly" && other.state === "in_grid");
              escorts.slice(0, 2).forEach((esc, idx) => {
                esc.state = "diving";
                esc.diveProgress = 0;
                esc.diveStartX = esc.x;
                esc.diveStartY = esc.y;
                esc.diveCurve = idx === 0 ? -1 : 1;
              });
            }
          }
        } else if (e.state === "tractor_beam") {
          // Boss moves to mid-screen and casts tractor beam cone
          e.tractorTimer = (e.tractorTimer || 0) + dt;
          if (e.y < height * 0.35) {
            e.y += dt * 100;
          } else {
            // Emitting tractor beam!
            drawTractorBeam(e.x, e.y + 16, height - 60);
            if (Math.random() < 0.1) audio.playTractorBeam();

            // Check if player caught in cone
            const beamSpreadAtPlayer = 90;
            if (
              !player.isInvulnerable &&
              !player.isCaptured &&
              player.y > height * 0.7 &&
              Math.abs(player.x - e.x) < beamSpreadAtPlayer * 0.7
            ) {
              player.isCaptured = true;
              audio.playExplosion("player");
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
          e.diveProgress += dt * (0.32 + Math.min(0.2, (waveRef.current - 1) * 0.03));
          const t = e.diveProgress;

          // Differentiated Trajectories by Alien Type!
          if (e.type === "wasp") {
            // Aggressive fast zig-zag targeting player X
            e.x = e.diveStartX + Math.sin(t * Math.PI * 6) * 55 + (player.x - e.diveStartX) * (t * 0.6);
            e.y = e.diveStartY + t * (height - 30);

            // Fast aimed stinger
            if (t > 0.3 && t < 0.35 && enemyBulletsRef.current.length < 5) {
              const angle = Math.atan2(player.y - e.y, player.x - e.x);
              enemyBulletsRef.current.push({
                x: e.x,
                y: e.y + 10,
                vx: Math.cos(angle) * 3.8,
                vy: Math.sin(angle) * 3.8,
                type: "stinger",
              });
            }
          } else if (e.type === "butterfly") {
            // Figure-8 looping arcs
            e.x = e.diveStartX + Math.sin(t * Math.PI * 2) * (110 * e.diveCurve);
            e.y = e.diveStartY + Math.sin(t * Math.PI) * (height - 60);

            if (Math.random() < 0.01 * timeScale && enemyBulletsRef.current.length < 5) {
              enemyBulletsRef.current.push({
                x: e.x,
                y: e.y + 10,
                vx: (Math.random() - 0.5) * 1.5,
                vy: 2.8,
                type: "standard",
              });
            }
          } else {
            // Boss Alien Dive
            e.x = e.diveStartX + Math.sin(t * Math.PI * 2) * (70 * e.diveCurve);
            e.y = e.diveStartY + t * (height - 40);

            if (Math.random() < 0.015 * timeScale && enemyBulletsRef.current.length < 5) {
              enemyBulletsRef.current.push({
                x: e.x,
                y: e.y + 10,
                vx: (Math.random() - 0.5) * 0.8,
                vy: 3.2,
                type: "standard",
              });
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

        // Draw Alien
        if (e.enterProgress > 0) {
          if (e.type === "boss") drawVectorBoss(e.x, e.y, e.health, e.wingPhase);
          else if (e.type === "butterfly") drawVectorButterfly(e.x, e.y, e.wingPhase);
          else drawVectorWasp(e.x, e.y, e.wingPhase);
        }
      }

      // Check wave clear (when non-boss wave cleared)
      if (enemies.length === 0 && !flagship && gameStateRef.current === "playing") {
        gameStateRef.current = "stage_clear";
        setGameState("stage_clear");
        setTimeout(() => {
          waveRef.current += 1;
          setWave(waveRef.current);
          spawnWaveRef.current(waveRef.current);
        }, 1800);
      }

      // -------------------------------------------------------
      // 6. Update Player & Weapon Timers
      // -------------------------------------------------------
      if (gameStateRef.current === "playing" || gameStateRef.current === "ready") {
        const moveDist = player.speed * timeScale;
        if (keysRef.current.left) player.x -= moveDist;
        if (keysRef.current.right) player.x += moveDist;

        const margin = player.isDual ? 38 : 18;
        player.x = Math.max(playMinX + margin, Math.min(playMaxX - margin, player.x));

        // Weapon timer expiration
        if (player.weaponDuration > 0) {
          player.weaponDuration -= dt;
          setWeaponTimer(Math.max(0, Math.ceil(player.weaponDuration)));
          if (player.weaponDuration <= 0) {
            player.weapon = "standard";
            setActiveWeapon("standard");
          }
        }

        // Fire rate & projectile creation
        const fireCooldown = player.weapon === "rapid" ? 95 : 190;
        if (keysRef.current.fire && time - lastFireTimeRef.current > fireCooldown) {
          lastFireTimeRef.current = time;
          audio.playLaser(player.weapon);

          const spawnAtOffset = (ox: number) => {
            const px = player.x + ox;
            if (player.weapon === "spread") {
              lasersRef.current.push({ x: px, y: player.y - 18, vx: -2.5, vy: -8.5, type: "spread", damage: 1, penetrating: false });
              lasersRef.current.push({ x: px, y: player.y - 18, vx: 0, vy: -9.0, type: "spread", damage: 1, penetrating: false });
              lasersRef.current.push({ x: px, y: player.y - 18, vx: 2.5, vy: -8.5, type: "spread", damage: 1, penetrating: false });
            } else if (player.weapon === "plasma") {
              lasersRef.current.push({ x: px, y: player.y - 20, vx: 0, vy: -7.0, type: "plasma", damage: 3, penetrating: true });
            } else {
              // standard & rapid
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

        // Invulnerability flicker
        let isFlicker = false;
        if (player.isInvulnerable) {
          player.invulnerableTimer -= timeScale;
          if (player.invulnerableTimer <= 0) player.isInvulnerable = false;
          isFlicker = Math.floor(player.invulnerableTimer / 4) % 2 === 0;
        }

        drawVectorPlayer(player.x, player.y, isFlicker, player.isDual, player.hasShield);
      }

      // -------------------------------------------------------
      // 7. Update & Draw Player Lasers
      // -------------------------------------------------------
      const lasers = lasersRef.current;
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i];
        l.x += l.vx * timeScale;
        l.y += l.vy * timeScale;

        // Draw laser according to weapon type
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

        // Check Flagship Boss collision
        let laserUsed = false;
        if (flagship) {
          // Check turrets
          if (flagship.turretLeftHealth > 0 && Math.hypot(l.x - (flagship.x - 80), l.y - (flagship.y + 15)) < 22) {
            flagship.turretLeftHealth -= l.damage;
            audio.playExplosion("small");
            laserUsed = !l.penetrating;
            if (flagship.turretLeftHealth <= 0) {
              scoreRef.current += 500;
              setScore(scoreRef.current);
              addScorePopup(flagship.x - 80, flagship.y, "+500 TURRET DESTROYED", "#ec4899");
              createExplosion(flagship.x - 80, flagship.y, "#ec4899");
            }
          } else if (flagship.turretRightHealth > 0 && Math.hypot(l.x - (flagship.x + 80), l.y - (flagship.y + 15)) < 22) {
            flagship.turretRightHealth -= l.damage;
            audio.playExplosion("small");
            laserUsed = !l.penetrating;
            if (flagship.turretRightHealth <= 0) {
              scoreRef.current += 500;
              setScore(scoreRef.current);
              addScorePopup(flagship.x + 80, flagship.y, "+500 TURRET DESTROYED", "#ec4899");
              createExplosion(flagship.x + 80, flagship.y, "#ec4899");
            }
          } else if (!flagship.shieldActive && Math.hypot(l.x - flagship.x, l.y - flagship.y) < 32) {
            // Core hit!
            flagship.coreHealth -= l.damage;
            audio.playExplosion("small");
            laserUsed = !l.penetrating;
            createExplosion(l.x, l.y, "#ffffff");
          }
        }

        // Enemy grid collision
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (e.enterProgress <= 0) continue;

          const dist = Math.hypot(l.x - e.x, l.y - e.y);
          if (dist < 18) {
            laserUsed = !l.penetrating;
            e.health -= l.damage;

            if (e.health <= 0) {
              audio.playExplosion(e.type === "boss" ? "medium" : "small");
              const basePoints = e.type === "boss" ? 200 : e.type === "butterfly" ? 100 : 80;
              const divingBonus = e.state === "diving" || e.state === "tractor_beam" ? 2 : 1;
              const points = basePoints * divingBonus;
              scoreRef.current += points;
              setScore(scoreRef.current);
              addScorePopup(e.x, e.y, `+${points}`);

              // Chance of Power-Up Drop on diving enemies
              if (divingBonus > 1 && Math.random() < 0.28) {
                const types: PowerUpType[] = ["spread", "plasma", "rapid", "shield", "bomb"];
                const dropType = types[Math.floor(Math.random() * types.length)];
                powerUpsRef.current.push({
                  x: e.x,
                  y: e.y,
                  vy: 2.0,
                  type: dropType,
                  spin: 0,
                });
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

        if (laserUsed || l.y < -20) {
          lasers.splice(i, 1);
        }
      }

      // -------------------------------------------------------
      // 8. Update & Draw Power-Ups
      // -------------------------------------------------------
      const powerUps = powerUpsRef.current;
      for (let i = powerUps.length - 1; i >= 0; i--) {
        const p = powerUps[i];
        p.y += p.vy * timeScale;
        drawPowerUp(p);

        // Player pickup collision
        const hitDist = player.isDual ? 32 : 22;
        if (Math.hypot(p.x - player.x, p.y - player.y) < hitDist) {
          audio.playPowerUp();
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

      // -------------------------------------------------------
      // 9. Update & Draw Enemy Bullets
      // -------------------------------------------------------
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

        // Player collision
        if (!player.isInvulnerable && gameStateRef.current === "playing") {
          const hitRadius = player.isDual ? 32 : 18;
          if (Math.hypot(b.x - player.x, b.y - player.y) < hitRadius) {
            enemyBullets.splice(i, 1);

            // Shield absorbs hit
            if (player.hasShield) {
              player.hasShield = false;
              setHasShield(false);
              audio.playExplosion("small");
              screenShakeRef.current = 10;
              addScorePopup(player.x, player.y, "SHIELD DEFLECTED!", "#06b6d4");
              break;
            }

            // Dual fighter loses 1 wing ship before losing life
            if (player.isDual) {
              player.isDual = false;
              setIsDualFighter(false);
              audio.playExplosion("medium");
              screenShakeRef.current = 14;
              createExplosion(player.x, player.y, "#f43f5e");
              player.isInvulnerable = true;
              player.invulnerableTimer = 80;
              addScorePopup(player.x, player.y, "WINGMAN LOST", "#ef4444");
              break;
            }

            // Player hit
            audio.playExplosion("player");
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

        if (b.y > height + 20 || b.y < -30) {
          enemyBullets.splice(i, 1);
        }
      }

      // -------------------------------------------------------
      // 10. Enemy Ship Ramming Collision
      // -------------------------------------------------------
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
              audio.playExplosion("small");
              screenShakeRef.current = 10;
              addScorePopup(player.x, player.y, "RAM ABSORBED", "#10b981");
              break;
            }

            audio.playExplosion("player");
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

      // -------------------------------------------------------
      // 11. Particles & Score Popups
      // -------------------------------------------------------
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

      {/* Top Arcade HUD Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-8 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-6 sm:gap-10">
          <div>
            <div className="text-[10px] sm:text-xs text-rose-500 font-bold tracking-wider">1UP</div>
            <div className="text-sm sm:text-lg font-bold text-white tracking-widest">
              {score.toString().padStart(6, "0")}
            </div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-sky-400 font-bold tracking-wider">HIGH SCORE</div>
            <div className="text-sm sm:text-lg font-bold text-white tracking-widest">
              {highScore.toString().padStart(6, "0")}
            </div>
          </div>
        </div>

        {/* Flagship Boss Health Bar (if active) */}
        {bossHpPercent !== null && (
          <div className="flex flex-col items-center pointer-events-auto">
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

        <div className="flex items-center gap-3 sm:gap-6 pointer-events-auto">
          {/* Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              audio.isMuted = !audio.isMuted;
              setIsMuted(audio.isMuted);
            }}
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
            className="p-1.5 sm:p-2 rounded-full text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
          >
            {isMuted ? (
              <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          <div className="text-right">
            <div className="text-[10px] sm:text-xs text-amber-400 font-bold tracking-wider">STAGE</div>
            <div className="text-sm sm:text-lg font-bold text-white tracking-widest text-right">{wave}</div>
          </div>

          <Link
            href="/"
            aria-label="Volver al inicio"
            className="group inline-flex items-center justify-center p-1.5 sm:p-2 rounded-full text-zinc-400 hover:text-white transition-all opacity-70 hover:opacity-100 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <EspiralSvg className="h-6 w-auto sm:h-7 md:h-8 text-current transition-all duration-700 ease-out group-hover:rotate-180 group-hover:text-amber-400 drop-shadow-md" />
          </Link>
        </div>
      </header>

      {/* Bottom HUD: Lives, Shields, Bombs, Weapon Status */}
      <footer className="absolute bottom-3 left-4 sm:left-8 right-4 sm:right-8 z-20 flex items-center justify-between pointer-events-none">
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
              onClick={triggerEmpBomb}
              className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border border-rose-500 bg-rose-600 hover:bg-rose-500 text-white shadow-md active:scale-95 cursor-pointer"
            >
              TRIGGER EMP [B]
            </button>
          )}
        </div>
      </footer>

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
            onClick={restartGame}
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
    </div>
  );
}
