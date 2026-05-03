import Phaser from 'phaser';
import { addDebugHitbox } from '../utils/inputDebug';
import { colorToCss, textStyle, TYPE_COLORS, UI_THEME } from './theme';

export class MoveButton {
  readonly container: Phaser.GameObjects.Container;
  readonly bounds: { x: number; y: number; width: number; height: number };
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly normalFill: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    moveName: string,
    typeLabel: string,
    ppLabel: string,
    _onClick: () => void,
    enabled = true,
  ) {
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);
    const roundedWidth = Math.round(width);
    const roundedHeight = Math.round(height);
    this.bounds = { x: roundedX, y: roundedY, width: roundedWidth, height: roundedHeight };
    const typeColor = TYPE_COLORS[typeLabel as keyof typeof TYPE_COLORS] ?? UI_THEME.colors.accent;
    this.normalFill = enabled ? UI_THEME.colors.panel : UI_THEME.colors.panelDark;
    this.bg = scene.add.rectangle(0, 0, roundedWidth, roundedHeight, this.normalFill)
      .setOrigin(0, 0)
      .setStrokeStyle(1, enabled ? UI_THEME.colors.border : UI_THEME.colors.disabled, 0);
    const nameText = scene.add.text(16, 10, moveName, textStyle(17, enabled ? UI_THEME.css.white : colorToCss(UI_THEME.colors.disabled), {
      fixedWidth: roundedWidth - 32,
    }));
    const metaText = scene.add.text(16, roundedHeight - 26, `${typeLabel.toUpperCase()}   ${ppLabel}`, textStyle(13, enabled ? colorToCss(typeColor) : colorToCss(UI_THEME.colors.disabled), {
      fixedWidth: roundedWidth - 32,
    }));

    this.container = scene.add.container(roundedX, roundedY, [this.bg, nameText, metaText]);
    addDebugHitbox(scene, this.bounds, `move:${moveName}`);
  }

  destroy(): void {
    this.container.destroy(true);
  }

  setPressed(): void {
    this.bg.setFillStyle(UI_THEME.selection.fill);
    this.bg.setStrokeStyle(1, UI_THEME.selection.border, 1);
  }

  setIdle(): void {
    if (!this.container.active) return;
    this.bg.setFillStyle(this.normalFill);
    this.bg.setStrokeStyle(1, UI_THEME.colors.border, 0);
  }
}
