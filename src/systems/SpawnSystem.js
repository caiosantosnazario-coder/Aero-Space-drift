/**
 * SpawnSystem — Phase-aware obstacle spawner.
 * Phase 1: Rocky asteroids from vanishing point
 * Phase 2: Burning stars (fiery, glowing)
 * Phase 3: Alien ships (moving in patterns)
 */
import { CONFIG } from '../config.js';

export class SpawnSystem {
  constructor(scene, asteroidGroup, planetGroup, phase = 1) {
    this.scene = scene;
    this.asteroidGroup = asteroidGroup;
    this.planetGroup = planetGroup;
    this.phase = phase;
    this.lastSpawn = 0;
    this.lastPlanet = 0;
    this.spawnInterval = CONFIG.ASTEROID.SPAWN_INTERVAL;
    this.gameTime = 0;
  }

  setPhase(phase) {
    this.phase = phase;
    // Reset spawn timers for new phase
    this.lastSpawn = 0;
    this.lastPlanet = 0;
  }

  update(time, delta, difficulty) {
    this.gameTime += delta / 1000;
    const interval = Math.max(
      CONFIG.DIFFICULTY.MIN_SPAWN_INTERVAL,
      this.spawnInterval / difficulty.speedMult
    );

    if (time - this.lastSpawn > interval) {
      this.lastSpawn = time;
      this._spawnWave(difficulty);
    }

    if (this.gameTime > CONFIG.PLANET.FIRST_SPAWN_TIME &&
        time - this.lastPlanet > CONFIG.PLANET.SPAWN_INTERVAL / Math.min(difficulty.speedMult, 1.5)) {
      this.lastPlanet = time;
      this._spawnPlanet(difficulty);
    }

    this._cleanup();
  }

  _spawnWave(diff) {
    const count = Phaser.Math.Between(1, Math.min(3, 1 + Math.floor(diff.speedMult)));
    for (let i = 0; i < count; i++) {
      switch (this.phase) {
        case 1: this._createAsteroid(diff); break;
        case 2: this._createBurningStar(diff); break;
        case 3: this._createAlienShip(diff); break;
        default: this._createAsteroid(diff);
      }
    }
  }

  /* ═══════════════════════════════════════════════
   *  PHASE 1: ASTEROIDS
   * ═══════════════════════════════════════════════ */
  _createAsteroid(diff) {
    const W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
    const cx = W / 2, cy = H * 0.35;
    
    const sizeIdx = Phaser.Math.Between(0, CONFIG.ASTEROID.SIZES.length - 1);
    const size = CONFIG.ASTEROID.SIZES[sizeIdx];
    const key = `${size.key}_${Phaser.Math.Between(0, 2)}`;

    const targetX = cx + Phaser.Math.Between(-W * 1.5, W * 1.5);
    const targetY = H + 200;
    const angle = Phaser.Math.Angle.Between(cx, cy, targetX, targetY);
    const speed = Phaser.Math.Between(CONFIG.ASTEROID.BASE_SPEED, CONFIG.ASTEROID.MAX_SPEED) * diff.speedMult;
    
    const ast = this.asteroidGroup.create(cx, cy, key);
    if (!ast) return;
    
    ast.setCircle(size.radius * 0.8);
    ast.body.setOffset((ast.width - size.radius * 1.6) / 2, (ast.height - size.radius * 1.6) / 2);
    this.scene.physics.velocityFromRotation(angle, speed, ast.body.velocity);
    ast.setAngularVelocity(Phaser.Math.Between(-120, 120));
    ast.setDepth(5);
    ast._baseRadius = size.radius;
    ast._radius = size.radius;
    ast.setScale(0.01);
  }

  /* ═══════════════════════════════════════════════
   *  PHASE 2: BURNING STARS
   * ═══════════════════════════════════════════════ */
  _createBurningStar(diff) {
    const W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
    const cx = W / 2, cy = H * 0.35;

    const sizes = [
      { key: 'bstar_s', radius: 14 },
      { key: 'bstar_m', radius: 24 },
      { key: 'bstar_l', radius: 36 },
    ];
    const sizeIdx = Phaser.Math.Between(0, sizes.length - 1);
    const size = sizes[sizeIdx];
    const key = `${size.key}_${Phaser.Math.Between(0, 2)}`;

    const targetX = cx + Phaser.Math.Between(-W * 1.2, W * 1.2);
    const targetY = H + 200;
    const angle = Phaser.Math.Angle.Between(cx, cy, targetX, targetY);
    // Stars move a bit slower but are bigger
    const speed = Phaser.Math.Between(CONFIG.ASTEROID.BASE_SPEED * 0.8, CONFIG.ASTEROID.MAX_SPEED * 0.9) * diff.speedMult;
    
    const star = this.asteroidGroup.create(cx, cy, key);
    if (!star) return;
    
    star.setCircle(size.radius * 0.7);
    const texW = star.width, texH = star.height;
    star.body.setOffset((texW - size.radius * 1.4) / 2, (texH - size.radius * 1.4) / 2);
    this.scene.physics.velocityFromRotation(angle, speed, star.body.velocity);
    star.setAngularVelocity(Phaser.Math.Between(-60, 60));
    star.setDepth(5);
    star._baseRadius = size.radius;
    star._radius = size.radius;
    star.setScale(0.01);
    // Pulsing glow effect
    star._pulsePhase = Math.random() * Math.PI * 2;
  }

