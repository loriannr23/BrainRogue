import { creatures } from '../../data/creatures';
import {
  CREATURE_SPRITE_SIZE,
  creatureBackKey,
  creatureBackPath,
  creatureFrontKey,
  creatureFrontPath,
} from './SpriteSystem';
import { getCreatureIconKey, getCreatureIconPath } from './CreatureAssetRegistry';

export interface CreatureSpriteEntry {
  creatureId: string;
  front: {
    key: string;
    path: string;
    width: number;
    height: number;
  };
  back: {
    key: string;
    path: string;
    width: number;
    height: number;
    optional: true;
  };
  icon: {
    key: string;
    path: string;
    width: number;
    height: number;
    optional: true;
  };
}

export const creatureSpriteManifest: Record<string, CreatureSpriteEntry> = Object.fromEntries(
  creatures.map((creature) => [
    creature.id,
    {
      creatureId: creature.id,
      front: {
        key: creatureFrontKey(creature.id),
        path: creatureFrontPath(creature.id),
        width: CREATURE_SPRITE_SIZE,
        height: CREATURE_SPRITE_SIZE,
      },
      back: {
        key: creatureBackKey(creature.id),
        path: creatureBackPath(creature.id),
        width: CREATURE_SPRITE_SIZE,
        height: CREATURE_SPRITE_SIZE,
        optional: true,
      },
      icon: {
        key: getCreatureIconKey(creature.id),
        path: getCreatureIconPath(creature.id),
        width: 48,
        height: 48,
        optional: true,
      },
    },
  ]),
);

export const getCreatureSpriteEntry = (creatureId: string): CreatureSpriteEntry | undefined =>
  creatureSpriteManifest[creatureId];

export const listCreatureSpriteEntries = (): CreatureSpriteEntry[] => Object.values(creatureSpriteManifest);
