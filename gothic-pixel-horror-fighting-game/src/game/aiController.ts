// ============================================================
// SACRILEGIUM PUGNA — ADAPTIVE AI CONTROLLER
// Three-tier difficulty with decision tree analysis
// ============================================================

import type { ActiveFighter, AIState, AIAction, AIDifficulty, FighterState } from './types';
import type { InputBuffer } from './inputBuffer';

// ── AI State Factory ──────────────────────────────────────
export function createAIState(difficulty: AIDifficulty): AIState {
  const delays: Record<AIDifficulty, number> = {
    EASY: 30,
    MEDIUM: 10,
    HARD: 2,
  };
  return {
    difficulty,
    reactionDelay: delays[difficulty],
    decisionTimer: 0,
    currentPlan: null,
    lastObservedPlayerState: null,
    lastObservedFrame: 0,
    consecutiveBlocks: 0,
    mixupMode: false,
  };
}

// ── Distance Classification ───────────────────────────────
type Range = 'VERY_CLOSE' | 'CLOSE' | 'MID' | 'FAR';
function classifyRange(dist: number): Range {
  if (dist < 80)  return 'VERY_CLOSE';
  if (dist < 180) return 'CLOSE';
  if (dist < 350) return 'MID';
  return 'FAR';
}

// ── Random Choice ─────────────────────────────────────────
function choose<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chance(probability: number): boolean {
  return Math.random() < probability;
}

// ── EASY AI: Gullible Martyr ──────────────────────────────
// 30-frame reaction delay, random attacks, 70% fail-block rate
function decideEasy(
  _ai: AIState,
  _self: ActiveFighter,
  player: ActiveFighter,
  _dist: number,
  range: Range,
  _frame: number
): AIAction {
  // 70% chance to NOT block incoming attacks
  if (player.state === 'ATTACKING' && chance(0.70)) {
    // Do something random instead of blocking
    const randomActions: AIAction[] = ['IDLE', 'WALK_FORWARD', 'LP', 'LK', 'JUMP'];
    return choose(randomActions);
  }

  // If player is attacking, sometimes block (30%)
  if (player.state === 'ATTACKING' && chance(0.30)) {
    return 'BLOCK_HIGH';
  }

  // Random behavior based on range
  if (range === 'VERY_CLOSE' || range === 'CLOSE') {
    const closeOptions: AIAction[] = [
      'LP', 'LP', 'LK', 'MP', 'WALK_BACK', 'IDLE', 'JUMP',
    ];
    return choose(closeOptions);
  }

  if (range === 'MID') {
    return choose(['WALK_FORWARD', 'WALK_FORWARD', 'IDLE', 'LP', 'SPECIAL_A'] as AIAction[]);
  }

  return choose(['WALK_FORWARD', 'IDLE', 'JUMP'] as AIAction[]);
}

// ── MEDIUM AI: Vigilant Zealot ────────────────────────────
// 10-frame delay, executes combos, blocks projectiles, tech-throw range
function decideMedium(
  _ai: AIState,
  self: ActiveFighter,
  player: ActiveFighter,
  _dist: number,
  range: Range,
  _frame: number
): AIAction {
  const playerState = player.state;

  // Always block projectiles
  if (player.projectiles.some(p => p.active)) {
    const projMovingTowardSelf = player.projectiles.some(proj => {
      const movingRight = proj.vx > 0;
      return movingRight === (player.physics.x < self.physics.x);
    });
    if (projMovingTowardSelf) {
      if (chance(0.85)) return 'BLOCK_HIGH';
    }
  }

  // Tech throw if very close and player is neutral/walking
  if (range === 'VERY_CLOSE' &&
      (playerState === 'IDLE' || playerState === 'WALK_FORWARD' || playerState === 'WALK_BACK')) {
    if (chance(0.6)) return 'SPECIAL_C'; // command grab or special pressure
  }

  // Block incoming attacks (90% rate)
  if (playerState === 'ATTACKING' || playerState === 'PRE_ATTACK') {
    if (chance(0.90)) {
      // Smart block — guess between high and low
      return chance(0.7) ? 'BLOCK_HIGH' : 'BLOCK_LOW';
    }
  }

  // Punish whiffed attacks
  if (playerState === 'POST_ATTACK' && range === 'CLOSE') {
    // Execute 2-hit combo
    if (chance(0.75)) return choose(['MP', 'HP', 'SPECIAL_B'] as AIAction[]);
  }

  // Aerial response
  if (playerState === 'JUMP' || playerState === 'JUMP_FORWARD') {
    if (range !== 'FAR' && chance(0.70)) return 'SPECIAL_B';
  }

  // Neutral play
  switch (range) {
    case 'VERY_CLOSE':
      return choose(['LP', 'MP', 'LK', 'SPECIAL_C', 'WALK_BACK'] as AIAction[]);
    case 'CLOSE':
      return choose(['MP', 'HP', 'MK', 'SPECIAL_B', 'SPECIAL_C', 'WALK_FORWARD'] as AIAction[]);
    case 'MID':
      return choose(['WALK_FORWARD', 'SPECIAL_A', 'BLOCK_HIGH', 'JUMP'] as AIAction[]);
    case 'FAR':
      return choose(['WALK_FORWARD', 'WALK_FORWARD', 'SPECIAL_A', 'JUMP'] as AIAction[]);
  }
}

