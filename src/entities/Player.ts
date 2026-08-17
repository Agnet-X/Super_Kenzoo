/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerState, PowerUpType, Rect, Projectile } from '../types';
import { InputState } from '../engine/Input';
import { soundManager } from '../audio/SoundManager';
import { particleManager } from '../engine/Particles';

export interface PlayerConfig {
  walkSpeed: number;
  runSpeed: number;
  sprintSpeed: number;
  walkAccel: number;
  runAccel: number;
  airAccel: number;
  groundFriction: number;
  airFriction: number;
  skidFriction: number;
  jumpForce: number;
  gravity: number;
  fallingGravity: number;
  fastFallGravity: number;
  coyoteTimeMax: number;
  jumpBufferMax: number;
}

export class Player implements Rect {
  // Bounding box (hitbox)
  public x: number = 100;
  public y: number = 200;
  public width: number = 26;
  public height: number = 38;

  // Velocities
  public vx: number = 0;
  public vy: number = 0;

  // Movement & State
  public state: PlayerState = PlayerState.IDLE;
  public facingRight: boolean = true;
  public isGrounded: boolean = false;
  public wasGrounded: boolean = false;
  public isCrouching: boolean = false;
  public isSkidding: boolean = false;

  // Power-up & Health
  public powerUp: PowerUpType = PowerUpType.NONE;
  public health: number = 3;
  public maxHealth: number = 3;
  public invulnerableTimer: number = 0;
  public isInvulnerable: boolean = false;
  public attackCooldown: number = 0;
  public speedBoostTimer: number = 0;

  // Timers & Buffers
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private jumpHoldTimer: number = 0;
  private isJumping: boolean = false;
  private stateTimer: number = 0;
  private animTimer: number = 0;
  private skidCooldown: number = 0;
  private stepDustTimer: number = 0;

  // Squash & Stretch deformation
  public scaleX: number = 1.0;
  public scaleY: number = 1.0;
  private targetScaleX: number = 1.0;
  private targetScaleY: number = 1.0;
  public rotation: number = 0;

  // Cape / Scarf physics simulation (Verlet joints)
  public scarfJoints: { x: number; y: number; oldX: number; oldY: number }[] = [];

  // Config parameters
  public config: PlayerConfig = {
    walkSpeed: 3.2,
    runSpeed: 5.4,
    sprintSpeed: 6.8,
    walkAccel: 0.35,
    runAccel: 0.48,
    airAccel: 0.28,
    groundFriction: 0.82,
    airFriction: 0.94,
    skidFriction: 0.68,
    jumpForce: -10.5,
    gravity: 0.46,
    fallingGravity: 0.68,
    fastFallGravity: 1.05,
    coyoteTimeMax: 0.12,
    jumpBufferMax: 0.14,
  };

  // After-image ghosts for sprint/speed boost
  public ghosts: { x: number; y: number; alpha: number; scaleX: number; scaleY: number; color: string }[] = [];

  constructor(spawnX: number, spawnY: number) {
    this.x = spawnX;
    this.y = spawnY;
    
    // Initialize scarf joints
    for (let i = 0; i < 5; i++) {
      this.scarfJoints.push({
        x: this.x,
        y: this.y + 10 + i * 4,
        oldX: this.x,
        oldY: this.y + 10 + i * 4,
      });
    }
  }

  public reset(spawnX: number, spawnY: number) {
    this.x = spawnX;
    this.y = spawnY;
    this.vx = 0;
    this.vy = 0;
    this.state = PlayerState.IDLE;
    this.health = 3;
    this.powerUp = PowerUpType.NONE;
    this.invulnerableTimer = 0;
    this.isInvulnerable = false;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.ghosts = [];
  }

  public setPowerUp(type: PowerUpType) {
    this.powerUp = type;
    soundManager.playPowerUp();
    particleManager.emitSparkles(this.x + this.width / 2, this.y + this.height / 2, 20, [
      '#facc15', '#38bdf8', '#fb7185', '#a855f7'
    ]);
    if (type === PowerUpType.GROWTH) {
      this.height = 46;
      this.width = 28;
      this.health = Math.min(this.maxHealth + 1, 4);
    } else {
      this.height = 38;
      this.width = 26;
    }
    if (type === PowerUpType.SPEED_GEM) {
      this.speedBoostTimer = 12.0;
    }
    // Transformation squash
    this.scaleX = 1.4;
    this.scaleY = 0.7;
  }

