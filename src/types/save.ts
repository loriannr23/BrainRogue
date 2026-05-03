import { CreatureInstance } from './creature';

export interface RunState {
  starterId: string;
  party: CreatureInstance[];
  wave: number;
  currency: number;
  seed: string;
}

export interface SaveData {
  version: number;
  unlockedStarters: string[];
  bestWave: number;
  bestRun?: {
    wave: number;
    starterId: string;
    currencyEarned: number;
    completedAt: string;
  };
  runsPlayed: number;
  currentRun?: RunState;
  discoveredCreatures: string[];
  metaUpgrades: {
    vitality: number;
    power: number;
    armor: number;
    speed: number;
  };
  lifetimeCurrency: number;
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    textSpeed: 'slow' | 'normal' | 'fast';
  };
  currency: number;
}
