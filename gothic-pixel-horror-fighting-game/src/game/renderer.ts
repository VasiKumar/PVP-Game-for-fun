// ============================================================
// SACRILEGIUM PUGNA — CANVAS 2D RENDERER
// Gothic Pixel Art Fighter Renderer
// ============================================================

import type { GameState, ActiveFighter, ActiveProjectile, Particle, HitSpark } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, PALETTE } from './constants';

// ── Pixel Art Helper: Draw with pixelated crisp edges ────
function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

// ── Draw a pixelated circle (blocky pixel art style) ──────
function pixelCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color;
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      if (x * x + y * y <= r * r) {
        ctx.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1);
      }
    }
  }
}

// ── Stage Background Renderer ─────────────────────────────
function renderStage(ctx: CanvasRenderingContext2D, frame: number) {
  // Sky gradient — deep void
  const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  skyGrad.addColorStop(0, '#060210');
  skyGrad.addColorStop(0.4, '#0d0818');
  skyGrad.addColorStop(0.7, '#180a14');
  skyGrad.addColorStop(1, '#0a0608');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Stained glass arch windows (background)
  renderStainedGlassWindows(ctx, frame);

  // Columns
  renderColumns(ctx);

  // Floor / Ground
  renderFloor(ctx);

  // Candles (animated)
  renderCandles(ctx, frame);

  // Blood pool on ground
  renderBloodPool(ctx, frame);

  // Atmospheric fog layer
  renderFog(ctx, frame);
}

function renderStainedGlassWindows(ctx: CanvasRenderingContext2D, frame: number) {
  const windows = [
    { x: 80, w: 90, h: 180 },
    { x: 280, w: 70, h: 150 },
    { x: CANVAS_WIDTH - 170, w: 70, h: 150 },
    { x: CANVAS_WIDTH - 340, w: 90, h: 180 },
  ];

  windows.forEach((win, i) => {
    const flicker = 0.6 + 0.4 * Math.sin(frame * 0.02 + i * 1.3);

    // Window arch frame
    ctx.fillStyle = '#1a0808';
    ctx.fillRect(win.x, 30, win.w, win.h);

    // Stained glass panels
    const panels = [
      { c: `rgba(120,20,20,${0.6 * flicker})`, dx: 0, dy: 0, w: win.w / 2, h: win.h / 3 },
      { c: `rgba(80,10,60,${0.5 * flicker})`, dx: win.w / 2, dy: 0, w: win.w / 2, h: win.h / 3 },
      { c: `rgba(20,20,100,${0.6 * flicker})`, dx: 0, dy: win.h / 3, w: win.w, h: win.h / 3 },
      { c: `rgba(100,60,10,${0.5 * flicker})`, dx: 0, dy: (win.h * 2) / 3, w: win.w / 2, h: win.h / 3 },
      { c: `rgba(60,10,10,${0.6 * flicker})`, dx: win.w / 2, dy: (win.h * 2) / 3, w: win.w / 2, h: win.h / 3 },
    ];

    panels.forEach(p => {
      ctx.fillStyle = p.c;
      ctx.fillRect(win.x + p.dx + 3, 33 + p.dy, p.w - 3, p.h - 2);
    });

    // Lead frame lines
    ctx.fillStyle = '#0a0408';
    ctx.fillRect(win.x + win.w / 2 - 1, 30, 2, win.h);
    ctx.fillRect(win.x, 30 + win.h / 3 - 1, win.w, 2);
    ctx.fillRect(win.x, 30 + (win.h * 2) / 3 - 1, win.w, 2);

    // Cross motif glow
    const glowAlpha = 0.15 * flicker;
    ctx.fillStyle = `rgba(200,150,50,${glowAlpha})`;
    ctx.fillRect(win.x + win.w / 2 - 4, 50, 8, win.h * 0.6);
    ctx.fillRect(win.x + win.w * 0.2, 80, win.w * 0.6, 8);
  });
}

function renderColumns(ctx: CanvasRenderingContext2D) {
  const colPositions = [50, 200, CANVAS_WIDTH - 200, CANVAS_WIDTH - 50];

  colPositions.forEach(cx => {
    // Column body
    const grad = ctx.createLinearGradient(cx - 18, 0, cx + 18, 0);
    grad.addColorStop(0, '#1a1420');
    grad.addColorStop(0.3, '#2a2030');
    grad.addColorStop(0.7, '#221828');
    grad.addColorStop(1, '#100c14');
    ctx.fillStyle = grad;
    ctx.fillRect(cx - 18, 0, 36, GROUND_Y + 40);

    // Column capital
    ctx.fillStyle = '#2a2232';
    ctx.fillRect(cx - 22, 40, 44, 20);

    // Stone texture lines
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    for (let y = 60; y < GROUND_Y; y += 25) {
      ctx.fillRect(cx - 17, y, 34, 1);
    }

    // Gargoyle on capital (blocky pixel art)
    renderGargoyle(ctx, cx, 38);
  });
}

function renderGargoyle(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Simple blocky gargoyle head
  ctx.fillStyle = '#1a1428';
  px(ctx, x - 6, y - 12, 12, 10, '#1e1830');
  px(ctx, x - 3, y - 15, 6, 4, '#1a1428');
  px(ctx, x - 8, y - 8, 3, 3, '#2a2040'); // left eye socket
  px(ctx, x + 5, y - 8, 3, 3, '#2a2040');
  px(ctx, x - 2, y - 3, 4, 3, '#0a0810'); // maw
  // Horns
  px(ctx, x - 7, y - 18, 2, 7, '#141020');
  px(ctx, x + 5, y - 18, 2, 7, '#141020');
}

function renderFloor(ctx: CanvasRenderingContext2D) {
  // Stone floor tiles
  const floorGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
  floorGrad.addColorStop(0, '#201820');
  floorGrad.addColorStop(0.3, '#181018');
  floorGrad.addColorStop(1, '#100c10');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

  // Tile grid
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  for (let tx = 0; tx < CANVAS_WIDTH; tx += 60) {
    ctx.fillRect(tx, GROUND_Y, 1, CANVAS_HEIGHT - GROUND_Y);
  }
  for (let ty = GROUND_Y; ty < CANVAS_HEIGHT; ty += 40) {
    ctx.fillRect(0, ty, CANVAS_WIDTH, 1);
  }

  // Floor edge highlight
  const edgeGrad = ctx.createLinearGradient(0, GROUND_Y - 4, 0, GROUND_Y + 6);
  edgeGrad.addColorStop(0, 'rgba(80,50,30,0.6)');
  edgeGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, GROUND_Y - 4, CANVAS_WIDTH, 10);
}

