import { CreatureType } from '../types/creature';
import { MoveCategory, MoveDefinition } from '../types/move';

const damageMove = (
  id: string,
  name: string,
  type: CreatureType,
  power: number,
  accuracy: number,
  pp: number,
  category: Exclude<MoveCategory, 'status'>,
  description: string,
  priority = 0,
  effects: MoveDefinition['effects'] = [],
  statusEffect?: MoveDefinition['statusEffect'],
  statusChance?: number,
): MoveDefinition => ({ id, name, type, power, accuracy, pp, category, priority, effects, statusEffect, statusChance, description });

const statusMove = (
  id: string,
  name: string,
  type: CreatureType,
  accuracy: number,
  pp: number,
  description: string,
  effects: MoveDefinition['effects'],
  priority = 0,
  statusEffect?: MoveDefinition['statusEffect'],
  statusChance?: number,
): MoveDefinition => ({ id, name, type, power: 0, accuracy, pp, category: 'status', priority, effects, statusEffect, statusChance, description });

export const moves: MoveDefinition[] = [
  damageMove('bonk', 'Bonk', 'meme', 40, 100, 35, 'physical', 'Reliable meme contact damage.'),
  damageMove('viral_uppercut', 'Viral Uppercut', 'meme', 70, 90, 15, 'physical', 'High-risk meme burst for attackers.'),
  damageMove('comment_storm', 'Comment Storm', 'meme', 55, 100, 20, 'special', 'A fast stream of nonsense comments.'),
  statusMove('meme_focus', 'Meme Focus', 'meme', 100, 20, 'Raises Attack for sweepers.', [{ type: 'attack_up', chance: 100, value: 1, target: 'self' }]),

  damageMove('echo_slap', 'Echo Slap', 'sound', 45, 95, 30, 'special', 'A slap that repeats one too many times.', 0, [{ type: 'echo_scaling', chance: 100, value: 1, target: 'self' }]),
  damageMove('quick_yell', 'Quick Yell', 'sound', 35, 100, 30, 'special', 'Fast priority sound chip.', 1),
  damageMove('bass_drop', 'Bass Drop', 'sound', 75, 85, 10, 'special', 'Heavy sound burst that can slow.', 0, [{ type: 'speed_down', chance: 30, value: 1, target: 'opponent' }]),
  statusMove('hype_chant', 'Hype Chant', 'sound', 100, 20, 'Raises Speed through pure rhythm.', [{ type: 'speed_up', chance: 100, value: 1, target: 'self' }, { type: 'rhythm_scaling_buff', chance: 100, target: 'self' }]),

  damageMove('chaos_bite', 'Chaos Bite', 'chaos', 60, 90, 20, 'physical', 'Unstable bite with confuse odds.', 0, [{ type: 'confuse', chance: 10, target: 'opponent', duration: 2 }]),
  damageMove('glitch_rush', 'Glitch Rush', 'chaos', 80, 82, 10, 'physical', 'Strong but inaccurate chaos strike.'),
  damageMove('brain_scramble', 'Brain Scramble', 'chaos', 55, 95, 20, 'special', 'Chaotic special damage with debuff odds.', 0, [{ type: 'spDefense_down', chance: 25, value: 1, target: 'opponent' }]),
  statusMove('weird_fog', 'Weird Fog', 'chaos', 85, 15, 'Inflicts confusion with a risky strange cloud.', [{ type: 'confuse', chance: 100, target: 'opponent', duration: 3 }]),

  damageMove('aqua_skid', 'Aqua Skid', 'water', 50, 100, 25, 'physical', 'Reliable slippery water tackle.'),
  damageMove('freezer_noise', 'Freezer Noise', 'water', 40, 90, 15, 'special', 'Cold appliance static with root chance.', 0, [{ type: 'rooted', chance: 15, target: 'opponent', duration: 2 }]),
  damageMove('tidal_meme', 'Tidal Meme', 'water', 75, 90, 12, 'special', 'A heavy wave of wet nonsense.', 0, [{ type: 'minor_heal', chance: 100, target: 'self' }]),
  statusMove('brine_guard', 'Brine Guard', 'water', 100, 20, 'Raises Defense for bulky water creatures.', [{ type: 'defense_up', chance: 100, value: 1, target: 'self' }]),

  damageMove('spicy_breath', 'Spicy Breath', 'fire', 55, 95, 20, 'special', 'Hot breath with burn odds.', 0, [{ type: 'burn', chance: 20, target: 'opponent', duration: 3 }], 'burn', 0.2),
  damageMove('espresso_blast', 'Espresso Blast', 'fire', 80, 88, 10, 'special', 'Explosive fire burst for glass cannons.', 0, [{ type: 'overheat_stack', chance: 100, value: 1, target: 'self' }]),
  damageMove('oven_tackle', 'Oven Tackle', 'fire', 65, 95, 15, 'physical', 'A heated body check.'),
  statusMove('preheat', 'Preheat', 'fire', 100, 20, 'Raises Special Attack.', [{ type: 'spAttack_up', chance: 100, value: 1, target: 'self' }]),

  damageMove('stone_thump', 'Stone Thump', 'earth', 65, 90, 15, 'physical', 'Heavy ground-shaking thump.'),
  damageMove('mudslide', 'Mudslide', 'earth', 55, 95, 20, 'physical', 'Earth damage with speed control.', 0, [{ type: 'speed_down', chance: 25, value: 1, target: 'opponent' }, { type: 'root_synergy', chance: 35, target: 'opponent', duration: 2 }]),
  damageMove('plate_crack', 'Plate Crack', 'earth', 75, 88, 10, 'physical', 'Tank breaker with defense debuff odds.', 0, [{ type: 'defense_down', chance: 30, value: 1, target: 'opponent' }]),
  statusMove('fortify_shell', 'Fortify Shell', 'earth', 100, 20, 'Raises Defense and Special Defense.', [{ type: 'defense_up', chance: 100, value: 1, target: 'self' }, { type: 'spDefense_up', chance: 100, value: 1, target: 'self' }]),

  damageMove('gust_kick', 'Gust Kick', 'air', 45, 100, 25, 'physical', 'Fast chip for speedsters.'),
  damageMove('tornado_spin', 'Tornado Spin', 'air', 70, 90, 15, 'special', 'Reliable air burst.'),
  damageMove('sky_pierce', 'Sky Pierce', 'air', 85, 80, 8, 'physical', 'High-speed finisher.', 0, [{ type: 'crit_boost', chance: 30, target: 'self' }]),
  statusMove('tailwind_meme', 'Tailwind Meme', 'air', 100, 15, 'Sharply raises Speed.', [{ type: 'speed_up', chance: 100, value: 2, target: 'self' }]),

  damageMove('spark_scroll', 'Spark Scroll', 'electric', 55, 95, 20, 'special', 'Electric scribble with paralysis odds.', 0, [{ type: 'confuse', chance: 15, target: 'opponent', duration: 2 }], 'paralyze', 0.15),
  damageMove('voltage_drop', 'Voltage Drop', 'electric', 70, 90, 15, 'special', 'Good electric damage with speed odds.', 0, [{ type: 'speed_down', chance: 20, value: 1, target: 'opponent' }], 'paralyze', 0.1),
  damageMove('thunder_ping', 'Thunder Ping', 'electric', 90, 75, 8, 'special', 'High-risk electric nuke.', 0, [], 'paralyze', 0.3),
  statusMove('overclock', 'Overclock', 'electric', 100, 15, 'Raises Speed and Special Attack.', [{ type: 'speed_up', chance: 100, value: 1, target: 'self' }, { type: 'spAttack_up', chance: 100, value: 1, target: 'self' }]),

  damageMove('toxic_drip', 'Toxic Drip', 'toxic', 45, 100, 25, 'special', 'Poison pressure with poison odds.', 0, [{ type: 'poison', chance: 25, target: 'opponent', duration: 4 }], 'poison', 0.25),
  damageMove('acid_pasta', 'Acid Pasta', 'toxic', 65, 90, 15, 'special', 'Toxic burst that can shred defense.', 0, [{ type: 'spDefense_down', chance: 30, value: 1, target: 'opponent' }]),
  statusMove('venom_prank', 'Venom Prank', 'toxic', 90, 15, 'Inflicts poison reliably enough to matter.', [{ type: 'poison', chance: 100, target: 'opponent', duration: 4 }], 0, 'poison', 1),
  statusMove('noxious_guard', 'Noxious Guard', 'toxic', 100, 20, 'Raises Special Defense.', [{ type: 'spDefense_up', chance: 100, value: 1, target: 'self' }]),

  damageMove('metal_clang', 'Metal Clang', 'metal', 55, 95, 20, 'physical', 'Metal hit with defense utility.', 0, [{ type: 'defense_up', chance: 20, value: 1, target: 'self' }]),
  damageMove('gear_grind', 'Gear Grind', 'metal', 75, 88, 12, 'physical', 'Strong physical metal pressure.', 0, [{ type: 'minor_recoil', chance: 100, target: 'self' }]),
  damageMove('satellite_ray', 'Satellite Ray', 'metal', 80, 85, 10, 'special', 'Orbital metal damage.'),
  statusMove('iron_pose', 'Iron Pose', 'metal', 100, 15, 'Raises Defense sharply.', [{ type: 'defense_up', chance: 100, value: 2, target: 'self' }]),

  damageMove('shadow_ping', 'Shadow Ping', 'shadow', 50, 100, 25, 'special', 'Reliable shadow notification.'),
  damageMove('night_scroll', 'Night Scroll', 'shadow', 70, 90, 15, 'special', 'Shadow damage with special defense odds.', 0, [{ type: 'spDefense_down', chance: 20, value: 1, target: 'opponent' }]),
  statusMove('dark_delay', 'Dark Delay', 'shadow', 90, 15, 'Lowers opponent Speed.', [{ type: 'speed_down', chance: 100, value: 1, target: 'opponent' }]),

  damageMove('light_flash', 'Light Flash', 'light', 50, 100, 25, 'special', 'Reliable anti-chaos light.'),
  damageMove('holy_laser', 'Holy Laser', 'light', 80, 88, 10, 'special', 'Strong focused light damage.'),
  statusMove('radiant_focus', 'Radiant Focus', 'light', 100, 15, 'Raises Special Attack and Special Defense.', [{ type: 'spAttack_up', chance: 100, value: 1, target: 'self' }, { type: 'spDefense_up', chance: 100, value: 1, target: 'self' }]),

  damageMove('ancient_stare', 'Ancient Stare', 'ancient', 0, 90, 15, 'special', 'Historical discomfort that lowers defense.', 0, [{ type: 'defense_down', chance: 100, value: 1, target: 'opponent' }]),
  damageMove('relic_slam', 'Relic Slam', 'ancient', 75, 90, 12, 'physical', 'Old-world heavy contact damage.'),
  statusMove('royal_guard', 'Royal Guard', 'ancient', 100, 15, 'Raises both defenses.', [{ type: 'defense_up', chance: 100, value: 1, target: 'self' }, { type: 'spDefense_up', chance: 100, value: 1, target: 'self' }]),

  damageMove('snack_chomp', 'Snack Chomp', 'food', 55, 100, 25, 'physical', 'Reliable food bite.'),
  damageMove('sauce_splash', 'Sauce Splash', 'food', 65, 90, 15, 'special', 'Messy special damage with burn odds.', 0, [{ type: 'burn', chance: 10, target: 'opponent', duration: 3 }], 'burn', 0.1),
  statusMove('carb_load', 'Carb Load', 'food', 100, 15, 'Raises HP-adjacent bulk through defense.', [{ type: 'defense_up', chance: 100, value: 1, target: 'self' }, { type: 'attack_up', chance: 100, value: 1, target: 'self' }]),

  damageMove('mind_spike', 'Mind Spike', 'psychic', 60, 95, 20, 'special', 'Clean psychic damage.'),
  statusMove('nap_wave', 'Nap Wave', 'psychic', 75, 10, 'A sleepy psychic pulse.', [{ type: 'confuse', chance: 100, target: 'opponent', duration: 2 }]),
  statusMove('brain_boost', 'Brain Boost', 'psychic', 100, 15, 'Raises Special Attack sharply.', [{ type: 'spAttack_up', chance: 100, value: 2, target: 'self' }]),
];

export const moveMap = new Map(moves.map((move) => [move.id, move]));

export const getMove = (id: string): MoveDefinition => {
  const move = moveMap.get(id);
  if (!move) {
    throw new Error(`Unknown move: ${id}`);
  }
  return move;
};
