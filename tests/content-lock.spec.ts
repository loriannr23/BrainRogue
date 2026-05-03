import { expect, test } from '@playwright/test';
import { biomes } from '../src/data/biomes';
import { creatures, getCreature } from '../src/data/creatures';
import { moveMap } from '../src/data/moves';
import { starterIds } from '../src/data/starters';
import { EvolutionSystem } from '../src/systems/progression/EvolutionSystem';
import { ExperienceSystem } from '../src/systems/progression/ExperienceSystem';
import { WaveSystem } from '../src/systems/progression/WaveSystem';

const releaseLines = [
  ['tungling', 'sahur_drummer', 'tung_tung_tung_sahur'],
  ['patapim', 'patapim_turbo', 'brr_brr_patapim'],
  ['croclet', 'bombardiro', 'bombardiro_crocodilo'],
  ['trala_kid', 'tralalero', 'tralalero_tralala'],
] as const;

const stage1Ids = releaseLines.map((line) => line[0]);
const stage2Ids = releaseLines.map((line) => line[1]);
const stage3Ids = releaseLines.map((line) => line[2]);
const releaseIds = new Set(releaseLines.flat());

test('release v1 starters are locked to stage one creatures', () => {
  expect(starterIds).toEqual(stage1Ids);
});

test('release v1 creature references, moves, and evolutions are valid', () => {
  for (const line of releaseLines) {
    line.forEach((creatureId) => expect(getCreature(creatureId), creatureId).toBeDefined());
    expect(getCreature(line[0]).evolutions[0]?.evolvesTo).toBe(line[1]);
    expect(getCreature(line[1]).evolutions[0]?.evolvesTo).toBe(line[2]);
    expect(getCreature(line[2]).evolutions).toHaveLength(0);
  }

  for (const creature of creatures) {
    for (const move of creature.levelUpMoves) {
      expect(moveMap.has(move.moveId), `${creature.id} references missing move ${move.moveId}`).toBe(true);
    }
  }
});

test('each release starter has four usable moves by level 10', () => {
  for (const starterId of starterIds) {
    const learnedByTen = getCreature(starterId).levelUpMoves.filter((entry) => entry.level <= 10);
    expect(learnedByTen, starterId).toHaveLength(4);
  }
});

test('normal and boss pools use the locked release stages', () => {
  for (const biome of biomes) {
    expect(biome.enemyPool.every((id) => stage1Ids.includes(id) || stage2Ids.includes(id)), biome.id).toBe(true);
    expect(biome.bossPool.every((id) => stage3Ids.includes(id)), biome.id).toBe(true);
  }
});

test('level evolution updates identity, stats, and moves safely', () => {
  const experience = new ExperienceSystem();
  const evolution = new EvolutionSystem();
  const creature = experience.createCreature('tungling', 18);
  const firstStats = creature.stats.hp;
  const firstMessages = evolution.tryEvolve(creature);

  expect(firstMessages[0]).toContain('Sahur Drummer');
  expect(creature.definitionId).toBe('sahur_drummer');
  expect(creature.name).toBe('Sahur Drummer');
  expect(creature.stats.hp).not.toBe(firstStats);
  expect(creature.moves.length).toBeGreaterThanOrEqual(4);

  const secondMessages = evolution.tryEvolve(creature);
  expect(secondMessages[0]).toContain('Tung Tung Tung Sahur');
  expect(creature.definitionId).toBe('tung_tung_tung_sahur');
});

test('wave ten creates a stage three boss from the locked content', () => {
  const waveSystem = new WaveSystem();
  for (let i = 0; i < 12; i += 1) {
    const enemy = waveSystem.createEnemyForWave(10);
    expect(stage3Ids).toContain(enemy.definitionId);
    expect(enemy.stats.hp).toBeGreaterThan(enemy.level + 10);
  }
});
