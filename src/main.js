/**
 * Retro Space Drift: Anti-Gravity — Entry Point
 */
import { CONFIG } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { GameScene } from './scenes/GameScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-container',
  width: CONFIG.GAME_WIDTH,
  height: CONFIG.GAME_HEIGHT,
  backgroundColor: CONFIG.COLORS.BG_DARK,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false, gravity: { y: 0 } },
  },
  scene: [BootScene, TitleScene, GameScene, GameOverScene],
  render: { antialias: true, pixelArt: false },
  input: { activePointers: 2 },
});
