import { BattleState } from '../../types/battle';
import { CreatureInstance } from '../../types/creature';
import { MoveDefinition, MoveEffect, MoveId } from '../../types/move';
import { getMove } from '../../data/moves';
import { calculateBaseDamage } from './damageSystem';
import { getEffectiveBattleStat } from './StatStages';
import { getTypeEffectiveness } from './TypeChart';

interface ScoredMove {
  moveId: MoveId;
  score: number;
  expectedDamage: number;
  reasons: string[];
}

const MAJOR_STATUS_EFFECTS = new Set(['burn', 'poison', 'paralyze']);
const BATTLE_STATUS_EFFECTS = new Set(['rooted', 'confuse']);
const BUFF_EFFECT_SUFFIX = '_up';
const DEBUFF_EFFECT_SUFFIX = '_down';
const LOW_HP_RATIO = 0.35;
const SETUP_HP_RATIO = 0.5;

export class AIController {
  chooseMove(state: BattleState): MoveId {
    const usableMoves = state.enemy.moves.filter((slot) => slot.currentPp > 0);
    const fallback = state.enemy.moveIds[0] ?? 'bonk';
    if (usableMoves.length === 0) {
      return fallback;
    }

    const eligibleMoves = usableMoves.filter((slot) => !this.isBlockedRedundantMajorStatusMove(state, getMove(slot.moveId)));
    const candidateMoves = eligibleMoves.length > 0 ? eligibleMoves : usableMoves;
    const scored = candidateMoves
      .map((slot) => this.scoreMove(state, getMove(slot.moveId)))
      .sort((a, b) => b.score - a.score);
    const chosen = this.pickWeightedMove(scored);

    if (import.meta.env.DEV) {
      console.log('[battle:enemy-ai]', {
        enemy: state.enemy.definitionId,
        turn: state.turn,
        scores: scored.map((entry) => ({
          moveId: entry.moveId,
          score: Math.round(entry.score * 10) / 10,
          expectedDamage: entry.expectedDamage,
          reasons: entry.reasons,
        })),
        chosenMove: chosen.moveId,
        reason: chosen.reasons[0] ?? 'weighted choice',
      });
    }

    return chosen.moveId;
  }

  private scoreMove(state: BattleState, move: MoveDefinition): ScoredMove {
    const reasons: string[] = [];
    const enemyHpRatio = state.enemy.currentHp / Math.max(1, state.enemy.stats.hp);
    const lowHp = enemyHpRatio < LOW_HP_RATIO;
    const expectedDamage = this.expectedDamage(state.enemy, state.player, move);
    let score = 8 + move.priority * 6;

    if (expectedDamage > 0) {
      score += expectedDamage * (lowHp ? 1.35 : 1);
      reasons.push(`expected damage ${expectedDamage}`);
    }

    const effectiveness = move.category === 'status' ? 1 : getTypeEffectiveness(move.type, state.player.types);
    if (effectiveness > 1) {
      score += effectiveness >= 4 ? 36 : 24;
      reasons.push('super effective');
    } else if (effectiveness > 0 && effectiveness < 1) {
      score -= 16;
      reasons.push('resisted');
    } else if (effectiveness === 0) {
      score -= 48;
      reasons.push('no type effect');
    }

    if (move.accuracy < 100) {
      const penalty = (100 - Math.max(1, move.accuracy)) * 0.22;
      score -= penalty;
      reasons.push(`accuracy penalty ${Math.round(penalty)}`);
    }

    const statusScore = this.scoreStatusMove(state, move, lowHp);
    score += statusScore.score;
    reasons.push(...statusScore.reasons);

    const buffScore = this.scoreBuffMove(state, move, enemyHpRatio);
    score += buffScore.score;
    reasons.push(...buffScore.reasons);

    const debuffScore = this.scoreDebuffMove(move, lowHp);
    score += debuffScore.score;
    reasons.push(...debuffScore.reasons);

    if (lowHp && expectedDamage <= 0) {
      score -= 18;
      reasons.push('low HP avoids setup');
    }

    return {
      moveId: move.id,
      score: Math.max(1, score),
      expectedDamage,
      reasons,
    };
  }

