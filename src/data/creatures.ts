import { CreatureClassification, CreatureDefinition, CreatureRole, CreatureTag, CreatureType, EvolutionStage, GrowthRate, Stats } from '../types/creature';
import { MoveId } from '../types/move';

interface CreatureSeed {
  id: string;
  name: string;
  types: CreatureType[];
  classification?: CreatureClassification;
  tags?: CreatureTag[];
  catchable?: boolean;
  description: string;
  spriteKey?: string;
  growthRate?: GrowthRate;
  role?: CreatureRole;
  baseStats?: Partial<Stats>;
  moveIds?: MoveId[];
  evolutionLine?: string[];
  evolutionStage?: EvolutionStage;
  minEncounterLevel?: number;
  evolvesTo?: string;
  evolutionLevel?: number;
}

const defaultStats: Stats = {
  hp: 46,
  attack: 48,
  defense: 44,
  specialAttack: 46,
  specialDefense: 42,
  speed: 45,
};

const roleCycle: CreatureRole[] = ['glassCannon', 'tank', 'speedster', 'support', 'statusInflicter'];

const roleStatAdjustments: Record<CreatureRole, Partial<Stats>> = {
  glassCannon: { attack: 12, specialAttack: 14, defense: -7, specialDefense: -6, speed: 4 },
  tank: { hp: 16, defense: 13, specialDefense: 12, speed: -8 },
  speedster: { speed: 18, attack: 5, specialAttack: 5, hp: -5, defense: -4 },
  support: { hp: 8, specialDefense: 8, specialAttack: 5, attack: -3 },
  statusInflicter: { speed: 7, specialAttack: 8, specialDefense: 4, attack: -2 },
};

const typeMovePools: Record<CreatureType, MoveId[]> = {
  meme: ['bonk', 'viral_uppercut', 'comment_storm', 'meme_focus'],
  sound: ['echo_slap', 'quick_yell', 'bass_drop', 'hype_chant'],
  chaos: ['chaos_bite', 'glitch_rush', 'brain_scramble', 'weird_fog'],
  water: ['aqua_skid', 'freezer_noise', 'tidal_meme', 'brine_guard'],
  fire: ['spicy_breath', 'espresso_blast', 'oven_tackle', 'preheat'],
  earth: ['stone_thump', 'mudslide', 'plate_crack', 'fortify_shell'],
  air: ['gust_kick', 'tornado_spin', 'sky_pierce', 'tailwind_meme'],
  electric: ['spark_scroll', 'voltage_drop', 'thunder_ping', 'overclock'],
  toxic: ['toxic_drip', 'acid_pasta', 'venom_prank', 'noxious_guard'],
  metal: ['metal_clang', 'gear_grind', 'satellite_ray', 'iron_pose'],
  psychic: ['mind_spike', 'nap_wave', 'brain_boost', 'brain_scramble'],
  ancient: ['ancient_stare', 'relic_slam', 'royal_guard', 'stone_thump'],
  food: ['snack_chomp', 'sauce_splash', 'carb_load', 'spicy_breath'],
  shadow: ['shadow_ping', 'night_scroll', 'dark_delay', 'chaos_bite'],
  light: ['light_flash', 'holy_laser', 'radiant_focus', 'quick_yell'],
};

const roleMovePools: Record<CreatureRole, MoveId[]> = {
  glassCannon: ['viral_uppercut', 'espresso_blast', 'thunder_ping', 'holy_laser'],
  tank: ['fortify_shell', 'iron_pose', 'royal_guard', 'brine_guard'],
  speedster: ['quick_yell', 'gust_kick', 'tailwind_meme', 'hype_chant'],
  support: ['radiant_focus', 'hype_chant', 'carb_load', 'noxious_guard'],
  statusInflicter: ['venom_prank', 'nap_wave', 'weird_fog', 'dark_delay'],
};

const makeStats = (index: number, role: CreatureRole, overrides: Partial<Stats> = {}): Stats => {
  const roleStats = roleStatAdjustments[role];
  const stat = (key: keyof Stats, value: number) => Math.max(24, value + (roleStats[key] ?? 0) + (overrides[key] ?? 0));
  return {
    hp: stat('hp', defaultStats.hp + (index % 9) * 3),
    attack: stat('attack', defaultStats.attack + (index % 7) * 3),
    defense: stat('defense', defaultStats.defense + (index % 5) * 3),
    specialAttack: stat('specialAttack', defaultStats.specialAttack + (index % 6) * 3),
    specialDefense: stat('specialDefense', defaultStats.specialDefense + (index % 4) * 3),
    speed: stat('speed', defaultStats.speed + (index % 8) * 3),
  };
};

