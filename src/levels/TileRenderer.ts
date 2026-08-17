/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelData, PlatformBlock, CollectibleItem, Checkpoint, LevelExit, PlatformType, CollectibleType } from '../types';

export class TileRenderer {
  private animTimer: number = 0;

  public update(dt: number) {
    this.animTimer += dt;
  }

  // --- PARALLAX BACKGROUND RENDERING ---
  public renderBackground(ctx: CanvasRenderingContext2D, level: LevelData, camX: number, camY: number, viewW: number, viewH: number) {
    const theme = level.theme;

    // 1. Far Sky Gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, viewH);
    switch (theme) {
      case 'green_valley':
        skyGradient.addColorStop(0, '#7dd3fc'); // Bright sky blue
        skyGradient.addColorStop(1, '#bae6fd');
        break;
      case 'crystal_caverns':
        skyGradient.addColorStop(0, '#0f172a'); // Deep cosmic cavern
        skyGradient.addColorStop(1, '#1e1b4b');
        break;
      case 'sunset_desert':
        skyGradient.addColorStop(0, '#f97316'); // Warm orange sunset
        skyGradient.addColorStop(0.6, '#fbbf24');
        skyGradient.addColorStop(1, '#fef08a');
        break;
      case 'frozen_peaks':
        skyGradient.addColorStop(0, '#0284c7'); // Arctic blue
        skyGradient.addColorStop(1, '#e0f2fe');
        break;
      case 'mystic_forest':
        skyGradient.addColorStop(0, '#3b0764'); // Twilight purple
        skyGradient.addColorStop(1, '#1e1b4b');
        break;
      case 'volcanic_fortress':
        skyGradient.addColorStop(0, '#450a0a'); // Blood red volcanic sky
        skyGradient.addColorStop(0.7, '#7f1d1d');
        skyGradient.addColorStop(1, '#b91c1c');
        break;
      default:
        skyGradient.addColorStop(0, '#60a5fa');
        skyGradient.addColorStop(1, '#93c5fd');
    }
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, viewW, viewH);

    // 2. Far Mountain / Silhouette Layer (Parallax Factor: 0.15)
    const farParallaxX = (camX * 0.15) % 400;
    ctx.save();
    if (theme === 'green_valley') {
      ctx.fillStyle = 'rgba(147, 197, 253, 0.45)';
    } else if (theme === 'crystal_caverns') {
      ctx.fillStyle = 'rgba(49, 46, 129, 0.4)';
    } else if (theme === 'sunset_desert') {
      ctx.fillStyle = 'rgba(217, 119, 6, 0.35)';
    } else if (theme === 'frozen_peaks') {
      ctx.fillStyle = 'rgba(186, 230, 253, 0.5)';
    } else if (theme === 'volcanic_fortress') {
      ctx.fillStyle = 'rgba(153, 27, 27, 0.4)';
    } else {
      ctx.fillStyle = 'rgba(107, 33, 168, 0.35)';
    }

    ctx.beginPath();
    ctx.moveTo(0, viewH);
    for (let x = -400; x < viewW + 400; x += 200) {
      const peakX = x - farParallaxX;
      ctx.lineTo(peakX, viewH - 180 - Math.sin((x + 100) * 0.01) * 60);
      ctx.lineTo(peakX + 100, viewH - 80);
    }
    ctx.lineTo(viewW, viewH);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 3. Mid Hills / Canopy Layer (Parallax Factor: 0.35)
    const midParallaxX = (camX * 0.35) % 300;
    ctx.save();
    if (theme === 'green_valley') {
      ctx.fillStyle = 'rgba(74, 222, 128, 0.55)';
    } else if (theme === 'crystal_caverns') {
      ctx.fillStyle = 'rgba(67, 56, 202, 0.5)';
    } else if (theme === 'sunset_desert') {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
    } else if (theme === 'frozen_peaks') {
      ctx.fillStyle = 'rgba(125, 211, 252, 0.6)';
    } else if (theme === 'volcanic_fortress') {
      ctx.fillStyle = 'rgba(220, 38, 38, 0.45)';
    } else {
      ctx.fillStyle = 'rgba(147, 51, 234, 0.5)';
    }

