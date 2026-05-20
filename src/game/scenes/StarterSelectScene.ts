import Phaser from 'phaser';
import { getCreature } from '../../data/creatures';
import { starterIds } from '../../data/starters';
import { GameState } from '../../systems/GameState';
import { getCreatureIconKey, getCreatureIconPath, resolveCreatureIconKey } from '../../systems/assets/CreatureAssetRegistry';
import { logMissingAsset } from '../../systems/assets/UiAssetRegistry';
import { ExperienceSystem } from '../../systems/progression/ExperienceSystem';
import { MetaProgressionSystem } from '../../systems/progression/MetaProgressionSystem';
import { CreatureDefinition } from '../../types/creature';
import { installPointerDebug } from '../../utils/inputDebug';
import { scaleRect, scaleX, scaleY } from '../../utils/layoutScale';
import { renderIconSafe } from '../../utils/renderIconSafe';
import { playSoundHook } from '../../utils/soundHooks';
import { CreaturePreview } from '../../ui/components/CreaturePreview';
import { createPixelCursor } from '../../ui/components/PixelCursor';
import { ClassificationBadge } from '../../ui/components/RarityBadge';
import { TypeBadge } from '../../ui/components/TypeBadge';
import { PixelButton } from '../../ui/components/PixelButton';
import { PixelPanel } from '../../ui/components/PixelPanel';
import { SectionHeader } from '../../ui/SectionHeader';
import { StatBar } from '../../ui/components/StatBar';
import { textStyle, UI_THEME } from '../../ui/theme';

interface RectLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface StarterSelectLayout {
  width: number;
  height: number;
  title: { x: number; y: number };
  grid: RectLayout;
  preview: RectLayout;
  side: RectLayout;
  tabs: RectLayout;
  card: { width: number; height: number; gap: number; columns: number };
  confirmButton: RectLayout;
  backButton: RectLayout;
  randomButton: RectLayout;
}

interface StarterCard {
  id: string;
  background: Phaser.GameObjects.Rectangle;
  selection: Phaser.GameObjects.Rectangle;
  cursor: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
}

const CARD_ICON_BOX = { width: 64, height: 64, maxScale: 1 };
const PREVIEW_SPRITE_BOX = { width: 220, height: 220, maxScale: 1 };

export class StarterSelectScene extends Phaser.Scene {
  private readonly experience = new ExperienceSystem();
  private readonly meta = new MetaProgressionSystem();
  private selectedStarterId = starterIds[0];
  private layout?: StarterSelectLayout;
  private previewContainer?: Phaser.GameObjects.Container;
  private cards: StarterCard[] = [];
  private selectedStarterIndex = 0;

  constructor() {
    super('StarterSelectScene');
  }

