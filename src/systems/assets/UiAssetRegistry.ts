import Phaser from 'phaser';
import type { CreatureType } from '../../types/creature';
import type { RewardKind } from '../progression/RewardSystem';
import { typeIconKey } from './SpriteSystem';

export const UI_ASSETS = {
  buttonSource: { key: 'ui:source:battle_buttons', path: '/assets/ui/buttons/ui_button_icon_set.png' },
  cursorSource: { key: 'ui:source:cursor', path: '/assets/ui/icons/cursor.png' },
  typeSource: { key: 'ui:source:type_badges', path: '/assets/icons/types/types_badges.png' },
  itemSource: { key: 'ui:source:item_icons', path: '/assets/icons/items/item_icons.png' },
  barSource: { key: 'ui:source:bars', path: '/assets/ui/icons/bars.png' },
};

export const UI_DERIVED_ASSETS = {
  cursor: 'ui:cursor',
};

export const rewardIconKey = (kind: RewardKind): string => `reward-icon:${kind}`;
export const battleCommandIconKey = (command: 'fight' | 'ball' | 'creature' | 'run'): string => `battle-command-icon:${command}`;

const missingLogged = new Set<string>();

export const logMissingAsset = (path: string): void => {
  if (!isLocalDev() || missingLogged.has(path)) return;
  missingLogged.add(path);
  console.warn(`Missing asset: ${path}`);
};

const isLocalDev = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

export const BATTLE_BACKGROUND_ASSETS = {
  sky: { key: 'battle:bg:sky', path: '/assets/backgrounds/battle/battle_sky.png' },
  ground: { key: 'battle:bg:ground', path: '/assets/backgrounds/battle/ground.png' },
  particles: { key: 'battle:bg:particles', path: '/assets/ui/fx/particles.png' },
  platform: { key: 'battle:bg:platform', path: '/assets/backgrounds/battle/platform.png' },
  shadow: { key: 'battle:bg:shadow', path: '/assets/backgrounds/battle/shadow.png' },
};

export const EXTERNAL_VISUAL_ASSETS = {
  battleBackground: { key: 'external:battle:background', path: '/assets/external/backgrounds/battle_background.png' },
  battleParticles: { key: 'external:battle:particles', path: '/assets/external/particles/battle_particles.png' },
  playerPlatform: { key: 'external:battle:platform:player', path: '/assets/external/platforms/player_platform.png' },
  enemyPlatform: { key: 'external:battle:platform:enemy', path: '/assets/external/platforms/enemy_platform.png' },
  shadow: { key: 'external:battle:shadow', path: '/assets/external/platforms/shadow.png' },
  hitSpark: { key: 'external:fx:hit_spark', path: '/assets/external/fx/hit_spark.png' },
  physicalImpact: { key: 'external:fx:physical_impact', path: '/assets/external/fx/physical_impact.png' },
  specialPulse: { key: 'external:fx:special_pulse', path: '/assets/external/fx/special_pulse.png' },
};

export const MENU_BACKGROUND_ASSETS = {
  background: { key: 'menu:bg', path: '/assets/backgrounds/menu/menu_background.png' },
  particles: { key: 'menu:particles', path: '/assets/ui/fx/particles.png' },
};

export const preloadUiAssets = (scene: Phaser.Scene): void => {
  scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
    logMissingAsset(file.src);
  });
  [
    ...Object.values(UI_ASSETS),
    ...Object.values(BATTLE_BACKGROUND_ASSETS),
    ...Object.values(EXTERNAL_VISUAL_ASSETS),
    ...Object.values(MENU_BACKGROUND_ASSETS),
  ].forEach((asset) => {
    if (!scene.textures.exists(asset.key)) {
      scene.load.image(asset.key, asset.path);
    }
  });
};

