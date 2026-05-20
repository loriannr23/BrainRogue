import { items } from '../../data/items';
import { moves } from '../../data/moves';
import { CreatureInstance, CreatureType, Stats } from '../../types/creature';
import { ItemDefinition, ItemRarity } from '../../types/item';
import { MoveId } from '../../types/move';
import { pickOne } from '../../utils/random';

export type RewardKind = 'healing' | 'statBoost' | 'moveLearning' | 'typeBoost' | 'currency' | 'rareUpgrade';
export type RewardRarity = ItemRarity;

type RewardCategory = RewardKind;

export interface RewardOption {
  id: string;
  kind: RewardKind;
  label: string;
  description: string;
  rarity: RewardRarity;
  item?: ItemDefinition;
  currency?: number;
  healPercent?: number;
  fullHeal?: boolean;
  statBoost?: Partial<Stats>;
  moveId?: MoveId;
  typeBoost?: {
    type: CreatureType;
    multiplier: number;
  };
  source?: string;
}

export class RewardSystem {
  createRewards(wave: number, creature: CreatureInstance, isBossWave = wave % 10 === 0): RewardOption[] {
    const rewards: RewardOption[] = [];
    if (isBossWave) {
      const bossReward = this.pickBossReward(wave, creature);
      if (bossReward) rewards.push(bossReward);
    }

    let attempts = 0;
    while (rewards.length < 3 && attempts < 24) {
      attempts += 1;
      const category = this.pickCategory(wave, isBossWave);
      const reward = this.createRewardForCategory(category, wave, creature, isBossWave);
      if (!reward || rewards.some((existing) => existing.id === reward.id || existing.kind === reward.kind && reward.kind !== 'healing')) {
        continue;
      }
      rewards.push(reward);
    }

    for (const fallback of this.createFallbackRewards(wave, creature)) {
      if (rewards.length >= 3) break;
      if (!rewards.some((reward) => reward.id === fallback.id)) {
        rewards.push(fallback);
      }
    }

    return rewards.slice(0, 3);
  }

  private pickBossReward(wave: number, creature: CreatureInstance): RewardOption | undefined {
    const candidates = [
      this.createRewardForCategory('rareUpgrade', wave, creature, true),
      this.createRewardForCategory('typeBoost', wave, creature, true),
      this.createRewardForCategory('moveLearning', wave, creature, true),
      this.createRewardForCategory('statBoost', wave, creature, true),
    ].filter((reward): reward is RewardOption => !!reward);
    return candidates.length > 0 ? pickOne(candidates) : undefined;
  }

  private createRewardForCategory(category: RewardCategory, wave: number, creature: CreatureInstance, isBossWave: boolean): RewardOption | undefined {
    if (category === 'healing') return this.createHealingReward(wave, isBossWave);
    if (category === 'statBoost') return this.createStatReward(wave, creature, isBossWave);
    if (category === 'moveLearning') return this.createMoveReward(wave, creature, isBossWave);
    if (category === 'typeBoost') return this.createTypeBoostReward(wave, creature, isBossWave);
    if (category === 'currency') return this.createCurrencyReward(wave, isBossWave);
    return this.createRareUpgradeReward(wave, creature, isBossWave);
  }

  private createHealingReward(wave: number, isBossWave: boolean): RewardOption {
    const item = this.getItem(isBossWave || wave >= 8 ? 'full_snack' : 'small_heal');
    const healPercent = item.healPercent ?? 0.25;
    return {
      id: `${item.id}-${wave}`,
      kind: 'healing',
      label: item.name,
      description: item.description,
      rarity: item.rarity,
      item,
      healPercent,
      fullHeal: healPercent >= 1,
      source: 'Recovery',
    };
  }

  private createStatReward(wave: number, creature: CreatureInstance, isBossWave: boolean): RewardOption {
    const statItems = ['protein_meme', 'focus_drip', 'speed_shoes'].map((id) => this.getItem(id));
    const item = pickOne(statItems);
    const stageBoost = isBossWave || wave >= 16 ? 2 : 1;
    const statBoost: Partial<Stats> = {};
    for (const stat of Object.keys(item.statBoost ?? {}) as Array<keyof Stats>) {
      statBoost[stat] = this.statStageValue(creature, stat, stageBoost);
    }
    return {
      id: `${item.id}-${stageBoost}-${wave}`,
      kind: 'statBoost',
      label: stageBoost > 1 ? `${item.name}+` : item.name,
      description: this.statDescription(item, stageBoost),
      rarity: stageBoost > 1 ? 'rare' : item.rarity,
      item,
      statBoost,
      source: 'Training',
    };
  }

  private createMoveReward(wave: number, creature: CreatureInstance, isBossWave: boolean): RewardOption | undefined {
    const currentMoveIds = new Set(creature.moves.map((slot) => slot.moveId));
    const compatibleMoves = moves
      .filter((move) => !currentMoveIds.has(move.id))
      .filter((move) => creature.types.includes(move.type) || move.category === 'status');
    const fallbackMoves = moves.filter((move) => !currentMoveIds.has(move.id));
    const movePool = compatibleMoves.length > 0 ? compatibleMoves : fallbackMoves;
    if (movePool.length === 0) return undefined;

    const strongMoves = movePool.filter((move) => move.power >= (isBossWave || wave >= 12 ? 65 : 45));
    const move = pickOne(strongMoves.length > 0 ? strongMoves : movePool);
    return {
      id: `learn-${move.id}-${wave}`,
      kind: 'moveLearning',
      label: `Learn ${move.name}`,
      description: `${move.type.toUpperCase()} ${move.category}. Power ${move.power}, Accuracy ${move.accuracy}.`,
      rarity: move.power >= 80 ? 'ultra' : move.power >= 60 ? 'rare' : 'uncommon',
      moveId: move.id,
      source: 'Move tutor',
    };
  }

