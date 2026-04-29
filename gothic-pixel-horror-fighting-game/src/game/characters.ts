// ============================================================
// SACRILEGIUM PUGNA — CHARACTER DEFINITIONS & MOVELISTS
// Five Gothic Horror Fighters with KOF-Style Movesets
// ============================================================

import type { FighterDefinition, Move } from './types';

// ── Helper: Build Frame Data ──────────────────────────────
function fd(
  id: string,
  startup: number, active: number, recovery: number,
  damage: number, guardDmg: number,
  hitstun: number, blockstun: number,
  knockdown: boolean, pushback: number,
  type: 'LOW' | 'MID' | 'HIGH' | 'UNBLOCKABLE' | 'THROW' | 'PROJECTILE' = 'MID',
  priority: 'NORMAL' | 'SPECIAL' | 'SUPER' = 'NORMAL',
  hitboxY = -60, hitboxH = 30
) {
  return {
    id,
    totalFrames: startup + active + recovery,
    startupFrames: startup,
    activeFrames: active,
    recoveryFrames: recovery,
    hitboxes: [{
      rect: { x: 20, y: hitboxY, w: 55, h: hitboxH },
      damage, guardDamage: guardDmg,
      hitstun, blockstun,
      knockdown, pushback, type, priority,
    }],
    hurtboxes: [{ x: -20, y: -90, w: 50, h: 90 }],
    cancelableInto: [],
    superCancelable: priority !== 'NORMAL',
  };
}

