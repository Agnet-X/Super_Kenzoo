/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class Camera {
  public x: number = 0;
  public y: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;
  public viewportWidth: number = 960;
  public viewportHeight: number = 540;
  public levelWidth: number = 2000;
  public levelHeight: number = 1000;

  // Smoothing & Lead
  public smoothSpeed: number = 0.08;
  public lookAheadX: number = 0;
  public maxLookAhead: number = 90;
  public lookAheadLerp: number = 0.05;

  // Screen shake / Trauma
  private trauma: number = 0; // 0 to 1
  public shakeX: number = 0;
  public shakeY: number = 0;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  public setDimensions(vw: number, vh: number) {
    this.viewportWidth = vw;
    this.viewportHeight = vh;
  }

  public setLevelBounds(lw: number, lh: number) {
    this.levelWidth = lw;
    this.levelHeight = lh;
  }

  public addTrauma(amount: number) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  public reset(targetX: number, targetY: number) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.x = targetX - this.viewportWidth / 2;
    this.y = targetY - this.viewportHeight / 2;
    this.trauma = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.lookAheadX = 0;
    this.clamp();
  }

  public update(playerX: number, playerY: number, playerVx: number, facingRight: boolean, dt: number) {
    // Dynamic look ahead based on running direction
    const targetLead = facingRight ? this.maxLookAhead : -this.maxLookAhead;
    if (Math.abs(playerVx) > 1.5) {
      this.lookAheadX += (targetLead - this.lookAheadX) * this.lookAheadLerp;
    } else {
      this.lookAheadX += (0 - this.lookAheadX) * (this.lookAheadLerp * 0.5);
    }

    // Desired center point
    this.targetX = playerX + this.lookAheadX - this.viewportWidth / 2;
    this.targetY = playerY - this.viewportHeight / 2 - 20; // Slightly higher to see ground

    // Smooth interpolations
    this.x += (this.targetX - this.x) * this.smoothSpeed;
    this.y += (this.targetY - this.y) * this.smoothSpeed;

    // Camera Shake / Trauma calculation
    if (this.trauma > 0) {
      const shakePower = this.trauma * this.trauma * 20;
      this.shakeX = (Math.random() * 2 - 1) * shakePower;
      this.shakeY = (Math.random() * 2 - 1) * shakePower;
      this.trauma = Math.max(0, this.trauma - dt * 2.2); // Decay trauma over time
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    this.clamp();
  }

  private clamp() {
    // Clamp to level borders
    const minX = 0;
    const maxX = Math.max(0, this.levelWidth - this.viewportWidth);
    const minY = 0;
    const maxY = Math.max(0, this.levelHeight - this.viewportHeight);

    this.x = Math.max(minX, Math.min(this.x, maxX));
    this.y = Math.max(minY, Math.min(this.y, maxY));
  }

  public getDrawX(): number {
    return Math.floor(this.x + this.shakeX);
  }

  public getDrawY(): number {
    return Math.floor(this.y + this.shakeY);
  }
}
