import Phaser from 'phaser';

export type CreatureAnimationState = 'idle' | 'attack' | 'hurt';

interface CreatureAnimatorOptions {
  attackDirection: 1 | -1;
  idleDistance?: number;
  idleDuration?: number;
  attackDistance?: number;
  hurtDistance?: number;
}

export class CreatureAnimator {
  private readonly baseX: number;
  private readonly baseY: number;
  private readonly attackDirection: 1 | -1;
  private readonly idleDistance: number;
  private readonly idleDuration: number;
  private readonly attackDistance: number;
  private readonly hurtDistance: number;
  private state: CreatureAnimationState = 'idle';
  private destroyed = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly sprite: Phaser.GameObjects.Image,
    options: CreatureAnimatorOptions,
  ) {
    this.baseX = Math.round(sprite.x);
    this.baseY = Math.round(sprite.y);
    this.attackDirection = options.attackDirection;
    this.idleDistance = options.idleDistance ?? 2;
    this.idleDuration = options.idleDuration ?? 1400;
    this.attackDistance = options.attackDistance ?? 24;
    this.hurtDistance = options.hurtDistance ?? 14;
    this.setAnimationState('idle');
  }

  setAnimationState(state: CreatureAnimationState): Promise<void> {
    if (this.destroyed || !this.sprite.active) return Promise.resolve();
    this.state = state;
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.setAngle(0);
    this.sprite.setX(this.baseX);

    if (state === 'idle') {
      this.startIdle();
      return Promise.resolve();
    }

    if (state === 'attack') {
      return this.playAttack();
    }

    return this.playHurt();
  }

  destroy(): void {
    this.destroyed = true;
    this.scene.tweens.killTweensOf(this.sprite);
  }

  private startIdle(): void {
    this.sprite.setPosition(this.baseX, this.baseY);
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.baseY - this.idleDistance,
      duration: this.idleDuration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private playAttack(): Promise<void> {
    this.sprite.setPosition(this.baseX, this.baseY);
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.sprite,
        x: this.baseX + this.attackDirection * this.attackDistance,
        duration: 90,
        yoyo: true,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.sprite.setPosition(this.baseX, this.baseY);
          this.returnToIdle();
          resolve();
        },
      });
    });
  }

  private playHurt(): Promise<void> {
    this.sprite.setPosition(this.baseX, this.baseY);
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.sprite,
        x: this.baseX - this.attackDirection * this.hurtDistance,
        duration: 52,
        yoyo: true,
        ease: 'Quad.easeOut',
        onComplete: () => {
          this.sprite.setPosition(this.baseX, this.baseY);
          this.returnToIdle();
          resolve();
        },
      });
    });
  }

  private returnToIdle(): void {
    if (this.destroyed || !this.sprite.active || !this.sprite.visible) return;
    this.state = 'idle';
    this.startIdle();
  }
}
