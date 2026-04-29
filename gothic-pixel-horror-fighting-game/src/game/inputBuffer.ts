// ============================================================
// SACRILEGIUM PUGNA — MOTION INPUT BUFFER SYSTEM
// KOF-Style 20-Frame Input Buffer with Complex Motion Detection
// ============================================================

import type { InputButton, InputFrame, MotionDefinition, MotionNotation, MotionStep } from './types';
import { INPUT_BUFFER_SIZE, MOTION_WINDOW_FRAMES } from './constants';

// ── Held Keys State ──────────────────────────────────────
export interface HeldKeysState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  lp: boolean;
  mp: boolean;
  hp: boolean;
  lk: boolean;
  mk: boolean;
  hk: boolean;
}

// ── Numpad Notation Converter ────────────────────────────
// Translates held directional keys into KOF numpad notation.
// Facing right: 6=Right, 4=Left, 8=Up, 2=Down
// Facing left:  6=Left,  4=Right (mirrored automatically)
export function keysToNumpad(held: HeldKeysState, facingRight: boolean): MotionStep {
  const up = held.up;
  const down = held.down;
  const fwd = facingRight ? held.right : held.left;
  const back = facingRight ? held.left : held.right;

  if (up && fwd)   return 9;
  if (up && back)  return 7;
  if (down && fwd) return 3;
  if (down && back)return 1;
  if (up)          return 8;
  if (down)        return 2;
  if (fwd)         return 6;
  if (back)        return 4;
  return 5; // neutral
}

// ── Direction History Entry ─────────────────────────────
export interface DirHistoryEntry {
  dir: MotionStep;
  frame: number;
}

// ── Input Buffer Class ───────────────────────────────────
export class InputBuffer {
  private buttonBuffer: InputFrame[] = [];
  private dirHistory: DirHistoryEntry[] = [];
  private currentDir: MotionStep = 5;
  private currentFrame: number = 0;
  // chargeAccum reserved for future charge-move support

  tick(frame: number) {
    this.currentFrame = frame;
    // Clean old entries beyond the window
    const cutoff = frame - MOTION_WINDOW_FRAMES * 3;
    this.dirHistory = this.dirHistory.filter(e => e.frame > cutoff);
    this.buttonBuffer = this.buttonBuffer.filter(e => e.frame > cutoff);
  }

  // Called every frame with current numpad direction
  updateDirection(dir: MotionStep) {
    if (dir !== this.currentDir) {
      this.currentDir = dir;
      this.dirHistory.push({ dir, frame: this.currentFrame });
      // Keep last 60 entries
      if (this.dirHistory.length > 60) {
        this.dirHistory = this.dirHistory.slice(-60);
      }
    }
  }

  // Called on button press (not hold)
  registerButton(button: InputButton) {
    this.buttonBuffer.push({ button, held: false, frame: this.currentFrame });
    if (this.buttonBuffer.length > INPUT_BUFFER_SIZE) {
      this.buttonBuffer = this.buttonBuffer.slice(-INPUT_BUFFER_SIZE);
    }
  }

  // ── Core Motion Check ──────────────────────────────────
  // Checks if a motion sequence was completed within the timing window.
  // The last direction must have been held at button-press time.
  // Returns the matched button that was pressed, or null.
  checkMotion(motion: MotionDefinition, currentFrame: number): InputButton | null {
    const { sequence, button, windowFrames } = motion;

    // Check each recently pressed button that matches the motion's button
    const validButtons = Array.isArray(button) ? button : [button];

    for (const btn of validButtons) {
      // Find the most recent press of this button within the window
      const recentPress = [...this.buttonBuffer]
        .reverse()
        .find(f => f.button === btn && currentFrame - f.frame <= windowFrames);

      if (!recentPress) continue;

      // Now verify the direction sequence was completed BEFORE the button press
      // and within the timing window
      if (this.matchDirectionSequence(sequence, recentPress.frame, windowFrames)) {
        return btn;
      }
    }
    return null;
  }

  // ── Direction Sequence Matching ────────────────────────
  // Validates that the numpad sequence appears in order within the time window.
  // Allows "holds" — intermediate directions between steps are tolerated.
  private matchDirectionSequence(
    sequence: MotionNotation,
    pressFrame: number,
    windowFrames: number
  ): boolean {
    if (sequence.length === 0) return true;
    if (sequence.length === 1) return true; // single direction always passes

    // Get all direction changes in the relevant window
    const windowStart = pressFrame - windowFrames;
    const relevantDirs = this.dirHistory.filter(
      e => e.frame >= windowStart && e.frame <= pressFrame
    );

    if (relevantDirs.length === 0) return false;

    // Walk through sequence, finding each step in order
    let seqIdx = 0;
    for (const entry of relevantDirs) {
      if (entry.dir === sequence[seqIdx]) {
        seqIdx++;
        if (seqIdx >= sequence.length) return true;
      }
    }

    // Also check if the final required direction matches current
    // (the sequence may end on the held position before button press)
    const lastRequired = sequence[sequence.length - 1];
    if (seqIdx === sequence.length - 1 && this.currentDir === lastRequired) {
      return true;
    }

    return seqIdx >= sequence.length;
  }

  // ── Check QCF (2→3→6) ─────────────────────────────────
  checkQCF(button: InputButton | InputButton[], frame: number): InputButton | null {
    return this.checkMotion({
      id: 'qcf', sequence: [2, 3, 6], button,
      windowFrames: MOTION_WINDOW_FRAMES, name: 'QCF',
    }, frame);
  }

