/**
 * BootScene — Procedurally generates all game textures for all 3 phases.
 * Ships: Millennium Falcon (Phase 1), Hellfire Racer (Phase 2), Stealth Fighter (Phase 3)
 * Obstacles: Asteroids, Burning Stars, Alien Ships
 */
import { CONFIG } from '../config.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    // Phase 1 ships
    this._generateFalconShip('ship_falcon', CONFIG.PHASES[1].colors);
    this._generateFalconShipAG('ship_falcon_ag', CONFIG.PHASES[1].colors);
    // Phase 2 ships
    this._generateHellfireShip('ship_hellfire', CONFIG.PHASES[2].colors);
    this._generateHellfireShipAG('ship_hellfire_ag', CONFIG.PHASES[2].colors);
    // Phase 3 ships
    this._generateStealthShip('ship_stealth', CONFIG.PHASES[3].colors);
    this._generateStealthShipAG('ship_stealth_ag', CONFIG.PHASES[3].colors);

    // Obstacles
    this._generateAsteroidTextures();
    this._generateBurningStarTextures();
    this._generateAlienShipTextures();

    // Planet textures
    this._generatePlanetTextures();

    // Common particles
    this._generateParticleTexture();
    this._generateStarTexture();
    this._generateGlowTexture();

    this.scene.start('TitleScene');
  }

  /* ═══════════════════════════════════════════════
   *  SHIP TEXTURES
   * ═══════════════════════════════════════════════ */

  // ── Phase 1: Millennium Falcon ──
  _drawFalcon(g, W, H, oX, oY, colors) {
    const bodyColor = colors.SHIP_BODY;
    const outlineColor = colors.CYAN;
    const thrusterColor = colors.THRUSTER;

    // Main disc body
    g.fillStyle(bodyColor);
    g.fillEllipse(oX + W / 2, oY + H * 0.45, W * 0.95, H * 0.55);

    // Top panel detail
    g.fillStyle(0x667788);
    g.fillEllipse(oX + W / 2, oY + H * 0.35, W * 0.6, H * 0.25);

    // Mandible prongs
    g.fillStyle(bodyColor);
    g.beginPath();
    g.moveTo(oX + W * 0.15, oY + H * 0.6);
    g.lineTo(oX + W * 0.08, oY + H * 0.85);
    g.lineTo(oX + W * 0.22, oY + H * 0.85);
    g.lineTo(oX + W * 0.28, oY + H * 0.6);
    g.closePath(); g.fillPath();
    g.beginPath();
    g.moveTo(oX + W * 0.72, oY + H * 0.6);
    g.lineTo(oX + W * 0.78, oY + H * 0.85);
    g.lineTo(oX + W * 0.92, oY + H * 0.85);
    g.lineTo(oX + W * 0.85, oY + H * 0.6);
    g.closePath(); g.fillPath();

    // Cockpit
    g.fillStyle(0x224466);
    g.fillEllipse(oX + W * 0.75, oY + H * 0.45, W * 0.15, H * 0.18);
    g.lineStyle(1, outlineColor, 0.6);
    g.strokeEllipse(oX + W * 0.75, oY + H * 0.45, W * 0.15, H * 0.18);

    // Outline
    g.lineStyle(1.5, outlineColor, 0.7);
    g.strokeEllipse(oX + W / 2, oY + H * 0.45, W * 0.95, H * 0.55);

    // Panel lines
    g.lineStyle(0.5, outlineColor, 0.3);
    g.lineBetween(oX + W * 0.3, oY + H * 0.2, oX + W * 0.3, oY + H * 0.7);
    g.lineBetween(oX + W * 0.7, oY + H * 0.2, oX + W * 0.7, oY + H * 0.7);
    g.lineBetween(oX + W * 0.2, oY + H * 0.45, oX + W * 0.8, oY + H * 0.45);

    // Rear thruster engines
    const engineY = oY + H * 0.15;
    [oX + W * 0.35, oX + W * 0.5, oX + W * 0.65].forEach(ex => {
      g.fillStyle(0x111122); g.fillCircle(ex, engineY, 7);
      g.fillStyle(thrusterColor, 0.9); g.fillCircle(ex, engineY, 5);
      g.fillStyle(0xffffff, 0.5); g.fillCircle(ex, engineY, 2);
    });
  }

  _generateFalconShip(key, colors) {
    const W = CONFIG.SHIP.WIDTH, H = CONFIG.SHIP.HEIGHT;
    const g = this.make.graphics({ add: false });
    this._drawFalcon(g, W, H, 0, 0, colors);
    g.generateTexture(key, W, H);
    g.destroy();
  }

  _generateFalconShipAG(key, colors) {
    const W = CONFIG.SHIP.WIDTH + 20, H = CONFIG.SHIP.HEIGHT + 20;
    const g = this.make.graphics({ add: false });
    g.fillStyle(colors.CYAN, 0.1);
    g.fillEllipse(W / 2, H / 2, W, H);
    g.fillStyle(0xffff00, 0.08);
    g.fillEllipse(W / 2, H / 2, W * 0.85, H * 0.85);
    this._drawFalcon(g, CONFIG.SHIP.WIDTH, CONFIG.SHIP.HEIGHT, 10, 10, colors);
    g.generateTexture(key, W, H);
    g.destroy();
  }

  // ── Phase 2: Hellfire Racer (angular, aggressive) ──
  _drawHellfireShip(g, W, H, oX, oY, colors) {
    const bodyColor = colors.SHIP_BODY;
    const outlineColor = colors.CYAN;
    const thrusterColor = colors.THRUSTER;

    // Main body - angular wedge
    g.fillStyle(bodyColor);
    g.beginPath();
    g.moveTo(oX + W * 0.5, oY + H * 0.15);
    g.lineTo(oX + W * 0.1, oY + H * 0.85);
    g.lineTo(oX + W * 0.3, oY + H * 0.9);
    g.lineTo(oX + W * 0.5, oY + H * 0.7);
    g.lineTo(oX + W * 0.7, oY + H * 0.9);
    g.lineTo(oX + W * 0.9, oY + H * 0.85);
    g.closePath(); g.fillPath();

    // Wings
    g.fillStyle(0x884422);
    g.beginPath();
    g.moveTo(oX + W * 0.05, oY + H * 0.5);
    g.lineTo(oX + W * 0.0, oY + H * 0.85);
    g.lineTo(oX + W * 0.15, oY + H * 0.75);
    g.closePath(); g.fillPath();
    g.beginPath();
    g.moveTo(oX + W * 0.95, oY + H * 0.5);
    g.lineTo(oX + W * 1.0, oY + H * 0.85);
    g.lineTo(oX + W * 0.85, oY + H * 0.75);
    g.closePath(); g.fillPath();

    // Cockpit
    g.fillStyle(0x442200);
    g.fillEllipse(oX + W * 0.5, oY + H * 0.4, W * 0.2, H * 0.15);
    g.lineStyle(1, 0xff8800, 0.6);
    g.strokeEllipse(oX + W * 0.5, oY + H * 0.4, W * 0.2, H * 0.15);

    // Outline
    g.lineStyle(1.5, outlineColor, 0.7);
    g.beginPath();
    g.moveTo(oX + W * 0.5, oY + H * 0.15);
    g.lineTo(oX + W * 0.1, oY + H * 0.85);
    g.lineTo(oX + W * 0.9, oY + H * 0.85);
    g.closePath(); g.strokePath();

    // Engines (fiery)
    const engineY = oY + H * 0.12;
    [oX + W * 0.35, oX + W * 0.5, oX + W * 0.65].forEach(ex => {
      g.fillStyle(0x110800); g.fillCircle(ex, engineY, 6);
      g.fillStyle(thrusterColor, 0.9); g.fillCircle(ex, engineY, 4);
      g.fillStyle(0xffff00, 0.6); g.fillCircle(ex, engineY, 2);
    });

    // Fire streaks
    g.lineStyle(1, 0xff4400, 0.4);
    g.lineBetween(oX + W * 0.35, oY, oX + W * 0.35, oY + H * 0.12);
    g.lineBetween(oX + W * 0.5, oY, oX + W * 0.5, oY + H * 0.12);
    g.lineBetween(oX + W * 0.65, oY, oX + W * 0.65, oY + H * 0.12);
  }

  _generateHellfireShip(key, colors) {
    const W = CONFIG.SHIP.WIDTH, H = CONFIG.SHIP.HEIGHT;
    const g = this.make.graphics({ add: false });
    this._drawHellfireShip(g, W, H, 0, 0, colors);
    g.generateTexture(key, W, H);
    g.destroy();
  }

  _generateHellfireShipAG(key, colors) {
    const W = CONFIG.SHIP.WIDTH + 20, H = CONFIG.SHIP.HEIGHT + 20;
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xff6600, 0.1);
    g.fillEllipse(W / 2, H / 2, W, H);
    g.fillStyle(0xffaa00, 0.08);
    g.fillEllipse(W / 2, H / 2, W * 0.85, H * 0.85);
    this._drawHellfireShip(g, CONFIG.SHIP.WIDTH, CONFIG.SHIP.HEIGHT, 10, 10, colors);
    g.generateTexture(key, W, H);
    g.destroy();
  }

  // ── Phase 3: Stealth Fighter (sleek, green-lit) ──
  _drawStealthShip(g, W, H, oX, oY, colors) {
    const bodyColor = colors.SHIP_BODY;
    const outlineColor = colors.CYAN;
    const thrusterColor = colors.THRUSTER;

    // Main body - diamond/stealth shape
    g.fillStyle(bodyColor);
    g.beginPath();
    g.moveTo(oX + W * 0.5, oY + H * 0.1);
    g.lineTo(oX + W * 0.05, oY + H * 0.6);
    g.lineTo(oX + W * 0.2, oY + H * 0.9);
    g.lineTo(oX + W * 0.5, oY + H * 0.7);
    g.lineTo(oX + W * 0.8, oY + H * 0.9);
    g.lineTo(oX + W * 0.95, oY + H * 0.6);
    g.closePath(); g.fillPath();

    // Inner detail panel
    g.fillStyle(0x334433);
    g.beginPath();
    g.moveTo(oX + W * 0.5, oY + H * 0.25);
    g.lineTo(oX + W * 0.25, oY + H * 0.6);
    g.lineTo(oX + W * 0.5, oY + H * 0.55);
    g.lineTo(oX + W * 0.75, oY + H * 0.6);
    g.closePath(); g.fillPath();

    // Green LED strips
    g.lineStyle(2, outlineColor, 0.8);
    g.lineBetween(oX + W * 0.5, oY + H * 0.15, oX + W * 0.15, oY + H * 0.55);
    g.lineBetween(oX + W * 0.5, oY + H * 0.15, oX + W * 0.85, oY + H * 0.55);

    // Cockpit (narrow visor)
    g.fillStyle(0x003322);
    g.fillEllipse(oX + W * 0.5, oY + H * 0.4, W * 0.22, H * 0.1);
    g.lineStyle(1, 0x00ff44, 0.7);
    g.strokeEllipse(oX + W * 0.5, oY + H * 0.4, W * 0.22, H * 0.1);

    // Outline
    g.lineStyle(1, outlineColor, 0.5);
    g.beginPath();
    g.moveTo(oX + W * 0.5, oY + H * 0.1);
    g.lineTo(oX + W * 0.05, oY + H * 0.6);
    g.lineTo(oX + W * 0.2, oY + H * 0.9);
    g.lineTo(oX + W * 0.8, oY + H * 0.9);
    g.lineTo(oX + W * 0.95, oY + H * 0.6);
    g.closePath(); g.strokePath();

    // Engines (green glow)
    const engineY = oY + H * 0.08;
    [oX + W * 0.4, oX + W * 0.6].forEach(ex => {
      g.fillStyle(0x001108); g.fillCircle(ex, engineY, 7);
      g.fillStyle(thrusterColor, 0.9); g.fillCircle(ex, engineY, 5);
      g.fillStyle(0xaaffcc, 0.5); g.fillCircle(ex, engineY, 2);
    });
  }

  _generateStealthShip(key, colors) {
    const W = CONFIG.SHIP.WIDTH, H = CONFIG.SHIP.HEIGHT;
    const g = this.make.graphics({ add: false });
    this._drawStealthShip(g, W, H, 0, 0, colors);
    g.generateTexture(key, W, H);
    g.destroy();
  }

  _generateStealthShipAG(key, colors) {
    const W = CONFIG.SHIP.WIDTH + 20, H = CONFIG.SHIP.HEIGHT + 20;
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x00ff44, 0.1);
    g.fillEllipse(W / 2, H / 2, W, H);
    g.fillStyle(0x88ffaa, 0.08);
    g.fillEllipse(W / 2, H / 2, W * 0.85, H * 0.85);
    this._drawStealthShip(g, CONFIG.SHIP.WIDTH, CONFIG.SHIP.HEIGHT, 10, 10, colors);
    g.generateTexture(key, W, H);
    g.destroy();
  }

  /* ═══════════════════════════════════════════════
   *  OBSTACLE TEXTURES
   * ═══════════════════════════════════════════════ */

  // Phase 1: Rocky asteroids
  _generateAsteroidTextures() {
    const colors = CONFIG.PHASES[1].colors;
    CONFIG.ASTEROID.SIZES.forEach(({ key, radius, points }) => {
      for (let v = 0; v < 3; v++) {
        const size = radius * 2 + 8;
        const g = this.make.graphics({ add: false });
        const cx = size / 2, cy = size / 2;
        const pts = [];
        for (let i = 0; i < points; i++) {
          const a = (i / points) * Math.PI * 2;
          const r = radius * (0.65 + Math.random() * 0.35);
          pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
        }
        g.fillStyle(colors.AST_BODY);
        g.beginPath(); g.moveTo(pts[0].x, pts[0].y);
        pts.forEach(p => g.lineTo(p.x, p.y));
        g.closePath(); g.fillPath();
        g.lineStyle(1.5, colors.AST_EDGE, 0.8);
        g.beginPath(); g.moveTo(pts[0].x, pts[0].y);
        pts.forEach(p => g.lineTo(p.x, p.y));
        g.closePath(); g.strokePath();
        g.generateTexture(`${key}_${v}`, size, size);
        g.destroy();
      }
    });
  }

  // Phase 2: Burning stars
  _generateBurningStarTextures() {
    const sizes = [
      { key: 'bstar_s', radius: 14 },
      { key: 'bstar_m', radius: 24 },
      { key: 'bstar_l', radius: 36 },
    ];
    sizes.forEach(({ key, radius }) => {
      for (let v = 0; v < 3; v++) {
        const size = radius * 2 + 16;
        const g = this.make.graphics({ add: false });
        const cx = size / 2, cy = size / 2;
        // Outer glow
        g.fillStyle(0xff6600, 0.15);
        g.fillCircle(cx, cy, radius + 6);
        g.fillStyle(0xffaa00, 0.2);
        g.fillCircle(cx, cy, radius + 3);
        // Star body with spikes
        const spikes = 5 + v;
        g.fillStyle(0xffdd44);
        g.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 === 0 ? radius : radius * 0.45;
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          if (i === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.closePath(); g.fillPath();
        // Core
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(cx, cy, radius * 0.3);
        // Edge glow
        g.lineStyle(1, 0xffff88, 0.6);
        g.strokeCircle(cx, cy, radius * 0.8);
        g.generateTexture(`${key}_${v}`, size, size);
        g.destroy();
      }
    });
  }

  // Phase 3: Alien ships
  _generateAlienShipTextures() {
    const alienTypes = [
      { key: 'alien_s', w: 30, h: 30 },
      { key: 'alien_m', w: 44, h: 44 },
      { key: 'alien_l', w: 60, h: 60 },
    ];
    alienTypes.forEach(({ key, w, h }) => {
      for (let v = 0; v < 3; v++) {
        const g = this.make.graphics({ add: false });
        const cx = w / 2, cy = h / 2;
        
        if (v === 0) {
          // Bio-mechanical saucer
          g.fillStyle(0x115533);
          g.fillEllipse(cx, cy, w * 0.9, h * 0.5);
          g.fillStyle(0x00ff44, 0.3);
          g.fillEllipse(cx, cy, w * 0.5, h * 0.3);
          g.lineStyle(1, 0x00ff88, 0.7);
          g.strokeEllipse(cx, cy, w * 0.9, h * 0.5);
          // Green lights
          g.fillStyle(0x00ff44, 0.8);
          g.fillCircle(cx - w * 0.25, cy, 2);
          g.fillCircle(cx + w * 0.25, cy, 2);
          g.fillCircle(cx, cy - h * 0.15, 2);
        } else if (v === 1) {
          // Jagged fighter
          g.fillStyle(0x224422);
          g.beginPath();
          g.moveTo(cx, cy - h * 0.45);
          g.lineTo(cx - w * 0.45, cy + h * 0.2);
          g.lineTo(cx - w * 0.2, cy + h * 0.45);
          g.lineTo(cx + w * 0.2, cy + h * 0.45);
          g.lineTo(cx + w * 0.45, cy + h * 0.2);
          g.closePath(); g.fillPath();
          g.lineStyle(1.5, 0x00ff66, 0.6);
          g.strokePath();
          // Wing lights
          g.fillStyle(0x00ff44);
          g.fillCircle(cx - w * 0.35, cy + h * 0.1, 2);
          g.fillCircle(cx + w * 0.35, cy + h * 0.1, 2);
        } else {
          // Organic/tentacle ship
          g.fillStyle(0x1a3322);
          g.fillCircle(cx, cy, w * 0.3);
          // Tentacles
          g.lineStyle(3, 0x115533, 0.8);
          for (let t = 0; t < 5; t++) {
            const a = (t / 5) * Math.PI * 2;
            const tx = cx + Math.cos(a) * w * 0.4;
            const ty = cy + Math.sin(a) * h * 0.4;
            g.lineBetween(cx + Math.cos(a) * w * 0.2, cy + Math.sin(a) * h * 0.2, tx, ty);
          }
          g.fillStyle(0x00ff44, 0.5);
          g.fillCircle(cx, cy, w * 0.15);
          g.lineStyle(1, 0x22ff66, 0.5);
          g.strokeCircle(cx, cy, w * 0.3);
        }
        g.generateTexture(`${key}_${v}`, w, h);
        g.destroy();
      }
    });
  }

  /* ═══════════════════════════════════════════════
   *  COMMON TEXTURES
   * ═══════════════════════════════════════════════ */

  _generatePlanetTextures() {
    const colors = [
      { core: 0x880044, mid: 0xcc2266, ring: 0xff00ff },
      { core: 0x003366, mid: 0x1188bb, ring: 0x00fff0 },
      { core: 0x440066, mid: 0x8833cc, ring: 0x8b00ff },
    ];
    colors.forEach((c, idx) => {
      const r = 100, sz = r * 2 + 20;
      const g = this.make.graphics({ add: false });
      const cx = sz / 2, cy = sz / 2;
      g.fillStyle(c.mid, 0.08); g.fillCircle(cx, cy, r + 8);
      for (let i = r; i > 0; i -= 3) {
        const t = 1 - i / r;
        const col = Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.IntegerToColor(c.core),
          Phaser.Display.Color.IntegerToColor(c.mid), 100, t * 100
        );
        g.fillStyle(Phaser.Display.Color.GetColor(col.r, col.g, col.b), 1);
        g.fillCircle(cx - t * 6, cy - t * 4, i);
      }
      g.lineStyle(2, c.ring, 0.5);
      g.strokeEllipse(cx, cy, r * 2.2, r * 0.5);
      g.generateTexture(`planet_${idx}`, sz, sz);
      g.destroy();
    });
  }

  _generateParticleTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();
  }

  _generateStarTexture() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(2, 2, 2);
    g.generateTexture('star', 4, 4);
    g.destroy();
  }

  _generateGlowTexture() {
    const sz = 64;
    const g = this.make.graphics({ add: false });
    for (let r = sz / 2; r > 0; r -= 1) {
      g.fillStyle(0xffffff, (r / (sz / 2)) * 0.3);
      g.fillCircle(sz / 2, sz / 2, r);
    }
    g.generateTexture('glow', sz, sz);
    g.destroy();
  }
}