// ──────────────────────────────────────────────────────────
// CHARACTER 1: THE PENITENT ONE — "El Condenado"
// Balanced / Rushdown | Armed with a barbed Mea Culpa sword
// Capirote-helmeted knight, blood-soaked penitential armor
// ──────────────────────────────────────────────────────────
const penitentMoves: Move[] = [
  // === NORMALS ===
  {
    id: 'p1_lp', name: 'Barbed Jab', type: 'NORMAL',
    frameData: fd('p1_lp', 4, 3, 8, 28, 4, 10, 6, false, 3),
    meterGainOnHit: 8, meterGainOnBlock: 3,
    description: 'A quick forward jab with the Mea Culpa hilt.',
  },
  {
    id: 'p1_mp', name: 'Mea Culpa Slash', type: 'NORMAL',
    frameData: fd('p1_mp', 6, 4, 12, 52, 8, 15, 10, false, 5),
    meterGainOnHit: 12, meterGainOnBlock: 5,
    description: 'Horizontal sweep with the barbed blade.',
  },
  {
    id: 'p1_hp', name: 'Penitential Blow', type: 'NORMAL',
    frameData: fd('p1_hp', 9, 5, 18, 80, 12, 20, 14, false, 8, 'MID', 'NORMAL', -70, 35),
    meterGainOnHit: 18, meterGainOnBlock: 7,
    description: 'Heavy overhead arc. Launches on Counter Hit.',
  },
  {
    id: 'p1_lk', name: 'Shin Kick', type: 'NORMAL',
    frameData: fd('p1_lk', 5, 3, 9, 24, 3, 9, 5, false, 2, 'LOW'),
    meterGainOnHit: 7, meterGainOnBlock: 3,
    description: 'Low kick targeting the shins.',
  },
  {
    id: 'p1_mk', name: 'Saeta Stomp', type: 'NORMAL',
    frameData: fd('p1_mk', 7, 4, 13, 48, 7, 14, 9, false, 5, 'MID'),
    meterGainOnHit: 11, meterGainOnBlock: 4,
    description: 'Forward stepping knee strike.',
  },
  {
    id: 'p1_hk', name: 'Capirote Kick', type: 'NORMAL',
    frameData: fd('p1_hk', 10, 5, 20, 75, 11, 19, 13, false, 7),
    meterGainOnHit: 16, meterGainOnBlock: 6,
    description: 'Launching roundhouse kick.',
  },
  // === COMMAND NORMAL ===
  {
    id: 'p1_cmd_f_lp', name: 'Penitent\'s Cross', type: 'COMMAND_NORMAL',
    commandInput: 'F+LP',
    frameData: {
      id: 'p1_cmd_f_lp', totalFrames: 28, startupFrames: 8, activeFrames: 4, recoveryFrames: 16,
      hitboxes: [{
        rect: { x: 15, y: -75, w: 60, h: 40 },
        damage: 65, guardDamage: 10, hitstun: 18, blockstun: 12,
        knockdown: false, pushback: 6, type: 'HIGH', priority: 'NORMAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 50, h: 90 }],
      cancelableInto: ['p1_special_a', 'p1_special_b', 'p1_special_c'],
      superCancelable: true,
    },
    meterGainOnHit: 14, meterGainOnBlock: 6,
    description: 'Forward + LP. Overhead cross-slash that forces crouch-blocking opponents to eat it standing.',
  },
  // === SPECIAL A — Zoning: "Thorn Wave" (QCF+P) ===
  {
    id: 'p1_special_a', name: 'Thorn Penance (Onda de Espina)', type: 'SPECIAL',
    input: {
      id: 'qcf_p', sequence: [2, 3, 6], button: ['LP', 'MP', 'HP'],
      windowFrames: 30, name: 'QCF+P',
    },
    frameData: {
      id: 'p1_special_a', totalFrames: 40, startupFrames: 14, activeFrames: 60, recoveryFrames: 26,
      hitboxes: [{
        rect: { x: 0, y: -55, w: 20, h: 20 },
        damage: 45, guardDamage: 12, hitstun: 14, blockstun: 8,
        knockdown: false, pushback: 10, type: 'PROJECTILE', priority: 'SPECIAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 50, h: 90 }],
      cancelableInto: [],
      superCancelable: false,
    },
    meterGainOnHit: 20, meterGainOnBlock: 10,
    description: 'QCF+P — Drives Mea Culpa into the ground, launching a slow-rolling crown of thorns that travels full-screen.',
  },
  // === SPECIAL B — Anti-Air: "Rising Martyrdom" (QCB+P) ===
  {
    id: 'p1_special_b', name: 'Rising Martyrdom (Martirio Ascendente)', type: 'SPECIAL',
    input: {
      id: 'qcb_p', sequence: [2, 1, 4], button: ['LP', 'MP', 'HP'],
      windowFrames: 30, name: 'QCB+P',
    },
    frameData: {
      id: 'p1_special_b', totalFrames: 45, startupFrames: 3, activeFrames: 8, recoveryFrames: 34,
      hitboxes: [{
        rect: { x: 10, y: -100, w: 45, h: 80 },
        damage: 75, guardDamage: 14, hitstun: 22, blockstun: 15,
        knockdown: false, pushback: 8, type: 'MID', priority: 'SPECIAL',
      }],
      hurtboxes: [{ x: -10, y: -110, w: 35, h: 30 }], // reduced hurtbox = invincibility window
      cancelableInto: [],
      superCancelable: true,
    },
    meterGainOnHit: 25, meterGainOnBlock: 8,
    description: 'QCB+P — Invincible uppercut on startup (frames 1-4). Launches the barbed sword upward. KOF-style DP.',
  },
  // === SPECIAL C — Pressure: "Flagellant Rekka" (QCF+K, QCF+K, QCF+K) ===
  {
    id: 'p1_special_c', name: 'Flagellant\'s Rekka (Tríada del Penitente)', type: 'SPECIAL',
    input: {
      id: 'qcf_k', sequence: [2, 3, 6], button: ['LK', 'MK', 'HK'],
      windowFrames: 30, name: 'QCF+K',
    },
    frameData: {
      id: 'p1_special_c', totalFrames: 38, startupFrames: 8, activeFrames: 4, recoveryFrames: 26,
      hitboxes: [{
        rect: { x: 20, y: -60, w: 55, h: 32 },
        damage: 35, guardDamage: 8, hitstun: 12, blockstun: 8,
        knockdown: false, pushback: 4, type: 'MID', priority: 'SPECIAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 50, h: 90 }],
      cancelableInto: ['p1_special_c_2'],
      superCancelable: false,
    },
    meterGainOnHit: 15, meterGainOnBlock: 6,
    description: 'QCF+K (×3) — Three-hit rekka chain. Each hit must be inputted separately. Final hit knocks down.',
  },
  // === SDM — "The Miracle Incarnate" (QCF QCF + P, 1 stock) ===
  {
    id: 'p1_sdm', name: 'The Miracle Incarnate (El Milagro)', type: 'SDM',
    input: {
      id: 'qcfx2_p', sequence: [2, 3, 6, 2, 3, 6], button: ['LP', 'MP', 'HP'],
      windowFrames: 45, name: 'QCFx2+P',
    },
    meterCost: 1,
    frameData: {
      id: 'p1_sdm', totalFrames: 120, startupFrames: 12, activeFrames: 45, recoveryFrames: 63,
      hitboxes: [{
        rect: { x: -300, y: -100, w: 700, h: 90 },
        damage: 280, guardDamage: 40, hitstun: 40, blockstun: 25,
        knockdown: true, pushback: 0, type: 'MID', priority: 'SUPER',
        launchY: -8,
      }],
      hurtboxes: [],  // fully invincible during super
      cancelableInto: [],
      superCancelable: false,
    },
    meterGainOnHit: 0, meterGainOnBlock: 5,
    description: 'QCFx2+P (1 Stock) — Drives Mea Culpa into the earth. Massive crown-of-thorns spikes erupt across the entire arena. Screen-filling divine punishment.',
  },
];

// ──────────────────────────────────────────────────────────
// CHARACTER 2: THE MARTYR-BEAST — "La Bestia Mártir"
// Heavy Grappler | Thorny chains + deformed monk's body
// ──────────────────────────────────────────────────────────
const martyrMoves: Move[] = [
  {
    id: 'mb_lp', name: 'Chain Lash', type: 'NORMAL',
    frameData: fd('mb_lp', 7, 4, 12, 35, 5, 12, 7, false, 4),
    meterGainOnHit: 9, meterGainOnBlock: 4,
    description: 'Slow but reaching chain strike.',
  },
  {
    id: 'mb_mp', name: 'Bone Hammer', type: 'NORMAL',
    frameData: fd('mb_mp', 10, 5, 16, 68, 10, 18, 12, false, 7, 'MID', 'NORMAL', -65, 38),
    meterGainOnHit: 15, meterGainOnBlock: 6,
    description: 'Downward hammer blow with fused-chain fist.',
  },
  {
    id: 'mb_hp', name: 'Martyrdom Slam', type: 'NORMAL',
    frameData: fd('mb_hp', 14, 6, 22, 95, 15, 25, 16, true, 10, 'MID', 'NORMAL', -70, 45),
    meterGainOnHit: 22, meterGainOnBlock: 9,
    description: 'Full-body overhead slam. Knocks down.',
  },
  {
    id: 'mb_lk', name: 'Toe Crush', type: 'NORMAL',
    frameData: fd('mb_lk', 8, 3, 12, 28, 4, 10, 6, false, 2, 'LOW'),
    meterGainOnHit: 7, meterGainOnBlock: 3,
    description: 'Stomping low kick.',
  },
  {
    id: 'mb_mk', name: 'Penitent Knee', type: 'NORMAL',
    frameData: fd('mb_mk', 11, 4, 15, 55, 8, 16, 10, false, 6),
    meterGainOnHit: 12, meterGainOnBlock: 5,
    description: 'Rising knee strike.',
  },
  {
    id: 'mb_hk', name: 'Monk\'s Wrath', type: 'NORMAL',
    frameData: fd('mb_hk', 15, 6, 22, 85, 13, 22, 14, false, 9),
    meterGainOnHit: 18, meterGainOnBlock: 7,
    description: 'Full rotating kick. Massive reach.',
  },
  // COMMAND NORMAL: Crouching Chain Overhead
  {
    id: 'mb_cmd_df_hp', name: 'Chain Overhead', type: 'COMMAND_NORMAL',
    commandInput: 'DF+HP',
    frameData: {
      id: 'mb_cmd_df_hp', totalFrames: 36, startupFrames: 12, activeFrames: 5, recoveryFrames: 19,
      hitboxes: [{
        rect: { x: 10, y: -85, w: 70, h: 45 },
        damage: 78, guardDamage: 14, hitstun: 20, blockstun: 13,
        knockdown: false, pushback: 6, type: 'HIGH', priority: 'NORMAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 55, h: 90 }],
      cancelableInto: ['mb_special_c'],
      superCancelable: true,
    },
    meterGainOnHit: 16, meterGainOnBlock: 7,
    description: 'DF+HP. Swings thorny chains overhead — unblockable low, must be blocked HIGH.',
  },
  // SPECIAL A — Chain Toss (QCF+P) — Slow projectile
  {
    id: 'mb_special_a', name: 'Barbed Gospel (Evangelio de Espinas)', type: 'SPECIAL',
    input: {
      id: 'qcf_p_mb', sequence: [2, 3, 6], button: ['LP', 'MP', 'HP'],
      windowFrames: 30, name: 'QCF+P',
    },
    frameData: {
      id: 'mb_special_a', totalFrames: 55, startupFrames: 18, activeFrames: 40, recoveryFrames: 37,
      hitboxes: [{
        rect: { x: 0, y: -65, w: 25, h: 25 },
        damage: 65, guardDamage: 18, hitstun: 18, blockstun: 12,
        knockdown: false, pushback: 12, type: 'PROJECTILE', priority: 'SPECIAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 55, h: 90 }],
      cancelableInto: [],
      superCancelable: false,
    },
    meterGainOnHit: 22, meterGainOnBlock: 10,
    description: 'QCF+P — Hurls a ball of compressed thorny chains. Slow-moving, high guard damage.',
  },
  // SPECIAL B — Anti-Air Slam (QCB+K)
  {
    id: 'mb_special_b', name: 'Heaven\'s Chain (Cadena Celestial)', type: 'SPECIAL',
    input: {
      id: 'qcb_k_mb', sequence: [2, 1, 4], button: ['LK', 'MK', 'HK'],
      windowFrames: 30, name: 'QCB+K',
    },
    frameData: {
      id: 'mb_special_b', totalFrames: 50, startupFrames: 4, activeFrames: 10, recoveryFrames: 36,
      hitboxes: [{
        rect: { x: 5, y: -120, w: 60, h: 90 },
        damage: 85, guardDamage: 16, hitstun: 26, blockstun: 16,
        knockdown: true, pushback: 6, type: 'MID', priority: 'SPECIAL',
        launchY: -4,
      }],
      hurtboxes: [{ x: -5, y: -115, w: 40, h: 25 }],
      cancelableInto: [],
      superCancelable: true,
    },
    meterGainOnHit: 28, meterGainOnBlock: 10,
    description: 'QCB+K — Flings thorny chains straight up, invincible 1-5 frames. Extreme anti-air.',
  },
  // SPECIAL C — Command Grab (HCB+P, Guard Sap)
  {
    id: 'mb_special_c', name: 'Penitent\'s Embrace (Abrazo del Mártir)', type: 'SPECIAL',
    input: {
      id: 'hcb_p_mb', sequence: [6, 3, 2, 1, 4], button: ['LP', 'MP', 'HP'],
      windowFrames: 35, name: 'HCB+P',
    },
    frameData: {
      id: 'mb_special_c', totalFrames: 60, startupFrames: 5, activeFrames: 3, recoveryFrames: 52,
      hitboxes: [{
        rect: { x: 0, y: -90, w: 65, h: 90 },
        damage: 120, guardDamage: 50, hitstun: 35, blockstun: 0,
        knockdown: true, pushback: 0, type: 'THROW', priority: 'SPECIAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 55, h: 90 }],
      cancelableInto: [],
      superCancelable: false,
    },
    meterGainOnHit: 35, meterGainOnBlock: 0,
    description: 'HCB+P — Unblockable command grab. Wraps opponent in thorny chains draining 50 guard meter. Massive damage.',
  },
  // SDM — "Martyrdom Judgment"
  {
    id: 'mb_sdm', name: 'Martyrdom Judgment (Juicio Martirio)', type: 'SDM',
    input: {
      id: 'hcbx2_p_mb', sequence: [6, 3, 2, 1, 4, 6, 3, 2, 1, 4], button: ['LP', 'MP', 'HP'],
      windowFrames: 55, name: 'HCBx2+P',
    },
    meterCost: 1,
    frameData: {
      id: 'mb_sdm', totalFrames: 130, startupFrames: 5, activeFrames: 5, recoveryFrames: 120,
      hitboxes: [{
        rect: { x: -10, y: -95, w: 70, h: 95 },
        damage: 320, guardDamage: 100, hitstun: 50, blockstun: 0,
        knockdown: true, pushback: 0, type: 'THROW', priority: 'SUPER', launchY: -6,
      }],
      hurtboxes: [],
      cancelableInto: [],
      superCancelable: false,
    },
    meterGainOnHit: 0, meterGainOnBlock: 0,
    description: 'HCBx2+P (1 Stock) — Unblockable super grab. Wraps the opponent in full-body thorn shroud, crushing them through the floor. Highest damage in the game.',
  },
];

// ──────────────────────────────────────────────────────────
// CHARACTER 3: THE WEEPING ORACLE — "La Oráculo Llorosa"
// Zoner / Ranged | Eyeless robed figure, floating
// ──────────────────────────────────────────────────────────
const oracleMoves: Move[] = [
  {
    id: 'wo_lp', name: 'Relic Push', type: 'NORMAL',
    frameData: fd('wo_lp', 5, 3, 10, 24, 3, 9, 5, false, 2, 'MID'),
    meterGainOnHit: 7, meterGainOnBlock: 3,
    description: 'Pushes a bleeding relic orb forward.',
  },
  {
    id: 'wo_mp', name: 'Icon Swing', type: 'NORMAL',
    frameData: fd('wo_mp', 8, 4, 14, 50, 7, 15, 9, false, 5),
    meterGainOnHit: 12, meterGainOnBlock: 5,
    description: 'Whips a shattered icon like a flail.',
  },
  {
    id: 'wo_hp', name: 'Revelation Blast', type: 'NORMAL',
    frameData: fd('wo_hp', 12, 5, 20, 78, 11, 20, 13, false, 8, 'MID', 'NORMAL', -65, 40),
    meterGainOnHit: 17, meterGainOnBlock: 7,
    description: 'Releases orb energy forward in a burst.',
  },
  {
    id: 'wo_lk', name: 'Levitate Kick', type: 'NORMAL',
    frameData: fd('wo_lk', 6, 3, 10, 22, 3, 8, 5, false, 3, 'MID'),
    meterGainOnHit: 7, meterGainOnBlock: 3,
    description: 'Floating leg swipe while hovering.',
  },
  {
    id: 'wo_mk', name: 'Spectral Heel', type: 'NORMAL',
    frameData: fd('wo_mk', 9, 4, 15, 46, 6, 13, 8, false, 5),
    meterGainOnHit: 11, meterGainOnBlock: 4,
    description: 'Drops heel from float position.',
  },
  {
    id: 'wo_hk', name: 'Widow\'s Judgment', type: 'NORMAL',
    frameData: fd('wo_hk', 13, 5, 21, 72, 10, 18, 12, false, 7, 'MID'),
    meterGainOnHit: 15, meterGainOnBlock: 6,
    description: 'Full-rotation kick with robes trailing ghostly ichor.',
  },
  // COMMAND NORMAL: Overhead Tears
  {
    id: 'wo_cmd_b_mp', name: 'Tears of the Blind', type: 'COMMAND_NORMAL',
    commandInput: 'B+MP',
    frameData: {
      id: 'wo_cmd_b_mp', totalFrames: 30, startupFrames: 10, activeFrames: 4, recoveryFrames: 16,
      hitboxes: [{
        rect: { x: -20, y: -100, w: 55, h: 70 },
        damage: 60, guardDamage: 12, hitstun: 18, blockstun: 11,
        knockdown: false, pushback: 4, type: 'HIGH', priority: 'NORMAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 50, h: 90 }],
      cancelableInto: ['wo_special_a', 'wo_special_b'],
      superCancelable: true,
    },
    meterGainOnHit: 14, meterGainOnBlock: 6,
    description: 'B+MP. Rains bleeding icon shards from above — overhead hit.',
  },
  // SPECIAL A — Crawling Reliquary (QCF+P)
  {
    id: 'wo_special_a', name: 'Crawling Reliquary (Reliquia Rampante)', type: 'SPECIAL',
    input: {
      id: 'qcf_p_wo', sequence: [2, 3, 6], button: ['LP', 'MP', 'HP'],
      windowFrames: 30, name: 'QCF+P',
    },
    frameData: {
      id: 'wo_special_a', totalFrames: 38, startupFrames: 10, activeFrames: 90, recoveryFrames: 28,
      hitboxes: [{
        rect: { x: 0, y: -40, w: 18, h: 18 },
        damage: 38, guardDamage: 14, hitstun: 12, blockstun: 8,
        knockdown: false, pushback: 8, type: 'PROJECTILE', priority: 'SPECIAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 50, h: 90 }],
      cancelableInto: [],
      superCancelable: false,
    },
    meterGainOnHit: 18, meterGainOnBlock: 9,
    description: 'QCF+P — A bleeding religious icon crawls across the ground slowly. Must be jumped. Three strength variants (LP/MP/HP) for speed.',
  },
  // SPECIAL B — Oracle Pillar / Anti-Air (QCB+P)
  {
    id: 'wo_special_b', name: 'Pillar of Tears (Pilar de Lágrimas)', type: 'SPECIAL',
    input: {
      id: 'qcb_p_wo', sequence: [2, 1, 4], button: ['LP', 'MP', 'HP'],
      windowFrames: 30, name: 'QCB+P',
    },
    frameData: {
      id: 'wo_special_b', totalFrames: 48, startupFrames: 5, activeFrames: 12, recoveryFrames: 31,
      hitboxes: [{
        rect: { x: -20, y: -130, w: 55, h: 110 },
        damage: 70, guardDamage: 15, hitstun: 24, blockstun: 14,
        knockdown: false, pushback: 5, type: 'MID', priority: 'SPECIAL', launchY: -5,
      }],
      hurtboxes: [{ x: -5, y: -125, w: 30, h: 20 }],
      cancelableInto: [],
      superCancelable: true,
    },
    meterGainOnHit: 24, meterGainOnBlock: 9,
    description: 'QCB+P — Summons a column of crystallized tears that erupts upward. Invincible anti-air frames 1-6.',
  },
  // SPECIAL C — Icon Trap (HCF+K) — Zone control
  {
    id: 'wo_special_c', name: 'Icon Trap (Trampa del Icono)', type: 'SPECIAL',
    input: {
      id: 'hcf_k_wo', sequence: [4, 1, 2, 3, 6], button: ['LK', 'MK', 'HK'],
      windowFrames: 35, name: 'HCF+K',
    },
    frameData: {
      id: 'wo_special_c', totalFrames: 50, startupFrames: 8, activeFrames: 6, recoveryFrames: 36,
      hitboxes: [{
        rect: { x: 40, y: -70, w: 30, h: 60 },
        damage: 55, guardDamage: 20, hitstun: 16, blockstun: 10,
        knockdown: false, pushback: 6, type: 'THROW', priority: 'SPECIAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 50, h: 90 }],
      cancelableInto: [],
      superCancelable: true,
    },
    meterGainOnHit: 20, meterGainOnBlock: 10,
    description: 'HCF+K — Plants a pulsating icon orb on screen. Triggers if the opponent steps through it. Drains 20 guard meter.',
  },
  // SDM — "The Weeping Miracle"
  {
    id: 'wo_sdm', name: 'Tears of Heaven (Llanto del Cielo)', type: 'SDM',
    input: {
      id: 'qcbx2_p_wo', sequence: [2, 1, 4, 2, 1, 4], button: ['LP', 'MP', 'HP'],
      windowFrames: 45, name: 'QCBx2+P',
    },
    meterCost: 1,
    frameData: {
      id: 'wo_sdm', totalFrames: 110, startupFrames: 8, activeFrames: 60, recoveryFrames: 42,
      hitboxes: [{
        rect: { x: -400, y: -140, w: 900, h: 130 },
        damage: 260, guardDamage: 55, hitstun: 38, blockstun: 22,
        knockdown: true, pushback: 0, type: 'MID', priority: 'SUPER', launchY: -7,
      }],
      hurtboxes: [],
      cancelableInto: [],
      superCancelable: false,
    },
    meterGainOnHit: 0, meterGainOnBlock: 5,
    description: 'QCBx2+P (1 Stock) — The Oracle ascends and releases a torrential rain of shattered, bleeding icons from heaven, filling the entire screen.',
  },
];

// ──────────────────────────────────────────────────────────
// CHARACTER 4: THE SERAPHIC ABOMINATION — "La Abominación Seráfica"
// Agile / Air | Corrupted angel, skeletal wings, too many arms
// ──────────────────────────────────────────────────────────
const seraphMoves: Move[] = [
  {
    id: 'sa_lp', name: 'Bone Talon Jab', type: 'NORMAL',
    frameData: fd('sa_lp', 3, 3, 7, 26, 3, 9, 5, false, 3),
    meterGainOnHit: 7, meterGainOnBlock: 3,
    description: 'Quick talon-tip jab from extra arm.',
  },
  {
    id: 'sa_mp', name: 'Rusted Spear Thrust', type: 'NORMAL',
    frameData: fd('sa_mp', 6, 4, 11, 54, 7, 15, 9, false, 6),
    meterGainOnHit: 12, meterGainOnBlock: 5,
    description: 'Forward spear thrust.',
  },
  {
    id: 'sa_hp', name: 'Celestial Wrath', type: 'NORMAL',
    frameData: fd('sa_hp', 8, 5, 15, 82, 12, 21, 13, false, 8, 'MID', 'NORMAL', -75, 45),
    meterGainOnHit: 18, meterGainOnBlock: 7,
    description: 'Wings slash forward. High damage.',
  },
  {
    id: 'sa_lk', name: 'Talon Sweep', type: 'NORMAL',
    frameData: fd('sa_lk', 4, 3, 8, 22, 3, 8, 5, false, 2, 'LOW'),
    meterGainOnHit: 6, meterGainOnBlock: 3,
    description: 'Leg sweep. Low hit.',
  },
  {
    id: 'sa_mk', name: 'Wing Kick', type: 'NORMAL',
    frameData: fd('sa_mk', 7, 4, 12, 48, 6, 13, 8, false, 5),
    meterGainOnHit: 11, meterGainOnBlock: 4,
    description: 'Side kick with bone-wing leading edge.',
  },
  {
    id: 'sa_hk', name: 'Seraph\'s Fall', type: 'NORMAL',
    frameData: fd('sa_hk', 9, 5, 17, 76, 11, 19, 12, false, 7),
    meterGainOnHit: 16, meterGainOnBlock: 6,
    description: 'Diving heel drop.',
  },
  // COMMAND NORMAL: Multi-arm combo
  {
    id: 'sa_cmd_f_mp', name: 'Many-Armed Gospel', type: 'COMMAND_NORMAL',
    commandInput: 'F+MP',
    frameData: {
      id: 'sa_cmd_f_mp', totalFrames: 24, startupFrames: 6, activeFrames: 6, recoveryFrames: 12,
      hitboxes: [{
        rect: { x: 15, y: -70, w: 65, h: 35 },
        damage: 58, guardDamage: 10, hitstun: 16, blockstun: 10,
        knockdown: false, pushback: 5, type: 'MID', priority: 'NORMAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 50, h: 90 }],
      cancelableInto: ['sa_special_a', 'sa_special_b', 'sa_special_c'],
      superCancelable: true,
    },
    meterGainOnHit: 13, meterGainOnBlock: 5,
    description: 'F+MP — Two simultaneous spear thrusts from multiple arms. Hits twice.',
  },
  // SPECIAL A — Feather Barrage (QCF+P)
  {
    id: 'sa_special_a', name: 'Feather Barrage (Lluvia de Plumas)', type: 'SPECIAL',
    input: {
      id: 'qcf_p_sa', sequence: [2, 3, 6], button: ['LP', 'MP', 'HP'],
      windowFrames: 30, name: 'QCF+P',
    },
    frameData: {
      id: 'sa_special_a', totalFrames: 35, startupFrames: 8, activeFrames: 50, recoveryFrames: 27,
      hitboxes: [{
        rect: { x: 0, y: -80, w: 15, h: 15 },
        damage: 32, guardDamage: 10, hitstun: 10, blockstun: 7,
        knockdown: false, pushback: 7, type: 'PROJECTILE', priority: 'SPECIAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 50, h: 90 }],
      cancelableInto: [],
      superCancelable: false,
    },
    meterGainOnHit: 16, meterGainOnBlock: 8,
    description: 'QCF+P — Fires a diagonal volley of razor-edged feathers. Travels at mid-height, forcing crouch or jump.',
  },
  // SPECIAL B — Archangel's Descent (Aerial Anti-air, QCB+P)
  {
    id: 'sa_special_b', name: 'Archangel\'s Descent (Descenso Arcangélico)', type: 'SPECIAL',
    input: {
      id: 'qcb_p_sa', sequence: [2, 1, 4], button: ['LP', 'MP', 'HP'],
      windowFrames: 30, name: 'QCB+P',
    },
    frameData: {
      id: 'sa_special_b', totalFrames: 40, startupFrames: 3, activeFrames: 12, recoveryFrames: 25,
      hitboxes: [{
        rect: { x: 5, y: -110, w: 50, h: 90 },
        damage: 80, guardDamage: 15, hitstun: 24, blockstun: 14,
        knockdown: false, pushback: 7, type: 'MID', priority: 'SPECIAL', launchY: -6,
      }],
      hurtboxes: [{ x: 0, y: -115, w: 30, h: 20 }],
      cancelableInto: [],
      superCancelable: true,
    },
    meterGainOnHit: 26, meterGainOnBlock: 9,
    description: 'QCB+P — Launches straight up with spears aimed skyward. Invincible frames 1-4. Perfect anti-air.',
  },
  // SPECIAL C — Diving Spear (Air, QCF+K)
  {
    id: 'sa_special_c', name: 'Diving Spear (Lanza en Picado)', type: 'SPECIAL',
    input: {
      id: 'qcf_k_sa', sequence: [2, 3, 6], button: ['LK', 'MK', 'HK'],
      windowFrames: 30, name: 'QCF+K',
    },
    frameData: {
      id: 'sa_special_c', totalFrames: 45, startupFrames: 6, activeFrames: 8, recoveryFrames: 31,
      hitboxes: [{
        rect: { x: 5, y: -70, w: 60, h: 45 },
        damage: 60, guardDamage: 13, hitstun: 18, blockstun: 10,
        knockdown: false, pushback: 5, type: 'MID', priority: 'SPECIAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 50, h: 90 }],
      cancelableInto: ['sa_special_c'],
      superCancelable: false,
    },
    meterGainOnHit: 20, meterGainOnBlock: 8,
    description: 'QCF+K — Dives diagonally forward with all spears aimed down. Can be chained twice. Pressure tool.',
  },
  // SDM — "Wings of the Fallen"
  {
    id: 'sa_sdm', name: 'Wings of the Fallen (Alas del Caído)', type: 'SDM',
    input: {
      id: 'qcfx2_k_sa', sequence: [2, 3, 6, 2, 3, 6], button: ['LK', 'MK', 'HK'],
      windowFrames: 45, name: 'QCFx2+K',
    },
    meterCost: 1,
    frameData: {
      id: 'sa_sdm', totalFrames: 115, startupFrames: 6, activeFrames: 50, recoveryFrames: 59,
      hitboxes: [{
        rect: { x: -350, y: -150, w: 800, h: 140 },
        damage: 275, guardDamage: 45, hitstun: 42, blockstun: 24,
        knockdown: true, pushback: 0, type: 'MID', priority: 'SUPER', launchY: -9,
      }],
      hurtboxes: [],
      cancelableInto: [],
      superCancelable: false,
    },
    meterGainOnHit: 0, meterGainOnBlock: 5,
    description: 'QCFx2+K (1 Stock) — Ascends off-screen, then plummets down with all spears and wings extended. Hits the entire arena on impact. Screen-cracking divine fall.',
  },
];

// ──────────────────────────────────────────────────────────
// CHARACTER 5: THE INQUISITOR-ZEALOT — "El Inquisidor"
// Rekka / Pressure | Chain-whip wielder, sharp-dressed horror
// ──────────────────────────────────────────────────────────
const inquisitorMoves: Move[] = [
  {
    id: 'iq_lp', name: 'Knuckle Grace', type: 'NORMAL',
    frameData: fd('iq_lp', 4, 3, 8, 28, 4, 10, 6, false, 3),
    meterGainOnHit: 8, meterGainOnBlock: 3,
    description: 'Quick jab in pristine white glove.',
  },
  {
    id: 'iq_mp', name: 'Whip Crack', type: 'NORMAL',
    frameData: fd('iq_mp', 7, 4, 13, 55, 8, 15, 9, false, 6, 'MID'),
    meterGainOnHit: 13, meterGainOnBlock: 5,
    description: 'Lateral crack of the chain-whip.',
  },
  {
    id: 'iq_hp', name: 'Inquisitor\'s Verdict', type: 'NORMAL',
    frameData: fd('iq_hp', 10, 5, 19, 84, 13, 21, 14, false, 8, 'MID', 'NORMAL', -68, 40),
    meterGainOnHit: 19, meterGainOnBlock: 8,
    description: 'Full whip overhead arc. Long range.',
  },
  {
    id: 'iq_lk', name: 'Dress-Shoe Kick', type: 'NORMAL',
    frameData: fd('iq_lk', 5, 3, 9, 24, 3, 9, 5, false, 2, 'LOW'),
    meterGainOnHit: 7, meterGainOnBlock: 3,
    description: 'Precise low kick.',
  },
  {
    id: 'iq_mk', name: 'Boot Stomp', type: 'NORMAL',
    frameData: fd('iq_mk', 8, 4, 14, 50, 7, 14, 9, false, 5),
    meterGainOnHit: 11, meterGainOnBlock: 4,
    description: 'Heel down-stomp.',
  },
  {
    id: 'iq_hk', name: 'Zealot\'s Sweep', type: 'NORMAL',
    frameData: fd('iq_hk', 11, 5, 21, 78, 11, 19, 12, false, 7, 'LOW'),
    meterGainOnHit: 17, meterGainOnBlock: 6,
    description: 'Low sweeping kick with chain trailing.',
  },
  // COMMAND NORMAL: Step-in Whip
  {
    id: 'iq_cmd_f_hk', name: 'Step of Judgment', type: 'COMMAND_NORMAL',
    commandInput: 'F+HK',
    frameData: {
      id: 'iq_cmd_f_hk', totalFrames: 32, startupFrames: 9, activeFrames: 5, recoveryFrames: 18,
      hitboxes: [{
        rect: { x: 10, y: -65, w: 70, h: 35 },
        damage: 70, guardDamage: 13, hitstun: 19, blockstun: 12,
        knockdown: false, pushback: 7, type: 'MID', priority: 'NORMAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 50, h: 90 }],
      cancelableInto: ['iq_special_a', 'iq_special_b', 'iq_special_c'],
      superCancelable: true,
    },
    meterGainOnHit: 15, meterGainOnBlock: 6,
    description: 'F+HK — Steps forward and lashes with full chain-whip. Extended range overhead.',
  },
  // SPECIAL A — Holy Inquisition Burst (QCF+P)
  {
    id: 'iq_special_a', name: 'Inquisition Lash (Látigo Inquisitorial)', type: 'SPECIAL',
    input: {
      id: 'qcf_p_iq', sequence: [2, 3, 6], button: ['LP', 'MP', 'HP'],
      windowFrames: 30, name: 'QCF+P',
    },
    frameData: {
      id: 'iq_special_a', totalFrames: 42, startupFrames: 12, activeFrames: 55, recoveryFrames: 30,
      hitboxes: [{
        rect: { x: 0, y: -58, w: 18, h: 18 },
        damage: 40, guardDamage: 16, hitstun: 12, blockstun: 9,
        knockdown: false, pushback: 9, type: 'PROJECTILE', priority: 'SPECIAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 50, h: 90 }],
      cancelableInto: [],
      superCancelable: false,
    },
    meterGainOnHit: 18, meterGainOnBlock: 9,
    description: 'QCF+P — Swings chain so fast it creates a crescent of holy fire that flies forward.',
  },
  // SPECIAL B — Anti-Air: Rising Inquisition (QCB+K)
  {
    id: 'iq_special_b', name: 'Rising Judgment (Juicio Ascendente)', type: 'SPECIAL',
    input: {
      id: 'qcb_k_iq', sequence: [2, 1, 4], button: ['LK', 'MK', 'HK'],
      windowFrames: 30, name: 'QCB+K',
    },
    frameData: {
      id: 'iq_special_b', totalFrames: 44, startupFrames: 3, activeFrames: 9, recoveryFrames: 32,
      hitboxes: [{
        rect: { x: 8, y: -115, w: 52, h: 95 },
        damage: 78, guardDamage: 14, hitstun: 25, blockstun: 15,
        knockdown: false, pushback: 7, type: 'MID', priority: 'SPECIAL', launchY: -5,
      }],
      hurtboxes: [{ x: -5, y: -110, w: 32, h: 22 }],
      cancelableInto: [],
      superCancelable: true,
    },
    meterGainOnHit: 26, meterGainOnBlock: 9,
    description: 'QCB+K — Leaps upward lashing chain whip overhead. Invincible frames 1-4.',
  },
  // SPECIAL C — Rekka: Three-hit pressure chain (QCF+P, QCF+P, QCF+P)
  {
    id: 'iq_special_c', name: 'Holy Rekka (Tríada Inquisitorial)', type: 'SPECIAL',
    input: {
      id: 'qcf_p2_iq', sequence: [2, 3, 6], button: ['LP', 'MP', 'HP'],
      windowFrames: 30, name: 'QCF+P',
    },
    frameData: {
      id: 'iq_special_c', totalFrames: 36, startupFrames: 7, activeFrames: 5, recoveryFrames: 24,
      hitboxes: [{
        rect: { x: 15, y: -65, w: 60, h: 35 },
        damage: 40, guardDamage: 10, hitstun: 13, blockstun: 9,
        knockdown: false, pushback: 3, type: 'MID', priority: 'SPECIAL',
      }],
      hurtboxes: [{ x: -20, y: -90, w: 50, h: 90 }],
      cancelableInto: ['iq_special_c_2'],
      superCancelable: false,
    },
    meterGainOnHit: 15, meterGainOnBlock: 7,
    description: 'QCF+P (×3) — Inquisitor\'s three-step rekka. First: whip low; Second: whip mid; Third: whip overhead. Input each separately. Must land each.',
  },
  // SDM — "The Burning Verdict"
  {
    id: 'iq_sdm', name: 'The Burning Verdict (Veredicto Ardiente)', type: 'SDM',
    input: {
      id: 'qcfhcb_p_iq', sequence: [2, 3, 6, 4, 1, 2, 3, 6], button: ['LP', 'MP', 'HP'],
      windowFrames: 55, name: 'QCF,HCB+P',
    },
    meterCost: 1,
    frameData: {
      id: 'iq_sdm', totalFrames: 125, startupFrames: 10, activeFrames: 55, recoveryFrames: 60,
      hitboxes: [{
        rect: { x: -400, y: -130, w: 900, h: 120 },
        damage: 290, guardDamage: 50, hitstun: 44, blockstun: 26,
        knockdown: true, pushback: 0, type: 'MID', priority: 'SUPER', launchY: -8,
      }],
      hurtboxes: [],
      cancelableInto: [],
      superCancelable: false,
    },
    meterGainOnHit: 0, meterGainOnBlock: 5,
    description: 'QCF,HCB+P (1 Stock) — The Inquisitor swings the chain-whip in a massive arc that fills the entire screen with holy fire and chains.',
  },
];

// ──────────────────────────────────────────────────────────
// ROSTER ASSEMBLY
// ──────────────────────────────────────────────────────────
export const CHARACTER_ROSTER: FighterDefinition[] = [
  {
    id: 'penitent',
    name: 'El Condenado',
    title: 'The Penitent One',
    archetype: 'BALANCED',
    stats: { maxHealth: 1000, walkSpeed: 3.2, jumpHeight: 14.5, weight: 1.0, defense: 1.0 },
    palette: {
      primary: '#2a2030', secondary: '#5a4030', accent: '#8b1a1a',
      blood: '#cc2222', shadow: '#100810',
    },
    spriteConfig: {
      bodyColor: '#3a3040', armorColor: '#5a4a50', weaponColor: '#7a6060',
      eyeColor: '#cc2222', effectColor: '#8b1a1a', particleColor: '#cc2222',
    },
    moves: penitentMoves,
    lore: 'Condemned to walk the world in the Silence of those who mourn, bearing the weight of the True Guilt. His barbed sword, Mea Culpa, is both weapon and penance.',
  },
  {
    id: 'martyr',
    name: 'La Bestia Mártir',
    title: 'The Martyr-Beast',
    archetype: 'GRAPPLER',
    stats: { maxHealth: 1200, walkSpeed: 2.4, jumpHeight: 11.0, weight: 1.4, defense: 0.9 },
    palette: {
      primary: '#2a1810', secondary: '#4a2e1a', accent: '#6a4a2a',
      blood: '#aa1a1a', shadow: '#100808',
    },
    spriteConfig: {
      bodyColor: '#4a3020', armorColor: '#6a4a30', weaponColor: '#606878',
      eyeColor: '#ff4400', effectColor: '#aa2200', particleColor: '#884422',
    },
    moves: martyrMoves,
    lore: 'Once a penitent friar who prayed for the suffering of the world to be lifted. The Miracle answered, fusing their torment into his flesh with chains of living thorns.',
  },
  {
    id: 'oracle',
    name: 'La Oráculo Llorosa',
    title: 'The Weeping Oracle',
    archetype: 'ZONER',
    stats: { maxHealth: 850, walkSpeed: 2.8, jumpHeight: 15.0, weight: 0.8, defense: 1.1 },
    palette: {
      primary: '#1a1030', secondary: '#3a2050', accent: '#5a3070',
      blood: '#8822aa', shadow: '#080410',
    },
    spriteConfig: {
      bodyColor: '#2a1840', armorColor: '#4a2860', weaponColor: '#d4c8b0',
      eyeColor: '#cc88ff', effectColor: '#8822aa', particleColor: '#9933cc',
    },
    moves: oracleMoves,
    lore: 'She was chosen by the Miracle to witness everything — past, present, future. The knowledge tore out her eyes. Now she weeps blood and shattered glass, and bleeding icons orbit her like mourning planets.',
  },
  {
    id: 'seraph',
    name: 'La Abominación Seráfica',
    title: 'The Seraphic Abomination',
    archetype: 'AERIAL',
    stats: { maxHealth: 900, walkSpeed: 3.6, jumpHeight: 16.0, weight: 0.9, defense: 1.05 },
    palette: {
      primary: '#101828', secondary: '#1a2840', accent: '#303858',
      blood: '#aabbdd', shadow: '#080c14',
    },
    spriteConfig: {
      bodyColor: '#2a3850', armorColor: '#a0a8b8', weaponColor: '#7a7060',
      eyeColor: '#ffffff', effectColor: '#d8e0f0', particleColor: '#aabbcc',
    },
    moves: seraphMoves,
    lore: 'A seraph whose devotion to the Miracle was so absolute that the divine light granted too many blessings at once — arms, wings, eyes, all multiplied beyond holy geometry.',
  },
  {
    id: 'inquisitor',
    name: 'El Inquisidor',
    title: 'The Inquisitor-Zealot',
    archetype: 'PRESSURE',
    stats: { maxHealth: 950, walkSpeed: 3.0, jumpHeight: 13.5, weight: 1.1, defense: 0.95 },
    palette: {
      primary: '#18100a', secondary: '#382010', accent: '#7a6432',
      blood: '#c8a030', shadow: '#0c0804',
    },
    spriteConfig: {
      bodyColor: '#201408', armorColor: '#382010', weaponColor: '#8a7020',
      eyeColor: '#e8c840', effectColor: '#c8a030', particleColor: '#e8a020',
    },
    moves: inquisitorMoves,
    lore: 'The Grand Inquisitor who tortured confessions of miraculous sin from a thousand penitents. His ritualistic chain-whip is consecrated in the blood of every heretic he has judged.',
  },
];

// ── IMAGE GENERATION PROMPTS (Part 1 of brief) ──────────
// Stored as data for the asset reference panel in the game's UI
export const ASSET_PROMPTS: Record<string, string[]> = {
  penitent: [
    '16-bit pixel art fighting game sprite, The Penitent One, conical metal capirote helmet, full body dark knight armor with exposed bloody wounds, barbed Mea Culpa greatsword raised to chest, idle breathing stance, dark desaturated brown and deep crimson palette, chiaroscuro gothic lighting, black background, side-view 2D fighter spritesheet keyframe',
    '16-bit pixel art, The Penitent One WALK FORWARD animation keyframe, capirote knight stepping with purpose, sword held low at side, trailing blood droplets, dark stone floor, gothic pixel art style, side-view fighter',
    '16-bit pixel art, The Penitent One CROUCH frame, lowering conical helmet toward ground, barbed sword horizontal, penitential armor detail, gothic horror pixel art',
    '16-bit pixel art, The Penitent One LIGHT PUNCH startup frame, quick jab with mailed fist, helmet straight ahead, barbed sword on back, tarnished gold accent on armor, dark fighting game sprite',
    '16-bit pixel art, The Penitent One MEDIUM ATTACK horizontal blade slash, Mea Culpa sword arc trail in blood-red, capirote facing right, gothic dark palette, fighting game active frame sprite',
    '16-bit pixel art, The Penitent One HEAVY PUNCH overhead arc, massive barbed sword raised above conical helmet, dramatic chiaroscuro shadow below, knockdown attack pose, dark crimson and shadow blue palette',
    '16-bit pixel art, The Penitent One JUMP pose, cape billowing upward, sword pointed down, capirote silhouetted against moonless sky, pixel art side-view',
    '16-bit pixel art, The Penitent One BLOCK pose, sword held horizontally across body, helmet lowered defensively, blocking stance, gothic pixel art fighter',
    '16-bit pixel art, The Penitent One HIT STUN, reeling backward from impact, capirote slightly displaced, blood particles flying, pixel art side-view gothic',
    '16-bit pixel art, The Penitent One RISING MARTYRDOM anti-air uppercut, leaping straight up with sword extended skyward, invincibility flash aura, special move pose, dark gothic pixel',
    '16-bit pixel art, The Penitent One THORN PENANCE projectile launch, driving barbed sword into ground, crown-of-thorns wave emerging from earth, special move, gothic horror',
    '32-bit pixel art, The Penitent One SDM SUPER MOVE, massive crown of thorns erupting across entire arena floor, full-screen judgment attack, dramatic blood-red and shadow lighting, super desperation move cinematic',
  ],
  martyr: [
    '16-bit pixel art fighting game sprite, The Martyr-Beast, enormous deformed figure, shredded monk habit, thorny chains fused into flesh, idle stance with massive hunched silhouette, dark brown and bloody ochre palette, gothic horror side-view fighter',
    '16-bit pixel art, The Martyr-Beast WALK animation, lumbering forward, chains dragging on floor, torn habit trailing, heavy footstep impact, dark stone ground, gothic fighter sprite',
    '16-bit pixel art, The Martyr-Beast CROUCH, massive body compressed low, chains pooling around feet, grotesque deformed silhouette, dark palette',
    '16-bit pixel art, The Martyr-Beast CHAIN LASH light attack, flinging short chain toward opponent, fused flesh arm extended, bloody wound detail, monk habit torn, gothic pixel art',
    '16-bit pixel art, The Martyr-Beast BONE HAMMER medium punch, raising chain-fused fist overhead, downward smash, impact crater effect, heavy grappler fighter sprite',
    '16-bit pixel art, The Martyr-Beast MARTYRDOM SLAM, full-body overhead leap slam, massive impact shockwave, ground crack effect, knockdown attack pose, dark grotesque pixel art',
    '16-bit pixel art, The Martyr-Beast JUMP, enormous body launching upward awkwardly, chains dangling, torn monk habit spreading, gothic monster fighter sprite',
    '16-bit pixel art, The Martyr-Beast COMMAND GRAB startup, thorny chains extending outward to ensnare opponent, glowing thorns, gothic horror pixel art special move',
    '16-bit pixel art, The Martyr-Beast HIT STUN, massive body recoiling, chains whipping back, shredded habit fluttering, blood droplets, gothic dark fighter',
    '16-bit pixel art, The Martyr-Beast HEAVEN\'S CHAIN anti-air, launching chains straight upward, invincibility glow, massive body rising, gothic pixel art special move',
    '16-bit pixel art, The Martyr-Beast BARBED GOSPEL projectile, hurling compressed ball of thorny chains, trails of ichor, heavy arcing trajectory, gothic pixel art',
    '32-bit pixel art, The Martyr-Beast SDM MARTYRDOM JUDGMENT, super command grab, wrapping opponent in full-body thorn shroud, crushing through floor, screen-breaking impact, gothic horror desperation super',
  ],
  oracle: [
    '16-bit pixel art fighting game sprite, The Weeping Oracle, robed eyeless female figure, floating two feet above ground, shattered bleeding religious icons orbiting her, empty eye sockets with blood tears, pale ghostly robes, spectral purple and blue palette, gothic pixel art side-view idle',
    '16-bit pixel art, The Weeping Oracle FLOAT MOVEMENT, gliding forward slightly elevated, robes trailing, icons orbiting in different positions, dark gothic atmosphere',
    '16-bit pixel art, The Weeping Oracle CROUCH, descending to ground level, robes pooling, floating icons lowering with her, eyeless face angled down, gothic pixel art',
    '16-bit pixel art, The Weeping Oracle LIGHT ATTACK, pushing small bleeding relic orb forward, wrist extended, spectral glow, zoner fighter sprite',
    '16-bit pixel art, The Weeping Oracle MEDIUM ATTACK icon flail swing, shattered religious icon whipping on spiritual chain, horizontal arc, blood trail, gothic horror sprite',
    '16-bit pixel art, The Weeping Oracle REVELATION BLAST heavy attack, releasing pent-up icon energy in forward burst, spectral explosion, purple and white flash, gothic pixel art',
    '16-bit pixel art, The Weeping Oracle JUMP, ascending high with robes trailing downward, icons still orbiting, spectacular silhouette, gothic air-state fighter sprite',
    '16-bit pixel art, The Weeping Oracle BLOCK, robes pulling tight, icons forming barrier in front, defensive stance floating, gothic purple palette',
    '16-bit pixel art, The Weeping Oracle HIT STUN, recoiling in air, robes disrupted, icons scattering, blood tears flying, gothic pixel art fighter',
    '16-bit pixel art, The Weeping Oracle PILLAR OF TEARS anti-air, crystallized tear column erupting upward from below, invincibility aura, eyeless face tilted up, special move gothic horror pixel',
    '16-bit pixel art, The Weeping Oracle CRAWLING RELIQUARY projectile launch, icon crawling across ground trailing blood, slow ground projectile, zone control, gothic pixel art',
    '32-bit pixel art, The Weeping Oracle SDM TEARS OF HEAVEN, ascending dramatically, raining hundreds of shattered bleeding icons from sky, full-screen holy judgment, purple and blood-white palette, super desperation move',
  ],
  seraph: [
    '16-bit pixel art fighting game sprite, The Seraphic Abomination, corrupted angelic figure with skeletal bone wings, four extra arms holding rusted spears, torn seraph robes barely covering rotting angelic flesh, idle stance, pale silver and shadow blue palette, gothic horror side-view fighter',
    '16-bit pixel art, The Seraphic Abomination WALK animation, stalking forward, skeletal wings partially spread, multiple arms adjusting spear grips, unnatural gait, gothic dark pixel art',
    '16-bit pixel art, The Seraphic Abomination CROUCH, wings folding overhead, multiple arms bracing on ground, spears angled outward, crouching predator pose, pale silver gothic pixel art',
    '16-bit pixel art, The Seraphic Abomination BONE TALON JAB, extra arm extending with talon-tip jab, quick and precise, skeletal wing detail, pale fighter sprite gothic horror',
    '16-bit pixel art, The Seraphic Abomination RUSTED SPEAR THRUST, forward thrust with primary spear, corroded blade trail, multiple other arms stabilizing, gothic pixel art fighter active frame',
    '16-bit pixel art, The Seraphic Abomination CELESTIAL WRATH, skeletal wings slamming forward simultaneously with all spears, massive impact wave, corrupted divine energy, gothic pixel art heavy attack',
    '16-bit pixel art, The Seraphic Abomination JUMP, wings spreading for flight, multiple arms back for aerodynamics, ascending with unnatural grace, gothic air fighter sprite',
    '16-bit pixel art, The Seraphic Abomination FEATHER BARRAGE projectile, releasing volley of razor bone-feathers diagonally forward, trail of corrupted divine energy, gothic horror pixel',
    '16-bit pixel art, The Seraphic Abomination HIT STUN, multiple arms flailing, wings disrupted, spears knocked loose momentarily, recoiling in pain, pale blood, gothic pixel art',
    '16-bit pixel art, The Seraphic Abomination ARCHANGEL\'S DESCENT anti-air, all spears aimed skyward, rising fast with wings spread, invincibility flash, gothic horror special move pixel art',
    '16-bit pixel art, The Seraphic Abomination DIVING SPEAR, plummeting diagonally with all weapons extended downward, wing-folded dive, crushing impact pose, gothic dark pixel art special move',
    '32-bit pixel art, The Seraphic Abomination SDM WINGS OF THE FALLEN, ascending off-screen then crashing down with all spears and wings extended, full-arena impact, divine corruption explosion, screen-shattering super desperation move',
  ],
  inquisitor: [
    '16-bit pixel art fighting game sprite, The Inquisitor-Zealot, menacing sharp-dressed figure in pristine dark suit with golden religious accessories, ritualistic chain-whip coiled at side, blank inquisitor mask with single hollow eye, tarnished gold and blood-black palette, idle stance, gothic horror side-view fighter',
    '16-bit pixel art, The Inquisitor-Zealot WALK forward, disciplined military stride, chain-whip held in right hand trailing slightly, golden religious pins on lapel, dark gothic pixel art fighter sprite',
    '16-bit pixel art, The Inquisitor-Zealot CROUCH, lowering into controlled crouch, chain-whip coiled tightly, inquisitor mask angled forward, dark suit, gothic pixel art',
    '16-bit pixel art, The Inquisitor-Zealot LIGHT PUNCH knuckle jab, pristine gloved fist extended, precise and quick, chain still coiled, dark suit lapel, gothic horror fighter sprite',
    '16-bit pixel art, The Inquisitor-Zealot WHIP CRACK medium attack, lateral crack of ritualistic chain-whip, golden hooks visible on chain, blood mist, gothic pixel art fighting game sprite',
    '16-bit pixel art, The Inquisitor-Zealot INQUISITOR\'S VERDICT heavy attack, full overhead arc of chain-whip, massive reach, tarnished gold chain trail, dark suit, gothic horror pixel art',
    '16-bit pixel art, The Inquisitor-Zealot JUMP, rising with chain-whip raised for aerial strike, inquisitor mask tilted, dark suit jacket spreading, gothic pixel art air state',
    '16-bit pixel art, The Inquisitor-Zealot BLOCK, chain-whip held in defensive cross pattern, mask facing forward, controlled guard stance, gothic dark pixel art',
    '16-bit pixel art, The Inquisitor-Zealot HIT STUN, mask slightly dislodged, chain-whip flailing, suit disrupted, dark blood spatter, recoiling gothic pixel art fighter',
    '16-bit pixel art, The Inquisitor-Zealot RISING JUDGMENT anti-air, leaping with chain-whip overhead, invincibility glow, mask fixed forward, golden chain catching light, gothic pixel art special move',
    '16-bit pixel art, The Inquisitor-Zealot INQUISITION LASH projectile, swinging chain-whip so fast it creates crescent of holy fire, arc projectile launching forward, golden flame trail, gothic horror special move pixel art',
    '32-bit pixel art, The Inquisitor-Zealot SDM THE BURNING VERDICT, massive full-screen chain-whip arc filling entire arena with holy fire and golden chains, cinematic super move, everything in tarnished gold and blood-fire, gothic horror desperation super',
  ],
};
