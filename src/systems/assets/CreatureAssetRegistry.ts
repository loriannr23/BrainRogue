import Phaser from 'phaser';

export const CREATURE_ASSET_ROOT = '/assets/sprites/creatures';
export const FALLBACK_FRONT_KEY = 'creature:fallback:front';
export const FALLBACK_BACK_KEY = 'creature:fallback:back';
export const FALLBACK_ICON_KEY = 'creature:fallback:icon';

export const getCreatureFrontKey = (creatureId: string): string => `creature:${creatureId}:front_idle`;
export const getCreatureBackKey = (creatureId: string): string => `creature:${creatureId}:back`;
export const getCreatureIconKey = (creatureId: string): string => `creature:${creatureId}:icon`;

export const getCreatureFrontPath = (creatureId: string): string =>
  `${CREATURE_ASSET_ROOT}/${creatureId}/front_idle.png`;
export const getCreatureBackPath = (creatureId: string): string =>
  `${CREATURE_ASSET_ROOT}/back/${creatureId}.png`;
export const getCreatureIconPath = (creatureId: string): string =>
  `${CREATURE_ASSET_ROOT}/${creatureId}/icon.png`;

const creatureIdsWithFrontAndIconAssets = new Set([
  'tungling',
  'sahur_drummer',
  'tung_tung_tung_sahur',
  'patapim',
  'patapim_turbo',
  'brr_brr_patapim',
]);

const creatureIdsWithBackAssets = new Set<string>();

export const hasTexture = (scene: Phaser.Scene, key: string): boolean => scene.textures.exists(key);

export const preloadCreatureAssets = (scene: Phaser.Scene, creatureIds: string[]): void => {
  creatureIds.forEach((creatureId) => {
    if (creatureIdsWithFrontAndIconAssets.has(creatureId)) {
      queueImageIfMissing(scene, getCreatureFrontKey(creatureId), getCreatureFrontPath(creatureId));
      queueImageIfMissing(scene, getCreatureIconKey(creatureId), getCreatureIconPath(creatureId));
    }
    if (creatureIdsWithBackAssets.has(creatureId)) {
      queueImageIfMissing(scene, getCreatureBackKey(creatureId), getCreatureBackPath(creatureId));
    }
  });
};

export const resolveCreatureFrontKey = (scene: Phaser.Scene, creatureId: string): string =>
  hasTexture(scene, getCreatureFrontKey(creatureId)) ? getCreatureFrontKey(creatureId) : FALLBACK_FRONT_KEY;

export const resolveCreatureBackKey = (scene: Phaser.Scene, creatureId: string): string =>
  hasTexture(scene, getCreatureBackKey(creatureId)) ? getCreatureBackKey(creatureId) : resolveCreatureFrontKey(scene, creatureId);

export const resolveCreatureIconKey = (scene: Phaser.Scene, creatureId: string): string =>
  hasTexture(scene, getCreatureIconKey(creatureId)) ? getCreatureIconKey(creatureId) : FALLBACK_ICON_KEY;

const queueImageIfMissing = (scene: Phaser.Scene, key: string, path: string): void => {
  if (scene.textures.exists(key)) return;
  scene.load.image(key, path);
};