const uniqueMoves = (moves: MoveId[]): MoveId[] => [...new Set(moves)];

const buildMoveIds = (seed: CreatureSeed, index: number, role: CreatureRole): MoveId[] => {
  const primary = typeMovePools[seed.types[0]];
  const secondary = seed.types[1] ? typeMovePools[seed.types[1]] : [];
  return uniqueMoves([
    ...(seed.moveIds ?? []),
    primary[0],
    primary[1],
    secondary[0] ?? roleMovePools[role][0],
    roleMovePools[role][index % roleMovePools[role].length],
    primary[2],
    secondary[2] ?? primary[3],
  ]).slice(0, 6);
};

const minEncounterLevelForStage = (stage: EvolutionStage): number => {
  if (stage === 1) return 1;
  if (stage === 2) return 14;
  return 32;
};

const getEvolutionStage = (seed: CreatureSeed): EvolutionStage => {
  if (seed.evolutionStage) return seed.evolutionStage;
  const index = seed.evolutionLine?.indexOf(seed.id) ?? 0;
  return Math.min(Math.max(index + 1, 1), 3) as EvolutionStage;
};

const seeds: CreatureSeed[] = [
  {
    id: 'tungling',
    name: 'Tungling',
    types: ['ancient', 'sound'],
    classification: 'normal',
    role: 'tank',
    tags: ['starter_eligible'],
    description: 'A small wooden rhythm spirit that bonks before sunrise.',
    baseStats: { hp: 58, attack: 55, defense: 52, specialDefense: 48, speed: 38 },
    moveIds: ['bonk', 'echo_slap', 'stone_thump', 'royal_guard', 'ancient_stare'],
    evolutionLine: ['tungling', 'sahur_drummer', 'tung_tung_tung_sahur'],
    evolvesTo: 'sahur_drummer',
    evolutionLevel: 8,
  },
  {
    id: 'sahur_drummer',
    name: 'Sahur Drummer',
    types: ['ancient', 'sound'],
    classification: 'normal',
    role: 'tank',
    description: 'The rhythm grows steadier, and so does the stick.',
    baseStats: { hp: 76, attack: 72, defense: 68, specialDefense: 62, speed: 50 },
    moveIds: ['bonk', 'echo_slap', 'stone_thump', 'royal_guard', 'relic_slam'],
    evolutionLine: ['tungling', 'sahur_drummer', 'tung_tung_tung_sahur'],
    evolvesTo: 'tung_tung_tung_sahur',
    evolutionLevel: 18,
  },
  {
    id: 'tung_tung_tung_sahur',
    name: 'Tung Tung Tung Sahur',
    types: ['ancient', 'sound'],
    classification: 'normal',
    role: 'tank',
    tags: ['boss_only', 'uncapturable'],
    catchable: false,
    description: 'A full alarm spirit that announces danger with impossible rhythm.',
    baseStats: { hp: 94, attack: 92, defense: 86, specialDefense: 82, speed: 62 },
    moveIds: ['bonk', 'echo_slap', 'stone_thump', 'relic_slam', 'royal_guard'],
    evolutionLine: ['tungling', 'sahur_drummer', 'tung_tung_tung_sahur'],
  },
  {
    id: 'patapim',
    name: 'Patapim',
    types: ['air', 'sound'],
    classification: 'normal',
    role: 'speedster',
    tags: ['starter_eligible'],
    description: 'A tiny shivering beat creature powered by percussion and wind.',
    baseStats: { hp: 44, speed: 66, specialAttack: 56, defense: 38 },
    moveIds: ['quick_yell', 'echo_slap', 'gust_kick', 'hype_chant', 'tornado_spin'],
    evolutionLine: ['patapim', 'patapim_turbo', 'brr_brr_patapim'],
    evolvesTo: 'patapim_turbo',
    evolutionLevel: 8,
  },
  {
    id: 'patapim_turbo',
    name: 'Patapim Turbo',
    types: ['air', 'electric'],
    classification: 'normal',
    role: 'speedster',
    description: 'A faster Patapim with sparks in the beat.',
    baseStats: { hp: 58, speed: 88, specialAttack: 74, defense: 50 },
    moveIds: ['quick_yell', 'echo_slap', 'spark_scroll', 'hype_chant', 'voltage_drop'],
    evolutionLine: ['patapim', 'patapim_turbo', 'brr_brr_patapim'],
    evolvesTo: 'brr_brr_patapim',
    evolutionLevel: 18,
  },
  {
    id: 'brr_brr_patapim',
    name: 'Brr Brr Patapim',
    types: ['air', 'electric'],
    classification: 'normal',
    role: 'speedster',
    tags: ['boss_only', 'uncapturable'],
    catchable: false,
    description: 'A fully charged speedster, too fast for captions.',
    baseStats: { hp: 76, speed: 112, specialAttack: 96, defense: 66 },
    moveIds: ['quick_yell', 'echo_slap', 'spark_scroll', 'voltage_drop', 'thunder_ping'],
    evolutionLine: ['patapim', 'patapim_turbo', 'brr_brr_patapim'],
  },
  {
    id: 'trala_kid',
    name: 'Trala Kid',
    types: ['water', 'sound'],
    classification: 'normal',
    role: 'support',
    tags: ['starter_eligible'],
    description: 'A small beach singer with suspicious rhythm discipline.',
    baseStats: { hp: 54, specialAttack: 58, specialDefense: 52, speed: 52 },
    moveIds: ['aqua_skid', 'echo_slap', 'quick_yell', 'brine_guard', 'tidal_meme'],
    evolutionLine: ['trala_kid', 'tralalero', 'tralalero_tralala'],
    evolvesTo: 'tralalero',
    evolutionLevel: 8,
  },
  {
    id: 'tralalero',
    name: 'Tralalero',
    types: ['water', 'sound'],
    classification: 'normal',
    role: 'support',
    description: 'Conducts tides, memes, and poor tactical decisions.',
    baseStats: { hp: 72, specialAttack: 78, specialDefense: 68, speed: 66 },
    moveIds: ['aqua_skid', 'echo_slap', 'quick_yell', 'brine_guard', 'tidal_meme'],
    evolutionLine: ['trala_kid', 'tralalero', 'tralalero_tralala'],
    evolvesTo: 'tralalero_tralala',
    evolutionLevel: 18,
  },
  {
    id: 'tralalero_tralala',
    name: 'Tralalero Tralala',
    types: ['water', 'light'],
    classification: 'normal',
    role: 'support',
    tags: ['boss_only', 'uncapturable'],
    catchable: false,
    description: 'A full beach chorus whose voice makes boss waves nervous.',
    baseStats: { hp: 90, specialAttack: 104, specialDefense: 86, speed: 82 },
    moveIds: ['aqua_skid', 'echo_slap', 'light_flash', 'tidal_meme', 'radiant_focus'],
    evolutionLine: ['trala_kid', 'tralalero', 'tralalero_tralala'],
  },
  {
    id: 'croclet',
    name: 'Croclet',
    types: ['water', 'metal'],
    classification: 'normal',
    role: 'glassCannon',
    tags: ['starter_eligible'],
    description: 'A small crocodile with launch angles and bad judgment.',
    baseStats: { hp: 50, attack: 64, defense: 48, speed: 42 },
    moveIds: ['aqua_skid', 'metal_clang', 'chaos_bite', 'brine_guard', 'gear_grind'],
    evolutionLine: ['croclet', 'bombardiro', 'bombardiro_crocodilo'],
    evolvesTo: 'bombardiro',
    evolutionLevel: 8,
  },
  {
    id: 'bombardiro',
    name: 'Bombardiro',
    types: ['water', 'metal'],
    classification: 'normal',
    role: 'glassCannon',
    description: 'Aerodynamic, loud, and still mostly teeth.',
    baseStats: { hp: 66, attack: 84, defense: 66, speed: 58 },
    moveIds: ['aqua_skid', 'metal_clang', 'chaos_bite', 'brine_guard', 'gear_grind'],
    evolutionLine: ['croclet', 'bombardiro', 'bombardiro_crocodilo'],
    evolvesTo: 'bombardiro_crocodilo',
    evolutionLevel: 18,
  },
  {
    id: 'bombardiro_crocodilo',
    name: 'Bombardiro Crocodilo',
    types: ['water', 'metal'],
    classification: 'normal',
    role: 'glassCannon',
    tags: ['boss_only', 'uncapturable'],
    catchable: false,
    description: 'A crocodile with launch paperwork and endgame teeth.',
    baseStats: { hp: 86, attack: 110, defense: 86, speed: 76 },
    moveIds: ['aqua_skid', 'metal_clang', 'chaos_bite', 'gear_grind', 'satellite_ray'],
    evolutionLine: ['croclet', 'bombardiro', 'bombardiro_crocodilo'],
  },
  { id: 'lirili_larila', name: 'Lirili Larila', types: ['light', 'sound'], classification: 'normal', role: 'statusInflicter', description: 'A tiny jingle with heroic confidence.', moveIds: ['light_flash', 'echo_slap', 'quick_yell', 'radiant_focus'] },
  { id: 'chimpanzini_bananini', name: 'Chimpanzini Bananini', types: ['food', 'chaos'], classification: 'normal', role: 'glassCannon', description: 'Banana-fueled chaos in a starter-friendly package.', moveIds: ['snack_chomp', 'chaos_bite', 'spicy_breath', 'meme_focus'] },
  { id: 'capuccino_assassino', name: 'Capuccino Assassino', types: ['shadow', 'food'], classification: 'normal', description: 'Caffeinated stealth with foam precision.', moveIds: ['shadow_ping', 'quick_yell', 'toxic_drip', 'bonk'] },
  { id: 'frigo_camelo', name: 'Frigo Camelo', types: ['earth', 'food'], classification: 'normal', description: 'A fridge-camel hybrid that keeps snacks safe.', moveIds: ['stone_thump', 'bonk', 'aqua_skid', 'ancient_stare'] },
  { id: 'trippi_troppi', name: 'Trippi Troppi', types: ['psychic', 'chaos'], classification: 'normal', description: 'A walking pattern interrupt.', moveIds: ['chaos_bite', 'shadow_ping', 'echo_slap', 'ancient_stare'] },
  { id: 'ballerina_cappuccina', name: 'Ballerina Cappuccina', types: ['light', 'food'], classification: 'normal', description: 'Elegant spins, dangerous caffeine levels.', moveIds: ['light_flash', 'quick_yell', 'echo_slap', 'bonk'] },
  { id: 'glorbo_fruttodrillo', name: 'Glorbo Fruttodrillo', types: ['food', 'water'], classification: 'normal', description: 'Fruit armor and reptile ambition.', moveIds: ['aqua_skid', 'chaos_bite', 'bonk', 'toxic_drip'] },
  { id: 'squalo_mandolino', name: 'Squalo Mandolino', types: ['water', 'sound'], classification: 'normal', description: 'A shark that solos before biting.', moveIds: ['aqua_skid', 'echo_slap', 'quick_yell', 'chaos_bite'] },
  { id: 'giraffa_lampadina', name: 'Giraffa Lampadina', types: ['electric', 'light'], classification: 'normal', description: 'Tall, bright, and lightly overvolted.', moveIds: ['spark_scroll', 'light_flash', 'bonk', 'quick_yell'] },
  { id: 'pizza_mimica', name: 'Pizza Mimica', types: ['food', 'shadow'], classification: 'normal', description: 'Looks delicious until the crust blinks.', moveIds: ['shadow_ping', 'spicy_breath', 'toxic_drip', 'bonk'] },
  { id: 'ravioli_rampante', name: 'Ravioli Rampante', types: ['food', 'earth'], classification: 'normal', description: 'Stomps around full of sauce and dreams.', moveIds: ['stone_thump', 'spicy_breath', 'bonk', 'ancient_stare'] },
  { id: 'bananito_bandito', name: 'Bananito Bandito', types: ['food', 'shadow'], classification: 'normal', description: 'A small snack thief with big initiative.', moveIds: ['shadow_ping', 'quick_yell', 'bonk', 'chaos_bite'] },
  { id: 'espresso_esplosivo', name: 'Espresso Esplosivo', types: ['fire', 'food'], classification: 'normal', description: 'One shot, many consequences.', moveIds: ['spicy_breath', 'quick_yell', 'spark_scroll', 'bonk'] },
  { id: 'gelato_galattico', name: 'Gelato Galattico', types: ['light', 'psychic'], classification: 'normal', description: 'Cosmic dessert with a cold strategic center.', moveIds: ['light_flash', 'nap_wave', 'freezer_noise', 'ancient_stare'] },
  { id: 'pinguino_rumoroso', name: 'Pinguino Rumoroso', types: ['water', 'sound'], classification: 'normal', description: 'Slides in loudly and refuses to elaborate.', moveIds: ['aqua_skid', 'freezer_noise', 'quick_yell', 'bonk'] },
  { id: 'cactus_confuso', name: 'Cactus Confuso', types: ['earth', 'toxic'], classification: 'normal', description: 'Pointy and unsure whose turn it is.', moveIds: ['toxic_drip', 'stone_thump', 'bonk', 'ancient_stare'] },
  { id: 'radio_ribelle', name: 'Radio Ribelle', types: ['electric', 'sound'], classification: 'normal', description: 'Broadcasts illegal battle tempo.', moveIds: ['spark_scroll', 'echo_slap', 'quick_yell', 'light_flash'] },
  { id: 'tamburo_tornado', name: 'Tamburo Tornado', types: ['air', 'sound'], classification: 'normal', description: 'A spinning drum with weather opinions.', moveIds: ['quick_yell', 'echo_slap', 'spark_scroll', 'bonk'] },
  { id: 'nuvola_nervosa', name: 'Nuvola Nervosa', types: ['air', 'electric'], classification: 'normal', description: 'An anxious cloud that zaps first.', moveIds: ['spark_scroll', 'quick_yell', 'light_flash', 'echo_slap'] },
  { id: 'drago_dormiglione', name: 'Drago Dormiglione', types: ['fire', 'ancient'], classification: 'normal', description: 'Mostly asleep, still extremely warm.', moveIds: ['spicy_breath', 'ancient_stare', 'stone_thump', 'bonk'] },
  { id: 'robotto_risotto', name: 'Robotto Risotto', types: ['metal', 'food'], classification: 'normal', description: 'Automated stirring, manual violence.', moveIds: ['bonk', 'spark_scroll', 'stone_thump', 'spicy_breath'] },
  { id: 'mozzarella_misteriosa', name: 'Mozzarella Misteriosa', types: ['food', 'psychic'], classification: 'normal', description: 'Soft, stretchy, and aware of hidden stats.', moveIds: ['shadow_ping', 'nap_wave', 'bonk', 'ancient_stare'] },
  { id: 'satellite_spaghetti', name: 'Satellite Spaghetti', types: ['metal', 'psychic'], classification: 'normal', description: 'Orbital noodles with targeting software.', moveIds: ['spark_scroll', 'shadow_ping', 'light_flash', 'bonk'] },
  { id: 'meteorino_margherita', name: 'Meteorino Margherita', types: ['fire', 'earth'], classification: 'normal', description: 'A pizza meteor nobody ordered.', moveIds: ['spicy_breath', 'stone_thump', 'bonk', 'light_flash'] },
  { id: 'ombra_ombrello', name: 'Ombra Ombrello', types: ['shadow', 'water'], classification: 'normal', description: 'Shade with rain privileges.', moveIds: ['shadow_ping', 'aqua_skid', 'toxic_drip', 'quick_yell'] },
  { id: 'sirena_sirupata', name: 'Sirena Sirupata', types: ['water', 'food'], classification: 'normal', description: 'Sweet voice, sticky tactics.', moveIds: ['aqua_skid', 'echo_slap', 'toxic_drip', 'light_flash'] },
  { id: 'forno_furioso', name: 'Forno Furioso', types: ['fire', 'metal'], classification: 'normal', description: 'Preheated and emotionally available for combat.', moveIds: ['spicy_breath', 'bonk', 'stone_thump', 'spark_scroll'] },
  { id: 'limone_laser', name: 'Limone Laser', types: ['light', 'food'], classification: 'normal', description: 'Citrus precision with a bright aftertaste.', moveIds: ['light_flash', 'spark_scroll', 'quick_yell', 'bonk'] },
  { id: 'zanzara_zuccherata', name: 'Zanzara Zuccherata', types: ['air', 'toxic'], classification: 'normal', description: 'Tiny, sweet, and infuriatingly hard to hit.', moveIds: ['toxic_drip', 'quick_yell', 'chaos_bite', 'echo_slap'] },
  { id: 'panino_psichico', name: 'Panino Psichico', types: ['food', 'psychic'], classification: 'normal', description: 'Predicts hunger three turns ahead.', moveIds: ['shadow_ping', 'nap_wave', 'bonk', 'ancient_stare'] },
  { id: 'vulcano_vocale', name: 'Vulcano Vocale', types: ['fire', 'sound'], classification: 'normal', description: 'Lava-powered vocals with no indoor voice.', moveIds: ['spicy_breath', 'echo_slap', 'quick_yell', 'stone_thump'] },
  { id: 'granito_geloso', name: 'Granito Geloso', types: ['earth', 'ancient'], classification: 'normal', description: 'A jealous stone with excellent posture.', moveIds: ['stone_thump', 'ancient_stare', 'bonk', 'shadow_ping'] },
  { id: 'lampione_lunatico', name: 'Lampione Lunatico', types: ['electric', 'shadow'], classification: 'normal', description: 'Streetlight by day, bad idea by night.', moveIds: ['spark_scroll', 'shadow_ping', 'light_flash', 'quick_yell'] },
  { id: 'tromba_tossica', name: 'Tromba Tossica', types: ['toxic', 'sound'], classification: 'normal', description: 'A brass section with poison damage.', moveIds: ['toxic_drip', 'echo_slap', 'quick_yell', 'chaos_bite'] },
  { id: 'arcobaleno_arrosto', name: 'Arcobaleno Arrosto', types: ['light', 'fire'], classification: 'normal', description: 'A roasted rainbow. Do not ask for the recipe.', moveIds: ['light_flash', 'spicy_breath', 'quick_yell', 'bonk'] },
  { id: 'bidone_ballerino', name: 'Bidone Ballerino', types: ['metal', 'chaos'], classification: 'normal', description: 'A dancing bin with no respect for tempo.', moveIds: ['bonk', 'chaos_bite', 'stone_thump', 'echo_slap'] },
  { id: 'cipolla_celestiale', name: 'Cipolla Celestiale', types: ['light', 'food'], classification: 'normal', description: 'Layers of divine snack energy.', moveIds: ['light_flash', 'toxic_drip', 'bonk', 'ancient_stare'] },
  { id: 'violino_vampiro', name: 'Violino Vampiro', types: ['shadow', 'sound'], classification: 'normal', description: 'Plays sharp, bites sharper.', moveIds: ['shadow_ping', 'echo_slap', 'chaos_bite', 'quick_yell'] },
];

