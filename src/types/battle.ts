import { CreatureInstance, StatusCondition } from './creature';
import { MoveDefinition, MoveId } from './move';

export interface BattleState {
  player: CreatureInstance;
  enemy: CreatureInstance;
  wave: number;
  isBoss: boolean;
  turn: number;
  log: string[];
  phase: 'waiting' | 'resolving' | 'won' | 'lost';
  lastEvent?: BattleEvent;
  turnEvents: BattleEvent[];
  feedbackEvents: BattleFeedbackEvent[];
  winner?: 'player' | 'enemy';
}

export interface BattleAction {
  actor: 'player' | 'enemy';
  moveId: MoveId;
}

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  effectiveness: number;
  missed: boolean;
  move: MoveDefinition;
}

export interface BattleEvent {
  kind?: 'move' | 'statusDamage' | 'statusSkip';
  actor: 'player' | 'enemy';
  target: 'player' | 'enemy';
  moveId?: MoveId;
  damage: number;
  missed: boolean;
  effectiveness: number;
  isCrit: boolean;
  playerHpAfter: number;
  enemyHpAfter: number;
  status?: StatusCondition;
  message?: string;
  feedback: BattleFeedbackEvent[];
}

export type BattleFeedbackEventType =
  | 'onDamage'
  | 'onStatusDamage'
  | 'onStatusApply'
  | 'onStatusSkip'
  | 'onCritical'
  | 'onSuperEffective'
  | 'onNotVeryEffective'
  | 'onMiss'
  | 'onLevelUp'
  | 'onFaint';

export interface BattleFeedbackEvent {
  type: BattleFeedbackEventType;
  actor?: 'player' | 'enemy';
  target?: 'player' | 'enemy';
  amount?: number;
  moveId?: MoveId;
  message: string;
}
