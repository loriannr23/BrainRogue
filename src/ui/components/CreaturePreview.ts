import Phaser from 'phaser';
import { getCreatureFrontKey, getCreatureFrontPath, resolveCreatureFrontKey } from '../../systems/assets/CreatureAssetRegistry';
import { logMissingAsset } from '../../systems/assets/UiAssetRegistry';
import { fitSpriteToBox } from '../../utils/fitSpriteToBox';
import { UI_THEME } from '../theme';

export interface CreaturePreviewOptions {
  maxWidth: number;
  maxHeight: number;
  stageWidth?: number;
  stageHeight?: number;
  maxScale?: number;
  mask?: boolean;
  idleBob?: boolean;
}

export class CreaturePreview {
  readonly container: Phaser.GameObjects.Container;
  readonly sprite: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, creatureId: string, options: CreaturePreviewOptions) {
    const stageWidth = options.stageWidth ?? options.maxWidth;
    const stageHeight = options.stageHeight ?? options.maxHeight;
    const stage = scene.add.rectangle(0, 0, stageWidth, stageHeight, UI_THEME.colors.bg, 1)
      .setStrokeStyle(1, UI_THEME.colors.border);
    if (!scene.textures.exists(getCreatureFrontKey(creatureId))) {
      logMissingAsset(getCreatureFrontPath(creatureId));
    }
    this.sprite = scene.add.image(0, 0, resolveCreatureFrontKey(scene, creatureId)).setOrigin(0.5);
    fitSpriteToBox(this.sprite, options.maxWidth, options.maxHeight, options.maxScale ?? 1);

    const children: Phaser.GameObjects.GameObject[] = [stage, this.sprite];
    if (options.mask ?? true) {
      const maskShape = scene.add.graphics();
      maskShape.fillStyle(0xffffff);
      maskShape.fillRect(-options.maxWidth / 2, -options.maxHeight / 2, options.maxWidth, options.maxHeight);
      maskShape.setVisible(false);
      this.sprite.setMask(maskShape.createGeometryMask());
      children.push(maskShape);
    }

    this.container = scene.add.container(x, y, children);
    if (options.idleBob) {
      scene.tweens.add({
        targets: this.sprite,
        y: -8,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
