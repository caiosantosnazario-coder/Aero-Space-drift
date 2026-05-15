/**
 * WeaponSystem — Player shooting system.
 * Fires projectiles toward the vanishing point (into the screen).
 * Bullets scale down as they travel to simulate 3D depth.
 */
import { CONFIG } from '../config.js';
import { SoundEffects } from './SoundEffects.js';

export class WeaponSystem {
  constructor(scene, bulletGroup) {
    this.scene = scene;
    this.bulletGroup = bulletGroup;
    this.lastFireTime = 0;
    this.phase = 1;
  }

  setPhase(phase) {
    this.phase = phase;
  }

  tryFire(time, shipX, shipY) {
    if (time - this.lastFireTime < CONFIG.WEAPON.FIRE_RATE) return;
    this.lastFireTime = time;

    const phaseData = CONFIG.PHASES[this.phase];
    const cx = CONFIG.VANISH_X;
    const cy = CONFIG.VANISH_Y;

    // Fire two bullets (dual cannon effect)
    const offsets = [-12, 12];
    offsets.forEach(ox => {
      const bullet = this.bulletGroup.create(shipX + ox, shipY - 15, 'bullet');
      if (!bullet) return;

      bullet.setDepth(8);
      bullet.setScale(1);
      bullet.setTint(phaseData.colors.BULLET || phaseData.colors.CYAN);
      bullet.setBlendMode('ADD');

      // Shoot toward vanishing point
      const angle = Phaser.Math.Angle.Between(shipX + ox, shipY - 15, cx, cy);
      const speed = CONFIG.WEAPON.BULLET_SPEED;
      this.scene.physics.velocityFromRotation(angle, speed, bullet.body.velocity);

      bullet._startY = shipY;
      bullet._startX = shipX + ox;
      bullet.setCircle(CONFIG.WEAPON.BULLET_SIZE);
    });

    SoundEffects.playShoot();
  }

  update() {
    const cy = CONFIG.VANISH_Y;
    const H = CONFIG.GAME_HEIGHT;

    this.bulletGroup.getChildren().forEach(b => {
      if (!b.active) return;

      // Scale down as bullet approaches vanishing point (3D perspective)
      const totalDist = H - CONFIG.SHIP.START_Y_OFFSET - cy;
      const traveled = Math.max(0, b._startY - b.y);
      const t = Math.max(0.05, 1 - (traveled / totalDist));
      b.setScale(t);
      b.setAlpha(t);

      // Remove off-screen or at vanishing point
      if (b.y < cy - 20 || b.x < -50 || b.x > CONFIG.GAME_WIDTH + 50 || b.y > H + 50) {
        this.bulletGroup.killAndHide(b);
        b.body.enable = false;
      }
    });
  }

  destroy() {
    // cleanup handled by group
  }
}
