import { CreatureType } from '../../types/creature';
import { MoveCategory } from '../../types/move';
import { getTypeEffectiveness } from './typeSystem';

export type DamageEffectiveness = 'super' | 'normal' | 'notVery' | 'none';

export interface DamageAttacker {
  level: number;
  attack: number;
  specialAttack: number;
  types: CreatureType[];
}

export interface DamageDefender {
  defense: number;
  specialDefense: number;
  types: CreatureType[];
}

export interface DamageMove {
  power: number;
  type: CreatureType;
  category: Extract<MoveCategory, 'physical' | 'special'>;
}

export interface DamageCalculationResult {
  damage: number;
  effectiveness: DamageEffectiveness;
  effectivenessMultiplier: 0 | 0.5 | 1 | 2 | 4;
  offensiveStat: number;
  defensiveStat: number;
}

interface BattleStats {
  attack: number;
  defense: number;
}

const MIN_RANDOM_FACTOR = 0.85;
const MAX_RANDOM_FACTOR = 1;

export const calculateDamage = (
  attacker: DamageAttacker,
  defender: DamageDefender,
  move: DamageMove,
): DamageCalculationResult => {
  const stats = selectBattleStats(attacker, defender, move.category);
  const baseDamage = calculateBaseDamage(attacker.level, move.power, stats.attack, stats.defense);
  const typeEffectiveness = getTypeEffectiveness(move.type, defender.types);
  const finalDamage = Math.floor(baseDamage * typeEffectiveness.multiplier * rollDamageVariance());
  const damage = typeEffectiveness.multiplier === 0 ? 0 : Math.max(1, finalDamage);

  if (import.meta.env.DEV) {
    console.log('[damageSystem]', {
      attacker: {
        level: attacker.level,
        attack: attacker.attack,
        specialAttack: attacker.specialAttack,
        types: attacker.types,
      },
      defender: {
        defense: defender.defense,
        specialDefense: defender.specialDefense,
        types: defender.types,
      },
      move: {
        power: move.power,
        type: move.type,
        category: move.category,
      },
      selectedStats: stats,
      calculatedDamage: damage,
      typeMultiplier: typeEffectiveness.multiplier,
    });
  }

  return {
    damage,
    effectiveness: typeEffectiveness.label,
    effectivenessMultiplier: typeEffectiveness.multiplier,
    offensiveStat: stats.attack,
    defensiveStat: stats.defense,
  };
};

export const selectBattleStats = (
  attacker: DamageAttacker,
  defender: DamageDefender,
  category: DamageMove['category'],
): BattleStats => {
  if (category === 'physical') {
    return {
      attack: Math.max(1, attacker.attack),
      defense: Math.max(1, defender.defense),
    };
  }

  return {
    attack: Math.max(1, attacker.specialAttack),
    defense: Math.max(1, defender.specialDefense),
  };
};

export const calculateBaseDamage = (
  level: number,
  power: number,
  attack: number,
  defense: number,
): number => ((((2 * level) / 5 + 2) * power * attack) / defense) / 50 + 2;

export const toEffectivenessLabel = (multiplier: number): DamageEffectiveness => {
  if (multiplier === 0) return 'none';
  if (multiplier > 1) return 'super';
  if (multiplier < 1) return 'notVery';
  return 'normal';
};

export const rollDamageVariance = (): number =>
  MIN_RANDOM_FACTOR + Math.random() * (MAX_RANDOM_FACTOR - MIN_RANDOM_FACTOR);
