// ============================================================
// SACRILEGIUM PUGNA — FIGHTER STATE MACHINE (FSM)
// KOF-Style Combat States with Frame Data Integration
// ============================================================

import type {
  ActiveFighter, Move, HitboxData, Rect,
  ActiveProjectile, Particle, HitSpark,
} from './types';
import type { InputBuffer, HeldKeysState } from './inputBuffer';
import {
  GROUND_Y,
  GUARD_GAUGE_MAX, GUARD_GAUGE_REGEN, GUARD_CRUSH_DURATION,
  POWER_CHARGE_MAX, POWER_STOCKS_MAX,
  METER_GAIN_ON_HIT, METER_GAIN_ON_BLOCK, METER_GAIN_TAKE_HIT,
} from './constants';
import { CHARACTER_ROSTER } from './characters';
import {
  applyPhysics, getFighterHurtbox, worldRect,
  rectsOverlap, initiateJump, applyPushback, updateProjectile,
} from './physics';

let _projIdCounter = 0;
function newProjId() { return `proj_${++_projIdCounter}`; }
let _particleId = 0;
function newParticleId() { return `p_${++_particleId}`; }
let _sparkId = 0;
function newSparkId() { return `sp_${++_sparkId}`; }

// ── Default Meter State ──────────────────────────────────
export function defaultMeter() {
  return {
    guardGauge: GUARD_GAUGE_MAX,
    maxGuardGauge: GUARD_GAUGE_MAX,
    powerStocks: 0,
    powerCharge: 0,
    maxPowerCharge: 100,
    guardCrushed: false,
    guardCrushTimer: 0,
  };
}

// ── Create Active Fighter from Definition ────────────────
export function createFighter(
  defId: string,
  startX: number,
  facingRight: boolean,
  isP1: boolean
): ActiveFighter {
  const def = CHARACTER_ROSTER.find(c => c.id === defId)!;
  return {
    definition: def,
    physics: {
      x: startX, y: GROUND_Y,
      vx: 0, vy: 0,
      grounded: true, facingRight,
      width: 40, height: 90,
    },
    state: 'IDLE',
    health: def.stats.maxHealth,
    meter: defaultMeter(),
    stateFrame: 0,
    inputBuffer: [],
    currentAttack: undefined,
    comboCount: 0,
    totalComboDelay: 0,
    isP1,
    isAI: false,
    hitStunTimer: 0,
    knockdownTimer: 0,
    wakeUpTimer: 0,
    jumpVy: 0,
    blockingHigh: false,
    blockingLow: false,
    lastHitFrame: 0,
    projectiles: [],
  };
}

// ── Frame Data Hit Detection ──────────────────────────────
// Returns true if we are in the ACTIVE window of the current attack
export function isInActiveFrames(f: ActiveFighter): boolean {
  if (!f.currentAttack || f.state !== 'ATTACKING') return false;
  const fd = f.currentAttack.frameData;
  return (
    f.stateFrame >= fd.startupFrames &&
    f.stateFrame < fd.startupFrames + fd.activeFrames
  );
}

// ── Get Active Hitboxes ───────────────────────────────────
export function getActiveHitboxes(f: ActiveFighter): HitboxData[] {
  if (!isInActiveFrames(f)) return [];
  if (!f.currentAttack) return [];
  return f.currentAttack.frameData.hitboxes;
}

// ── Get World-Space Hitbox Rects ─────────────────────────
export function getHitboxWorldRects(f: ActiveFighter): { data: HitboxData; rect: Rect }[] {
  const hitboxes = getActiveHitboxes(f);
  return hitboxes.map(hb => ({
    data: hb,
    rect: worldRect(hb.rect, f.physics, f.physics.facingRight),
  }));
}

// ── Process Hit Between Two Fighters ─────────────────────
export interface HitResult {
  landed: boolean;
  blocked: boolean;
  guardCrush: boolean;
  hitboxData?: HitboxData;
  particles: Particle[];
  hitSparks: HitSpark[];
  superFreeze: boolean;
}

