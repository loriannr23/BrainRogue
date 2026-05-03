import { items } from '../../data/items';
import { moves } from '../../data/moves';
import { CreatureInstance, Stats } from '../../types/creature';
import { ItemDefinition } from '../../types/item';
import { MoveId } from '../../types/move';
import { pickOne, randomInt } from '../../utils/random';

export type RewardKind = 'heal' | 'fullHeal' | 'statBoost' | 'newMove' | 'currency' | 'rareItem' | 'evolutionItem';
export type RewardRarity = 'common' | 'uncommon' | 'rare' | 'epic';

export interface RewardOption {
  id: string;
  kind: RewardKind;
  label: string;
  description: string;
  rarity: RewardRarity;
  item?: ItemDefinition;
  currency?: number;
  healAmount?: number;
  fullHeal?: boolean;
  statBoost?: Partial<Stats>;
  moveId?: MoveId;
  source?: string;
}

export class RewardSystem {
  createRewards(wave: number, creature: CreatureInstance): RewardOption[] {
    const candidates = this.createCandidatePool(wave, creature);
    const rewards: RewardOption[] = [];
    const guaranteed = this.pickByRarity(candidates, wave >= 10 ? ['rare', 'epic'] : ['uncommon', 'rare', 'epic']);
    if (guaranteed) {
      rewards.push(guaranteed);
      candidates.splice(candidates.indexOf(guaranteed), 1);
    }

    while (rewards.length < 3 && candidates.length > 0) {
      const reward = this.pickWeightedReward(candidates, wave);
      rewards.push(reward);
      candidates.splice(candidates.indexOf(reward), 1);
    }

    return rewards;
  }

  private createCandidatePool(wave: number, creature: CreatureInstance): RewardOption[] {
    const currentMoveIds = new Set(creature.moves.map((slot) => slot.moveId));
    const learnableMoves = moves.filter((move) => !currentMoveIds.has(move.id));
    const healingItems = items.filter((item) => item.category === 'healing');
    const rareItems = items.filter((item) => item.category === 'held' || item.category === 'battle');
    const evolutionItems = items.filter((item) => item.category === 'evolution');
    const statRewards = this.createStatRewards(wave);
    const pool: RewardOption[] = [
      {
        id: `coins-${wave}`,
        kind: 'currency',
        label: `${35 + wave * 6} Coins`,
        description: 'Adds currency to the current run for future shops and meta upgrades.',
        rarity: 'common',
        currency: 35 + wave * 6,
        source: 'Run economy',
      },
      {
        id: `heal-${wave}`,
        kind: 'heal',
        label: 'Patch-Up Soda',
        description: 'Restores a chunk of HP before the next wave.',
        rarity: 'common',
        item: pickOne(healingItems),
        healAmount: 35 + Math.floor(wave * 1.5),
        source: 'Recovery pool',
      },
      {
        id: `full-heal-${wave}`,
        kind: 'fullHeal',
        label: 'Full Meme Reset',
        description: 'Fully restores HP and clears status. Rare, but run-saving.',
        rarity: wave % 5 === 0 ? 'rare' : 'epic',
        fullHeal: true,
        source: wave % 10 === 0 ? 'Boss recovery pool' : 'Rare recovery pool',
      },
      ...statRewards,
    ];

    if (learnableMoves.length > 0) {
      const move = pickOne(learnableMoves);
      pool.push({
        id: `move-${move.id}-${wave}`,
        kind: 'newMove',
        label: `Learn ${move.name}`,
        description: `${move.type.toUpperCase()} ${move.category} move. Power ${move.power}, Accuracy ${move.accuracy}. Replaces the oldest move if all slots are full.`,
        rarity: move.power >= 60 ? 'rare' : 'uncommon',
        moveId: move.id,
        source: 'Move tutor pool',
      });
    }

    if (rareItems.length > 0) {
      const item = pickOne(rareItems);
      pool.push({
        id: `rare-${item.id}-${wave}`,
        kind: 'rareItem',
        label: item.name,
        description: `${item.description} Placeholder reward: grants bonus currency for now.`,
        rarity: item.rarity === 'epic' ? 'epic' : 'rare',
        item,
        currency: 60 + wave * 4,
        source: wave >= 15 ? 'Late item pool' : 'Rare item pool',
      });
    }

    if (evolutionItems.length > 0) {
      const item = pickOne(evolutionItems);
      pool.push({
        id: `evo-${item.id}-${wave}`,
        kind: 'evolutionItem',
        label: item.name,
        description: `${item.description} Evolution item inventory lands in a later sprint; grants a rare-item payout now.`,
        rarity: 'epic',
        item,
        currency: 90 + wave * 5,
        source: 'Evolution item pool',
      });
    }

    return pool;
  }

  private createStatRewards(wave: number): RewardOption[] {
    const amount = wave >= 20 ? 5 : wave >= 10 ? 4 : 3;
    return [
      {
        id: `boost-attack-${wave}`,
        kind: 'statBoost',
        label: 'Protein Pasta',
        description: `Permanently increases Attack by ${amount}.`,
        rarity: 'uncommon',
        statBoost: { attack: amount },
        source: 'Training pool',
      },
      {
        id: `boost-speed-${wave}`,
        kind: 'statBoost',
        label: 'Turbo Espresso',
        description: `Permanently increases Speed by ${amount}.`,
        rarity: 'uncommon',
        statBoost: { speed: amount },
        source: 'Training pool',
      },
      {
        id: `boost-bulk-${wave}`,
        kind: 'statBoost',
        label: 'Crunchy Armor',
        description: `Permanently increases Defense and Special Defense by ${Math.max(2, amount - 1)}.`,
        rarity: 'rare',
        statBoost: { defense: Math.max(2, amount - 1), specialDefense: Math.max(2, amount - 1) },
        source: wave >= 10 ? 'Veteran training pool' : 'Training pool',
      },
    ];
  }

  private pickByRarity(candidates: RewardOption[], rarities: RewardRarity[]): RewardOption | undefined {
    const pool = candidates.filter((reward) => rarities.includes(reward.rarity));
    return pool.length > 0 ? pickOne(pool) : undefined;
  }

  private pickWeightedReward(candidates: RewardOption[], wave: number): RewardOption {
    const weights: Record<RewardRarity, number> = {
      common: wave >= 15 ? 2 : 5,
      uncommon: wave >= 15 ? 5 : 4,
      rare: wave >= 10 ? 4 : 2,
      epic: wave % 10 === 0 ? 3 : wave >= 20 ? 2 : 1,
    };
    const expanded = candidates.flatMap((reward) => Array.from({ length: weights[reward.rarity] }, () => reward));
    return pickOne(expanded.length > 0 ? expanded : candidates);
  }
}
