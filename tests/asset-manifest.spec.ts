import { expect, test } from '@playwright/test';
import { creatures } from '../src/data/creatures';
import { CREATURE_SPRITE_SIZE } from '../src/systems/assets/SpriteSystem';
import { creatureSpriteManifest } from '../src/systems/assets/CreatureSpriteManifest';

test('every creature has a sprite manifest entry', () => {
  for (const creature of creatures) {
    const entry = creatureSpriteManifest[creature.id];
    expect(entry, `missing sprite entry for ${creature.id}`).toBeDefined();
    expect(entry.front.path).toBe(`/assets/sprites/creatures/${creature.id}/front_idle.png`);
    expect(entry.back.path).toBe(`/assets/sprites/creatures/back/${creature.id}.png`);
    expect(entry.icon.path).toBe(`/assets/sprites/creatures/${creature.id}/icon.png`);
    expect(entry.front.width).toBe(CREATURE_SPRITE_SIZE);
    expect(entry.front.height).toBe(CREATURE_SPRITE_SIZE);
    expect(entry.back.optional).toBe(true);
  }
});
