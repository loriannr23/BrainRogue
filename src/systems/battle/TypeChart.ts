import { CreatureType } from '../../types/creature';

const strongAgainst: Record<CreatureType, CreatureType[]> = {
  meme: ['chaos', 'psychic'],
  sound: ['air', 'psychic'],
  chaos: ['light', 'ancient'],
  water: ['fire', 'earth'],
  fire: ['food', 'metal'],
  earth: ['electric', 'metal'],
  air: ['earth', 'toxic'],
  electric: ['water', 'air'],
  toxic: ['food', 'light'],
  metal: ['ancient', 'light'],
  psychic: ['toxic', 'chaos'],
  ancient: ['meme', 'sound'],
  food: ['earth', 'water'],
  shadow: ['psychic', 'light'],
  light: ['shadow', 'chaos'],
};

const resistedBy: Record<CreatureType, CreatureType[]> = {
  meme: ['ancient', 'metal'],
  sound: ['metal', 'earth'],
  chaos: ['meme', 'shadow'],
  water: ['water', 'food'],
  fire: ['water', 'ancient'],
  earth: ['air', 'food'],
  air: ['electric', 'metal'],
  electric: ['earth', 'ancient'],
  toxic: ['metal', 'shadow'],
  metal: ['fire', 'electric'],
  psychic: ['shadow', 'meme'],
  ancient: ['light', 'psychic'],
  food: ['fire', 'toxic'],
  shadow: ['light', 'chaos'],
  light: ['toxic', 'metal'],
};

const immuneBy: Partial<Record<CreatureType, CreatureType[]>> = {
  electric: ['earth'],
  toxic: ['metal'],
  shadow: ['light'],
  psychic: ['shadow'],
  earth: ['air'],
};

export const getTypeEffectiveness = (attackType: CreatureType, defenderTypes: CreatureType[]): number =>
  defenderTypes.reduce((multiplier, defenderType) => {
    if (immuneBy[attackType]?.includes(defenderType)) {
      return 0;
    }
    if (strongAgainst[attackType].includes(defenderType)) {
      return multiplier * 2;
    }
    if (resistedBy[attackType].includes(defenderType)) {
      return multiplier * 0.5;
    }
    return multiplier;
  }, 1);
