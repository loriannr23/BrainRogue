# PokeRogue Reference Analysis for BrainRogue

Date: 2026-05-01

This report uses the public PokeRogue project only as a structural reference. It does not recommend copying PokeRogue source code, assets, Pokemon data, move data, UI art, or licensed content. BrainRogue should keep its own creatures, move set, custom types, sprites, icons, balance, and visual identity.

## Reference Sources

- PokeRogue repository: https://github.com/pagefaultgames/pokerogue
- PokeRogue TypeDoc module index: https://pagefaultgames.github.io/pokerogue/main/modules.html
- PokeRogue assets repository: https://github.com/pagefaultgames/pokerogue-assets
- BrainRogue local project inspected at `C:\prvt\playground\BrainRogue`

## High-Level Findings

PokeRogue is organized around a compact Phaser scene layer plus a large phase/UI-handler/data-module architecture. The public repository exposes top-level source folders such as `src/data`, `src/enums`, `src/phases`, `src/ui`, `src/sprites`, `src/system`, and `src/utils`. The TypeDoc module index shows dedicated phases for battle flow, command selection, capture attempts, run attempts, biome switching, starter selection, rewards, victory, game over, and turn start/end handling.

BrainRogue is currently simpler and more direct. It has clear Phaser scenes under `src/game/scenes`, reusable UI components under `src/ui`, asset registries under `src/systems/assets`, and battle/progression systems under `src/systems`. That is good for a local friends release. The main gap is not raw feature count; it is that UI flow state, asset conventions, encounter data, and menu modes are still spread across scene code rather than represented as small explicit state machines.

## What PokeRogue Does Well

- It separates broad Phaser rendering from game-flow phases. Examples visible in TypeDoc include `CommandPhase`, `FightPhase`, `AttemptCapturePhase`, `AttemptRunPhase`, `ModifierRewardPhase`, `SelectStarterPhase`, `SwitchBiomePhase`, `TurnStartPhase`, and `TurnEndPhase`.
- It uses explicit UI handlers for modes such as command, fight, ball, party, starter select, title, settings, summary, confirmation, and modifier selection.
- It has a dense data layout: species, forms, moves, abilities, types, status effects, biome balance, trainers, eggs, rewards, and settings are split into focused modules instead of one large mixed file.
- It treats sprites and asset loading as first-class systems. TypeDoc lists `src/sprites/pokemon-asset-loader`, `src/sprites/pokemon-sprite`, `src/sprites/sprite-keys`, and asset repositories separate creative assets into `audio`, `battle-anims`, `fonts`, and `images`.
- Its battle flow is readable to players: command menu, fight menu, ball menu, party menu, run confirmation, battle messages, HP boxes, status display, reward flow, and biome/wave transitions are separate concepts.
- It keeps battle UI interactions mode-based. A UI mode knows which inputs are legal, which helps avoid invisible overlays and input locks.

## What BrainRogue Currently Has

### Scenes

- `BootScene`
- `PreloadScene`
- `MainMenuScene`
- `StarterSelectScene`
- `BattleScene`
- `RewardScene`
- `GameOverScene`

This is understandable and release-friendly, but `BattleScene` still owns rendering, background setup, sprite placement, wave preview, battle UI creation, animation sequencing, and scene transitions.

### UI Components

- Theme and primitives: `src/ui/theme.ts`, `PixelPanel`, `PixelButton`, `PixelCard`, `PixelFrame`
- Battle UI: `BattleUI`, `BattleLog`, `MoveButton`, `HealthBar`
- Starter UI: `CreaturePreview`, `TypeBadge`, `ClassificationBadge`, `StatBar`

This is a solid base. The duplicated component paths (`src/ui/PixelButton.ts` and `src/ui/components/PixelButton.ts`, similar for panels/stats) should be cleaned up later.

### Assets

Current supported asset layout:

- `public/assets/sprites/creatures/{creatureId}/front_idle.png`
- `public/assets/sprites/creatures/{creatureId}/icon.png`
- `public/assets/backgrounds/menu/menu_background.png`
- `public/assets/backgrounds/battle/battle_sky.png`
- `public/assets/backgrounds/battle/ground.png`
- `public/assets/backgrounds/battle/platform.png`
- `public/assets/backgrounds/battle/shadow.png`
- `public/assets/ui/buttons/*.png`
- `public/assets/ui/frames/*.png`
- `public/assets/ui/fx/*.png`
- `public/assets/ui/icons/*.png`
- `public/assets/ui/panels/panel.png`

The registries `CreatureAssetRegistry.ts`, `CreatureSpriteManifest.ts`, and `UiAssetRegistry.ts` already provide fallback-safe loading.

### Data Models

- Creatures: `CreatureDefinition` includes id, name, types, base stats, growth, level-up moves, evolution line, classification/tags, role, description, catchable.
- Moves: `MoveDefinition` already uses structured `MoveEffect[]`, categories, priority, PP, accuracy, power, type.
- Items: item rarity exists and should remain; creature rarity has been removed.
- Saves: `RunState` tracks starter, party, wave, currency, seed; `SaveData` tracks unlocks, best wave/run, settings, meta progress, current run.

### Battle and Run Flow

- `BattleEngine` handles turn resolution, PP, speed ordering, status hooks, damage, effect processing, win/loss.
- `BattleScene` handles sequence animation and transitions to reward/game-over.
- `WaveSystem` handles biome, preview, enemy pools, level scaling, boss waves.
- `RewardSystem` handles item/reward generation.

The core loop is small and testable. Current Playwright coverage includes a long repeated battle/reward interaction smoke test.

## What BrainRogue Currently Lacks

- No explicit battle phase queue. The current flow is serviceable but harder to extend with capture, switching, multi-hit details, status popups, item use, evolution, or learning moves without growing `BattleScene`.
- No centralized battle command state machine. `BattleUI` has modes, but the scene owns the turn lock and transitions.
- Starter select does not yet have PokeRogue-like affordances such as starter cost/value, filters, sorting, unlock details, owned flags, passive/ability preview, or keyboard/gamepad navigation.
- Asset folders do not yet distinguish front/back/variant/shadow/animation metadata. This is fine for now, but it will limit polish.
- Missing dedicated UI handlers for `Title`, `StarterSelect`, `Command`, `Fight`, `Ball`, `Creature`, `Reward`, `Confirm`, and `Settings`.
- Limited release safety checks around canvas visual regression. Current E2E checks flow, not layout screenshots.
- No proper catch system yet. `Ball` is currently a placeholder.
- No audio folder/registry, no font registry, and no animation registry.
- Data is still mostly hand-authored in TypeScript files rather than validated data tables.

## What Should Be Adapted

Adapt these ideas, not their code:

- Use explicit flow units for battle and run progress. BrainRogue does not need PokeRogue's full phase tree, but it should add small local phases such as `ActionSelect`, `MoveSelect`, `BallSelect`, `ResolveTurn`, `RewardSelect`, `WaveIntro`, `RunEnd`.
- Split battle UI mode handling from battle scene rendering. Keep `BattleScene` as the renderer/orchestrator, but move command menu behavior into dedicated small handlers or a `BattleCommandController`.
- Keep all data definitions typed and structured. BrainRogue's `MoveEffect[]` is already moving in the right direction.
- Move layout constants into named layout objects. `BattleScene.createLayout()` is already a good seed; extend that pattern to starter select and menus.
- Add asset manifests per category: creatures, battle backgrounds, UI skin, icons, audio, battle effects.
- Add visible mode transitions: action menu -> fight menu -> back, action menu -> ball placeholder/capture, action menu -> creature placeholder/switch, action menu -> run confirm.
- Add release-oriented tests that verify no giant sprites, no invisible overlays, and reward-next-wave flow.

## What Should NOT Be Copied