export function processHit(
  attacker: ActiveFighter,
  defender: ActiveFighter,
  _frame: number
): HitResult {
  const result: HitResult = {
    landed: false, blocked: false, guardCrush: false,
    particles: [], hitSparks: [], superFreeze: false,
  };

  if (defender.state === 'HIT_STUN' && defender.hitStunTimer > 0) {
    // Already in hitstun — check if we can juggle
    // For now, skip double-hits on the same frame
  }

  const attackerHitboxes = getHitboxWorldRects(attacker);
  if (attackerHitboxes.length === 0) return result;

  const defHurtbox = getFighterHurtbox(defender);

  for (const { data: hb, rect: hitRect } of attackerHitboxes) {
    if (!rectsOverlap(hitRect, defHurtbox)) continue;

    result.landed = true;
    result.hitboxData = hb;

    // Determine if the attack is blocked
    const isFacingAttacker = defender.physics.facingRight !== attacker.physics.facingRight;
    const isBlocking = isFacingAttacker &&
      ((defender.state === 'BLOCK_HIGH' || defender.state === 'BLOCK_LOW') ||
       (defender.blockingHigh || defender.blockingLow));

    if (isBlocking && hb.type !== 'THROW' && hb.type !== 'UNBLOCKABLE') {
      // Successful block
      const highBlock = defender.state === 'BLOCK_HIGH' || defender.blockingHigh;
      const lowBlock = defender.state === 'BLOCK_LOW' || defender.blockingLow;

      // Low attacks must be blocked low
      const properBlock = hb.type === 'LOW' ? lowBlock : highBlock;

      if (properBlock) {
        result.blocked = true;

        // Drain guard meter
        const newGuard = Math.max(0, defender.meter.guardGauge - hb.guardDamage);
        defender.meter.guardGauge = newGuard;

        if (newGuard <= 0 && !defender.meter.guardCrushed) {
          result.guardCrush = true;
          defender.meter.guardCrushed = true;
          defender.meter.guardCrushTimer = GUARD_CRUSH_DURATION;
          defender.state = 'GUARD_CRUSH';
          defender.stateFrame = 0;
        } else {
          defender.hitStunTimer = hb.blockstun;
        }

        // Meter gain on block
        addMeter(attacker, attacker.currentAttack?.meterGainOnBlock ?? 5);
        addMeter(defender, METER_GAIN_ON_BLOCK / 2);

        // Blockstun
        defender.state = result.guardCrush ? 'GUARD_CRUSH' : 'HIT_STUN';
        defender.hitStunTimer = result.guardCrush ? GUARD_CRUSH_DURATION : hb.blockstun;

        result.hitSparks.push(createHitSpark(hitRect.x + hitRect.w / 2, hitRect.y + hitRect.h / 2, 'GUARD'));
        break;
      }
    }

    // Hit lands
    const defense = defender.definition.stats.defense;
    const dmg = Math.floor(hb.damage * defense);
    defender.health = Math.max(0, defender.health - dmg);
    defender.comboCount++;

    // Hitstun
    defender.hitStunTimer = hb.hitstun;
    defender.state = 'HIT_STUN';
    defender.stateFrame = 0;

    if (hb.knockdown) {
      defender.state = 'KNOCKDOWN';
      defender.knockdownTimer = 60;
      if (hb.launchY) {
        defender.physics.vy = hb.launchY;
        defender.physics.grounded = false;
      }
    }

    // Pushback
    defender.physics = applyPushback(defender.physics, attacker.physics, hb.pushback);

    // Meter
    addMeter(attacker, attacker.currentAttack?.meterGainOnHit ?? METER_GAIN_ON_HIT);
    addMeter(defender, METER_GAIN_TAKE_HIT);

    // Particles — blood!
    for (let i = 0; i < 6; i++) {
      result.particles.push(createBloodParticle(
        hitRect.x + hitRect.w / 2, hitRect.y + hitRect.h / 2,
        defender.definition.spriteConfig.particleColor
      ));
    }

    // Hit spark
    const sparkType = attacker.currentAttack?.type === 'SDM' ? 'SUPER'
      : attacker.currentAttack?.type === 'SPECIAL' ? 'SPECIAL'
      : 'NORMAL';
    result.hitSparks.push(createHitSpark(hitRect.x + hitRect.w / 2, hitRect.y + hitRect.h / 2, sparkType));

    // Super freeze on SDM
    if (attacker.currentAttack?.type === 'SDM') {
      result.superFreeze = true;
    }

    break; // Only one hit per frame per attack
  }

  return result;
}

