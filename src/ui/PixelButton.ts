import Phaser from 'phaser';
import { addDebugHitbox } from '../utils/inputDebug';
import { colorToCss, textStyle, UI_THEME } from './theme';

export interface PixelButtonOptions {
  fill?: number;
  stroke?: number;
  hoverFill?: number;
  pressedFill?: number;
  disabled?: boolean;
  debugLabel?: string;
  fontSize?: number;
}

export class PixelButton {
  readonly container: Phaser.GameObjects.Container;
  readonly bounds: { x: number; y: number; width: number; height: number };
  private readonly background: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    _onClick: () => void,
    options: PixelButtonOptions = {},
  ) {
    const roundedX = Math.round(x);
    const roundedY = Math.round(y);
    const roundedWidth = Math.round(width);
    const roundedHeight = Math.round(height);
    this.bounds = { x: roundedX, y: roundedY, width: roundedWidth, height: roundedHeight };
    const disabled = options.disabled ?? false;
    const fill = disabled ? UI_THEME.colors.panelDark : options.fill ?? UI_THEME.colors.panel;
    const stroke = disabled ? UI_THEME.colors.disabled : options.stroke ?? UI_THEME.colors.border;

    this.background = scene.add.rectangle(0, 0, roundedWidth, roundedHeight, fill, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, stroke, disabled ? 1 : 0);
    this.label = scene.add.text(roundedWidth / 2, roundedHeight / 2, text, textStyle(options.fontSize ?? 20, disabled ? colorToCss(UI_THEME.colors.disabled) : UI_THEME.css.white, {
      align: 'center',
      fixedWidth: roundedWidth - 18,
    })).setOrigin(0.5);

    const children: Phaser.GameObjects.GameObject[] = [this.background, this.label];
    this.container = scene.add.container(roundedX, roundedY, children);
    addDebugHitbox(scene, this.bounds, options.debugLabel ?? `button:${text}`);
  }

  destroy(): void {
    this.container.destroy(true);
  }
}
