import Phaser from 'phaser';
import { AIController } from '../../systems/battle/AIController';
import { BattleEngine } from '../../systems/battle/BattleEngine';
import { CreatureAnimator } from '../../systems/battle/CreatureAnimator';
import { GameState } from '../../systems/GameState';
import { EvolutionSystem } from '../../systems/progression/EvolutionSystem';
import { ExperienceSystem } from '../../systems/progression/ExperienceSystem';
import { LearnMoveSystem, MAX_CREATURE_MOVES } from '../../systems/progression/LearnMoveSystem';
import { WaveSystem } from '../../systems/progression/WaveSystem';
import { BattleFeedbackEvent, BattleState } from '../../types/battle';
import { BattleEvent } from '../../types/battle';
import { CreatureInstance } from '../../types/creature';
import { MoveId } from '../../types/move';
import { BattleUI, BattleUILayout, RectLayout } from '../../ui/BattleUI';
import { getMove } from '../../data/moves';
import { resolveCreatureFrontKey } from '../../systems/assets/CreatureAssetRegistry';
import { getCreatureRenderMetadata } from '../../systems/assets/CreatureRenderMetadata';
import { BATTLE_BACKGROUND_ASSETS, EXTERNAL_VISUAL_ASSETS } from '../../systems/assets/UiAssetRegistry';
import { FxManager } from '../../systems/fx/FxManager';
import { getMoveFxTypes } from '../../systems/fx/MoveFxRegistry';
import { InteractionLock } from '../../utils/InteractionLock';
import { installInputDebug, installPointerDebug } from '../../utils/inputDebug';
import { fitSpriteToBox } from '../../utils/fitSpriteToBox';
import { scaleRect, scaleX, scaleY } from '../../utils/layoutScale';
import { playSoundHook } from '../../utils/soundHooks';
import { PixelPanel } from '../../ui/PixelPanel';
import { textStyle, UI_THEME } from '../../ui/theme';

interface BattleSceneLayout {
  width: number;
  height: number;
  arena: RectLayout;
  playerSprite: { x: number; y: number; maxWidth: number; maxHeight: number; maxScale?: number };
  enemySprite: { x: number; y: number; maxWidth: number; maxHeight: number; maxScale?: number };
  playerPlatform: RectLayout;
  enemyPlatform: RectLayout;
  ui: BattleUILayout;
}

export class BattleScene extends Phaser.Scene {
  private readonly engine = new BattleEngine();
  private readonly ai = new AIController();
  private readonly waveSystem = new WaveSystem();
  private readonly experience = new ExperienceSystem();
  private readonly evolution = new EvolutionSystem();
  private readonly learnMoves = new LearnMoveSystem();
  private battle?: BattleState;
  private ui?: BattleUI;
  private playerSprite?: Phaser.GameObjects.Image;
  private enemySprite?: Phaser.GameObjects.Image;
  private playerAnimator?: CreatureAnimator;
  private enemyAnimator?: CreatureAnimator;
  private backgroundLayer?: Phaser.GameObjects.Layer;
  private platformLayer?: Phaser.GameObjects.Layer;
  private creatureLayer?: Phaser.GameObjects.Layer;
  private uiLayer?: Phaser.GameObjects.Layer;
  private inputLayer?: Phaser.GameObjects.Layer;
  private fx?: FxManager;
  private layout?: BattleSceneLayout;
  private readonly interactionLock = new InteractionLock('BattleScene');
  private advanceBattleMessage?: () => void;
  private progressionPromptInput?: (event: KeyboardEvent) => void;

  constructor() {
    super('BattleScene');
  }

  getDebugMoveButtonCenters(): Array<{ x: number; y: number }> {
    return this.ui?.getMoveButtonCenters() ?? [];
  }

  getDebugMoveTargets(): Array<{ moveId: string; x: number; y: number }> {
    return this.ui?.getDebugMoveTargets() ?? [];
  }

  getDebugBattleSnapshot(): object {
    return {
      phase: this.battle?.phase,
      winner: this.battle?.winner,
      turn: this.battle?.turn,
      locked: this.interactionLock.isLocked,
      playerHp: this.battle?.player.currentHp,
      enemyHp: this.battle?.enemy.currentHp,
      enemy: this.battle?.enemy.definitionId,
      playerMoves: this.battle?.player.moves.map((move) => `${move.moveId}:${move.currentPp}`),
      centers: this.getDebugMoveButtonCenters().length,
      moveTargets: this.getDebugMoveTargets(),
    };
  }

