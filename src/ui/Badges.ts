import Phaser from 'phaser';
import { CreatureClassification, CreatureType } from '../types/creature';
import { RewardRarity } from '../systems/progression/RewardSystem';
import { logMissingAsset, UI_ASSETS } from '../systems/assets/UiAssetRegistry';
import { typeIconKey } from '../systems/assets/SpriteSystem';
import { renderIconSafe } from '../utils/renderIconSafe';
import { colorToCss, RARITY_COLORS, textStyle, TYPE_COLORS, UI_THEME } from './theme';

export class TypeBadge {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, type: CreatureType) {
    const width = Math.max(76, type.length * 10 + 24);
    const color = TYPE_COLORS[type];
    const bg = scene.add.rectangle(0, 0, width, 24, UI_THEME.colors.panel, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, UI_THEME.colors.border);
    const stripe = scene.add.rectangle(0, 0, 7, 24, color, 1).setOrigin(0, 0);
    const iconKey = typeIconKey(type);
    const icon = scene.textures.exists(iconKey)
      ? renderIconSafe(scene, iconKey, 8, 4, {
        boxWidth: 16,
        boxHeight: 16,
        maxWidth: 16,
        maxHeight: 16,
        missingAssetPath: UI_ASSETS.typeSource.path,
      })
      : createMissingIconBox(scene, 8, 4, 16, 16, UI_ASSETS.typeSource.path);
    const label = scene.add.text(width / 2 + 3, 12, type.toUpperCase(), textStyle(12, colorToCss(color), {
      align: 'center',
      fixedWidth: width - 28,
    })).setOrigin(0.5);
    this.container = scene.add.container(x, y, [bg, stripe, icon, label]);
  }
}

const createMissingIconBox = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  assetPath: string,
): Phaser.GameObjects.Rectangle => {
  logMissingAsset(assetPath);
  return scene.add.rectangle(x, y, width, height, UI_THEME.colors.panelDark, 1)
    .setOrigin(0, 0)
    .setStrokeStyle(1, UI_THEME.colors.border);
};

export class RarityBadge {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, rarity: RewardRarity) {
    const width = Math.max(92, rarity.length * 10 + 28);
    const color = RARITY_COLORS[rarity];
    const bg = scene.add.rectangle(0, 0, width, 26, UI_THEME.colors.panel, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, UI_THEME.colors.border);
    const label = scene.add.text(width / 2, 13, rarity.toUpperCase(), textStyle(12, colorToCss(color), {
      align: 'center',
      fixedWidth: width - 10,
    })).setOrigin(0.5);
    this.container = scene.add.container(x, y, [bg, label]);
  }
}

export class ClassificationBadge {
  readonly container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, classification: Exclude<CreatureClassification, 'normal'>) {
    const width = Math.max(112, classification.length * 10 + 28);
    const color = classification === 'legendary' ? UI_THEME.colors.white : classification === 'mythical' ? UI_THEME.colors.muted : UI_THEME.colors.accent;
    const bg = scene.add.rectangle(0, 0, width, 26, UI_THEME.colors.panel, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, UI_THEME.colors.border);
    const label = scene.add.text(width / 2, 13, classification.toUpperCase(), textStyle(12, colorToCss(color), {
      align: 'center',
      fixedWidth: width - 10,
    })).setOrigin(0.5);
    this.container = scene.add.container(x, y, [bg, label]);
  }
}
