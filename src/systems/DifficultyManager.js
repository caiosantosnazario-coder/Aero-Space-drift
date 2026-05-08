/**
 * DifficultyManager — Progressive difficulty curve.
 */
import { CONFIG } from '../config.js';

export class DifficultyManager {
  constructor() {
    this.elapsed = 0;
    this.speedMult = 1;
    this.level = 0;
  }

  update(delta) {
    this.elapsed += delta / 1000;
    const d = CONFIG.DIFFICULTY;
    this.speedMult = Math.min(
      d.MAX_SPEED_MULT,
      1 + this.elapsed * d.SPEED_MULT_PER_SEC
    );
    // Difficulty tiers
    if (this.elapsed < 15) this.level = 0;
    else if (this.elapsed < 30) this.level = 1;
    else if (this.elapsed < 60) this.level = 2;
    else if (this.elapsed < 90) this.level = 3;
    else this.level = 4;
  }

  reset() {
    this.elapsed = 0;
    this.speedMult = 1;
    this.level = 0;
  }
}