    ctx.beginPath();
    ctx.moveTo(0, viewH);
    for (let x = -300; x < viewW + 300; x += 150) {
      const hillX = x - midParallaxX;
      ctx.quadraticCurveTo(hillX + 75, viewH - 140, hillX + 150, viewH);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // --- TILE & PLATFORM RENDERING ---
  public renderPlatforms(ctx: CanvasRenderingContext2D, platforms: PlatformBlock[], camX: number, camY: number, theme: LevelData['theme']) {
    for (const p of platforms) {
      if (p.broken) continue;
      const drawX = p.x - camX;
      const drawY = p.y - camY;

      ctx.save();

      // Platform type styling
      switch (p.type) {
        case PlatformType.SOLID: {
          // Top Grass / Trim
          if (theme === 'green_valley') {
            ctx.fillStyle = '#22c55e'; // Grass top
            ctx.fillRect(drawX, drawY, p.width, 8);
            ctx.fillStyle = '#78350f'; // Dirt body
            ctx.fillRect(drawX, drawY + 8, p.width, p.height - 8);
          } else if (theme === 'crystal_caverns') {
            ctx.fillStyle = '#06b6d4'; // Cyan crystal trim
            ctx.fillRect(drawX, drawY, p.width, 6);
            ctx.fillStyle = '#1e1b4b'; // Dark cavern rock
            ctx.fillRect(drawX, drawY + 6, p.width, p.height - 6);
          } else if (theme === 'sunset_desert') {
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(drawX, drawY, p.width, 6);
            ctx.fillStyle = '#b45309';
            ctx.fillRect(drawX, drawY + 6, p.width, p.height - 6);
          } else if (theme === 'frozen_peaks') {
            ctx.fillStyle = '#e0f2fe';
            ctx.fillRect(drawX, drawY, p.width, 6);
            ctx.fillStyle = '#0369a1';
            ctx.fillRect(drawX, drawY + 6, p.width, p.height - 6);
          } else if (theme === 'volcanic_fortress') {
            ctx.fillStyle = '#991b1b';
            ctx.fillRect(drawX, drawY, p.width, 6);
            ctx.fillStyle = '#1c1917';
            ctx.fillRect(drawX, drawY + 6, p.width, p.height - 6);
          } else {
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(drawX, drawY, p.width, 6);
            ctx.fillStyle = '#3b0764';
            ctx.fillRect(drawX, drawY + 6, p.width, p.height - 6);
          }
          // Border bevel
          ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          ctx.lineWidth = 1;
          ctx.strokeRect(drawX, drawY, p.width, p.height);
          break;
        }

        case PlatformType.ONE_WAY: {
          // Thin wooden/crystal bridge
          ctx.fillStyle = '#ca8a04';
          ctx.beginPath();
          ctx.roundRect(drawX, drawY, p.width, p.height, 4);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(drawX + 2, drawY + 2, p.width - 4, 3);
          break;
        }

        case PlatformType.MOVING: {
          // Technological / Mechanical platform
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.roundRect(drawX, drawY, p.width, p.height, 4);
          ctx.fill();
          // Glowing center pulse
          const pulse = (Math.sin(this.animTimer * 6) + 1) * 0.5;
          ctx.fillStyle = `rgba(56, 189, 248, ${0.4 + pulse * 0.5})`;
          ctx.fillRect(drawX + 8, drawY + p.height / 2 - 2, p.width - 16, 4);
          break;
        }

        case PlatformType.FALLING: {
          // Crumbling stone with cracks
          ctx.fillStyle = '#64748b';
          ctx.fillRect(drawX, drawY, p.width, p.height);
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(drawX + 10, drawY);
          ctx.lineTo(drawX + 24, drawY + p.height);
          ctx.stroke();
          break;
        }

        case PlatformType.BOUNCE: {
          // Spring Mushroom / Crystal Pad
          const squash = Math.sin(this.animTimer * 8) * 2;
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.ellipse(drawX + p.width / 2, drawY + p.height / 2, p.width / 2, p.height / 2 + squash, 0, 0, Math.PI * 2);
          ctx.fill();
          // White dots
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(drawX + p.width / 2 - 8, drawY + p.height / 2 - 2, 3, 0, Math.PI * 2);
          ctx.arc(drawX + p.width / 2 + 8, drawY + p.height / 2 - 2, 3, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case PlatformType.BREAKABLE: {
          // Question / Shard Block
          ctx.fillStyle = '#d97706';
          ctx.fillRect(drawX, drawY, p.width, p.height);
          ctx.fillStyle = '#fef3c7';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('?', drawX + p.width / 2, drawY + p.height * 0.72);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.strokeRect(drawX, drawY, p.width, p.height);
          break;
        }

        case PlatformType.ICE: {
          // Ice Block
          ctx.fillStyle = '#bae6fd';
          ctx.fillRect(drawX, drawY, p.width, p.height);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fillRect(drawX, drawY, p.width, 4);
          break;
        }

        case PlatformType.LAVA: {
          // Bubbling Lava
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(drawX, drawY, p.width, p.height);
          const wave = Math.sin(this.animTimer * 5 + drawX) * 4;
          ctx.fillStyle = '#f97316';
          ctx.fillRect(drawX, drawY + wave, p.width, 6);
          break;
        }
      }
      ctx.restore();
    }
  }

  // --- COLLECTIBLES RENDERING ---
  public renderCollectibles(ctx: CanvasRenderingContext2D, collectibles: CollectibleItem[], camX: number, camY: number) {
    for (const c of collectibles) {
      if (c.collected) continue;
      const bob = Math.sin(this.animTimer * 4 + c.bobOffset) * 4;
      const drawX = c.x - camX;
      const drawY = c.y + bob - camY;

      ctx.save();
      ctx.translate(drawX + c.width / 2, drawY + c.height / 2);

      switch (c.type) {
        case CollectibleType.ANCIENT_COIN: {
          // Spinning 3D Coin
          const spinScale = Math.cos(this.animTimer * 5 + c.bobOffset);
          ctx.scale(spinScale, 1);
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(0, 0, 6, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case CollectibleType.PRISM_SHARD: {
          // Luminous Crystal Shard
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(8, 0);
          ctx.lineTo(0, 10);
          ctx.lineTo(-8, 0);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#cffafe';
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.lineTo(4, 0);
          ctx.lineTo(0, 6);
          ctx.lineTo(-4, 0);
          ctx.closePath();
          ctx.fill();
          break;
        }

        case CollectibleType.STAR_RELIC: {
          // Grand Spinning Star
          ctx.rotate(this.animTimer * 2);
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const ia = a + Math.PI / 5;
            ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
            ctx.lineTo(Math.cos(ia) * 6, Math.sin(ia) * 6);
          }
          ctx.closePath();
          ctx.fill();
          break;
        }

        case CollectibleType.POWERUP_GROWTH: {
          // Growth Prism (Golden Crown/Mushroom)
          ctx.fillStyle = '#ca8a04';
          ctx.beginPath();
          ctx.arc(0, -4, 10, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-5, -4, 10, 8);
          break;
        }

        case CollectibleType.POWERUP_FIRE: {
          // Solar Fire Orb
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case CollectibleType.POWERUP_SHIELD: {
          // Zephyr Shield Orb
          ctx.fillStyle = '#2563eb';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#93c5fd';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case CollectibleType.POWERUP_SPEED: {
          // Swiftness Gem
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(10, 0);
          ctx.lineTo(0, 10);
          ctx.lineTo(-10, 0);
          ctx.closePath();
          ctx.fill();
          break;
        }
      }

      ctx.restore();
    }
  }

  // --- CHECKPOINTS & EXIT PORTAL RENDERING ---
  public renderCheckpointsAndExit(
    ctx: CanvasRenderingContext2D,
    checkpoints: Checkpoint[],
    exit: LevelExit,
    camX: number,
    camY: number
  ) {
    // Checkpoints
    for (const chk of checkpoints) {
      const drawX = chk.x - camX;
      const drawY = chk.y - camY;

      ctx.save();
      // Pole
      ctx.fillStyle = '#64748b';
      ctx.fillRect(drawX, drawY, 4, chk.height);

      // Flag
      const flagColor = chk.activated ? '#eab308' : '#94a3b8';
      const wave = Math.sin(this.animTimer * 6) * 3;
      ctx.fillStyle = flagColor;
      ctx.beginPath();
      ctx.moveTo(drawX + 4, drawY);
      ctx.lineTo(drawX + 24 + wave, drawY + 10);
      ctx.lineTo(drawX + 4, drawY + 20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Level Exit / Gateway
    const exitDrawX = exit.x - camX;
    const exitDrawY = exit.y - camY;
    ctx.save();
    // Portal Pillars
    ctx.fillStyle = '#334155';
    ctx.fillRect(exitDrawX - 8, exitDrawY, 12, exit.height);
    ctx.fillRect(exitDrawX + exit.width - 4, exitDrawY, 12, exit.height);
    // Arch
    ctx.beginPath();
    ctx.arc(exitDrawX + exit.width / 2, exitDrawY, exit.width / 2 + 4, Math.PI, 0);
    ctx.fill();

    // Swirling Portal Aura
    const portalGrad = ctx.createRadialGradient(
      exitDrawX + exit.width / 2,
      exitDrawY + exit.height / 2,
      4,
      exitDrawX + exit.width / 2,
      exitDrawY + exit.height / 2,
      exit.width / 2
    );
    portalGrad.addColorStop(0, '#fef08a');
    portalGrad.addColorStop(0.5, '#38bdf8');
    portalGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');

    ctx.fillStyle = portalGrad;
    ctx.fillRect(exitDrawX, exitDrawY + 10, exit.width, exit.height - 10);
    ctx.restore();
  }
}

export const tileRenderer = new TileRenderer();
