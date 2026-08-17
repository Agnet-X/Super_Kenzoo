/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnemyType, EnemyAIState, Rect, Projectile, PlatformBlock, PlatformType } from '../types';
import { soundManager } from '../audio/SoundManager';
import { particleManager } from '../engine/Particles';

export class Enemy implements Rect {
  public id: string;
  public type: EnemyType;
  public state: EnemyAIState = EnemyAIState.PATROL;

  // Bounding box
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  // Velocities & Physics
  public vx: number = 0;
  public vy: number = 0;
  public facingRight: boolean = false;
  public isGrounded: boolean = true;

  // Spiked / Stompable classification
  public isSpiked: boolean = false; // True = Spiked top (cannot stomp, deflects & damages player)

  // AI & Patrol parameters
  public patrolMinX: number;
  public patrolMaxX: number;
  public baseSpeed: number = 1.4;
  public chaseSpeed: number = 2.1; // Smooth & fair tracking speed
  public detectionRange: number = 240;
  public health: number = 1;
  public maxHealth: number = 1;
  public isDead: boolean = false;
  public isStunned: boolean = false;
  public stunTimer: number = 0;
  public isShellSliding: boolean = false;

  // Tracking & Awareness (Anti-Jitter)
  public isAlerted: boolean = false;
  public alertTimer: number = 0;
  public turnCooldown: number = 0;
  public pauseTimer: number = 0;

  // Animation & Visuals
  public animTimer: number = 0;
  public walkProgress: number = 0;
  public scaleX: number = 1.0;
  public scaleY: number = 1.0;
  public deathTimer: number = 0;
  public shootCooldown: number = 0;
  public baseY: number = 0; // for flying enemies
  public flyAngle: number = 0;

  constructor(options: {
    id: string;
    type: EnemyType;
    x: number;
    y: number;
    patrolMinX?: number;
    patrolMaxX?: number;
  }) {
    this.id = options.id;
    this.type = options.type;
    this.x = options.x;
    this.y = options.y;
    this.baseY = options.y;
    this.patrolMinX = options.patrolMinX !== undefined ? options.patrolMinX : options.x - 140;
    this.patrolMaxX = options.patrolMaxX !== undefined ? options.patrolMaxX : options.x + 140;

    switch (this.type) {
      // 1. STOMPABLE ENEMIES (Jump to kill!)
      case EnemyType.GLOOM_WALKER:
        this.width = 28;
        this.height = 28;
        this.baseSpeed = 1.3;
        this.chaseSpeed = 2.0;
        this.health = 1;
        this.isSpiked = false;
        break;

      case EnemyType.ZEPHYR_FLYER:
        this.width = 30;
        this.height = 24;
        this.baseSpeed = 1.5;
        this.chaseSpeed = 2.2;
        this.health = 1;
        this.isSpiked = false;
        break;

      // 2. SPIKED / NON-STOMPABLE ENEMIES (Sharp spikes prevent jumping on top!)
      case EnemyType.ARMORED_BEETLE:
        this.width = 32;
        this.height = 26;
        this.baseSpeed = 1.2;
        this.chaseSpeed = 1.8;
        this.health = 2;
        this.isSpiked = true;
        break;

      case EnemyType.SHADOW_PROWLER:
        this.width = 34;
        this.height = 30;
        this.baseSpeed = 1.4;
        this.chaseSpeed = 2.3;
        this.health = 2;
        this.isSpiked = true;
        break;

      case EnemyType.SPORE_TURRET:
        this.width = 30;
        this.height = 32;
        this.baseSpeed = 0;
        this.health = 2;
        this.shootCooldown = 2.2;
        this.isSpiked = true;
        break;

      default:
        this.width = 28;
        this.height = 28;
        this.isSpiked = false;
    }
  }

