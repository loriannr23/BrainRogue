import Phaser from 'phaser';
import { getMove } from '../../data/moves';
import { GameState } from '../../systems/GameState';
import { RewardOption, RewardSystem } from '../../systems/progression/RewardSystem';
import { rewardIconKey, UI_ASSETS } from '../../systems/assets/UiAssetRegistry';
import { FxManager } from '../../systems/fx/FxManager';
import { WaveSystem } from '../../systems/progression/WaveSystem';
import { RunState } from '../../types/save';
import { InteractionLock } from '../../utils/InteractionLock';
import { installInputDebug, installPointerDebug } from '../../utils/inputDebug';
import { scaleRect, scaleX, scaleY } from '../../utils/layoutScale';
import { renderIconSafe } from '../../utils/renderIconSafe';
import { playSoundHook } from '../../utils/soundHooks';
import { createPixelCursor } from '../../ui/components/PixelCursor';
import { PixelPanel } from '../../ui/PixelPanel';
import { textStyle, UI_THEME } from '../../ui/theme';

interface RectLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RewardLayout {
  width: number;
  height: number;
  header: RectLayout;
  itemBand: RectLayout;
  itemRow: RectLayout;
  detail: RectLayout;
}

export class RewardScene extends Phaser.Scene {
  private readonly rewards = new RewardSystem();
  private readonly waves = new WaveSystem();
  private readonly interactionLock = new InteractionLock('RewardScene');
  private selectedIndex = 0;
  private previousSelectedIndex = 0;
  private selectedReward?: RewardOption;
  private rewardOptions: RewardOption[] = [];
  private selectionObjects: Phaser.GameObjects.GameObject[] = [];
  private rewardCards: Phaser.GameObjects.Rectangle[] = [];
  private rewardIcons: Array<Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle> = [];
  private rewardIconBaseY: number[] = [];
  private detailContainer?: Phaser.GameObjects.Container;
  private layout?: RewardLayout;
  private fx?: FxManager;
  private run?: RunState;

  constructor() {
    super('RewardScene');
  }

  create(data: { enemyLevel?: number; progressionMessages?: string[] }): void {
    this.resetSceneState();
    this.cameras.main.fadeIn(150, 8, 10, 18);
    const gameState = GameState.get();
    const run = gameState.save.currentRun;
    if (!run) {
      this.scene.start('MainMenuScene');
      return;
    }

    this.run = run;
    const layout = this.createLayout();
    this.layout = layout;
    this.fx = new FxManager(this);
    installPointerDebug(this);
    installInputDebug(this, () => ({
      phase: this.selectedReward ? 'selected' : 'choosing',
      inputLocked: this.interactionLock.isLocked,
      turn: `reward-wave-${run.wave}`,
    }));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.handleShutdown());

    const creature = run.party[0];
    gameState.updateBestWave(run.wave);
    gameState.persist();
    this.rewardOptions = this.rewards.createRewards(run.wave, creature);

