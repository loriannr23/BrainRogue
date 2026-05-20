import { getCreature } from '../../data/creatures';
import { CreatureInstance } from '../../types/creature';
import { ExperienceSystem } from './ExperienceSystem';

export interface EvolutionResult {
  messages: string[];
  evolved: boolean;
  fromName?: string;
  toName?: string;
}

export class EvolutionSystem {
  private readonly experience = new ExperienceSystem();

  tryEvolve(creature: CreatureInstance): EvolutionResult {
    const definition = getCreature(creature.definitionId);
    const evolution = definition.evolutions.find((rule) => rule.level && creature.level >= rule.level);
    if (!evolution) {
      return { messages: [], evolved: false };
    }

    const evolvedDefinition = getCreature(evolution.evolvesTo);
    const oldMaxHp = creature.stats.hp;
    creature.definitionId = evolvedDefinition.id;
    creature.name = evolvedDefinition.name;
    creature.types = evolvedDefinition.types;
    creature.stats = this.experience.recalculateStats(evolvedDefinition.id, creature.level);
    creature.currentHp = Math.min(creature.stats.hp, Math.max(1, creature.currentHp + creature.stats.hp - oldMaxHp));
    creature.moveIds = creature.moves.map((slot) => slot.moveId);

    return {
      messages: [
        `What? ${definition.name} is evolving!`,
        `${definition.name} evolved into ${creature.name}.`,
      ],
      evolved: true,
      fromName: definition.name,
      toName: creature.name,
    };
  }
}