  public takeDamage(damage: number, fromFireball: boolean = false, knockbackDir: number = 1): boolean {
    if (this.isDead) return false;

    this.health -= damage;
    soundManager.playStomp();
    particleManager.emitImpactBurst(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.isSpiked ? '#ef4444' : '#f59e0b'
    );

    if (this.health <= 0) {
      this.isDead = true;
      this.state = EnemyAIState.DEAD;
      this.vy = -6.5;
      this.vx = knockbackDir * 3.0;
      this.scaleX = 1.4;
      this.scaleY = 0.5;
      return true;
    }
    return false;
  }

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    platforms: PlatformBlock[],
    spawnProjectiles: (p: Projectile) => void
  ) {
    this.animTimer += dt;
    if (this.turnCooldown > 0) this.turnCooldown -= dt;
    if (this.pauseTimer > 0) this.pauseTimer -= dt;

    // 1. Handle Dead state physics
    if (this.isDead) {
      this.deathTimer += dt;
      this.vy += 24.0 * dt; // Gravity
      this.y += this.vy * (dt * 60);
      this.x += this.vx * (dt * 60);
      return;
    }

    // Anti-jitter calculations
    const centerEnemyX = this.x + this.width / 2;
    const centerEnemyY = this.y + this.height / 2;
    const dx = playerX - centerEnemyX;
    const dy = playerY - centerEnemyY;
    const distToPlayer = Math.hypot(dx, dy);

    // Balanced line-of-sight tracking check
    const canSeePlayer = distToPlayer < this.detectionRange && Math.abs(dy) < 120;

    if (canSeePlayer) {
      if (!this.isAlerted) {
        this.isAlerted = true;
        this.alertTimer = 1.0;
        this.scaleX = 0.85;
        this.scaleY = 1.25;
      }
      this.state = EnemyAIState.CHASE;
    } else {
      if (this.isAlerted) {
        this.alertTimer -= dt;
        if (this.alertTimer <= 0) {
          this.isAlerted = false;
          this.state = EnemyAIState.PATROL;
        }
      } else {
        this.state = EnemyAIState.PATROL;
      }
    }

    // --- ENEMY TYPE SPECIFIC AI ---
    switch (this.type) {
      // 1. GLOOM WALKER (Stompable Walker)
      case EnemyType.GLOOM_WALKER:
      case EnemyType.ARMORED_BEETLE:
      case EnemyType.SHADOW_PROWLER: {
        let desiredSpeed = 0;

        if (this.state === EnemyAIState.CHASE && this.pauseTimer <= 0) {
          // Deadzone: only turn if distance is substantial to prevent 60fps flickering
          if (Math.abs(dx) > 16 && this.turnCooldown <= 0) {
            const wantRight = dx > 0;
            if (this.facingRight !== wantRight) {
              this.facingRight = wantRight;
              this.turnCooldown = 0.35; // 350ms cooldown prevents rapid jitter
              this.scaleX = 0.85;
              this.scaleY = 1.15;
            }
          }

          // Check if cliff ahead before advancing
          const checkAheadX = this.facingRight ? this.x + this.width + 8 : this.x - 8;
          const groundAhead = this.hasGroundBelow(checkAheadX, this.y + this.height + 4, platforms);

          if (groundAhead) {
            desiredSpeed = (this.facingRight ? 1 : -1) * this.chaseSpeed;
          } else {
            // Ledge detected! Don't glitch out - pause gracefully and observe
            desiredSpeed = 0;
            this.pauseTimer = 0.4;
          }
        } else if (this.pauseTimer <= 0) {
          // Patrol Mode
          const checkAheadX = this.facingRight ? this.x + this.width + 6 : this.x - 6;
          const groundAhead = this.hasGroundBelow(checkAheadX, this.y + this.height + 4, platforms);

          if (!groundAhead || this.x < this.patrolMinX || this.x > this.patrolMaxX) {
            if (this.turnCooldown <= 0) {
              this.facingRight = !this.facingRight;
              this.turnCooldown = 0.4;
              this.scaleX = 0.85;
              this.scaleY = 1.15;
            }
          }
          desiredSpeed = (this.facingRight ? 1 : -1) * this.baseSpeed;
        }

        // Smooth Acceleration (prevents instant teleports/glitches)
        const lerpFactor = 1 - Math.exp(-12 * dt);
        this.vx += (desiredSpeed - this.vx) * lerpFactor;

        // Apply Horizontal Movement
        const nextX = this.x + this.vx * (dt * 60);

        // Check horizontal wall collision
        if (!this.checkWallCollision(nextX, this.y, platforms)) {
          this.x = nextX;
        } else {
          // Rebound on wall hit
          if (this.turnCooldown <= 0) {
            this.facingRight = !this.facingRight;
            this.turnCooldown = 0.3;
            this.vx = -this.vx * 0.5;
          }
        }

        // Apply Vertical Gravity & Floor Collision
        this.vy += 22.0 * dt;
        const nextY = this.y + this.vy * (dt * 60);
        const groundY = this.resolveVerticalGround(this.x, nextY, platforms);

        if (groundY !== null) {
          this.y = groundY - this.height;
          this.vy = 0;
          this.isGrounded = true;
        } else {
          this.y = nextY;
          this.isGrounded = false;
        }

        // Update Walk Animation cycle
        this.walkProgress += Math.abs(this.vx) * (dt * 4.5);
        break;
      }

      // 2. ZEPHYR FLYER (Smooth Sine-Wave Aerial Scout)
      case EnemyType.ZEPHYR_FLYER: {
        this.flyAngle += dt * 3.0;

        if (this.state === EnemyAIState.CHASE) {
          if (Math.abs(dx) > 16 && this.turnCooldown <= 0) {
            const wantRight = dx > 0;
            if (this.facingRight !== wantRight) {
              this.facingRight = wantRight;
              this.turnCooldown = 0.3;
            }
          }
          const desiredVx = (this.facingRight ? 1 : -1) * this.chaseSpeed;
          this.vx += (desiredVx - this.vx) * (1 - Math.exp(-8 * dt));
          this.x += this.vx * (dt * 60);

          // Smooth Altitude Tracking
          const targetY = playerY - 10 + Math.sin(this.flyAngle) * 8;
          this.y += (targetY - this.y) * (1 - Math.exp(-4 * dt));
        } else {
          // Patrol Mode
          if (this.x < this.patrolMinX && this.turnCooldown <= 0) {
            this.facingRight = true;
            this.turnCooldown = 0.3;
          } else if (this.x > this.patrolMaxX && this.turnCooldown <= 0) {
            this.facingRight = false;
            this.turnCooldown = 0.3;
          }
          const desiredVx = (this.facingRight ? 1 : -1) * this.baseSpeed;
          this.vx += (desiredVx - this.vx) * (1 - Math.exp(-8 * dt));
          this.x += this.vx * (dt * 60);

          // Sinusoidal Float
          const targetY = this.baseY + Math.sin(this.flyAngle) * 18;
          this.y += (targetY - this.y) * (1 - Math.exp(-6 * dt));
        }
        break;
      }

      // 3. SPORE TURRET (Stationary Ranged Defense)
      case EnemyType.SPORE_TURRET: {
        if (Math.abs(dx) > 12 && this.turnCooldown <= 0) {
          const wantRight = dx > 0;
          if (this.facingRight !== wantRight) {
            this.facingRight = wantRight;
            this.turnCooldown = 0.3;
          }
        }
        this.shootCooldown -= dt;
        if (distToPlayer < 280 && this.shootCooldown <= 0) {
          this.shootCooldown = 2.4;
          const dir = this.facingRight ? 1 : -1;
          spawnProjectiles({
            id: Math.random().toString(),
            x: this.x + (this.facingRight ? this.width : 0),
            y: this.y + 8,
            width: 10,
            height: 10,
            vx: dir * 4.0,
            vy: -2.0,
            life: 2.4,
            maxLife: 2.4,
            isPlayer: false,
            damage: 1,
            color: '#a855f7',
            glowColor: '#c084fc',
          });
          soundManager.playFireball();
          this.scaleX = 1.25;
          this.scaleY = 0.75;
        }
        break;
      }
    }

    // Smooth Squash & Stretch Recovery
    this.scaleX += (1.0 - this.scaleX) * (1 - Math.exp(-14 * dt));
    this.scaleY += (1.0 - this.scaleY) * (1 - Math.exp(-14 * dt));
  }

  // Helper: check if there is ground beneath a coordinate
  private hasGroundBelow(cx: number, cy: number, platforms: PlatformBlock[]): boolean {
    return platforms.some(
      (p) => !p.broken && p.type !== PlatformType.LAVA && cx >= p.x && cx <= p.x + p.width && cy >= p.y && cy <= p.y + p.height + 12
    );
  }

  // Helper: check horizontal wall collision
  private checkWallCollision(nextX: number, y: number, platforms: PlatformBlock[]): boolean {
    for (const p of platforms) {
      if (p.broken || p.type === PlatformType.ONE_WAY) continue;
      if (
        nextX < p.x + p.width &&
        nextX + this.width > p.x &&
        y + this.height > p.y + 4 &&
        y < p.y + p.height - 4
      ) {
        return true;
      }
    }
    return false;
  }

  // Helper: resolve vertical platform landing
  private resolveVerticalGround(x: number, nextY: number, platforms: PlatformBlock[]): number | null {
    for (const p of platforms) {
      if (p.broken) continue;
      // Broad horizontal overlap
      if (x + this.width > p.x + 4 && x < p.x + p.width - 4) {
        // Landing on top surface
        if (this.y + this.height <= p.y + 8 && nextY + this.height >= p.y) {
          return p.y;
        }
      }
    }
    return null;
  }

  // --- CRISP & PROFESSIONAL PROCEDURAL RENDERING ---
  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    const drawX = this.x - camX;
    const drawY = this.y - camY;

    ctx.save();
    ctx.translate(drawX + this.width / 2, drawY + this.height);
    ctx.scale((this.facingRight ? 1 : -1) * this.scaleX, this.scaleY);

    if (this.isDead) {
      ctx.rotate(this.deathTimer * 8);
    }

    switch (this.type) {
      // 1. GLOOM WALKER (STOMPABLE: Soft organic crawler with bouncy footwork)
      case EnemyType.GLOOM_WALKER: {
        const walkCycle = Math.sin(this.walkProgress) * 3;
        // Legs
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(-9, -5, 5, 5 + walkCycle);
        ctx.fillRect(4, -5, 5, 5 - walkCycle);

        // Body: Round soft indigo blob
        ctx.fillStyle = '#4338ca';
        ctx.beginPath();
        ctx.roundRect(-12, -26, 24, 22, 8);
        ctx.fill();

        // Soft crown rim
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(-10, -25, 20, 3);

        // Pupil eye tracking
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(3, -17, 4, 0, Math.PI * 2);
        ctx.fill();

        // Animated pupil (glows yellow when alerted)
        ctx.fillStyle = this.state === EnemyAIState.CHASE ? '#fbbf24' : '#818cf8';
        ctx.beginPath();
        ctx.arc(4.5, -17, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // 2. ZEPHYR FLYER (STOMPABLE: Floating bat/wisp with wing flaps)
      case EnemyType.ZEPHYR_FLYER: {
        const wingFlap = Math.sin(this.animTimer * 12) * 8;
        // Wings
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.ellipse(-8, -15 + wingFlap, 10, 5, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(8, -15 - wingFlap, 10, 5, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Core Body
        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.arc(0, -13, 10, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = this.state === EnemyAIState.CHASE ? '#ef4444' : '#e0f2fe';
        ctx.beginPath();
        ctx.arc(4, -14, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // 3. ARMORED BEETLE (SPIKED / NON-STOMPABLE: Thick armor with 3 sharp red-steel spikes!)
      case EnemyType.ARMORED_BEETLE: {
        const walkCycle = Math.sin(this.walkProgress) * 2;
        // Tiny armored legs
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-11, -4, 4, 4 + walkCycle);
        ctx.fillRect(7, -4, 4, 4 - walkCycle);

        // Armored body
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-14, -20, 28, 19, 5);
        ctx.fill();

        // Prominent Sharp Red Spikes (Visual Warning: DO NOT STOMP!)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-10, -20);
        ctx.lineTo(-6, -30);
        ctx.lineTo(-2, -20);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-2, -20);
        ctx.lineTo(2, -32);
        ctx.lineTo(6, -20);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(6, -20);
        ctx.lineTo(10, -30);
        ctx.lineTo(14, -20);
        ctx.fill();

        // Spike gleams
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-6, -30);
        ctx.lineTo(2, -32);
        ctx.lineTo(10, -30);
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(4, -12, 5, 3);
        break;
      }

      // 4. SHADOW PROWLER (SPIKED / NON-STOMPABLE: Sharp Horned Shadow Stalker)
      case EnemyType.SHADOW_PROWLER: {
        const walkCycle = Math.sin(this.walkProgress) * 3;
        // Legs
        ctx.fillStyle = '#020617';
        ctx.fillRect(-12, -6, 5, 6 + walkCycle);
        ctx.fillRect(7, -6, 5, 6 - walkCycle);

        // Body
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-15, -24, 30, 21, 5);
        ctx.fill();

        // Sharp Spiked Horns
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-8, -24);
        ctx.lineTo(-12, -34);
        ctx.lineTo(-4, -24);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(4, -24);
        ctx.lineTo(8, -34);
        ctx.lineTo(12, -24);
        ctx.fill();

        // Fierce glowing eyes
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(4, -17, 6, 4);

        // Fangs
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(8, -9);
        ctx.lineTo(11, -5);
        ctx.lineTo(13, -9);
        ctx.fill();
        break;
      }

      // 5. SPORE TURRET (SPIKED SENTRY)
      case EnemyType.SPORE_TURRET: {
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(-6, -8, 12, 8);
        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.arc(0, -18, 12, 0, Math.PI * 2);
        ctx.fill();

        // Sharp Red Top Spikes
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-6, -28);
        ctx.lineTo(0, -36);
        ctx.lineTo(6, -28);
        ctx.fill();

        // Cannon spout
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(7, -18, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }

    // Alert indicator badge (Only shows when actively spotting/tracking player)
    if (this.isAlerted && !this.isDead) {
      ctx.save();
      ctx.scale(this.facingRight ? 1 : -1, 1);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -40, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, -36);
      ctx.restore();
    }

    ctx.restore();
  }
}
