import { getCreature } from '../../data/creatures';
import { getMove } from '../../data/moves';
import { CreatureInstance, Stats } from '../../types/creature';
import { makeId } from '../../utils/random';

const growthMultiplier = {
  fast: 0.8,
  medium: 1,
  slow: 1.25,
};

export class ExperienceSystem {
  createCreature(definitionId: string, level: number): CreatureInstance {
    const definition = getCreature(definitionId);
    const stats = this.scaleStats(definition.baseStats, level);
    const learnedMoves = definition.levelUpMoves
      .filter((entry) => entry.level <= level)
      .map((entry) => entry.moveId)
      .slice(-4);
    const moveIds = learnedMoves.length > 0 ? learnedMoves : ['bonk'];

    return {
      instanceId: makeId(definitionId),
      definitionId,
      name: definition.name,
      level,
      xp: 0,
      types: definition.types,
      stats,
      currentHp: stats.hp,
      status: null,
      moveIds,
      moves: moveIds.map((moveId) => {
        const move = getMove(moveId);
        return {
          moveId,
          currentPp: move.pp,
          maxPp: move.pp,
        };
      }),
    };
  }

  xpForLevel(level: number, growthRate: keyof typeof growthMultiplier): number {
    return Math.floor(level * level * level * growthMultiplier[growthRate]);
  }

  recalculateStats(definitionId: string, level: number): Stats {
    const definition = getCreature(definitionId);
    return {
      hp: this.calculateHp(definition.baseHP, level),
      attack: this.calculateStat(definition.baseAttack, level),
      defense: this.calculateStat(definition.baseDefense, level),
      specialAttack: this.calculateStat(definition.baseSpAttack, level),
      specialDefense: this.calculateStat(definition.baseSpDefense, level),
      speed: this.calculateStat(definition.baseSpeed, level),
    };
  }

  awardXp(creature: CreatureInstance, enemyLevel: number, isBoss: boolean): string[] {
    const definition = getCreature(creature.definitionId);
    const gained = Math.floor(enemyLevel * (isBoss ? 18 : 10));
    const messages = [`${creature.name} gained ${gained} XP.`];
    creature.xp += gained;

    while (creature.xp >= this.xpForLevel(creature.level + 1, definition.growthRate)) {
      creature.level += 1;
      const oldMaxHp = creature.stats.hp;
      creature.stats = this.recalculateStats(creature.definitionId, creature.level);
      creature.currentHp += creature.stats.hp - oldMaxHp;
      messages.push(`${creature.name} reached level ${creature.level}.`);
    }

    return messages;
  }

  private scaleStats(baseStats: Stats, level: number): Stats {
    return {
      hp: this.calculateHp(baseStats.hp, level),
      attack: this.calculateStat(baseStats.attack, level),
      defense: this.calculateStat(baseStats.defense, level),
      specialAttack: this.calculateStat(baseStats.specialAttack, level),
      specialDefense: this.calculateStat(baseStats.specialDefense, level),
      speed: this.calculateStat(baseStats.speed, level),
    };
  }

  private calculateHp(baseStat: number, level: number): number {
    return Math.max(1, Math.floor((2 * baseStat * level) / 100) + level + 10);
  }

  private calculateStat(baseStat: number, level: number): number {
    return Math.max(1, Math.floor((2 * baseStat * level) / 100) + 5);
  }
}
