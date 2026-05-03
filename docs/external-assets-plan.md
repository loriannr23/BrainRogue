# External Asset Integration Plan

## Goal

Integrate external PokeRogue-style asset packs into BrainRogue without copying PokeRogue code, replacing BrainRogue content, or breaking the current keyboard-only release flow. This plan is analysis-only: no gameplay code changes and no asset imports are included here.

## Current BrainRogue Asset Structure

BrainRogue currently uses a small, mostly centralized asset layer:

- Creature sprites:
  - `public/assets/sprites/creatures/{creatureId}/front_idle.png`
  - `public/assets/sprites/creatures/{creatureId}/icon.png`
  - optional back sprite path support via `public/assets/sprites/creatures/back/{creatureId}.png`
  - loaded by `CreatureAssetRegistry.ts`
  - fitted by `fitSpriteToBox.ts`
  - per-creature render tuning is planned in `CreatureRenderMetadata.ts`

- Battle backgrounds:
  - `public/assets/backgrounds/battle/battle_sky.png`
  - `public/assets/backgrounds/battle/ground.png`
  - `public/assets/backgrounds/battle/platform.png`
  - `public/assets/backgrounds/battle/shadow.png`
  - loaded through `BATTLE_BACKGROUND_ASSETS` in `UiAssetRegistry.ts`
  - rendered in `BattleScene.ts` with procedural fallback layers

- UI assets:
  - `public/assets/ui/icons/cursor.png`
  - `public/assets/ui/icons/bars.png`
  - `public/assets/ui/buttons/ui_button_icon_set.png`
  - `public/assets/icons/types/types_badges.png`
  - `public/assets/icons/items/item_icons.png`
  - source sheets are sliced in `createUiDerivedTextures()`
  - icons render through `renderIconSafe()`, which already supports missing-asset logging and consistent tinting

- FX:
  - `FxManager.ts` currently uses generated Phaser primitives for hit sparks, impact lines, pulse rings, status bits, reward shine, and wave start
  - `public/assets/ui/fx/particles.png` exists and is used as background particles, not as a general particle atlas yet

- Audio:
  - `AudioManager.ts` defines safe sound hooks for UI, hits, rewards, wave start, victory, and game over
  - expected paths are under `public/assets/audio/sfx/`
  - missing files log once in dev and never crash

## Integration Strategy

Add an external asset manifest layer rather than wiring external paths directly into scenes. The manifest should map BrainRogue logical names to optional external files, and every entry should have an existing fallback path or procedural fallback.

Recommended principles:

- Keep BrainRogue IDs as the source of truth.
- Do not rename existing runtime keys unless there is a migration plan.
- Load external assets only through registries.
- Treat every external asset as optional.
- Keep current procedural fallbacks for dev and release safety.
- Keep keyboard-only input untouched.
- Keep scene layout values separate from asset mappings.
- Do not import copyrighted PokeRogue assets unless their license and permission are explicitly compatible with the intended distribution.

## Proposed Folder Structure

Use a separate namespace for third-party or external-style packs:

```text
public/assets/external/
  packs/
    {packId}/
      manifest.json
      backgrounds/
        battle/
          forest/
            sky.png
            midground.png
            ground.png
            platform_player.png
            platform_enemy.png
            shadow.png
      fx/
        hit_spark.png
        slash.png
        special_pulse.png
        status_burn.png
        status_poison.png
        status_rooted.png
        status_confuse.png
        particles.png
      ui/
        cursor.png
        buttons.png
        bars.png
        type_icons.png
        item_icons.png
      audio/
        sfx/
          ui_move.ogg
          ui_confirm.ogg
          hit_light.ogg
          hit_heavy.ogg
          reward_pick.ogg
          wave_start.ogg
```

Keep BrainRogue-native assets where they are today:

```text
public/assets/backgrounds/
public/assets/icons/
public/assets/sprites/
public/assets/ui/
public/assets/audio/
```

