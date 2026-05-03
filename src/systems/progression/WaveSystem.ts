import { biomes, BiomeDefinition } from '../../data/biomes';
import { creatures, getCreature } from '../../data/creatures';
import { getMove } from '../../data/moves';
import { ExperienceSystem } from './ExperienceSystem';
import { pickOne } from '../../utils/random';

export interface WavePreview {
  wave: number;
  isBoss: boolean;
  biome: BiomeDefinition;
  nextBossWave: number;
  wavesToBoss: number;
  enemyPoolSize: number;
  expectedLevel: number;
}

export class WaveSystem {
  private readonly experience = new ExperienceSystem();

  isBossWave(wave: number): boolean {
    return wave % 10 === 0;
  }

  getBiomeForWave(wave: number): BiomeDefinition {
    return [...biomes]
      .sort((a, b) => b.startsAtWave - a.startsAtWave)
      .find((biome) => wave >= biome.startsAtWave) ?? biomes[0];
  }

  getWavePreview(wave: number): WavePreview {
    const biome = this.getBiomeForWave(wave);
    const nextBossWave = this.isBossWave(wave) ? wave : Math.ceil(wave / 10) * 10;
    const expectedLevel = this.getLevelForWave(wave);
    return {
      wave,
      isBoss: this.isBossWave(wave),
      biome,
      nextBossWave,
      wavesToBoss: Math.max(0, nextBossWave - wave),
      enemyPoolSize: this.getEnemyPoolForWave(wave, expectedLevel).length,
      expectedLevel,
    };
  }

  createEnemyForWave(wave: number) {
    const isBoss = this.isBossWave(wave);
    const level = this.getLevelForWave(wave);
    const pool = this.getEnemyPoolForWave(wave, level);
    const enemyDefinition = pickOne(pool);
    const enemy = this.experience.createCreature(enemyDefinition.id, level);

    if (isBoss) {
      enemy.stats.hp = Math.floor(enemy.stats.hp * 1.35);
      enemy.currentHp = enemy.stats.hp;
      enemy.stats.attack = Math.floor(enemy.stats.attack * 1.12);
      enemy.stats.defense = Math.floor(enemy.stats.defense * 1.08);
      enemy.stats.specialAttack = Math.floor(enemy.stats.specialAttack * 1.12);
      enemy.stats.specialDefense = Math.floor(enemy.stats.specialDefense * 1.08);
      this.upgradeBossMoves(enemy);
    }
    enemy.currentHp = enemy.stats.hp;
    return enemy;
  }

  private getEnemyPoolForWave(wave: number, level: number) {
    const biome = this.getBiomeForWave(wave);
    const ids = this.isBossWave(wave) ? biome.bossPool : biome.enemyPool;
    const pool = ids
      .map((id) => creatures.find((creature) => creature.id === id))
      .filter((creature) => creature !== undefined)
      .flatMap((creature) => this.getEncounterEligibleCreature(creature.id, level));
    if (pool.length > 0) return [...new Map(pool.map((creature) => [creature.id, creature])).values()];
    return creatures.filter((creature) =>
      creature.minEncounterLevel <= level
      && (
      this.isBossWave(wave)
        ? creature.tags?.includes('boss_only') || creature.tags?.includes('unique') || creature.tags?.includes('uncapturable')
        : creature.catchable
      ),
    );
  }

  private getLevelForWave(wave: number): number {
    return Math.max(3, Math.round(4 + wave * 0.45 + Math.sqrt(wave) * 0.35 + (this.isBossWave(wave) ? 3 : 0)));
  }

  private getEncounterEligibleCreature(id: string, level: number) {
    const creature = getCreature(id);
    if (creature.minEncounterLevel <= level) {
      return [creature];
    }
    const fallback = [...creature.evolutionLine]
      .reverse()
      .map((lineId) => getCreature(lineId))
      .find((candidate) => candidate.minEncounterLevel <= level);
    return fallback ? [fallback] : [];
  }

  private upgradeBossMoves(enemy: ReturnType<ExperienceSystem['createCreature']>): void {
    const definition = getCreature(enemy.definitionId);
    const lateMoves = definition.levelUpMoves.filter((entry) => entry.level <= enemy.level + 10).map((entry) => entry.moveId);
    const bestMoves = [...new Set([...enemy.moveIds, ...lateMoves])].slice(-4);
    enemy.moveIds = bestMoves;
    enemy.moves = bestMoves.map((moveId) => {
      const existing = enemy.moves.find((slot) => slot.moveId === moveId);
      if (existing) return existing;
      const move = getMove(moveId);
      return { moveId, currentPp: move.pp, maxPp: move.pp };
    });
  }
}
