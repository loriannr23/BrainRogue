import Phaser from 'phaser';
import { UI_THEME } from './theme';

export interface PixelPanelOptions {
  fill?: number;
  stroke?: number;
  alpha?: number;
  accent?: number;
  shadow?: boolean;
}

export class PixelPanel {
  readonly container: Phaser.GameObjects.Container;
  readonly background: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, options: PixelPanelOptions = {}) {
    const fill = options.fill ?? UI_THEME.colors.panel;
    const stroke = options.stroke ?? UI_THEME.colors.border;
    const alpha = 1;
    const children: Phaser.GameObjects.GameObject[] = [];

    this.background = scene.add.rectangle(0, 0, width, height, fill, alpha)
      .setOrigin(0, 0)
      .setStrokeStyle(1, stroke, 1);
    children.push(this.background);

    this.container = scene.add.container(x, y, children);
    this.container.setSize(width, height);
  }
}
