import { MoveId } from './move';

export type CreatureType =
  | 'meme'
  | 'sound'
  | 'chaos'
  | 'water'
  | 'fire'
  | 'earth'
  | 'air'
  | 'electric'
  | 'toxic'
  | 'metal'
  | 'psychic'
  | 'ancient'
  | 'food'
  | 'shadow'
  | 'light';

export type GrowthRate = 'fast' | 'medium' | 'slow';
export type CreatureRole = 'glassCannon' | 'tank' | 'speedster' | 'support' | 'statusInflicter';
export type CreatureClassification = 'normal' | 'legendary' | 'mythical' | 'special';
export type CreatureTag = 'starter_eligible' | 'boss_only' | 'unique' | 'event' | 'uncapturable';
export type EvolutionStage = 1 | 2 | 3;

export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface LevelUpMove {
  level: number;
  moveId: MoveId;
}

export interface EvolutionRule {
  evolvesTo: string;
  level?: number;
  itemId?: string;
}

export interface CreatureDefinition {
  id: string;
  name: string;
  types: CreatureType[];
  baseHP: number;
  baseAttack: number;
  baseDefense: number;
  baseSpAttack: number;
  baseSpDefense: number;
  baseSpeed: number;
  baseStats: Stats;
  growthRate: GrowthRate;
  levelUpMoves: LevelUpMove[];
  evolutionLine: string[];
  evolutionStage: EvolutionStage;
  minEncounterLevel: number;
  evolutions: EvolutionRule[];
  spriteKey: string;
  classification: CreatureClassification;
  tags?: CreatureTag[];
  role: CreatureRole;
  description: string;
  catchable: boolean;
}

export interface CreatureInstance {
  instanceId: string;
  definitionId: string;
  name: string;
  level: number;
  xp: number;
  types: CreatureType[];
  stats: Stats;
  currentHp: number;
  moveIds: MoveId[];
  moves: CreatureMoveSlot[];
  status?: StatusCondition | null;
  statStages?: BattleStatStages;
  battleStatuses?: BattleStatus[];
  effectStacks?: Partial<Record<'echo' | 'overheat' | 'crit', number>>;
}

export interface CreatureMoveSlot {
  moveId: MoveId;
  currentPp: number;
  maxPp: number;
}

export type StatusCondition = 'burn' | 'poison' | 'paralyze';
export type BattleStatusId = 'rooted' | 'burn' | 'poison' | 'confuse';
export type BattleStatStageKey = 'attack' | 'defense' | 'spAttack' | 'spDefense' | 'speed' | 'accuracy';

export type BattleStatStages = Record<BattleStatStageKey, number>;

export interface BattleStatus {
  id: BattleStatusId;
  duration: number;
  sourceMoveId?: string;
}
