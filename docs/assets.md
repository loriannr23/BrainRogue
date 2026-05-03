# BrainRogue Asset Requirements

## Creature PNG Transparency

Creature sprites must be exported as PNG files with a real alpha channel.

Do not include a checkerboard pattern in the image. Checkerboards are editor previews for transparency; if they are visible in-game, the checkerboard was baked into the PNG pixels and the asset needs to be re-exported.

Recommended export rules:

- Use PNG with alpha transparency enabled.
- Keep the creature centered with transparent padding.
- Do not include backgrounds, UI frames, shadows outside the sprite, or text.
- Use `front_idle.png` for full preview and battle sprites.
- Use `icon.png` for compact UI cards.

Expected paths:

- `public/assets/sprites/creatures/{creatureId}/front_idle.png`
- `public/assets/sprites/creatures/{creatureId}/icon.png`

Back sprites are optional for now. Battle currently uses `front_idle.png` for both sides.