// ── Add Meter ────────────────────────────────────────────
export function addMeter(f: ActiveFighter, amount: number) {
  if (f.meter.powerStocks >= POWER_STOCKS_MAX) return;
  f.meter.powerCharge += amount;
  while (f.meter.powerCharge >= POWER_CHARGE_MAX && f.meter.powerStocks < POWER_STOCKS_MAX) {
    f.meter.powerCharge -= POWER_CHARGE_MAX;
    f.meter.powerStocks++;
  }
  if (f.meter.powerStocks >= POWER_STOCKS_MAX) {
    f.meter.powerCharge = 0;
  }
}

// ── Spawn Projectile ─────────────────────────────────────
export function spawnProjectile(f: ActiveFighter, move: Move): ActiveProjectile {
  const speed = f.physics.facingRight ? 3.5 : -3.5;
  const hb = move.frameData.hitboxes[0];
  return {
    id: newProjId(),
    ownerId: f.definition.id,
    x: f.physics.facingRight ? f.physics.x + 30 : f.physics.x - 30,
    y: f.physics.y - 55,
    vx: speed,
    vy: 0,
    hitboxData: hb,
    sprite: move.id,
    lifeFrames: 90,
    currentFrame: 0,
    active: true,
  };
}

// ── Particle Factories ───────────────────────────────────
function createBloodParticle(x: number, y: number, color: string): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = 1 + Math.random() * 3;
  return {
    id: newParticleId(),
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - 2,
    life: 20 + Math.random() * 20,
    maxLife: 40,
    color,
    size: 2 + Math.random() * 3,
    type: 'BLOOD',
  };
}

function createHitSpark(x: number, y: number, type: 'NORMAL' | 'SPECIAL' | 'SUPER' | 'GUARD'): HitSpark {
  return {
    id: newSparkId(),
    x, y,
    frame: 0,
    maxFrame: type === 'SUPER' ? 24 : 12,
    type,
  };
}