  public takeDamage(damage: number = 1, knockbackDir: number = 1): boolean {
    if (this.isInvulnerable || this.state === PlayerState.DEAD || this.state === PlayerState.VICTORY) {
      return false;
    }

    if (this.powerUp === PowerUpType.SHIELD_ORB) {
      // Shield absorbs hit
      this.powerUp = PowerUpType.NONE;
      this.invulnerableTimer = 1.2;
      this.isInvulnerable = true;
      soundManager.playHit();
      particleManager.emitImpactBurst(this.x + this.width / 2, this.y + this.height / 2, '#38bdf8');
      return false;
    }

    if (this.powerUp !== PowerUpType.NONE) {
      // Downgrade powerup
      this.setPowerUp(PowerUpType.NONE);
      this.invulnerableTimer = 2.0;
      this.isInvulnerable = true;
      soundManager.playHit();
      particleManager.emitImpactBurst(this.x + this.width / 2, this.y + this.height / 2, '#ef4444');
      this.vx = knockbackDir * 4.5;
      this.vy = -5.5;
      this.state = PlayerState.HURT;
      return false;
    }

    this.health -= damage;
    this.invulnerableTimer = 2.0;
    this.isInvulnerable = true;
    soundManager.playHit();
    particleManager.emitImpactBurst(this.x + this.width / 2, this.y + this.height / 2, '#ef4444');

    if (this.health <= 0) {
      this.state = PlayerState.DEAD;
      this.vy = -9.0;
      this.vx = knockbackDir * 2.0;
      return true;
    } else {
      this.vx = knockbackDir * 4.5;
      this.vy = -5.5;
      this.state = PlayerState.HURT;
      this.scaleX = 0.8;
      this.scaleY = 1.3;
      return false;
    }
  }

  public update(input: InputState, dt: number, spawnProjectiles: (p: Projectile) => void) {
    this.stateTimer += dt;
    this.animTimer += dt;

    // Handle Invulnerability Flash
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      this.isInvulnerable = this.invulnerableTimer > 0;
    }

