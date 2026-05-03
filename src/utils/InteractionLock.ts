import { DEBUG_INPUT } from './inputDebug';

export class InteractionLock {
  private locked = false;

  constructor(private readonly owner: string) {}

  get isLocked(): boolean {
    return this.locked;
  }

  lock(reason: string): void {
    if (this.locked) return;
    this.locked = true;
    if (DEBUG_INPUT) {
      console.debug(`[InputLock:${this.owner}] lock`, reason);
    }
  }

  unlock(reason: string): void {
    if (!this.locked) return;
    this.locked = false;
    if (DEBUG_INPUT) {
      console.debug(`[InputLock:${this.owner}] unlock`, reason);
    }
  }

  reset(reason: string): void {
    this.locked = false;
    if (DEBUG_INPUT) {
      console.debug(`[InputLock:${this.owner}] reset`, reason);
    }
  }
}