// ── Main Fighter Tick ─────────────────────────────────────
// Processes one frame of state machine logic for a fighter.
// Returns new state + side effects (particles, projectiles)
export function tickFighter(
  f: ActiveFighter,
  _held: HeldKeysState,
  inputBuf: InputBuffer,
  opponent: ActiveFighter,
  frame: number,
  superFreeze: boolean
): { fighter: ActiveFighter; newProjectiles: ActiveProjectile[]; particles: Particle[] } {
  const newProjectiles: ActiveProjectile[] = [];
  const particles: Particle[] = [];

  if (superFreeze && f.state !== 'SUPER_FREEZE') {
    // Freeze everyone during super
    return { fighter: { ...f }, newProjectiles, particles };
  }

  f = { ...f };
  f.stateFrame++;

  // Auto-face opponent
  if (f.physics.grounded &&
      f.state !== 'HIT_STUN' && f.state !== 'KNOCKDOWN' &&
      f.state !== 'ATTACKING' && f.state !== 'PRE_ATTACK' &&
      f.state !== 'POST_ATTACK') {
    f.physics = {
      ...f.physics,
      facingRight: opponent.physics.x > f.physics.x,
    };
  }

  // ── Guard Gauge Regeneration ──────────────────────────
  if (!f.meter.guardCrushed &&
      f.state !== 'BLOCK_HIGH' && f.state !== 'BLOCK_LOW') {
    f.meter = {
      ...f.meter,
      guardGauge: Math.min(GUARD_GAUGE_MAX, f.meter.guardGauge + GUARD_GAUGE_REGEN),
    };
  }

  // Guard crush timer
  if (f.meter.guardCrushTimer > 0) {
    f.meter = { ...f.meter, guardCrushTimer: f.meter.guardCrushTimer - 1 };
    if (f.meter.guardCrushTimer <= 0) {
      f.meter = { ...f.meter, guardCrushed: false, guardGauge: GUARD_GAUGE_MAX * 0.3 };
    }
  }

  // ── State Logic ───────────────────────────────────────
  switch (f.state) {
    case 'IDLE': {
      f = processIdleInput(f, _held, inputBuf, opponent, frame, newProjectiles);
      break;
    }
    case 'WALK_FORWARD': {
      const dir = f.physics.facingRight ? 1 : -1;
      f.physics = { ...f.physics, x: f.physics.x + dir * f.definition.stats.walkSpeed };
      f = processIdleInput(f, _held, inputBuf, opponent, frame, newProjectiles);
      break;
    }
    case 'WALK_BACK': {
      const dir = f.physics.facingRight ? -1 : 1;
      f.physics = { ...f.physics, x: f.physics.x + dir * 2.6 };
      f = processIdleInput(f, _held, inputBuf, opponent, frame, newProjectiles);
      break;
    }
    case 'CROUCH': {
      f = processIdleInput(f, _held, inputBuf, opponent, frame, newProjectiles);
      break;
    }
    case 'JUMP':
    case 'JUMP_FORWARD':
    case 'JUMP_BACK': {
      f.physics = applyPhysics(f.physics);
      if (f.physics.grounded) {
        f.state = 'IDLE';
        f.stateFrame = 0;
      }
      // Allow attacking in air
      const airAtk = checkAttackInput(f, _held, inputBuf, opponent, frame, newProjectiles);
      if (airAtk) f = airAtk;
      break;
    }
    case 'PRE_ATTACK': {
      if (!f.currentAttack) { f.state = 'IDLE'; break; }
      if (f.stateFrame >= f.currentAttack.frameData.startupFrames) {
        f.state = 'ATTACKING';
        f.stateFrame = 0;
      }
      break;
    }
    case 'ATTACKING': {
      if (!f.currentAttack) { f.state = 'IDLE'; break; }
      const fd = f.currentAttack.frameData;
      if (f.stateFrame >= fd.activeFrames) {
        f.state = 'POST_ATTACK';
        f.stateFrame = 0;
      }
      break;
    }
    case 'POST_ATTACK': {
      if (!f.currentAttack) { f.state = 'IDLE'; break; }
      const recovFrames = f.currentAttack.frameData.recoveryFrames;
      if (f.stateFrame >= recovFrames) {
        f.state = 'IDLE';
        f.currentAttack = undefined;
        f.stateFrame = 0;
      }
      break;
    }
    case 'BLOCK_HIGH':
    case 'BLOCK_LOW': {
      f = processBlockState(f, _held, inputBuf, frame);
      break;
    }
    case 'HIT_STUN': {
      f.hitStunTimer--;
      if (f.hitStunTimer <= 0) {
        f.state = 'IDLE';
        f.stateFrame = 0;
        f.comboCount = 0;
      }
      // Apply gravity if airborne
      if (!f.physics.grounded) {
        f.physics = applyPhysics(f.physics);
        if (f.physics.grounded) {
          f.state = 'KNOCKDOWN';
          f.knockdownTimer = 55;
        }
      }
      break;
    }
    case 'KNOCKDOWN': {
      f.knockdownTimer--;
      if (!f.physics.grounded) {
        f.physics = applyPhysics(f.physics);
      }
      if (f.knockdownTimer <= 0 && f.physics.grounded) {
        f.state = 'WAKE_UP';
        f.wakeUpTimer = 30;
        f.stateFrame = 0;
      }
      break;
    }
    case 'WAKE_UP': {
      f.wakeUpTimer--;
      if (f.wakeUpTimer <= 0) {
        f.state = 'IDLE';
        f.stateFrame = 0;
        f.meter = { ...f.meter, guardGauge: Math.min(GUARD_GAUGE_MAX, f.meter.guardGauge + 20) };
      }
      break;
    }
    case 'GUARD_CRUSH': {
      f.meter.guardCrushTimer--;
      if (f.meter.guardCrushTimer <= 0) {
        f.state = 'IDLE';
        f.stateFrame = 0;
        f.meter = { ...f.meter, guardCrushed: false, guardGauge: GUARD_GAUGE_MAX * 0.3 };
      }
      break;
    }
    case 'SUPER_FREEZE': {
      // Handled by game manager
      break;
    }
    default: break;
  }

  // Update projectiles
  f.projectiles = f.projectiles
    .map(updateProjectile)
    .filter(p => p.active);

  return { fighter: f, newProjectiles, particles };
}