    this.drawBackground(layout);
    this.drawHeader(layout, run, data.progressionMessages ?? []);
    this.drawRewardRow(layout);
    this.renderSelection(layout);
    this.registerKeyboard(layout);
  }

  private createLayout(): RewardLayout {
    const width = this.scale.width;
    const height = this.scale.height;
    return {
      width,
      height,
      header: scaleRect({ x: 48, y: 32, width: 1504, height: 96 }, width, height),
      itemBand: scaleRect({ x: 240, y: 240, width: 1120, height: 144 }, width, height),
      itemRow: scaleRect({ x: 260, y: 240, width: 1080, height: 144 }, width, height),
      detail: scaleRect({ x: 0, y: 600, width: 1600, height: 240 }, width, height),
    };
  }

  private drawBackground(layout: RewardLayout): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(UI_THEME.colors.bg);
    graphics.fillRect(0, 0, layout.width, layout.height);
  }

  private drawHeader(layout: RewardLayout, run: RunState, messages: string[]): void {
    new PixelPanel(this, layout.header.x, layout.header.y, layout.header.width, layout.header.height);
    const nextWave = run.wave + 1;
    const preview = this.waves.getWavePreview(nextWave);
    this.add.text(layout.header.x + 16, layout.header.y + 16, `Wave ${run.wave} Cleared`, textStyle(24, UI_THEME.css.white, {
      fixedWidth: layout.header.width - 32,
    }));
    this.add.text(layout.header.x + 16, layout.header.y + 56, messages.join(' | '), textStyle(14, UI_THEME.css.muted, {
      fixedWidth: layout.header.width - 440,
      wordWrap: { width: layout.header.width - 440 },
    }));
    this.add.text(layout.header.x + layout.header.width - 360, layout.header.y + 16, `Next Wave ${nextWave}`, textStyle(18, UI_THEME.css.white, {
      fixedWidth: 344,
    }));
    this.add.text(layout.header.x + layout.header.width - 360, layout.header.y + 48, `${preview.biome.name} / Pool ${preview.enemyPoolSize}`, textStyle(14, UI_THEME.css.muted, {
      fixedWidth: 344,
    }));
  }

  private drawRewardRow(layout: RewardLayout): void {
    this.add.rectangle(layout.itemBand.x, layout.itemBand.y, layout.itemBand.width, layout.itemBand.height, UI_THEME.colors.panel, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, UI_THEME.colors.border);
    const slotWidth = Math.floor(layout.itemRow.width / 3);
    this.rewardOptions.forEach((reward, index) => {
      const x = layout.itemRow.x + index * slotWidth;
      const y = layout.itemRow.y;
      const cardPadding = scaleX(8, layout.width);
      const cardX = x + cardPadding;
      const cardY = y + scaleY(8, layout.height);
      const cardWidth = slotWidth - cardPadding * 2;
      const cardHeight = layout.itemRow.height - scaleY(16, layout.height);
      const card = this.add.rectangle(cardX, cardY, cardWidth, cardHeight, UI_THEME.colors.bgAlt, 1)
        .setOrigin(0, 0)
        .setStrokeStyle(1, UI_THEME.colors.border);
      this.rewardCards.push(card);
      const iconKey = rewardIconKey(reward.kind);
      const icon = renderIconSafe(this, iconKey, cardX + (cardWidth - 48) / 2, cardY + scaleY(16, layout.height), {
        boxWidth: 48,
        boxHeight: 48,
        maxWidth: 48,
        maxHeight: 48,
        missingAssetPath: UI_ASSETS.itemSource.path,
      });
      this.rewardIcons.push(icon);
      this.rewardIconBaseY.push(icon.y);
      this.add.text(cardX + scaleX(32, layout.width), cardY + scaleY(80, layout.height), reward.label, textStyle(20, UI_THEME.css.muted, {
        align: 'center',
        fixedWidth: cardWidth - scaleX(48, layout.width),
        wordWrap: { width: cardWidth - scaleX(48, layout.width) },
      })).setName(`reward-label-${index}`);
    });
  }

  private renderSelection(layout: RewardLayout): void {
    this.selectionObjects.forEach((object) => object.destroy());
    this.selectionObjects = [];
    const slotWidth = Math.floor(layout.itemRow.width / 3);
    const card = this.rewardCards[this.selectedIndex];
    const cardLeft = card?.x ?? layout.itemRow.x + this.selectedIndex * slotWidth + scaleX(8, layout.width);
    const previousCard = this.rewardCards[this.previousSelectedIndex];
    const previousCardLeft = previousCard?.x ?? cardLeft;
    const underlineTargetX = cardLeft + scaleX(56, layout.width);
    const underlineStartX = previousCardLeft + scaleX(56, layout.width);
    const underline = this.add.rectangle(
      underlineTargetX,
      layout.itemRow.y + scaleY(126, layout.height),
      slotWidth - scaleX(128, layout.width),
      2,
      UI_THEME.colors.accent,
      1,
    ).setOrigin(0, 0.5);
    if (this.previousSelectedIndex !== this.selectedIndex) {
      underline.setX(Math.round(underlineStartX));
      this.tweens.add({
        targets: underline,
        x: Math.round(underlineTargetX),
        duration: 110,
        ease: 'Quad.easeOut',
      });
    }
    const cursor = createPixelCursor(this, cardLeft + scaleX(28, layout.width), layout.itemRow.y + scaleY(108, layout.height));
    this.selectionObjects.push(underline, cursor);
    this.rewardOptions.forEach((_, index) => {
      const label = this.children.getByName(`reward-label-${index}`) as Phaser.GameObjects.Text | null;
      label?.setColor(index === this.selectedIndex ? UI_THEME.css.accent : UI_THEME.css.muted);
      this.rewardCards[index]?.setFillStyle(index === this.selectedIndex ? UI_THEME.selection.fill : UI_THEME.colors.bgAlt);
      this.rewardCards[index]?.setStrokeStyle(1, index === this.selectedIndex ? UI_THEME.selection.border : UI_THEME.colors.border, 1);
      const cardObject = this.rewardCards[index];
      const iconObject = this.rewardIcons[index];
      if (cardObject) {
        this.tweens.killTweensOf(cardObject);
      }
      if (iconObject) {
        this.tweens.killTweensOf(iconObject);
        iconObject.setY(this.rewardIconBaseY[index] ?? iconObject.y);
      }
    });
    const selectedIcon = this.rewardIcons[this.selectedIndex];
    if (selectedIcon) {
      this.fx?.playRewardShine(selectedIcon.x, selectedIcon.y);
    }
    this.renderDetail(layout);
  }

  private renderDetail(layout: RewardLayout): void {
    this.detailContainer?.destroy(true);
    const reward = this.rewardOptions[this.selectedIndex];
    if (!reward) return;
    const panel = new PixelPanel(this, 0, 0, layout.detail.width, layout.detail.height, {
      fill: UI_THEME.colors.bg,
      stroke: UI_THEME.colors.accent,
    });
    const title = this.add.text(16, 16, reward.label, textStyle(32, UI_THEME.css.white, {
      fixedWidth: layout.detail.width - 32,
    }));
    const rarity = this.add.text(16, 64, `Category: ${reward.kind.toUpperCase()}    Rarity: ${reward.rarity.toUpperCase()}`, textStyle(14, UI_THEME.css.accent, {
      fixedWidth: layout.detail.width - 32,
    }));
    const description = this.add.text(16, 104, reward.description, textStyle(16, UI_THEME.css.text, {
      fixedWidth: layout.detail.width - 32,
      wordWrap: { width: layout.detail.width - 32 },
      lineSpacing: 2,
    }));
    const effect = this.add.text(16, 176, this.effectText(reward), textStyle(16, UI_THEME.css.muted, {
      fixedWidth: layout.detail.width - 32,
      wordWrap: { width: layout.detail.width - 32 },
    }));
    this.detailContainer = this.add.container(layout.detail.x, layout.detail.y, [
      panel.container,
      title,
      rarity,
      description,
      effect,
    ]);
    this.detailContainer.setAlpha(0.35);
    this.tweens.add({
      targets: this.detailContainer,
      alpha: 1,
      duration: 120,
      ease: 'Quad.easeOut',
    });
  }

  private registerKeyboard(layout: RewardLayout): void {
    this.input.keyboard?.on('keydown-LEFT', () => this.moveSelection(-1, layout));
    this.input.keyboard?.on('keydown-A', () => this.moveSelection(-1, layout));
    this.input.keyboard?.on('keydown-RIGHT', () => this.moveSelection(1, layout));
    this.input.keyboard?.on('keydown-D', () => this.moveSelection(1, layout));
    this.input.keyboard?.on('keydown-ENTER', () => this.confirmSelection());
    this.input.keyboard?.on('keydown-SPACE', () => this.confirmSelection());
  }

  private moveSelection(delta: number, layout: RewardLayout): void {
    if (this.interactionLock.isLocked || this.rewardOptions.length === 0) return;
    this.previousSelectedIndex = this.selectedIndex;
    this.selectedIndex = Phaser.Math.Wrap(this.selectedIndex + delta, 0, this.rewardOptions.length);
    playSoundHook(this, 'ui_move');
    this.renderSelection(layout);
  }

  private confirmSelection(): void {
    if (this.interactionLock.isLocked || this.selectedReward || !this.run) return;
    const reward = this.rewardOptions[this.selectedIndex];
    if (!reward) return;
    playSoundHook(this, 'ui_confirm');
    playSoundHook(this, 'reward_pick');
    const selectedCard = this.rewardCards[this.selectedIndex];
    const selectedIcon = this.rewardIcons[this.selectedIndex];
    if (selectedCard) {
      selectedCard.setFillStyle(UI_THEME.selection.fill);
      selectedCard.setStrokeStyle(1, UI_THEME.selection.border, 1);
    }
    if (selectedIcon) {
      this.fx?.playRewardShine(selectedIcon.x, selectedIcon.y);
    }
    this.selectedReward = reward;
    this.interactionLock.lock(`reward:${reward.id}`);
    try {
      this.applyRewardAndContinue(reward, this.run);
    } catch (error) {
      this.interactionLock.unlock('reward error');
      throw error;
    }
  }

  private applyRewardAndContinue(reward: RewardOption, run: RunState): void {
    const creature = run.party[0];
    if (reward.currency) {
      run.currency += reward.currency;
    }
    if (reward.healAmount) {
      creature.currentHp = Math.min(creature.stats.hp, creature.currentHp + reward.healAmount);
    }
    if (reward.fullHeal) {
      creature.currentHp = creature.stats.hp;
      delete creature.status;
    }
    if (reward.statBoost) {
      for (const [stat, amount] of Object.entries(reward.statBoost)) {
        const statKey = stat as keyof typeof reward.statBoost;
        const value = amount ?? 0;
        creature.stats[statKey] = (creature.stats[statKey] ?? 0) + value;
        if (statKey === 'hp') {
          creature.currentHp += value;
        }
      }
    }
    if (reward.moveId) {
      const learnedMove = getMove(reward.moveId);
      const slot = { moveId: learnedMove.id, currentPp: learnedMove.pp, maxPp: learnedMove.pp };
      if (creature.moves.length >= 4) {
        creature.moves.shift();
      }
      creature.moves.push(slot);
      creature.moveIds = creature.moves.map((entry) => entry.moveId);
    }

    run.wave += 1;
    GameState.get().persist();
    const band = this.layout?.itemBand;
    const flash = this.add.rectangle(
      band?.x ?? 0,
      band?.y ?? 0,
      band?.width ?? this.scale.width,
      band?.height ?? 96,
      UI_THEME.colors.accent,
      0.22,
    ).setOrigin(0, 0);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 130,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });
    this.time.delayedCall(130, () => {
      this.interactionLock.unlock('transition:battle');
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('BattleScene');
      });
      this.cameras.main.fadeOut(150, 8, 10, 18);
    });
  }

  private effectText(reward: RewardOption): string {
    if (reward.currency) return `Effect: gain ${reward.currency} run coins.`;
    if (reward.fullHeal) return 'Effect: fully restore HP and clear status.';
    if (reward.healAmount) return `Effect: restore ${reward.healAmount} HP.`;
    if (reward.statBoost) {
      return `Effect: ${Object.entries(reward.statBoost).map(([stat, amount]) => `${stat} +${amount}`).join(', ')}.`;
    }
    if (reward.moveId) return `Effect: learn ${reward.moveId}.`;
    return reward.source ? `Effect: ${reward.source}.` : 'Effect: applies immediately.';
  }

  private resetSceneState(): void {
    this.interactionLock.reset('create');
    this.selectedIndex = 0;
    this.previousSelectedIndex = 0;
    this.selectedReward = undefined;
    this.previousSelectedIndex = 0;
    this.rewardOptions = [];
    this.selectionObjects = [];
    this.rewardCards = [];
    this.rewardIcons = [];
    this.rewardIconBaseY = [];
    this.detailContainer = undefined;
    this.layout = undefined;
    this.fx = undefined;
    this.run = undefined;
  }

  private handleShutdown(): void {
    this.interactionLock.reset('shutdown');
    this.selectedReward = undefined;
    this.rewardOptions = [];
    this.selectionObjects = [];
    this.rewardCards = [];
    this.rewardIcons = [];
    this.rewardIconBaseY = [];
    this.detailContainer = undefined;
    this.layout = undefined;
    this.fx = undefined;
    this.run = undefined;
  }
}
