// ============================================================
// SACRILEGIUM PUGNA — CORE TYPE DEFINITIONS
// Gothic Pixel Horror Fighter — KOF-Style Combat System
// ============================================================

// ── Fighter States (FSM) ──────────────────────────────────
export type FighterState =
  | 'IDLE'
  | 'WALK_FORWARD'
  | 'WALK_BACK'
  | 'JUMP'
  | 'JUMP_FORWARD'
  | 'JUMP_BACK'
  | 'CROUCH'
  | 'PRE_ATTACK'   // startup frames
  | 'ATTACKING'    // active frames
  | 'POST_ATTACK'  // recovery frames
  | 'BLOCK_HIGH'
  | 'BLOCK_LOW'
  | 'HIT_STUN'
  | 'KNOCKDOWN'
  | 'WAKE_UP'
  | 'GUARD_CRUSH'
  | 'WIN'
  | 'LOSE'
  | 'SUPER_FREEZE'; // cinematic super pause

// ── Input Types ──────────────────────────────────────────
export type InputButton =
  | 'LP' | 'MP' | 'HP'   // Light / Medium / Heavy Punch
  | 'LK' | 'MK' | 'HK'   // Light / Medium / Heavy Kick
  | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  | 'SP'; // Special / super button

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  | 'UP_LEFT' | 'UP_RIGHT' | 'DOWN_LEFT' | 'DOWN_RIGHT' | 'NEUTRAL';

export interface InputFrame {
  button: InputButton;
  held: boolean;
  frame: number;
}

// ── Motion Input Notation (KOF Numeric Pad) ──────────────
// 7 8 9
// 4 5 6
// 1 2 3
export type MotionStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type MotionNotation = MotionStep[];

export interface MotionDefinition {
  id: string;
  sequence: MotionNotation;
  button: InputButton | InputButton[];
  windowFrames: number; // total frames allowed for motion
  name: string;
}

// ── Hitbox / Hurtbox ──────────────────────────────────────
export interface Rect {
  x: number; // relative to fighter origin
  y: number;
  w: number;
  h: number;
}

export interface HitboxData {
  rect: Rect;
  damage: number;
  guardDamage: number;   // guard meter reduction
  hitstun: number;       // frames of hitstun on hit
  blockstun: number;     // frames of blockstun
  knockdown: boolean;
  launchY?: number;      // vertical launch velocity
  pushback: number;      // horizontal pushback on hit
  type: 'LOW' | 'MID' | 'HIGH' | 'UNBLOCKABLE' | 'THROW' | 'PROJECTILE';
  priority: 'NORMAL' | 'SPECIAL' | 'SUPER'; // higher beats lower
}

// ── Attack Frame Data ──────────────────────────────────────
export interface AttackFrameData {
  id: string;
  totalFrames: number;
  startupFrames: number;  // frames before active
  activeFrames: number;   // frames hitbox is live
  recoveryFrames: number; // frames after active
  hitboxes: HitboxData[];
  hurtboxes: Rect[];      // vulnerable boxes during this attack
  cancelableInto?: string[]; // attack IDs this can chain to
  superCancelable?: boolean;
  audioSfx?: string;
}

// ── Character Move ──────────────────────────────────────
export interface Move {
  id: string;
  name: string;
  type: 'NORMAL' | 'COMMAND_NORMAL' | 'SPECIAL' | 'SUPER' | 'SDM';
  input?: MotionDefinition;
  commandInput?: string; // textual description e.g. "F+LP"
  frameData: AttackFrameData;
  meterCost?: number;    // 0-3 stocks
  meterGainOnHit: number;
  meterGainOnBlock: number;
  description: string;
}

// ── Power Gauge / Meter System ──────────────────────────
export interface MeterState {
  guardGauge: number;     // 0-100, decreases on block
  maxGuardGauge: number;
  powerStocks: number;    // 0-3 full stocks
  powerCharge: number;    // partial stock 0-100
  maxPowerCharge: number;
  guardCrushed: boolean;
  guardCrushTimer: number;
}

// ── Fighter Physics ──────────────────────────────────────
export interface FighterPhysics {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  facingRight: boolean;
  width: number;
  height: number;
}

// ── Fighter Stats ──────────────────────────────────────
export interface FighterStats {
  maxHealth: number;
  walkSpeed: number;
  jumpHeight: number;
  weight: number; // affects juggle/knockdown physics
  defense: number; // damage multiplier 0.8-1.2
}