External packs should override logical assets only through manifest configuration. They should not replace files in the native folders directly.

## Manifest Design

Create a new manifest type, for example `src/systems/assets/ExternalAssetManifest.ts`.

Suggested manifest shape:

```ts
interface ExternalAssetManifest {
  packId: string;
  displayName: string;
  version: string;
  palette?: {
    bg?: string;
    panel?: string;
    border?: string;
    text?: string;
    accent?: string;
  };
  battleBackgrounds?: Record<string, BattleBackgroundPack>;
  ui?: Record<string, ManifestImageAsset | ManifestSpriteSheetAsset>;
  fx?: Record<string, ManifestImageAsset | ManifestSpriteSheetAsset>;
  audio?: Record<string, ManifestAudioAsset>;
}

interface BattleBackgroundPack {
  sky?: ManifestImageAsset;
  midground?: ManifestImageAsset;
  ground?: ManifestImageAsset;
  playerPlatform?: ManifestImageAsset;
  enemyPlatform?: ManifestImageAsset;
  shadow?: ManifestImageAsset;
}

interface ManifestImageAsset {
  key: string;
  path: string;
  nativeWidth?: number;
  nativeHeight?: number;
  tint?: string;
  fallbackKey: string;
}

interface ManifestSpriteSheetAsset extends ManifestImageAsset {
  frames: Record<string, { x: number; y: number; width: number; height: number }>;
  outputSize?: { width: number; height: number };
}

interface ManifestAudioAsset {
  key: string;
  path: string;
  fallbackKey?: string;
}
```

Example logical mapping:

```json
{
  "packId": "external-pixel-pack-v1",
  "displayName": "External Pixel Pack v1",
  "version": "1.0.0",
  "battleBackgrounds": {
    "forest": {
      "sky": {
        "key": "external:forest:sky",
        "path": "/assets/external/packs/external-pixel-pack-v1/backgrounds/battle/forest/sky.png",
        "fallbackKey": "battle:bg:sky"
      },
      "ground": {
        "key": "external:forest:ground",
        "path": "/assets/external/packs/external-pixel-pack-v1/backgrounds/battle/forest/ground.png",
        "fallbackKey": "battle:bg:ground"
      }
    }
  }
}
```

## Registry Design

Add an `ExternalAssetRegistry` that resolves logical names in this order:

1. active external pack asset
2. BrainRogue native asset
3. procedural fallback

Suggested APIs:

```ts
getBattleBackgroundAsset(kind: 'sky' | 'midground' | 'ground' | 'playerPlatform' | 'enemyPlatform' | 'shadow', biomeId: string): ResolvedAsset
getFxAsset(kind: 'hitSpark' | 'slash' | 'specialPulse' | 'burn' | 'poison' | 'rooted' | 'confuse'): ResolvedAsset
getUiAsset(kind: 'cursor' | 'bars' | 'typeIcons' | 'itemIcons' | 'battleButtons'): ResolvedAsset
getAudioAsset(key: AudioKey): ResolvedAsset
preloadExternalPack(scene, packId): void
```

`ResolvedAsset` should include:

```ts
{
  key: string;
  path?: string;
  exists: boolean;
  fallbackKey?: string;
  source: 'external' | 'native' | 'procedural';
}
```

This keeps scenes from needing to know whether an asset came from an external pack or the current native folder.

## Asset Categories To Integrate

### 1. Battle Backgrounds

Best first target. Backgrounds produce the biggest visual improvement with low gameplay risk.

Can integrate:

- sky layer
- far/midground layer
- ground layer
- foreground detail layer if it does not cover UI
- biome variants, such as forest, beach, cave, city

Current integration point:

- `BATTLE_BACKGROUND_ASSETS` in `UiAssetRegistry.ts`
- `drawBattleBackground()` in `BattleScene.ts`

Recommended next step:

- Add manifest-backed resolution for `sky`, `midground`, and `ground`.
- Keep current procedural background if any layer is missing.

