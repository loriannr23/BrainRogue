import Phaser from 'phaser';
import { BattleStatusId } from '../../types/creature';
import { EXTERNAL_VISUAL_ASSETS } from '../assets/UiAssetRegistry';
import type { MoveFxType } from './MoveFxRegistry';
import { UI_THEME } from '../../ui/theme';

export class FxManager {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly layer?: Phaser.GameObjects.Layer,
  ) {}

  playMoveFx(type: MoveFxType, from: Phaser.Math.Vector2, to: Phaser.Math.Vector2): Promise<void> {
    if (type === 'fire_beam') return this.playFireBeam(from, to);
    if (type === 'projectile') return this.playProjectile(from, to);
    if (type === 'explosion') return this.playExplosion(to.x, to.y);
    if (type === 'slash') return this.playSlash(to.x, to.y);
    return this.playPulse(to.x, to.y);
  }

  playHitSpark(x: number, y: number): void {
    if (this.scene.textures.exists(EXTERNAL_VISUAL_ASSETS.hitSpark.key)) {
      const spark = this.scene.add.image(x, y, EXTERNAL_VISUAL_ASSETS.hitSpark.key)
        .setOrigin(0.5)
        .setDisplaySize(42, 42);
      this.add(spark);
      this.scene.tweens.add({
        targets: spark,
        scaleX: spark.scaleX * 1.18,
        scaleY: spark.scaleY * 1.18,
        alpha: 0,
        duration: 150,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      });
      return;
    }

    const pieces = [
      [0, -12], [10, -7], [12, 0], [7, 9], [0, 12], [-8, 8], [-12, 0], [-8, -8],
    ];
    pieces.forEach(([dx, dy], index) => {
      const spark = this.scene.add.rectangle(x, y, index % 2 === 0 ? 10 : 7, 3, index % 2 === 0 ? UI_THEME.colors.text : UI_THEME.colors.accent, 1)
        .setOrigin(0.5)
        .setAngle(index * 45);
      this.add(spark);
      this.scene.tweens.add({
        targets: spark,
        x: x + dx,
        y: y + dy,
        alpha: 0,
        duration: 150,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      });
    });
  }

  private playFireBeam(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2): Promise<void> {
    return new Promise((resolve) => {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const angle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
      const beam = this.scene.add.rectangle(from.x + dx / 2, from.y + dy / 2, distance, 7, 0xf97316, 0.78)
        .setOrigin(0.5)
        .setAngle(angle);
      const core = this.scene.add.rectangle(from.x + dx / 2, from.y + dy / 2, distance * 0.92, 3, UI_THEME.colors.accent, 0.9)
        .setOrigin(0.5)
        .setAngle(angle);
      this.add(beam);
      this.add(core);

      for (let index = 0; index < 8; index += 1) {
        const t = (index + 1) / 9;
        const jitter = index % 2 === 0 ? -5 : 5;
        const ember = this.scene.add.rectangle(
          from.x + dx * t,
          from.y + dy * t + jitter,
          5,
          5,
          index % 2 === 0 ? 0xf97316 : UI_THEME.colors.accent,
          0.92,
        ).setOrigin(0.5);
        this.add(ember);
        this.scene.tweens.add({
          targets: ember,
          y: ember.y + jitter,
          alpha: 0,
          duration: 210,
          ease: 'Quad.easeOut',
          onComplete: () => ember.destroy(),
        });
      }

      this.scene.tweens.add({
        targets: [beam, core],
        alpha: 0,
        scaleY: 1.25,
        duration: 240,
        ease: 'Quad.easeOut',
        onComplete: () => {
          beam.destroy();
          core.destroy();
          resolve();
        },
      });
    });
  }

  private playProjectile(from: Phaser.Math.Vector2, to: Phaser.Math.Vector2): Promise<void> {
    return new Promise((resolve) => {
      const projectile = this.scene.add.rectangle(from.x, from.y, 10, 10, UI_THEME.colors.accent, 1)
        .setOrigin(0.5)
        .setAngle(45);
      const trail = this.scene.add.rectangle(from.x, from.y, 18, 4, UI_THEME.colors.text, 0.45)
        .setOrigin(0.5);
      const angle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(from.x, from.y, to.x, to.y));
      trail.setAngle(angle);
      this.add(trail);
      this.add(projectile);
      this.scene.tweens.add({
        targets: trail,
        x: to.x,
        y: to.y,
        alpha: 0,
        duration: 180,
        ease: 'Cubic.easeOut',
        onComplete: () => trail.destroy(),
      });
      this.scene.tweens.add({
        targets: projectile,
        x: to.x,
        y: to.y,
        angle: projectile.angle + 180,
        duration: 180,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          projectile.destroy();
          resolve();
        },
      });
    });
  }

  private playExplosion(x: number, y: number): Promise<void> {
    return new Promise((resolve) => {
      const outer = this.scene.add.circle(x, y, 10, UI_THEME.colors.accent, 0.5);
      const inner = this.scene.add.circle(x, y, 5, UI_THEME.colors.text, 0.85);
      this.add(outer);
      this.add(inner);
      this.scene.tweens.add({
        targets: outer,
        radius: 42,
        alpha: 0,
        duration: 170,
        ease: 'Quad.easeOut',
        onComplete: () => outer.destroy(),
      });
      this.scene.tweens.add({
        targets: inner,
        radius: 22,
        alpha: 0,
        duration: 150,
        ease: 'Quad.easeOut',
        onComplete: () => {
          inner.destroy();
          resolve();
        },
      });
    });
  }

  private playSlash(x: number, y: number): Promise<void> {
    return new Promise((resolve) => {
      this.playPhysicalImpact(x, y);
      this.scene.time.delayedCall(120, resolve);
    });
  }

  private playPulse(x: number, y: number): Promise<void> {
    return new Promise((resolve) => {
      this.playSpecialPulse(x, y);
      this.scene.time.delayedCall(180, resolve);
    });
  }

  playPhysicalImpact(x: number, y: number): void {
    if (this.scene.textures.exists(EXTERNAL_VISUAL_ASSETS.physicalImpact.key)) {
      const impact = this.scene.add.image(x, y, EXTERNAL_VISUAL_ASSETS.physicalImpact.key)
        .setOrigin(0.5)
        .setAngle(-18)
        .setDisplaySize(64, 32);
      this.add(impact);
      this.scene.tweens.add({
        targets: impact,
        alpha: 0,
        scaleX: impact.scaleX * 1.08,
        duration: 120,
        ease: 'Quad.easeOut',
        onComplete: () => impact.destroy(),
      });
      return;
    }

    const line = this.scene.add.rectangle(x, y, 48, 4, UI_THEME.colors.text, 1)
      .setOrigin(0.5)
      .setAngle(-28);
    this.add(line);
    line.setScale(0.4, 1);
    this.scene.tweens.add({
      targets: line,
      scaleX: 1,
      alpha: 0,
      duration: 120,
      ease: 'Quad.easeOut',
      onComplete: () => line.destroy(),
    });
  }

  playSpecialPulse(x: number, y: number): void {
    if (this.scene.textures.exists(EXTERNAL_VISUAL_ASSETS.specialPulse.key)) {
      const pulse = this.scene.add.image(x, y, EXTERNAL_VISUAL_ASSETS.specialPulse.key)
        .setOrigin(0.5)
        .setDisplaySize(46, 46);
      this.add(pulse);
      this.scene.tweens.add({
        targets: pulse,
        alpha: 0,
        scaleX: pulse.scaleX * 1.35,
        scaleY: pulse.scaleY * 1.35,
        duration: 180,
        ease: 'Quad.easeOut',
        onComplete: () => pulse.destroy(),
      });
      return;
    }

    const ring = this.scene.add.circle(x, y, 10, UI_THEME.colors.accent, 0)
      .setStrokeStyle(2, UI_THEME.colors.accent, 1);
    this.add(ring);
    this.scene.tweens.add({
      targets: ring,
      radius: 34,
      alpha: 0,
      duration: 180,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy(),
    });
  }

  playStatusFx(status: BattleStatusId, x: number, y: number): void {
    if (status === 'burn') {
      this.playStatusBits(x, y, UI_THEME.colors.accent, [[-8, 4], [0, -8], [8, 4]], 160);
      return;
    }
    if (status === 'poison') {
      this.playStatusBits(x, y, UI_THEME.colors.border, [[-8, -2], [0, -10], [8, -2]], 180, true);
      return;
    }
    if (status === 'rooted') {
      this.playStatusBits(x, y, UI_THEME.colors.accent, [[-10, 5], [-2, -7], [10, 4]], 180);
      return;
    }

    const mark = this.scene.add.text(x, y - 8, '?', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: UI_THEME.css.accent,
      stroke: UI_THEME.css.bg,
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.add(mark);
    this.scene.tweens.add({
      targets: mark,
      angle: 22,
      y: y - 28,
      alpha: 0,
      duration: 220,
      ease: 'Quad.easeOut',
      onComplete: () => mark.destroy(),
    });
  }

  playRewardShine(x: number, y: number): void {
    this.playStatusBits(x, y, UI_THEME.colors.accent, [[-14, -4], [0, -14], [14, -4], [0, 12]], 180);
  }

  playWaveStart(waveNumber: number): void {
    const { width } = this.scene.scale;
    const flash = this.scene.add.rectangle(width / 2, 92, 260, 42, UI_THEME.colors.accent, 0.18).setOrigin(0.5);
    const label = this.scene.add.text(width / 2, 92, `Wave ${waveNumber}`, {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: UI_THEME.css.white,
      stroke: UI_THEME.css.bg,
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.add(flash);
    this.add(label);
    flash.setScale(0.85, 1);
    label.setScale(0.92);
    this.scene.tweens.add({ targets: flash, scaleX: 1, alpha: 0, duration: 180, ease: 'Quad.easeOut', onComplete: () => flash.destroy() });
    this.scene.tweens.add({ targets: label, scaleX: 1, scaleY: 1, alpha: 0, duration: 520, ease: 'Quad.easeOut', onComplete: () => label.destroy() });
  }

  private playStatusBits(x: number, y: number, color: number, offsets: number[][], duration: number, round = false): void {
    offsets.forEach(([dx, dy]) => {
      const bit = round
        ? this.scene.add.circle(x, y, 4, color, 1)
        : this.scene.add.rectangle(x, y, 7, 7, color, 1).setOrigin(0.5);
      this.add(bit);
      this.scene.tweens.add({
        targets: bit,
        x: x + dx,
        y: y + dy,
        alpha: 0,
        duration,
        ease: 'Quad.easeOut',
        onComplete: () => bit.destroy(),
      });
    });
  }

  private add(object: Phaser.GameObjects.GameObject): void {
    this.layer?.add(object);
  }
}
