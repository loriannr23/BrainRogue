import { CreatureType } from '../../types/creature';

export type TypeEffectivenessLabel = 'none' | 'notVery' | 'normal' | 'super';

export interface TypeEffectivenessResult {
  multiplier: 0 | 0.5 | 1 | 2 | 4;
  label: TypeEffectivenessLabel;
}

export type TypeChart = Partial<Record<CreatureType, Partial<Record<CreatureType, number>>>>;

export const typeChart: TypeChart = {
  meme: { chaos: 2, psychic: 2, ancient: 0.5, metal: 0.5 },
  sound: { air: 2, psychic: 2, metal: 0.5, earth: 0.5 },
  chaos: { light: 2, ancient: 2, meme: 0.5, shadow: 0.5 },
  water: { fire: 2, earth: 2, water: 0.5, food: 0.5 },
  fire: { food: 2, metal: 2, water: 0.5, ancient: 0.5 },
  earth: { electric: 2, metal: 2, air: 0, food: 0.5 },
  air: { earth: 2, toxic: 2, electric: 0.5, metal: 0.5 },
  electric: { water: 2, air: 2, earth: 0, ancient: 0.5 },
  toxic: { food: 2, light: 2, metal: 0, shadow: 0.5 },
  metal: { ancient: 2, light: 2, fire: 0.5, electric: 0.5 },
  psychic: { toxic: 2, chaos: 2, shadow: 0, meme: 0.5 },
  ancient: { meme: 2, sound: 2, light: 0.5, psychic: 0.5 },
  food: { earth: 2, water: 2, fire: 0.5, toxic: 0.5 },
  shadow: { psychic: 2, light: 0, chaos: 0.5 },
  light: { shadow: 2, chaos: 2, toxic: 0.5, metal: 0.5 },
};

export const getTypeEffectiveness = (
  moveType: CreatureType,
  defenderTypes: CreatureType[],
): TypeEffectivenessResult => {
  const rawMultiplier = defenderTypes.reduce(
    (multiplier, defenderType) => multiplier * (typeChart[moveType]?.[defenderType] ?? 1),
    1,
  );
  const multiplier = clampTypeMultiplier(rawMultiplier);

  return {
    multiplier,
    label: getEffectivenessLabel(multiplier),
  };
};

export const getEffectivenessLabel = (multiplier: number): TypeEffectivenessLabel => {
  if (multiplier === 0) return 'none';
  if (multiplier < 1) return 'notVery';
  if (multiplier > 1) return 'super';
  return 'normal';
};

const clampTypeMultiplier = (multiplier: number): TypeEffectivenessResult['multiplier'] => {
  if (multiplier <= 0) return 0;
  if (multiplier <= 0.5) return 0.5;
  if (multiplier < 2) return 1;
  if (multiplier < 4) return 2;
  return 4;
};