- Do not copy PokeRogue source code. Its repository is AGPL-licensed, and direct copying would create licensing and maintenance problems.
- Do not copy PokeRogue assets, Pokemon sprites, Pokemon names/data, move lists, abilities, or type chart.
- Do not copy the full phase architecture wholesale. It is built for a much larger game and would be over-engineering for BrainRogue's current scope.
- Do not copy PokeRogue's exact UI layout, title treatment, icons, or branding.
- Do not replace BrainRogue's scene structure in one pass. The safer path is incremental extraction.
- Do not introduce online account/session/save complexity for a local friends release.

## Recommended Folder and Data Structure Changes

Short-term target:

```text
src/
  data/
    creatures.ts
    moves.ts
    items.ts
    biomes.ts
    encounters.ts        # wave pools, boss pools, biome pools
    starters.ts
  game/
    scenes/
      MainMenuScene.ts
      StarterSelectScene.ts
      BattleScene.ts
      RewardScene.ts
  systems/
    assets/
      CreatureAssetRegistry.ts
      UiAssetRegistry.ts
      BackgroundAssetRegistry.ts
      AudioAssetRegistry.ts
    battle/
      BattleEngine.ts
      BattleFlowController.ts
      BattleCommandController.ts
      EffectProcessor.ts
    progression/
      WaveSystem.ts
      RewardSystem.ts
  ui/
    components/
    battle/
      BattleActionMenu.ts
      BattleFightMenu.ts
      BattleBallMenu.ts
      BattleCreatureMenu.ts
      BattleRunConfirm.ts
    starter/
      StarterCard.ts
      StarterDetailPanel.ts
```

Do not move everything at once. Start by extracting one low-risk UI component or controller per sprint.

## Recommended Asset List Still Missing

Creature rendering:

- `back_idle.png` for player-side battle sprites
- `front_attack.png` or simple attack pose per creature
- `hurt.png` or damage flash frame per creature
- optional `shadow.png` per creature size class
- optional sprite metadata: `scale`, `yOffset`, `shadowScale`

Battle backgrounds:

- biome-specific folders: `forest`, `cave`, `city`, `water`, `ancient`, `shadow`
- per-biome `layer_sky.png`, `layer_clouds.png`, `layer_ground.png`, `platform_player.png`, `platform_enemy.png`
- optional `battle_palette.json` per biome

UI:

- reliable 9-slice panel/button assets
- selected/disabled button variants
- compact move type icons
- status icons: burn, poison, confuse, rooted
- stat stage up/down icons
- ball icon
- creature/team icon
- run icon

Effects and animation:

- hit slash/spark overlays
- heal sparkle
- recoil impact
- poison/burn chip indicators
- catch throw/ball shake placeholders

Audio:

- button hover/select/back/error
- battle start
- hit/crit/miss
- reward select
- victory/game-over
- menu loop and battle loop

Fonts:

- pixel UI font with readable numbers
- fallback font metrics documented

## Recommended UI Flow Changes

### Main Menu

Keep the current release menu: title, New Run, Continue Run, Settings. Do not re-add meta panels for the friends release.

### Starter Select

Next target:

- left: starter cards with icon, name, type badges, lock state
- right: selected creature preview, description, stats, evolution, classification only if non-normal
- top or bottom compact controls for filters later
- keyboard/controller navigation later

Avoid adding rarity back to normal creatures. If the UI asks for rarity, map that to `classification` and show nothing for `normal`.

### Battle

Next target:

- default action menu: Fight, Ball, Creature, Run
- Fight: move grid, PP, type, power/accuracy, Back
- Ball: placeholder now, later catch chance and inventory
- Creature: placeholder now, later party switch
- Run: confirm dialog
- battle log stays readable and never overlaps sprites
- after turn resolution, always restore action menu if no scene transition happens

### Reward

Keep the current reward scene, but align it later with battle flow:

- victory message
- reward choices
- mini run state
- Next Wave button
- no new gameplay systems until Battle UI is stable

