import Phaser from 'phaser';
import { textStyle, UI_THEME } from './theme';

export class SectionHeader {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, width: number) {
    const line = scene.add.rectangle(0, 28, width, 1, UI_THEME.colors.border, 1).setOrigin(0, 0);
    const label = scene.add.text(0, 0, text, textStyle(22, UI_THEME.css.white, {
      fixedWidth: width,
    }));
    this.container = scene.add.container(x, y, [label, line]);
  }
}
