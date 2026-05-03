import { CreatureType, StatusCondition } from './creature';

export type MoveId = string;
export type MoveCategory = 'physical' | 'special' | 'status';
export type MoveEffectTarget = 'self' | 'opponent';
export type MoveEffectType =
  | 'attack_up'
  | 'defense_up'
  | 'spAttack_up'
  | 'spDefense_up'
  | 'speed_up'
  | 'attack_down'
  | 'defense_down'
  | 'spAttack_down'
  | 'spDefense_down'
  | 'speed_down'
  | 'accuracy_down'
  | 'rooted'
  | 'burn'
  | 'poison'
  | 'confuse'
  | 'minor_recoil'
  | 'recoil'
  | 'heavy_recoil'
  | 'minor_heal'
  | 'accuracy_down_self'
  | 'crit_boost'
  | 'echo_scaling'
  | 'root_synergy'
  | 'overheat_stack'
  | 'rhythm_scaling_buff';

export interface MoveEffect {
  type: MoveEffectType;
  chance?: number;
  value?: number;
  target?: MoveEffectTarget;
  duration?: number;
  condition?: string;
}

export interface MoveDefinition {
  id: MoveId;
  name: string;
  type: CreatureType;
  power: number;
  accuracy: number;
  pp: number;
  category: MoveCategory;
  priority: number;
  effects: MoveEffect[];
  statusEffect?: StatusCondition;
  statusChance?: number;
  description: string;
}
