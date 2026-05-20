# PokeRogue Move Learning and Evolution Analysis

Reference source: `src/external/pokerogue/pokerogue-beta/pokerogue-beta`.

## XP and Level-Up Flow

- `src/phases/exp-phase.ts` awards EXP, records `lastLevel`, calls `pokemon.addExp()`, and queues `LevelUpPhase` if the Pokemon gained one or more levels.
- `src/phases/level-up-phase.ts` recalculates stats with `pokemon.calculateStats()`, updates battle info, shows the level-up message, then prompts the stat summary.
- When `LevelUpPhase.end()` runs, it gets level-up moves from `pokemon.getLevelMoves(this.lastLevel + 1)` and queues one `LearnMovePhase` per move.
- The same `end()` method checks `pokemon.getEvolution()` and queues `EvolutionPhase` if evolution is currently allowed.

## Level-Up Move Selection

- `src/field/pokemon.ts#getLevelMoves()` filters species/form level moves to the level range from `startingLevel` through the current level.
- It sorts by level and removes duplicate move IDs after filtering, so duplicate moves do not prompt repeatedly.
- `src/phases/learn-move-phase.ts` first checks the current moveset and immediately ends if the Pokemon already knows the move.

## Four Move Limit and Replacement Prompt

- `LearnMovePhase.start()` reads `pokemon.getMoveset()`.
- If the moveset has fewer than four moves, it calls `learnMove(currentMoveset.length, move, pokemon)` and appends the move at the next empty slot.
- If the moveset already has four moves, `replaceMoveCheck()` shows:
  - the Pokemon wants to learn the move,
  - it already knows four moves,
  - whether a move should be forgotten and replaced.
- If the player agrees, `forgetMoveProcess()` opens summary move selection. Selecting an old move calls `learnMove(index, move, pokemon, fullText)`.
- If the player refuses or selects the new move/cancel option, `rejectMoveAndEnd()` confirms stopping and then shows the not-learned message.
- Actual replacement is centralized in `pokemon.setMove(index, moveId)`.

## Evolution Trigger and Messages

- `LevelUpPhase.end()` checks `pokemon.getEvolution()` after level-up move phase queuing and, if present, queues `EvolutionPhase`.
- `src/phases/evolution-phase.ts` starts by switching to `UiMode.EVOLUTION_SCENE`.
- It shows the evolving message, plays the evolution scene, then calls `pokemon.evolve(...)`.
- Successful evolution shows the completion message equivalent to "`oldName` evolved into `newName`".
- Failed/cancelled evolution has its own stopped-evolving and pause-evolutions prompts.

## Stat Recalculation After Evolution

- `pokemon.evolve(...)` mutates the existing Pokemon to the evolved species/form rather than replacing the party member object.
- The Pokemon recalculates stats with `calculateStats()` and refreshes UI with `updateInfo(true)`.
- `calculateStats()` preserves current HP behavior: if max HP grows, current HP increases by the max HP delta; it does not blindly full-heal on evolution.
- Moves are not rebuilt from the evolved species. Existing moveset entries remain unless later learn-move phases replace them.

## BrainRogue Implications

- BrainRogue should keep the existing creature instance and battle state object through level-up and evolution.
- Level-up moves should be derived from BrainRogue creature `levelUpMoves`, deduplicated, and skipped if already known.
- Four moves should be a hard maximum; when full, the player should choose whether and what to replace.
- Evolution should mutate `definitionId`, name, types, and recalculated stats, while preserving current moves and PP.
- Evolution HP should follow max-HP-delta behavior instead of resetting to full HP.