  /* ═══════════════════════════════════════════════
   *  PHASE 3: ALIEN SHIPS
   * ═══════════════════════════════════════════════ */
  _createAlienShip(diff) {
    const W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
    const cx = W / 2, cy = H * 0.35;

    const sizes = [
      { key: 'alien_s', radius: 12, w: 30 },
      { key: 'alien_m', radius: 18, w: 44 },
      { key: 'alien_l', radius: 25, w: 60 },
    ];
    const sizeIdx = Phaser.Math.Between(0, sizes.length - 1);
    const size = sizes[sizeIdx];
    const variant = Phaser.Math.Between(0, 2);
    const key = `${size.key}_${variant}`;

    const targetX = cx + Phaser.Math.Between(-W * 1.3, W * 1.3);
    const targetY = H + 200;
    const angle = Phaser.Math.Angle.Between(cx, cy, targetX, targetY);
    // Aliens are faster and more aggressive
    const speed = Phaser.Math.Between(CONFIG.ASTEROID.BASE_SPEED, CONFIG.ASTEROID.MAX_SPEED * 1.1) * diff.speedMult;
    
    const alien = this.asteroidGroup.create(cx, cy, key);
    if (!alien) return;
    
    alien.setCircle(size.radius * 0.8);
    alien.body.setOffset((alien.width - size.radius * 1.6) / 2, (alien.height - size.radius * 1.6) / 2);
    this.scene.physics.velocityFromRotation(angle, speed, alien.body.velocity);
    
    // Aliens don't spin like asteroids, they wobble
    alien.setAngularVelocity(Phaser.Math.Between(-30, 30));
    alien.setDepth(5);
    alien._baseRadius = size.radius;
    alien._radius = size.radius;
    alien.setScale(0.01);
    
    // Some aliens have lateral movement (weaving)
    if (Math.random() > 0.5) {
      alien._weave = true;
      alien._weaveAmp = Phaser.Math.Between(30, 80);
      alien._weaveSpeed = Phaser.Math.FloatBetween(2, 5);
      alien._weavePhase = Math.random() * Math.PI * 2;
      alien._baseVx = alien.body.velocity.x;
    }
  }

  /* ═══════════════════════════════════════════════
   *  PLANETS (all phases)
   * ═══════════════════════════════════════════════ */
  _spawnPlanet(diff) {
    const W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
    const cx = W / 2, cy = H * 0.35;
    
    const radiusVal = Phaser.Math.Between(CONFIG.PLANET.MIN_RADIUS, CONFIG.PLANET.MAX_RADIUS);
    const texIdx = Phaser.Math.Between(0, 2);
    
    const targetX = cx + Phaser.Math.Between(-W * 0.8, W * 0.8);
    const targetY = H + 400;
    const angle = Phaser.Math.Angle.Between(cx, cy, targetX, targetY);
    
    const planet = this.planetGroup.create(cx, cy, `planet_${texIdx}`);
    if (!planet) return;
    
    const texSize = 220;
    const baseScale = (radiusVal * 2) / texSize;
    
    planet.setCircle(texSize * 0.4);
    planet.body.setOffset(texSize * 0.1, texSize * 0.1);
    this.scene.physics.velocityFromRotation(angle, CONFIG.PLANET.SPEED * diff.speedMult, planet.body.velocity);
    planet.setDepth(4);
    planet.setImmovable(true);
    planet._gravRadius = radiusVal * CONFIG.PLANET.GRAVITY_RADIUS_MULT;
    planet._gravStrength = CONFIG.PLANET.GRAVITY_STRENGTH;
    planet._baseScale = baseScale;
    planet.setScale(0.01);
  }

  _cleanup() {
    const H = CONFIG.GAME_HEIGHT;
    const W = CONFIG.GAME_WIDTH;
    this.asteroidGroup.getChildren().forEach(a => {
      if (a.active && (a.y > H + 100 || a.x < -200 || a.x > W + 200)) {
        this.asteroidGroup.killAndHide(a);
        a.body.enable = false;
      }
      // Update alien weaving
      if (a.active && a._weave) {
        a._weavePhase += 0.016 * a._weaveSpeed;
        a.body.velocity.x = a._baseVx + Math.sin(a._weavePhase) * a._weaveAmp;
      }
    });
    this.planetGroup.getChildren().forEach(p => {
      if (p.active && p.y > H + 400) {
        this.planetGroup.killAndHide(p);
        p.body.enable = false;
      }
    });
  }

  reset() {
    this.lastSpawn = 0;
    this.lastPlanet = 0;
    this.gameTime = 0;
  }
}