  private expectedDamage(attacker: CreatureInstance, defender: CreatureInstance, move: MoveDefinition): number {
    if (move.category === 'status' || move.power <= 0) {
      return 0;
    }

    const attack = move.category === 'physical'
      ? getEffectiveBattleStat(attacker, 'attack')
      : getEffectiveBattleStat(attacker, 'spAttack');
    const defense = move.category === 'physical'
      ? getEffectiveBattleStat(defender, 'defense')
      : getEffectiveBattleStat(defender, 'spDefense');
    const effectiveness = getTypeEffectiveness(move.type, defender.types);
    if (effectiveness === 0) {
      return 0;
    }

    const stab = attacker.types.includes(move.type) ? 1.5 : 1;
    const burnPenalty = attacker.status === 'burn' && move.category === 'physical' ? 0.5 : 1;
    const averageVariance = 0.925;
    const hitChance = Math.max(1, Math.min(100, move.accuracy)) / 100;
    const damage = calculateBaseDamage(attacker.level, move.power, attack, defense)
      * effectiveness
      * stab
      * burnPenalty
      * averageVariance
      * hitChance;

    return Math.max(1, Math.floor(damage));
  }

  private scoreStatusMove(state: BattleState, move: MoveDefinition, lowHp: boolean): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;
    const inflictsMajorStatus = !!move.statusEffect && MAJOR_STATUS_EFFECTS.has(move.statusEffect);
    const inflictsBattleStatus = move.effects.some((effect) => BATTLE_STATUS_EFFECTS.has(effect.type));
    const playerHasMajorStatus = !!state.player.status;

    if (inflictsMajorStatus) {
      if (playerHasMajorStatus) {
        score -= 34;
        reasons.push('target already has major status');
      } else {
        const earlyBonus = Math.max(0, 18 - state.turn * 3);
        score += 26 + earlyBonus;
        reasons.push('major status opportunity');
      }
    }

    if (inflictsBattleStatus) {
      const duplicate = move.effects.some((effect) => state.player.battleStatuses?.some((status) => status.id === effect.type));
      if (duplicate) {
        score -= 12;
        reasons.push('battle status already active');
      } else {
        const earlyBonus = Math.max(0, 12 - state.turn * 2);
        score += 16 + earlyBonus;
        reasons.push('battle status opportunity');
      }
    }

    if (lowHp && move.power <= 0 && (inflictsMajorStatus || inflictsBattleStatus)) {
      score -= 12;
      reasons.push('low HP prefers damage');
    }

    return { score, reasons };
  }

  private scoreBuffMove(state: BattleState, move: MoveDefinition, enemyHpRatio: number): { score: number; reasons: string[] } {
    const buffEffects = move.effects.filter((effect) => this.isBuffEffect(effect));
    if (buffEffects.length === 0) {
      return { score: 0, reasons: [] };
    }

    if (enemyHpRatio <= SETUP_HP_RATIO) {
      return { score: -18, reasons: ['too hurt for setup'] };
    }

    const earlyBonus = Math.max(0, 16 - state.turn * 3);
    return {
      score: 18 + earlyBonus + Math.min(12, buffEffects.length * 4),
      reasons: ['setup while healthy'],
    };
  }

  private scoreDebuffMove(move: MoveDefinition, lowHp: boolean): { score: number; reasons: string[] } {
    const debuffs = move.effects.filter((effect) => effect.target !== 'self' && (effect.type.endsWith(DEBUFF_EFFECT_SUFFIX) || effect.type === 'accuracy_down'));
    if (debuffs.length === 0) {
      return { score: 0, reasons: [] };
    }

    return {
      score: lowHp ? 6 : 14,
      reasons: ['debuff pressure'],
    };
  }

  private isBuffEffect(effect: MoveEffect): boolean {
    return effect.target === 'self' && effect.type.endsWith(BUFF_EFFECT_SUFFIX);
  }

  private isBlockedRedundantMajorStatusMove(state: BattleState, move: MoveDefinition): boolean {
    return !!state.player.status
      && move.power <= 0
      && !!move.statusEffect
      && MAJOR_STATUS_EFFECTS.has(move.statusEffect);
  }

  private pickWeightedMove(scored: ScoredMove[]): ScoredMove {
    if (scored.length === 1) {
      return scored[0];
    }

    const weights = scored.map((_, index) => {
      if (index === 0) return 0.5;
      if (index === 1) return 0.3;
      return 0.2 / Math.max(1, scored.length - 2);
    });
    const roll = Math.random();
    let cursor = 0;
    for (let i = 0; i < scored.length; i += 1) {
      cursor += weights[i];
      if (roll <= cursor) {
        return scored[i];
      }
    }
    return scored[0];
  }
}