## Risk Assessment Before Local Release

High risk:

- Input lock regressions after battle animation or scene transition changes.
- Sprite overflow from newly added assets without metadata.
- Reward-to-next-wave breaking when battle state or run state changes.
- Catch action half-implementation causing turn-state ambiguity.

Medium risk:

- Starter text overflow for long names.
- Asset path drift between registry and folder layout.
- Duplicate UI primitives causing inconsistent button/panel behavior.
- Build size warnings from Phaser bundle; acceptable for local release.

Low risk:

- Main menu simplification.
- Documentation and asset manifest additions.
- Classification badge behavior for non-normal creatures.

Release recommendation:

- Do not add new gameplay before the local release except a minimal catch placeholder.
- Prioritize visual stability, input safety, and 10-wave smoke testing.
- Add screenshot checks for Main Menu, Starter Select, and Battle Scene after the next UI sprint.

## Implementation Roadmap

### Sprint A: Data Format Alignment

Goal: make data easier to validate and extend without gameplay rewrites.

- Add `src/data/encounters.ts` for biome enemy pools, boss pools, and wave constraints.
- Keep `creatures.ts`, `moves.ts`, `items.ts`, and `biomes.ts` as TypeScript for now.
- Add lightweight validation helpers for duplicate ids, missing move ids, missing evolution ids, and missing sprite assets.
- Add optional creature asset metadata fields in a separate map, not inside every creature definition yet.
- Acceptance: no gameplay behavior changes; `pnpm build` and E2E pass.

### Sprint B: Starter Select Flow Alignment

Goal: make starter select clean, stable, and closer to classic monster battler readability.

- Extract `StarterCard` and `StarterDetailPanel` from `StarterSelectScene`.
- Keep cards stat-free; details show all stats.
- Add robust name ellipsis and panel clipping.
- Add optional locked/unlocked visual state.
- Keep normal creatures classification-free.
- Acceptance: no sprite/text overflow; starter selection remains clickable; build passes.

### Sprint C: Battle Menu/Layout Alignment

Goal: stabilize battle command modes without changing turn mechanics.

- Extract `BattleActionMenu`, `BattleFightMenu`, `BattleBallMenu`, `BattleCreatureMenu`, `BattleRunConfirm`.
- Add a tiny `BattleCommandController` to own menu mode transitions.
- Keep `BattleEngine.resolveTurn()` unchanged.
- Ensure post-turn always returns to action menu unless reward/game-over transition starts.
- Acceptance: Fight/Back/Ball/Creature/Run all work; no input locks; 10-wave smoke passes.

### Sprint D: Asset Folder Cleanup

Goal: prepare assets for more biomes and battle polish.

- Add documented folders for `back_idle`, battle effects, status icons, and audio.
- Add `BackgroundAssetRegistry.ts` and `AudioAssetRegistry.ts`.
- Add asset manifest validation test for UI/background paths.
- Add per-creature optional render metadata: preview max, battle max, y offset, shadow size.
- Acceptance: missing assets fallback safely; no runtime errors when assets are absent.

### Sprint E: Polish/Bug Bash

Goal: release-readiness.

- Add Playwright screenshot smoke checks for menu, starter, battle.
- Test at least 10 waves through reward flow.
- Test selecting every starter with real assets.
- Test long names, missing sprites, locked starters, boss waves, game over, run confirm.
- Fix UI duplication and remove unused component aliases.
- Acceptance: friends-release build is stable and documented.

## Exact Recommended Next Sprint

Start with Sprint C: Battle Menu/Layout Alignment.

Reason: the local friends release depends most on battle readability and input safety. BrainRogue already has enough data and assets to play; the highest practical release risk is the action menu, move menu, placeholder flows, and post-turn state restoration. Keep the scope narrow: extract battle menu components/controllers only, leave damage/effects/rewards unchanged, and rerun the 10-20 wave smoke afterward.

