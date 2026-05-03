# BrainRogue Creature Sprite Guide

This folder is the source location for creature sprites used by the Phaser loader.

## Required Format

- File type: PNG
- Size: source can vary, but the creature must be centered and readable
- Background: transparent alpha channel
- Style: readable pixel-art silhouette
- Framing: creature centered, with a few pixels of breathing room
- Do not include text, UI frames, shadows outside the sprite, or backgrounds
- Do not bake checkerboard transparency previews into the PNG. If a checkerboard is visible in-game, re-export the asset with real alpha transparency.

## Naming

- Front/preview sprite: `public/assets/sprites/creatures/{id}/front_idle.png`
- UI icon: `public/assets/sprites/creatures/{id}/icon.png`
- Back/player sprite: `public/assets/sprites/creatures/back/{id}.png`

Examples:

- `public/assets/sprites/creatures/tung_tung_tung_sahur/front_idle.png`
- `public/assets/sprites/creatures/tung_tung_tung_sahur/icon.png`
- `public/assets/sprites/creatures/back/tung_tung_tung_sahur.png`

The `{id}` must match the creature `id` in `src/data/creatures.ts`.

## Runtime Rules

- Front sprites are used for Starter Preview and current battle creatures.
- Icon sprites are used for compact cards/lists.
- Back sprites are optional for a future player-facing battle pose.
- Back sprites are optional for now.
- If any sprite is missing, BrainRogue generates a procedural `96x96` fallback texture at runtime.
- Missing files should never crash the game.

## Code Mapping

The mapping is generated in:

- `src/systems/assets/CreatureSpriteManifest.ts`

Key/path helpers live in:

- `src/systems/assets/SpriteSystem.ts`

Loader behavior lives in:

- `src/systems/assets/AssetLoader.ts`

## Generator Prompt Template

```text
Create a 96x96 transparent-background pixel-art monster sprite for a browser roguelite monster battler.
Creature name: {name}
Types: {types}
Role: {role}
Mood: clean but meme-chaotic, readable silhouette, strong type-color accents.
Output: single centered sprite, no text, no UI, no background, crisp pixel art.
```