  create(): void {
    this.cards = [];
    this.previewContainer = undefined;
    this.layout = this.createLayout();
    this.selectedStarterId = GameState.get().save.unlockedStarters[0] ?? starterIds[0];
    this.selectedStarterIndex = Math.max(0, starterIds.indexOf(this.selectedStarterId));
    installPointerDebug(this);

    this.drawBackground(this.layout);
    this.createStarterGrid(this.layout);
    this.createButton(this.layout.backButton, 'Back', () => this.scene.start('MainMenuScene'), UI_THEME.colors.panelDark);
    this.createButton(this.layout.randomButton, 'Random', () => undefined, UI_THEME.colors.panel);
    this.createButton(this.layout.confirmButton, 'Start', () => this.confirmStarter(), UI_THEME.selection.fill);
    this.drawSideSlots(this.layout);
    this.renderPreview();
    this.updateSelectedCards();
    this.registerKeyboard();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.handleKeyboard, this);
    });
  }

  private createLayout(): StarterSelectLayout {
    const width = this.scale.width;
    const height = this.scale.height;
    const preview = scaleRect({ x: 24, y: 16, width: 500, height: 850 }, width, height);
    const grid = scaleRect({ x: 544, y: 96, width: 824, height: 760 }, width, height);
    const side = scaleRect({ x: 1392, y: 96, width: 184, height: 760 }, width, height);
    const tabs = scaleRect({ x: 544, y: 24, width: 824, height: 56 }, width, height);
    const gap = scaleX(24, width);
    const columns = 3;
    const cardWidth = scaleX(128, width);
    const cardHeight = scaleY(128, height);

    return {
      width,
      height,
      title: { x: width / 2, y: scaleY(48, height) },
      grid,
      preview,
      side,
      tabs,
      card: { width: cardWidth, height: cardHeight, gap, columns },
      backButton: { x: preview.x, y: preview.y + preview.height - scaleY(64, height), width: scaleX(160, width), height: scaleY(48, height) },
      randomButton: { x: side.x + scaleX(16, width), y: side.y + scaleY(24, height), width: side.width - scaleX(32, width), height: scaleY(48, height) },
      confirmButton: { x: side.x + scaleX(16, width), y: side.y + side.height - scaleY(88, height), width: side.width - scaleX(32, width), height: scaleY(64, height) },
    };
  }

  private drawBackground(layout: StarterSelectLayout): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(UI_THEME.colors.bg);
    graphics.fillRect(0, 0, layout.width, layout.height);

    this.drawPanel(layout.preview.x, layout.preview.y, layout.preview.width, layout.preview.height, UI_THEME.colors.border);
    this.drawPanel(layout.grid.x, layout.grid.y, layout.grid.width, layout.grid.height, UI_THEME.colors.border);
    this.drawPanel(layout.side.x, layout.side.y, layout.side.width, layout.side.height, UI_THEME.colors.border);
    this.add.text(layout.grid.x + scaleX(24, layout.width), layout.grid.y + scaleY(22, layout.height), 'Choose Starter', textStyle(20, UI_THEME.css.white, {
      fixedWidth: layout.grid.width - scaleX(48, layout.width),
    }));
    this.drawTabs(layout);
  }

  private drawTabs(layout: StarterSelectLayout): void {
    new PixelPanel(this, layout.tabs.x, layout.tabs.y, layout.tabs.width, layout.tabs.height, { fill: UI_THEME.colors.panel, stroke: UI_THEME.colors.border });
    ['Gen', 'Type', 'Caught', 'Unlocks', 'Misc', 'Sort'].forEach((label, index) => {
      const color = index === 0 ? UI_THEME.css.accent : UI_THEME.css.muted;
      const x = layout.tabs.x + scaleX(24 + index * 128, layout.width);
      this.add.text(x, layout.tabs.y + scaleY(18, layout.height), label, textStyle(17, color));
    });
  }

  private drawSideSlots(layout: StarterSelectLayout): void {
    this.add.text(layout.side.x + scaleX(16, layout.width), layout.side.y + scaleY(92, layout.height), 'Party', textStyle(20, UI_THEME.css.white));
    for (let i = 0; i < 6; i += 1) {
      const y = layout.side.y + scaleY(128 + i * 64, layout.height);
      const isStarter = i === 0;
      this.add.rectangle(layout.side.x + scaleX(16, layout.width), y, layout.side.width - scaleX(32, layout.width), scaleY(48, layout.height), isStarter ? UI_THEME.selection.fill : UI_THEME.colors.bg, 1)
        .setOrigin(0, 0)
        .setStrokeStyle(1, isStarter ? UI_THEME.selection.border : UI_THEME.colors.border);
      this.add.text(layout.side.x + scaleX(32, layout.width), y + scaleY(16, layout.height), isStarter ? 'Starter' : 'Empty', textStyle(14, isStarter ? UI_THEME.css.accent : UI_THEME.css.muted));
    }
  }

  private drawPanel(x: number, y: number, width: number, height: number, stroke: number): void {
    new PixelPanel(this, x, y, width, height, { fill: UI_THEME.colors.bgAlt, stroke });
  }

  private createStarterGrid(layout: StarterSelectLayout): void {
    const usedColumns = Math.min(layout.card.columns, starterIds.length);
    const usedRows = Math.ceil(starterIds.length / layout.card.columns);
    const gridWidth = usedColumns * layout.card.width + (usedColumns - 1) * layout.card.gap;
    const gridHeight = usedRows * layout.card.height + (usedRows - 1) * layout.card.gap;
    const startX = layout.grid.x + Math.max(scaleX(16, layout.width), Math.floor((layout.grid.width - gridWidth) / 2));
    const startY = layout.grid.y + scaleY(96, layout.height);
    this.cards = starterIds.map((starterId, index) => {
      const creature = getCreature(starterId);
      const column = index % layout.card.columns;
      const row = Math.floor(index / layout.card.columns);
      const x = startX + column * (layout.card.width + layout.card.gap);
      const y = startY + row * (layout.card.height + layout.card.gap);
      return this.createStarterCard(creature, x, y, layout.card.width, layout.card.height);
    });
  }

  private createStarterCard(creature: CreatureDefinition, x: number, y: number, width: number, height: number): StarterCard {
    const save = GameState.get().save;
    const unlockInfo = this.meta.getStarterUnlockInfo(save, creature.id);
    const background = this.add.rectangle(0, 0, width, height, UI_THEME.colors.panelDark, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, UI_THEME.colors.border);
    const selection = this.add.rectangle(0, 0, width, height, UI_THEME.selection.fill, 0.18)
      .setOrigin(0, 0)
      .setStrokeStyle(1, UI_THEME.colors.border);
    const iconKey = resolveCreatureIconKey(this, creature.id);
    if (!this.textures.exists(getCreatureIconKey(creature.id))) {
      logMissingAsset(getCreatureIconPath(creature.id));
    }
    const sprite = renderIconSafe(this, iconKey, (width - CARD_ICON_BOX.width) / 2, height / 2 - 12 - CARD_ICON_BOX.height / 2, {
      boxWidth: CARD_ICON_BOX.width,
      boxHeight: CARD_ICON_BOX.height,
      maxWidth: CARD_ICON_BOX.width,
      maxHeight: CARD_ICON_BOX.height,
      missingAssetPath: getCreatureIconPath(creature.id),
    });
    const name = this.add.text(8, height - 30, this.fitLabel(creature.name, 14), textStyle(12, UI_THEME.css.muted, {
      align: 'center',
      fixedWidth: width - 16,
    }));
    const lockText = unlockInfo.unlocked
      ? ''
      : 'LOCK';
    const locked = this.add.text(4, 6, lockText, textStyle(10, UI_THEME.css.danger, {
      fixedWidth: width - 8,
      align: 'right',
    }));
    const cursor = createPixelCursor(this, 10, height - 20);
    const container = this.add.container(x, y, [
      background,
      selection,
      sprite,
      cursor,
      name,
      locked,
    ]);

    return { id: creature.id, background, selection, cursor };
  }

  private selectStarter(starterId: string): void {
    const save = GameState.get().save;
    const unlockInfo = this.meta.getStarterUnlockInfo(save, starterId);
    if (!unlockInfo.unlocked) {
      if (this.meta.buyStarter(save, starterId)) {
        GameState.get().persist();
      } else {
        return;
      }
    }
    this.selectedStarterId = starterId;
    this.selectedStarterIndex = Math.max(0, starterIds.indexOf(starterId));
    this.updateSelectedCards();
    this.renderPreview();
  }

  private registerKeyboard(): void {
    this.input.keyboard?.on('keydown', this.handleKeyboard, this);
  }

  private handleKeyboard(event: KeyboardEvent): void {
    if (event.code === 'Escape' || event.code === 'Backspace') {
      playSoundHook(this, 'ui_back');
      this.scene.start('MainMenuScene');
      return;
    }
    if (event.code === 'Enter' || event.code === 'Space') {
      playSoundHook(this, 'ui_confirm');
      this.confirmStarter();
      return;
    }
    const delta = this.navigationDelta(event);
    if (delta !== 0) {
      this.moveStarterSelection(delta);
    }
  }

  private navigationDelta(event: KeyboardEvent): number {
    const columns = this.layout?.card.columns ?? 3;
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') return -1;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') return 1;
    if (event.code === 'ArrowUp' || event.code === 'KeyW') return -columns;
    if (event.code === 'ArrowDown' || event.code === 'KeyS') return columns;
    return 0;
  }

  private moveStarterSelection(delta: number): void {
    const total = starterIds.length;
    if (total === 0) return;
    this.selectedStarterIndex = Phaser.Math.Wrap(this.selectedStarterIndex + delta, 0, total);
    playSoundHook(this, 'ui_move');
    this.selectStarter(starterIds[this.selectedStarterIndex]);
  }

  private renderPreview(): void {
    this.previewContainer?.destroy(true);
    if (!this.layout) return;
    const layout = this.layout;

    const creature = getCreature(this.selectedStarterId);
    const save = GameState.get().save;
    const unlockInfo = this.meta.getStarterUnlockInfo(save, creature.id);
    const preview = layout.preview;
    const panel = new PixelPanel(this, 0, 0, preview.width, preview.height, { fill: UI_THEME.colors.panel, stroke: UI_THEME.colors.border });
    const spriteBox = {
      x: preview.width / 2,
      y: scaleY(128, layout.height),
      width: PREVIEW_SPRITE_BOX.width,
      height: PREVIEW_SPRITE_BOX.height,
    };
    const creaturePreview = new CreaturePreview(this, spriteBox.x, spriteBox.y, creature.id, {
      maxWidth: spriteBox.width,
      maxHeight: spriteBox.height,
      stageWidth: scaleX(336, layout.width),
      stageHeight: scaleY(248, layout.height),
      maxScale: PREVIEW_SPRITE_BOX.maxScale,
      mask: true,
      idleBob: true,
    });
    const number = this.add.text(scaleX(24, layout.width), scaleY(252, layout.height), `No. ---`, textStyle(14, UI_THEME.css.muted));
    const name = this.add.text(scaleX(24, layout.width), scaleY(276, layout.height), creature.name, textStyle(creature.name.length > 24 ? 20 : 24, UI_THEME.css.white, {
      fixedWidth: preview.width - 52,
    }));
    const badges = creature.types.map((type, index) => new TypeBadge(this, scaleX(24 + index * 104, layout.width), scaleY(320, layout.height), type).container);
    const classification = creature.classification === 'normal'
      ? undefined
      : new ClassificationBadge(this, scaleX(24 + creature.types.length * 104 + 8, layout.width), scaleY(320, layout.height), creature.classification).container;
    const descriptionText = unlockInfo.unlocked
      ? creature.description
      : `${creature.description}\nUnlock: reach Wave ${unlockInfo.bestWave ?? '?'} and spend ${unlockInfo.cost ?? 0} permanent coins.`;
    const description = this.add.text(scaleX(24, layout.width), scaleY(368, layout.height), descriptionText, textStyle(15, unlockInfo.unlocked ? UI_THEME.css.text : UI_THEME.css.danger, {
      wordWrap: { width: preview.width - scaleX(48, layout.width) },
      lineSpacing: 2,
    }));
    const ability = this.add.text(scaleX(24, layout.width), scaleY(440, layout.height), `Growth: ${creature.growthRate}   Ability: TBD`, textStyle(14, UI_THEME.css.muted, {
      fixedWidth: preview.width - 52,
    }));
    const statBars = [
      new StatBar(this, scaleX(24, layout.width), scaleY(480, layout.height), 'HP', creature.baseStats.hp, 120, 190).container,
      new StatBar(this, scaleX(24, layout.width), scaleY(512, layout.height), 'ATK', creature.baseStats.attack, 120, 190).container,
      new StatBar(this, scaleX(24, layout.width), scaleY(544, layout.height), 'DEF', creature.baseStats.defense, 120, 190).container,
      new StatBar(this, scaleX(256, layout.width), scaleY(480, layout.height), 'SPA', creature.baseStats.specialAttack, 120, 190).container,
      new StatBar(this, scaleX(256, layout.width), scaleY(512, layout.height), 'SDF', creature.baseStats.specialDefense, 120, 190).container,
      new StatBar(this, scaleX(256, layout.width), scaleY(544, layout.height), 'SPD', creature.baseStats.speed, 120, 190).container,
    ];
    const moves = this.add.text(scaleX(24, layout.width), scaleY(600, layout.height), `Moves: ${creature.levelUpMoves.slice(0, 4).map((entry) => entry.moveId).join(' / ')}`, textStyle(13, UI_THEME.css.muted, {
      wordWrap: { width: preview.width - scaleX(48, layout.width) },
    }));
    const evolutionHeader = new SectionHeader(this, scaleX(24, layout.width), preview.height - scaleY(136, layout.height), 'Evolution Line', preview.width - scaleX(48, layout.width)).container;
    const evolution = this.add.text(scaleX(24, layout.width), preview.height - scaleY(80, layout.height), this.formatEvolutionLine(creature), textStyle(15, UI_THEME.css.white, {
      wordWrap: { width: preview.width - 52 },
    }));

    this.previewContainer = this.add.container(preview.x, preview.y, [
      panel.container,
      creaturePreview.container,
      number,
      name,
      ...badges,
      ...(classification ? [classification] : []),
      description,
      ability,
      ...statBars,
      moves,
      evolutionHeader,
      evolution,
    ]);

  }

  private updateSelectedCards(): void {
    this.cards.forEach((card) => {
      if (card.id === this.selectedStarterId) {
        this.tweens.killTweensOf(card.selection);
        card.background.setFillStyle(UI_THEME.selection.fill);
        card.background.setStrokeStyle(2, UI_THEME.selection.border, 1);
        card.selection.setAlpha(1);
        card.selection.setStrokeStyle(2, UI_THEME.selection.border, 1);
        card.cursor.setVisible(true);
      } else {
        this.tweens.killTweensOf(card.selection);
        card.selection.setAlpha(1);
        card.selection.setStrokeStyle(1, UI_THEME.colors.border, 1);
        card.background.setFillStyle(UI_THEME.colors.panelDark);
        card.background.setStrokeStyle(1, UI_THEME.colors.border);
        card.cursor.setVisible(false);
      }
    });
  }

  private confirmStarter(): void {
    if (!GameState.get().save.unlockedStarters.includes(this.selectedStarterId)) return;
    const starter = this.experience.createCreature(this.selectedStarterId, 5);
    this.meta.applyBonuses(starter, GameState.get().save);
    GameState.get().startRun({
      starterId: this.selectedStarterId,
      party: [starter],
      wave: 1,
      currency: 0,
      seed: Date.now().toString(36),
      modifiers: { typeBoosts: {} },
    });
    this.scene.start('BattleScene');
  }

  private createButton(rect: RectLayout, label: string, onClick: () => void, fill: number): void {
    new PixelButton(this, rect.x, rect.y, rect.width, rect.height, label, onClick, {
      fill,
      debugLabel: `starter-button:${label}`,
      fontSize: 21,
    });
  }

  private formatEvolutionLine(creature: CreatureDefinition): string {
    return creature.evolutionLine.map((id) => getCreature(id).name).join(' > ');
  }

  private fitLabel(label: string, maxLength: number): string {
    return label.length > maxLength ? `${label.slice(0, Math.max(0, maxLength - 1))}...` : label;
  }

}
