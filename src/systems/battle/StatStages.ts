import { BattleStatStageKey, BattleStatStages, CreatureInstance } from '../../types/creature';

export const createEmptyStatStages = (): BattleStatStages => ({
  attack: 0,
  defense: 0,
  spAttack: 0,
  spDefense: 0,
  speed: 0,
  accuracy: 0,
});

export const clampStatStage = (stage: number): number => Math.max(-6, Math.min(6, stage));

export const getStatStageMultiplier = (stage: number): number => {
  const clamped = clampStatStage(stage);
  if (clamped >= 0) {
    return (2 + clamped) / 2;
  }
  return 2 / (2 + Math.abs(clamped));
};

export const applyStatStageModifier = (
  creature: CreatureInstance,
  stat: BattleStatStageKey,
  stages: number,
): number => {
  creature.statStages ??= createEmptyStatStages();
  const nextStage = clampStatStage(creature.statStages[stat] + stages);
  creature.statStages[stat] = nextStage;
  return nextStage;
};

export const getEffectiveBattleStat = (
  creature: CreatureInstance,
  stat: Exclude<BattleStatStageKey, 'accuracy'>,
): number => {
  creature.statStages ??= createEmptyStatStages();
  const baseStat = stat === 'spAttack'
    ? creature.stats.specialAttack
    : stat === 'spDefense'
      ? creature.stats.specialDefense
      : creature.stats[stat];
  const rootedPenalty = stat === 'speed' && creature.battleStatuses?.some((status) => status.id === 'rooted') ? 0.65 : 1;
  return Math.max(1, Math.floor(baseStat * getStatStageMultiplier(creature.statStages[stat]) * rootedPenalty));
};

export const getAccuracyMultiplier = (creature: CreatureInstance): number => {
  creature.statStages ??= createEmptyStatStages();
  return getStatStageMultiplier(creature.statStages.accuracy);
};

export const getPositiveStageTotal = (creature: CreatureInstance): number => {
  creature.statStages ??= createEmptyStatStages();
  return Object.values(creature.statStages).reduce((total, stage) => total + Math.max(0, stage), 0);
};