function renderCandles(ctx: CanvasRenderingContext2D, frame: number) {
  const candles = [
    { x: 140, y: GROUND_Y - 5 },
    { x: CANVAS_WIDTH / 2 - 80, y: GROUND_Y - 5 },
    { x: CANVAS_WIDTH / 2 + 80, y: GROUND_Y - 5 },
    { x: CANVAS_WIDTH - 140, y: GROUND_Y - 5 },
  ];

  candles.forEach((c, i) => {
    const flicker = 0.7 + 0.3 * Math.sin(frame * 0.08 + i * 0.9);
    const flickerX = Math.sin(frame * 0.12 + i * 2.1) * 2;

    // Candle wax
    px(ctx, c.x - 3, c.y - 22, 6, 22, '#c8c0b0');
    px(ctx, c.x - 4, c.y - 24, 8, 4, '#d4c8b8');

    // Wick
    px(ctx, c.x, c.y - 26, 1, 4, '#302020');

    // Flame glow
    const glowRadius = Math.round(12 * flicker);
    const gx = ctx.createRadialGradient(
      c.x + flickerX, c.y - 30, 0,
      c.x, c.y - 26, glowRadius
    );
    gx.addColorStop(0, `rgba(255,200,50,${0.8 * flicker})`);
    gx.addColorStop(0.4, `rgba(200,100,20,${0.4 * flicker})`);
    gx.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gx;
    ctx.fillRect(c.x - glowRadius, c.y - 30 - glowRadius, glowRadius * 2, glowRadius * 2);

    // Flame body
    px(ctx, c.x - 2 + Math.round(flickerX), c.y - 32, 4, 6, `rgba(255,180,20,${flicker})`);
    px(ctx, c.x - 1 + Math.round(flickerX), c.y - 35, 2, 4, `rgba(255,220,80,${flicker})`);
    px(ctx, c.x + Math.round(flickerX), c.y - 37, 1, 3, `rgba(255,255,200,${flicker})`);
  });
}

