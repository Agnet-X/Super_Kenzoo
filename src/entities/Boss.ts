/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rect, Projectile } from '../types';
import { soundManager } from '../audio/SoundManager';
import { particleManager } from '../engine/Particles';

export class Boss implements Rect {
  public id: string = 'boss-ignis';
  public name: string = 'Ignis Colossus';
  public x: number;
  public y: number;
  public width: number = 72;
  public height: number = 84;

  public vx: number = 0;
  public vy: number = 0;
  public facingRight: boolean = false;

  // Boss Stats & Health
  public health: number = 12;
  public maxHealth: number = 12;
  public phase: number = 1; // 1, 2, 3
  public isInvulnerable: boolean = false;
  public invulnerableTimer: number = 0;
  public isDead: boolean = false;
  public isDefeated: boolean = false;
  public defeatTimer: number = 0;

  // Combat AI & Attack State
  public actionTimer: number = 0;
  public attackCooldown: number = 3.0;
  public currentAttack: 'IDLE' | 'GROUND_SLAM' | 'FIRE_CHARGE' | 'CRYSTAL_RAIN' | 'STAGGERED' = 'IDLE';
  public attackPhaseTimer: number = 0;
  public arenaMinX: number;
  public arenaMaxX: number;
  public baseY: number;

  // Visuals & Squash
  public scaleX: number = 1.0;
  public scaleY: number = 1.0;
  public animTimer: number = 0;

