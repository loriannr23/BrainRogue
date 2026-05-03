import { Stats } from './creature';

export type ItemCategory = 'healing' | 'battle' | 'statBoost' | 'evolution' | 'held' | 'currency';

export interface ItemDefinition {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  description: string;
  healAmount?: number;
  statBoost?: Partial<Stats>;
}
