import Phaser from 'phaser';
import { UI_THEME } from '../theme';

export interface PixelFrameOptions {
  stroke?: number;
  alpha?: number;
  cornerSize?: number;
}

export class PixelFrame {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, options: PixelFrameOptions = {}) {
    const stroke = options.stroke ?? UI_THEME.colors.border;
    const alpha = options.alpha ?? 0.95;
    const graphics = scene.add.graphics();
    graphics.lineStyle(1, stroke, alpha);
    graphics.strokeRect(0, 0, width, height);
    this.container = scene.add.container(x, y, [graphics]);
  }
}
