import type { MoveDefinition, MoveId } from '../../types/move';

export type MoveFxType = 'fire_beam' | 'projectile' | 'explosion' | 'slash' | 'pulse';

const explicitMoveFx: Partial<Record<MoveId, MoveFxType[]>> = {
  spicy_breath: ['fire_beam'],
  espresso_blast: ['fire_beam', 'explosion'],
  sauce_splash: ['fire_beam'],
  echo_slap: ['pulse'],
  quick_yell: ['pulse'],
  bass_drop: ['pulse'],
  comment_storm: ['pulse'],
  brain_scramble: ['pulse'],
  tornado_spin: ['pulse'],
  spark_scroll: ['projectile'],
  voltage_drop: ['projectile'],
  thunder_ping: ['projectile', 'explosion'],
  toxic_drip: ['projectile'],
  acid_pasta: ['projectile'],
  shadow_ping: ['projectile'],
  night_scroll: ['projectile'],
  light_flash: ['pulse'],
  holy_laser: ['pulse'],
  mind_spike: ['projectile'],
  satellite_ray: ['projectile', 'explosion'],
  stone_thump: ['slash', 'explosion'],
  mudslide: ['projectile'],
  plate_crack: ['slash', 'explosion'],
  gear_grind: ['slash'],
  metal_clang: ['slash'],
  bonk: ['slash'],
  viral_uppercut: ['slash'],
  chaos_bite: ['slash'],
  glitch_rush: ['slash'],
  aqua_skid: ['slash'],
  oven_tackle: ['slash'],
  gust_kick: ['slash'],
  sky_pierce: ['slash'],
  relic_slam: ['slash', 'explosion'],
  snack_chomp: ['slash'],
};

export const getMoveFxTypes = (move: MoveDefinition): MoveFxType[] => {
  const explicit = explicitMoveFx[move.id];
  if (explicit) return explicit;
  if (move.power <= 0) return [];
  return move.category === 'physical' ? ['slash'] : ['pulse'];
};
