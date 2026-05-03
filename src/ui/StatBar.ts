import Phaser from 'phaser';
import { colorToCss, textStyle, UI_THEME } from './theme';

export class StatBar {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, label: string, value: number, maxValue = 120, width = 210) {
    const ratio = Phaser.Math.Clamp(value / maxValue, 0, 1);
    const name = scene.add.text(0, 0, label.toUpperCase(), textStyle(12, UI_THEME.css.muted, { fixedWidth: 44 }));
    const track = scene.add.rectangle(48, 2, width - 88, 12, UI_THEME.colors.bg, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, UI_THEME.colors.border);
    const fillColor = ratio > 0.68 ? UI_THEME.colors.success : ratio > 0.4 ? UI_THEME.colors.muted : UI_THEME.colors.danger;
    const fill = scene.add.rectangle(50, 4, Math.max(4, (width - 92) * ratio), 8, fillColor, 1).setOrigin(0, 0);
    const valueText = scene.add.text(width - 30, -1, String(value), textStyle(12, colorToCss(fillColor), {
      align: 'right',
      fixedWidth: 30,
    }));
    this.container = scene.add.container(x, y, [name, track, fill, valueText]);
  }
}
