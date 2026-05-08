/**
 * GameOverScene — Shows score, stats, phase reached, and allows restart.
 */
import { CONFIG } from '../config.js';

export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this.finalScore = data.score || 0;
    this.timeSurvived = data.time || 0;
    this.nearMisses = data.nearMisses || 0;
    this.agActivations = data.agActivations || 0;
    this.phaseReached = data.phase || 1;
  }

  create() {
    const W = CONFIG.GAME_WIDTH, H = CONFIG.GAME_HEIGHT;
    const phaseData = CONFIG.PHASES[this.phaseReached];

    // bg stars with phase tint
    for (let i = 0; i < 40; i++) {
      this.add.image(
        Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), 'star'
      ).setAlpha(Math.random() * 0.4 + 0.1)
       .setScale(Math.random() * 0.5 + 0.3)
       .setTint(phaseData.starTint);
    }

    // ── GAME OVER ──
    const goText = this.add.text(W / 2, H * 0.15, 'GAME OVER', {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: '36px', fontStyle: 'bold',
      color: '#ff00ff', stroke: '#550033', strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: goText, alpha: 1, duration: 600, ease: 'Back.easeOut' });

    // ── Phase reached ──
    this.add.text(W / 2, H * 0.24, `FASE ${this.phaseReached}: ${phaseData.name}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#888899',
    }).setOrigin(0.5);

    // Ship that was being used
    const shipImg = this.add.image(W / 2, H * 0.32, phaseData.shipKey).setScale(1.5);
    this.tweens.add({
      targets: shipImg, angle: 5, duration: 2000,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // ── Score ──
    this.add.text(W / 2, H * 0.42, 'SCORE', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#888899',
    }).setOrigin(0.5);

    const scoreText = this.add.text(W / 2, H * 0.48, '00000000', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '20px', color: '#00fff0',
    }).setOrigin(0.5);

    this.tweens.addCounter({
      from: 0, to: this.finalScore, duration: 1500, ease: 'Cubic.easeOut',
      onUpdate: (t) => {
        scoreText.setText(String(Math.floor(t.getValue())).padStart(8, '0'));
      },
    });

    // ── High score check ──
    const prev = parseInt(localStorage.getItem('rsd_highscore') || '0', 10);
    if (this.finalScore > prev) {
      localStorage.setItem('rsd_highscore', this.finalScore);
      this.time.delayedCall(1600, () => {
        const hs = this.add.text(W / 2, H * 0.55, '★ NEW HIGH SCORE ★', {
          fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ffff00',
        }).setOrigin(0.5);
        this.tweens.add({ targets: hs, alpha: 0.3, duration: 400, yoyo: true, repeat: -1 });
      });
    }

    // ── Stats ──
    const statsY = H * 0.62;
    const statsStyle = {
      fontFamily: '"Press Start 2P", monospace', fontSize: '7px', color: '#666688',
    };
    const secs = Math.floor(this.timeSurvived);
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    this.add.text(W / 2, statsY, `TIME: ${mins}:${String(remSecs).padStart(2, '0')}`, statsStyle).setOrigin(0.5);
    this.add.text(W / 2, statsY + 18, `NEAR MISSES: ${this.nearMisses}`, statsStyle).setOrigin(0.5);
    this.add.text(W / 2, statsY + 36, `ANTI-GRAVITY x${this.agActivations}`, statsStyle).setOrigin(0.5);
    this.add.text(W / 2, statsY + 54, `PHASE REACHED: ${this.phaseReached}/3`, statsStyle).setOrigin(0.5);

    // ── Retry ──
    const retry = this.add.text(W / 2, H * 0.82, '[ RETRY ]', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '14px', color: '#00fff0',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    retry.on('pointerover', () => retry.setColor('#ffffff'));
    retry.on('pointerout', () => retry.setColor('#00fff0'));
    retry.on('pointerdown', () => this._goto('GameScene'));
    this.tweens.add({ targets: retry, alpha: 0.5, duration: 500, yoyo: true, repeat: -1 });

    // ── Menu ──
    const menu = this.add.text(W / 2, H * 0.89, '[ MENU ]', {
      fontFamily: '"Press Start 2P", monospace', fontSize: '10px', color: '#ff6600',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menu.on('pointerover', () => menu.setColor('#ffffff'));
    menu.on('pointerout', () => menu.setColor('#ff6600'));
    menu.on('pointerdown', () => this._goto('TitleScene'));

    this.input.keyboard.once('keydown-SPACE', () => this._goto('GameScene'));
    this.input.keyboard.once('keydown-ESC', () => this._goto('TitleScene'));
  }

  _goto(scene) {
    if (scene === 'GameScene') {
      // Restart from Phase 1 with music
      const phase1 = CONFIG.PHASES[1];
      if (window.playTrack) window.playTrack(phase1.youtubeId);
    }
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(scene, scene === 'GameScene' ? { phase: 1 } : {});
    });
  }
}
