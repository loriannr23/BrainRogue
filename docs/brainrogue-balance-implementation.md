# BrainRogue Balance Implementation

Implemented native balance changes based on the PokeRogue reference analysis.

## Stat Scaling

BrainRogue now uses Pokemon-style level stat scaling in `ExperienceSystem`:

- HP: `floor((2 * baseHp * level) / 100) + level + 10`
- Other stats: `floor((2 * baseStat * level) / 100) + 5`

This removes the inflated early HP caused by the old `base + level * 2` formula. Starter-level creatures now have compact HP pools, so 35-55 power moves produce meaningful early damage.

## Damage Pacing

The existing Pokemon-like damage formula remains intact. The pacing fix comes from:

- Lower, level-scaled HP.
- Offensive and defensive stats that scale in the same range.
- Removing stacked enemy wave stat multipliers.
- Keeping STAB, type effectiveness, crits, burn penalty, and variance in place.

Expected early pacing is now closer to 3-5 successful hits for ordinary fights, with super effective hits much more threatening.

## Enemy Scaling

Enemy level by wave now grows more gradually:

- Early waves stay near the level 5 starter range.
- Boss waves get a smaller level bump.
- Bosses receive moderate explicit stat bonuses instead of broad wave inflation.

Boss bonuses are now:

- HP `1.35x`
- Attack and Special Attack `1.12x`
- Defense and Special Defense `1.08x`

## Evolution Encounter Gating

Creature definitions now include:

- `evolutionStage: 1 | 2 | 3`
- `minEncounterLevel`

Default thresholds:

- Stage 1: level 1+
- Stage 2: level 14+
- Stage 3: level 32+

Encounter generation filters selected biome pools through those thresholds. If a biome or boss pool selects an evolved creature too early, BrainRogue falls back to the highest valid lower stage in that evolution line.

## Move Balance

Early move powers were reviewed and kept intact because the main pacing issue was stat inflation, not move definitions. With corrected stats:

- 35-45 power moves are useful early.
- 50-55 power moves are reliable pressure.
- 70+ power moves remain burst options gated by accuracy, PP, or later move access.

## Debug Logging

Development builds now log:

- Encounter species, level, evolution stage, min encounter level, wave, and boss flag.
- Per-damage attacker/defender, selected move power, offensive stat, defensive stat, base damage, final damage, type multiplier, STAB, crit, and burn penalty.

## Verification

`npm run build` passes.
