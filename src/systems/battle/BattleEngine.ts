import { getCreature } from '../../data/creatures';
import { getMove } from '../../data/moves';
import { BattleAction, BattleEvent, BattleFeedbackEvent, BattleState } from '../../types/battle';
import { CreatureInstance, CreatureMoveSlot } from '../../types/creature';
import { randomInt } from '../../utils/random';
import { DamageCalculator } from './DamageCalculator';
import { processMoveEffects } from './EffectProcessor';
import { createEmptyStatStages, getEffectiveBattleStat } from './StatStages';
import { StatusSystem } from './StatusSystem';

export class BattleEngine {
  private readonly damageCalculator = new DamageCalculator();
  private readonly statusSystem = new StatusSystem();

  createBattle(player: CreatureInstance, enemy: CreatureInstance, wave: number, isBoss: boolean): BattleState {
    this.resetBattleOnlyState(player);
    this.resetBattleOnlyState(enemy);
    const enemyDefinition = getCreature(enemy.definitionId);
    if (import.meta.env.DEV) {
      console.log('[battle:encounter]', {
        enemySpecies: enemy.definitionId,
        enemyName: enemy.name,
        enemyLevel: enemy.level,
        evolutionStage: enemyDefinition.evolutionStage,
        minEncounterLevel: enemyDefinition.minEncounterLevel,
        wave,
        isBoss,
      });
    }
    return {
      player,
      enemy,
      wave,
      isBoss,
      turn: 1,
      phase: 'waiting',
      turnEvents: [],
      feedbackEvents: [],
      log: [`Wave ${wave}${isBoss ? ' Boss' : ''}: ${enemy.name} appeared.`],
    };
  }

