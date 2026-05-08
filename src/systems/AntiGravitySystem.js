/**
 * AntiGravitySystem — Core mechanic: charge bar, activation, invulnerability.
 * Now integrates with ParallaxBackground for hyperspace visual.
 */
import { CONFIG } from '../config.js';

export class AntiGravitySystem {
  constructor(scene, ship) {
    this.scene = scene;
    this.ship = ship;
    this.charge = 0;
    this.isActive = false;
    this.timer = 0;
    this.activations = 0;
    this.canActivate = true;
    this.cooldown = 0;

    // Visual flash on activation
    this.flash = scene.add.rectangle(
      CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2,
      CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT,
      CONFIG.COLORS.CYAN, 0
    ).setDepth(50).setBlendMode('ADD');
  }

  update(delta) {
    const dt = delta / 1000;
    const ag = CONFIG.ANTIGRAVITY;

    if (this.isActive) {
      this.timer -= delta;
      if (this.timer <= 0) {
        this.deactivate();
      }
    } else {
      this.charge = Math.min(ag.MAX_CHARGE, this.charge + ag.PASSIVE_RATE * dt);
      if (this.cooldown > 0) {
        this.cooldown -= delta;
        if (this.cooldown <= 0) this.canActivate = true;
      }
    }
  }

  addNearMissCharge() {
    if (!this.isActive) {
      this.charge = Math.min(
        CONFIG.ANTIGRAVITY.MAX_CHARGE,
        this.charge + CONFIG.ANTIGRAVITY.NEAR_MISS_CHARGE
      );
    }
  }

  tryActivate() {
    if (this.charge >= CONFIG.ANTIGRAVITY.MAX_CHARGE && !this.isActive && this.canActivate) {
      this.activate();
      return true;
    }
    return false;
  }

  activate() {
    this.isActive = true;
    this.charge = 0;
    this.timer = CONFIG.ANTIGRAVITY.DURATION;
    this.activations++;
    this.canActivate = false;
    this.cooldown = 500;

    this.ship.setAntiGravity(true);

    // Notify parallax
    if (this.scene.parallax) {
      this.scene.parallax.setAntiGravityMode(true);
    }

    // Flash effect
    this.flash.setAlpha(0.4);
    this.scene.tweens.add({
      targets: this.flash, alpha: 0, duration: 400, ease: 'Cubic.easeOut',
    });

    // Screen shake
    this.scene.cameras.main.shake(200, 0.01);

    // Chromatic-like tint on camera
    this.scene.cameras.main.setBackgroundColor(0x0a0a2a);
  }

  deactivate() {
    this.isActive = false;
    this.ship.setAntiGravity(false);

    // Notify parallax
    if (this.scene.parallax) {
      this.scene.parallax.setAntiGravityMode(false);
    }

    // Restore phase bg color
    const phaseData = CONFIG.PHASES[this.scene.currentPhase || 1];
    this.scene.cameras.main.setBackgroundColor(phaseData.bgDark);

    // Deactivation flash
    this.flash.setAlpha(0.15).setFillStyle(0xff00ff, 1);
    this.scene.tweens.add({
      targets: this.flash, alpha: 0, duration: 300,
      onComplete: () => this.flash.setFillStyle(CONFIG.COLORS.CYAN, 1),
    });
  }

  get chargePercent() {
    return this.charge / CONFIG.ANTIGRAVITY.MAX_CHARGE;
  }

  get timeRemaining() {
    return this.isActive ? this.timer / CONFIG.ANTIGRAVITY.DURATION : 0;
  }

  reset() {
    this.charge = 0;
    this.isActive = false;
    this.timer = 0;
    this.activations = 0;
    this.canActivate = true;
    this.cooldown = 0;
  }

  destroy() {
    this.flash.destroy();
  }
}
