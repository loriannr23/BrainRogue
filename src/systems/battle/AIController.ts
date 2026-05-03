import { BattleState } from '../../types/battle';
import { MoveId } from '../../types/move';
import { getMove } from '../../data/moves';
import { getTypeEffectiveness } from './TypeChart';

export class AIController {
  chooseMove(state: BattleState): MoveId {
    const usableMoves = state.enemy.moves.filter((slot) => slot.currentPp > 0);
    const fallback = state.enemy.moveIds[0] ?? 'bonk';
    if (usableMoves.length === 0) {
      return fallback;
    }

    const scored = usableMoves.map((slot) => {
      const move = getMove(slot.moveId);
      const effectiveness = move.category === 'status' ? 0.9 : getTypeEffectiveness(move.type, state.player.types);
      const sameTypeBonus = state.enemy.types.includes(move.type) ? 0.25 : 0;
      const lowHpBias = state.enemy.currentHp < state.enemy.stats.hp * 0.35 && move.category !== 'status' ? 0.25 : 0;
      const statusValue = move.effects.some((effect) => ['rooted', 'burn', 'poison', 'confuse'].includes(effect.type) && !state.player.battleStatuses?.some((status) => status.id === effect.type)) ? 34 : 0;
      const buffValue = move.effects.some((effect) => effect.target === 'self' && effect.type.endsWith('_up'))
        ? Math.max(0, 26 - state.turn * 2)
        : 0;
      const debuffValue = move.effects.some((effect) => effect.target !== 'self' && (effect.type.endsWith('_down') || effect.type === 'accuracy_down'))
        ? 18
        : 0;
      return {
        moveId: slot.moveId,
        score: move.power * effectiveness + sameTypeBonus * 40 + lowHpBias * 40 + move.priority * 12 + statusValue + buffValue + debuffValue,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    const topMoves = scored.slice(0, Math.min(2, scored.length));
    return topMoves[Math.floor(Math.random() * topMoves.length)].moveId;
  }
}
