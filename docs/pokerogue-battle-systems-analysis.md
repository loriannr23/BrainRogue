# PokeRogue Battle Systems Reference Analysis

This analysis uses `src/external/pokerogue` as an architecture and formula reference only. No PokeRogue source was copied into BrainRogue.

## Source Files Inspected

- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/field/pokemon.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/battle-scene.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/utils/speed-order.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/utils/speed-order-generator.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/queues/pokemon-priority-queue.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/queues/move-phase-priority-queue.ts`
- `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src/data/exp.ts`

## Damage Calculation

PokeRogue keeps damage calculation centered on the attacking creature level, move power, the selected offensive stat, and the target defensive stat. The base formula follows the classic monster battler shape:

```text
base = (((2 * level / 5 + 2) * power * attack / defense) / 50) + 2
```

The final damage pipeline then layers additional modifiers such as STAB, type effectiveness, critical hits, weather, abilities, items, move-specific overrides, and random variance. PokeRogue also evaluates whether the move is physical or special to choose Attack/Defense versus Special Attack/Special Defense.

BrainRogue should keep the same conceptual order but remain much smaller:

- validate accuracy
- skip damage for status moves
- select physical or special stats by move category
- apply STAB
- apply BrainRogue type chart multiplier
- apply critical hit placeholder
- apply random variance
- apply current battle status modifiers such as burn

## Type Effectiveness

PokeRogue computes type effectiveness by multiplying the attacking type against each defender type. Immunities result in `0`, resistances multiply by `0.5`, and weaknesses multiply by `2`. It also has hooks for special cases such as ability-based immunity bypass and move-specific type chart overrides.

BrainRogue should mirror the multiplier model using its own types only:

- `meme`
- `sound`
- `chaos`
- `water`
- `fire`
- `earth`
- `air`
- `electric`
- `toxic`
- `metal`
- `psychic`
- `ancient`
- `food`
- `shadow`
- `light`

The local type chart should stay native and intentionally small.

## Move Execution

PokeRogue executes moves through queued move phases. The queue handles timing modifiers, move priority, speed order, and then move-specific attributes. This keeps move execution deterministic while allowing future hooks.

BrainRogue does not need the full phase manager yet. A compact turn resolver is enough:

- validate player move
- let enemy AI choose a valid move
- sort actions by move priority and effective speed
- randomize speed ties
- spend PP
- run before-turn status checks
- calculate damage
- apply HP changes
- process move effects
- run after-turn status checks
- update winner
- emit feedback events for UI/FX

## Turn Order

PokeRogue sorts actions using speed order utilities and priority queues. It shuffles tie groups before sorting so equal-speed creatures do not always act in a fixed order. Move priority is evaluated after timing modifiers.

BrainRogue should use:

- higher move priority first
- higher effective speed first
- random tie-break when effective speed is equal

## XP Gain and Level Scaling

PokeRogue stores total experience and uses growth-rate tables/formulas to determine level thresholds. On defeat, party experience is calculated, split across eligible participants, and then level-up phases are queued. Level caps and modifiers are handled by broader run systems.

BrainRogue should keep a simpler v1 model:

- one active creature receives XP on enemy defeat
- XP value scales from enemy level
- boss enemies grant a larger multiplier
- level threshold uses local growth rate multiplier
- stat recalculation happens immediately on level-up
- battle log records XP and level-up messages

## Stat Growth

PokeRogue recalculates stats from species data, level, IV-like values, natures, and modifiers. BrainRogue only needs deterministic base-stat scaling for release:

- HP uses base stat, level, and a level bonus
- other stats use base stat and level
- level-up preserves current HP ratio loosely by adding the max HP delta

## Recommended BrainRogue Adaptation

Adapt:

- compact damage formula
- category-based offensive/defensive stat selection
- multiplier-based type chart
- priority plus speed turn ordering
- tie randomization
- explicit battle feedback event hooks
- XP awarded when the enemy is defeated, before rewards

Do not copy:

- PokeRogue phase manager
- ability/item modifier stack
- species/type data
- UI-specific battle phases
- exact source implementations

## Risks

- Moving XP from reward entry to battle victory must avoid double XP.
- Reward moves and stat boosts should not be overwritten by automatic level-up move synchronization.
- Feedback events should be additive so existing BattleScene animation code keeps working.
- Enemy AI should remain simple enough to avoid surprising balance spikes.