function renderBloodPool(ctx: CanvasRenderingContext2D, frame: number) {
  // Blood pool in the center
  const cx = CANVAS_WIDTH / 2;
  const pulse = 0.9 + 0.1 * Math.sin(frame * 0.03);
  const grad = ctx.createRadialGradient(cx, GROUND_Y + 5, 0, cx, GROUND_Y + 5, 80 * pulse);
  grad.addColorStop(0, 'rgba(150,20,20,0.35)');
  grad.addColorStop(0.5, 'rgba(80,10,10,0.2)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(cx - 80, GROUND_Y, 160, 15);
}

function renderFog(ctx: CanvasRenderingContext2D, frame: number) {
  // Bottom atmospheric fog
  const fogGrad = ctx.createLinearGradient(0, GROUND_Y - 30, 0, GROUND_Y + 20);
  fogGrad.addColorStop(0, 'rgba(0,0,0,0)');
  fogGrad.addColorStop(0.5, 'rgba(15,5,20,0.15)');
  fogGrad.addColorStop(1, 'rgba(15,5,20,0.35)');
  ctx.fillStyle = fogGrad;
  ctx.fillRect(0, GROUND_Y - 30, CANVAS_WIDTH, 50);

  // Scrolling fog wisps
  const fogOffset = (frame * 0.3) % CANVAS_WIDTH;
  ctx.fillStyle = 'rgba(20,10,30,0.08)';
  ctx.fillRect(fogOffset - CANVAS_WIDTH, GROUND_Y - 15, CANVAS_WIDTH * 2, 20);
}

// ── Character Renderer ─────────────────────────────────────
function renderFighter(ctx: CanvasRenderingContext2D, f: ActiveFighter, frame: number) {
  const { x, y, facingRight } = f.physics;
  const config = f.definition.spriteConfig;
  const state = f.state;
  const sf = f.stateFrame;

  ctx.save();
  if (!facingRight) {
    ctx.scale(-1, 1);
    ctx.translate(-2 * x, 0);
  }

  // Shadow
  const shadowAlpha = f.physics.grounded ? 0.4 : 0.2;
  const shadowWidth = f.physics.grounded ? 40 : 25;
  const shadowGrad = ctx.createRadialGradient(x, y + 2, 0, x, y + 2, shadowWidth);
  shadowGrad.addColorStop(0, `rgba(0,0,0,${shadowAlpha})`);
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadowGrad;
  ctx.fillRect(x - shadowWidth, y - 3, shadowWidth * 2, 10);

  // Draw character based on ID and state
  switch (f.definition.id) {
    case 'penitent': drawPenitent(ctx, x, y, sf, state, config, frame); break;
    case 'martyr': drawMartyr(ctx, x, y, sf, state, config, frame); break;
    case 'oracle': drawOracle(ctx, x, y, sf, state, config, frame); break;
    case 'seraph': drawSeraph(ctx, x, y, sf, state, config, frame); break;
    case 'inquisitor': drawInquisitor(ctx, x, y, sf, state, config, frame); break;
  }

  // Hit flash
  if (state === 'HIT_STUN' && sf % 4 < 2) {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 25, y - 90, 50, 90);
    ctx.globalAlpha = 1.0;
  }

  // Super freeze flash
  if (state === 'PRE_ATTACK' && f.currentAttack?.type === 'SDM' && sf < 8) {
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 30, y - 100, 60, 100);
    ctx.globalAlpha = 1.0;
  }

  ctx.restore();

  // Guard crush indicator
  if (f.meter.guardCrushed) {
    ctx.save();
    const crushAlpha = 0.5 + 0.5 * Math.sin(frame * 0.3);
    ctx.fillStyle = `rgba(100,200,255,${crushAlpha})`;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GUARD CRUSH!', x, y - 100);
    ctx.restore();
  }

  // Combo counter
  if (f.comboCount >= 2) {
    ctx.save();
    ctx.fillStyle = '#e8c040';
    ctx.font = `bold ${10 + f.comboCount}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`${f.comboCount} HITS`, x, y - 110);
    ctx.restore();
  }
}

// ── Character-Specific Pixel Art Drawings ─────────────────

function drawPenitent(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  sf: number, state: string, cfg: { bodyColor: string; armorColor: string; weaponColor: string; eyeColor: string; effectColor: string },
  frame: number
) {
  // Breathing / idle bob
  const bob = state === 'IDLE' ? Math.sin(frame * 0.06) * 2 : 0;
  const oy = y + bob;

  // Legs
  const legPhase = state === 'WALK_FORWARD' || state === 'WALK_BACK' ? sf : 0;
  const lLeg = Math.sin(legPhase * 0.4) * 5;
  const rLeg = -lLeg;

  px(ctx, x - 12, oy - 30 + lLeg, 10, 30, cfg.armorColor);
  px(ctx, x + 2, oy - 30 + rLeg, 10, 30, cfg.armorColor);

  // Boot
  px(ctx, x - 14, oy - 4 + lLeg, 14, 6, '#2a1810');
  px(ctx, x, oy - 4 + rLeg, 14, 6, '#2a1810');

  // Torso / armor
  const torsoY = oy - 65;
  px(ctx, x - 16, torsoY, 32, 35, cfg.armorColor);
  // Chest detail — cross motif
  px(ctx, x - 1, torsoY + 5, 2, 15, cfg.effectColor);
  px(ctx, x - 6, torsoY + 10, 12, 2, cfg.effectColor);

  // Arms
  const atkSwing = state === 'ATTACKING' ? Math.min(sf * 8, 30) : 0;
  px(ctx, x - 22, torsoY + 5, 8, 20, cfg.armorColor);
  px(ctx, x + 14, torsoY + 5 - atkSwing, 8, 20, cfg.armorColor);

  // Capirote (conical helmet)
  const helmetTip = state === 'CROUCH' ? -2 : 0;
  // Cone shape — multiple layers
  px(ctx, x - 2, torsoY - 50 + helmetTip, 4, 10, cfg.armorColor);
  px(ctx, x - 5, torsoY - 40 + helmetTip, 10, 10, cfg.armorColor);
  px(ctx, x - 8, torsoY - 30 + helmetTip, 16, 10, cfg.armorColor);
  px(ctx, x - 10, torsoY - 20 + helmetTip, 20, 12, cfg.armorColor);
  // Eye slit
  px(ctx, x - 6, torsoY - 22 + helmetTip, 12, 3, cfg.eyeColor);
  // Helmet rim
  px(ctx, x - 12, torsoY - 8, 24, 4, '#4a3830');

  // Mea Culpa sword
  const swingAngle = state === 'ATTACKING' ? -atkSwing : 0;
  const swordX = x + 22;
  const swordY = torsoY + 8 + swingAngle;
  // Blade
  px(ctx, swordX, swordY, 4, 40, cfg.weaponColor);
  px(ctx, swordX + 1, swordY - 15, 2, 20, '#a08080'); // sharp edge
  // Crossguard
  px(ctx, swordX - 5, swordY + 5, 14, 4, '#6a4040');
  // Barbs
  for (let bi = 0; bi < 4; bi++) {
    px(ctx, swordX + 4, swordY + 8 + bi * 8, 5, 2, '#8a2020');
    px(ctx, swordX - 3, swordY + 12 + bi * 8, 5, 2, '#8a2020');
  }

  // Blood drips
  if (state === 'ATTACKING' && sf > 3) {
    ctx.fillStyle = '#cc2222';
    ctx.fillRect(swordX + 2, swordY + 35, 2, 8);
    ctx.fillRect(swordX + 1, swordY + 30, 1, 5);
  }
}

function drawMartyr(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  sf: number, state: string, cfg: { bodyColor: string; armorColor: string; weaponColor: string; eyeColor: string; effectColor: string },
  frame: number
) {
  const bob = state === 'IDLE' ? Math.sin(frame * 0.05) * 1.5 : 0;
  const oy = y + bob;

  // Massive body — hunchback
  px(ctx, x - 22, oy - 80, 44, 80, cfg.bodyColor);
  // Hunch
  px(ctx, x - 10, oy - 95, 35, 20, cfg.bodyColor);
  // Monk habit shreds
  px(ctx, x - 24, oy - 75, 6, 60, '#2a1808');
  px(ctx, x + 18, oy - 70, 8, 55, '#2a1808');

  // Head (deformed)
  px(ctx, x - 14, oy - 100, 28, 22, '#3a2010');
  px(ctx, x - 10, oy - 108, 20, 10, '#3a2010');

  // Eyes (glowing red)
  px(ctx, x - 8, oy - 100, 5, 4, cfg.eyeColor);
  px(ctx, x + 3, oy - 100, 5, 4, cfg.eyeColor);

  // Thorny chains fused into body
  const chainSwing = state === 'ATTACKING' ? sf * 4 : 0;
  const chainPositions = [
    { ox: -18, oy2: -60 },
    { ox: -10, oy2: -40 },
    { ox: 15, oy2: -50 },
    { ox: 20, oy2: -30 },
  ];
  chainPositions.forEach(cp => {
    ctx.fillStyle = cfg.weaponColor;
    ctx.fillRect(x + cp.ox, oy + cp.oy2, 3, 20 + chainSwing);
    // Thorns
    for (let t = 0; t < 3; t++) {
      ctx.fillStyle = '#2a3a1a';
      ctx.fillRect(x + cp.ox - 3, oy + cp.oy2 + t * 6, 9, 2);
    }
  });

  // Flesh wounds
  ctx.fillStyle = cfg.effectColor;
  ctx.fillRect(x - 5, oy - 70, 10, 3);
  ctx.fillRect(x + 8, oy - 55, 8, 2);
  ctx.fillRect(x - 15, oy - 45, 6, 4);

  // Legs (massive, stumping)
  const legPhase = state === 'WALK_FORWARD' ? sf : 0;
  px(ctx, x - 18, oy - 28 + Math.sin(legPhase * 0.3) * 4, 16, 28, cfg.bodyColor);
  px(ctx, x + 2, oy - 28 - Math.sin(legPhase * 0.3) * 4, 16, 28, cfg.bodyColor);
}

function drawOracle(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  sf: number, state: string, cfg: { bodyColor: string; armorColor: string; weaponColor: string; eyeColor: string; effectColor: string },
  frame: number
) {
  // Floating offset
  const floatY = Math.sin(frame * 0.07) * 5;
  const oy = y - 15 + floatY;

  // Robes (flowing)
  const robeSway = Math.sin(frame * 0.05) * 3;
  px(ctx, x - 15 + robeSway, oy - 20, 30, 25, cfg.armorColor);
  // Robe lower flowing part
  for (let r = 0; r < 5; r++) {
    const rw = 22 - r * 2;
    const rx = x - rw / 2 + robeSway * (1 - r * 0.1);
    px(ctx, rx, oy - 20 + r * 6, rw, 7, r % 2 === 0 ? cfg.armorColor : cfg.bodyColor);
  }
  // Robes trail
  px(ctx, x - 8 + robeSway * 0.5, oy + 15, 16, 20, cfg.bodyColor);

  // Torso
  px(ctx, x - 12, oy - 60, 24, 40, cfg.armorColor);
  // Religious embroidery
  px(ctx, x - 1, oy - 55, 2, 12, cfg.effectColor);
  px(ctx, x - 5, oy - 50, 10, 2, cfg.effectColor);

  // Head (eyeless, weeping)
  px(ctx, x - 10, oy - 85, 20, 25, '#d4c8b0');
  px(ctx, x - 7, oy - 90, 14, 8, '#c8bca8');
  // Hollow eye sockets — no eyes
  px(ctx, x - 8, oy - 82, 6, 5, '#1a0a0a');
  px(ctx, x + 2, oy - 82, 6, 5, '#1a0a0a');
  // Blood tears
  ctx.fillStyle = cfg.eyeColor;
  ctx.fillRect(x - 5, oy - 77, 2, 10);
  ctx.fillRect(x + 5, oy - 77, 2, 10);
  // Veil / hood
  px(ctx, x - 12, oy - 90, 24, 10, cfg.armorColor);

  // Orbiting bleeding icons (3 of them)
  const orbitRadius = 35;
  for (let i = 0; i < 3; i++) {
    const angle = frame * 0.04 + (i * Math.PI * 2) / 3;
    const ix = x + Math.cos(angle) * orbitRadius;
    const iy = (oy - 50) + Math.sin(angle) * 15;
    const iconSize = 8 + Math.sin(frame * 0.1 + i) * 2;

    ctx.fillStyle = cfg.effectColor;
    ctx.fillRect(ix - iconSize / 2, iy - iconSize / 2, iconSize, iconSize);
    // Cross on icon
    ctx.fillStyle = cfg.weaponColor;
    ctx.fillRect(ix - 1, iy - iconSize / 2 + 1, 2, iconSize - 2);
    ctx.fillRect(ix - iconSize / 2 + 1, iy - 1, iconSize - 2, 2);
    // Blood drip from icon
    ctx.fillStyle = '#aa1a1a';
    ctx.fillRect(ix, iy + iconSize / 2, 1, 5);
  }

  // Arms (reaching forward when attacking)
  const armExtend = state === 'ATTACKING' ? Math.min(sf * 3, 20) : 0;
  px(ctx, x - 22, oy - 58, 10, 18, cfg.armorColor);
  px(ctx, x + 12 + armExtend, oy - 58, 10, 18, cfg.armorColor);
}

function drawSeraph(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  sf: number, state: string, cfg: { bodyColor: string; armorColor: string; weaponColor: string; eyeColor: string; effectColor: string },
  frame: number
) {
  const bob = Math.sin(frame * 0.08) * 2;
  const oy = y + bob;

  // Skeletal wings
  const wingSpread = state === 'JUMP' ? 1.4 : state === 'ATTACKING' ? 1.2 : 1.0;
  const wingFlap = state === 'JUMP' ? Math.sin(frame * 0.2) * 8 : 0;

  // Left wing
  const leftWingPoints = [
    { x: x - 15, y: oy - 70 },
    { x: x - 15 - 35 * wingSpread, y: oy - 80 + wingFlap },
    { x: x - 15 - 50 * wingSpread, y: oy - 50 },
    { x: x - 15 - 30 * wingSpread, y: oy - 20 },
  ];
  ctx.fillStyle = '#2a3a5a';
  ctx.beginPath();
  ctx.moveTo(leftWingPoints[0].x, leftWingPoints[0].y);
  leftWingPoints.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fill();
  // Wing bone spines
  ctx.strokeStyle = '#1a2a4a';
  ctx.lineWidth = 2;
  leftWingPoints.forEach(p => {
    ctx.beginPath();
    ctx.moveTo(x - 15, oy - 70);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });

  // Right wing
  ctx.fillStyle = '#2a3a5a';
  ctx.beginPath();
  ctx.moveTo(x + 15, oy - 70);
  ctx.lineTo(x + 15 + 35 * wingSpread, oy - 80 + wingFlap);
  ctx.lineTo(x + 15 + 50 * wingSpread, oy - 50);
  ctx.lineTo(x + 15 + 30 * wingSpread, oy - 20);
  ctx.closePath();
  ctx.fill();

  // Torso (angelic but corrupted)
  px(ctx, x - 14, oy - 80, 28, 50, cfg.armorColor);
  // Robe shreds
  px(ctx, x - 16, oy - 40, 6, 40, cfg.bodyColor);
  px(ctx, x + 10, oy - 35, 7, 35, cfg.bodyColor);

  // Head
  px(ctx, x - 9, oy - 95, 18, 18, cfg.armorColor);
  px(ctx, x - 6, oy - 100, 12, 8, '#c0c8d8');
  // Multiple eyes (abomination)
  const eyePositions = [
    { ex: x - 6, ey: oy - 92 }, { ex: x + 2, ey: oy - 92 },
    { ex: x - 3, ey: oy - 86 },
  ];
  eyePositions.forEach(ep => {
    px(ctx, ep.ex, ep.ey, 4, 4, cfg.eyeColor);
  });

  // Extra arms (4 total) holding rusted spears
  const atkAngle = state === 'ATTACKING' ? Math.min(sf * 5, 25) : 0;
  const armConfigs = [
    { ax: x - 22, ay: oy - 72, dir: -1 },
    { ax: x + 14, ay: oy - 72, dir: 1 },
    { ax: x - 20, ay: oy - 55, dir: -1 },
    { ax: x + 12, ay: oy - 55, dir: 1 },
  ];
  armConfigs.forEach((arm, i) => {
    px(ctx, arm.ax, arm.ay, 8, 18, cfg.armorColor);
    // Rusted spear
    const spearLen = 35;
    const spearX = arm.ax + (arm.dir > 0 ? 8 : -spearLen + 8);
    const spearY = arm.ay + (i < 2 ? -atkAngle : atkAngle / 2);
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(spearX, spearY, spearLen * arm.dir > 0 ? spearLen : -spearLen, 3);
    // Spear tip
    ctx.fillStyle = '#4a3830';
    ctx.fillRect(arm.dir > 0 ? spearX + spearLen - 6 : spearX - 6, spearY - 2, 8, 7);
    // Rust
    ctx.fillStyle = 'rgba(100,50,20,0.5)';
    ctx.fillRect(arm.dir > 0 ? spearX + 10 : spearX, spearY, 8, 3);
  });
}

function drawInquisitor(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  sf: number, state: string, cfg: { bodyColor: string; armorColor: string; weaponColor: string; eyeColor: string; effectColor: string },
  frame: number
) {
  const bob = state === 'IDLE' ? Math.sin(frame * 0.06) * 1.5 : 0;
  const oy = y + bob;

  // Legs — sharp dress pants
  const legPhase = state === 'WALK_FORWARD' || state === 'WALK_BACK' ? sf : 0;
  px(ctx, x - 11, oy - 30 + Math.sin(legPhase * 0.4) * 4, 9, 30, '#1a1008');
  px(ctx, x + 2, oy - 30 - Math.sin(legPhase * 0.4) * 4, 9, 30, '#1a1008');
  // Dress shoes
  px(ctx, x - 13, oy - 3 + Math.sin(legPhase * 0.4) * 4, 13, 5, '#100808');
  px(ctx, x, oy - 3 - Math.sin(legPhase * 0.4) * 4, 13, 5, '#100808');

  // Torso — dark suit
  px(ctx, x - 14, oy - 65, 28, 35, cfg.bodyColor);
  // Lapels
  px(ctx, x - 10, oy - 65, 8, 25, '#201408');
  px(ctx, x + 2, oy - 65, 8, 25, '#201408');
  // Gold pin / brooch
  px(ctx, x - 3, oy - 55, 6, 6, cfg.effectColor);
  px(ctx, x - 1, oy - 57, 2, 10, cfg.effectColor);

  // Head — inquisitor mask
  px(ctx, x - 9, oy - 85, 18, 22, '#e8d8b8');
  // Hollow eye slit (single)
  px(ctx, x - 5, oy - 80, 10, 4, cfg.eyeColor);
  // Under the mask — darkness
  px(ctx, x - 4, oy - 79, 8, 3, '#0a0804');
  // Hat / visor
  px(ctx, x - 12, oy - 88, 24, 6, cfg.bodyColor);
  px(ctx, x - 10, oy - 92, 20, 8, cfg.bodyColor);
  // Hat brim
  px(ctx, x - 14, oy - 87, 28, 3, '#100c08');

  // Arms
  const whipSwing = state === 'ATTACKING' ? Math.min(sf * 6, 40) : 0;
  px(ctx, x - 22, oy - 60, 8, 22, cfg.bodyColor);
  px(ctx, x + 14, oy - 60, 8, 22, cfg.bodyColor);
  // White gloves
  px(ctx, x - 24, oy - 40, 10, 10, '#e8e0d0');
  px(ctx, x + 14, oy - 40, 10, 10, '#e8e0d0');

  // Chain-whip
  const whipX = x + 24 + whipSwing;
  const whipBaseX = x + 18;
  // Chain links
  for (let c = 0; c < 6; c++) {
    const linkX = whipBaseX + c * ((whipX - whipBaseX) / 6);
    const linkY = oy - 38 + Math.sin(c * 0.6 + sf * 0.3) * (c * 2);
    ctx.fillStyle = cfg.weaponColor;
    ctx.fillRect(linkX, linkY, 5, 4);
    // Golden hook tines
    if (c % 2 === 0) {
      ctx.fillStyle = cfg.effectColor;
      ctx.fillRect(linkX + 1, linkY - 3, 3, 3);
    }
  }
  // Whip tip
  ctx.fillStyle = '#aa2a0a';
  ctx.fillRect(whipX - 3, oy - 38 + Math.sin(sf * 0.5) * 6 - 2, 8, 5);
}

// ── Projectile Renderer ───────────────────────────────────
function renderProjectiles(ctx: CanvasRenderingContext2D, projectiles: ActiveProjectile[], frame: number) {
  projectiles.forEach(proj => {
    if (!proj.active) return;

    const pulse = 0.8 + 0.2 * Math.sin(frame * 0.2);

    if (proj.sprite.includes('special_a')) {
      // Thorn/icon projectile
      if (proj.sprite.includes('penitent')) {
        // Crown of thorns ball
        ctx.fillStyle = '#3a2010';
        ctx.fillRect(proj.x - 10, proj.y - 10, 20, 20);
        ctx.fillStyle = `rgba(139,26,26,${pulse})`;
        ctx.fillRect(proj.x - 7, proj.y - 7, 14, 14);
        // Thorn spikes
        for (let s = 0; s < 8; s++) {
          const angle = (s / 8) * Math.PI * 2 + frame * 0.1;
          ctx.fillStyle = '#2a1808';
          ctx.fillRect(
            proj.x + Math.cos(angle) * 10 - 1,
            proj.y + Math.sin(angle) * 10 - 1,
            2, 2
          );
        }
      } else if (proj.sprite.includes('oracle')) {
        // Bleeding icon crawling
        ctx.fillStyle = `rgba(100,30,140,${pulse})`;
        ctx.fillRect(proj.x - 9, proj.y - 9, 18, 18);
        ctx.fillStyle = '#d4c8b0';
        ctx.fillRect(proj.x - 1, proj.y - 7, 2, 14);
        ctx.fillRect(proj.x - 5, proj.y - 3, 10, 2);
        ctx.fillStyle = '#aa1a1a';
        ctx.fillRect(proj.x, proj.y + 7, 1, 5);
      } else if (proj.sprite.includes('seraph')) {
        // Feather volley
        ctx.fillStyle = `rgba(200,210,230,${pulse * 0.8})`;
        for (let f2 = 0; f2 < 3; f2++) {
          ctx.fillRect(proj.x - 2 + f2 * 4, proj.y - 6 + f2 * 3, 3, 12);
        }
      } else if (proj.sprite.includes('inquisitor')) {
        // Holy fire crescent
        ctx.fillStyle = `rgba(200,160,20,${pulse})`;
        ctx.fillRect(proj.x - 12, proj.y - 6, 24, 12);
        ctx.fillStyle = `rgba(255,200,50,${pulse * 0.7})`;
        ctx.fillRect(proj.x - 8, proj.y - 4, 16, 8);
      } else {
        // Martyr chain ball
        ctx.fillStyle = `rgba(80,100,120,${pulse})`;
        ctx.fillRect(proj.x - 12, proj.y - 12, 24, 24);
        ctx.fillStyle = '#2a3a1a';
        ctx.fillRect(proj.x - 8, proj.y - 8, 16, 16);
        // Thorn ring
        for (let t = 0; t < 6; t++) {
          const a = (t / 6) * Math.PI * 2;
          ctx.fillStyle = '#1a3a0a';
          ctx.fillRect(proj.x + Math.cos(a) * 12 - 1, proj.y + Math.sin(a) * 12 - 1, 2, 2);
        }
      }
    }
  });
}

// ── Particle & Hit Spark Renderer ─────────────────────────
function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach(p => {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;

    if (p.type === 'BLOOD') {
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    } else if (p.type === 'SPARK') {
      ctx.fillRect(p.x - 1, p.y - p.size, 2, p.size * 2);
    } else if (p.type === 'HOLY') {
      ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
    } else {
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  });
  ctx.globalAlpha = 1.0;
}

function renderHitSparks(ctx: CanvasRenderingContext2D, sparks: HitSpark[]) {
  sparks.forEach(spark => {
    const alpha = 1 - spark.frame / spark.maxFrame;
    const size = spark.type === 'SUPER' ? 30 : spark.type === 'SPECIAL' ? 18 : 12;

    ctx.globalAlpha = alpha;

    if (spark.type === 'GUARD') {
      ctx.fillStyle = '#4488ff';
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + spark.frame * 0.3;
        ctx.fillRect(
          spark.x + Math.cos(angle) * size * 0.5 - 2,
          spark.y + Math.sin(angle) * size * 0.5 - 2,
          4, 4
        );
      }
    } else if (spark.type === 'SUPER') {
      // Massive cross-shaped super spark
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(spark.x - size, spark.y - 4, size * 2, 8);
      ctx.fillRect(spark.x - 4, spark.y - size, 8, size * 2);
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(spark.x - size * 0.7, spark.y - 3, size * 1.4, 6);
      ctx.fillRect(spark.x - 3, spark.y - size * 0.7, 6, size * 1.4);
    } else if (spark.type === 'SPECIAL') {
      ctx.fillStyle = '#ff8800';
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + spark.frame * 0.2;
        const len = size * (0.5 + 0.5 * Math.sin(spark.frame * 0.4));
        ctx.fillRect(
          spark.x + Math.cos(angle) * len - 3,
          spark.y + Math.sin(angle) * len - 3,
          6, 6
        );
      }
    } else {
      // Normal hit
      ctx.fillStyle = '#ffff88';
      ctx.fillRect(spark.x - 8, spark.y - 3, 16, 6);
      ctx.fillRect(spark.x - 3, spark.y - 8, 6, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(spark.x - 4, spark.y - 4, 8, 8);
    }
  });
  ctx.globalAlpha = 1.0;
}

// ── HUD Renderer ──────────────────────────────────────────
function renderHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  const { p1, p2, round } = state;

  // === Health Bars ===
  const barW = 320;
  const barH = 18;
  const barY = 18;
  const p1BarX = 30;
  const p2BarX = CANVAS_WIDTH - 30 - barW;

  // P1 Health
  renderHealthBar(ctx, p1, p1BarX, barY, barW, barH, true);
  // P2 Health
  renderHealthBar(ctx, p2, p2BarX, barY, barW, barH, false);

  // === Timer ===
  const seconds = Math.ceil(round.timer / 60);
  const timerX = CANVAS_WIDTH / 2;
  ctx.fillStyle = PALETTE.uiBackground;
  ctx.fillRect(timerX - 30, 10, 60, 30);
  ctx.strokeStyle = PALETTE.uiBorder;
  ctx.lineWidth = 2;
  ctx.strokeRect(timerX - 30, 10, 60, 30);
  ctx.fillStyle = seconds <= 10 ? '#ff4444' : PALETTE.uiGold;
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(seconds.toString().padStart(2, '0'), timerX, 34);

  // === Power Meters (Super Stocks) ===
  renderMeterBar(ctx, p1, p1BarX, barY + barH + 6, barW, true);
  renderMeterBar(ctx, p2, p2BarX, barY + barH + 6, barW, false);

  // === Round Wins ===
  for (let i = 0; i < 2; i++) {
    const filled = i < state.round.p1Wins;
    ctx.fillStyle = filled ? PALETTE.uiGold : '#333';
    ctx.fillRect(timerX - 22 + i * 14, 46, 10, 10);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(timerX - 22 + i * 14, 46, 10, 10);
    // P2 wins
    const filled2 = i < state.round.p2Wins;
    ctx.fillStyle = filled2 ? PALETTE.uiGold : '#333';
    ctx.fillRect(timerX + 12 - i * 14, 46, 10, 10);
    ctx.strokeStyle = '#555';
    ctx.strokeRect(timerX + 12 - i * 14, 46, 10, 10);
  }

  // === Character Names ===
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.uiGold;
  ctx.fillText(p1.definition.name, p1BarX, barY - 4);
  ctx.textAlign = 'right';
  ctx.fillText(p2.definition.name, p2BarX + barW, barY - 4);

  // === Combo counter overlay ===
  if (p2.comboCount >= 3) {
    ctx.fillStyle = '#ffcc00';
    ctx.font = `bold ${14 + p2.comboCount}px monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(`${p2.comboCount} HIT COMBO!`, p1BarX, barY + 80);
  }
  if (p1.comboCount >= 3) {
    ctx.fillStyle = '#ffcc00';
    ctx.font = `bold ${14 + p1.comboCount}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`${p1.comboCount} HIT COMBO!`, p2BarX + barW, barY + 80);
  }
}

function renderHealthBar(
  ctx: CanvasRenderingContext2D,
  f: ActiveFighter,
  x: number, y: number,
  w: number, h: number,
  leftAligned: boolean
) {
  const pct = Math.max(0, f.health / f.definition.stats.maxHealth);
  const filledW = Math.round(pct * w);

  // Background
  ctx.fillStyle = '#0a0808';
  ctx.fillRect(x, y, w, h);

  // Health fill
  const healthColor = pct > 0.5 ? PALETTE.healthGreen
    : pct > 0.25 ? PALETTE.healthYellow
    : PALETTE.healthRed;
  const healthX = leftAligned ? x : x + w - filledW;
  ctx.fillStyle = healthColor;
  ctx.fillRect(healthX, y + 2, filledW, h - 4);

  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(healthX, y + 2, filledW, (h - 4) / 2);

  // Border
  ctx.strokeStyle = PALETTE.uiBorder;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  // Guard gauge below (small)
  const guardPct = f.meter.guardGauge / f.meter.maxGuardGauge;
  const guardH = 5;
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(x, y + h + 1, w, guardH);
  ctx.fillStyle = f.meter.guardCrushed ? '#4488ff' : PALETTE.guardBlue;
  const guardFilledW = Math.round(guardPct * w);
  const guardX = leftAligned ? x : x + w - guardFilledW;
  ctx.fillRect(guardX, y + h + 1, guardFilledW, guardH);
  ctx.strokeStyle = '#222244';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y + h + 1, w, guardH);
}

function renderMeterBar(
  ctx: CanvasRenderingContext2D,
  f: ActiveFighter,
  x: number, y: number,
  w: number,
  leftAligned: boolean
) {
  const stockW = Math.floor((w - 6) / 3);
  const h = 10;

  for (let i = 0; i < 3; i++) {
    const sx = leftAligned ? x + i * (stockW + 3) : x + w - (i + 1) * (stockW + 3) + 3;
    const filled = i < f.meter.powerStocks;
    const partial = i === f.meter.powerStocks;

    ctx.fillStyle = '#0a0808';
    ctx.fillRect(sx, y, stockW, h);

    if (filled) {
      ctx.fillStyle = PALETTE.powerOrange;
      ctx.fillRect(sx, y, stockW, h);
      ctx.fillStyle = 'rgba(255,200,50,0.3)';
      ctx.fillRect(sx, y, stockW, h / 2);
    } else if (partial && f.meter.powerCharge > 0) {
      const chargeW = Math.round((f.meter.powerCharge / 100) * stockW);
      ctx.fillStyle = PALETTE.powerGold;
      ctx.fillRect(sx, y, chargeW, h);
    }

    ctx.strokeStyle = PALETTE.uiBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, y, stockW, h);
  }
}

// ── Announcement Overlays ─────────────────────────────────
function renderAnnouncement(ctx: CanvasRenderingContext2D, state: GameState, frame: number) {
  const phase = state.round.phase;
  const pTimer = state.round.phaseTimer;

  if (phase === 'ROUND_ANNOUNCE') {
    const alpha = Math.min(1, pTimer / 20) * Math.min(1, (120 - pTimer) / 20);
    ctx.globalAlpha = alpha;

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Round text
    const scl = 1 + 0.1 * Math.sin(pTimer * 0.2);
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    ctx.scale(scl, scl);
    ctx.fillStyle = PALETTE.uiGold;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`— ROUND ${state.round.roundNumber} —`, 0, 0);
    ctx.fillStyle = '#cc4444';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('SACRILEGIUM PUGNA', 0, 28);
    ctx.restore();

    ctx.globalAlpha = 1.0;
  }

  if (phase === 'KO') {
    const alpha = Math.min(1, pTimer / 15);
    ctx.globalAlpha = alpha;

    // Blood-red KO overlay
    ctx.fillStyle = 'rgba(80,0,0,0.4)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const koScale = 1 + 0.05 * Math.sin(pTimer * 0.3);
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
    ctx.scale(koScale, koScale);

    ctx.fillStyle = '#ff2222';
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('K.O.!', 0, 0);

    ctx.fillStyle = '#ffcc00';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(state.round.koText, 0, 35);

    ctx.restore();
    ctx.globalAlpha = 1.0;
  }

  if (phase === 'FIGHTING' && pTimer < 45 && pTimer > 0) {
    const alpha = Math.min(1, pTimer / 10) * Math.min(1, (45 - pTimer) / 10);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = PALETTE.uiGold;
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FIGHT!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.globalAlpha = 1.0;
  }

  if (phase === 'GAME_OVER' || phase === 'VICTORY') {
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const isVictory = phase === 'VICTORY';
    ctx.fillStyle = isVictory ? PALETTE.uiGold : '#8888aa';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      isVictory ? '✝ JUDGEMENT COMPLETE ✝' : '⊕ YOU HAVE FALLEN ⊕',
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30
    );

    const winner = state.round.winner === 'P1' ? state.p1 : state.p2;
    ctx.fillStyle = '#e8e0d0';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(
      `${winner.definition.name} reigns in eternal penitence`,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10
    );

    ctx.fillStyle = '#888';
    ctx.font = '13px monospace';
    ctx.fillText('Press SPACE or ENTER to continue', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
  }
}

// ── Screen Shake ──────────────────────────────────────────
function applyScreenShake(ctx: CanvasRenderingContext2D, state: GameState) {
  const { screenShake } = state;
  if (screenShake.intensity > 0) {
    ctx.translate(screenShake.x, screenShake.y);
  }
}

// ── Super Freeze Flash ────────────────────────────────────
function renderSuperFreeze(ctx: CanvasRenderingContext2D, state: GameState) {
  if (!state.superFreeze) return;
  const alpha = 0.3 * Math.sin(state.superFreezeTimer * 0.4);
  ctx.fillStyle = `rgba(255,220,100,${Math.abs(alpha)})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// ── MAIN RENDER FUNCTION ──────────────────────────────────
export function renderGame(ctx: CanvasRenderingContext2D, state: GameState, frame: number) {
  ctx.save();
  applyScreenShake(ctx, state);

  // Clear
  ctx.fillStyle = '#060210';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Stage
  renderStage(ctx, frame);

  // Projectiles (under fighters)
  renderProjectiles(ctx, [...state.p1.projectiles, ...state.p2.projectiles], frame);

  // Fighters
  renderFighter(ctx, state.p1, frame);
  renderFighter(ctx, state.p2, frame);

  // Effects
  renderParticles(ctx, state.particles);
  renderHitSparks(ctx, state.hitSparks);

  // Super freeze overlay
  renderSuperFreeze(ctx, state);

  ctx.restore();

  // HUD (not affected by screen shake)
  renderHUD(ctx, state);

  // Announcements
  renderAnnouncement(ctx, state, frame);
}

// ── Render Character Select Screen ────────────────────────
export function renderCharSelect(
  ctx: CanvasRenderingContext2D,
  roster: { id: string; name: string; title: string; archetype: string; lore: string; spriteConfig: { bodyColor: string; armorColor: string; weaponColor: string; eyeColor: string; effectColor: string; particleColor: string } }[],
  selectedP1: number,
  selectedP2: number,
  frame: number,
  difficulty: string
) {
  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bg.addColorStop(0, '#04020c');
  bg.addColorStop(1, '#0c0610');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Title
  const titleFlicker = 0.8 + 0.2 * Math.sin(frame * 0.05);
  ctx.globalAlpha = titleFlicker;
  ctx.fillStyle = PALETTE.uiGold;
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('✝ SACRILEGIUM PUGNA ✝', CANVAS_WIDTH / 2, 35);
  ctx.fillStyle = '#884444';
  ctx.font = '12px monospace';
  ctx.fillText('SELECT YOUR CONDEMNED SOUL', CANVAS_WIDTH / 2, 55);
  ctx.globalAlpha = 1.0;

  // Character panels
  const panelW = 155;
  const panelH = 110;
  const startX = (CANVAS_WIDTH - (roster.length * (panelW + 8))) / 2;
  const panelY = 70;

  roster.forEach((char, i) => {
    const px2 = startX + i * (panelW + 8);
    const isP1Sel = i === selectedP1;
    const isP2Sel = i === selectedP2;

    // Panel background
    ctx.fillStyle = isP1Sel && isP2Sel ? '#2a1830'
      : isP1Sel ? '#1a0808'
      : isP2Sel ? '#08101a'
      : '#0a0810';
    ctx.fillRect(px2, panelY, panelW, panelH);

    // Border
    ctx.strokeStyle = isP1Sel && isP2Sel ? '#aa44aa'
      : isP1Sel ? '#cc2222'
      : isP2Sel ? '#2244cc'
      : '#3a2030';
    ctx.lineWidth = isP1Sel || isP2Sel ? 3 : 1;
    ctx.strokeRect(px2, panelY, panelW, panelH);

    // Selection indicators
    if (isP1Sel) {
      ctx.fillStyle = '#cc2222';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('P1', px2 + 4, panelY + 12);
    }
    if (isP2Sel) {
      ctx.fillStyle = '#2244cc';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('P2', px2 + panelW - 4, panelY + 12);
    }

    // Mini character preview
    const previewX = px2 + panelW / 2;
    const previewY = panelY + 75;
    ctx.save();
    ctx.beginPath();
    ctx.rect(px2 + 2, panelY + 15, panelW - 4, panelH - 30);
    ctx.clip();
    renderMiniChar(ctx, char, previewX, previewY, frame + i * 17);
    ctx.restore();

    // Name
    ctx.fillStyle = PALETTE.uiGold;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(char.name, px2 + panelW / 2, panelY + panelH - 12);

    // Archetype
    ctx.fillStyle = '#886644';
    ctx.font = '8px monospace';
    ctx.fillText(`[${char.archetype}]`, px2 + panelW / 2, panelY + panelH - 3);
  });

  // Selected character info panel
  const selChar = roster[selectedP1];
  if (selChar) {
    const infoY = panelY + panelH + 20;
    ctx.fillStyle = 'rgba(10,5,20,0.9)';
    ctx.fillRect(30, infoY, CANVAS_WIDTH - 60, 80);
    ctx.strokeStyle = PALETTE.uiBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(30, infoY, CANVAS_WIDTH - 60, 80);

    ctx.fillStyle = PALETTE.uiGold;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(selChar.title, 44, infoY + 20);

    ctx.fillStyle = '#c0a880';
    ctx.font = '9px monospace';
    // Wrap lore text
    const words = selChar.lore.split(' ');
    let line = '';
    let ly = infoY + 36;
    words.forEach(w => {
      const test = line + w + ' ';
      if (ctx.measureText(test).width > CANVAS_WIDTH - 100) {
        ctx.fillText(line, 44, ly);
        line = w + ' ';
        ly += 12;
      } else {
        line = test;
      }
    });
    ctx.fillText(line, 44, ly);
  }

  // Controls help
  const helpY = CANVAS_HEIGHT - 45;
  ctx.fillStyle = '#664444';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('P1: ← → to select | U I O = LP MP HP | J K L = LK MK HK', CANVAS_WIDTH / 2, helpY);
  ctx.fillText(`Difficulty: ${difficulty} | Press ENTER to confirm`, CANVAS_WIDTH / 2, helpY + 16);

  // Difficulty selector
  ctx.fillStyle = PALETTE.uiGold;
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`AI Difficulty: [ ${difficulty} ]  (Press D to change)`, CANVAS_WIDTH / 2, helpY + 30);
}

