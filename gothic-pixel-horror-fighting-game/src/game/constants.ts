// ============================================================
// SACRILEGIUM PUGNA — GAME CONSTANTS
// ============================================================

export const CANVAS_WIDTH = 896;
export const CANVAS_HEIGHT = 504;

export const GROUND_Y = 400;           // y position of ground
export const STAGE_LEFT = 40;
export const STAGE_RIGHT = CANVAS_WIDTH - 40;
export const FIGHTER_PUSH_DISTANCE = 48;

// Physics
export const GRAVITY = 0.65;
export const JUMP_FORCE = -14.5;
export const WALK_SPEED = 3.2;
export const BACK_WALK_SPEED = 2.6;

// Timer (99 seconds at 60fps)
export const ROUND_TIME_FRAMES = 99 * 60;
export const ROUND_ANNOUNCE_FRAMES = 120;
export const KO_FREEZE_FRAMES = 80;
export const ROUND_END_FRAMES = 180;
export const STAGE_INTRO_FRAMES = 90;

// Meter
export const GUARD_GAUGE_MAX = 100;
export const GUARD_CRUSH_DURATION = 90;     // frames of guard crush stun
export const POWER_CHARGE_MAX = 100;
export const POWER_STOCKS_MAX = 3;
export const METER_GAIN_ON_HIT = 15;
export const METER_GAIN_ON_WHIFF = 4;
export const METER_GAIN_ON_BLOCK = 8;
export const METER_GAIN_TAKE_HIT = 10;

// Guard gauge recovery (per frame not blocking)
export const GUARD_GAUGE_REGEN = 0.12;

// Input buffer
export const INPUT_BUFFER_SIZE = 20;
export const MOTION_WINDOW_FRAMES = 30;   // max frames for a quarter circle
export const CHARGE_FRAMES = 45;          // frames to hold for charge moves

// Colors — Gothic Palette
export const PALETTE = {
  // Backgrounds
  deepVoid:    '#080410',
  shadowBlue:  '#0d1a2b',
  darkStone:   '#1a1218',
  bloodVelvet: '#2d0a0a',

  // Stone / Architecture
  ashenGray:   '#3a3240',
  tarnishedGold:'#7a6432',
  goldenGlow:  '#c8a84b',
  crumbledMoss:'#2a3020',

  // Character palettes
  bloodRed:    '#8b1a1a',
  deepCrimson: '#5c0e0e',
  freshBlood:  '#cc2222',
  thornyBrown: '#4a2e1a',
  boneWhite:   '#d4c8b0',
  ashWhite:    '#c0b8a8',
  tarnishedSilver: '#7a8090',
  rustyIron:   '#5a4030',
  chainGray:   '#606878',
  holyGold:    '#e8c84a',
  corruptedGold: '#8a7020',
  voidPurple:  '#3a1a4a',
  spectralBlue:'#2a3a6a',
  seraphicWhite:'#d8e0f0',
  corruptWhite:'#a0a8b8',
  angelicGray: '#7080a0',

  // UI
  uiBackground:'rgba(8,4,16,0.92)',
  uiBorder:    '#5a3a1a',
  uiGold:      '#c8a030',
  uiRed:       '#8b1a1a',
  healthGreen: '#1a7a2a',
  healthYellow:'#8a7a10',
  healthRed:   '#7a1010',
  guardBlue:   '#1a3a7a',
  powerGold:   '#8a6010',
  powerOrange: '#c06010',

  // Effects
  hitFlashWhite:'rgba(255,255,255,0.9)',
  bloodParticle:'#aa1a1a',
  sparkYellow: '#e8c040',
  holyFlash:   '#f0e080',
  thornsGreen: '#2a5a1a',
};

// Stage Definitions
export const STAGES = [
  {
    id: 'cathedral',
    name: 'The Ossuary Cathedral',
    description: 'Beneath the bones of ten thousand penitents...',
  },
];

// Round win requirements
export const ROUNDS_TO_WIN = 2;
export const MAX_ROUNDS = 3;

// Super freeze duration
export const SUPER_FREEZE_FRAMES = 60;
export const SDM_FREEZE_FRAMES = 90;

// Hit spark display frames
export const HIT_SPARK_FRAMES = 12;
export const SUPER_SPARK_FRAMES = 24;
