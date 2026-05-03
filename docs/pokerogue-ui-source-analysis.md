# PokeRogue UI Source Analysis for BrainRogue

## Scope

This report analyzes the checked-in PokeRogue reference source under `src/external/pokerogue` and the local PokeRogue assets under `public/assets/pokerogue`. It is intentionally limited to UI structure, layout logic, scaling rules, coordinates, and asset usage patterns. It does not recommend replacing BrainRogue gameplay code.

## Source Files Inspected

PokeRogue source:

- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/scene-base.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/loading-scene.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/ui/ui.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/ui/ui-theme.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/ui/battle-info/battle-info.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/ui/battle-info/player-battle-info.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/ui/battle-info/enemy-battle-info.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/ui/handlers/battle-message-ui-handler.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/ui/handlers/message-ui-handler.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/ui/handlers/command-ui-handler.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/ui/handlers/fight-ui-handler.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/ui/handlers/party-ui-handler.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/ui/handlers/starter-select-ui-handler.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/ui/containers/starter-container.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/ui/containers/stats-container.ts`

BrainRogue files compared:

- `src/game/scenes/BattleScene.ts`
- `src/ui/BattleUI.ts`
- `src/ui/BattleLog.ts`
- `src/ui/HealthBar.ts`
- `src/ui/PokeRogueFrame.ts`
- `src/systems/assets/ExtractedUiAssetRegistry.ts`

## Core Coordinate and Scaling Model

PokeRogue does not lay out battle UI in a large 1600x900 coordinate system. `SceneBase` exposes a fixed UI canvas:

- `scaledCanvas.width = 320`
- `scaledCanvas.height = 180`

The UI root in `ui.ts` is positioned at:

- `x = 0`
- `y = globalScene.scaledCanvas.height`

Most battle UI elements use negative Y positions because they are anchored upward from the bottom of the 320x180 UI canvas.

Important rule: PokeRogue keeps UI sprites at their native pixel dimensions and relies on global canvas scaling. It does not stretch HUD sprites into large panels. For scalable windows it uses Phaser `NineSlice` via `addWindow`, with native 320x180-space coordinates.

## Asset Loading Pattern

`SceneBase` defines the asset conventions:

- `loadImage(key, "ui")` loads `images/ui/{key}.png`
- `loadAtlas(key, "ui")` loads `images/ui/{key}.png` and `images/ui/{key}.json`
- UI assets also have optional legacy equivalents under `images/ui/legacy`

Local asset root:

`public/assets/pokerogue/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/images/ui`

Use this original UI folder as source of truth. Do not use random extracted slices for the rebuild.

## Battle HUD

Source files:

- `ui/battle-info/battle-info.ts`
- `ui/battle-info/player-battle-info.ts`
- `ui/battle-info/enemy-battle-info.ts`

Assets:

- `images/ui/pbinfo_player.png` - 130x42
- `images/ui/pbinfo_player_mini.png` - 130x42
- `images/ui/pbinfo_enemy_mini.png` - 130x31
- `images/ui/pbinfo_enemy_boss.png` - 178x31
- `images/ui/overlay_hp.png` + `overlay_hp.json` - atlas frames `high`, `medium`, `low`, each 48x2
- `images/ui/overlay_hp_boss.png` + `overlay_hp_boss.json`
- `images/ui/overlay_exp.png` - 85x2
- `images/ui/numbers.png` + `numbers.json`
- `images/ui/numbers_red.png` + `numbers_red.json`
- `images/ui/pbinfo_stat_numbers.png` + `pbinfo_stat_numbers.json`
- `images/ui/pbinfo_player_type.png/json`
- `images/ui/pbinfo_player_type1.png/json`
- `images/ui/pbinfo_player_type2.png/json`
- `images/ui/pbinfo_enemy_type.png/json`
- `images/ui/pbinfo_enemy_type1.png/json`
- `images/ui/pbinfo_enemy_type2.png/json`

Layout rules:

- HUD box sprites use `setOrigin(1, 0.5)`.
- Player HUD container position: `x = scaledCanvas.width - 10`, `y = -72`.
- Enemy HUD container position: `x = 140`, `y = -141`.
- Player HUD offsets:
  - name text: `x = -115`, `y = -15.2`
  - level container: `x = -41`, `y = -10`
  - HP bar: `x = -61`, `y = -1`
  - HP numbers container: `x = -15`, `y = 10`
  - EXP label: `x = -91`, `y = 20`
  - EXP bar: `x = -98`, `y = 18`
- Enemy HUD offsets:
  - name text: `x = -124`, `y = -11.2`
  - level container: `x = -50`, `y = -5`
  - HP bar: `x = -71`, `y = 4.5`

Scaling rules:

- `overlay_hp` is not stretched by width. It is displayed at native frame size and only `scaleX` changes to the HP ratio.
- HP color is selected by atlas frame:
  - `high` above 50%
  - `medium` above 25%
  - `low` at or below 25%
- HP drain is tweened by changing `hpBar.scaleX`.
- EXP uses native `overlay_exp` with a geometry mask, not a resized rectangle.
- Level and HP numbers are image digits from number atlases, not normal text.

## Battle Message Box

Source files:

- `ui/handlers/battle-message-ui-handler.ts`
- `ui/handlers/message-ui-handler.ts`

Assets:

- `images/ui/bg.png` + `bg.json` - atlas frames, each 320x48
- `images/ui/prompt.png` + `prompt.json`
- `images/ui/namebox.png` + `namebox.json`
- `images/ui/windows/window_*.png`

Layout rules:

- The bottom message background is a `bg` sprite:
  - `sprite(0, 0, "bg", windowType)`
  - `setOrigin(0, 1)`
- Message text container:
  - `x = 12`
  - `y = -39`
  - max 2 lines
- Namebox container:
  - `x = 0`
  - `y = -16`
- Namebox nineslice:
  - `x = 0`, `y = 0`
  - size `72x16`
  - border values `8, 8, 5, 5`
- Prompt cursor is positioned after the last rendered line by measuring text width.

Important correction for BrainRogue: `overlay_message` is not the battle message box source of truth in the inspected PokeRogue battle message handler. The battle message box uses the `bg` atlas.

## Command Menu

Source file:

- `ui/handlers/command-ui-handler.ts`

Assets:

- `images/ui/cursor.png` - 6x10
- `images/ui/cursor_reverse.png` - 6x10
- `images/ui/windows/window_*.png`
- `images/ui/button_tera.png/json` only for the optional Tera button

Layout rules:

- Command window:
  - `addWindow(202, 0, 118, 48)`
  - `setOrigin(0, 1)`
- Commands container:
  - `x = 217`
  - `y = -38.7`
- Command text positions:
  - Fight: `x = 0`, `y = 0`
  - Ball: `x = 55.8`, `y = 0`
  - Pokemon/Creature: `x = 0`, `y = 16`
  - Run: `x = 55.8`, `y = 16`
- Cursor position:
  - `x = -5 + (cursor % 2 === 1 ? 56 : 0)`
  - `y = 8 + (cursor >= 2 ? 16 : 0)`

Navigation rules:

- Up/down moves by 2 rows.
- Left/right moves by 1 column.
- Command UI is a compact text menu, not four large buttons.

## Fight / Move Menu

Source file:

- `ui/handlers/fight-ui-handler.ts`

Assets:

- `images/ui/cursor.png`
- `images/ui/cursor_tera.png`
- `images/ui/windows/window_*.png`
- `images/ui/types.png/json`
- `images/ui/categories.png/json`

Layout rules:

- When Fight opens:
  - message `bg` is hidden
  - command window is hidden
  - move windows container is visible
- Moves window:
  - `addWindow(0, 0, 243, 48)`
  - `setOrigin(0, 1)`
- Move details window:
  - `addWindow(240, 0, 80, 48, false, false, -1, 132)`
  - `setOrigin(0, 1)`
- Moves container:
  - `x = 18`
  - `y = -38.7`
- Move text positions:
  - index 0: `x = 0`, `y = 0`
  - index 1: `x = 114`, `y = 0`
  - index 2: `x = 0`, `y = 16`
  - index 3: `x = 114`, `y = 16`
- Move cursor:
  - `x = 13 + (cursor % 2 === 1 ? 114 : 0)`
  - `y = -31 + (cursor >= 2 ? 15 : 0)`
- Move detail overlays:
  - type icon: `x = scaledCanvas.width - 57`, `y = -36`, scale `0.8`
  - category icon: `x = scaledCanvas.width - 25`, `y = -36`
  - PP label/text: around `y = -26`
  - Power: around `y = -18`
  - Accuracy: around `y = -10`

## Party / Creature Select Screen

Source file:

- `ui/handlers/party-ui-handler.ts`

Assets:

- `images/ui/party_bg.png` - 320x180
- `images/ui/party_bg_double.png`
- `images/ui/party_bg_double_manage.png`
- `images/ui/party_slot_main.png/json`
- `images/ui/party_slot_main_short.png/json`
- `images/ui/party_slot.png/json`
- `images/ui/party_slot_hp_bar.png` - 100x7
- `images/ui/party_slot_hp_overlay.png/json`
- `images/ui/party_pb.png/json`
- `images/ui/party_cancel.png/json`

Layout rules:

- Party screen uses a full 320x180 background image:
  - `image(0, 0, "party_bg").setOrigin(0, 1)`
- Message box container:
  - `x = 0`
  - `y = -32`
- Message box:
  - `addWindow(1, 31, 262, 30)`
  - `setOrigin(0, 1)`
- Cancel button:
  - `x = 291`
  - `y = -16`
- Slots use atlas-backed slot sprites, not generic flat cards.
- Slot HP overlay uses `scaleX = hpRatio`, same as battle HP.

BrainRogue currently has only a placeholder Creature panel in battle. If it is upgraded later, it should follow this full-screen party structure rather than becoming a large web panel.

## Starter Select Layout

Source files:

- `ui/handlers/starter-select-ui-handler.ts`
- `ui/containers/starter-container.ts`
- `ui/containers/stats-container.ts`

Assets:

- `images/ui/starter_select_bg.png` - 320x180
- `images/ui/starter_container_bg.png` - 173x159
- `images/ui/select_cursor.png` - 18x18
- `images/ui/select_cursor_highlight.png`
- `images/ui/select_cursor_highlight_thick.png`
- `images/ui/select_cursor_pokerus.png`
- `images/ui/select_gen_cursor.png`
- `images/ui/select_gen_cursor_highlight.png`
- `images/ui/type_bgs.png/json`
- `images/ui/types.png/json`
- Pokemon icon atlases in PokeRogue; BrainRogue should map its own creature icons into equivalent compact slots.

Global constants:

- `filterBarHeight = 17`
- `speciesContainerX = 109`
- `teamWindowX = 285`
- `teamWindowY = 38`
- `teamWindowWidth = 34`
- `teamWindowHeight = 107`
- `randomSelectionWindowHeight = 20`

Starter grid:

- Grid starts around `x = speciesContainerX + 6`, `y = 9`.
- Grid item coordinate function:
  - `x = (index % 9) * 18`
  - `y = 13 + (floor(index / 9) - scrollCursor) * 17`
- This is a compact 9-column icon grid, not a card layout.
- Starter icon inside each slot:
  - `x = -2`
  - `y = 2`
  - scale `0.5`
  - origin `0`

Starter grid window:

- `addWindow(speciesContainerX, filterBarHeight + 1, 175, 161)`
- `starter_container_bg` at:
  - `x = speciesContainerX + 1`
  - `y = filterBarHeight + 2`

Selected creature detail:

- Creature preview position: `x = 53`, `y = 63`
- Number text: `x = 17`, `y = 1`
- Name text: `x = 6`, `y = 112`
- Type icons: `x = 8`, `y = 98` and `x = 26`, `y = 98`, scale `0.5`
- Moves container: `x = 102`, `y = 16`, scale `0.375`
- Egg moves container: `x = 102`, `y = 85`, scale `0.375`

Right team area:

- Party icons are placed at `x = teamWindowX + 7`
- Slot Y uses:
  - `spacing = teamWindowHeight / 7`
  - `firstY = teamWindowY + spacing / 2`
  - `y = round(firstY + spacing * index)`
- Start label: `x = teamWindowX + 17`, `y = 162`
- Start cursor: `nineslice(teamWindowX + 4, 160, "select_cursor", ..., 26, 15, 6, 6, 6, 6)`
- Random label: `x = teamWindowX + 17`, `y = 23`

## What BrainRogue Currently Does Wrong

- BrainRogue battle UI is laid out in large 1600x900 rectangles. PokeRogue UI is authored in 320x180 coordinates and scaled globally.
- BrainRogue currently uses extracted UI slices through `public/assets/ui-extracted`. The current request should move future implementation back to original PokeRogue asset references and behavior.
- BrainRogue stretches or 9-slices battle info panels that PokeRogue renders as fixed-size native sprites.
- BrainRogue uses large bottom UI panels for command and log. PokeRogue uses a native 320x48 message background and a compact 118x48 command window.
- BrainRogue move menu is too large and card-like. PokeRogue uses a 243x48 move window plus an 80x48 details window.
- BrainRogue HP bars are rectangle fills over large panels. PokeRogue uses `overlay_hp` atlas frames and changes only `scaleX`.
- BrainRogue EXP/HP rendering does not follow PokeRogue's native asset and mask approach.
- BrainRogue starter select still behaves like a large-panel/grid hybrid. PokeRogue uses a full `starter_select_bg`, compact 9-column icon grid, and a fixed right team strip.
- BrainRogue has mixed UI interaction and visual systems from earlier passes. PokeRogue has small, fixed, mode-specific UI handlers.

## Exact Implementation Plan

### Step 1: Add Original PokeRogue UI Asset Loader

Create a small registry that points to the original files under:

`public/assets/pokerogue/.../images/ui`

Load the exact source assets and atlases:

- `bg`
- `prompt`
- `cursor`
- `cursor_reverse`
- `window_*`
- `namebox`
- `pbinfo_player`
- `pbinfo_player_mini`
- `pbinfo_enemy_mini`
- `pbinfo_enemy_boss`
- `pbinfo_player_type*`
- `pbinfo_enemy_type*`
- `overlay_hp`
- `overlay_hp_boss`
- `overlay_exp`
- `numbers`
- `numbers_red`
- `pbinfo_stat_numbers`
- `starter_select_bg`
- `starter_container_bg`
- `select_cursor*`
- `party_bg`
- `party_slot*`

Do not use `public/assets/ui-extracted` for these UI elements in the next implementation pass.

### Step 2: Add a PokeRogue-Style UI Coordinate Adapter

Keep BrainRogue's game resolution if needed, but create a 320x180 UI coordinate layer:

- logical width: `320`
- logical height: `180`
- UI root at logical bottom, matching PokeRogue's `UI` container
- convert logical coordinates to BrainRogue display scale once at the layer/container level

Do not individually resize every widget to fit large 1600x900 zones. Native PokeRogue UI assets should be placed at source coordinates, then scaled uniformly by the UI layer.

### Step 3: Rebuild Battle Message, Command, and Fight Rendering

Replace the current large BrainRogue command/log panels with source behavior:

- message bg: `sprite(0, 0, "bg", windowType).setOrigin(0, 1)`
- command window: `addWindow(202, 0, 118, 48).setOrigin(0, 1)`
- command text container: `(217, -38.7)`
- command cursor positions exactly as PokeRogue:
  - `x = -5 + col * 56`
  - `y = 8 + row * 16`
- fight window: `addWindow(0, 0, 243, 48).setOrigin(0, 1)`
- move details window: `addWindow(240, 0, 80, 48).setOrigin(0, 1)`
- move text positions: `(0,0)`, `(114,0)`, `(0,16)`, `(114,16)`
- move cursor position: `x = 13 + col * 114`, `y = -31 + row * 15`

Keep BrainRogue's keyboard-only input state. Only replace rendering and coordinate math.

### Step 4: Rebuild Battle HUD Rendering

Create BrainRogue components that mirror PokeRogue's `BattleInfo` classes:

- render player/enemy HUD boxes as native sprites, not 9-slice panels
- use the exact container positions:
  - player: `(scaledCanvas.width - 10, -72)`
  - enemy: `(140, -141)`
- place HP bars at source offsets
- use `overlay_hp` / `overlay_hp_boss` atlas frames
- update HP by tweening `scaleX`
- render level/HP numbers with image digits later if desired; for MVP text can be placed at the same offsets, but dimensions must match the source HUD layout

### Step 5: Rebuild Starter Select Structure

Do not redesign the starter data. Render BrainRogue creatures inside PokeRogue's structure:

- full background: `starter_select_bg`
- compact grid container at `speciesContainerX + 6, 9`
- 9 columns with 18px X step and 17px row step
- use BrainRogue icon sprites in those slots
- selected/highlight cursor uses `select_cursor` or `select_cursor_highlight`
- detail panel uses the source left area coordinates
- right team strip uses `teamWindowX = 285` and source party slot spacing

This will make BrainRogue's starter screen feel like the reference without copying PokeRogue data or gameplay.

### Step 6: Party / Creature Placeholder Alignment

If BrainRogue keeps the Creature command as a placeholder for v0.1, it should still use PokeRogue's party screen structure:

- `party_bg` full-screen image
- `party_slot_main` for active slot
- `party_slot` for inactive slots
- `party_slot_hp_bar` and `party_slot_hp_overlay` if showing HP
- cancel/back affordance at the source location

### Step 7: Remove Prior Extracted-Slice Dependency Later

After the report is approved, the next implementation sprint should remove or bypass:

- `src/systems/assets/ExtractedUiAssetRegistry.ts`
- `src/ui/PokeRogueFrame.ts`
- `public/assets/ui-extracted` usage for battle HUD/message/menu

Those files can remain temporarily while the new renderer is introduced, but they should not be considered source-of-truth for PokeRogue-style UI.

## Risks and Constraints

- Asset licensing/provenance must be reviewed before sharing builds with copied PokeRogue assets. For local technical reference this is fine; distribution needs a separate decision.
- PokeRogue's UI assumes 320x180 logical coordinates. BrainRogue's current 1600x900 layout code will keep fighting the reference unless the UI is scaled as a complete layer.
- Atlas files must be loaded with their matching PNGs. Cropping sprite sheets manually is more fragile than using the original JSON atlases.
- Phaser `NineSlice` should be used for `window_*` assets instead of manually slicing panels.
- Battle logic should remain untouched. The integration point should be a rendering adapter around current battle state: player creature, enemy creature, HP values, moves, command mode, and selected index.

## Recommended Next Sprint

Implement only the battle UI renderer first:

1. Load original PokeRogue UI assets and atlases.
2. Add the 320x180 UI coordinate adapter.
3. Replace BattleScene's message box, command menu, fight menu, and HUD rendering with source-coordinate components.
4. Keep BrainRogue battle state, keyboard input, damage, rewards, and waves unchanged.
5. Verify Fight / Ball / Creature / Run, move select/back, reward transition, and 10-wave stability.

This gives the largest visual improvement with the smallest gameplay risk.
