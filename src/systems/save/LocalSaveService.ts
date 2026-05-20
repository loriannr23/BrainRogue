import { SaveData } from '../../types/save';
import { starterIds } from '../../data/starters';
import { SaveService } from './SaveService';

const saveKey = 'brainrogue.save.v1';

const defaultSave: SaveData = {
  version: 1,
  unlockedStarters: [
    'tungling',
    'patapim',
    'croclet',
    'trala_kid',
  ],
  bestWave: 0,
  runsPlayed: 0,
  discoveredCreatures: [],
  metaUpgrades: {
    vitality: 0,
    power: 0,
    armor: 0,
    speed: 0,
  },
  lifetimeCurrency: 0,
  settings: {
    masterVolume: 1,
    musicVolume: 0.7,
    sfxVolume: 0.7,
    textSpeed: 'normal',
  },
  currency: 0,
};

export class LocalSaveService implements SaveService {
  load(): SaveData {
    const raw = localStorage.getItem(saveKey);
    if (!raw) {
      return structuredClone(defaultSave);
    }

    try {
      return this.migrate(JSON.parse(raw));
    } catch {
      return structuredClone(defaultSave);
    }
  }

  save(data: SaveData): void {
    localStorage.setItem(saveKey, JSON.stringify(data));
  }

  clear(): void {
    localStorage.removeItem(saveKey);
  }

  private migrate(raw: Partial<SaveData>): SaveData {
    const defaults = structuredClone(defaultSave);
    const unlockedStarters = (raw.unlockedStarters ?? defaults.unlockedStarters).filter((starterId) => starterIds.includes(starterId));
    return {
      ...defaults,
      ...raw,
      unlockedStarters: unlockedStarters.length > 0 ? unlockedStarters : defaults.unlockedStarters,
      currentRun: raw.currentRun && starterIds.includes(raw.currentRun.starterId)
        ? {
            ...raw.currentRun,
            modifiers: {
              typeBoosts: raw.currentRun.modifiers?.typeBoosts ?? {},
            },
          }
        : undefined,
      discoveredCreatures: raw.discoveredCreatures ?? defaults.discoveredCreatures,
      metaUpgrades: {
        ...defaults.metaUpgrades,
        ...(raw.metaUpgrades ?? {}),
      },
      settings: {
        ...defaults.settings,
        ...(raw.settings ?? {}),
      },
      lifetimeCurrency: raw.lifetimeCurrency ?? raw.currency ?? defaults.lifetimeCurrency,
      currency: raw.currency ?? defaults.currency,
    };
  }
}