// ── HARD AI: The Miracle Incarnate ───────────────────────
// Frame-perfect reads, mix-ups, meter optimization
function decideHard(
  ai: AIState,
  self: ActiveFighter,
  player: ActiveFighter,
  _dist: number,
  range: Range,
  _frame: number
): AIAction {
  const playerState = player.state;

  // SUPER KILL CONFIRM: if this combo can kill and meter available
  const killableHP = player.health <= 280;
  if (killableHP && self.meter.powerStocks >= 1 && range !== 'FAR') {
    return 'SUPER';
  }

  // Frame-perfect punish on whiffed light attacks
  if (playerState === 'POST_ATTACK') {
    const attackRecovery = player.currentAttack?.frameData.recoveryFrames ?? 0;
    if (attackRecovery >= 14 && range === 'CLOSE') {
      // Optimal punish combo
      return choose(['HP', 'SPECIAL_B', 'SPECIAL_C'] as AIAction[]);
    }
    if (range === 'MID') return 'SPECIAL_A';
  }

  // Block ALL projectiles
  if (player.projectiles.some(p => p.active)) {
    const threat = player.projectiles.some(proj => {
      const movingToward = (proj.vx > 0) === (player.physics.x < self.physics.x);
      const timeToReach = _dist / Math.abs(proj.vx);
      return movingToward && timeToReach < 60;
    });
    if (threat) return 'BLOCK_HIGH';
  }

  // Mix-up: attack LOW when player is blocking HIGH
  if (playerState === 'BLOCK_HIGH' && range === 'CLOSE') {
    ai.mixupMode = true;
    if (chance(0.85)) return 'LK'; // low attack breaks high block
  }
  if (playerState === 'BLOCK_LOW' && range === 'CLOSE') {
    if (chance(0.85)) return 'HP'; // overhead breaks low block
  }
  ai.mixupMode = false;

  // Perfect anti-air
  if ((playerState === 'JUMP' || playerState === 'JUMP_FORWARD' || playerState === 'JUMP_BACK')
      && range !== 'FAR') {
    return 'SPECIAL_B';
  }

  // Full pressure combos
  if (range === 'VERY_CLOSE') {
    if (self.meter.powerStocks >= 1 && chance(0.5)) return 'SUPER';
    return choose(['LP', 'MP', 'HP', 'SPECIAL_C', 'SPECIAL_B'] as AIAction[]);
  }

  if (range === 'CLOSE') {
    return choose(['MP', 'HP', 'MK', 'SPECIAL_B', 'SPECIAL_C'] as AIAction[]);
  }

  if (range === 'MID') {
    return choose(['WALK_FORWARD', 'SPECIAL_A', 'JUMP_FORWARD'] as AIAction[]);
  }

  return choose(['WALK_FORWARD', 'SPECIAL_A'] as AIAction[]);
}