  // ── Check QCB (2→1→4) ─────────────────────────────────
  checkQCB(button: InputButton | InputButton[], frame: number): InputButton | null {
    return this.checkMotion({
      id: 'qcb', sequence: [2, 1, 4], button,
      windowFrames: MOTION_WINDOW_FRAMES, name: 'QCB',
    }, frame);
  }

  // ── Check HCF (4→1→2→3→6) ────────────────────────────
  checkHCF(button: InputButton | InputButton[], frame: number): InputButton | null {
    return this.checkMotion({
      id: 'hcf', sequence: [4, 1, 2, 3, 6], button,
      windowFrames: MOTION_WINDOW_FRAMES + 10, name: 'HCF',
    }, frame);
  }

  // ── Check HCB (6→3→2→1→4) ────────────────────────────
  checkHCB(button: InputButton | InputButton[], frame: number): InputButton | null {
    return this.checkMotion({
      id: 'hcb', sequence: [6, 3, 2, 1, 4], button,
      windowFrames: MOTION_WINDOW_FRAMES + 10, name: 'HCB',
    }, frame);
  }

  // ── Check QCFx2 (2→3→6→2→3→6) ───────────────────────
  checkQCFx2(button: InputButton | InputButton[], frame: number): InputButton | null {
    return this.checkMotion({
      id: 'qcfx2', sequence: [2, 3, 6, 2, 3, 6], button,
      windowFrames: MOTION_WINDOW_FRAMES + 15, name: 'QCFx2',
    }, frame);
  }

  // ── Check QCBx2 (2→1→4→2→1→4) ───────────────────────
  checkQCBx2(button: InputButton | InputButton[], frame: number): InputButton | null {
    return this.checkMotion({
      id: 'qcbx2', sequence: [2, 1, 4, 2, 1, 4], button,
      windowFrames: MOTION_WINDOW_FRAMES + 15, name: 'QCBx2',
    }, frame);
  }

  // ── Check HCBx2 ───────────────────────────────────────
  checkHCBx2(button: InputButton | InputButton[], frame: number): InputButton | null {
    return this.checkMotion({
      id: 'hcbx2', sequence: [6, 3, 2, 1, 4, 6, 3, 2, 1, 4], button,
      windowFrames: MOTION_WINDOW_FRAMES + 25, name: 'HCBx2',
    }, frame);
  }

  // ── Check QCF+HCB (complex SDM motion) ───────────────
  checkQCFHCB(button: InputButton | InputButton[], frame: number): InputButton | null {
    return this.checkMotion({
      id: 'qcfhcb', sequence: [2, 3, 6, 4, 1, 2, 3, 6], button,
      windowFrames: MOTION_WINDOW_FRAMES + 25, name: 'QCF,HCB',
    }, frame);
  }

  // ── Check DP (6→2→3) Shorthand ───────────────────────
  checkDP(button: InputButton | InputButton[], frame: number): InputButton | null {
    return this.checkMotion({
      id: 'dp', sequence: [6, 2, 3], button,
      windowFrames: MOTION_WINDOW_FRAMES - 5, name: 'DP',
    }, frame);
  }

  // ── Check simple button tap (within buffer window) ────
  checkButton(button: InputButton, frame: number, window: number = 8): boolean {
    return this.buttonBuffer.some(
      f => f.button === button && frame - f.frame <= window
    );
  }

  // ── Check held direction ───────────────────────────────
  isHolding(dir: MotionStep): boolean {
    return this.currentDir === dir;
  }

  // ── Consume button (remove from buffer after use) ─────
  consumeButton(button: InputButton) {
    const idx = [...this.buttonBuffer].reverse().findIndex(f => f.button === button);
    if (idx !== -1) {
      this.buttonBuffer.splice(this.buttonBuffer.length - 1 - idx, 1);
    }
  }

  getCurrentDir(): MotionStep { return this.currentDir; }
  getButtonBuffer(): InputFrame[] { return [...this.buttonBuffer]; }
}

// ── Input Manager (Keyboard → Buffer) ────────────────────
export class InputManager {
  private held: HeldKeysState = {
    up: false, down: false, left: false, right: false,
    lp: false, mp: false, hp: false, lk: false, mk: false, hk: false,
  };
  private buffer: InputBuffer = new InputBuffer();
  private keyMap: Record<string, keyof HeldKeysState>;
  private lastDir: MotionStep = 5;

  constructor(keyMap: Record<string, keyof HeldKeysState>) {
    this.keyMap = keyMap;
  }

  handleKeyDown(key: string) {
    const mapped = this.keyMap[key];
    if (!mapped) return;
    if (!this.held[mapped]) {
      this.held[mapped] = true;
      // Register attack buttons as press events
      if (['lp', 'mp', 'hp', 'lk', 'mk', 'hk'].includes(mapped)) {
        this.buffer.registerButton(mapped.toUpperCase() as InputButton);
      }
    }
  }

  handleKeyUp(key: string) {
    const mapped = this.keyMap[key];
    if (!mapped) return;
    this.held[mapped] = false;
  }

  tick(frame: number, facingRight: boolean) {
    const dir = keysToNumpad(this.held, facingRight);
    this.buffer.tick(frame);
    this.buffer.updateDirection(dir);
    this.lastDir = dir;
  }

  getBuffer(): InputBuffer { return this.buffer; }
  getHeld(): HeldKeysState { return { ...this.held }; }
  getCurrentDir(): MotionStep { return this.lastDir; }

  isHolding(key: keyof HeldKeysState): boolean {
    return this.held[key];
  }
}
