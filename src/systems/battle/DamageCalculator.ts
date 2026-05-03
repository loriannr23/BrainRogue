import { CreatureInstance } from '../../types/creature';
import { DamageResult } from '../../types/battle';
import { MoveDefinition } from '../../types/move';
import { chance } from '../../utils/random';
import { getAccuracyMultiplier, getEffectiveBattleStat } from './StatStages';
import { calculateDamage } from './damageSystem';

const DEFAULT_CRIT_CHANCE_PERCENT = 100 / 16;
const CRIT_STAGE_BONUS_PERCENT = 12.5;
const CRIT_DAMAGE_MULTIPLIER = 1.5;

export class DamageCalculator {
  calculate(attacker: CreatureInstance, defender: CreatureInstance, move: MoveDefinition): DamageResult {
    if (!chance(Math.min(100, move.accuracy * getAccuracyMultiplier(attacker)))) {
      return { damage: 0, isCrit: false, effectiveness: 1, missed: true, move };
    }

    if (move.category === 'status' || move.power <= 0) {
      return { damage: 0, isCrit: false, effectiveness: 1, missed: false, move };
    }

    const calculated = calculateDamage(
      {
        level: attacker.level,
        attack: getEffectiveBattleStat(attacker, 'attack'),
        specialAttack: getEffectiveBattleStat(attacker, 'spAttack'),
        types: attacker.types,
      },
      {
        defense: getEffectiveBattleStat(defender, 'defense'),
        specialDefense: getEffectiveBattleStat(defender, 'spDefense'),
        types: defender.types,
      },
      {
        power: move.power,
        type: move.type,
        category: move.category,
      },
    );
    const effectiveness = calculated.effectivenessMultiplier;
    if (effectiveness === 0) {
      return { damage: 0, isCrit: false, effectiveness, missed: false, move };
    }
    const stab = attacker.types.includes(move.type) ? 1.5 : 1;
    const critChance = DEFAULT_CRIT_CHANCE_PERCENT + (attacker.effectStacks?.crit ?? 0) * CRIT_STAGE_BONUS_PERCENT;
    const isCrit = chance(critChance);
    const crit = isCrit ? CRIT_DAMAGE_MULTIPLIER : 1;
    const isBurned = attacker.status === 'burn';
    const burnPenalty = isBurned && move.category === 'physical' ? 0.5 : 1;
    const damage = Math.max(1, Math.floor(calculated.damage * stab * crit * burnPenalty));

    if (import.meta.env.DEV) {
      console.log('[battle:damage]', {
        attacker: attacker.definitionId,
        attackerLevel: attacker.level,
        defender: defender.definitionId,
        defenderLevel: defender.level,
        move: move.id,
        movePower: move.power,
        category: move.category,
        offensiveStat: calculated.offensiveStat,
        defensiveStat: calculated.defensiveStat,
        baseDamage: calculated.damage,
        finalDamage: damage,
        typeMultiplier: effectiveness,
        stab,
        crit,
        burnPenalty,
      });
    }

    return { damage, isCrit, effectiveness, missed: false, move };
  }
}
