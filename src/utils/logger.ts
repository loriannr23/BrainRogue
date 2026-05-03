export const logger = {
  info: (...args: unknown[]) => console.info('[BrainRogue]', ...args),
  warn: (...args: unknown[]) => console.warn('[BrainRogue]', ...args),
  error: (...args: unknown[]) => console.error('[BrainRogue]', ...args),
};