### 2. Platforms And Shadows

High visual value and moderate risk because scale/anchor mismatch can make creatures float.

Can integrate:

- player platform
- enemy platform
- shared shadow
- optional glow/edge layer

Current integration point:

- `drawBattlePlatforms()` in `BattleScene.ts`
- `CreatureRenderMetadata.shadowScale`

Recommended next step:

- Separate player and enemy platform asset keys.
- Define platform anchor metadata:
  - `originX`
  - `originY`
  - `creatureFootX`
  - `creatureFootY`
  - `shadowOffsetY`

### 3. Move FX And Particles

Good second or third target. Keep primitive fallback because FX sprite sheets are easy to slice incorrectly.

Can integrate:

- hit spark
- physical slash
- special pulse
- status overlays
- small particle atlas
- reward shine
- wave start flare

Current integration point:

- `FxManager.ts`

Recommended next step:

- Add optional FX atlas support in `FxManager`.
- If an FX texture is missing, keep the current generated rectangles/circles.
- Use short lifetimes and small particle counts.

### 4. Sounds

Low visual risk and low gameplay risk because `AudioManager` already supports missing sounds safely.

Can integrate:

- UI move/confirm/back
- light/heavy hit
- crit
- reward pick
- wave start
- victory
- game over

Current integration point:

- `AudioManager.ts`

Recommended next step:

- Move `audioPaths` into a manifest-compatible registry.
- Support `.ogg` first, optional `.mp3` fallback only if needed.

### 5. Optional UI Elements

Highest consistency risk. UI is currently intentionally flat and palette-limited.

Can integrate carefully:

- cursor
- simple monochrome type icons
- item icons
- HP/stat bars
- battle command icons

Should avoid for v0.1:

- ornate frames
- large decorative panels
- gradients
- heavy shadows
- asset styles that conflict with the current palette

Current integration point:

- `UiAssetRegistry.ts`
- `renderIconSafe.ts`
- `Badges.ts`
- `BattleUI.ts`
- `RewardScene.ts`

Recommended next step:

- Only integrate UI assets after battle backgrounds/platforms are stable.
- Keep the existing tint normalization unless the new UI pack is fully palette-matched.

## Sprite And Animation Handling

Current creature animation is transform-based:

- idle float
- attack lunge
- hurt knockback

No creature sprite sheets are required yet. This is good for release stability.

External sprite animations should not be first priority. If added later, use a separate creature animation manifest:

```text
public/assets/external/packs/{packId}/sprites/creatures/{creatureId}/
  front_idle.png
  front_attack.png
  front_hurt.png
  back_idle.png
```

Do not mix sprite-sheet animation into the battle engine. Keep it isolated in a future `CreatureAnimationRegistry`.

## Fallback Strategy

Every external asset must have one of these fallbacks:

- native BrainRogue texture key
- generated Phaser primitive
- generated placeholder texture
- no-op sound

Rules:

- Missing external asset logs once in dev.
- Missing external asset never blocks scene start.
- Fallback must preserve current layout dimensions.
- No scene should directly call `scene.load.image()` with an external path.
- All external loads should go through the registry.

## Risks And Constraints

### Licensing

Do not copy PokeRogue assets unless the license explicitly allows the intended use. A PokeRogue-like style can be referenced for structure and readability, but BrainRogue should use original, licensed, or commissioned assets.

### Sprite Sheet Slicing

Many external packs use atlases. Risks:

- wrong crop coordinates
- transparent padding differences
- inconsistent frame origins
- icons clipped after scaling
- mismatched tile sizes

Mitigation:

- store explicit crop rectangles in manifest
- never guess sheet coordinates at runtime
- add a small visual atlas inspection/debug screen only if needed later
- keep `renderIconSafe()` for aspect-ratio preserving rendering

### Scale And Anchor Mismatch

Battle platforms and creature feet are sensitive to anchors. Risks:

