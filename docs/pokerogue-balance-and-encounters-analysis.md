# PokeRogue Balance and Encounters Analysis

Reference inspected: `src/external/pokerogue/pokerogue-beta/pokerogue-beta/src`.

## Damage Formula Modifiers

PokeRogue keeps the core Pokemon damage shape in `field/pokemon.ts`:

- Base damage is `(((2 * level / 5 + 2) * power * attack / defense) / 50) + 2`.
- Final damage then applies target count, multi-hit modifiers, field/weather/terrain modifiers, critical hit, random variance, STAB, type effectiveness, burn penalty, screens, tag interactions, ability modifiers, and enemy tokens.
- STAB starts at `1.5x` for matching type and can rise with special mechanics.
- Critical hits use a `1.5x` multiplier.
- Random damage spread is `0.85x` to `1.0x` for real damage rolls.

Important pacing takeaway: PokeRogue does not rely on large flat HP pools. Damage remains meaningful because stats and HP use Pokemon-style level curves and move power is allowed to matter.

## Stat Calculation and HP Scaling

PokeRogue calculates permanent stats in `Pokemon.calculateStats()`:

- HP: `floor((2 * baseHp + IV) * level / 100) + level + 10`.
- Other stats: `floor((2 * baseStat + IV) * level / 100) + 5`, then nature and modifiers.
- In-battle effective stats apply stage multipliers and modifiers on top of permanent stats.

BrainRogue previously used `base + level * 2` for every stat. That made level 5 creatures have HP around 55-80 instead of around 19-23, which stretched early fights even when damage formula was Pokemon-like.

## Level Scaling by Wave

PokeRogue wave levels are handled in `battle.ts`:

- Base level is `1 + wave / 2 + (wave / 25)^2`.
- Boss waves multiply that by `1.2`.
- Non-boss waves add small seeded variation.
- Level caps use a rounded boss-scaled wave level in `battle-scene.ts`.

The philosophy is steady level growth with boss spikes, not large hidden stat multipliers. Mystery encounters add level offsets at about `+1 level per 10 waves` when needed.

## Enemy Generation

PokeRogue `Arena.randomSpecies()` chooses from biome rarity pools, downgrades empty tiers, and then calls species evolution resolution. It also rerolls incompatible legend-like encounters.

The key point for BrainRogue: biome pools are not enough by themselves. After a species is selected, PokeRogue resolves whether that species is valid for the encounter level and may replace it with a pre-evolution or evolution.

## Species and Evolution Availability by Level

PokeRogue uses `determineEnemySpecies()` in `ai-species-gen.ts`:

- If a selected species is evolved but the encounter level is below its requirement, it forces a pre-evolution.
- If a base species can evolve, evolution is allowed only after level thresholds are met.
- Wild encounters use a stricter threshold flavor than trainer encounters.
- Evolution is not automatic at the exact level; there is a randomized window after the threshold.

BrainRogue needs a simpler native version: each creature declares an `evolutionStage` and `minEncounterLevel`, and encounter generation filters or falls back to a valid lower stage.

## Move Power and Early Balance

PokeRogue's generated enemy movesets strongly prefer useful damaging moves and especially STAB coverage. Its move generation comments note forced STAB and weighting for damaging moves when a moveset has too few attacks.

BrainRogue already has early moves mostly in the 35-55 power range. Those powers are reasonable once HP is no longer inflated. The main problem was not move power alone; it was inflated stat scaling plus enemy wave multipliers.

## BrainRogue Direction

BrainRogue should keep its smaller custom creature list and mechanics, but align with PokeRogue's balance philosophy:

- Use Pokemon-style level scaling for HP and stats.
- Keep move power meaningful.
- Use level as the primary encounter scaler.
- Keep boss bonuses explicit and moderate.
- Gate evolved encounters by level instead of allowing biome pools to spawn evolved forms early.
