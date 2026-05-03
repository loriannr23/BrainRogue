import { BattleState } from '../../types/battle';
import { BattleStatStageKey, BattleStatusId, CreatureInstance } from '../../types/creature';
import { MoveDefinition, MoveEffect } from '../../types/move';
import { applyStatStageModifier, getPositiveStageTotal } from './StatStages';

export interface EffectContext {
  attacker: CreatureInstance;
  target: CreatureInstance;
  move: MoveDefinition;
  damageDealt: number;
  battleState: BattleState;
  rng?: () => number;
}

export interface EffectResult {
  message: string;
}

type StatEffectConfig = {
  stat: BattleStatStageKey;
  direction: 1 | -1;
  defaultTarget: 'self' | 'opponent';
};

const statEffects: Partial<Record<MoveEffect['type'], StatEffectConfig>> = {
  attack_up: { stat: 'attack', direction: 1, defaultTarget: 'self' },
  defense_up: { stat: 'defense', direction: 1, defaultTarget: 'self' },
  spAttack_up: { stat: 'spAttack', direction: 1, defaultTarget: 'self' },
  spDefense_up: { stat: 'spDefense', direction: 1, defaultTarget: 'self' },
  speed_up: { stat: 'speed', direction: 1, defaultTarget: 'self' },
  attack_down: { stat: 'attack', direction: -1, defaultTarget: 'opponent' },
  defense_down: { stat: 'defense', direction: -1, defaultTarget: 'opponent' },
  spAttack_down: { stat: 'spAttack', direction: -1, defaultTarget: 'opponent' },
  spDefense_down: { stat: 'spDefense', direction: -1, defaultTarget: 'opponent' },
  speed_down: { stat: 'speed', direction: -1, defaultTarget: 'opponent' },
  accuracy_down: { stat: 'accuracy', direction: -1, defaultTarget: 'opponent' },
  accuracy_down_self: { stat: 'accuracy', direction: -1, defaultTarget: 'self' },
};

const statusEffects = new Set<MoveEffect['type']>(['rooted', 'confuse']);

const recoilPercent: Partial<Record<MoveEffect['type'], number>> = {
  minor_recoil: 0.1,
  recoil: 0.25,
  heavy_recoil: 0.4,
};

const statLabels: Record<BattleStatStageKey, string> = {
  attack: 'Attack',
  defense: 'Defense',
  spAttack: 'Special Attack',
  spDefense: 'Special Defense',
  speed: 'Speed',
  accuracy: 'Accuracy',
};

export const processMoveEffects = (context: EffectContext): EffectResult[] => {
  const results: EffectResult[] = [];
  const rng = context.rng ?? Math.random;

  for (const effect of context.move.effects) {
    if (!rollEffect(effect, rng)) {
      continue;
    }

    const statConfig = statEffects[effect.type];
    if (statConfig) {
      const effectTarget = getEffectTarget(context, effect.target ?? statConfig.defaultTarget);
      const stages = (effect.value ?? 1) * statConfig.direction;
      applyStatStageModifier(effectTarget, statConfig.stat, stages);
      results.push({ message: `${effectTarget.name}'s ${statLabels[statConfig.stat]} ${stages > 0 ? 'rose' : 'fell'}!` });
      continue;
    }

    if (statusEffects.has(effect.type)) {
      const effectTarget = getEffectTarget(context, effect.target ?? 'opponent');
      results.push(...applyStatus(effectTarget, effect.type as BattleStatusId, effect.duration ?? 3, context.move.id));
      continue;
    }

    const recoil = recoilPercent[effect.type];
    if (recoil) {
      const damage = Math.max(1, Math.floor(context.damageDealt * recoil));
      if (damage > 0) {
        context.attacker.currentHp = Math.max(0, context.attacker.currentHp - damage);
        results.push({ message: `${context.attacker.name} was hurt by recoil!` });
      }
      continue;
    }

    if (effect.type === 'minor_heal') {
      const heal = Math.max(1, Math.floor(context.damageDealt * 0.2));
      const before = context.attacker.currentHp;
      context.attacker.currentHp = Math.min(context.attacker.stats.hp, context.attacker.currentHp + heal);
      if (context.attacker.currentHp > before) {
        results.push({ message: `${context.attacker.name} recovered health!` });
      }
      continue;
    }

    if (effect.type === 'crit_boost') {
      context.attacker.effectStacks ??= {};
      context.attacker.effectStacks.crit = Math.min(3, (context.attacker.effectStacks.crit ?? 0) + 1);
      results.push({ message: `${context.attacker.name} focused for a sharper hit!` });
      continue;
    }

    if (effect.type === 'echo_scaling') {
      context.attacker.effectStacks ??= {};
      context.attacker.effectStacks.echo = (context.attacker.effectStacks.echo ?? 0) + 1;
      applyStatStageModifier(context.attacker, 'spAttack', effect.value ?? 1);
      results.push({ message: `${context.attacker.name}'s rhythm intensified!` });
      continue;
    }

    if (effect.type === 'root_synergy') {
      const targetSlowed = (context.target.statStages?.speed ?? 0) < 0
        || context.target.battleStatuses?.some((status) => status.id === 'rooted');
      if (targetSlowed) {
        results.push(...applyStatus(context.target, 'rooted', effect.duration ?? 2, context.move.id));
      } else {
        applyStatStageModifier(context.target, 'speed', -1);
        results.push({ message: `${context.target.name}'s Speed fell!` });
      }
      continue;
    }

    if (effect.type === 'overheat_stack') {
      context.attacker.effectStacks ??= {};
      context.attacker.effectStacks.overheat = (context.attacker.effectStacks.overheat ?? 0) + 1;
      applyStatStageModifier(context.attacker, 'attack', effect.value ?? 1);
      const selfDamage = Math.max(1, Math.floor(context.attacker.stats.hp * 0.06));
      context.attacker.currentHp = Math.max(0, context.attacker.currentHp - selfDamage);
      results.push({ message: `${context.attacker.name} overheated for more power!` });
      continue;
    }

    if (effect.type === 'rhythm_scaling_buff') {
      const positiveStages = getPositiveStageTotal(context.attacker);
      applyStatStageModifier(context.attacker, 'spAttack', 1);
      applyStatStageModifier(context.attacker, 'spDefense', 1);
      results.push({ message: `${context.attacker.name} built momentum!` });
      if (positiveStages >= 3) {
        applyStatStageModifier(context.attacker, 'speed', 1);
        results.push({ message: `${context.attacker.name}'s Speed rose with the rhythm!` });
      }
      continue;
    }
  }

  return results;
};

const rollEffect = (effect: MoveEffect, rng: () => number): boolean => rng() * 100 < (effect.chance ?? 100);

const getEffectTarget = (context: EffectContext, target: 'self' | 'opponent'): CreatureInstance =>
  target === 'self' ? context.attacker : context.target;

const applyStatus = (
  creature: CreatureInstance,
  id: BattleStatusId,
  duration: number,
  sourceMoveId: string,
): EffectResult[] => {
  creature.battleStatuses ??= [];
  const existing = creature.battleStatuses.find((status) => status.id === id);
  if (existing) {
    existing.duration = Math.max(existing.duration, duration);
    return [{ message: `${creature.name}'s ${id} lingered!` }];
  }
  creature.battleStatuses.push({ id, duration, sourceMoveId });
  return [{ message: `${creature.name} is now ${id}!` }];
};
