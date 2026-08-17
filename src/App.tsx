/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Boss } from './entities/Boss';
import { Camera } from './engine/Camera';
import { inputManager } from './engine/Input';
import { particleManager } from './engine/Particles';
import { soundManager } from './audio/SoundManager';
import { tileRenderer } from './levels/TileRenderer';
import { getLevelData } from './levels/LevelData';
import {
  LevelData,
  PlayerState,
  PowerUpType,
  PlatformType,
  CollectibleType,
  Projectile,
  SaveData,
  PlayerStats,
} from './types';
import { HUD } from './ui/HUD';
import { MainMenu } from './ui/MainMenu';
import { LevelSelectModal } from './ui/LevelSelectModal';
import { PauseModal } from './ui/PauseModal';
import { VictoryModal } from './ui/VictoryModal';
import { GameOverModal } from './ui/GameOverModal';
import { SettingsModal } from './ui/SettingsModal';
import { ControlsModal } from './ui/ControlsModal';
import { TouchControls } from './ui/TouchControls';

const STORAGE_KEY = 'aura_knight_save_v1';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game UI State
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER'>('MENU');
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Player & Progression Stats
  const [stats, setStats] = useState<PlayerStats>({
    score: 0,
    coins: 0,
    starsCollected: 0,
    lives: 3,
    health: 3,
    maxHealth: 3,
    powerUp: PowerUpType.NONE,
    powerUpTimer: 0,
    currentWorld: 1,
    currentLevel: 1,
  });

  const [timeLeft, setTimeLeft] = useState(300);
  const [currentLevelData, setCurrentLevelData] = useState<LevelData>(getLevelData(1, 1));
  const [starsEarnedInLevel, setStarsEarnedInLevel] = useState(3);
  const [isMuted, setIsMuted] = useState(false);

  // Save Data
  const [saveData, setSaveData] = useState<SaveData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
    return {
      unlockedWorlds: [1],
      completedLevels: {},
      levelHighScores: {},
      levelBestTimes: {},
      levelStars: {},
      totalCoins: 0,
      totalPrisms: 0,
      soundVolume: 0.8,
      musicVolume: 0.5,
      screenShakeEnabled: true,
      hapticsEnabled: true,
    };
  });

  // Entities & Engine References
  const playerRef = useRef<Player | null>(null);
  const enemiesRef = useRef<Enemy[]>([]);
  const bossRef = useRef<Boss | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const projectilesRef = useRef<Projectile[]>([]);
  const levelDataRef = useRef<LevelData>(getLevelData(1, 1));
  const lastTimeRef = useRef<number>(0);
  const isGameRunningRef = useRef<boolean>(false);
  const hitStopTimerRef = useRef<number>(0);

  // Save game helper
  const persistSaveData = useCallback((newData: Partial<SaveData>) => {
    setSaveData((prev) => {
      const updated = { ...prev, ...newData };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save to localStorage', e);
      }
      return updated;
    });
  }, []);

  // Load a Level
  const loadLevel = useCallback((worldIndex: number, levelIndex: number) => {
    const level = getLevelData(worldIndex, levelIndex);
    setCurrentLevelData(level);
    levelDataRef.current = JSON.parse(JSON.stringify(level)); // Deep clone level objects

    // Initialize Player at spawn point
    if (!playerRef.current) {
      playerRef.current = new Player(level.spawnPoint.x, level.spawnPoint.y);
    } else {
      playerRef.current.reset(level.spawnPoint.x, level.spawnPoint.y);
    }

    // Initialize Camera
    if (!cameraRef.current) {
      cameraRef.current = new Camera(960, 540);
    }
    cameraRef.current.setLevelBounds(level.width, level.height);
    cameraRef.current.reset(level.spawnPoint.x, level.spawnPoint.y);

    // Initialize Enemies
    enemiesRef.current = level.enemies.map(
      (e) =>
        new Enemy({
          id: e.id,
          type: e.type,
          x: e.x,
          y: e.y,
          patrolMinX: e.patrolMinX,
          patrolMaxX: e.patrolMaxX,
        })
    );

    // Initialize Boss if in Boss Arena (Stage 3)
    if (levelIndex === 3) {
      bossRef.current = new Boss(level.width - 450, 376, 100, level.width - 100);
      soundManager.playBossRoar();
    } else {
      bossRef.current = null;
    }

    projectilesRef.current = [];
    setTimeLeft(level.timeLimit);

    setStats((prev) => ({
      ...prev,
      currentWorld: worldIndex,
      currentLevel: levelIndex,
      health: playerRef.current?.health || 3,
      maxHealth: playerRef.current?.maxHealth || 3,
    }));

    // Start background music
    soundManager.playMusic(level.musicTrack);
  }, []);

  // Start campaign
  const handleStartGame = () => {
    soundManager.init();
    loadLevel(1, 1);
    setGameState('PLAYING');
    isGameRunningRef.current = true;
  };

  // Select level
  const handleSelectLevel = (world: number, level: number) => {
    soundManager.init();
    setShowLevelSelect(false);
    loadLevel(world, level);
    setGameState('PLAYING');
    isGameRunningRef.current = true;
  };

  // Restart Level
  const handleRestartLevel = () => {
    loadLevel(stats.currentWorld, stats.currentLevel);
    setGameState('PLAYING');
    isGameRunningRef.current = true;
  };

  // Next Level
  const handleNextLevel = () => {
    let nextWorld = stats.currentWorld;
    let nextLevel = stats.currentLevel + 1;
    if (nextLevel > 3) {
      nextLevel = 1;
      nextWorld = Math.min(6, nextWorld + 1);
    }
    loadLevel(nextWorld, nextLevel);
    setGameState('PLAYING');
    isGameRunningRef.current = true;
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Camera Trauma Trigger
  const addCameraTrauma = useCallback((amount: number) => {
    if (saveData.screenShakeEnabled && cameraRef.current) {
      cameraRef.current.addTrauma(amount);
    }
  }, [saveData.screenShakeEnabled]);

  // Projectile Spawner
  const spawnProjectile = useCallback((p: Projectile) => {
    projectilesRef.current.push(p);
  }, []);

  // --- CORE GAME LOOP & PHYSICS ENGINE ---
  useEffect(() => {
    let animId: number;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Clamp delta time to prevent physics tunnel glitches on lag spikes
      const dt = Math.min(0.04, rawDt);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const player = playerRef.current;
      const camera = cameraRef.current;
      const currentLevel = levelDataRef.current;

      // 1. UPDATE INPUT
      inputManager.update();

      // Check Pause Key
      if (inputManager.state.pauseJustPressed && isGameRunningRef.current) {
        if (gameState === 'PLAYING') {
          setGameState('PAUSED');
          soundManager.playCoin();
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
        }
      }

      // 2. PHYSICS & ENTITY UPDATES (When playing)
      if (gameState === 'PLAYING' && player && camera && currentLevel) {
        // Hit Stop frame freeze on heavy impact
        if (hitStopTimerRef.current > 0) {
          hitStopTimerRef.current -= dt;
        } else {
          // Timer countdown
          setTimeLeft((prev) => {
            const next = prev - dt;
            if (next <= 0 && player.state !== PlayerState.DEAD) {
              player.takeDamage(99);
            }
            return Math.max(0, next);
          });

          // A. Update Moving & Falling Platforms
          for (const plat of currentLevel.platforms) {
            if (plat.type === PlatformType.MOVING && plat.startX !== undefined && plat.targetX !== undefined) {
              plat.moveProgress = (plat.moveProgress || 0) + (plat.moveSpeed || 1.5) * (plat.moveDirection || 1) * dt;
              if (plat.moveProgress >= 1) {
                plat.moveProgress = 1;
                plat.moveDirection = -1;
              } else if (plat.moveProgress <= 0) {
                plat.moveProgress = 0;
                plat.moveDirection = 1;
              }
              const oldX = plat.x;
              const oldY = plat.y;
              plat.x = plat.startX + (plat.targetX - plat.startX) * plat.moveProgress;
              plat.y = (plat.startY || plat.y) + ((plat.targetY || plat.y) - (plat.startY || plat.y)) * plat.moveProgress;

              // Carry player if on top
              if (
                player.isGrounded &&
                player.x + player.width > plat.x &&
                player.x < plat.x + plat.width &&
                Math.abs(player.y + player.height - plat.y) < 6
              ) {
                player.x += plat.x - oldX;
                player.y += plat.y - oldY;
              }
            } else if (plat.type === PlatformType.FALLING && plat.isFalling) {
              plat.fallTimer = (plat.fallTimer || 0) + dt;
              if (plat.fallTimer > 0.4) {
                plat.y += 6.0; // Plummet
                if (plat.y > currentLevel.height + 200) {
                  plat.broken = true;
                }
              }
            }
          }

          // B. Update Player Movement & State
          player.update(inputManager.state, dt, spawnProjectile);

          // C. Player-World Collision Detection & Resolution
          resolvePlayerCollisions(player, currentLevel, addCameraTrauma);

          // D. Fall Out of Bounds Check
          if (player.y > currentLevel.height + 60 && player.state !== PlayerState.DEAD) {
            player.takeDamage(99);
          }

          // E. Check Dead State -> Game Over
          if (player.state === PlayerState.DEAD && player.y > currentLevel.height + 200) {
            setGameState('GAMEOVER');
            isGameRunningRef.current = false;
            soundManager.stopMusic();
          }

          // F. Update Enemies & Combat
          for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
            const enemy = enemiesRef.current[i];
            enemy.update(dt, player.x + player.width / 2, player.y + player.height / 2, currentLevel.platforms, spawnProjectile);

            // Enemy-Player Collision
            if (!enemy.isDead && player.state !== PlayerState.DEAD && player.state !== PlayerState.VICTORY) {
              const overlapX = player.x < enemy.x + enemy.width && player.x + player.width > enemy.x;
              const overlapY = player.y < enemy.y + enemy.height && player.y + player.height > enemy.y;

              if (overlapX && overlapY) {
                // Check Stomp: Player falling from above enemy head
                const isStomping = player.vy > 0 && player.y + player.height <= enemy.y + 18;

                if (isStomping) {
                  if (enemy.isSpiked) {
                    // Spiked enemy cannot be stomped! Deflects and hurts player
                    player.vy = -6.5;
                    soundManager.playDeflect();
                    particleManager.emitImpactBurst(enemy.x + enemy.width / 2, enemy.y, '#ef4444');
                    particleManager.addFloatingText('SPIKED! ⚠️', enemy.x + enemy.width / 2, enemy.y - 12, '#ef4444');
                    addCameraTrauma(0.3);

                    if (!player.isInvulnerable) {
                      player.takeDamage(1, player.x < enemy.x ? -1 : 1);
                      setStats((prev) => ({ ...prev, health: player.health }));
                    }
                  } else {
                    // Stompable enemy! Squash and defeat
                    player.vy = -8.5; // Stomp bounce
                    hitStopTimerRef.current = 0.08;
                    addCameraTrauma(0.25);
                    enemy.takeDamage(1, false, player.facingRight ? 1 : -1);

                    // Score & Floating Text
                    setStats((prev) => ({ ...prev, score: prev.score + 200 }));
                    particleManager.addFloatingText('+200', enemy.x + enemy.width / 2, enemy.y, '#facc15');
                  }
                } else if (!player.isInvulnerable) {
                  // Player receives side/underneath contact damage
                  const knockDir = player.x < enemy.x ? -1 : 1;
                  player.takeDamage(1, knockDir);
                  addCameraTrauma(0.35);
                  setStats((prev) => ({ ...prev, health: player.health }));
                }
              }
            }

            // Remove fallen dead enemies
            if (enemy.isDead && enemy.y > currentLevel.height + 150) {
              enemiesRef.current.splice(i, 1);
            }
          }

          // G. Update Boss (If Active)
          if (bossRef.current) {
            const boss = bossRef.current;
            boss.update(dt, player.x + player.width / 2, player.y + player.height / 2, addCameraTrauma, spawnProjectile);

            // Boss Collision with Player
            if (!boss.isDead && player.state !== PlayerState.DEAD && player.state !== PlayerState.VICTORY) {
              const overlapX = player.x < boss.x + boss.width && player.x + player.width > boss.x;
              const overlapY = player.y < boss.y + boss.height && player.y + player.height > boss.y;

              if (overlapX && overlapY) {
                const isStomping = player.vy > 0 && player.y + player.height <= boss.y + 24;
                if (isStomping && boss.currentAttack === 'STAGGERED') {
                  // Stomp vulnerable boss!
                  player.vy = -10.0;
                  hitStopTimerRef.current = 0.12;
                  boss.takeDamage(2, addCameraTrauma);
                  setStats((prev) => ({ ...prev, score: prev.score + 1000 }));
                  particleManager.addFloatingText('+1000', boss.x + boss.width / 2, boss.y, '#f59e0b');
                } else if (!player.isInvulnerable) {
                  const knockDir = player.x < boss.x ? -1 : 1;
                  player.takeDamage(1, knockDir);
                  addCameraTrauma(0.4);
                  setStats((prev) => ({ ...prev, health: player.health }));
                }
              }
            }

            // Boss Defeat Victory
            if (boss.isDefeated && player.state !== PlayerState.VICTORY) {
              triggerVictory(player, currentLevel);
            }
          }

          // H. Update Projectiles
          for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
            const p = projectilesRef.current[i];
            p.life -= dt;
            p.x += p.vx;
            p.y += p.vy;

            // Player projectile hits enemies
            if (p.isPlayer) {
              for (const enemy of enemiesRef.current) {
                if (!enemy.isDead && p.x < enemy.x + enemy.width && p.x + p.width > enemy.x && p.y < enemy.y + enemy.height && p.y + p.height > enemy.y) {
                  enemy.takeDamage(p.damage, true, Math.sign(p.vx));
                  p.life = 0;
                  setStats((prev) => ({ ...prev, score: prev.score + 250 }));
                  particleManager.addFloatingText('+250', enemy.x + enemy.width / 2, enemy.y, '#f97316');
                  break;
                }
              }
              // Hits boss
              if (bossRef.current && !bossRef.current.isDead) {
                const b = bossRef.current;
                if (p.x < b.x + b.width && p.x + p.width > b.x && p.y < b.y + b.height && p.y + p.height > b.y) {
                  b.takeDamage(p.damage, addCameraTrauma);
                  p.life = 0;
                  break;
                }
              }
            } else {
              // Enemy projectile hits player
              if (!player.isInvulnerable && p.x < player.x + player.width && p.x + p.width > player.x && p.y < player.y + player.height && p.y + p.height > player.y) {
                player.takeDamage(p.damage, Math.sign(p.vx) || 1);
                addCameraTrauma(0.3);
                p.life = 0;
                setStats((prev) => ({ ...prev, health: player.health }));
              }
            }

            if (p.life <= 0) {
              particleManager.emitImpactBurst(p.x, p.y, p.color);
              projectilesRef.current.splice(i, 1);
            }
          }

          // I. Collectibles Overlap
          for (const item of currentLevel.collectibles) {
            if (item.collected) continue;
            if (
              player.x < item.x + item.width &&
              player.x + player.width > item.x &&
              player.y < item.y + item.height &&
              player.y + player.height > item.y
            ) {
              item.collected = true;

              switch (item.type) {
                case CollectibleType.ANCIENT_COIN:
                  soundManager.playCoin();
                  particleManager.emitSparkles(item.x + item.width / 2, item.y + item.height / 2, 8, ['#fde047', '#facc15']);
                  particleManager.addFloatingText('+100', item.x, item.y, '#facc15');
                  setStats((prev) => ({ ...prev, coins: prev.coins + 1, score: prev.score + 100 }));
                  break;

                case CollectibleType.PRISM_SHARD:
                  soundManager.playPrismShard();
                  particleManager.emitSparkles(item.x + item.width / 2, item.y + item.height / 2, 12, ['#06b6d4', '#67e8f9']);
                  particleManager.addFloatingText('+200', item.x, item.y, '#06b6d4');
                  setStats((prev) => ({ ...prev, score: prev.score + 200 }));
                  break;

                case CollectibleType.STAR_RELIC:
                  soundManager.playPowerUp();
                  particleManager.emitSparkles(item.x + item.width / 2, item.y + item.height / 2, 24, ['#facc15', '#38bdf8', '#fb7185']);
                  particleManager.addFloatingText('STAR RELIC!', item.x, item.y, '#facc15');
                  setStats((prev) => ({ ...prev, starsCollected: prev.starsCollected + 1, score: prev.score + 1000 }));
                  break;

                case CollectibleType.POWERUP_GROWTH:
                  player.setPowerUp(PowerUpType.GROWTH);
                  setStats((prev) => ({ ...prev, powerUp: PowerUpType.GROWTH, health: player.health, maxHealth: player.maxHealth }));
                  break;

                case CollectibleType.POWERUP_FIRE:
                  player.setPowerUp(PowerUpType.FIRE_ORB);
                  setStats((prev) => ({ ...prev, powerUp: PowerUpType.FIRE_ORB }));
                  break;

                case CollectibleType.POWERUP_SHIELD:
                  player.setPowerUp(PowerUpType.SHIELD_ORB);
                  setStats((prev) => ({ ...prev, powerUp: PowerUpType.SHIELD_ORB }));
                  break;

                case CollectibleType.POWERUP_SPEED:
                  player.setPowerUp(PowerUpType.SPEED_GEM);
                  setStats((prev) => ({ ...prev, powerUp: PowerUpType.SPEED_GEM }));
                  break;
              }
            }
          }

          // J. Checkpoints Trigger
          for (const chk of currentLevel.checkpoints) {
            if (!chk.activated && player.x + player.width > chk.x && player.x < chk.x + chk.width) {
              chk.activated = true;
              soundManager.playCheckpoint();
              particleManager.emitSparkles(chk.x, chk.y, 16, ['#eab308', '#facc15']);
              particleManager.addFloatingText('CHECKPOINT!', chk.x, chk.y, '#eab308');
            }
          }

          // K. Exit Gateway Trigger (Non-boss levels)
          const exit = currentLevel.exit;
          if (
            stats.currentLevel !== 3 &&
            player.state !== PlayerState.VICTORY &&
            player.x + player.width > exit.x &&
            player.x < exit.x + exit.width &&
            player.y + player.height > exit.y &&
            player.y < exit.y + exit.height
          ) {
            triggerVictory(player, currentLevel);
          }

          // L. Update Camera
          camera.update(player.x, player.y, player.vx, player.facingRight, dt);
        }
      }

      // Update Particles & Tile animations
      particleManager.update(dt);
      tileRenderer.update(dt);

      // 3. RENDER SCENE
      if (ctx && canvas && camera && currentLevel) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const camX = camera.getDrawX();
        const camY = camera.getDrawY();

        // Parallax Background
        tileRenderer.renderBackground(ctx, currentLevel, camX, camY, canvas.width, canvas.height);

        // Platforms & Tiles
        tileRenderer.renderPlatforms(ctx, currentLevel.platforms, camX, camY, currentLevel.theme);

        // Collectibles
        tileRenderer.renderCollectibles(ctx, currentLevel.collectibles, camX, camY);

        // Checkpoints & Gateway
        tileRenderer.renderCheckpointsAndExit(ctx, currentLevel.checkpoints, currentLevel.exit, camX, camY);

        // Enemies
        for (const enemy of enemiesRef.current) {
          enemy.render(ctx, camX, camY);
        }

        // Boss (If present)
        if (bossRef.current) {
          bossRef.current.render(ctx, camX, camY);
        }

        // Projectiles
        for (const p of projectilesRef.current) {
          const pDrawX = p.x - camX;
          const pDrawY = p.y - camY;
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.glowColor;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(pDrawX + p.width / 2, pDrawY + p.height / 2, p.width / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Player
        if (player) {
          player.render(ctx, camX, camY);
        }

        // Particles & Floating Text
        particleManager.render(ctx, camX, camY);
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, saveData.screenShakeEnabled, addCameraTrauma, spawnProjectile, stats.currentLevel]);

  // Level Victory Trigger
  const triggerVictory = (player: Player, currentLevel: LevelData) => {
    player.state = PlayerState.VICTORY;
    player.vx = 0;
    setGameState('VICTORY');
    isGameRunningRef.current = false;

    // Calculate stars earned
    const stars = Math.min(3, 1 + (stats.coins >= 5 ? 1 : 0) + (timeLeft > 120 ? 1 : 0));
    setStarsEarnedInLevel(stars);

    // Update Persistent Save Data
    const levelKey = `${stats.currentWorld}-${stats.currentLevel}`;
    const nextWorld = Math.min(6, stats.currentWorld + 1);
    const unlocked = Array.from(new Set([...saveData.unlockedWorlds, nextWorld]));

    persistSaveData({
      unlockedWorlds: unlocked,
      completedLevels: { ...saveData.completedLevels, [levelKey]: true },
      levelHighScores: {
        ...saveData.levelHighScores,
        [levelKey]: Math.max(saveData.levelHighScores[levelKey] || 0, stats.score + Math.floor(timeLeft * 10)),
      },
      levelStars: {
        ...saveData.levelStars,
        [levelKey]: Math.max(saveData.levelStars[levelKey] || 0, stars),
      },
      totalCoins: saveData.totalCoins + stats.coins,
    });
  };

  // --- COLLISION RESOLUTION HELPER ---
  const resolvePlayerCollisions = (player: Player, level: LevelData, addTrauma: (a: number) => void) => {
    let groundedThisFrame = false;

    for (const plat of level.platforms) {
      if (plat.broken) continue;

      // Check Hazard (Lava / Spikes)
      if (plat.type === PlatformType.LAVA || plat.type === PlatformType.SPIKES) {
        if (
          player.x < plat.x + plat.width &&
          player.x + player.width > plat.x &&
          player.y + player.height > plat.y + 6 &&
          player.y < plat.y + plat.height
        ) {
          player.takeDamage(99);
          return;
        }
      }

      // One-Way Platforms
      if (plat.type === PlatformType.ONE_WAY) {
        // Can land from above, but can drop through by pressing Down+Jump
        const isAbove = player.y + player.height - player.vy <= plat.y + 8;
        const isCollidingY = player.y + player.height >= plat.y && player.y + player.height <= plat.y + 14;
        const isCollidingX = player.x + player.width > plat.x && player.x < plat.x + plat.width;

        if (isAbove && isCollidingY && isCollidingX && player.vy >= 0 && !(inputManager.state.down && inputManager.state.jump)) {
          player.y = plat.y - player.height;
          if (!player.isGrounded) {
            player.onLand(player.vy);
          }
          player.vy = 0;
          groundedThisFrame = true;
        }
        continue;
      }

      // Bounce Spring Platform
      if (plat.type === PlatformType.BOUNCE) {
        if (
          player.x + player.width > plat.x &&
          player.x < plat.x + plat.width &&
          player.y + player.height >= plat.y &&
          player.y + player.height <= plat.y + 16 &&
          player.vy >= 0
        ) {
          player.y = plat.y - player.height;
          player.vy = -13.5 * (plat.bounceMultiplier || 1.4);
          player.scaleX = 0.7;
          player.scaleY = 1.4;
          soundManager.playBounce();
          addTrauma(0.2);
          particleManager.emitLandingDust(player.x + player.width / 2, plat.y, 2.0);
          continue;
        }
      }

      // Solid / Breakable / Falling / Ice Blocks
      const nextX = player.x + player.vx;
      const nextY = player.y + player.vy;

      // Broad AABB overlap check
      if (
        nextX < plat.x + plat.width &&
        nextX + player.width > plat.x &&
        nextY < plat.y + plat.height &&
        nextY + player.height > plat.y
      ) {
        // Resolve Vertical first
        if (player.y + player.height <= plat.y + 8 && player.vy >= 0) {
          // Landing on top
          player.y = plat.y - player.height;
          if (!player.isGrounded) {
            player.onLand(player.vy);
          }
          player.vy = 0;
          groundedThisFrame = true;

          // Trigger Falling Block
          if (plat.type === PlatformType.FALLING) {
            plat.isFalling = true;
          }
        } else if (player.y >= plat.y + plat.height - 8 && player.vy < 0) {
          // Hitting ceiling from below
          player.y = plat.y + plat.height;
          player.vy = 0;
          soundManager.playHit();

          // Break Breakable block
          if (plat.type === PlatformType.BREAKABLE) {
            plat.broken = true;
            particleManager.emitDebris(plat.x, plat.y, plat.width, plat.height);
            soundManager.playStomp();
            setStats((prev) => ({ ...prev, score: prev.score + 50 }));
          }
        } else {
          // Horizontal side wall collision
          if (player.vx > 0 && player.x + player.width <= plat.x + 8) {
            player.x = plat.x - player.width;
            player.vx = 0;
          } else if (player.vx < 0 && player.x >= plat.x + plat.width - 8) {
            player.x = plat.x + plat.width;
            player.vx = 0;
          }
        }
      }
    }

    if (groundedThisFrame) {
      player.isGrounded = true;
    } else if (player.isGrounded && player.vy > 1.0) {
      player.isGrounded = false;
    }

    // Apply Position
    player.x += player.vx;
    player.y += player.vy;
  };

  // Canvas Resize Observer
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      canvasRef.current.width = clientWidth;
      canvasRef.current.height = clientHeight;
      if (cameraRef.current) {
        cameraRef.current.setDimensions(clientWidth, clientHeight);
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    handleResize();
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      id="game-viewport-container"
      className="relative w-full h-screen overflow-hidden bg-stone-950 flex items-center justify-center font-sans antialiased"
    >
      {/* 60 FPS HTML5 Canvas */}
      <canvas ref={canvasRef} id="game-canvas" className="w-full h-full block cursor-crosshair" />

      {/* In-Game HUD */}
      {gameState === 'PLAYING' && (
        <HUD
          stats={stats}
          levelName={currentLevelData.name}
          levelSubtitle={currentLevelData.subtitle}
          timeLeft={timeLeft}
          bossHealth={bossRef.current?.health}
          bossMaxHealth={bossRef.current?.maxHealth}
          bossName={bossRef.current?.name}
          onPause={() => setGameState('PAUSED')}
        />
      )}

      {/* On-Screen Touch Controls */}
      {gameState === 'PLAYING' && <TouchControls />}

      {/* Main Menu */}
      {gameState === 'MENU' && (
        <MainMenu
          onStartGame={handleStartGame}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenControls={() => setShowControls(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Level Select Modal */}
      {showLevelSelect && (
        <LevelSelectModal
          saveData={saveData}
          onSelectLevel={handleSelectLevel}
          onClose={() => setShowLevelSelect(false)}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={() => setGameState('PLAYING')}
          onRestart={handleRestartLevel}
          onLevelSelect={() => {
            setGameState('MENU');
            setShowLevelSelect(true);
          }}
          onMainMenu={() => {
            soundManager.stopMusic();
            setGameState('MENU');
          }}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Victory Modal */}
      {gameState === 'VICTORY' && (
        <VictoryModal
          score={stats.score}
          coins={stats.coins}
          timeLeft={timeLeft}
          starsEarned={starsEarnedInLevel}
          isLastLevel={stats.currentWorld === 6 && stats.currentLevel === 3}
          onNextLevel={handleNextLevel}
          onRestart={handleRestartLevel}
          onLevelSelect={() => {
            setGameState('MENU');
            setShowLevelSelect(true);
          }}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          score={stats.score}
          coins={stats.coins}
          onRetry={handleRestartLevel}
          onLevelSelect={() => {
            setGameState('MENU');
            setShowLevelSelect(true);
          }}
          onMainMenu={() => {
            soundManager.stopMusic();
            setGameState('MENU');
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          saveData={saveData}
          onUpdateSaveData={persistSaveData}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Controls Reference Modal */}
      {showControls && <ControlsModal onClose={() => setShowControls(false)} />}
    </div>
  );
}
