/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PlayerState {
  IDLE = 'IDLE',
  WALK = 'WALK',
  RUN = 'RUN',
  SPRINT = 'SPRINT',
  SKID = 'SKID',
  TURN = 'TURN',
  JUMP_START = 'JUMP_START',
  RISING = 'RISING',
  FALLING = 'FALLING',
  LANDING = 'LANDING',
  CROUCH = 'CROUCH',
  HURT = 'HURT',
  KNOCKBACK = 'KNOCKBACK',
  DEAD = 'DEAD',
  POWERED = 'POWERED',
  ATTACKING = 'ATTACKING',
  VICTORY = 'VICTORY',
}

export enum PowerUpType {
  NONE = 'NONE',
  GROWTH = 'GROWTH',
  FIRE_ORB = 'FIRE_ORB',
  SHIELD_ORB = 'SHIELD_ORB',
  SPEED_GEM = 'SPEED_GEM',
}

export enum EnemyType {
  GLOOM_WALKER = 'GLOOM_WALKER',
  ZEPHYR_FLYER = 'ZEPHYR_FLYER',
  ARMORED_BEETLE = 'ARMORED_BEETLE',
  SHADOW_PROWLER = 'SHADOW_PROWLER',
  SPORE_TURRET = 'SPORE_TURRET',
  BOSS_IGNIS = 'BOSS_IGNIS',
  BOSS_DRAKE = 'BOSS_DRAKE',
}

export enum EnemyAIState {
  IDLE = 'IDLE',
  PATROL = 'PATROL',
  TURN = 'TURN',
  CHASE = 'CHASE',
  ATTACK = 'ATTACK',
  SEARCH = 'SEARCH',
  RETREAT = 'RETREAT',
  HURT = 'HURT',
  STUNNED = 'STUNNED',
  DEAD = 'DEAD',
}

export enum PlatformType {
  SOLID = 'SOLID',
  ONE_WAY = 'ONE_WAY',
  MOVING = 'MOVING',
  FALLING = 'FALLING',
  BOUNCE = 'BOUNCE',
  BREAKABLE = 'BREAKABLE',
  ICE = 'ICE',
  SPIKES = 'SPIKES',
  LAVA = 'LAVA',
}

export enum CollectibleType {
  PRISM_SHARD = 'PRISM_SHARD',
  ANCIENT_COIN = 'ANCIENT_COIN',
  STAR_RELIC = 'STAR_RELIC',
  HEART = 'HEART',
  POWERUP_GROWTH = 'POWERUP_GROWTH',
  POWERUP_FIRE = 'POWERUP_FIRE',
  POWERUP_SHIELD = 'POWERUP_SHIELD',
  POWERUP_SPEED = 'POWERUP_SPEED',
  EXTRA_LIFE = 'EXTRA_LIFE',
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface PlatformBlock extends Rect {
  id: string;
  type: PlatformType;
  tileTheme?: string;
  textureId?: number;
  // For moving platforms
  startX?: number;
  startY?: number;
  targetX?: number;
  targetY?: number;
  moveSpeed?: number;
  moveProgress?: number;
  moveDirection?: number;
  pauseTimer?: number;
  // For falling platforms
  fallTimer?: number;
  isFalling?: boolean;
  respawnTimer?: number;
  // For breakable platforms
  health?: number;
  broken?: boolean;
  // Bounce force
  bounceMultiplier?: number;
}

export interface CollectibleItem extends Rect {
  id: string;
  type: CollectibleType;
  collected: boolean;
  collectedAnimTimer?: number;
  baseY: number;
  bobOffset: number;
  value: number;
}

export interface Checkpoint extends Rect {
  id: string;
  activated: boolean;
  spawnX: number;
  spawnY: number;
}

export interface LevelExit extends Rect {
  id: string;
  targetWorld: number;
  targetLevel: number;
}

export interface Projectile extends Rect {
  id: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  isPlayer: boolean;
  damage: number;
  color: string;
  glowColor: string;
  trailTimer?: number;
}

export interface LevelData {
  id: string;
  worldIndex: number;
  levelIndex: number;
  name: string;
  subtitle: string;
  theme: 'green_valley' | 'crystal_caverns' | 'sunset_desert' | 'frozen_peaks' | 'mystic_forest' | 'volcanic_fortress';
  width: number;
  height: number;
  spawnPoint: Vector2D;
  timeLimit: number;
  musicTrack: 'valley' | 'cavern' | 'desert' | 'ice' | 'mystic' | 'volcano' | 'boss';
  platforms: PlatformBlock[];
  collectibles: CollectibleItem[];
  enemies: {
    id: string;
    type: EnemyType;
    x: number;
    y: number;
    patrolMinX?: number;
    patrolMaxX?: number;
    patrolMinY?: number;
    patrolMaxY?: number;
  }[];
  checkpoints: Checkpoint[];
  exit: LevelExit;
  ambientParticles?: 'leaves' | 'crystals' | 'dust' | 'snow' | 'spores' | 'embers';
}

export interface PlayerStats {
  score: number;
  coins: number;
  starsCollected: number;
  lives: number;
  health: number;
  maxHealth: number;
  powerUp: PowerUpType;
  powerUpTimer: number;
  currentWorld: number;
  currentLevel: number;
}

export interface SaveData {
  unlockedWorlds: number[];
  completedLevels: { [levelKey: string]: boolean };
  levelHighScores: { [levelKey: string]: number };
  levelBestTimes: { [levelKey: string]: number };
  levelStars: { [levelKey: string]: number };
  totalCoins: number;
  totalPrisms: number;
  soundVolume: number;
  musicVolume: number;
  screenShakeEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  gravity?: number;
  rotation?: number;
  rotSpeed?: number;
  scaleX?: number;
  scaleY?: number;
  shape?: 'circle' | 'square' | 'sparkle' | 'shard' | 'ring' | 'text' | 'smoke';
  text?: string;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  vy: number;
  scale: number;
}