function renderMiniChar(
  ctx: CanvasRenderingContext2D,
  char: { id: string; spriteConfig: { bodyColor: string; armorColor: string; weaponColor: string; eyeColor: string } },
  x: number, y: number, frame: number
) {
  const bob = Math.sin(frame * 0.06) * 2;
  const oy = y + bob;
  const c = char.spriteConfig;

  switch (char.id) {
    case 'penitent':
      // Mini capirote
      px(ctx, x - 4, oy - 38, 8, 8, c.armorColor);
      px(ctx, x - 3, oy - 46, 6, 10, c.armorColor);
      px(ctx, x - 1, oy - 54, 2, 10, c.armorColor);
      px(ctx, x - 6, oy - 26, 12, 26, c.armorColor);
      px(ctx, x + 8, oy - 18, 3, 20, c.weaponColor);
      break;
    case 'martyr':
      px(ctx, x - 9, oy - 40, 18, 40, c.bodyColor);
      px(ctx, x - 6, oy - 50, 12, 12, '#3a2010');
      px(ctx, x - 3, oy - 46, 3, 3, c.eyeColor);
      px(ctx, x + 1, oy - 46, 3, 3, c.eyeColor);
      break;
    case 'oracle':
      px(ctx, x - 4, oy - 40, 8, 10, '#d4c8b0');
      px(ctx, x - 2, oy - 38, 2, 4, '#1a0a0a');
      px(ctx, x + 1, oy - 38, 2, 4, '#1a0a0a');
      px(ctx, x - 6, oy - 30, 12, 30, c.armorColor);
      // Orbiting icon
      const ang = frame * 0.08;
      px(ctx, x + Math.cos(ang) * 12 - 2, oy - 28 + Math.sin(ang) * 5 - 2, 4, 4, c.effectColor);
      break;
    case 'seraph':
      px(ctx, x - 5, oy - 38, 10, 20, c.armorColor);
      px(ctx, x - 3, oy - 46, 6, 10, c.armorColor);
      // Wings
      px(ctx, x - 18, oy - 38, 14, 20, '#2a3a5a');
      px(ctx, x + 5, oy - 38, 14, 20, '#2a3a5a');
      break;
    case 'inquisitor':
      px(ctx, x - 6, oy - 38, 12, 30, c.bodyColor);
      px(ctx, x - 4, oy - 46, 8, 10, '#e8d8b8');
      px(ctx, x - 3, oy - 42, 6, 2, c.eyeColor);
      px(ctx, x + 6, oy - 22, 12, 2, c.weaponColor);
      break;
  }
}

