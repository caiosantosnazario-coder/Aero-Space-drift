/**
 * HUD — In-game heads-up display with phase indicator.
 * Score, timer, anti-gravity bar, multiplier, phase name.
 */
import { CONFIG } from '../config.js';

export class HUD {
  constructor(scene, phase = 1) {
    this.scene = scene;
    this.phase = phase;
    const W = CONFIG.GAME_WIDTH;
    const phaseData = CONFIG.PHASES[phase];

    // Score
    this.scoreText = scene.add.text(W - 16, 16, '00000000', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px', color: '#00fff0',
    }).setOrigin(1, 0).setDepth(100).setScrollFactor(0);

    // Score label
    this.scoreLabel = scene.add.text(W - 16, 6, 'SCORE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#445566',
    }).setOrigin(1, 0).setDepth(100).setScrollFactor(0);

    // Multiplier
    this.multText = scene.add.text(W - 16, 34, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px', color: '#ffff00',
    }).setOrigin(1, 0).setDepth(100).setScrollFactor(0).setAlpha(0);

    // Timer
    this.timerText = scene.add.text(16, 16, '0:00', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px', color: '#666688',
    }).setOrigin(0, 0).setDepth(100).setScrollFactor(0);

    // ── Phase indicator ──
    this.phaseText = scene.add.text(16, 6, `FASE ${phase}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#445566',
    }).setOrigin(0, 0).setDepth(100).setScrollFactor(0);

    this.phaseNameText = scene.add.text(16, 32, phaseData.name, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '5px', color: '#333355',
    }).setOrigin(0, 0).setDepth(100).setScrollFactor(0);

    // ── Phase progress dots ──
    this.phaseDots = scene.add.graphics().setDepth(100).setScrollFactor(0);
    this._drawPhaseDots(phase);

    // Near miss popup pool
    this.popups = [];

    // ── Anti-Gravity Bar ──
    this.barWidth = 200;
    this.barHeight = 14;
    this.barX = (W - this.barWidth) / 2;
    this.barY = CONFIG.GAME_HEIGHT - 30;

    this.barGfx = scene.add.graphics().setDepth(100).setScrollFactor(0);

    this.barLabel = scene.add.text(W / 2, this.barY - 10, 'ANTI-GRAVITY', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#665599',
    }).setOrigin(0.5, 1).setDepth(100).setScrollFactor(0);

    // Ready flash
    this.readyText = scene.add.text(W / 2, this.barY + this.barHeight / 2, 'READY!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '7px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(101).setScrollFactor(0).setAlpha(0);

    this.readyPulse = null;

    // ── Score threshold indicators ──
    this.thresholdText = scene.add.text(W / 2, 50, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px', color: '#444466',
    }).setOrigin(0.5).setDepth(100).setScrollFactor(0);
  }

  _drawPhaseDots(currentPhase) {
    const g = this.phaseDots;
    g.clear();
    const startX = 16;
    const y = 44;
    for (let i = 1; i <= 3; i++) {
      if (i <= currentPhase) {
        // Filled dot
        const colors = [0x00fff0, 0xff6600, 0x00ff66];
        g.fillStyle(colors[i - 1], 0.9);
        g.fillCircle(startX + (i - 1) * 14, y, 4);
      } else {
        // Empty dot
        g.lineStyle(1, 0x444466, 0.5);
        g.strokeCircle(startX + (i - 1) * 14, y, 4);
      }
    }
  }

  setPhase(phase) {
    this.phase = phase;
    const phaseData = CONFIG.PHASES[phase];
    this.phaseText.setText(`FASE ${phase}`);
    this.phaseNameText.setText(phaseData.name);
    
    // Update colors based on phase
    const colorHex = '#' + phaseData.colors.CYAN.toString(16).padStart(6, '0');
    this.scoreText.setColor(colorHex);
    
    this._drawPhaseDots(phase);
  }

  update(score, timeElapsed, agSystem, currentPhase) {
    // Score
    this.scoreText.setText(String(Math.floor(score)).padStart(8, '0'));

    // Timer
    const secs = Math.floor(timeElapsed);
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    this.timerText.setText(`${mins}:${String(rem).padStart(2, '0')}`);

    // Multiplier
    if (agSystem.isActive) {
      this.multText.setText(`x${CONFIG.ANTIGRAVITY.SCORE_MULT}`);
      this.multText.setAlpha(1);
    } else {
      this.multText.setAlpha(0);
    }

    // Next phase time countdown hint
    const elapsed = timeElapsed;
    if (currentPhase === 1) {
      const remaining = Math.ceil(CONFIG.PHASES.PHASE_2_TIME - elapsed);
      if (remaining > 0 && remaining <= 10) {
        this.thresholdText.setText(`FASE 2 EM ${remaining}s`);
        this.thresholdText.setAlpha(0.8);
      } else {
        this.thresholdText.setAlpha(0);
      }
    } else if (currentPhase === 2) {
      const remaining = Math.ceil(CONFIG.PHASES.PHASE_3_TIME - elapsed);
      if (remaining > 0 && remaining <= 10) {
        this.thresholdText.setText(`FASE 3 EM ${remaining}s`);
        this.thresholdText.setAlpha(0.8);
      } else {
        this.thresholdText.setAlpha(0);
      }
    } else {
      this.thresholdText.setAlpha(0);
    }

    // Anti-Gravity Bar
    this._drawBar(agSystem);
  }

  _drawBar(ag) {
    const g = this.barGfx;
    g.clear();
    const x = this.barX, y = this.barY;
    const w = this.barWidth, h = this.barHeight;
    const phaseData = CONFIG.PHASES[this.phase];

    // Background
    g.fillStyle(0x111122, 0.8);
    g.fillRoundedRect(x - 2, y - 2, w + 4, h + 4, 4);

    // Border
    const borderColor = ag.isActive ? 0xffff00 : phaseData.colors.PURPLE;
    g.lineStyle(1.5, borderColor, 0.7);
    g.strokeRoundedRect(x - 2, y - 2, w + 4, h + 4, 4);

    if (ag.isActive) {
      const pct = ag.timeRemaining;
      const fillW = w * pct;
      g.fillStyle(0xffff00, 0.8);
      g.fillRoundedRect(x, y, fillW, h, 2);
      g.fillStyle(0xffff00, 0.2);
      g.fillRoundedRect(x - 4, y - 4, fillW + 8, h + 8, 6);
      this.barLabel.setColor('#ffff00').setText('◆ ACTIVE ◆');
      this.readyText.setAlpha(0);
    } else {
      const pct = ag.chargePercent;
      const fillW = w * pct;

      // Gradient fill (phase purple → phase cyan)
      const steps = Math.max(1, Math.floor(fillW / 4));
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const col = Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.IntegerToColor(phaseData.colors.PURPLE),
          Phaser.Display.Color.IntegerToColor(phaseData.colors.CYAN),
          100, t * 100
        );
        g.fillStyle(Phaser.Display.Color.GetColor(col.r, col.g, col.b), 0.9);
        g.fillRect(x + i * 4, y, 4, h);
      }

      this.barLabel.setColor('#665599').setText('ANTI-GRAVITY');

      if (pct >= 1) {
        if (!this.readyPulse) {
          this.readyText.setAlpha(1);
          this.readyPulse = this.scene.tweens.add({
            targets: this.readyText, alpha: 0.3, duration: 400,
            yoyo: true, repeat: -1,
          });
        }
        g.lineStyle(2, phaseData.colors.CYAN, 0.6);
        g.strokeRoundedRect(x - 4, y - 4, w + 8, h + 8, 6);
      } else {
        if (this.readyPulse) {
          this.readyPulse.stop();
          this.readyPulse = null;
          this.readyText.setAlpha(0);
        }
      }
    }
  }

  showNearMiss(x, y) {
    const pop = this.scene.add.text(x, y - 20, `+${CONFIG.SCORE.NEAR_MISS_BONUS}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px', color: '#ffff00',
    }).setOrigin(0.5).setDepth(100);
    this.scene.tweens.add({
      targets: pop, y: y - 60, alpha: 0, duration: 800,
      ease: 'Cubic.easeOut',
      onComplete: () => pop.destroy(),
    });
  }

  destroy() {
    this.scoreText.destroy();
    this.scoreLabel.destroy();
    this.timerText.destroy();
    this.multText.destroy();
    this.barGfx.destroy();
    this.barLabel.destroy();
    this.readyText.destroy();
    this.phaseText.destroy();
    this.phaseNameText.destroy();
    this.phaseDots.destroy();
    this.thresholdText.destroy();
  }
}
