export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const chance = (percent: number): boolean => Math.random() * 100 < percent;

export const pickOne = <T>(items: T[]): T => items[randomInt(0, items.length - 1)];

export const makeId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
