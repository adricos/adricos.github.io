// -------------------------------------------------------------
// Domain Types & Entity Interfaces for Galaga Vector Arcade
// -------------------------------------------------------------

export type WeaponType = "standard" | "spread" | "plasma" | "rapid";

export type PowerUpType = "spread" | "plasma" | "rapid" | "shield" | "bomb" | "dual";

export type EnemyType = "boss" | "butterfly" | "wasp";

export type GameState = "ready" | "playing" | "game_over" | "stage_clear" | "boss_alert";

export interface Laser {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: WeaponType;
  damage: number;
  penetrating: boolean;
}

export interface EnemyBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type?: "standard" | "stinger" | "boss_orb";
}

export interface Particle {
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

export interface ScorePopup {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
}

export interface PowerUp {
  x: number;
  y: number;
  vy: number;
  type: PowerUpType;
  spin: number;
}

export interface Enemy {
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
  hasFiredDive?: boolean;
  hasFiredDive2?: boolean;
}

export interface FlagshipBoss {
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

export interface Star {
  x: number;
  y: number;
  speed: number;
  len: number;
  brightness: number;
}

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  isInvulnerable: boolean;
  invulnerableTimer: number;
  weapon: WeaponType;
  weaponDuration: number;
  hasShield: boolean;
  isDual: boolean;
  isCaptured: boolean;
  captureProgress: number;
}
