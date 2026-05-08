/**
 * GameScene — Main gameplay loop with 3-phase system.
 * Automatic phase transitions with hyperspace animation.
 */
import { CONFIG } from '../config.js';
import { Ship } from '../entities/Ship.js';
import { ParallaxBackground } from '../systems/ParallaxBackground.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { DifficultyManager } from '../systems/DifficultyManager.js';
import { AntiGravitySystem } from '../systems/AntiGravitySystem.js';
import { HUD } from '../ui/HUD.js';

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.startPhase = data?.phase || 1;
  }

  create() {
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // ── State ──
    this.score = 0;
    this.timeElapsed = 0;
    this.nearMissCount = 0;
    this.isGameOver = false;
    this.nearMissTracked = new Set();
    this.currentPhase = this.startPhase;
    this.isTransitioning = false;
    this.transitionTimer = 0;

    // Apply phase colors
    const phaseData = CONFIG.PHASES[this.currentPhase];
    this.cameras.main.setBackgroundColor(phaseData.bgDark);

    // ── Background ──
    this.parallax = new ParallaxBackground(this, this.currentPhase);

    // ── Physics groups ──
    this.asteroids = this.physics.add.group({ runChildUpdate: false });
    this.planets = this.physics.add.group({ runChildUpdate: false, immovable: true });

    // ── Ship ──
    this.ship = new Ship(this, phaseData.shipKey);

    // ── Systems ──
    this.difficulty = new DifficultyManager();
    this.spawner = new SpawnSystem(this, this.asteroids, this.planets, this.currentPhase);
    this.antiGravity = new AntiGravitySystem(this, this.ship);

    // ── HUD ──
    this.hud = new HUD(this, this.currentPhase);

    // ── Input ──
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // ── Touch input ──
    this.touchInput = { left: false, right: false, ag: false };
    this.input.on('pointerdown', (ptr) => this._onPointerDown(ptr));
    this.input.on('pointerup', (ptr) => this._onPointerUp(ptr));
    this.input.on('pointermove', (ptr) => {
      if (ptr.isDown) this._onPointerDown(ptr);
    });

    // ── Collisions ──
    this.physics.add.overlap(
      this.ship.sprite, this.asteroids,
      this._onHitObstacle, null, this
    );
    this.physics.add.overlap(
      this.ship.sprite, this.planets,
      this._onHitObstacle, null, this
    );

    // ── Explosion particles ──
    this.explosionEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 100, max: 350 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      lifespan: 800,
      alpha: { start: 1, end: 0 },
      tint: [phaseData.colors.CYAN, 0xff00ff, 0xff6600, 0xffff00],
      blendMode: 'ADD',
      frequency: -1,
      quantity: 30,
    }).setDepth(20);

    // ── Near-miss spark emitter ──
    this.nearMissEmitter = this.add.particles(0, 0, 'particle', {
      speed: { min: 40, max: 120 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: 300,
      alpha: { start: 0.9, end: 0 },
      tint: 0xffff00,
      blendMode: 'ADD',
      frequency: -1,
      quantity: 8,
    }).setDepth(15);

    // ── Phase transition overlay ──
    this.transOverlay = this.add.rectangle(
      CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT / 2,
      CONFIG.GAME_WIDTH, CONFIG.GAME_HEIGHT,
      0xffffff, 0
    ).setDepth(200);

    // Phase announcement text (hidden)
    this.phaseAnnounce = this.add.text(CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT * 0.35, '', {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: '28px', fontStyle: 'bold',
      color: '#ffffff', stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(210).setAlpha(0);

    this.phaseSubtitle = this.add.text(CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT * 0.42, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px', color: '#ffff00',
    }).setOrigin(0.5).setDepth(210).setAlpha(0);

    this.phaseBand = this.add.text(CONFIG.GAME_WIDTH / 2, CONFIG.GAME_HEIGHT * 0.48, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#888899',
    }).setOrigin(0.5).setDepth(210).setAlpha(0);
  }

  update(time, delta) {
    if (this.isGameOver) return;

    const dt = delta / 1000;
    this.timeElapsed += dt;

    // ── Handle phase transition animation ──
    if (this.isTransitioning) {
      this.transitionTimer -= delta;
      this.parallax.update(delta, 5); // Fast stars during transition
      if (this.transitionTimer <= 0) {
        this._completePhaseTransition();
      }
      return;
    }

    // ── Input ──
    const inputH = this._getHorizontalInput();
    const inputV = this._getVerticalInput();

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || this.touchInput.ag) {
      this.antiGravity.tryActivate();
      this.touchInput.ag = false;
    }

    // ── Update systems ──
    this.difficulty.update(delta);
    this.ship.update(delta, inputH, inputV);
    this.antiGravity.update(delta);
    this.spawner.update(time, delta, this.difficulty);
    this.parallax.update(delta, this.difficulty.speedMult);

    // ── Planet gravity ──
    this._applyPlanetGravity();

    // ── Pseudo-3D Perspective Scaling ──
    const cy = CONFIG.VANISH_Y;
    this.asteroids.getChildren().forEach(ast => {
      if (ast.active) {
        const t = Math.max(0.01, (ast.y - cy) / (CONFIG.GAME_HEIGHT - cy + 100));
        ast.setScale(t * 1.5);
      }
    });
    this.planets.getChildren().forEach(planet => {
      if (planet.active) {
        const t = Math.max(0.01, (planet.y - cy) / (CONFIG.GAME_HEIGHT - cy + 400));
        planet.setScale((planet._baseScale || 1) * t * 1.5);
      }
    });

    // ── Near-miss detection ──
    this._checkNearMisses();

    // ── Score ──
    const mult = this.antiGravity.isActive ? CONFIG.ANTIGRAVITY.SCORE_MULT : 1;
    this.score += CONFIG.SCORE.PER_SECOND * mult * dt;

    // ── HUD ──
    this.hud.update(this.score, this.timeElapsed, this.antiGravity, this.currentPhase);

    // ── Check phase transitions ──
    this._checkPhaseTransition();
  }

  /* ═══════════════════════════════════════════════
   *  PHASE TRANSITION SYSTEM
   * ═══════════════════════════════════════════════ */

  _checkPhaseTransition() {
    const elapsed = this.timeElapsed;
    const phases = CONFIG.PHASES;

    if (this.currentPhase === 1 && elapsed >= phases.PHASE_2_TIME) {
      this._startPhaseTransition(2);
    } else if (this.currentPhase === 2 && elapsed >= phases.PHASE_3_TIME) {
      this._startPhaseTransition(3);
    }
  }

  _startPhaseTransition(newPhase) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.transitionTimer = CONFIG.PHASES.TRANSITION_DURATION;
    this.nextPhase = newPhase;

    const phaseData = CONFIG.PHASES[newPhase];

    // ── Hyperspace effect ──
    // Flash white
    this.transOverlay.setAlpha(0);
    this.tweens.add({
      targets: this.transOverlay,
      alpha: 0.6,
      duration: 400,
      yoyo: true,
      hold: 200,
    });

    // Stars go to hyperdrive mode
    this.parallax.setHyperspaceMode(true);

    // Camera shake
    this.cameras.main.shake(500, 0.02);

    // Show phase announcement
    this.phaseAnnounce.setText(phaseData.name).setAlpha(0);
    this.phaseSubtitle.setText(`♪ ${phaseData.subtitle}`).setAlpha(0);
    this.phaseBand.setText(`by ${phaseData.band}`).setAlpha(0);

    this.tweens.add({
      targets: [this.phaseAnnounce, this.phaseSubtitle, this.phaseBand],
      alpha: 1, duration: 500, delay: 600,
    });

    // Clear all existing obstacles
    this.asteroids.getChildren().forEach(a => {
      if (a.active) {
        this.asteroids.killAndHide(a);
        a.body.enable = false;
      }
    });
    this.planets.getChildren().forEach(p => {
      if (p.active) {
        this.planets.killAndHide(p);
        p.body.enable = false;
      }
    });

    // Make ship invulnerable during transition
    this.ship.sprite.body.enable = false;
  }

  _completePhaseTransition() {
    this.isTransitioning = false;
    this.currentPhase = this.nextPhase;
    const phaseData = CONFIG.PHASES[this.currentPhase];

    // ── Change music ──
    if (window.playTrack) window.playTrack(phaseData.youtubeId);

    // ── Update background ──
    this.cameras.main.setBackgroundColor(phaseData.bgDark);
    this.parallax.setPhase(this.currentPhase);
    this.parallax.setHyperspaceMode(false);

    // ── Change ship ──
    this.ship.setPhaseShip(phaseData.shipKey, phaseData.shipAGKey, phaseData.colors);

    // ── Update spawner ──
    this.spawner.setPhase(this.currentPhase);

    // ── Update HUD colors ──
    this.hud.setPhase(this.currentPhase);

    // ── Re-enable ship ──
    this.ship.sprite.body.enable = true;

    // ── Fade out announcement ──
    this.tweens.add({
      targets: [this.phaseAnnounce, this.phaseSubtitle, this.phaseBand],
      alpha: 0, duration: 800, delay: 500,
    });

    // ── Flash effect for new phase ──
    const flashColor = phaseData.colors.CYAN;
    this.cameras.main.flash(500, 
      (flashColor >> 16) & 0xff,
      (flashColor >> 8) & 0xff,
      flashColor & 0xff
    );

    // Reset difficulty slightly for new phase
    this.difficulty.speedMult = Math.max(1, this.difficulty.speedMult * 0.7);
  }

  /* ═══════════════════════════════════════════════
   *  INPUT
   * ═══════════════════════════════════════════════ */

  _getHorizontalInput() {
    let h = 0;
    if (this.cursors.left.isDown || this.wasd.left.isDown || this.touchInput.left) h -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown || this.touchInput.right) h += 1;
    return h;
  }

  _getVerticalInput() {
    let v = 0;
    if (this.cursors.up.isDown || this.wasd.up.isDown) v -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) v += 1;
    return v;
  }

  _onPointerDown(ptr) {
    const W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
    if (ptr.y > H * 0.85) { this.touchInput.ag = true; return; }
    if (ptr.x < W * 0.4) { this.touchInput.left = true; this.touchInput.right = false; }
    else if (ptr.x > W * 0.6) { this.touchInput.right = true; this.touchInput.left = false; }
  }

  _onPointerUp() {
    this.touchInput.left = false;
    this.touchInput.right = false;
  }

  /* ═══════════════════════════════════════════════
   *  GAMEPLAY SYSTEMS
   * ═══════════════════════════════════════════════ */

  _applyPlanetGravity() {
    if (this.antiGravity.isActive) return;
    this.planets.getChildren().forEach(planet => {
      if (!planet.active) return;
      const dx = planet.x - this.ship.x;
      const dy = planet.y - this.ship.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const gravR = planet._gravRadius || 300;
      if (dist < gravR && dist > 10) {
        const force = (planet._gravStrength || 100) / (dist * 0.5);
        this.ship.sprite.body.velocity.x += (dx / dist) * force;
        this.ship.sprite.body.velocity.y += (dy / dist) * force;
      }
    });
  }

  _checkNearMisses() {
    const nmDist = CONFIG.ANTIGRAVITY.NEAR_MISS_DIST;
    this.asteroids.getChildren().forEach(ast => {
      if (!ast.active) return;
      const id = ast._id || (ast._id = Phaser.Math.RND.uuid());
      if (this.nearMissTracked.has(id)) return;
      const dx = ast.x - this.ship.x;
      const dy = ast.y - this.ship.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const astR = ast._radius || 20;
      const shipR = CONFIG.SHIP.WIDTH * 0.3;
      const gap = dist - astR - shipR;
      if (gap > 0 && gap < nmDist && ast.y > this.ship.y - 30) {
        this.nearMissTracked.add(id);
        this.nearMissCount++;
        this.score += CONFIG.SCORE.NEAR_MISS_BONUS;
        this.antiGravity.addNearMissCharge();
        this.hud.showNearMiss(this.ship.x, this.ship.y);
        this.nearMissEmitter.emitParticleAt(
          (ast.x + this.ship.x) / 2,
          (ast.y + this.ship.y) / 2
        );
      }
    });
  }

  /* ═══════════════════════════════════════════════
   *  COLLISION & GAME OVER
   * ═══════════════════════════════════════════════ */

  _onHitObstacle(shipSprite, obstacle) {
    if (this.antiGravity.isActive || this.isGameOver || this.isTransitioning) return;
    this._gameOver();
  }

  _gameOver() {
    this.isGameOver = true;
    this.explosionEmitter.emitParticleAt(this.ship.x, this.ship.y);
    this.ship.sprite.setVisible(false);
    this.ship.sprite.body.enable = false;
    this.cameras.main.shake(400, 0.025);
    this.cameras.main.flash(300, 255, 0, 80);
    this.time.timeScale = 0.3;

    this.time.delayedCall(1200, () => {
      this.time.timeScale = 1;
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this._cleanup();
        this.scene.start('GameOverScene', {
          score: Math.floor(this.score),
          time: this.timeElapsed,
          nearMisses: this.nearMissCount,
          agActivations: this.antiGravity.activations,
          phase: this.currentPhase,
        });
      });
    });
  }

  _cleanup() {
    this.ship.destroy();
    this.parallax.destroy();
    this.antiGravity.destroy();
    this.hud.destroy();
    this.explosionEmitter.destroy();
    this.nearMissEmitter.destroy();
  }
}
