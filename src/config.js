/**
 * Retro Space Drift: Anti-Gravity — Game Configuration
 * All tunable constants + Phase definitions.
 */
export const CONFIG = {
  GAME_WIDTH: 480,
  GAME_HEIGHT: 800,

  VANISH_X: 240,
  VANISH_Y: 280,

  SHIP: {
    ACCELERATION: 700,
    MAX_SPEED: 350,
    DRAG: 300,
    DRIFT_FACTOR: 0.82,
    WIDTH: 90,
    HEIGHT: 70,
    START_Y_OFFSET: 100,
    TILT_MAX: 0.25,
    TILT_LERP: 0.08,
  },

  ASTEROID: {
    SIZES: [
      { key: 'asteroid_s', radius: 12, points: 7 },
      { key: 'asteroid_m', radius: 22, points: 9 },
      { key: 'asteroid_l', radius: 34, points: 11 },
    ],
    BASE_SPEED: 160,
    MAX_SPEED: 320,
    SPAWN_INTERVAL: 750,
    DIAGONAL_CHANCE: 0.2,
    POOL_SIZE: 30,
  },

  PLANET: {
    MIN_RADIUS: 70,
    MAX_RADIUS: 130,
    SPEED: 35,
    GRAVITY_RADIUS_MULT: 3,
    GRAVITY_STRENGTH: 120,
    FIRST_SPAWN_TIME: 30,
    SPAWN_INTERVAL: 22000,
  },

  ANTIGRAVITY: {
    MAX_CHARGE: 100,
    PASSIVE_RATE: 2.5,
    NEAR_MISS_CHARGE: 15,
    NEAR_MISS_DIST: 55,
    DURATION: 3000,
    SCORE_MULT: 2,
  },

  SCORE: {
    PER_SECOND: 10,
    NEAR_MISS_BONUS: 50,
  },

  DIFFICULTY: {
    SPEED_MULT_PER_SEC: 0.012,
    SPAWN_MULT_PER_SEC: 0.008,
    MIN_SPAWN_INTERVAL: 280,
    MAX_SPEED_MULT: 3.0,
  },

  PARALLAX: {
    LAYERS: [
      { count: 60, speed: 0.4, sizeMin: 0.5, sizeMax: 1.2, alpha: 0.4 },
      { count: 35, speed: 1.2, sizeMin: 1.0, sizeMax: 2.0, alpha: 0.6 },
      { count: 15, speed: 2.8, sizeMin: 1.5, sizeMax: 3.0, alpha: 0.9 },
    ],
  },

  /* ═══════════════════════════════════════════════
   *  PHASE SYSTEM — 3 phases with unique themes
   * ═══════════════════════════════════════════════ */
  PHASES: {
    // Time thresholds (seconds) to transition to next phase
    PHASE_2_TIME: 30,   // 30 seconds → Phase 2
    PHASE_3_TIME: 60,   // 1 minute → Phase 3
    PHASE_3_END: 90,    // 1:30 — Phase 3 duration reference
    TRANSITION_DURATION: 3000, // ms of hyperspace effect

    // Phase 1: Asteroids & KISS
    1: {
      name: 'ASTEROID FIELD',
      subtitle: 'I Was Made for Lovin\' You',
      band: 'KISS',
      youtubeId: 'ZhIsAZO5gl0',
      bgDark:    0x020210,
      bgPurple:  0x1a0033,
      nebulaA:   0x2200aa,
      nebulaB:   0x6600cc,
      starTint:  0xaaaaff,
      obstacles: 'asteroids',
      shipKey:   'ship_falcon',
      shipAGKey: 'ship_falcon_ag',
      colors: {
        CYAN:     0x00fff0,
        MAGENTA:  0xff00ff,
        PURPLE:   0x8b00ff,
        GRID:     0x330066,
        SHIP_BODY: 0x8899aa,
        SHIP_GLOW: 0x00fff0,
        THRUSTER:  0x4488ff,
        AST_BODY:  0x333355,
        AST_EDGE:  0x6666aa,
      },
    },

    // Phase 2: Stars & AC/DC — Highway to Hell
    2: {
      name: 'STELLAR INFERNO',
      subtitle: 'Highway to Hell',
      band: 'AC/DC',
      youtubeId: 'l482T0yNkeo',
      bgDark:    0x0a0400,
      bgPurple:  0x331100,
      nebulaA:   0xff6600,
      nebulaB:   0xffaa00,
      starTint:  0xffcc88,
      obstacles: 'stars',
      shipKey:   'ship_hellfire',
      shipAGKey: 'ship_hellfire_ag',
      colors: {
        CYAN:     0xff8800,
        MAGENTA:  0xff2200,
        PURPLE:   0xcc4400,
        GRID:     0x441100,
        SHIP_BODY: 0xaa6633,
        SHIP_GLOW: 0xff6600,
        THRUSTER:  0xff4400,
        AST_BODY:  0xffaa00,
        AST_EDGE:  0xffdd44,
      },
    },

    // Phase 3: Alien Ships & AC/DC — Back in Black
    3: {
      name: 'ALIEN WARZONE',
      subtitle: 'Back in Black',
      band: 'AC/DC',
      youtubeId: 'pAgnJDJN4VA',
      bgDark:    0x000a04,
      bgPurple:  0x003310,
      nebulaA:   0x00cc44,
      nebulaB:   0x22ff66,
      starTint:  0x88ffaa,
      obstacles: 'aliens',
      shipKey:   'ship_stealth',
      shipAGKey: 'ship_stealth_ag',
      colors: {
        CYAN:     0x00ff66,
        MAGENTA:  0x22ff88,
        PURPLE:   0x009944,
        GRID:     0x003311,
        SHIP_BODY: 0x446655,
        SHIP_GLOW: 0x00ff44,
        THRUSTER:  0x22ff66,
        AST_BODY:  0x115533,
        AST_EDGE:  0x00ff44,
      },
    },
  },

  COLORS: {
    CYAN:       0x00fff0,
    MAGENTA:    0xff00ff,
    PURPLE:     0x8b00ff,
    ORANGE:     0xff6600,
    PINK:       0xff1493,
    YELLOW:     0xffff00,
    WHITE:      0xffffff,
    BG_DARK:    0x020208,
    BG_PURPLE:  0x1a0033,
    GRID:       0x330066,
    SHIP_BODY:  0x8899aa,
    SHIP_GLOW:  0x00fff0,
    THRUSTER:   0x4488ff,
    AST_BODY:   0x333355,
    AST_EDGE:   0x6666aa,
  },
};
