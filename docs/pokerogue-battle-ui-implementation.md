# PokeRogue-Style Battle UI Implementation

## Summary

Implemented the battle-only PokeRogue-style renderer described in `docs/pokerogue-ui-source-analysis.md`.

Gameplay systems were not changed:

- Battle engine unchanged
- Damage/rewards/waves unchanged
- Starter select unchanged
- Keyboard-only battle input preserved

## Changed Files

- `src/systems/assets/PokeRogueUiAssetRegistry.ts`
- `src/game/scenes/PreloadScene.ts`
- `src/ui/BattleUI.ts`
- `src/ui/BattleLog.ts`
- `src/ui/HealthBar.ts`
- `tsconfig.json`
- `docs/pokerogue-battle-ui-implementation.md`

## Asset Loading

Battle UI now loads original PokeRogue UI assets from:

`public/assets/pokerogue/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui`

Loaded assets:

- `bg.png/json`
- `cursor.png`
- `windows/window_1.png`
- `pbinfo_player.png`
- `pbinfo_enemy_mini.png`
- `overlay_hp.png/json`
- `overlay_exp.png`

Battle UI no longer imports or uses `public/assets/ui-extracted`.

## 320x180 UI Layer

`BattleUI` now creates a PokeRogue-style logical UI layer:

- logical width: `320`
- logical height: `180`
- scale: `min(scene.scale.width / 320, scene.scale.height / 180)`
- root position: bottom-aligned, matching PokeRogue's negative-Y battle UI layout

All battle HUD/menu/message elements are placed in this logical coordinate system and scaled together.

## Battle HUD

`HealthBar` was rebuilt to use native PokeRogue HUD assets:

- Player HUD: `pbinfo_player`
- Enemy HUD: `pbinfo_enemy_mini`
- HP overlay: `overlay_hp` atlas frames `high`, `medium`, `low`
- Player EXP strip: `overlay_exp`

HP bars update by tweening `scaleX`, matching the PokeRogue pattern instead of using stretched rectangle panels.

## Message Box

`BattleLog` now uses the original PokeRogue battle message background:

- `bg` atlas frame `1`
- origin `(0, 1)`
- text at source-coordinate style position `12, -39`

It does not use `overlay_message`.

## Command Menu

`BattleUI` command mode now uses:

- `window_1` nineslice at `202, 0`, size `118x48`
- command labels at the source layout:
  - Fight: `217, -38.7`
  - Ball: `272.8, -38.7`
  - Creature: `217, -22.7`
  - Run: `272.8, -22.7`
- `cursor` positioned with the PokeRogue column/row offsets

Keyboard navigation remains `Arrow keys / WASD`, confirm with `Enter / Space`.

## Fight Menu

Fight mode now uses:

- move window at `0, 0`, size `243x48`
- move details window at `240, 0`, size `80x48`
- move labels in a compact 2x2 source-coordinate grid
- `cursor` source-coordinate movement
- PP/type/power/accuracy detail text in the right detail window

Back remains selectable from the move menu.

## Build Notes

`tsconfig.json` now excludes `src/external` from BrainRogue compilation. The PokeRogue reference source contains its own aliases/dependencies and should remain a local reference tree, not part of BrainRogue's TypeScript build.

## Verification

- `npm run build` passed.
- A short `npm run dev -- --host 127.0.0.1` smoke start was attempted. The command stayed running until the tool timeout, which is the expected behavior for Vite dev server startup.

## Remaining Follow-Up

- Visual browser pass to tune exact font sizes against real screenshots.
- Optional replacement of text HP/level with PokeRogue-style number atlas rendering.
- Starter select and party screen are intentionally untouched for this sprint.
