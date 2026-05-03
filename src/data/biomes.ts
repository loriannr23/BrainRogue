export interface BiomeDefinition {
  id: string;
  name: string;
  description: string;
  color: number;
  startsAtWave: number;
  enemyPool: string[];
  bossPool: string[];
}

export const biomes: BiomeDefinition[] = [
  {
    id: 'meme_plains',
    name: 'Meme Plains',
    description: 'Starter-friendly chaos fields with loud, snacky enemies.',
    color: 0x2f4159,
    startsAtWave: 1,
    enemyPool: ['tungling', 'sahur_drummer', 'patapim', 'patapim_turbo', 'croclet', 'bombardiro', 'trala_kid', 'tralalero'],
    bossPool: ['tung_tung_tung_sahur', 'brr_brr_patapim', 'bombardiro_crocodilo', 'tralalero_tralala'],
  },
  {
    id: 'chaos_coast',
    name: 'Chaos Coast',
    description: 'Water, sound and unstable tempo near the shoreline.',
    color: 0x2f4159,
    startsAtWave: 11,
    enemyPool: ['trala_kid', 'tralalero', 'patapim', 'patapim_turbo', 'croclet', 'bombardiro', 'tungling', 'sahur_drummer'],
    bossPool: ['tralalero_tralala', 'brr_brr_patapim', 'bombardiro_crocodilo', 'tung_tung_tung_sahur'],
  },
  {
    id: 'neon_dump',
    name: 'Neon Dump',
    description: 'Metal, toxic and electric weirdness after the run heats up.',
    color: 0x2f4159,
    startsAtWave: 21,
    enemyPool: ['croclet', 'bombardiro', 'patapim', 'patapim_turbo', 'tungling', 'sahur_drummer', 'trala_kid', 'tralalero'],
    bossPool: ['bombardiro_crocodilo', 'brr_brr_patapim', 'tung_tung_tung_sahur', 'tralalero_tralala'],
  },
  {
    id: 'ancient_stage',
    name: 'Ancient Stage',
    description: 'Late-run relic pressure with stronger bosses and sharper roles.',
    color: 0x2f4159,
    startsAtWave: 31,
    enemyPool: ['sahur_drummer', 'bombardiro', 'patapim_turbo', 'tralalero', 'tungling', 'croclet', 'patapim', 'trala_kid'],
    bossPool: ['tung_tung_tung_sahur', 'bombardiro_crocodilo', 'tralalero_tralala', 'brr_brr_patapim'],
  },
];
