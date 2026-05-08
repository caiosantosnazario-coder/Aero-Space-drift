/**
 * ParallaxBackground — 3D Radial Starfield with phase-based colors
 * and Millennium Falcon Hyperdrive effect.
 */
import { CONFIG } from '../config.js';

export class ParallaxBackground {
  constructor(scene, phase = 1) {
    this.scene = scene;
    this.phase = phase;
    const W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
    this.stars = [];
    this.cx = W / 2;
    this.cy = H * 0.35;

    for (let i = 0; i < 200; i++) {
      const s = scene.add.image(this.cx, this.cy, 'star').setDepth(0);
      this._resetStar(s);
      s.z3d = Phaser.Math.Between(1, 1000);
      this.stars.push(s);
    }
    
    this.speed = 2;
    this.isAG = false;
    this.isHyperspace = false;

    // Nebula clouds (phase-colored)
    this.nebulae = [];
    this._createNebulae();
  }

  _createNebulae() {
    const phaseData = CONFIG.PHASES[this.phase];
    // Destroy existing nebulae
    this.nebulae.forEach(n => n.destroy());
    this.nebulae = [];

    for (let i = 0; i < 6; i++) {
      const n = this.scene.add.image(
        Phaser.Math.Between(0, CONFIG.GAME_WIDTH),
        Phaser.Math.Between(0, CONFIG.GAME_HEIGHT),
        'glow'
      ).setDepth(0)
       .setScale(Phaser.Math.FloatBetween(3, 8))
       .setAlpha(Phaser.Math.FloatBetween(0.03, 0.08))
       .setTint(i % 2 === 0 ? phaseData.nebulaA : phaseData.nebulaB)
       .setBlendMode('ADD');
      this.nebulae.push(n);
    }
  }
  
  _resetStar(s) {
    const phaseData = CONFIG.PHASES[this.phase];
    s.angle3D = Phaser.Math.FloatBetween(0, Math.PI * 2);
    s.dist3D = Phaser.Math.FloatBetween(50, 800);
    s.z3d = 1000;
    s.setAlpha(0);
    s.setTint(Math.random() > 0.85 ? (phaseData?.starTint || 0xaaaaff) : 0xffffff);
  }

  update(delta, speedMult = 1) {
    const dt = delta / 1000;
    
    let targetSpeed;
    if (this.isHyperspace) {
      targetSpeed = 35; // Maximum hyperspace speed
    } else if (this.isAG) {
      targetSpeed = 25;
    } else {
      targetSpeed = 3 * speedMult;
    }
    this.speed = Phaser.Math.Linear(this.speed, targetSpeed, 0.05);
    
    this.stars.forEach(s => {
      s.z3d -= this.speed * 60 * dt;
      if (s.z3d <= 0) this._resetStar(s);
      
      const perspective = 1000 / Math.max(1, s.z3d);
      s.x = this.cx + Math.cos(s.angle3D) * s.dist3D * perspective;
      s.y = this.cy + Math.sin(s.angle3D) * s.dist3D * perspective;
      
      const scale = perspective * 0.4;
      
      if (this.isAG || this.isHyperspace) {
        s.rotation = s.angle3D;
        const stretch = this.isHyperspace ? 30 : 20;
        s.setScale(scale * stretch, scale * 0.5);
      } else {
        s.rotation = 0;
        s.setScale(scale);
      }
      
      s.setAlpha(Math.min(1, perspective * 1.5));
    });

    // Subtle nebula drift
    this.nebulae.forEach((n, i) => {
      n.y += (0.1 + i * 0.05) * dt * 60;
      if (n.y > CONFIG.GAME_HEIGHT + 100) {
        n.y = -100;
        n.x = Phaser.Math.Between(0, CONFIG.GAME_WIDTH);
      }
    });
  }

  setAntiGravityMode(active) {
    this.isAG = active;
    const phaseData = CONFIG.PHASES[this.phase];
    this.stars.forEach(s => {
      if (active) {
        s.setTint(Math.random() > 0.5 ? 0xffff00 : phaseData.colors.CYAN);
      } else {
        s.setTint(Math.random() > 0.85 ? phaseData.starTint : 0xffffff);
      }
    });
  }

  setHyperspaceMode(active) {
    this.isHyperspace = active;
    if (active) {
      // All stars turn white/blue for hyperspace
      this.stars.forEach(s => {
        s.setTint(Math.random() > 0.4 ? 0xffffff : 0x88aaff);
      });
    }
  }

  setPhase(phase) {
    this.phase = phase;
    const phaseData = CONFIG.PHASES[phase];
    
    // Update star tints
    this.stars.forEach(s => {
      s.setTint(Math.random() > 0.85 ? phaseData.starTint : 0xffffff);
    });

    // Recreate nebulae with new colors
    this._createNebulae();
  }

  destroy() {
    this.stars.forEach(s => s.destroy());
    this.nebulae.forEach(n => n.destroy());
  }
}
