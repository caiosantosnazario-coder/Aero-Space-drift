/**
 * Ship — Player entity with drift physics, trail rendering, and phase ship swapping.
 */
import { CONFIG } from '../config.js';

export class Ship {
  constructor(scene, shipKey) {
    this.scene = scene;
    this.shipKey = shipKey || 'ship_falcon';
    this.shipAGKey = shipKey ? shipKey + '_ag' : 'ship_falcon_ag';
    const W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;

    // Sprite
    this.sprite = scene.physics.add.sprite(
      W / 2, H - CONFIG.SHIP.START_Y_OFFSET, this.shipKey
    );
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setSize(CONFIG.SHIP.WIDTH * 0.6, CONFIG.SHIP.HEIGHT * 0.7);
    this.sprite.setDepth(10);

    // Physics state
    this.vx = 0;
    this.tilt = 0;
    this.isAntiGravity = false;
    this._currentColors = CONFIG.PHASES[1].colors;

    // Trail particles
    this.trailParticles = scene.add.particles(0, 0, 'particle', {
      speed: { min: 20, max: 60 },
      angle: { min: 80, max: 100 },
      scale: { start: 0.6, end: 0 },
      lifespan: 400,
      alpha: { start: 0.8, end: 0 },
      tint: this._currentColors.THRUSTER,
      blendMode: 'ADD',
      frequency: 30,
      follow: this.sprite,
      followOffset: { x: 0, y: CONFIG.SHIP.HEIGHT * 0.4 },
    });
    this.trailParticles.setDepth(9);

    // Side drift trail
    this.driftParticles = scene.add.particles(0, 0, 'particle', {
      speed: { min: 10, max: 40 },
      scale: { start: 0.4, end: 0 },
      lifespan: 250,
      alpha: { start: 0.5, end: 0 },
      tint: this._currentColors.CYAN,
      blendMode: 'ADD',
      frequency: -1,
      follow: this.sprite,
    });
    this.driftParticles.setDepth(9);
  }

  update(delta, inputH, inputV) {
    const cfg = CONFIG.SHIP;
    const dt = delta / 1000;

    // ── Horizontal acceleration ──
    if (inputH !== 0) {
      this.vx += inputH * cfg.ACCELERATION * dt;
    } else {
      const drag = this.isAntiGravity ? cfg.DRAG * 0.2 : cfg.DRAG;
      if (this.vx > 0) this.vx = Math.max(0, this.vx - drag * dt);
      else if (this.vx < 0) this.vx = Math.min(0, this.vx + drag * dt);
    }

    // Drift sparks on direction change
    if (inputH !== 0 && Math.sign(inputH) !== Math.sign(this.vx) && Math.abs(this.vx) > 50) {
      this.driftParticles.emitParticle(3);
    }

    // Clamp speed
    const maxSpd = this.isAntiGravity ? cfg.MAX_SPEED * 1.3 : cfg.MAX_SPEED;
    this.vx = Phaser.Math.Clamp(this.vx, -maxSpd, maxSpd);

    // Apply velocity
    this.sprite.body.setVelocityX(this.vx);

    // Vertical
    if (inputV !== 0) {
      this.sprite.body.setVelocityY(inputV * cfg.MAX_SPEED * 0.35);
    } else {
      this.sprite.body.setVelocityY(this.sprite.body.velocity.y * 0.9);
    }

    // ── Visual tilt ──
    const targetTilt = (this.vx / cfg.MAX_SPEED) * -cfg.TILT_MAX;
    this.tilt = Phaser.Math.Linear(this.tilt, targetTilt, cfg.TILT_LERP * 60 * dt);
    this.sprite.setRotation(this.tilt);

    // ── Trail intensity ──
    const speedRatio = Math.abs(this.vx) / cfg.MAX_SPEED;
    this.trailParticles.setQuantity(Math.floor(1 + speedRatio * 3));
  }

  setAntiGravity(active) {
    this.isAntiGravity = active;
    if (active) {
      this.sprite.setTexture(this.shipAGKey);
      this.trailParticles.setParticleTint(0xffff00);
      this.sprite.setScale(1.1);
    } else {
      this.sprite.setTexture(this.shipKey);
      this.trailParticles.setParticleTint(this._currentColors.THRUSTER);
      this.sprite.setScale(1);
    }
  }

  setPhaseShip(shipKey, shipAGKey, colors) {
    this.shipKey = shipKey;
    this.shipAGKey = shipAGKey;
    this._currentColors = colors;
    this.sprite.setTexture(this.shipKey);
    this.trailParticles.setParticleTint(colors.THRUSTER);
    this.driftParticles.setParticleTint(colors.CYAN);
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  get body() { return this.sprite.body; }

  destroy() {
    this.trailParticles.destroy();
    this.driftParticles.destroy();
    this.sprite.destroy();
  }
}