  create(): void {
    this.resetSceneState();
    this.cameras.main.fadeIn(150, 8, 10, 18);
    const run = GameState.get().save.currentRun;
    if (!run) {
      this.scene.start('MainMenuScene');
      return;
    }

    this.layout = this.createLayout();
    installPointerDebug(this);
    installInputDebug(this, () => ({
      phase: this.battle?.phase,
      inputLocked: this.interactionLock.isLocked,
      turn: this.battle?.turn,
    }));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.handleShutdown());
    this.backgroundLayer = this.add.layer();
    this.platformLayer = this.add.layer();
    this.creatureLayer = this.add.layer();
    this.uiLayer = this.add.layer();
    this.inputLayer = this.add.layer();
    this.backgroundLayer.setDepth(UI_THEME.depth.background);
    this.platformLayer.setDepth(UI_THEME.depth.arena);
    this.creatureLayer.setDepth(UI_THEME.depth.creatures);
    this.uiLayer.setDepth(UI_THEME.depth.ui);
    this.inputLayer.setDepth(UI_THEME.depth.overlay);
    this.fx = new FxManager(this, this.uiLayer);
    this.drawBattleBackground(this.layout);
    this.drawBattlePlatforms(this.layout);

    const player = run.party[0];
    const preview = this.waveSystem.getWavePreview(run.wave);
    const enemy = this.waveSystem.createEnemyForWave(run.wave);
    const playerRender = getCreatureRenderMetadata(player.definitionId);
    const enemyRender = getCreatureRenderMetadata(enemy.definitionId);
    this.battle = this.engine.createBattle(player, enemy, run.wave, this.waveSystem.isBossWave(run.wave));
    this.fx.playWaveStart(run.wave);
    this.showWavePreview(preview.biome.name, preview.isBoss, preview.expectedLevel, preview.wavesToBoss);
    playSoundHook(this, 'wave_start');
    this.playerSprite = this.add.image(
      this.layout.playerSprite.x,
      this.layout.playerSprite.y + (playerRender.battleYOffset ?? 0),
      resolveCreatureFrontKey(this, player.definitionId),
    );
    fitSpriteToBox(this.playerSprite, this.layout.playerSprite.maxWidth, this.layout.playerSprite.maxHeight, playerRender.battleScaleMax ?? this.layout.playerSprite.maxScale);
    this.playerSprite.setOrigin(0.5, 1);
    this.enemySprite = this.add.image(
      this.layout.enemySprite.x,
      this.layout.enemySprite.y + (enemyRender.battleYOffset ?? 0),
      resolveCreatureFrontKey(this, enemy.definitionId),
    );
    fitSpriteToBox(this.enemySprite, this.layout.enemySprite.maxWidth, this.layout.enemySprite.maxHeight, enemyRender.battleScaleMax ?? this.layout.enemySprite.maxScale);
    this.enemySprite.setOrigin(0.5, 1);
    this.creatureLayer.add([this.playerSprite, this.enemySprite]);
    this.playerAnimator = new CreatureAnimator(this, this.playerSprite, {
      attackDirection: 1,
      idleDistance: 3,
      idleDuration: 1300,
      hurtDistance: 16,
    });
    this.enemyAnimator = new CreatureAnimator(this, this.enemySprite, {
      attackDirection: -1,
      idleDistance: 2,
      idleDuration: 1500,
      hurtDistance: 14,
    });

