import { CreatureType } from '../../types/creature';
import {
  CREATURE_ASSET_ROOT,
  FALLBACK_BACK_KEY,
  FALLBACK_FRONT_KEY,
  getCreatureBackKey,
  getCreatureBackPath,
  getCreatureFrontKey,
  getCreatureFrontPath,
  resolveCreatureBackKey,
  resolveCreatureFrontKey,
} from './CreatureAssetRegistry';

export const CREATURE_SPRITE_SIZE = 96;
export const CREATURE_SPRITE_FORMAT = 'png';
export const CREATURE_SPRITE_ROOT = CREATURE_ASSET_ROOT;

export const creatureFrontKey = getCreatureFrontKey;
export const creatureBackKey = getCreatureBackKey;

export const creatureFrontPath = getCreatureFrontPath;
export const creatureBackPath = getCreatureBackPath;

export const typeIconKey = (type: CreatureType): string => `type-icon:${type}`;

export const resolveCreatureTexture = (
  textures: Phaser.Textures.TextureManager,
  definitionId: string,
  facing: 'front' | 'back',
): string => {
  const sceneLike = { textures } as Phaser.Scene;
  return facing === 'front'
    ? resolveCreatureFrontKey(sceneLike, definitionId)
    : resolveCreatureBackKey(sceneLike, definitionId);
};

export { FALLBACK_BACK_KEY, FALLBACK_FRONT_KEY };
