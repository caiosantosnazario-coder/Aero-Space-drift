/**
 * EnemySystem — Rival ships that attack the player.
 * Enemies spawn from the vanishing point, move toward the player,
 * and fire bullets back at the player's position.
 */
import { CONFIG } from '../config.js';
import { SoundEffects } from './SoundEffects.js';

export class EnemySystem {
  constructor(scene, enemyGroup, enemyBulletGroup) {
    this.scene = scene;
    this.enemyGroup = enemyGroup;
    this.enemyBulletGroup = enemyBulletGroup;
    this.lastSpawn = 0;
    this.gameTime = 0;
    this.phase = 1;
  }

  setPhase(phase) {
    this.phase = phase;
  }

  update(time, delta, difficulty, playerX, playerY) {
    this.gameTime += delta / 1000;

    // Spawn enemies after initial delay
    if (this.gameTime > CONFIG.ENEMY.FIRST_SPAWN_TIME) {
      const interval = CONFIG.ENEMY.SPAWN_INTERVAL / Math.min(difficulty.speedMult, 2);
      if (time - this.lastSpawn > interval) {
        this.lastSpawn = time;
        this._spawnEnemy(difficulty);
      }
    }

    // Update enemies: 3D scaling + shooting
    const cy = CONFIG.VANISH_Y;
    const H = CONFIG.GAME_HEIGHT;

    this.enemyGroup.getChildren().forEach(e => {
      if (!e.active) return;

      // 3D perspective scaling
      const t = Math.max(0.05, (e.y - cy) / (H - cy + 100));
      e.setScale(t * 1.5);

      // Enemy shoots at player
      if (e._fireTimer !== undefined) {
        e._fireTimer -= delta;
        if (e._fireTimer <= 0 && e.y > cy + 50 && e.y < H - 100) {
          e._fireTimer = e._fireRate || 1500;
          this._enemyFire(e, playerX, playerY);
        }
      }

      // Cleanup off-screen
      if (e.y > H + 100 || e.x < -200 || e.x > CONFIG.GAME_WIDTH + 200) {
        this.enemyGroup.killAndHide(e);
        e.body.enable = false;
      }
    });

    // Update enemy bullets
    this.enemyBulletGroup.getChildren().forEach(b => {
      if (!b.active) return;
      // Scale up as bullets travel toward player (perspective)
      const t = Math.max(0.3, (b.y - cy) / (H - cy));
      b.setScale(t * 1.2);

      if (b.y > H + 30 || b.y < -30 || b.x < -30 || b.x > CONFIG.GAME_WIDTH + 30) {
        this.enemyBulletGroup.killAndHide(b);
        b.body.enable = false;
      }
    });
  }

  _spawnEnemy(diff) {
    const W = CONFIG.GAME_WIDTH;
    const H = CONFIG.GAME_HEIGHT;
    const cx = W / 2;
    const cy = H * 0.35;

    const sizeIdx = Phaser.Math.Between(0, CONFIG.ENEMY.SIZES.length - 1);
    const size = CONFIG.ENEMY.SIZES[sizeIdx];
    const key = `${size.key}_${this.phase}`;

    const targetX = cx + Phaser.Math.Between(-W * 0.8, W * 0.8);
    const targetY = H + 100;
    const angle = Phaser.Math.Angle.Between(cx, cy, targetX, targetY);
    const speed = Phaser.Math.Between(CONFIG.ENEMY.BASE_SPEED, CONFIG.ENEMY.MAX_SPEED) * diff.speedMult;

    const enemy = this.enemyGroup.create(cx, cy, key);
    if (!enemy) return;

    enemy.setCircle(size.radius * 0.7);
    enemy.body.setOffset(
      (enemy.width - size.radius * 1.4) / 2,
      (enemy.height - size.radius * 1.4) / 2
    );
    this.scene.physics.velocityFromRotation(angle, speed, enemy.body.velocity);
    enemy.setDepth(6);
    enemy.setScale(0.01);
    enemy._hp = size.hp;
    enemy._maxHp = size.hp;
    enemy._radius = size.radius;
    enemy._fireTimer = Phaser.Math.Between(500, size.fireRate);
    enemy._fireRate = size.fireRate;
    enemy._isEnemy = true;
  }

  _enemyFire(enemy, playerX, playerY) {
    const bullet = this.enemyBulletGroup.create(enemy.x, enemy.y, 'enemy_bullet');
    if (!bullet) return;

    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, playerX, playerY);
    const speed = CONFIG.ENEMY.BULLET_SPEED;
    this.scene.physics.velocityFromRotation(angle, speed, bullet.body.velocity);

    bullet.setDepth(7);
    bullet.setScale(0.3);
    bullet.setBlendMode('ADD');
    bullet.setCircle(5);

    SoundEffects.playEnemyShoot();
  }

  clearAll() {
    this.enemyGroup.getChildren().forEach(e => {
      if (e.active) {
        this.enemyGroup.killAndHide(e);
        e.body.enable = false;
      }
    });
    this.enemyBulletGroup.getChildren().forEach(b => {
      if (b.active) {
        this.enemyBulletGroup.killAndHide(b);
        b.body.enable = false;
      }
    });
  }

  reset() {
    this.lastSpawn = 0;
    this.gameTime = 0;
  }
}