export const createUiDerivedTextures = (scene: Phaser.Scene): void => {
  createCroppedTexture(scene, UI_DERIVED_ASSETS.cursor, UI_ASSETS.cursorSource, SPRITE_SHEET_MAPPINGS.cursor.primary, { width: 16, height: 16 });

  (Object.keys(SPRITE_SHEET_MAPPINGS.types) as CreatureType[]).forEach((type) => {
    createCroppedTexture(scene, typeIconKey(type), UI_ASSETS.typeSource, SPRITE_SHEET_MAPPINGS.types[type], { width: 16, height: 16 });
  });

  (Object.keys(SPRITE_SHEET_MAPPINGS.rewards) as RewardKind[]).forEach((kind) => {
    createCroppedTexture(scene, rewardIconKey(kind), UI_ASSETS.itemSource, SPRITE_SHEET_MAPPINGS.rewards[kind], { width: 48, height: 48 });
  });

  (Object.keys(SPRITE_SHEET_MAPPINGS.battleCommands) as Array<'fight' | 'ball' | 'creature' | 'run'>).forEach((command) => {
    createCroppedTexture(scene, battleCommandIconKey(command), UI_ASSETS.buttonSource, SPRITE_SHEET_MAPPINGS.battleCommands[command], { width: 24, height: 24 });
  });
};

export const SPRITE_SHEET_MAPPINGS = {
  cursor: {
    primary: { x: 341, y: 172, width: 232, height: 386 },
  },
  types: {
    water: { x: 150, y: 116, width: 197, height: 203 },
    earth: { x: 428, y: 116, width: 201, height: 203 },
    air: { x: 706, y: 116, width: 200, height: 203 },
    light: { x: 982, y: 116, width: 203, height: 203 },
    meme: { x: 1265, y: 116, width: 199, height: 203 },
    sound: { x: 150, y: 371, width: 197, height: 203 },
    chaos: { x: 428, y: 371, width: 201, height: 203 },
    fire: { x: 706, y: 371, width: 201, height: 203 },
    electric: { x: 982, y: 371, width: 203, height: 203 },
    toxic: { x: 1265, y: 371, width: 199, height: 203 },
    metal: { x: 150, y: 626, width: 197, height: 204 },
    psychic: { x: 428, y: 626, width: 201, height: 204 },
    ancient: { x: 706, y: 626, width: 200, height: 204 },
    food: { x: 982, y: 626, width: 203, height: 204 },
    shadow: { x: 1265, y: 626, width: 199, height: 204 },
  } satisfies Record<CreatureType, CropRect>,
  rewards: {
    heal: { x: 125, y: 200, width: 254, height: 316 },
    statBoost: { x: 506, y: 200, width: 299, height: 302 },
    newMove: { x: 928, y: 210, width: 330, height: 262 },
    fullHeal: { x: 1339, y: 208, width: 350, height: 288 },
    rareItem: { x: 1339, y: 208, width: 350, height: 288 },
    evolutionItem: { x: 1339, y: 208, width: 350, height: 288 },
    currency: { x: 1785, y: 208, width: 265, height: 308 },
  } satisfies Record<RewardKind, CropRect>,
  battleCommands: {
    fight: { x: 50, y: 45, width: 171, height: 171 },
    creature: { x: 275, y: 66, width: 171, height: 148 },
    ball: { x: 54, y: 272, width: 157, height: 150 },
    run: { x: 261, y: 266, width: 178, height: 112 },
  },
};

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextureSize {
  width: number;
  height: number;
}

const createCroppedTexture = (
  scene: Phaser.Scene,
  key: string,
  sourceAsset: { key: string; path: string },
  crop: CropRect,
  size: TextureSize,
): void => {
  if (scene.textures.exists(key)) return;
  if (!scene.textures.exists(sourceAsset.key)) {
    logMissingAsset(sourceAsset.path);
    return;
  }

  const source = scene.textures.get(sourceAsset.key).getSourceImage() as CanvasImageSource;
  const texture = scene.textures.createCanvas(key, size.width, size.height);
  if (!texture) return;
  const context = texture.getContext();
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, size.width, size.height);
  context.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, size.width, size.height);
  texture.refresh();
};
