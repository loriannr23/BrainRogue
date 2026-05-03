# BrainRogue Battle Core Implementation Notes

## Implemented Scope

BrainRogue now has a cleaner native battle core inspired by the PokeRogue reference structure without copying reference code.

Implemented systems:

- Pokemon-like damage formula using level, power, attack stat, defense stat, STAB, type effectiveness, critical hit placeholder, variance, and burn penalty.
- Move category handling for `physical`, `special`, and `status`.
- BrainRogue-native type effectiveness chart.
- Priority and speed-based turn order with randomized speed ties.
- Basic enemy AI chooses valid moves from the enemy moveset.
- XP is awarded on enemy defeat before the reward screen opens.
- Level-up recalculates stats immediately.
- Battle log shows XP and level-up messages.
- Battle feedback events are exposed for UI/FX hooks.

## Native Files Updated

- `src/types/battle.ts`
- `src/systems/battle/BattleEngine.ts`
- `src/systems/progression/ExperienceSystem.ts`
- `src/game/scenes/BattleScene.ts`
- `src/game/scenes/RewardScene.ts`

## Damage Formula

Damage is calculated in `src/systems/battle/DamageCalculator.ts`:

```text
base = (((2 * attackerLevel / 5 + 2) * movePower * attack / defense) / 50) + 2
damage = floor(base * STAB * typeEffectiveness * crit * randomVariance * burnPenalty)
```

Rules:

- Physical moves use `attack` against `defense`.
- Special moves use `spAttack` against `spDefense`.
- Status moves deal no direct damage.
- STAB is `1.5` when attacker type matches move type.
- Type multiplier comes from `TypeChart.ts`.
- Critical hit placeholder uses a base `6.25%` chance and `1.5x` damage.
- Random variance is `85%` to `100%`.
- Burn halves physical damage.

## Type System

BrainRogue uses its own type chart in `src/systems/battle/TypeChart.ts`.

Supported local types:

- meme
- sound
- chaos
- water
- fire
- earth
- air
- electric
- toxic
- metal
- psychic
- ancient
- food
- shadow
- light

The chart supports:

- super effective: `2x`
- resisted: `0.5x`
- immune: `0x`
- dual-type multiplication

## Turn Order

Turn order is resolved in `BattleEngine.orderActions()`:

1. Higher move priority acts first.
2. Higher effective speed acts first.
3. Equal speed is randomized.

Effective speed includes active battle stat stages and temporary status modifiers from the existing stat-stage system.

## XP and Level-Up Flow

XP now happens in `BattleScene` when `BattleEngine` reports `winner === 'player'`.

Flow:

1. Enemy faints.
2. Active player creature receives XP from `ExperienceSystem.awardXp()`.
3. Level-up recalculates stats via `ExperienceSystem.recalculateStats()`.
4. Evolution check runs after level-up.
5. XP, level-up, and evolution messages are appended to the battle log.
6. RewardScene opens without awarding XP again.

RewardScene still receives progression messages for its header, but it no longer mutates XP or evolution state.

## Feedback Hooks

`src/types/battle.ts` now exposes:

```ts
type BattleFeedbackEventType =
  | 'onDamage'
  | 'onCritical'
  | 'onSuperEffective'
  | 'onNotVeryEffective'
  | 'onMiss'
  | 'onLevelUp'
  | 'onFaint';
```

Each `BattleEvent` has a `feedback` array, and each `BattleState` has `feedbackEvents`.

Current emitted events:

- `onDamage`: damaging move dealt HP damage.
- `onCritical`: critical hit occurred.
- `onSuperEffective`: type effectiveness was greater than `1`.
- `onNotVeryEffective`: type effectiveness was less than `1`.
- `onMiss`: move failed accuracy.
- `onFaint`: target HP reached `0`.
- `onLevelUp`: player creature leveled after victory.

These hooks are additive. Existing BattleScene animation behavior still reads the old `BattleEvent` fields.

## Notes and Constraints

- Battle UI layout, menu visuals, and keyboard controls were not changed.
- Existing move effects and status processing still run through `EffectProcessor` and `StatusSystem`.
- Enemy AI remains simple and uses the current `AIController`.
- Level-up does not rewrite the creature moveset, so reward-learned moves are preserved.