// ── Complete Fighter Data ──────────────────────────────
export interface FighterDefinition {
  id: string;
  name: string;
  title: string;
  archetype: 'BALANCED' | 'GRAPPLER' | 'ZONER' | 'AERIAL' | 'PRESSURE';
  stats: FighterStats;
  palette: CharacterPalette;
  moves: Move[];
  lore: string;
  spriteConfig: SpriteConfig;
}

// ── Visual / Palette ──────────────────────────────────
export interface CharacterPalette {
  primary: string;
  secondary: string;
  accent: string;
  blood: string;
  shadow: string;
}

export interface SpriteConfig {
  bodyColor: string;
  armorColor: string;
  weaponColor: string;
  eyeColor: string;
  effectColor: string;
  particleColor: string;
}

// ── Active Fighter State ──────────────────────────────
export interface ActiveFighter {
  definition: FighterDefinition;
  physics: FighterPhysics;
  state: FighterState;
  health: number;
  meter: MeterState;
  stateFrame: number;        // frame counter within current state
  inputBuffer: InputFrame[];
  currentAttack?: Move;
  comboCount: number;
  totalComboDelay: number;
  isP1: boolean;
  isAI: boolean;
  aiDifficulty?: AIDifficulty;
  hitStunTimer: number;
  knockdownTimer: number;
  wakeUpTimer: number;
  jumpVy: number;
  blockingHigh: boolean;
  blockingLow: boolean;
  lastHitFrame: number;
  projectiles: ActiveProjectile[];
}

// ── Projectile ──────────────────────────────────────
export interface ActiveProjectile {
  id: string;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hitboxData: HitboxData;
  sprite: string; // identifier for rendering
  lifeFrames: number;
  currentFrame: number;
  active: boolean;
}

// ── AI System ──────────────────────────────────────
export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface AIState {
  difficulty: AIDifficulty;
  reactionDelay: number;
  decisionTimer: number;
  currentPlan: AIAction | null;
  lastObservedPlayerState: FighterState | null;
  lastObservedFrame: number;
  consecutiveBlocks: number;
  mixupMode: boolean;
}

export type AIAction =
  | 'WALK_FORWARD' | 'WALK_BACK' | 'JUMP'
  | 'CROUCH' | 'BLOCK_HIGH' | 'BLOCK_LOW'
  | 'LP' | 'MP' | 'HP' | 'LK' | 'MK' | 'HK'
  | 'SPECIAL_A' | 'SPECIAL_B' | 'SPECIAL_C' | 'SUPER'
  | 'IDLE';

// ── Game Phase ──────────────────────────────────────
export type GamePhase =
  | 'TITLE'
  | 'CHAR_SELECT'
  | 'STAGE_INTRO'
  | 'ROUND_ANNOUNCE'
  | 'FIGHTING'
  | 'KO'
  | 'ROUND_END'
  | 'GAME_OVER'
  | 'VICTORY';

// ── Round State ──────────────────────────────────────
export interface RoundState {
  roundNumber: number;
  maxRounds: number;
  p1Wins: number;
  p2Wins: number;
  timer: number;
  maxTimer: number;
  phase: GamePhase;
  phaseTimer: number;
  winner: 'P1' | 'P2' | 'DRAW' | null;
  koText: string;
}

// ── Complete Game State ──────────────────────────────
export interface GameState {
  round: RoundState;
  p1: ActiveFighter;
  p2: ActiveFighter;
  frame: number;
  paused: boolean;
  superFreeze: boolean;
  superFreezeTimer: number;
  screenShake: { x: number; y: number; intensity: number; duration: number };
  particles: Particle[];
  hitSparks: HitSpark[];
}

// ── Visual Effects ──────────────────────────────────
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'BLOOD' | 'SPARK' | 'HOLY' | 'THORN' | 'ASH';
}

export interface HitSpark {
  id: string;
  x: number;
  y: number;
  frame: number;
  maxFrame: number;
  type: 'NORMAL' | 'SPECIAL' | 'SUPER' | 'GUARD';
}

// ── Render Context ──────────────────────────────────
export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  frame: number;
}

// ── Input Mapping ──────────────────────────────────
export interface KeyMap {
  up: string;
  down: string;
  left: string;
  right: string;
  lp: string;
  mp: string;
  hp: string;
  lk: string;
  mk: string;
  hk: string;
}

export const P1_KEYMAP: KeyMap = {
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
  lp: 'u',
  mp: 'i',
  hp: 'o',
  lk: 'j',
  mk: 'k',
  hk: 'l',
};