  private createTypeBoostReward(wave: number, creature: CreatureInstance, isBossWave: boolean): RewardOption {
    const preferred = creature.types.includes('sound')
      ? this.getItem('sound_amp')
      : creature.types.includes('chaos')
        ? this.getItem('chaos_charm')
        : pickOne([this.getItem('sound_amp'), this.getItem('chaos_charm')]);
    const multiplier = isBossWave || wave >= 15 ? 1.2 : preferred.typeBoost?.multiplier ?? 1.15;
    return {
      id: `${preferred.id}-${Math.round(multiplier * 100)}-${wave}`,
      kind: 'typeBoost',
      label: multiplier > 1.15 ? `${preferred.name}+` : preferred.name,
      description: `${this.formatType(preferred.typeBoost!.type)} moves deal +${Math.round((multiplier - 1) * 100)}% damage.`,
      rarity: multiplier > 1.15 ? 'ultra' : preferred.rarity,
      item: preferred,
      typeBoost: {
        type: preferred.typeBoost!.type,
        multiplier,
      },
      source: 'Type boost',
    };
  }

  private createCurrencyReward(wave: number, isBossWave: boolean): RewardOption {
    const item = this.getItem('coin_cache');
    const currency = (item.currency ?? 60) + wave * (isBossWave ? 10 : 5);
    return {
      id: `coins-${currency}-${wave}`,
      kind: 'currency',
      label: `${currency} Coins`,
      description: `Gain ${currency} run coins.`,
      rarity: wave >= 15 ? 'uncommon' : item.rarity,
      item,
      currency,
      source: 'Run economy',
    };
  }

  private createRareUpgradeReward(wave: number, creature: CreatureInstance, isBossWave: boolean): RewardOption {
    const item = this.getItem('master_snack');
    const stageBoost = isBossWave || wave >= 20 ? 1 : 0;
    const statBoost: Partial<Stats> = {};
    if (stageBoost > 0) {
      for (const stat of Object.keys(item.statBoost ?? {}) as Array<keyof Stats>) {
        statBoost[stat] = this.statStageValue(creature, stat, stageBoost);
      }
    }
    return {
      id: `${item.id}-${wave}`,
      kind: 'rareUpgrade',
      label: item.name,
      description: item.description,
      rarity: isBossWave ? 'master' : 'ultra',
      item,
      healPercent: item.healPercent,
      fullHeal: true,
      statBoost,
      source: 'Rare upgrade',
    };
  }

  private createFallbackRewards(wave: number, creature: CreatureInstance): RewardOption[] {
    return [
      this.createHealingReward(wave, false),
      this.createCurrencyReward(wave, false),
      this.createStatReward(wave, creature, false),
    ];
  }

  private pickCategory(wave: number, isBossWave: boolean): RewardCategory {
    const weights: Array<{ category: RewardCategory; weight: number }> = wave < 6
      ? [
          { category: 'healing', weight: 42 },
          { category: 'statBoost', weight: 24 },
          { category: 'currency', weight: 18 },
          { category: 'moveLearning', weight: 10 },
          { category: 'typeBoost', weight: 4 },
          { category: 'rareUpgrade', weight: isBossWave ? 8 : 2 },
        ]
      : wave < 15
        ? [
            { category: 'healing', weight: 24 },
            { category: 'statBoost', weight: 25 },
            { category: 'currency', weight: 12 },
            { category: 'moveLearning', weight: 18 },
            { category: 'typeBoost', weight: 15 },
            { category: 'rareUpgrade', weight: isBossWave ? 12 : 6 },
          ]
        : [
            { category: 'healing', weight: 15 },
            { category: 'statBoost', weight: 20 },
            { category: 'currency', weight: 10 },
            { category: 'moveLearning', weight: 20 },
            { category: 'typeBoost', weight: 20 },
            { category: 'rareUpgrade', weight: isBossWave ? 18 : 10 },
          ];
    const total = weights.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * total;
    for (const entry of weights) {
      roll -= entry.weight;
      if (roll <= 0) return entry.category;
    }
    return 'healing';
  }

  private statStageValue(creature: CreatureInstance, stat: keyof Stats, stages: number): number {
    return Math.max(1, Math.ceil((creature.stats[stat] ?? 1) * 0.1 * stages));
  }

  private statDescription(item: ItemDefinition, stages: number): string {
    const stat = Object.keys(item.statBoost ?? {})[0] ?? 'stat';
    const label = stat === 'specialAttack' ? 'Sp. Attack' : stat.charAt(0).toUpperCase() + stat.slice(1);
    return `Increase ${label} by ${stages} stage${stages === 1 ? '' : 's'} permanently this run.`;
  }

  private getItem(id: string): ItemDefinition {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) throw new Error(`Unknown item: ${id}`);
    return item;
  }

  private formatType(type: CreatureType): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