- floating creatures
- HP boxes covering sprites
- player sprite looking too large
- enemy platform not matching perspective

Mitigation:

- add per-asset placement metadata
- keep `fitSpriteToBox()`
- use `CreatureRenderMetadata` for per-creature offsets
- define platform foot points in manifest

### Performance

Risks:

- large PNG backgrounds increase memory
- too many particles reduce FPS
- large sprite sheets slow preload
- multiple active packs may duplicate textures

Mitigation:

- load only the active pack
- cap battle background size near current logical resolution
- prefer small FX atlases
- keep generated FX as fallback
- lazy-load rare biome packs later if needed

### Style Drift

BrainRogue now uses a strict palette and flat UI. External UI assets may make the game feel assembled from unrelated packs.

Mitigation:

- integrate battle art first
- tint UI icons through `renderIconSafe()`
- reject ornate UI frames for v0.1
- keep panels code-rendered

## What Should Not Be Imported

Do not import:

- PokeRogue source code
- PokeRogue proprietary or incompatible assets
- Pokemon assets, names, cries, or sprites
- complete UI frame systems that override BrainRogue's flat UI
- gameplay data from other projects
- battle logic, species data, moves, items, or encounter tables
- large animation systems before the current render pipeline is stable

## Integration Steps

### Step 1: Manifest Skeleton

Create:

```text
src/systems/assets/ExternalAssetManifest.ts
src/systems/assets/ExternalAssetRegistry.ts
public/assets/external/packs/.gitkeep
```

Add only types and an empty/default manifest. No visual changes yet.

Effort: small.

### Step 2: Battle Background Pack Support

Add manifest resolution for:

- sky
- midground
- ground

Update `BattleScene.drawBattleBackground()` to ask the registry for resolved assets, while preserving current fallback rendering.

Effort: medium.

Biggest visual gain: high.

### Step 3: Platform And Shadow Pack Support

Add manifest resolution for:

- player platform
- enemy platform
- shadow

Add anchor metadata support.

Effort: medium.

Biggest visual gain: high.

### Step 4: FX Atlas Support

Add optional sprite-backed FX to `FxManager`.

Start with:

- hit spark
- slash
- special pulse

Keep generated primitive fallback.

Effort: medium to high.

Biggest visual gain: medium.

### Step 5: Audio Manifest Support

Move sound path mapping behind registry resolution.

Effort: small.

Biggest feel gain: medium.

### Step 6: Optional UI Icon Pack

Only after the battle scene style is stable:

- cursor
- battle command icons
- item icons
- type icons

Keep tinting and icon-safe rendering.

Effort: medium.

Biggest visual gain: low to medium.

## Priority Order

1. Battle backgrounds
2. Platforms and shadows
3. Hit/move FX
4. Audio
5. Optional UI icons
6. Creature animation sheets, only later

## Estimated Effort

| Area | Effort | Risk | Visual/Feel Gain |
| --- | --- | --- | --- |
| Manifest skeleton | 0.5 day | Low | Low |
| Battle backgrounds | 0.5-1 day | Low | High |
| Platforms/shadows | 0.5-1 day | Medium | High |
| FX atlas | 1-2 days | Medium | Medium |
| Audio manifest | 0.5 day | Low | Medium |
| UI icon pack | 1 day | Medium | Medium |
| Creature animation sheets | 2-4 days | High | High |

## Recommended Next Sprint

Implement only the manifest skeleton plus battle background resolution.

Scope:

- add `ExternalAssetManifest.ts`
- add `ExternalAssetRegistry.ts`
- add one sample empty manifest entry
- update preload to load active manifest assets if configured
- update `BattleScene` to resolve `sky`, `midground`, and `ground`
- keep current background rendering if no external pack exists

Do not touch:

- battle engine
- move effects
- run state
- keyboard controls
- starter selection
- reward logic

This gives the largest visual upside with the lowest risk and establishes the asset override pattern for later sprints.
