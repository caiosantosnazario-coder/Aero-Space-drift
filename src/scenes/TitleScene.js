/**
 * TitleScene — Animated synthwave title screen with phase preview.
 */
import { CONFIG } from '../config.js';
import { SoundEffects } from '../systems/SoundEffects.js';

export class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }

  create() {
    const W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;

    // ── Parallax stars ──
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      const s = this.add.image(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        'star'
      ).setAlpha(Math.random() * 0.6 + 0.2)
       .setScale(Math.random() * 0.8 + 0.3);
      s._speed = Math.random() * 1.5 + 0.3;
      this.stars.push(s);
    }

    // ── Synthwave grid ──
    this.gridY = 0;
    this.gridGfx = this.add.graphics();

    // ── Title text ──
    this.add.text(W / 2, H * 0.12, 'RETRO SPACE', {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: '32px', fontStyle: 'bold',
      color: '#00fff0', stroke: '#005566', strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(W / 2, H * 0.18, 'D R I F T', {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: '42px', fontStyle: 'bold',
      color: '#ff00ff', stroke: '#550055', strokeThickness: 3,
    }).setOrigin(0.5);

    const sub = this.add.text(W / 2, H * 0.25, 'ANTI-GRAVITY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px', color: '#ffff00',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: sub, alpha: 0.3, duration: 800,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // ── 3 Phase Ships Showcase ──
    const phaseY = H * 0.45;
    const shipKeys = ['ship_falcon', 'ship_hellfire', 'ship_stealth'];
    const phaseNames = ['FASE 1', 'FASE 2', 'FASE 3'];
    const phaseColors = ['#00fff0', '#ff6600', '#00ff66'];
    const bandNames = ['KISS', 'AC/DC', 'AC/DC'];
    const songNames = ["I Was Made for Lovin' You", 'Highway to Hell', 'Back in Black'];

    shipKeys.forEach((key, i) => {
      const x = W * (0.2 + i * 0.3);
      const ship = this.add.image(x, phaseY, key).setScale(1.2);
      this.tweens.add({
        targets: ship, y: phaseY - 8, duration: 1200 + i * 200,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.add.text(x, phaseY + 42, phaseNames[i], {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '7px', color: phaseColors[i],
      }).setOrigin(0.5);
      this.add.text(x, phaseY + 55, bandNames[i], {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '5px', color: '#888899',
      }).setOrigin(0.5);
    });

    // ── Glow behind ships ──
    const glow = this.add.image(W / 2, phaseY, 'glow')
      .setScale(5, 2).setTint(0x00fff0).setAlpha(0.15);
    this.tweens.add({
      targets: glow, alpha: 0.08, scaleX: 5.5,
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // ── High Score ──
    const hi = localStorage.getItem('rsd_highscore') || 0;
    if (hi > 0) {
      this.add.text(W / 2, H * 0.65, `HIGH SCORE: ${String(hi).padStart(8, '0')}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px', color: '#ff6600',
      }).setOrigin(0.5);
    }

    // ── Phase info ──
    this.add.text(W / 2, H * 0.72, '3 FASES  •  3 MÚSICAS  •  3 NAVES', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#555577',
    }).setOrigin(0.5);

    // ── Start prompt ──
    const start = this.add.text(W / 2, H * 0.80, 'PRESS SPACE OR TAP TO START', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px', color: '#ffffff',
    }).setOrigin(0.5);
    this.tweens.add({
      targets: start, alpha: 0.2, duration: 600,
      yoyo: true, repeat: -1,
    });

    // ── Controls ──
    this.add.text(W / 2, H * 0.88, '← → MOVE    SPACE ANTI-GRAVITY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#666688',
    }).setOrigin(0.5);

    // ── Input ──
    this.input.keyboard.once('keydown-SPACE', () => this._start());
    this.input.once('pointerdown', () => this._start());
  }

  _start() {
    SoundEffects.init();
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { phase: 1 });
    });
  }

  update() {
    this.stars.forEach(s => {
      s.y += s._speed;
      if (s.y > CONFIG.GAME_HEIGHT + 5) {
        s.y = -5;
        s.x = Phaser.Math.Between(0, CONFIG.GAME_WIDTH);
      }
    });
    this._drawGrid();
  }

  _drawGrid() {
    const g = this.gridGfx;
    g.clear();
    const W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
    const gridTop = H * 0.62;
    this.gridY = (this.gridY + 0.5) % 30;

    g.lineStyle(1, CONFIG.COLORS.GRID, 0.3);
    for (let i = 0; i < 15; i++) {
      const t = (i * 30 + this.gridY) / (15 * 30);
      const y = gridTop + (H - gridTop) * t * t;
      g.lineBetween(0, y, W, y);
    }
    const vanishX = W / 2;
    for (let i = -8; i <= 8; i++) {
      const bx = vanishX + i * 60;
      g.lineBetween(vanishX, gridTop, bx, H);
    }
  }
}