// ── Title Screen Renderer ─────────────────────────────────
export function renderTitleScreen(ctx: CanvasRenderingContext2D, frame: number) {
  // Gothic void background
  ctx.fillStyle = '#04020a';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Animated gothic arches
  for (let i = 0; i < 5; i++) {
    const ax = (i + 0.5) * (CANVAS_WIDTH / 5);
    const flicker = 0.5 + 0.5 * Math.sin(frame * 0.03 + i * 1.2);
    ctx.fillStyle = `rgba(30,10,10,${0.8 * flicker})`;
    ctx.fillRect(ax - 30, 0, 60, CANVAS_HEIGHT);
    ctx.strokeStyle = `rgba(80,30,10,${0.3 * flicker})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(ax - 30, 0, 60, CANVAS_HEIGHT);
  }

  // Cross in background
  const crossAlpha = 0.08 + 0.04 * Math.sin(frame * 0.02);
  ctx.fillStyle = `rgba(100,60,20,${crossAlpha})`;
  ctx.fillRect(CANVAS_WIDTH / 2 - 8, 0, 16, CANVAS_HEIGHT);
  ctx.fillRect(0, CANVAS_HEIGHT * 0.3, CANVAS_WIDTH, 16);

  // Blood drips from top
  for (let d = 0; d < 8; d++) {
    const dx = 60 + d * 110;
    const dLen = 30 + Math.sin(frame * 0.04 + d) * 20;
    ctx.fillStyle = 'rgba(150,20,20,0.6)';
    ctx.fillRect(dx, 0, 3, dLen);
    ctx.fillRect(dx - 1, dLen - 2, 5, 6);
  }

  // Main title
  const titleScale = 1 + 0.02 * Math.sin(frame * 0.04);
  ctx.save();
  ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.35);
  ctx.scale(titleScale, titleScale);

  // Gothic title text with shadow
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.font = 'bold 38px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SACRILEGIUM', 3, 3);
  ctx.fillText('PUGNA', 3, 48);

  ctx.fillStyle = '#c8a030';
  ctx.fillText('SACRILEGIUM', 0, 0);
  ctx.fillStyle = '#8b1a1a';
  ctx.fillText('PUGNA', 0, 45);

  // Subtitle
  ctx.fillStyle = `rgba(200,180,120,${0.6 + 0.4 * Math.sin(frame * 0.06)})`;
  ctx.font = '13px monospace';
  ctx.fillText('— Gothic Pixel Horror Fighter —', 0, 75);
  ctx.restore();

  // Attribution
  ctx.fillStyle = 'rgba(100,80,50,0.8)';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('In the name of The Miracle, suffer in combat.', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.6);

  // Press start (blinking)
  if (frame % 60 < 40) {
    ctx.fillStyle = PALETTE.uiGold;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✝ PRESS ENTER TO BEGIN ✝', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.72);
  }

  // Candles
  for (let c = 0; c < 4; c++) {
    const cx2 = 80 + c * 240;
    const cy2 = CANVAS_HEIGHT * 0.75;
    const flickr = 0.7 + 0.3 * Math.sin(frame * 0.1 + c * 0.8);
    px(ctx, cx2 - 3, cy2 - 20, 6, 20, '#c8c0b0');
    px(ctx, cx2 - 1, cy2 - 24, 2, 4, '#302020');
    ctx.fillStyle = `rgba(255,180,20,${flickr * 0.8})`;
    ctx.fillRect(cx2 - 3, cy2 - 30, 6, 6);
    ctx.fillStyle = `rgba(255,220,80,${flickr})`;
    ctx.fillRect(cx2 - 1, cy2 - 33, 2, 4);
  }

  // Version/controls hint
  ctx.fillStyle = 'rgba(80,60,40,0.8)';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Arrow Keys: Move | U/I/O: LP/MP/HP | J/K/L: LK/MK/HK', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
}
