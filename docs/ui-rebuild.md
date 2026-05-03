# UI Rebuild

## Scope

This pass replaces the BattleScene UI rendering layer with assets extracted into `public/assets/ui-extracted/`.

Gameplay, battle resolution, rewards, waves, and keyboard input logic were not changed.

## Asset Mapping

- Dialogue/message panels: `overlay_message_99ab35a6` 9-slice pieces.
- Command menu panel: `overlay_message_99ab35a6` 9-slice pieces.
- Move menu and placeholder panels: `overlay_message_99ab35a6` 9-slice pieces.
- Player HUD panel: `pbinfo_player_bde6be98` 9-slice pieces.
- Enemy HUD panel: `pbinfo_enemy_mini_1a2c2001` 9-slice pieces.
- HP bar overlay: `overlay_hp_0710fad1`.
- EXP bar overlay: `overlay_exp_1156cb11`.
- Selection cursor: `cursor_e39c642a`.
- Battle command highlight: `bmenu_sel_3cdaec83`.
- Move/menu highlight: `mmenu_sel_cf3aa4dc`.

## Implementation Notes

- `src/systems/assets/ExtractedUiAssetRegistry.ts` preloads the extracted UI assets.
- `src/ui/PokeRogueFrame.ts` builds tiled 9-slice frames from extracted corners, edges, and center pieces.
- `src/ui/BattleLog.ts`, `src/ui/HealthBar.ts`, and `src/ui/BattleUI.ts` now use extracted UI assets instead of flat rectangle panels for the battle HUD and command area.
- Images are not stretched as full panels. Resizable UI uses tiled 9-slice pieces; bar overlays use tile sprites.

## Not Changed

- BattleEngine logic.
- Damage calculation.
- Reward logic.
- Wave logic.
- Keyboard-only input behavior.
