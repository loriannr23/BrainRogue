import { getCreature } from '../../data/creatures';
import { CreatureInstance } from '../../types/creature';
import { ExperienceSystem } from './ExperienceSystem';

export class EvolutionSystem {
  private readonly experience = new ExperienceSystem();

  tryEvolve(creature: CreatureInstance): string[] {
    const definition = getCreature(creature.definitionId);
    const evolution = definition.evolutions.find((rule) => rule.level && creature.level >= rule.level);
    if (!evolution) {
      return [];
    }

    const evolved = this.experience.createCreature(evolution.evolvesTo, creature.level);
    creature.definitionId = evolved.definitionId;
    creature.name = evolved.name;
    creature.types = evolved.types;
    creature.stats = evolved.stats;
    creature.currentHp = evolved.stats.hp;
    creature.moveIds = evolved.moveIds;
    creature.moves = evolved.moves;
    return [`${definition.name} evolved into ${creature.name}.`];
  }
}