  resolveTurn(state: BattleState, playerMoveId: string, enemyMoveId: string): BattleState {
    if (state.winner) {
      return state;
    }

    const playerMove = this.getUsableMoveSlot(state.player, playerMoveId);
    if (!playerMove) {
      return {
        ...state,
        log: [...state.log, 'That move has no PP left.'].slice(-18),
      };
    }

    const enemyMove = this.getUsableMoveSlot(state.enemy, enemyMoveId) ?? this.getFirstUsableMoveSlot(state.enemy);
    if (!enemyMove) {
      return {
        ...state,
        winner: 'player',
        phase: 'won',
        log: [...state.log, `${state.enemy.name} has no moves left.`].slice(-18),
      };
    }

    state.phase = 'resolving';
    state.lastEvent = undefined;
    state.turnEvents = [];
    state.feedbackEvents = [];

    const actions: BattleAction[] = [
      { actor: 'player', moveId: playerMoveId },
      { actor: 'enemy', moveId: enemyMove.moveId },
    ];

    const nextLog = [...state.log, `Turn ${state.turn}`];
    let lastEvent: BattleEvent | undefined;
    const turnEvents: BattleEvent[] = [];
    const feedbackEvents: BattleFeedbackEvent[] = [];

    for (const action of actions) {
      const actor = action.actor === 'player' ? state.player : state.enemy;
      const target = action.actor === 'player' ? state.enemy : state.player;
      const targetSide: 'player' | 'enemy' = action.actor === 'player' ? 'enemy' : 'player';
      if (actor.currentHp <= 0 || target.currentHp <= 0) {
        continue;
      }

      const moveSlot = this.getUsableMoveSlot(actor, action.moveId);
      if (!moveSlot) {
        nextLog.push(`${actor.name} tried to move, but no PP was left.`);
        continue;
      }
      moveSlot.currentPp -= 1;

      const statusResult = this.statusSystem.beforeMove(actor);
      nextLog.push(...statusResult.messages);
      if (!statusResult.canAct) {
        const message = statusResult.messages[0] ?? `${actor.name} couldn't move!`;
        const eventFeedback: BattleFeedbackEvent[] = [{
          type: 'onStatusSkip',
          actor: action.actor,
          target: action.actor,
          moveId: action.moveId,
          message,
        }];
        lastEvent = {
          kind: 'statusSkip',
          actor: action.actor,
          target: action.actor,
          moveId: action.moveId,
          damage: 0,
          missed: false,
          effectiveness: 1,
          isCrit: false,
          playerHpAfter: state.player.currentHp,
          enemyHpAfter: state.enemy.currentHp,
          status: actor.status ?? undefined,
          message,
          feedback: eventFeedback,
        };
        turnEvents.push(lastEvent);
        feedbackEvents.push(...eventFeedback);
        continue;
      }

      const move = getMove(action.moveId);
      const result = this.damageCalculator.calculate(actor, target, move);
      const eventFeedback: BattleFeedbackEvent[] = [];
      const actorName = action.actor === 'enemy' ? `Foe ${actor.name}` : actor.name;
      lastEvent = {
        kind: 'move',
        actor: action.actor,
        target: targetSide,
        moveId: action.moveId,
        damage: result.damage,
        missed: result.missed,
        effectiveness: result.effectiveness,
        isCrit: result.isCrit,
        playerHpAfter: state.player.currentHp,
        enemyHpAfter: state.enemy.currentHp,
        feedback: eventFeedback,
      };
      turnEvents.push(lastEvent);
      if (result.missed) {
        const useMessage = `${actorName} used ${move.name}!`;
        const missMessage = 'But it missed!';
        nextLog.push(useMessage, missMessage);
        eventFeedback.push({ type: 'onMiss', actor: action.actor, target: targetSide, moveId: action.moveId, message: missMessage });
      } else if (move.category === 'status') {
        nextLog.push(`${actorName} used ${move.name}!`);
      } else {
        target.currentHp = Math.max(0, target.currentHp - result.damage);
        const useMessage = `${actorName} used ${move.name}!`;
        const damageMessage = `${target.name} took ${result.damage} damage!`;
        nextLog.push(useMessage, damageMessage);
        if (result.damage > 0) {
          eventFeedback.push({
            type: 'onDamage',
            actor: action.actor,
            target: targetSide,
            moveId: action.moveId,
            amount: result.damage,
            message: damageMessage,
          });
        }
        if (result.isCrit) {
          nextLog.push('A critical hit!');
          eventFeedback.push({ type: 'onCritical', actor: action.actor, target: targetSide, moveId: action.moveId, message: 'A critical hit!' });
        }
        if (result.effectiveness > 1) {
          nextLog.push("It's super effective!");
          eventFeedback.push({ type: 'onSuperEffective', actor: action.actor, target: targetSide, moveId: action.moveId, message: "It's super effective!" });
        }
        if (result.effectiveness < 1) {
          nextLog.push("It's not very effective...");
          eventFeedback.push({ type: 'onNotVeryEffective', actor: action.actor, target: targetSide, moveId: action.moveId, message: "It's not very effective..." });
        }
      }

      if (!result.missed) {
        const effectResults = processMoveEffects({
          attacker: actor,
          target,
          move,
          damageDealt: result.damage,
          battleState: state,
        });
        nextLog.push(...effectResults.map((effect) => effect.message));
        if (move.statusEffect) {
          const statusMessages = this.statusSystem.applyStatus(target, move.statusEffect, move.statusChance ?? 1);
          nextLog.push(...statusMessages);
          eventFeedback.push(...statusMessages.map((message) => ({
            type: 'onStatusApply' as const,
            actor: action.actor,
            target: targetSide,
            moveId: action.moveId,
            message,
          })));
        }
      }
      lastEvent.playerHpAfter = state.player.currentHp;
      lastEvent.enemyHpAfter = state.enemy.currentHp;
      this.updateWinner(state);
      if (target.currentHp <= 0) {
        eventFeedback.push({
          type: 'onFaint',
          actor: action.actor,
          target: targetSide,
          moveId: action.moveId,
          message: `${target.name} fainted!`,
        });
      }
      feedbackEvents.push(...eventFeedback);
      if (state.winner) {
        break;
      }
    }

    if (!state.winner) {
      for (const side of ['player', 'enemy'] as const) {
        const target = side === 'player' ? state.player : state.enemy;
        const statusResult = this.statusSystem.endTurn(target);
        if (statusResult.damage <= 0 || !statusResult.message) {
          continue;
        }
        nextLog.push(statusResult.message);
        const eventFeedback: BattleFeedbackEvent[] = [{
          type: 'onStatusDamage',
          actor: side,
          target: side,
          amount: statusResult.damage,
          message: statusResult.message,
        }];
        lastEvent = {
          kind: 'statusDamage',
          actor: side,
          target: side,
          damage: statusResult.damage,
          missed: false,
          effectiveness: 1,
          isCrit: false,
          playerHpAfter: state.player.currentHp,
          enemyHpAfter: state.enemy.currentHp,
          status: statusResult.status,
          message: statusResult.message,
          feedback: eventFeedback,
        };
        turnEvents.push(lastEvent);
        feedbackEvents.push(...eventFeedback);
        this.updateWinner(state);
        if (target.currentHp <= 0) {
          const faintMessage = `${target.name} fainted!`;
          nextLog.push(faintMessage);
          const faintFeedback: BattleFeedbackEvent = {
            type: 'onFaint',
            actor: side,
            target: side,
            message: faintMessage,
          };
          lastEvent.feedback.push(faintFeedback);
          feedbackEvents.push(faintFeedback);
        }
        if (state.winner) {
          break;
        }
      }
    }

    this.updateWinner(state);
    return {
      ...state,
      turn: state.turn + 1,
      phase: state.winner === 'player' ? 'won' : state.winner === 'enemy' ? 'lost' : 'waiting',
      lastEvent,
      turnEvents,
      feedbackEvents,
      log: nextLog.slice(-18),
    };
  }