    this.ui = new BattleUI(this, this.layout.ui, (moveId) => this.handleMove(moveId));
    this.ui.setInputEnabled(true);
    this.uiLayer.add(this.ui.container);
    this.ui.render(this.battle);
    this.input.keyboard?.on('keydown', this.handleKeyboard, this);
  }

  private handleKeyboard(event: KeyboardEvent): void {
    if (this.interactionLock.isLocked) {
      if (this.progressionPromptInput) {
        event.preventDefault();
        this.progressionPromptInput(event);
        return;
      }
      if (this.advanceBattleMessage && (event.code === 'Enter' || event.code === 'Space')) {
        event.preventDefault();
        this.advanceBattleMessage();
      }
      return;
    }
    if (!this.battle || this.battle.winner) return;
    this.ui?.handleKeyboard(event, this.battle);
  }

  private handleMove(moveId: string): void {
    if (this.interactionLock.isLocked || !this.battle || this.battle.winner) return;
    playSoundHook(this, 'ui_confirm');
    this.interactionLock.lock(`move:${moveId}`);
    this.ui?.setInputEnabled(false);
    this.ui?.hideCommandMenus();
    this.ui?.renderLog([]);

    try {
      const enemyMove = this.ai.chooseMove(this.battle);
      this.battle = this.engine.resolveTurn(this.battle, moveId, enemyMove);
      GameState.get().persist();
      void this.playTurnSequence(this.battle);
    } catch (error) {
      this.interactionLock.unlock('turn error');
      this.ui?.setInputEnabled(true);
      this.ui?.render(this.battle);
      throw error;
    }
  }

  private async playTurnSequence(state: BattleState): Promise<void> {
    this.ui?.renderLog([]);

    for (const event of state.turnEvents) {
      await this.animateBattleEvent(event);
    }

    this.ui?.renderVitals(state);
    if (state.winner === 'player') {
      const progressionMessages = await this.awardVictoryProgression(state);
      playSoundHook(this, 'victory');
      await this.delay(150);
      this.interactionLock.unlock('transition:reward');
      this.startSceneAfterFade('RewardScene', { enemyLevel: state.enemy.level, progressionMessages });
      this.cameras.main.fadeOut(150, 8, 10, 18);
      return;
    }
    if (state.winner === 'enemy') {
      await this.delay(150);
      this.interactionLock.unlock('transition:gameover');
      this.startSceneAfterFade('GameOverScene');
      this.cameras.main.fadeOut(150, 8, 10, 18);
      return;
    }

    this.interactionLock.unlock('turn resolved');
    this.ui?.setInputEnabled(true);
    this.ui?.showActionMenu();
    this.ui?.render(state);
  }

  private async awardVictoryProgression(state: BattleState): Promise<string[]> {
    const run = GameState.get().save.currentRun;
    const creature = run?.party[0];
    if (!creature) {
      return [];
    }

    const xpResult = this.experience.awardXp(creature, state.enemy.level, state.isBoss);
    const progressionMessages = [...xpResult.messages];
    const levelUpEvents: BattleFeedbackEvent[] = progressionMessages
      .filter((message) => message.includes('reached level'))
      .map((message) => ({
        type: 'onLevelUp',
        actor: 'player',
        message,
      }));

    state.feedbackEvents.push(...levelUpEvents);
    GameState.get().persist();

    for (const message of xpResult.messages) {
      await this.showBattleLogMessage(message, 220);
    }

    for (const levelUp of xpResult.levelUps) {
      for (const moveId of levelUp.moveIds) {
        const learnMessages = await this.processLevelUpMove(creature, moveId);
        progressionMessages.push(...learnMessages);
      }
    }

    const evolutionResult = this.evolution.tryEvolve(creature);
    if (evolutionResult.evolved) {
      progressionMessages.push(...evolutionResult.messages);
      await this.playEvolutionMessages(evolutionResult.messages);
      this.refreshPlayerSprite(creature);
      this.ui?.renderVitals(state);
    }

    state.log = [...state.log, ...progressionMessages].slice(-18);
    return progressionMessages;
  }

  private async processLevelUpMove(creature: CreatureInstance, moveId: MoveId): Promise<string[]> {
    if (!this.learnMoves.canLearnMove(creature, moveId)) {
      return [];
    }

    const move = getMove(moveId);
    await this.showBattleLogMessage(`${creature.name} wants to learn ${move.name}.`, 360);

    if (creature.moves.length < MAX_CREATURE_MOVES) {
      const result = this.learnMoves.learnMove(creature, moveId);
      GameState.get().persist();
      for (const message of result.messages) {
        await this.showBattleLogMessage(message, 520);
      }
      return result.messages;
    }

    await this.showBattleLogMessage(`However, ${creature.name} already knows four moves.`, 360);
    const shouldReplace = await this.promptBinary(`Replace a move with ${move.name}?`);
    if (!shouldReplace) {
      const result = this.learnMoves.learnMove(creature, moveId);
      for (const message of result.messages) {
        await this.showBattleLogMessage(message, 520);
      }
      return result.messages;
    }

    const replacementIndex = await this.promptMoveReplacement(creature, moveId);
    const result = this.learnMoves.learnMove(creature, moveId, replacementIndex);
    GameState.get().persist();
    for (const message of result.messages) {
      await this.showBattleLogMessage(message, 520);
    }
    return result.messages;
  }

  private async playEvolutionMessages(messages: string[]): Promise<void> {
    for (const message of messages) {
      await this.showBattleLogMessage(message, message.startsWith('What?') ? 760 : 900);
    }
  }

  private refreshPlayerSprite(creature: CreatureInstance): void {
    if (!this.playerSprite || !this.layout) return;
    const render = getCreatureRenderMetadata(creature.definitionId);
    this.playerSprite.setTexture(resolveCreatureFrontKey(this, creature.definitionId));
    this.playerSprite.setY(this.layout.playerSprite.y + (render.battleYOffset ?? 0));
    fitSpriteToBox(this.playerSprite, this.layout.playerSprite.maxWidth, this.layout.playerSprite.maxHeight, render.battleScaleMax ?? this.layout.playerSprite.maxScale);
    this.playerSprite.setVisible(true);
    this.playerAnimator?.destroy();
    this.playerAnimator = new CreatureAnimator(this, this.playerSprite, {
      attackDirection: 1,
      idleDistance: 3,
      idleDuration: 1300,
      hurtDistance: 16,
    });
  }

  private async animateBattleEvent(event: BattleEvent): Promise<void> {
    const target = event.target === 'player' ? this.playerSprite : this.enemySprite;
    const actor = event.actor === 'player' ? this.playerSprite : this.enemySprite;
    const targetAnimator = event.target === 'player' ? this.playerAnimator : this.enemyAnimator;
    const actorAnimator = event.actor === 'player' ? this.playerAnimator : this.enemyAnimator;
    if (!target || !actor) {
      return;
    }

    const targetName = event.target === 'player' ? this.battle?.player.name : this.battle?.enemy.name;
    if (event.kind === 'statusSkip') {
      await this.showBattleLogMessage(event.message ?? `${targetName ?? 'Creature'} couldn't move!`, 520);
      return;
    }
    if (event.kind === 'statusDamage') {
      const hpAnimation = this.ui?.renderHpSnapshot(this.battle!, event.playerHpAfter, event.enemyHpAfter) ?? Promise.resolve();
      await Promise.all([
        hpAnimation,
        this.showBattleLogMessage(event.message ?? `${targetName ?? 'Creature'} is hurt by its status!`, 520),
      ]);
      if ((event.target === 'player' ? this.battle?.player.currentHp : this.battle?.enemy.currentHp) === 0) {
        targetAnimator?.destroy();
        await this.faint(target);
        await this.showBattleLogMessage(`${targetName ?? 'Creature'} fainted!`, 520);
      }
      return;
    }
    if (!event.moveId) {
      return;
    }

    const move = getMove(event.moveId);
    const actorName = event.actor === 'player' ? this.battle?.player.name : `Foe ${this.battle?.enemy.name ?? 'Enemy'}`;
    await this.showBattleLogMessage(`${actorName ?? 'Creature'} used ${move.name}!`, 420);
    await actorAnimator?.setAnimationState('attack');
    await this.delay(45);

    if (event.missed) {
      this.spawnFloatText(target.x, target.y - 118, 'MISS', UI_THEME.css.muted, 26);
      await this.showBattleLogMessage('But it missed!', 420);
      return;
    }

    if (event.damage <= 0) {
      if (move.category === 'status') {
        for (const feedback of event.feedback.filter((item) => item.type === 'onStatusApply')) {
          await this.showBattleLogMessage(feedback.message, 520);
        }
        return;
      }
      this.spawnFloatText(target.x, target.y - 118, 'NO EFFECT', UI_THEME.css.muted, 24);
      await this.showBattleLogMessage('It had no effect.', 240);
      return;
    }

    if (event.damage > 0) {
      const strongImpact = this.isStrongImpact(event, move, event.target === 'player' ? this.battle?.player.stats.hp ?? 1 : this.battle?.enemy.stats.hp ?? 1);
      await this.playMoveFxSequence(move, actor, target);
      playSoundHook(this, event.isCrit || event.effectiveness > 1 ? 'hit_heavy' : 'hit_light');
      if (event.isCrit) {
        playSoundHook(this, 'crit');
      }
      this.cameras.main.shake(strongImpact ? 130 : 90, strongImpact ? 0.004 : 0.0022);
      this.fx?.playHitSpark(target.x, target.y - 96);
      target.setTintFill(0xffffff);
      this.time.delayedCall(strongImpact ? 110 : 85, () => target.clearTint());
      void targetAnimator?.setAnimationState('hurt');
      this.spawnFloatText(target.x, target.y - 128, `-${event.damage}`, strongImpact ? UI_THEME.css.accent : UI_THEME.css.white, strongImpact ? 32 : 30);
      let labelOffset = 92;
      if (event.isCrit) {
        this.showImpactText('Critical!', target.x, target.y - labelOffset, { color: UI_THEME.css.white, fontSize: 20 });
        labelOffset -= 28;
      }
      if (event.effectiveness > 1) {
        this.showImpactText('Super Effective!', target.x, target.y - labelOffset, { color: UI_THEME.css.accent, fontSize: 18 });
      } else if (event.effectiveness < 1) {
        this.showImpactText('Not very effective...', target.x, target.y - labelOffset, { color: UI_THEME.css.muted, fontSize: 18 });
      }
      move.effects.forEach((effect) => {
        if (effect.type === 'burn' || effect.type === 'poison' || effect.type === 'rooted' || effect.type === 'confuse') {
          this.fx?.playStatusFx(effect.type, target.x, target.y - 78);
        }
      });
      const hpAnimation = this.ui?.renderHpSnapshot(this.battle!, event.playerHpAfter, event.enemyHpAfter) ?? Promise.resolve();
      await Promise.all([
        hpAnimation,
        this.showBattleLogMessage(`${targetName ?? 'Creature'} took ${event.damage} damage!`, 520),
      ]);
      if (event.isCrit) {
        await this.showBattleLogMessage('A critical hit!', 520);
      }
      if (event.effectiveness > 1) {
        await this.showBattleLogMessage("It's super effective!", 520);
      } else if (event.effectiveness < 1) {
        await this.showBattleLogMessage("It's not very effective...", 520);
      }
      for (const feedback of event.feedback.filter((item) => item.type === 'onStatusApply')) {
        await this.showBattleLogMessage(feedback.message, 520);
      }
      if ((event.target === 'player' ? this.battle?.player.currentHp : this.battle?.enemy.currentHp) === 0) {
        targetAnimator?.destroy();
        await this.faint(target);
        await this.showBattleLogMessage(`${targetName ?? 'Creature'} fainted!`, 520);
      }
    }
  }

  private async showBattleLogMessage(message: string, holdMs: number): Promise<void> {
    this.ui?.renderLog([]);
    await this.delay(20);
    this.ui?.renderLog([message]);
    if (holdMs > 0) {
      await this.waitForMessageAdvance(holdMs);
    }
  }

  private waitForMessageAdvance(autoAdvanceMs: number): Promise<void> {
    return new Promise((resolve) => {
      let resolved = false;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        this.advanceBattleMessage = undefined;
        resolve();
      };
      this.advanceBattleMessage = finish;
      this.time.delayedCall(autoAdvanceMs, finish);
    });
  }

  private promptBinary(question: string): Promise<boolean> {
    return new Promise((resolve) => {
      let selected = 0;
      const render = () => {
        this.ui?.renderLog([question, `${selected === 0 ? '> ' : '  '}Yes     ${selected === 1 ? '> ' : '  '}No`]);
      };
      const finish = (value: boolean) => {
        this.progressionPromptInput = undefined;
        playSoundHook(this, value ? 'ui_confirm' : 'ui_back');
        resolve(value);
      };
      this.progressionPromptInput = (event) => {
        if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
          selected = 0;
          playSoundHook(this, 'ui_move');
          render();
          return;
        }
        if (event.code === 'ArrowRight' || event.code === 'KeyD') {
          selected = 1;
          playSoundHook(this, 'ui_move');
          render();
          return;
        }
        if (event.code === 'Escape' || event.code === 'Backspace') {
          finish(false);
          return;
        }
        if (event.code === 'Enter' || event.code === 'Space') {
          finish(selected === 0);
        }
      };
      render();
    });
  }

  private promptMoveReplacement(creature: CreatureInstance, moveId: MoveId): Promise<number | undefined> {
    return new Promise((resolve) => {
      const move = getMove(moveId);
      let selected = 0;
      const optionCount = creature.moves.length + 1;
      const render = () => {
        const selectedMove = creature.moves[selected];
        const option = selectedMove ? `Forget ${getMove(selectedMove.moveId).name}` : `Do not learn ${move.name}`;
        this.ui?.renderLog(['Which move should be forgotten?', `${option}  <-/-> Enter`]);
      };
      const finish = (index?: number) => {
        this.progressionPromptInput = undefined;
        playSoundHook(this, index === undefined ? 'ui_back' : 'ui_confirm');
        resolve(index);
      };
      this.progressionPromptInput = (event) => {
        if (event.code === 'ArrowLeft' || event.code === 'KeyA' || event.code === 'ArrowUp' || event.code === 'KeyW') {
          selected = Phaser.Math.Wrap(selected - 1, 0, optionCount);
          playSoundHook(this, 'ui_move');
          render();
          return;
        }
        if (event.code === 'ArrowRight' || event.code === 'KeyD' || event.code === 'ArrowDown' || event.code === 'KeyS') {
          selected = Phaser.Math.Wrap(selected + 1, 0, optionCount);
          playSoundHook(this, 'ui_move');
          render();
          return;
        }
        if (event.code === 'Escape' || event.code === 'Backspace') {
          finish(undefined);
          return;
        }
        if (event.code === 'Enter' || event.code === 'Space') {
          finish(selected >= creature.moves.length ? undefined : selected);
        }
      };
      render();
    });
  }

  private faint(sprite: Phaser.GameObjects.Image): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({
        targets: sprite,
        y: sprite.y + 34,
        angle: sprite.angle + 8,
        duration: 180,
        ease: 'Quad.easeIn',
        onComplete: () => {
          sprite.setVisible(false);
          resolve();
        },
      });
    });
  }

  private spawnFloatText(x: number, y: number, text: string, color: string, fontSize: number): void {
    const label = this.add.text(x, y, text, {
      fontSize: `${fontSize}px`,
      color,
      fontFamily: 'monospace',
      stroke: UI_THEME.css.bg,
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.uiLayer?.add(label);
    this.tweens.add({
      targets: label,
      y: y - 36,
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private async playMoveFxSequence(
    move: ReturnType<typeof getMove>,
    actor: Phaser.GameObjects.Image,
    target: Phaser.GameObjects.Image,
  ): Promise<void> {
    const fxTypes = getMoveFxTypes(move);
    if (!this.fx || fxTypes.length === 0) return;
    const from = new Phaser.Math.Vector2(actor.x, actor.y - Math.max(72, actor.displayHeight * 0.55));
    const to = new Phaser.Math.Vector2(target.x, target.y - Math.max(72, target.displayHeight * 0.55));
    for (const fxType of fxTypes) {
      await this.fx.playMoveFx(fxType, from, to);
    }
  }

  private isStrongImpact(event: BattleEvent, move: ReturnType<typeof getMove>, targetMaxHp: number): boolean {
    return event.isCrit || event.effectiveness > 1 || move.power >= 70 || event.damage >= Math.max(1, targetMaxHp) * 0.25;
  }

  private showImpactText(text: string, x: number, y: number, style: { color: string; fontSize: number }): void {
    const label = this.add.text(x, y, text, {
      fontSize: `${style.fontSize}px`,
      color: style.color,
      fontFamily: 'monospace',
      stroke: UI_THEME.css.bg,
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.uiLayer?.add(label);
    label.setScale(0.94);
    this.tweens.add({
      targets: label,
      y: y - 18,
      alpha: 0,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms, () => resolve()));
  }

  private startSceneAfterFade(sceneKey: 'RewardScene' | 'GameOverScene', data?: object): void {
    let transitioned = false;
    const start = () => {
      if (transitioned || !this.scene.isActive()) return;
      transitioned = true;
      this.scene.start(sceneKey, data);
    };
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, start);
    this.time.delayedCall(260, start);
  }

  private createLayout(): BattleSceneLayout {
    const width = this.scale.width;
    const height = this.scale.height;
    const arena = scaleRect({ x: 0, y: 0, width: 1600, height: 660 }, width, height);
    const log = scaleRect({ x: 0, y: 660, width: 1000, height: 240 }, width, height);
    const commandBox = scaleRect({ x: 1000, y: 660, width: 600, height: 240 }, width, height);

    return {
      width,
      height,
      arena,
      enemySprite: {
        x: scaleX(1120, width),
        y: scaleY(342, height),
        maxWidth: scaleX(220, width),
        maxHeight: scaleY(180, height),
        maxScale: 1,
      },
      playerSprite: {
        x: scaleX(360, width),
        y: scaleY(568, height),
        maxWidth: scaleX(260, width),
        maxHeight: scaleY(260, height),
        maxScale: 1,
      },
      enemyPlatform: {
        x: scaleX(982, width),
        y: scaleY(342, height),
        width: scaleX(324, width),
        height: scaleY(52, height),
      },
      playerPlatform: {
        x: scaleX(190, width),
        y: scaleY(568, height),
        width: scaleX(380, width),
        height: scaleY(62, height),
      },
      ui: {
        waveText: {
          x: scaleX(800, width),
          y: scaleY(24, height),
        },
        enemyHp: {
          ...scaleRect({ x: 80, y: 110, width: 520, height: 96 }, width, height),
        },
        playerHp: {
          ...scaleRect({ x: 880, y: 500, width: 560, height: 120 }, width, height),
        },
        log,
        moveGrid: {
          x: commandBox.x + scaleX(16, width),
          y: commandBox.y + scaleY(16, height),
          width: commandBox.width - scaleX(32, width),
          height: commandBox.height - scaleY(32, height),
        },
      },
    };
  }

  private drawBattleBackground(layout: BattleSceneLayout): void {
    const graphics = this.add.graphics();
    this.backgroundLayer?.add(graphics);
    const run = GameState.get().save.currentRun;
    const biome = this.waveSystem.getBiomeForWave(run?.wave ?? 1);
    const horizonY = Math.round(layout.arena.y + layout.arena.height * 0.52);
    const groundY = Math.round(layout.arena.y + layout.arena.height * 0.61);

    graphics.fillStyle(UI_THEME.colors.bg);
    graphics.fillRect(0, 0, layout.width, layout.height);

    if (this.textures.exists(EXTERNAL_VISUAL_ASSETS.battleBackground.key)) {
      const background = this.add.image(
        layout.arena.x + layout.arena.width / 2,
        layout.arena.y + layout.arena.height / 2,
        EXTERNAL_VISUAL_ASSETS.battleBackground.key,
      ).setDisplaySize(layout.arena.width, layout.arena.height);
      this.backgroundLayer?.add(background);
    } else if (this.textures.exists(BATTLE_BACKGROUND_ASSETS.sky.key)) {
      const sky = this.add.tileSprite(layout.arena.x, layout.arena.y, layout.arena.width, groundY, BATTLE_BACKGROUND_ASSETS.sky.key)
        .setOrigin(0, 0);
      this.backgroundLayer?.add(sky);
      this.tweens.add({
        targets: sky,
        tilePositionX: sky.tilePositionX + 96,
        duration: 32000,
        repeat: -1,
      });
    } else {
      const skyBands = [UI_THEME.colors.bg, UI_THEME.colors.bg, UI_THEME.colors.panel, UI_THEME.colors.panel, UI_THEME.colors.border];
      const bandHeight = Math.ceil(groundY / skyBands.length);
      skyBands.forEach((color, index) => {
        graphics.fillStyle(color);
        graphics.fillRect(layout.arena.x, layout.arena.y + index * bandHeight, layout.arena.width, bandHeight + 2);
      });
    }

    const particleKey = this.textures.exists(EXTERNAL_VISUAL_ASSETS.battleParticles.key)
      ? EXTERNAL_VISUAL_ASSETS.battleParticles.key
      : this.textures.exists(BATTLE_BACKGROUND_ASSETS.particles.key)
        ? BATTLE_BACKGROUND_ASSETS.particles.key
        : undefined;
    if (particleKey) {
      const particles = this.add.tileSprite(layout.arena.x, layout.arena.y, layout.arena.width, groundY, particleKey)
        .setOrigin(0, 0)
        .setAlpha(0.45);
      this.backgroundLayer?.add(particles);
      this.tweens.add({
        targets: particles,
        tilePositionX: particles.tilePositionX + 128,
        tilePositionY: particles.tilePositionY - 24,
        duration: 26000,
        repeat: -1,
      });
    } else {
      for (let i = 0; i < 28; i += 1) {
        const particle = this.add.rectangle(
          layout.arena.x + 20 + ((i * 61) % Math.max(1, layout.arena.width - 40)),
          layout.arena.y + 46 + ((i * 41) % Math.round(layout.arena.height * 0.45)),
          3,
          3,
          i % 3 === 0 ? UI_THEME.colors.muted : UI_THEME.colors.text,
          1,
        );
        this.backgroundLayer?.add(particle);
        this.tweens.add({
          targets: particle,
          y: particle.y - 10,
          duration: 1400 + (i % 5) * 260,
          yoyo: true,
          repeat: -1,
        });
      }
    }

    if (!this.textures.exists(EXTERNAL_VISUAL_ASSETS.battleBackground.key)) {
      const terrainGraphics = this.add.graphics();
      this.backgroundLayer?.add(terrainGraphics);
      this.drawMidground(terrainGraphics, layout, horizonY, biome.color);
      this.drawGround(terrainGraphics, layout, groundY, biome.color);
    }

    const frameGraphics = this.add.graphics();
    this.backgroundLayer?.add(frameGraphics);
    frameGraphics.lineStyle(1, UI_THEME.colors.border);
    frameGraphics.strokeRect(layout.arena.x, layout.arena.y, layout.arena.width, layout.arena.height);
  }

  private drawMidground(graphics: Phaser.GameObjects.Graphics, layout: BattleSceneLayout, horizonY: number, biomeColor: number): void {
    graphics.fillStyle(UI_THEME.colors.panel, 1);
    graphics.fillRect(layout.arena.x, horizonY - 18, layout.arena.width, 40);
    graphics.fillStyle(UI_THEME.colors.panelLight, 1);
    for (let x = layout.arena.x - 40; x < layout.arena.x + layout.arena.width + 80; x += 96) {
      const height = 34 + ((x / 32) % 4) * 8;
      graphics.fillTriangle(x, horizonY + 22, x + 64, horizonY - height, x + 148, horizonY + 22);
    }
    graphics.fillStyle(biomeColor, 0.55);
    for (let x = layout.arena.x; x < layout.arena.x + layout.arena.width; x += 54) {
      const blockHeight = 12 + ((x / 54) % 3) * 8;
      graphics.fillRect(x, horizonY + 18 - blockHeight, 30, blockHeight);
      graphics.fillRect(x + 10, horizonY + 2 - blockHeight, 10, 16);
    }
  }

  private drawGround(graphics: Phaser.GameObjects.Graphics, layout: BattleSceneLayout, groundY: number, biomeColor: number): void {
    if (this.textures.exists(BATTLE_BACKGROUND_ASSETS.ground.key)) {
      const ground = this.add.tileSprite(layout.arena.x, groundY, layout.arena.width, layout.arena.y + layout.arena.height - groundY, BATTLE_BACKGROUND_ASSETS.ground.key)
        .setOrigin(0, 0)
        .setTint(UI_THEME.colors.border);
      this.backgroundLayer?.add(ground);
      const shade = this.add.rectangle(layout.arena.x, groundY, layout.arena.width, layout.arena.y + layout.arena.height - groundY, UI_THEME.colors.bg, 0.36)
        .setOrigin(0, 0);
      this.backgroundLayer?.add(shade);
      return;
    }

    graphics.fillStyle(UI_THEME.colors.bg, 1);
    graphics.fillRect(layout.arena.x, groundY, layout.arena.width, layout.arena.y + layout.arena.height - groundY);
    graphics.fillStyle(biomeColor, 0.72);
    graphics.fillRect(layout.arena.x, groundY, layout.arena.width, 28);
    graphics.fillStyle(UI_THEME.colors.border, 1);
    for (let x = layout.arena.x; x < layout.arena.x + layout.arena.width; x += 24) {
      const y = groundY + ((x / 24) % 2) * 5;
      graphics.fillRect(x, y, 16, 4);
      graphics.fillRect(x + 7, y - 5, 3, 5);
    }
    graphics.lineStyle(1, UI_THEME.colors.border);
    graphics.lineBetween(layout.arena.x, groundY, layout.arena.x + layout.arena.width, groundY);
  }

  private drawBattlePlatforms(layout: BattleSceneLayout): void {
    const graphics = this.add.graphics();
    this.platformLayer?.add(graphics);
    this.drawPlatformAssetOrFallback(graphics, layout.enemyPlatform, UI_THEME.colors.border, UI_THEME.colors.bg, 'enemy');
    this.drawPlatformAssetOrFallback(graphics, layout.playerPlatform, UI_THEME.colors.border, UI_THEME.colors.bg, 'player');
  }

  private drawPlatformAssetOrFallback(graphics: Phaser.GameObjects.Graphics, rect: RectLayout, topColor: number, shadowColor: number, side: 'player' | 'enemy'): void {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    this.drawCreatureShadow(graphics, rect, shadowColor);
    const externalPlatform = side === 'player' ? EXTERNAL_VISUAL_ASSETS.playerPlatform : EXTERNAL_VISUAL_ASSETS.enemyPlatform;
    const platformKey = this.textures.exists(externalPlatform.key)
      ? externalPlatform.key
      : this.textures.exists(BATTLE_BACKGROUND_ASSETS.platform.key)
        ? BATTLE_BACKGROUND_ASSETS.platform.key
        : undefined;
    if (platformKey) {
      const platform = this.add.image(centerX, centerY - rect.height * 0.08, platformKey)
        .setDisplaySize(rect.width, rect.height * 1.55)
        .setTint(topColor);
      this.platformLayer?.add(platform);
      return;
    }
    this.drawPlatform(graphics, rect, topColor, shadowColor);
  }

  private showWavePreview(biomeName: string, isBoss: boolean, expectedLevel: number, wavesToBoss: number): void {
    const panel = new PixelPanel(this, 72, 52, 340, 78, {
      fill: UI_THEME.colors.bgAlt,
      stroke: UI_THEME.colors.border,
      alpha: 1,
    });
    this.uiLayer?.add(panel.container);
    const title = this.add.text(94, 70, isBoss ? 'BOSS WAVE' : biomeName, textStyle(20, isBoss ? UI_THEME.css.danger : UI_THEME.css.white));
    const detail = this.add.text(94, 100, isBoss ? `Elite enemy Lv.${expectedLevel}` : `Enemy Lv.${expectedLevel}  Boss in ${wavesToBoss}`, textStyle(14, UI_THEME.css.text));
    this.uiLayer?.add([title, detail]);
    panel.container.setScale(0.96);
    title.setAlpha(0);
    detail.setAlpha(0);
    this.tweens.add({ targets: panel.container, scaleX: 1, scaleY: 1, duration: 120, ease: 'Back.easeOut' });
    this.tweens.add({ targets: [title, detail], alpha: 1, duration: 100, ease: 'Quad.easeOut' });
    this.time.delayedCall(isBoss ? 1200 : 900, () => {
      panel.container.destroy(true);
      title.destroy();
      detail.destroy();
    });
  }

  private drawPlatform(graphics: Phaser.GameObjects.Graphics, rect: RectLayout, topColor: number, shadowColor: number): void {
    graphics.fillStyle(shadowColor, 0.45);
    graphics.fillEllipse(rect.x + rect.width / 2, rect.y + rect.height * 0.72, rect.width * 0.98, rect.height * 1.05);
    graphics.fillStyle(topColor, 1);
    graphics.fillEllipse(rect.x + rect.width / 2, rect.y + rect.height / 2, rect.width, rect.height);
    graphics.fillStyle(UI_THEME.colors.accent, 0.28);
    graphics.fillEllipse(rect.x + rect.width / 2, rect.y + rect.height * 0.38, rect.width * 0.78, rect.height * 0.42);
  }

  private drawCreatureShadow(graphics: Phaser.GameObjects.Graphics, rect: RectLayout, color: number): void {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height * 0.55;
    const shadowKey = this.textures.exists(EXTERNAL_VISUAL_ASSETS.shadow.key)
      ? EXTERNAL_VISUAL_ASSETS.shadow.key
      : this.textures.exists(BATTLE_BACKGROUND_ASSETS.shadow.key)
        ? BATTLE_BACKGROUND_ASSETS.shadow.key
        : undefined;
    if (shadowKey) {
      const shadow = this.add.image(centerX, centerY, shadowKey)
        .setDisplaySize(rect.width * 0.62, rect.height * 0.72)
        .setAlpha(0.58);
      this.platformLayer?.add(shadow);
      return;
    }
    graphics.fillStyle(color, 0.42);
    graphics.fillEllipse(centerX, centerY, rect.width * 0.62, rect.height * 0.62);
  }

  private resetSceneState(): void {
    this.interactionLock.reset('create');
    this.battle = undefined;
    this.ui = undefined;
    this.playerSprite = undefined;
    this.enemySprite = undefined;
    this.playerAnimator = undefined;
    this.enemyAnimator = undefined;
    this.backgroundLayer = undefined;
    this.platformLayer = undefined;
    this.creatureLayer = undefined;
    this.uiLayer = undefined;
    this.inputLayer = undefined;
    this.fx = undefined;
    this.layout = undefined;
    this.advanceBattleMessage = undefined;
  }

  private handleShutdown(): void {
    this.input.keyboard?.off('keydown', this.handleKeyboard, this);
    this.interactionLock.reset('shutdown');
    this.ui?.destroy();
    this.playerAnimator?.destroy();
    this.enemyAnimator?.destroy();
    this.ui = undefined;
    this.battle = undefined;
    this.playerSprite = undefined;
    this.enemySprite = undefined;
    this.playerAnimator = undefined;
    this.enemyAnimator = undefined;
    this.fx = undefined;
    this.advanceBattleMessage = undefined;
  }
}
