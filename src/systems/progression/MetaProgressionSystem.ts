import { starterIds } from '../../data/starters';
import { CreatureInstance } from '../../types/creature';
import { SaveData } from '../../types/save';

export type MetaUpgradeId = keyof SaveData['metaUpgrades'];

export interface MetaUpgradeDefinition {
  id: MetaUpgradeId;
  name: string;
  description: string;
  maxRank: number;
  baseCost: number;
}

export interface RunSummary {
  wave: number;
  starterId: string;
  runCurrency: number;
}

export const metaUpgradeDefinitions: MetaUpgradeDefinition[] = [
  {
    id: 'vitality',
    name: 'Vitality Lab',
    description: '+6 max HP per rank.',
    maxRank: 5,
    baseCost: 80,
  },
  {
    id: 'power',
    name: 'Meme Gym',
    description: '+3 Attack and Sp. Atk per rank.',
    maxRank: 5,
    baseCost: 90,
  },
  {
    id: 'armor',
    name: 'Trash Armor',
    description: '+3 Defense and Sp. Def per rank.',
    maxRank: 5,
    baseCost: 90,
  },
  {
    id: 'speed',
    name: 'Tempo Shoes',
    description: '+2 Speed per rank.',
    maxRank: 5,
    baseCost: 75,
  },
];

const starterUnlockRules: Array<{ starterId: string; bestWave: number; cost: number }> = [];

export class MetaProgressionSystem {
  applyRunEnd(save: SaveData, summary: RunSummary): string[] {
    const waveBonus = Math.max(0, summary.wave) * 12;
    const payout = Math.max(15, Math.floor(summary.runCurrency * 0.45) + waveBonus);
    save.currency += payout;
    save.lifetimeCurrency += payout;
    save.bestWave = Math.max(save.bestWave, summary.wave);
    save.bestRun = this.pickBestRun(save, summary, payout);

    if (!save.discoveredCreatures.includes(summary.starterId)) {
      save.discoveredCreatures.push(summary.starterId);
    }

    const unlockMessages = this.unlockEarnedStarters(save);
    return [`Banked ${payout} permanent coins.`, ...unlockMessages];
  }

  applyBonuses(creature: CreatureInstance, save: SaveData): void {
    const upgrades = save.metaUpgrades;
    creature.stats.hp += upgrades.vitality * 6;
    creature.currentHp += upgrades.vitality * 6;
    creature.stats.attack += upgrades.power * 3;
    creature.stats.specialAttack += upgrades.power * 3;
    creature.stats.defense += upgrades.armor * 3;
    creature.stats.specialDefense += upgrades.armor * 3;
    creature.stats.speed += upgrades.speed * 2;
  }

  getUpgradeCost(save: SaveData, upgradeId: MetaUpgradeId): number {
    const definition = metaUpgradeDefinitions.find((upgrade) => upgrade.id === upgradeId);
    if (!definition) return Number.POSITIVE_INFINITY;
    return definition.baseCost + save.metaUpgrades[upgradeId] * 65;
  }

  buyUpgrade(save: SaveData, upgradeId: MetaUpgradeId): boolean {
    const definition = metaUpgradeDefinitions.find((upgrade) => upgrade.id === upgradeId);
    if (!definition) return false;
    const rank = save.metaUpgrades[upgradeId];
    const cost = this.getUpgradeCost(save, upgradeId);
    if (rank >= definition.maxRank || save.currency < cost) return false;
    save.currency -= cost;
    save.metaUpgrades[upgradeId] += 1;
    return true;
  }

  buyStarter(save: SaveData, starterId: string): boolean {
    if (save.unlockedStarters.includes(starterId)) return false;
    const rule = starterUnlockRules.find((entry) => entry.starterId === starterId);
    if (!rule || save.bestWave < rule.bestWave || save.currency < rule.cost) return false;
    save.currency -= rule.cost;
    save.unlockedStarters.push(starterId);
    return true;
  }

  getStarterUnlockInfo(save: SaveData, starterId: string): { unlocked: boolean; cost?: number; bestWave?: number; canBuy: boolean } {
    const unlocked = save.unlockedStarters.includes(starterId);
    const rule = starterUnlockRules.find((entry) => entry.starterId === starterId);
    return {
      unlocked,
      cost: rule?.cost,
      bestWave: rule?.bestWave,
      canBuy: Boolean(rule && !unlocked && save.bestWave >= rule.bestWave && save.currency >= rule.cost),
    };
  }

  private unlockEarnedStarters(save: SaveData): string[] {
    const messages: string[] = [];
    for (const rule of starterUnlockRules) {
      if (save.bestWave >= rule.bestWave && !save.discoveredCreatures.includes(rule.starterId)) {
        save.discoveredCreatures.push(rule.starterId);
        messages.push(`Discovered ${rule.starterId.replaceAll('_', ' ')}.`);
      }
    }
    save.unlockedStarters = save.unlockedStarters.filter((starterId) => starterIds.includes(starterId));
    return messages;
  }

  private pickBestRun(save: SaveData, summary: RunSummary, payout: number): SaveData['bestRun'] {
    if (save.bestRun && save.bestRun.wave > summary.wave) {
      return save.bestRun;
    }
    return {
      wave: summary.wave,
      starterId: summary.starterId,
      currencyEarned: payout,
      completedAt: new Date().toISOString(),
    };
  }
}
