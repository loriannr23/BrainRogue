import { ItemDefinition } from '../types/item';

export const items: ItemDefinition[] = [
  {
    id: 'small_soda',
    name: 'Small Soda',
    category: 'healing',
    rarity: 'common',
    description: 'Restores 20 HP.',
    healAmount: 20,
  },
  {
    id: 'mega_soda',
    name: 'Mega Soda',
    category: 'healing',
    rarity: 'uncommon',
    description: 'Restores 50 HP.',
    healAmount: 50,
  },
  {
    id: 'protein_pasta',
    name: 'Protein Pasta',
    category: 'statBoost',
    rarity: 'rare',
    description: 'Permanently increases Attack.',
    statBoost: { attack: 4 },
  },
  {
    id: 'helmet_of_focus',
    name: 'Helmet of Focus',
    category: 'held',
    rarity: 'rare',
    description: 'Prepared held item slot for a later update.',
  },
  {
    id: 'ancient_remote',
    name: 'Ancient Remote',
    category: 'evolution',
    rarity: 'epic',
    description: 'Prepared evolution item for future item-based evolutions.',
  },
];