  constructor(x: number, y: number, arenaMinX: number, arenaMaxX: number) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.arenaMinX = arenaMinX;
    this.arenaMaxX = arenaMaxX;
  }

  public takeDamage(damage: number, addCameraTrauma: (amount: number) => void): boolean {
    if (this.isInvulnerable || this.isDead || this.currentAttack === 'GROUND_SLAM') return false;

    this.health -= damage;
    this.invulnerableTimer = 1.4;
    this.isInvulnerable = true;
    soundManager.playHit();
    addCameraTrauma(0.35);
    particleManager.emitImpactBurst(this.x + this.width / 2, this.y + this.height / 2, '#ef4444');

    // Boss Phase Transitions
    if (this.health <= 4 && this.phase < 3) {
      this.phase = 3;
      soundManager.playBossRoar();
      addCameraTrauma(0.6);
      this.currentAttack = 'CRYSTAL_RAIN';
      this.attackPhaseTimer = 0;
    } else if (this.health <= 8 && this.phase < 2) {
      this.phase = 2;
      soundManager.playBossRoar();
      addCameraTrauma(0.5);
      this.currentAttack = 'FIRE_CHARGE';
      this.attackPhaseTimer = 0;
    }

    if (this.health <= 0) {
      this.isDead = true;
      this.defeatTimer = 0;
      soundManager.playBossRoar();
      addCameraTrauma(0.8);
      return true;
    }
    return false;
  }

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    addCameraTrauma: (t: number) => void,
    spawnProjectiles: (p: Projectile) => void
  ) {
    this.animTimer += dt;

    if (this.isDead) {
      this.defeatTimer += dt;
      if (this.defeatTimer > 3.0) {
        this.isDefeated = true;
      }
      if (Math.random() < 0.3) {
        particleManager.emitImpactBurst(
          this.x + Math.random() * this.width,
          this.y + Math.random() * this.height,
          '#f59e0b'
        );
      }
      return;
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      this.isInvulnerable = this.invulnerableTimer > 0;
    }

    this.actionTimer += dt;
    this.attackPhaseTimer += dt;

    // Face Player
    if (this.currentAttack === 'IDLE') {
      this.facingRight = playerX > this.x + this.width / 2;
    }

    // --- ATTACK STATE MACHINE ---
    switch (this.currentAttack) {
      case 'IDLE': {
        // Idle breathing / anticipation
        const speed = this.phase === 1 ? 1.0 : (this.phase === 2 ? 1.8 : 2.4);
        this.x += (this.facingRight ? 1 : -1) * speed * (dt * 60);
        if (this.x < this.arenaMinX) this.facingRight = true;
        if (this.x > this.arenaMaxX - this.width) this.facingRight = false;

        if (this.actionTimer > this.attackCooldown) {
          this.actionTimer = 0;
          this.attackPhaseTimer = 0;
          // Pick next attack based on phase
          if (this.phase === 1) {
            this.currentAttack = 'GROUND_SLAM';
          } else if (this.phase === 2) {
            this.currentAttack = Math.random() < 0.5 ? 'GROUND_SLAM' : 'FIRE_CHARGE';
          } else {
            const rand = Math.random();
            if (rand < 0.35) this.currentAttack = 'GROUND_SLAM';
            else if (rand < 0.7) this.currentAttack = 'FIRE_CHARGE';
            else this.currentAttack = 'CRYSTAL_RAIN';
          }
        }
        break;
      }

      case 'GROUND_SLAM': {
        // Leap up, hang at apex, then crash down with shockwaves!
        if (this.attackPhaseTimer < 0.6) {
          // Anticipation squat
          this.scaleX = 1.3;
          this.scaleY = 0.7;
        } else if (this.attackPhaseTimer < 1.4) {
          // Leap into air
          this.vy = -7.0;
          this.y += this.vy * (dt * 60);
          this.scaleX = 0.8;
          this.scaleY = 1.3;
        } else if (this.attackPhaseTimer < 1.8) {
          // Hang at apex above player
          this.x += (playerX - (this.x + this.width / 2)) * (1 - Math.exp(-6 * dt));
        } else {
          // Slam down!
          this.vy = 14.0;
          this.y += this.vy * (dt * 60);
          if (this.y >= this.baseY) {
            this.y = this.baseY;
            this.currentAttack = 'STAGGERED';
            this.attackPhaseTimer = 0;
            soundManager.playLand(2.5);
            addCameraTrauma(0.5);

            // Ground Shockwave projectiles left and right
            spawnProjectiles({
              id: Math.random().toString(),
              x: this.x - 10,
              y: this.baseY + this.height - 16,
              width: 16,
              height: 16,
              vx: -5.5,
              vy: 0,
              life: 2.0,
              maxLife: 2.0,
              isPlayer: false,
              damage: 1,
              color: '#f97316',
              glowColor: '#ea580c',
            });
            spawnProjectiles({
              id: Math.random().toString(),
              x: this.x + this.width + 10,
              y: this.baseY + this.height - 16,
              width: 16,
              height: 16,
              vx: 5.5,
              vy: 0,
              life: 2.0,
              maxLife: 2.0,
              isPlayer: false,
              damage: 1,
              color: '#f97316',
              glowColor: '#ea580c',
            });

            particleManager.emitLandingDust(this.x + this.width / 2, this.y + this.height, 2.5);
          }
        }
        break;
      }

      case 'FIRE_CHARGE': {
        // Fast dash across arena with fire trail
        const dir = this.facingRight ? 1 : -1;
        this.x += dir * 7.5 * (dt * 60);
        if (Math.random() < 0.5) {
          particleManager.emitImpactBurst(this.x + this.width / 2, this.y + this.height - 10, '#f97316');
        }

        if (this.x <= this.arenaMinX || this.x >= this.arenaMaxX - this.width || this.attackPhaseTimer > 2.2) {
          this.currentAttack = 'STAGGERED';
          this.attackPhaseTimer = 0;
          soundManager.playHit();
          addCameraTrauma(0.3);
        }
        break;
      }

      case 'CRYSTAL_RAIN': {
        // Boss roars and spawns ceiling crystal spikes
        if (this.attackPhaseTimer < 0.8) {
          this.scaleX = 1.2;
          this.scaleY = 1.1;
        } else {
          soundManager.playBossRoar();
          addCameraTrauma(0.4);
          for (let i = 0; i < 4; i++) {
            spawnProjectiles({
              id: Math.random().toString(),
              x: this.arenaMinX + Math.random() * (this.arenaMaxX - this.arenaMinX),
              y: this.baseY - 260,
              width: 14,
              height: 20,
              vx: 0,
              vy: 4.5 + Math.random() * 2,
              life: 3.0,
              maxLife: 3.0,
              isPlayer: false,
              damage: 1,
              color: '#a855f7',
              glowColor: '#c084fc',
            });
          }
          this.currentAttack = 'STAGGERED';
          this.attackPhaseTimer = 0;
        }
        break;
      }

      case 'STAGGERED': {
        // Vulnerable pause window for player to counter-attack!
        this.scaleX = 0.9;
        this.scaleY = 0.9;
        if (this.attackPhaseTimer > 1.6) {
          this.currentAttack = 'IDLE';
          this.actionTimer = 0;
        }
        break;
      }
    }

    // Squash normalization
    this.scaleX += (1.0 - this.scaleX) * 0.1;
    this.scaleY += (1.0 - this.scaleY) * 0.1;
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    const drawX = this.x - camX;
    const drawY = this.y - camY;

    ctx.save();
    ctx.translate(drawX + this.width / 2, drawY + this.height);
    ctx.scale((this.facingRight ? 1 : -1) * this.scaleX, this.scaleY);

    if (this.isInvulnerable && Math.floor(this.invulnerableTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Boss Body - Stone & Magma Golem
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.roundRect(-this.width / 2, -this.height, this.width, this.height, 12);
    ctx.fill();

    // Magma Core & Cracks
    const coreGlow = this.phase === 3 ? '#ef4444' : (this.phase === 2 ? '#f97316' : '#eab308');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(0, -this.height * 0.55, 16, 0, Math.PI * 2);
    ctx.fill();

    // Massive Stone Crown / Horns
    ctx.fillStyle = '#44403c';
    ctx.beginPath();
    ctx.moveTo(-28, -this.height);
    ctx.lineTo(-38, -this.height - 24);
    ctx.lineTo(-14, -this.height);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(28, -this.height);
    ctx.lineTo(38, -this.height - 24);
    ctx.lineTo(14, -this.height);
    ctx.fill();

    // Glowing Menacing Eyes
    ctx.fillStyle = coreGlow;
    ctx.fillRect(8, -this.height * 0.78, 14, 7);

    // Staggered Dizzy Stars
    if (this.currentAttack === 'STAGGERED') {
      const starAngle = this.animTimer * 6;
      ctx.fillStyle = '#fde047';
      for (let i = 0; i < 3; i++) {
        const a = starAngle + (i * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 28, -this.height - 16 + Math.sin(a) * 6, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