export const creatures: CreatureDefinition[] = seeds.map((seed, index) => {
  const role = seed.role ?? roleCycle[index % roleCycle.length];
  const baseStats = makeStats(index, role, seed.baseStats);
  const evolutionStage = getEvolutionStage(seed);

  return {
    id: seed.id,
    name: seed.name,
    types: seed.types,
    baseHP: baseStats.hp,
    baseAttack: baseStats.attack,
    baseDefense: baseStats.defense,
    baseSpAttack: baseStats.specialAttack,
    baseSpDefense: baseStats.specialDefense,
    baseSpeed: baseStats.speed,
    baseStats,
    growthRate: seed.growthRate ?? 'medium',
    levelUpMoves: buildMoveIds(seed, index, role).map((moveId, moveIndex) => ({
      level: [1, 3, 6, 10, 15, 20][moveIndex] ?? 20 + moveIndex * 5,
      moveId,
    })),
    evolutionLine: seed.evolutionLine ?? [seed.id],
    evolutionStage,
    minEncounterLevel: seed.minEncounterLevel ?? minEncounterLevelForStage(evolutionStage),
    evolutions: seed.evolvesTo
      ? [{ evolvesTo: seed.evolvesTo, level: seed.evolutionLevel }]
      : [],
    spriteKey: seed.spriteKey ?? seed.id,
    classification: seed.classification ?? 'normal',
    tags: [
      ...(seed.tags ?? []),
      ...(seed.catchable === false ? ['uncapturable' as const] : []),
    ],
    role,
    description: seed.description,
    catchable: seed.catchable ?? true,
  };
});

export const creatureMap = new Map(creatures.map((creature) => [creature.id, creature]));

export const getCreature = (id: string): CreatureDefinition => {
  const creature = creatureMap.get(id);
  if (!creature) {
    throw new Error(`Unknown creature: ${id}`);
  }
  return creature;
};
