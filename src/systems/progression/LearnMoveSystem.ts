import { getMove } from '../../data/moves';
import { CreatureInstance, CreatureMoveSlot } from '../../types/creature';
import { MoveId } from '../../types/move';

export const MAX_CREATURE_MOVES = 4;

export type LearnMoveResult =
  | { learned: false; reason: 'alreadyKnown'; messages: string[] }
  | { learned: false; reason: 'rejected'; messages: string[] }
  | { learned: true; reason: 'added'; messages: string[] }
  | { learned: true; reason: 'replaced'; forgottenMoveId: MoveId; messages: string[] };

export class LearnMoveSystem {
  canLearnMove(creature: CreatureInstance, moveId: MoveId): boolean {
    return !creature.moves.some((slot) => slot.moveId === moveId);
  }

  learnMove(creature: CreatureInstance, moveId: MoveId, replacementIndex?: number): LearnMoveResult {
    const move = getMove(moveId);
    if (!this.canLearnMove(creature, moveId)) {
      return { learned: false, reason: 'alreadyKnown', messages: [] };
    }

    const slot: CreatureMoveSlot = {
      moveId,
      currentPp: move.pp,
      maxPp: move.pp,
    };

    if (creature.moves.length < MAX_CREATURE_MOVES) {
      creature.moves.push(slot);
      this.syncMoveIds(creature);
      return {
        learned: true,
        reason: 'added',
        messages: [`${creature.name} learned ${move.name}!`],
      };
    }

    if (replacementIndex === undefined || replacementIndex < 0 || replacementIndex >= MAX_CREATURE_MOVES) {
      return {
        learned: false,
        reason: 'rejected',
        messages: [`${creature.name} did not learn ${move.name}.`],
      };
    }

    const forgottenMoveId = creature.moves[replacementIndex].moveId;
    const forgottenMove = getMove(forgottenMoveId);
    creature.moves[replacementIndex] = slot;
    this.syncMoveIds(creature);
    return {
      learned: true,
      reason: 'replaced',
      forgottenMoveId,
      messages: [
        '1... 2... and 3... Poof!',
        `${creature.name} forgot how to use ${forgottenMove.name}.`,
        `And ${creature.name} learned ${move.name}!`,
      ],
    };
  }

  private syncMoveIds(creature: CreatureInstance): void {
    creature.moveIds = creature.moves.map((slot) => slot.moveId);
  }
}