  private orderActions(state: BattleState, actions: BattleAction[]): BattleAction[] {
    return [...actions].sort((a, b) => {
      const moveA = getMove(a.moveId);
      const moveB = getMove(b.moveId);
      if (moveA.priority !== moveB.priority) {
        return moveB.priority - moveA.priority;
      }
      const speedA = getEffectiveBattleStat(a.actor === 'player' ? state.player : state.enemy, 'speed');
      const speedB = getEffectiveBattleStat(b.actor === 'player' ? state.player : state.enemy, 'speed');
      if (speedA === speedB) {
        return randomInt(0, 1) === 0 ? -1 : 1;
      }
      return speedB - speedA;
    });
  }

  private resetBattleOnlyState(creature: CreatureInstance): void {
    creature.statStages = createEmptyStatStages();
    creature.battleStatuses = [];
    creature.effectStacks = {};
  }

  private updateWinner(state: BattleState): void {
    if (state.enemy.currentHp <= 0) {
      state.winner = 'player';
      state.phase = 'won';
    }
    if (state.player.currentHp <= 0) {
      state.winner = 'enemy';
      state.phase = 'lost';
    }
  }

  private getUsableMoveSlot(creature: CreatureInstance, moveId: string): CreatureMoveSlot | undefined {
    this.ensureMoveSlots(creature);
    return creature.moves.find((slot) => slot.moveId === moveId && slot.currentPp > 0);
  }

  private getFirstUsableMoveSlot(creature: CreatureInstance): CreatureMoveSlot | undefined {
    this.ensureMoveSlots(creature);
    return creature.moves.find((slot) => slot.currentPp > 0);
  }

  private ensureMoveSlots(creature: CreatureInstance): void {
    if (creature.moves?.length > 0) {
      return;
    }
    creature.moves = creature.moveIds.map((moveId) => {
      const move = getMove(moveId);
      return {
        moveId,
        currentPp: move.pp,
        maxPp: move.pp,
      };
    });
  }
}
