import { CreatureInstance, StatusCondition } from '../../types/creature';

export interface StatusTurnResult {
  canAct: boolean;
  damage: number;
  messages: string[];
}

export interface StatusDamageResult {
  damage: number;
  message?: string;
  status?: StatusCondition;
}

const statusApplyMessages: Record<StatusCondition, (name: string) => string> = {
  burn: (name) => `${name} was burned!`,
  poison: (name) => `${name} was poisoned!`,
  paralyze: (name) => `${name} is paralyzed!`,
};

export class StatusSystem {
  beforeMove(creature: CreatureInstance, rng: () => number = Math.random): StatusTurnResult {
    if (creature.status === 'paralyze' && rng() < 0.25) {
      return {
        canAct: false,
        damage: 0,
        messages: [`${creature.name} is paralyzed! It can't move!`],
      };
    }

    return { canAct: true, damage: 0, messages: [] };
  }

  beforeTurn(creature: CreatureInstance): StatusTurnResult {
    return this.beforeMove(creature);
  }

  applyStatus(creature: CreatureInstance, status: StatusCondition, chance: number, rng: () => number = Math.random): string[] {
    if (creature.status || rng() >= chance) {
      return [];
    }

    creature.status = status;
    return [statusApplyMessages[status](creature.name)];
  }

  endTurn(creature: CreatureInstance): StatusDamageResult {
    if (creature.currentHp <= 0) {
      return { damage: 0 };
    }

    if (creature.status === 'burn') {
      const damage = Math.max(1, Math.floor(creature.stats.hp / 16));
      creature.currentHp = Math.max(0, creature.currentHp - damage);
      return { damage, status: 'burn', message: `${creature.name} is hurt by its burn!` };
    }

    if (creature.status === 'poison') {
      const damage = Math.max(1, Math.floor(creature.stats.hp / 8));
      creature.currentHp = Math.max(0, creature.currentHp - damage);
      return { damage, status: 'poison', message: `${creature.name} is hurt by poison!` };
    }

    return { damage: 0 };
  }

  afterTurn(creature: CreatureInstance): string[] {
    const result = this.endTurn(creature);
    return result.message ? [result.message] : [];
  }
}
