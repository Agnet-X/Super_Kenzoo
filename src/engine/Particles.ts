/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Particle, FloatingText } from '../types';

export class ParticleManager {
  private pool: Particle[] = [];
  private activeParticles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private maxParticles: number = 400;

  constructor() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 4,
        color: '#ffffff',
        alpha: 1,
        maxLife: 1,
        life: 0,
        gravity: 0,
        shape: 'circle',
      });
    }
  }

  public emit(options: {
    x: number;
    y: number;
    count?: number;
    speed?: number;
    angleMin?: number;
    angleMax?: number;
    colors?: string[];
    sizeMin?: number;
    sizeMax?: number;
    lifeMin?: number;
    lifeMax?: number;
    gravity?: number;
    shape?: 'circle' | 'square' | 'sparkle' | 'shard' | 'ring' | 'smoke';
    rotSpeed?: number;
  }) {
    const count = options.count || 1;
    const colors = options.colors || ['#ffffff'];

    for (let i = 0; i < count; i++) {
      let p: Particle;
      if (this.pool.length > 0) {
        p = this.pool.pop()!;
      } else if (this.activeParticles.length > 0) {
        p = this.activeParticles.shift()!;
      } else {
        break;
      }

      const angleMin = options.angleMin !== undefined ? options.angleMin : 0;
      const angleMax = options.angleMax !== undefined ? options.angleMax : Math.PI * 2;
      const angle = angleMin + Math.random() * (angleMax - angleMin);
      const speed = (options.speed || 3) * (0.5 + Math.random() * 0.8);

      p.x = options.x + (Math.random() * 6 - 3);
      p.y = options.y + (Math.random() * 6 - 3);
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = (options.sizeMin || 3) + Math.random() * ((options.sizeMax || 6) - (options.sizeMin || 3));
      p.color = colors[Math.floor(Math.random() * colors.length)];
      p.maxLife = (options.lifeMin || 0.3) + Math.random() * ((options.lifeMax || 0.6) - (options.lifeMin || 0.3));
      p.life = p.maxLife;
      p.alpha = 1;
      p.gravity = options.gravity !== undefined ? options.gravity : 0.15;
      p.shape = options.shape || 'circle';
      p.rotation = Math.random() * Math.PI * 2;
      p.rotSpeed = options.rotSpeed !== undefined ? options.rotSpeed : (Math.random() * 0.2 - 0.1);

      this.activeParticles.push(p);
    }
  }

  public emitDust(x: number, y: number, count: number = 4, vxOffset: number = 0) {
    this.emit({
      x,
      y,
      count,
      speed: 1.5,
      angleMin: Math.PI * 0.8,
      angleMax: Math.PI * 1.2,
      colors: ['#e2e8f0', '#cbd5e1', '#94a3b8'],
      sizeMin: 3,
      sizeMax: 6,
      lifeMin: 0.2,
      lifeMax: 0.4,
      gravity: -0.05,
      shape: 'smoke',
    });
  }

  public emitSkidDust(x: number, y: number, facingRight: boolean) {
    const angle = facingRight ? Math.PI : 0;
    this.emit({
      x,
      y,
      count: 3,
      speed: 2.2,
      angleMin: angle - 0.3,
      angleMax: angle + 0.3,
      colors: ['#cbd5e1', '#f1f5f9'],
      sizeMin: 4,
      sizeMax: 8,
      lifeMin: 0.25,
      lifeMax: 0.5,
      gravity: -0.04,
      shape: 'smoke',
    });
  }

  public emitLandingDust(x: number, y: number, intensity: number = 1) {
    // Left burst
    this.emit({
      x: x - 6,
      y,
      count: Math.floor(4 * intensity),
      speed: 2.5 * intensity,
      angleMin: Math.PI * 0.75,
      angleMax: Math.PI * 0.95,
      colors: ['#e2e8f0', '#94a3b8'],
      sizeMin: 4,
      sizeMax: 7,
      lifeMin: 0.3,
      lifeMax: 0.5,
      gravity: 0.1,
      shape: 'smoke',
    });
    // Right burst
    this.emit({
      x: x + 6,
      y,
      count: Math.floor(4 * intensity),
      speed: 2.5 * intensity,
      angleMin: Math.PI * 0.05,
      angleMax: Math.PI * 0.25,
      colors: ['#e2e8f0', '#94a3b8'],
      sizeMin: 4,
      sizeMax: 7,
      lifeMin: 0.3,
      lifeMax: 0.5,
      gravity: 0.1,
      shape: 'smoke',
    });
  }

  public emitSparkles(x: number, y: number, count: number = 8, colorSet: string[] = ['#fde047', '#facc15', '#67e8f9']) {
    this.emit({
      x,
      y,
      count,
      speed: 3.5,
      colors: colorSet,
      sizeMin: 3,
      sizeMax: 6,
      lifeMin: 0.4,
      lifeMax: 0.7,
      gravity: 0.05,
      shape: 'sparkle',
    });
  }

  public emitImpactBurst(x: number, y: number, color: string = '#f59e0b') {
    // Shards
    this.emit({
      x,
      y,
      count: 12,
      speed: 5,
      colors: [color, '#ffffff', '#fef08a'],
      sizeMin: 3,
      sizeMax: 6,
      lifeMin: 0.3,
      lifeMax: 0.5,
      gravity: 0.2,
      shape: 'shard',
    });
  }

  public emitDebris(x: number, y: number, width: number, height: number, color: string = '#854d0e') {
    for (let i = 0; i < 8; i++) {
      this.emit({
        x: x + Math.random() * width,
        y: y + Math.random() * height,
        count: 1,
        speed: 4 + Math.random() * 4,
        angleMin: -Math.PI * 0.8,
        angleMax: -Math.PI * 0.2,
        colors: [color, '#57300a', '#a16207'],
        sizeMin: 5,
        sizeMax: 9,
        lifeMin: 0.5,
        lifeMax: 0.9,
        gravity: 0.35,
        shape: 'square',
        rotSpeed: Math.random() * 0.4 - 0.2,
      });
    }
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#facc15') {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      color,
      alpha: 1,
      life: 0.9,
      maxLife: 0.9,
      vy: -1.8,
      scale: 1.2,
    });
  }

  public update(dt: number) {
    // Update active particles
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.activeParticles.splice(i, 1);
        this.pool.push(p);
        continue;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity || 0;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.rotation !== undefined && p.rotSpeed) {
        p.rotation += p.rotSpeed;
      }
    }

    // Update floating text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy;
      ft.vy *= 0.94; // Decelerate upward float
      ft.alpha = Math.max(0, ft.life / ft.maxLife);
      if (ft.life > ft.maxLife * 0.7) {
        ft.scale = 1.0 + (ft.life - ft.maxLife * 0.7) * 1.5;
      } else {
        ft.scale = 1.0;
      }

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    // Render particles
    for (const p of this.activeParticles) {
      const drawX = p.x - camX;
      const drawY = p.y - camY;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'circle' || p.shape === 'smoke') {
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'square' || p.shape === 'shard') {
        ctx.translate(drawX, drawY);
        if (p.rotation) ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.shape === 'sparkle') {
        ctx.translate(drawX, drawY);
        if (p.rotation) ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.3, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.3, 0);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-p.size, 0);
        ctx.lineTo(0, p.size * 0.3);
        ctx.lineTo(p.size, 0);
        ctx.lineTo(0, -p.size * 0.3);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Render floating texts
    for (const ft of this.floatingTexts) {
      const drawX = ft.x - camX;
      const drawY = ft.y - camY;

      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `bold ${Math.round(15 * ft.scale)}px sans-serif`;
      ctx.textAlign = 'center';
      
      // Outline for legibility
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, drawX, drawY);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, drawX, drawY);
      ctx.restore();
    }
  }
}

export const particleManager = new ParticleManager();
