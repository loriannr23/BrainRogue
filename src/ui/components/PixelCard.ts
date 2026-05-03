import Phaser from 'phaser';
import { UI_THEME } from '../theme';

export interface PixelCardOptions {
  fill?: number;
  stroke?: number;
  selected?: boolean;
  interactive?: boolean;
}

export class PixelCard {
  readonly container: Phaser.GameObjects.Container;
  readonly background: Phaser.GameObjects.Rectangle;
  readonly selection: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, options: PixelCardOptions = {}) {
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);
    const roundedWidth = Math.round(width);
    const roundedHeight = Math.round(height);
    const stroke = options.selected ? UI_THEME.selection.border : options.stroke ?? UI_THEME.colors.border;
    this.background = scene.add.rectangle(0, 0, roundedWidth, roundedHeight, options.selected ? UI_THEME.selection.fill : options.fill ?? UI_THEME.colors.panel, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, stroke, options.selected ? 1 : 0);
    this.selection = scene.add.rectangle(0, 0, roundedWidth, roundedHeight, UI_THEME.colors.panel, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, UI_THEME.selection.border, options.selected ? 1 : 0);
    const children: Phaser.GameObjects.GameObject[] = [this.background, this.selection];
    this.container = scene.add.container(roundedX, roundedY, children);
    this.container.setSize(roundedWidth, roundedHeight);
  }

  setSelected(selected: boolean): void {
    this.background.setFillStyle(selected ? UI_THEME.selection.fill : UI_THEME.colors.panel);
    this.background.setStrokeStyle(1, selected ? UI_THEME.selection.border : UI_THEME.colors.border, selected ? 1 : 0);
    this.selection.setAlpha(1);
    this.selection.setStrokeStyle(1, UI_THEME.selection.border, selected ? 1 : 0);
  }
}