// ── AI Decision Engine ────────────────────────────────────
// Called every 3 frames with full game state analysis
export function tickAI(
  ai: AIState,
  self: ActiveFighter,
  player: ActiveFighter,
  frame: number
): { ai: AIState; action: AIAction } {
  ai = { ...ai };
  ai.decisionTimer++;

  // Decision rate: every 3 frames for analysis
  const decisionRate = 3;
  if (ai.decisionTimer % decisionRate !== 0) {
    return { ai, action: ai.currentPlan ?? 'IDLE' };
  }

  // Observe player state (with reaction delay)
  const observedState: FighterState = frame - ai.lastObservedFrame >= ai.reactionDelay
    ? player.state
    : (ai.lastObservedPlayerState ?? 'IDLE');

  ai.lastObservedPlayerState = observedState;
  ai.lastObservedFrame = frame;

  const dist = Math.abs(self.physics.x - player.physics.x);
  const range = classifyRange(dist);

  // Build a synthetic "observed player" with delayed info
  const observedPlayer: ActiveFighter = {
    ...player,
    state: observedState,
  };

  let action: AIAction;

  switch (ai.difficulty) {
    case 'EASY':
      action = decideEasy(ai, self, observedPlayer, dist, range, frame);
      break;
    case 'MEDIUM':
      action = decideMedium(ai, self, observedPlayer, dist, range, frame);
      break;
    case 'HARD':
      action = decideHard(ai, self, observedPlayer, dist, range, frame);
      break;
  }

  ai.currentPlan = action;
  return { ai, action };
}

// ── Apply AI Action to Input Buffer ──────────────────────
// Translates AI decision into simulated key presses
export function applyAIAction(
  action: AIAction,
  buf: InputBuffer,
  self: ActiveFighter,
  frame: number
) {
  const facingRight = self.physics.facingRight;

  // Simulate direction holds based on action
  switch (action) {
    case 'WALK_FORWARD':
      buf.updateDirection(facingRight ? 6 : 4);
      break;
    case 'WALK_BACK':
      buf.updateDirection(facingRight ? 4 : 6);
      break;
    case 'JUMP':
      buf.updateDirection(8);
      break;
    case 'JUMP': {
      // up+forward or neutral
      buf.updateDirection(9);
      break;
    }
    case 'CROUCH':
      buf.updateDirection(2);
      break;
    case 'BLOCK_HIGH':
      buf.updateDirection(facingRight ? 4 : 6);
      break;
    case 'BLOCK_LOW':
      buf.updateDirection(facingRight ? 1 : 3);
      break;
    case 'LP':
      buf.updateDirection(5);
      buf.registerButton('LP');
      break;
    case 'MP':
      buf.updateDirection(5);
      buf.registerButton('MP');
      break;
    case 'HP':
      buf.updateDirection(5);
      buf.registerButton('HP');
      break;
    case 'LK':
      buf.updateDirection(2); // simulate crouching low kick
      buf.registerButton('LK');
      break;
    case 'MK':
      buf.updateDirection(5);
      buf.registerButton('MK');
      break;
    case 'HK':
      buf.updateDirection(5);
      buf.registerButton('HK');
      break;

    case 'SPECIAL_A': {
      // Simulate QCF+P: 2→3→6→LP
      buf.updateDirection(2);
      buf.updateDirection(3);
      buf.updateDirection(6);
      buf.registerButton('LP');
      break;
    }
    case 'SPECIAL_B': {
      // Simulate QCB+P: 2→1→4→LP
      buf.updateDirection(2);
      buf.updateDirection(1);
      buf.updateDirection(4);
      buf.registerButton('LP');
      break;
    }
    case 'SPECIAL_C': {
      // HCB+P for martyr, QCF+K for others
      if (self.definition.id === 'martyr') {
        buf.updateDirection(6);
        buf.updateDirection(3);
        buf.updateDirection(2);
        buf.updateDirection(1);
        buf.updateDirection(4);
        buf.registerButton('LP');
      } else if (self.definition.id === 'oracle') {
        buf.updateDirection(4);
        buf.updateDirection(1);
        buf.updateDirection(2);
        buf.updateDirection(3);
        buf.updateDirection(6);
        buf.registerButton('LK');
      } else {
        buf.updateDirection(2);
        buf.updateDirection(3);
        buf.updateDirection(6);
        buf.registerButton('LK');
      }
      break;
    }
    case 'SUPER': {
      // QCFx2+P or appropriate super motion
      buf.updateDirection(2);
      buf.updateDirection(3);
      buf.updateDirection(6);
      buf.updateDirection(2);
      buf.updateDirection(3);
      buf.updateDirection(6);
      buf.registerButton('HP');
      break;
    }
    case 'IDLE':
    default:
      buf.updateDirection(5);
      break;
  }

  buf.tick(frame);
}
