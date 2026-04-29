// ============================================================
// SACRILEGIUM PUGNA — PHYSICS & COLLISION SYSTEM
// ============================================================

import type { ActiveFighter, FighterPhysics, Rect, HitboxData, ActiveProjectile } from './types';
import { GRAVITY, GROUND_Y, STAGE_LEFT, STAGE_RIGHT, JUMP_FORCE, FIGHTER_PUSH_DISTANCE } from './constants';

// ── Resolve world-space rect from fighter-relative rect ──
export function worldRect(r: Rect, fighter: FighterPhysics, facingRight: boolean): Rect {
  const x = facingRight
    ? fighter.x + r.x
    : fighter.x - r.x - r.w;
  return { x, y: fighter.y + r.y, w: r.w, h: r.h };
}

// ── AABB Overlap Check ────────────────────────────────────
export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// ── Get Fighter Hurtbox ───────────────────────────────────
// Returns the character's current hurtbox in world space
export function getFighterHurtbox(f: ActiveFighter): Rect {
  // Crouching fighters have reduced hurtbox
  const isCrouching = f.state === 'CROUCH' || f.state === 'BLOCK_LOW';
  const height = isCrouching ? 55 : 90;
  const yOffset = isCrouching ? -55 : -90;
  return {
    x: f.physics.x - 20,
    y: f.physics.y + yOffset,
    w: 45,
    h: height,
  };
}

// ── Get Fighter Push Box ──────────────────────────────────
export function getFighterPushbox(f: ActiveFighter): Rect {
  return {
    x: f.physics.x - 18,
    y: f.physics.y - 85,
    w: 36,
    h: 85,
  };
}

// ── Apply Gravity & Jump Physics ──────────────────────────
export function applyPhysics(phys: FighterPhysics, dt: number = 1): FighterPhysics {
  let { x, y, vx, vy, grounded } = phys;

  if (!grounded) {
    vy += GRAVITY * dt;
    y += vy * dt;
    x += vx * dt;

    if (y >= GROUND_Y) {
      y = GROUND_Y;
      vy = 0;
      vx = 0;
      grounded = true;
    }
  }

  // Stage boundaries
  x = Math.max(STAGE_LEFT + 18, Math.min(STAGE_RIGHT - 18, x));

  return { ...phys, x, y, vx, vy, grounded };
}

// ── Push Fighters Apart (prevent overlap) ─────────────────
export function resolvePush(p1: FighterPhysics, p2: FighterPhysics): [FighterPhysics, FighterPhysics] {
  const pb1 = { x: p1.x - 18, y: p1.y - 85, w: 36, h: 85 };
  const pb2 = { x: p2.x - 18, y: p2.y - 85, w: 36, h: 85 };

  if (!rectsOverlap(pb1, pb2)) return [p1, p2];

  const mid = (p1.x + p2.x) / 2;
  const half = FIGHTER_PUSH_DISTANCE / 2;

  let nx1 = p1.x < p2.x ? mid - half : mid + half;
  let nx2 = p2.x < p1.x ? mid - half : mid + half;

  nx1 = Math.max(STAGE_LEFT + 18, Math.min(STAGE_RIGHT - 18, nx1));
  nx2 = Math.max(STAGE_LEFT + 18, Math.min(STAGE_RIGHT - 18, nx2));

  return [{ ...p1, x: nx1 }, { ...p2, x: nx2 }];
}

// ── Initiate Jump ─────────────────────────────────────────
export function initiateJump(
  phys: FighterPhysics,
  dir: 'NEUTRAL' | 'FORWARD' | 'BACK',
  facingRight: boolean
): FighterPhysics {
  const hSpeed = dir === 'NEUTRAL' ? 0
    : dir === 'FORWARD' ? (facingRight ? 3.5 : -3.5)
    : (facingRight ? -2.8 : 2.8);

  return {
    ...phys,
    vy: JUMP_FORCE,
    vx: hSpeed,
    grounded: false,
  };
}

// ── Apply Knockback/Pushback ───────────────────────────────
export function applyPushback(
  defender: FighterPhysics,
  attacker: FighterPhysics,
  pushback: number
): FighterPhysics {
  const dir = defender.x > attacker.x ? 1 : -1;
  const newX = Math.max(STAGE_LEFT + 18, Math.min(STAGE_RIGHT - 18,
    defender.x + dir * pushback
  ));
  return { ...defender, x: newX };
}

// ── Projectile Physics ────────────────────────────────────
export function updateProjectile(proj: ActiveProjectile): ActiveProjectile {
  return {
    ...proj,
    x: proj.x + proj.vx,
    y: proj.y + proj.vy,
    currentFrame: proj.currentFrame + 1,
    active: proj.currentFrame < proj.lifeFrames &&
            proj.x > STAGE_LEFT - 50 &&
            proj.x < STAGE_RIGHT + 50,
  };
}

// ── Check Projectile-Fighter Collision ────────────────────
export function checkProjectileHit(
  proj: ActiveProjectile,
  fighter: ActiveFighter
): { hit: boolean; hitboxData: HitboxData | null } {
  if (!proj.active) return { hit: false, hitboxData: null };

  const projRect: Rect = { x: proj.x, y: proj.y - 20, w: proj.hitboxData.rect.w, h: proj.hitboxData.rect.h };
  const hurtbox = getFighterHurtbox(fighter);

  if (rectsOverlap(projRect, hurtbox)) {
    return { hit: true, hitboxData: proj.hitboxData };
  }
  return { hit: false, hitboxData: null };
}
