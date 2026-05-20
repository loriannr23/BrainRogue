import { CreatureType, Stats } from './creature';

export type ItemCategory = 'healing' | 'statBoost' | 'moveLearning' | 'typeBoost' | 'currency' | 'rareUpgrade';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'ultra' | 'master';

export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  description: string;
  healAmount?: number;
  healPercent?: number;
  statBoost?: Partial<Stats>;
  typeBoost?: {
    type: CreatureType;
    multiplier: number;
  };
  currency?: number;
}
