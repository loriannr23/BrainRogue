import Phaser from 'phaser';
import { logMissingAsset } from '../systems/assets/UiAssetRegistry';
import { UI_THEME } from '../ui/theme';

export interface RenderIconSafeOptions {
  boxWidth: number;
  boxHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  origin?: [number, number];
  padding?: number;
  preserveAspectRatio?: true;
  missingAssetPath?: string;
  debugBounds?: boolean;
  tint?: number;
}

export const renderIconSafe = (
  scene: Phaser.Scene,
  textureKey: string,
  x: number,
  y: number,
  options: RenderIconSafeOptions,
): Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle => {
  const boxX = Math.round(x);
  const boxY = Math.round(y);
  const boxWidth = Math.round(options.boxWidth);
  const boxHeight = Math.round(options.boxHeight);
  const padding = Math.max(0, Math.round(options.padding ?? 0));
  const maxWidth = Math.max(1, Math.round(options.maxWidth ?? boxWidth - padding * 2));
  const maxHeight = Math.max(1, Math.round(options.maxHeight ?? boxHeight - padding * 2));

  if (options.debugBounds ?? isIconDebugEnabled()) {
    scene.add.rectangle(boxX, boxY, boxWidth, boxHeight, UI_THEME.colors.accent, 0.08)
      .setOrigin(0, 0)
      .setStrokeStyle(1, UI_THEME.colors.accent, 0.45);
  }

  if (!scene.textures.exists(textureKey)) {
    logMissingAsset(options.missingAssetPath ?? textureKey);
    return scene.add.rectangle(boxX + boxWidth / 2, boxY + boxHeight / 2, maxWidth, maxHeight, UI_THEME.colors.panelDark, 1)
      .setOrigin(0.5)
      .setStrokeStyle(1, UI_THEME.colors.border);
  }

  const icon = scene.add.image(boxX + boxWidth / 2, boxY + boxHeight / 2, textureKey);
  const frame = icon.frame;
  const frameWidth = frame.width || frame.realWidth || 1;
  const frameHeight = frame.height || frame.realHeight || 1;
  const scale = Math.min(maxWidth / frameWidth, maxHeight / frameHeight, 1);
  icon.setOrigin(...(options.origin ?? [0.5, 0.5]));
  icon.setScale(scale);
  icon.setPosition(Math.round(boxX + boxWidth / 2), Math.round(boxY + boxHeight / 2));
  const tint = options.tint ?? normalizedUiIconTint(textureKey);
  if (tint !== undefined) {
    icon.setTint(tint);
  }

  return icon;
};

const normalizedUiIconTint = (textureKey: string): number | undefined => {
  if (
    textureKey === 'ui:cursor'
    || textureKey.startsWith('type-icon:')
    || textureKey.startsWith('reward-icon:')
    || textureKey.startsWith('battle-command-icon:')
  ) {
    return UI_THEME.colors.accent;
  }
  return undefined;
};

const isIconDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('debugIconBounds')
    || window.localStorage.getItem('brainrogue.debugIconBounds') === '1';
};
