# BrainRogue Move Learning and Evolution Implementation

## Scope

Implemented PokeRogue-compatible progression using BrainRogue creatures, moves, battle UI, keyboard input, and battle log message queue.

## Changed Systems

- `src/systems/progression/ExperienceSystem.ts`
  - `awardXp()` now returns structured messages plus level-up records.
  - Level-up records include deduplicated BrainRogue `levelUpMoves` learned between the old and new levels.
  - Stat recalculation on level-up preserves HP by applying the max-HP delta.

- `src/systems/progression/LearnMoveSystem.ts`
  - Centralizes the four-move cap.
  - Skips moves the creature already knows.
  - Adds moves directly when the creature has fewer than four moves.
  - Replaces a selected move when the creature already has four moves.
  - Keeps `moves` and `moveIds` synchronized.

- `src/systems/progression/EvolutionSystem.ts`
  - Mutates the existing creature instance instead of replacing it.
  - Recalculates stats from the evolved BrainRogue creature definition.
  - Preserves current moves and PP.
  - Preserves HP using the max-HP delta instead of full healing.
  - Emits PokeRogue-style evolving and evolved messages.

- `src/game/scenes/BattleScene.ts`
  - Runs XP messages, level-up move prompts, and evolution messages before leaving victory progression.
  - Uses the current battle log for prompts.
  - Uses existing keyboard input: arrows/WASD to choose, Enter/Space to confirm, Escape/Backspace to decline.
  - Refreshes the player sprite and vitals after evolution so the evolved creature remains the active party member for following battles.

## Runtime Flow

1. The player wins a battle.
2. BrainRogue awards XP and shows XP/level-up messages.
3. For each newly reached level, BrainRogue checks creature `levelUpMoves`.
4. If the move is already known, no prompt is shown.
5. If there is an empty move slot, the move is learned immediately.
6. If four moves are already known, BrainRogue asks whether to replace a move.
7. If replacement is accepted, BrainRogue prompts for the forgotten move and applies the replacement.
8. Evolution is checked after level-up move handling.
9. If a level evolution is available, BrainRogue mutates the existing creature, recalculates stats, preserves moves, updates HP by max-HP delta, and shows evolution messages.
10. Victory progression continues to the existing reward scene.

## Acceptance Mapping

- Analysis doc: `docs/pokerogue-move-learning-evolution-analysis.md`
- Implementation doc: this file
- Level-up moves: handled through `ExperienceSystem.getLevelUpMoveIds()` and `BattleScene.processLevelUpMove()`
- Four move limit: enforced by `MAX_CREATURE_MOVES`
- Move replacement prompt: implemented in battle log prompts in `BattleScene`
- Evolution: implemented by mutating existing creatures in `EvolutionSystem`
- Battle continues after evolution: existing battle/reward flow is retained, with evolved state persisted
- Build: verify with `npm run build`