    // Handle Attack Cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    // Handle Speed Boost Timer
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= dt;
      if (this.speedBoostTimer <= 0 && this.powerUp === PowerUpType.SPEED_GEM) {
        this.powerUp = PowerUpType.NONE;
      }
    }

    // Dead state physics
    if (this.state === PlayerState.DEAD) {
      this.vy += this.config.gravity * 1.2;
      this.y += this.vy;
      this.x += this.vx;
      this.rotation += 0.08;
      return;
    }

    // Victory state
    if (this.state === PlayerState.VICTORY) {
      this.vx *= 0.85;
      this.vy += this.config.gravity;
      return;
    }

    // Ground Detection & Coyote Time
    if (this.isGrounded) {
      this.coyoteTimer = this.config.coyoteTimeMax;
      this.isJumping = false;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    // Jump Buffering
    if (input.jumpJustPressed) {
      this.jumpBufferTimer = this.config.jumpBufferMax;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // 1. CROUCHING LOGIC
    this.isCrouching = input.down && this.isGrounded;

    // 2. HORIZONTAL MOVEMENT & SKIDDING
    let moveInput = 0;
    if (input.left && !input.right) moveInput = -1;
    if (input.right && !input.left) moveInput = 1;

    // Determine target max speed
    let maxSpeed = this.config.walkSpeed;
    if (input.run) maxSpeed = this.config.runSpeed;
    if (this.powerUp === PowerUpType.SPEED_GEM || this.speedBoostTimer > 0) {
      maxSpeed = this.config.sprintSpeed;
    }
    if (this.isCrouching) {
      maxSpeed = this.config.walkSpeed * 0.4;
    }

    // Acceleration and Deceleration
    const accel = this.isGrounded
      ? (input.run ? this.config.runAccel : this.config.walkAccel)
      : this.config.airAccel;

    if (moveInput !== 0) {
      // Changing direction check for skidding
      const isReversing = (moveInput > 0 && this.vx < -1.5) || (moveInput < 0 && this.vx > 1.5);
      
      if (this.isGrounded && isReversing) {
        // Skidding
        this.isSkidding = true;
        this.vx *= this.config.skidFriction;
        this.state = PlayerState.SKID;
        this.skidCooldown += dt;
        if (this.skidCooldown > 0.08) {
          soundManager.playSkid();
          particleManager.emitSkidDust(this.x + this.width / 2, this.y + this.height, this.facingRight);
          this.skidCooldown = 0;
        }
      } else {
        this.isSkidding = false;
        this.vx += moveInput * accel;
        // Clamp speed
        if (Math.abs(this.vx) > maxSpeed) {
          this.vx = Math.sign(this.vx) * maxSpeed;
        }
        this.facingRight = moveInput > 0;
      }
    } else {
      // Natural braking
      this.isSkidding = false;
      const friction = this.isGrounded ? this.config.groundFriction : this.config.airFriction;
      this.vx *= friction;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    }

    // Footstep dust emissions
    if (this.isGrounded && Math.abs(this.vx) > 2.0) {
      this.stepDustTimer += dt;
      if (this.stepDustTimer > 0.16) {
        particleManager.emitDust(this.x + this.width / 2, this.y + this.height, 2, this.vx);
        this.stepDustTimer = 0;
      }
    }

    // 3. JUMP LOGIC (Variable height, coyote time, buffer, anticipation squash)
    const canJump = this.isGrounded || this.coyoteTimer > 0;
    if (this.jumpBufferTimer > 0 && canJump && !this.isJumping) {
      this.executeJump();
    }

    // Variable Jump Height (releasing jump early shortens jump)
    if (input.jump && this.isJumping && this.vy < 0 && this.jumpHoldTimer < 0.22) {
      this.jumpHoldTimer += dt;
      this.vy += -0.22; // Sustained boost
    }
    if (input.jumpJustReleased && this.vy < -3.0) {
      this.vy *= 0.45; // Jump cut
      this.isJumping = false;
    }

    // 4. VERTICAL PHYSICS & GRAVITY
    let appliedGravity = this.config.gravity;
    if (this.vy > 0) {
      // Falling gravity is slightly heavier for snappy, satisfying control
      appliedGravity = this.config.fallingGravity;
    }
    // Fast fall on pressing Down in air
    if (input.down && !this.isGrounded && this.vy > -1.0) {
      appliedGravity = this.config.fastFallGravity;
      particleManager.emitDust(this.x + this.width / 2, this.y + 10, 1);
    }

    this.vy += appliedGravity;
    if (this.vy > 13.0) this.vy = 13.0; // Max terminal velocity

    // 5. ATTACKING / SHOOTING (Spacebar)
    if (input.attackJustPressed && this.attackCooldown <= 0) {
      if (this.powerUp === PowerUpType.FIRE_ORB) {
        // Solar Fireball
        this.attackCooldown = 0.24;
        soundManager.playFireball();
        const pvx = (this.facingRight ? 1 : -1) * 8.0;
        spawnProjectiles({
          id: Math.random().toString(),
          x: this.facingRight ? this.x + this.width : this.x - 12,
          y: this.y + this.height * 0.4,
          width: 14,
          height: 14,
          vx: pvx,
          vy: 1.2,
          life: 1.8,
          maxLife: 1.8,
          isPlayer: true,
          damage: 1,
          color: '#f97316',
          glowColor: '#fbbf24',
        });
        particleManager.emitSparkles(this.x + (this.facingRight ? this.width : 0), this.y + this.height * 0.4, 6, ['#f97316', '#facc15']);
      } else {
        // Aura Blade Slash / Energy Strike (Base Attack)
        this.attackCooldown = 0.3;
        soundManager.playFireball();
        const pvx = (this.facingRight ? 1 : -1) * 6.5;
        spawnProjectiles({
          id: Math.random().toString(),
          x: this.facingRight ? this.x + this.width + 2 : this.x - 20,
          y: this.y + this.height * 0.35,
          width: 22,
          height: 22,
          vx: pvx,
          vy: 0,
          life: 0.35,
          maxLife: 0.35,
          isPlayer: true,
          damage: 1,
          color: '#38bdf8',
          glowColor: '#67e8f9',
        });
        particleManager.emitSparkles(this.x + (this.facingRight ? this.width + 10 : -10), this.y + this.height * 0.4, 6, ['#38bdf8', '#a855f7']);
        this.scaleX = 1.2;
        this.scaleY = 0.85;
      }
    }

    // 6. SPRINT / SPEED GHOST TRAIL
    if (Math.abs(this.vx) > 5.0 || this.powerUp === PowerUpType.SPEED_GEM) {
      if (Math.random() < 0.3) {
        this.ghosts.push({
          x: this.x,
          y: this.y,
          alpha: 0.55,
          scaleX: this.scaleX,
          scaleY: this.scaleY,
          color: this.powerUp === PowerUpType.SPEED_GEM ? '#38bdf8' : '#f59e0b',
        });
      }
    }

    // Update ghosts
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      this.ghosts[i].alpha -= dt * 3.5;
      if (this.ghosts[i].alpha <= 0) {
        this.ghosts.splice(i, 1);
      }
    }

    // 7. SQUASH & STRETCH INTERPOLATION
    this.scaleX += (this.targetScaleX - this.scaleX) * 0.25;
    this.scaleY += (this.targetScaleY - this.scaleY) * 0.25;
    this.targetScaleX = 1.0;
    this.targetScaleY = 1.0;

    // 8. UPDATE STATE MACHINE
    this.updateStateMachine();

    // 9. UPDATE SCARF / CAPE PHYSICS
    this.updateScarfPhysics(dt);
  }

  private executeJump() {
    this.vy = this.config.jumpForce;
    this.isGrounded = false;
    this.isJumping = true;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.jumpHoldTimer = 0;

    soundManager.playJump(this.powerUp === PowerUpType.GROWTH);

    // Jump Squash -> Stretch
    this.scaleX = 0.75;
    this.scaleY = 1.35;

    particleManager.emitDust(this.x + this.width / 2, this.y + this.height, 5);
  }

  public onLand(fallSpeed: number) {
    this.isGrounded = true;
    this.isJumping = false;

    // Landing reaction depending on fall velocity
    const intensity = Math.min(2.5, Math.abs(fallSpeed) / 5.0);
    soundManager.playLand(intensity);
    particleManager.emitLandingDust(this.x + this.width / 2, this.y + this.height, intensity);

    // Landing Squash
    this.scaleX = 1.0 + 0.22 * intensity;
    this.scaleY = Math.max(0.6, 1.0 - 0.22 * intensity);
  }

  private updateStateMachine() {
    if (this.state === PlayerState.DEAD || this.state === PlayerState.VICTORY) return;

    if (!this.isGrounded) {
      if (this.vy < -1.5) {
        this.state = PlayerState.RISING;
      } else {
        this.state = PlayerState.FALLING;
      }
      return;
    }

    if (this.isCrouching) {
      this.state = PlayerState.CROUCH;
      return;
    }

    if (this.isSkidding) {
      this.state = PlayerState.SKID;
      return;
    }

    const speed = Math.abs(this.vx);
    if (speed > 5.0) {
      this.state = PlayerState.SPRINT;
    } else if (speed > 3.0) {
      this.state = PlayerState.RUN;
    } else if (speed > 0.2) {
      this.state = PlayerState.WALK;
    } else {
      this.state = PlayerState.IDLE;
    }
  }

  private updateScarfPhysics(dt: number) {
    const attachX = this.x + (this.facingRight ? 6 : this.width - 6);
    const attachY = this.y + 14;

    this.scarfJoints[0].x = attachX;
    this.scarfJoints[0].y = attachY;

    // Verlet integration for flowing scarf/cape
    for (let i = 1; i < this.scarfJoints.length; i++) {
      const joint = this.scarfJoints[i];
      const vx = (joint.x - joint.oldX) * 0.88;
      const vy = (joint.y - joint.oldY) * 0.88;

      joint.oldX = joint.x;
      joint.oldY = joint.y;

      // Inertia + Wind / Movement trail
      const trailLag = (this.facingRight ? -1 : 1) * Math.abs(this.vx) * 0.8;
      joint.x += vx + trailLag;
      joint.y += vy + 0.35; // Gravity pull

      // Constraint link to previous joint
      const prev = this.scarfJoints[i - 1];
      const dx = joint.x - prev.x;
      const dy = joint.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = 6;
      const diff = (dist - targetDist) / dist;

      joint.x -= dx * 0.5 * diff;
      joint.y -= dy * 0.5 * diff;
    }
  }

  // --- PROCEDURAL CHARACTER RENDERING ---
  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number) {
    const drawX = this.x - camX;
    const drawY = this.y - camY;

    // Draw Ghosts / After-images
    for (const g of this.ghosts) {
      ctx.save();
      ctx.globalAlpha = g.alpha;
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.roundRect(g.x - camX, g.y - camY, this.width, this.height, 6);
      ctx.fill();
      ctx.restore();
    }

    // Invulnerability Flashing
    if (this.isInvulnerable && Math.floor(this.invulnerableTimer * 20) % 2 === 0) {
      return; // Skip frame for transparent blink
    }

    ctx.save();
    // Center origin for squash and stretch
    const centerX = drawX + this.width / 2;
    const centerY = drawY + this.height;

    ctx.translate(centerX, centerY);
    ctx.scale((this.facingRight ? 1 : -1) * this.scaleX, this.scaleY);
    if (this.rotation) ctx.rotate(this.rotation);

    // Subtle run cycle bobbing
    let walkBobY = 0;
    let legSwing = 0;
    if (this.state === PlayerState.WALK || this.state === PlayerState.RUN || this.state === PlayerState.SPRINT) {
      const cycleSpeed = this.state === PlayerState.SPRINT ? 18 : 12;
      walkBobY = Math.sin(this.animTimer * cycleSpeed) * 2;
      legSwing = Math.sin(this.animTimer * cycleSpeed) * 8;
    } else if (this.state === PlayerState.IDLE) {
      walkBobY = Math.sin(this.animTimer * 3.5) * 1.2; // Idle breathing
    }

    // 1. Draw Flowing Scarf / Cape
    ctx.save();
    ctx.fillStyle = this.powerUp === PowerUpType.FIRE_ORB ? '#f97316' : (this.powerUp === PowerUpType.SPEED_GEM ? '#38bdf8' : '#e11d48');
    ctx.beginPath();
    ctx.moveTo(0, -this.height + 14);
    for (let i = 1; i < this.scarfJoints.length; i++) {
      const j = this.scarfJoints[i];
      // Convert world coord back to local
      const relX = (j.x - this.x - this.width / 2) * (this.facingRight ? 1 : -1);
      const relY = j.y - (this.y + this.height);
      ctx.lineTo(relX, relY);
    }
    ctx.lineWidth = 4;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.stroke();
    ctx.restore();

    // 2. Draw Legs / Boots
    ctx.fillStyle = '#1e293b';
    // Back leg
    ctx.fillRect(-8 - legSwing * 0.4, -8 + walkBobY, 6, 8);
    // Front leg
    ctx.fillRect(2 + legSwing * 0.4, -8 + walkBobY, 6, 8);

    // 3. Draw Body / Armor
    const armorColor = this.powerUp === PowerUpType.GROWTH ? '#ca8a04' : (this.powerUp === PowerUpType.SHIELD_ORB ? '#2563eb' : '#0f172a');
    ctx.fillStyle = armorColor;
    const bodyHeight = this.isCrouching ? this.height * 0.55 : this.height * 0.65;
    ctx.beginPath();
    ctx.roundRect(-this.width / 2 + 2, -this.height + 12 + walkBobY, this.width - 4, bodyHeight, 4);
    ctx.fill();

    // Chest emblem / Shard crest
    ctx.fillStyle = this.powerUp === PowerUpType.FIRE_ORB ? '#f59e0b' : (this.powerUp === PowerUpType.SPEED_GEM ? '#06b6d4' : '#38bdf8');
    ctx.beginPath();
    ctx.arc(0, -this.height + 22 + walkBobY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Draw Helmet / Head
    const helmetColor = '#334155';
    ctx.fillStyle = helmetColor;
    ctx.beginPath();
    ctx.roundRect(-this.width / 2, -this.height + walkBobY, this.width, 16, 6);
    ctx.fill();

    // Knight Visor & Glowing Eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(2, -this.height + 4 + walkBobY, 10, 5);

    // Visor Eye Glow
    ctx.fillStyle = this.powerUp === PowerUpType.FIRE_ORB ? '#fbbf24' : (this.powerUp === PowerUpType.SPEED_GEM ? '#67e8f9' : '#38bdf8');
    ctx.fillRect(4, -this.height + 5 + walkBobY, 6, 3);

    // 5. Power-Up Aura / Orbital Shields
    if (this.powerUp === PowerUpType.SHIELD_ORB) {
      const angle1 = this.animTimer * 4;
      const angle2 = angle1 + Math.PI;
      const orbitR = 24;

      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(Math.cos(angle1) * orbitR, -this.height / 2 + Math.sin(angle1) * 8, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(Math.cos(angle2) * orbitR, -this.height / 2 + Math.sin(angle2) * 8, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