// ── Process Idle Input ────────────────────────────────────
function processIdleInput(
  f: ActiveFighter,
  h: HeldKeysState,
  buf: InputBuffer,
  _opponent: ActiveFighter,
  frame: number,
  newProjectiles: ActiveProjectile[]
): ActiveFighter {
  // Check for attack inputs first (highest priority)
  const afterAttack = checkAttackInput(f, h, buf, _opponent, frame, newProjectiles);
  if (afterAttack) return afterAttack;

  // Directional inputs
  const dir = buf.getCurrentDir();
  const isCrouching = h.down && !h.up;

  if (isCrouching && f.physics.grounded) {
    f.state = 'CROUCH';
    // Check blocking low
    const facingRight = f.physics.facingRight;
    const isBackward = facingRight ? h.left : h.right;
    const isForwardToOpp = facingRight ? h.right : h.left;
    if (isBackward && !isForwardToOpp) {
      f.state = 'BLOCK_LOW';
      f.blockingLow = true;
      f.blockingHigh = false;
    } else {
      f.blockingLow = false;
    }
    return f;
  }

  f.blockingLow = false;
  f.blockingHigh = false;

  // Block (holding back)
  const facingRight = f.physics.facingRight;
  const holdingBack = facingRight ? h.left : h.right;
  const holdingFwd = facingRight ? h.right : h.left;

  if (holdingBack && !holdingFwd && f.physics.grounded) {
    f.state = 'BLOCK_HIGH';
    f.blockingHigh = true;
    return f;
  }

  // Jump
  if ((h.up || dir === 7 || dir === 8 || dir === 9) && f.physics.grounded) {
    const jumpDir = dir === 9 ? 'FORWARD' : dir === 7 ? 'BACK' : 'NEUTRAL';
    f.physics = initiateJump(f.physics, jumpDir, facingRight);
    f.state = dir === 9 ? 'JUMP_FORWARD' : dir === 7 ? 'JUMP_BACK' : 'JUMP';
    f.stateFrame = 0;
    return f;
  }

  // Walk
  if (holdingFwd && !h.down) {
    f.state = 'WALK_FORWARD';
  } else if (holdingBack && f.physics.grounded) {
    f.state = 'WALK_BACK';
  } else {
    f.state = 'IDLE';
  }

  return f;
}

// ── Check Attack Input ────────────────────────────────────
function checkAttackInput(
  f: ActiveFighter,
  _hIgnored: HeldKeysState,
  buf: InputBuffer,
  _opponent: ActiveFighter,
  frame: number,
  newProjectiles: ActiveProjectile[]
): ActiveFighter | null {
  const charId = f.definition.id;

  // ── SDM (Super Desperation Moves — 1 meter stock) ─────
  if (f.meter.powerStocks >= 1) {
    const sdmMove = f.definition.moves.find(m => m.type === 'SDM');
    if (sdmMove) {
      let sdmTriggered = false;
      if (charId === 'penitent' && buf.checkQCFx2(['LP', 'MP', 'HP'], frame)) sdmTriggered = true;
      if (charId === 'martyr' && buf.checkHCBx2(['LP', 'MP', 'HP'], frame)) sdmTriggered = true;
      if (charId === 'oracle' && buf.checkQCBx2(['LP', 'MP', 'HP'], frame)) sdmTriggered = true;
      if (charId === 'seraph' && buf.checkQCFx2(['LK', 'MK', 'HK'], frame)) sdmTriggered = true;
      if (charId === 'inquisitor' && buf.checkQCFHCB(['LP', 'MP', 'HP'], frame)) sdmTriggered = true;

      if (sdmTriggered) {
        f.meter.powerStocks--;
        return startAttack(f, sdmMove, newProjectiles);
      }
    }
  }

  // ── Specials ──────────────────────────────────────────
  // Special B (Anti-air, QCB)
  const specialB = f.definition.moves.find(m => m.id.endsWith('_special_b'));
  if (specialB) {
    const btn = buf.checkQCB(['LP', 'MP', 'HP', 'LK', 'MK', 'HK'], frame);
    if (btn) return startAttack(f, specialB, newProjectiles);
  }

  // Special A (Zoning, QCF+P)
  const specialA = f.definition.moves.find(m => m.id.endsWith('_special_a'));
  if (specialA) {
    const btn = buf.checkQCF(['LP', 'MP', 'HP'], frame);
    if (btn) return startAttack(f, specialA, newProjectiles);
  }

  // Special C (Pressure/Grab)
  const specialC = f.definition.moves.find(m => m.id.endsWith('_special_c'));
  if (specialC) {
    let triggered = false;
    if (charId === 'martyr' && buf.checkHCB(['LP', 'MP', 'HP'], frame)) triggered = true;
    if (charId === 'oracle' && buf.checkHCF(['LK', 'MK', 'HK'], frame)) triggered = true;
    if (charId === 'penitent' && buf.checkQCF(['LK', 'MK', 'HK'], frame)) triggered = true;
    if (charId === 'seraph' && buf.checkQCF(['LK', 'MK', 'HK'], frame)) triggered = true;
    if (charId === 'inquisitor' && buf.checkQCF(['LP', 'MP', 'HP'], frame)) triggered = true;
    if (triggered) return startAttack(f, specialC, newProjectiles);
  }

  // ── Normals ───────────────────────────────────────────
  if (buf.checkButton('HP', frame)) return startNormal(f, 'hp', newProjectiles);
  if (buf.checkButton('HK', frame)) return startNormal(f, 'hk', newProjectiles);
  if (buf.checkButton('MP', frame)) return startNormal(f, 'mp', newProjectiles);
  if (buf.checkButton('MK', frame)) return startNormal(f, 'mk', newProjectiles);
  if (buf.checkButton('LP', frame)) return startNormal(f, 'lp', newProjectiles);
  if (buf.checkButton('LK', frame)) return startNormal(f, 'lk', newProjectiles);

  return null;
}

// ── Block State Processing ────────────────────────────────
function processBlockState(
  f: ActiveFighter,
  held: HeldKeysState,
  _buf: InputBuffer,
  _frame: number
): ActiveFighter {
  const facingRight = f.physics.facingRight;
  const holdingBack = facingRight ? held.left : held.right;

  if (!holdingBack) {
    f.state = 'IDLE';
    f.blockingHigh = false;
    f.blockingLow = false;
    return f;
  }

  // Switch between high/low block
  if (held.down) {
    f.state = 'BLOCK_LOW';
    f.blockingLow = true;
    f.blockingHigh = false;
  } else {
    f.state = 'BLOCK_HIGH';
    f.blockingHigh = true;
    f.blockingLow = false;
  }

  return f;
}

// ── Start Attack Helpers ──────────────────────────────────
function startAttack(
  f: ActiveFighter,
  move: Move,
  newProjectiles: ActiveProjectile[]
): ActiveFighter {
  // Block during most states
  if (!['IDLE', 'WALK_FORWARD', 'WALK_BACK', 'CROUCH',
        'JUMP', 'JUMP_FORWARD', 'JUMP_BACK',
        'POST_ATTACK'].includes(f.state)) {
    return f;
  }

  f.currentAttack = move;
  f.state = 'PRE_ATTACK';
  f.stateFrame = 0;

  // If it's a projectile special, spawn it after startup
  if (move.frameData.hitboxes[0]?.type === 'PROJECTILE') {
    newProjectiles.push({
      id: `proj_${Date.now()}_${Math.random()}`,
      ownerId: f.definition.id,
      x: f.physics.facingRight ? f.physics.x + 35 : f.physics.x - 35,
      y: f.physics.y - 55,
      vx: f.physics.facingRight ? 3.8 : -3.8,
      vy: 0,
      hitboxData: move.frameData.hitboxes[0],
      sprite: move.id,
      lifeFrames: 120,
      currentFrame: 0,
      active: true,
    });
  }

  return f;
}

function startNormal(
  f: ActiveFighter,
  suffix: string,
  newProjectiles: ActiveProjectile[]
): ActiveFighter {
  const prefixMap: Record<string, string> = {
    penitent: 'p1',
    martyr: 'mb',
    oracle: 'wo',
    seraph: 'sa',
    inquisitor: 'iq',
  };
  const prefix = prefixMap[f.definition.id] || f.definition.id;
  const move = f.definition.moves.find(m => m.id === `${prefix}_${suffix}`);
  if (!move) return f;
  return startAttack(f, move, newProjectiles);
}
