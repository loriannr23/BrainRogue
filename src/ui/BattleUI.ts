import Phaser from 'phaser';
import { getMove } from '../data/moves';
import { resolveCreatureIconKey } from '../systems/assets/CreatureAssetRegistry';
import { POKEROGUE_UI } from '../systems/assets/PokeRogueUiAssetRegistry';
import { typeIconKey } from '../systems/assets/SpriteSystem';
import { GameState } from '../systems/GameState';
import { BattleState } from '../types/battle';
import { playSoundHook } from '../utils/soundHooks';
import { BattleLog } from './BattleLog';
import { HealthBar } from './HealthBar';
import { createPokeRogueText } from './pokerogueText';
import { UI_THEME } from './theme';

export interface RectLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BattleUILayout {
  waveText: { x: number; y: number };
  playerHp: RectLayout;
  enemyHp: RectLayout;
  moveGrid: RectLayout;
  log: RectLayout;
}

type BattleCommandMode = 'actions' | 'moves' | 'ball' | 'creature' | 'run';

const ACTIONS: Array<{ label: string; mode: BattleCommandMode }> = [
  { label: 'Fight', mode: 'moves' },
  { label: 'Ball', mode: 'ball' },
  { label: 'Creature', mode: 'creature' },
  { label: 'Run', mode: 'run' },
];

const PREFERRED_MOVE_IDS = ['echo_slap', 'quick_yell', 'bonk', 'aqua_skid', 'metal_clang'];
const BASE_WIDTH = 320;
const BASE_HEIGHT = 180;

export class BattleUI {
  readonly container: Phaser.GameObjects.Container;
  private readonly playerHp: HealthBar;
  private readonly enemyHp: HealthBar;
  private readonly waveText: Phaser.GameObjects.Text;
  private readonly battleLog: BattleLog;
  private readonly statusText: Phaser.GameObjects.Text;
  private commandObjects: Phaser.GameObjects.GameObject[] = [];
  private commandCenters: Array<{ x: number; y: number }> = [];
  private moveCenters: Array<{ x: number; y: number }> = [];
  private debugMoveTargets: Array<{ moveId: string; x: number; y: number }> = [];
  private mode: BattleCommandMode = 'actions';
  private inputEnabled = true;
  private actionIndex = 0;
  private moveIndex = 0;
  private runConfirmIndex = 1;
  private readonly uiScale: number;
  private readonly uiOffsetX: number;
  private readonly uiOffsetY: number;

  constructor(
    private readonly scene: Phaser.Scene,
    _layout: BattleUILayout,
    private readonly onMove: (moveId: string) => void,
  ) {
    this.uiScale = Math.max(1, Math.floor(Math.min(scene.scale.width / BASE_WIDTH, scene.scale.height / BASE_HEIGHT)));
    this.uiOffsetX = Math.floor((scene.scale.width - BASE_WIDTH * this.uiScale) / 2);
    this.uiOffsetY = Math.floor((scene.scale.height - BASE_HEIGHT * this.uiScale) / 2);

    this.playerHp = new HealthBar(scene, 0, 0, 0, 'Player', 'player');
    this.enemyHp = new HealthBar(scene, 0, 0, 0, 'Enemy', 'enemy');
    this.waveText = createPokeRogueText(scene, 160, -176, '', {
      align: 'center',
      fixedWidth: 600,
      fontSize: '72px',
      color: UI_THEME.css.white,
    }).setScale(1 / 12).setOrigin(0.5, 0);
    this.statusText = createPokeRogueText(scene, 12, -50, '', {
      fontSize: '72px',
      color: UI_THEME.css.muted,
      fixedWidth: 180,
    }).setScale(1 / 12).setOrigin(0, 0);
    this.battleLog = new BattleLog(scene, 0, 0, 0, 0, 2);
    this.container = scene.add.container(this.uiOffsetX, this.uiOffsetY + BASE_HEIGHT * this.uiScale, [
      this.playerHp.container,
      this.enemyHp.container,
      this.waveText,
      this.battleLog.container,
      this.statusText,
    ]);
    this.container.setScale(this.uiScale);
  }

  render(state: BattleState): void {
    this.renderVitals(state);
    this.battleLog.render(state.log.slice(-1));
    this.renderCommandArea(state);
  }

  renderVitals(state: BattleState): void {
    this.playerHp.setLabel(`${state.player.name} Lv.${state.player.level}`);
    this.enemyHp.setLabel(`${state.enemy.name} Lv.${state.enemy.level}`);
    this.playerHp.setValue(state.player.currentHp, state.player.stats.hp);
    this.enemyHp.setValue(state.enemy.currentHp, state.enemy.stats.hp);
    this.waveText.setText(`Wave ${state.wave}${state.isBoss ? ' BOSS' : ''}  Turn ${state.turn}`);
    this.statusText.setText(`P:${this.statusLabel(state.player)}  E:${this.statusLabel(state.enemy)}`);
  }

  renderHpSnapshot(state: BattleState, playerHp: number, enemyHp: number): Promise<void> {
    this.playerHp.setLabel(`${state.player.name} Lv.${state.player.level}`);
    this.enemyHp.setLabel(`${state.enemy.name} Lv.${state.enemy.level}`);
    const hpAnimations = [
      this.playerHp.setValue(playerHp, state.player.stats.hp),
      this.enemyHp.setValue(enemyHp, state.enemy.stats.hp),
    ];
    this.waveText.setText(`Wave ${state.wave}${state.isBoss ? ' BOSS' : ''}  Turn ${state.turn}`);
    this.statusText.setText(`P:${this.statusLabel(state.player)}  E:${this.statusLabel(state.enemy)}`);
    return Promise.all(hpAnimations).then(() => undefined);
  }

  renderLog(lines: string[]): void {
    this.battleLog.render(lines);
  }

  hideCommandMenus(): void {
    this.clearCommandArea();
  }

  setInputEnabled(enabled: boolean): void {
    this.inputEnabled = enabled;
  }

  showActionMenu(): void {
    this.mode = 'actions';
    this.actionIndex = 0;
  }

  getMoveButtonCenters(): Array<{ x: number; y: number }> {
    if (this.moveCenters.length > 0) return this.moveCenters;
    if (this.mode !== 'actions') return [];
    const [fightButton] = this.commandCenters;
    return fightButton ? [fightButton] : [];
  }

  getDebugMoveTargets(): Array<{ moveId: string; x: number; y: number }> {
    return this.debugMoveTargets;
  }

  getActionButtonCenters(): Array<{ x: number; y: number }> {
    return [...this.commandCenters];
  }

  destroy(): void {
    this.clearCommandArea();
    this.container.destroy(true);
  }

  handleKeyboard(event: KeyboardEvent, state: BattleState): boolean {
    if (!this.inputEnabled || state.winner) return false;
    if (this.mode === 'actions') return this.handleActionKeyboard(event, state);
    if (this.mode === 'moves') return this.handleMoveKeyboard(event, state);
    if (this.mode === 'run') return this.handleRunKeyboard(event, state);
    if (this.mode === 'ball' || this.mode === 'creature') {
      if (this.isBack(event)) {
        playSoundHook(this.scene, 'ui_back');
        this.mode = 'actions';
        this.render(state);
        return true;
      }
    }
    return false;
  }

  private renderCommandArea(state: BattleState): void {
    if (state.winner) {
      this.clearCommandArea();
      return;
    }
    if (this.mode === 'moves') {
      this.renderMoves(state);
      return;
    }
    if (this.mode === 'run') {
      this.renderRunConfirm();
      return;
    }
    if (this.mode === 'ball' || this.mode === 'creature') {
      this.renderActionMenu(false);
      if (this.mode === 'ball') {
        this.renderBallPopup();
      } else {
        this.renderCreatureOverlay(state);
      }
      return;
    }
    this.renderActionMenu();
  }

  private renderActionMenu(setMode = true): void {
    this.clearCommandArea();
    if (setMode) {
      this.mode = 'actions';
    }
    const window = this.addWindow(202, 0, 118, 48);
    window.setOrigin(0, 1);
    this.commandObjects.push(window);
    this.container.add(window);
    this.commandCenters = [];

    ACTIONS.forEach((action, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 217 + col * 55.8;
      const y = -38.7 + row * 16;
      const selected = index === this.actionIndex;
      this.commandCenters.push(this.toScreen(x + 20, y + 8));
      const label = createPokeRogueText(this.scene, x, y, action.label, {
        color: selected && this.inputEnabled ? UI_THEME.css.accent : UI_THEME.css.white,
      });
      this.commandObjects.push(label);
      this.container.add(label);
    });

    const cursorCol = this.actionIndex % 2;
    const cursorRow = Math.floor(this.actionIndex / 2);
    const cursor = this.scene.add.image(217 - 5 + cursorCol * 56, -38.7 + 8 + cursorRow * 16, POKEROGUE_UI.cursor);
    this.commandObjects.push(cursor);
    this.container.add(cursor);
  }

  private renderMoves(state: BattleState): void {
    this.clearCommandArea();
    const movesWindow = this.addWindow(0, 0, 243, 48);
    movesWindow.setOrigin(0, 1);
    const detailsWindow = this.addWindow(240, 0, 80, 48);
    detailsWindow.setOrigin(0, 1);
    this.commandObjects.push(movesWindow, detailsWindow);
    this.container.add([movesWindow, detailsWindow]);

    this.moveCenters = [];
    this.debugMoveTargets = [];
    this.moveIndex = Phaser.Math.Clamp(this.moveIndex, 0, Math.max(0, state.player.moves.length - 1));
    state.player.moves.forEach((slot, index) => {
      const move = getMove(slot.moveId);
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 18 + col * 114;
      const y = -38.7 + row * 16;
      const enabled = this.inputEnabled && slot.currentPp > 0 && !state.winner;
      const selected = this.moveIndex === index;
      const center = this.toScreen(x + 42, y + 8);
      if (enabled) {
        this.moveCenters.push(center);
        this.debugMoveTargets.push({ moveId: slot.moveId, ...center });
      }
      const moveText = createPokeRogueText(this.scene, x, y, this.fitLabel(move.name, 16), {
        color: selected && enabled ? UI_THEME.css.accent : enabled ? UI_THEME.css.white : UI_THEME.css.muted,
        fixedWidth: 552,
      });
      this.commandObjects.push(moveText);
      this.container.add(moveText);
    });

    const cursor = this.scene.add.image(
      13 + (this.moveIndex % 2) * 114,
      -31 + Math.floor(this.moveIndex / 2) * 15,
      POKEROGUE_UI.cursor,
    );
    this.commandObjects.push(cursor);
    this.container.add(cursor);

    const selectedSlot = state.player.moves[this.moveIndex];
    if (selectedSlot) {
      const move = getMove(selectedSlot.moveId);
      const pp = createPokeRogueText(this.scene, 252, -40, `PP ${selectedSlot.currentPp}/${selectedSlot.maxPp}`, { fontSize: '72px', color: UI_THEME.css.white }).setScale(1 / 12);
      const typeBadge = this.scene.add.rectangle(250, -30, 48, 10, UI_THEME.colors.bg, 0.95)
        .setOrigin(0, 0)
        .setStrokeStyle(1, UI_THEME.colors.accent);
      const iconKey = typeIconKey(move.type);
      const typeObjects: Phaser.GameObjects.GameObject[] = [typeBadge];
      if (this.scene.textures.exists(iconKey)) {
        this.scene.textures.get(iconKey).setFilter(Phaser.Textures.FilterMode.NEAREST);
        const icon = this.scene.add.image(255, -25, iconKey).setOrigin(0.5, 0.5);
        icon.setDisplaySize(7, 7);
        typeObjects.push(icon);
      }
      const type = createPokeRogueText(this.scene, 262, -30, move.type.toUpperCase(), { fontSize: '72px', color: UI_THEME.css.accent }).setScale(1 / 12);
      const power = createPokeRogueText(this.scene, 252, -18, `PWR ${move.power}`, { fontSize: '72px', color: UI_THEME.css.white }).setScale(1 / 12);
      const acc = createPokeRogueText(this.scene, 252, -8, `ACC ${move.accuracy}`, { fontSize: '72px', color: UI_THEME.css.white }).setScale(1 / 12);
      this.commandObjects.push(pp, ...typeObjects, type, power, acc);
      this.container.add([pp, ...typeObjects, type, power, acc]);
    }
  }

  private renderBallPopup(): void {
    const window = this.addWindow(196, -52, 118, 100);
    window.setOrigin(0, 1);
    const rows: Phaser.GameObjects.GameObject[] = [];
    const cursorX = 205;
    const countX = 218;
    const nameX = 248;
    [
      { name: 'Brain Ball', count: 'x0', y: -142, color: UI_THEME.css.white },
      { name: 'Great Ball', count: 'x0', y: -126, color: UI_THEME.css.muted },
      { name: 'Ultra Ball', count: 'x0', y: -110, color: UI_THEME.css.muted },
      { name: 'Rogue Ball', count: 'x0', y: -94, color: UI_THEME.css.muted },
      { name: 'Master Ball', count: 'x0', y: -78, color: UI_THEME.css.muted },
      { name: 'Cancel', count: '', y: -60, color: UI_THEME.css.white },
    ].forEach((row) => {
      const count = createPokeRogueText(this.scene, countX, row.y, row.count, { fontSize: '78px', color: row.color, fixedWidth: 96 }).setScale(1 / 6);
      const name = createPokeRogueText(this.scene, nameX, row.y, row.name, { fontSize: '78px', color: row.color, fixedWidth: 360 }).setScale(1 / 6);
      rows.push(count, name);
    });
    const cursor = this.scene.add.image(cursorX, -138, POKEROGUE_UI.cursor);
    this.commandObjects.push(window, cursor, ...rows);
    this.container.add([window, cursor, ...rows]);
  }

  private renderCreatureOverlay(state: BattleState): void {
    const shade = this.scene.add.rectangle(0, -180, 320, 180, 0x000000, 0.54).setOrigin(0, 0);
    const window = this.addWindow(22, -162, 276, 126);
    window.setOrigin(0, 0);
    const title = createPokeRogueText(this.scene, 36, -150, 'Party', { color: UI_THEME.css.accent });
    const hint = createPokeRogueText(this.scene, 36, -50, 'Esc / Backspace: back', { fontSize: '72px', color: UI_THEME.css.muted }).setScale(1 / 12);
    const slotObjects: Phaser.GameObjects.GameObject[] = [];
    for (let index = 0; index < 6; index += 1) {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 36 + col * 132;
      const y = -132 + row * 26;
      const filled = index === 0;
      const slot = this.addWindow(x, y, 118, 20);
      slot.setOrigin(0, 0);
      slot.setAlpha(filled ? 1 : 0.72);
      const name = filled ? this.fitLabel(state.player.name, 18) : 'Empty';
      const color = filled ? UI_THEME.css.white : '#7f91ad';
      const iconBox = this.scene.add.rectangle(x + 11, y + 10, 14, 14, UI_THEME.colors.bg, filled ? 0.85 : 0.45)
        .setOrigin(0.5, 0.5)
        .setStrokeStyle(1, filled ? UI_THEME.colors.accent : UI_THEME.colors.border, filled ? 0.8 : 0.35);
      const label = createPokeRogueText(this.scene, x + 22, y + 3, name, { fontSize: '72px', color }).setScale(1 / 12);
      slotObjects.push(slot, iconBox, label);
      if (filled) {
        const icon = this.scene.add.image(x + 11, y + 10, resolveCreatureIconKey(this.scene, state.player.definitionId)).setOrigin(0.5, 0.5);
        icon.setDisplaySize(12, 12);
        const hpBack = this.scene.add.rectangle(x + 22, y + 14, 58, 3, UI_THEME.colors.bg, 1).setOrigin(0, 0);
        const hpRatio = Phaser.Math.Clamp(state.player.currentHp / Math.max(1, state.player.stats.hp), 0, 1);
        const hpFill = this.scene.add.rectangle(x + 22, y + 14, 58 * hpRatio, 3, UI_THEME.colors.accent, 1).setOrigin(0, 0);
        const hp = createPokeRogueText(this.scene, x + 108, y + 11, `${state.player.currentHp}/${state.player.stats.hp}`, { fontSize: '60px', color: UI_THEME.css.accent, align: 'right', fixedWidth: 168 }).setScale(1 / 12).setOrigin(1, 0);
        slotObjects.push(icon, hpBack, hpFill, hp);
      }
    }
    this.commandObjects.push(shade, window, title, hint, ...slotObjects);
    this.container.add([shade, window, title, hint, ...slotObjects]);
  }

  private renderRunConfirm(): void {
    this.clearCommandArea();
    const window = this.addWindow(202, 0, 118, 48);
    window.setOrigin(0, 1);
    const title = createPokeRogueText(this.scene, 212, -39, 'End this run?', { color: UI_THEME.css.accent });
    const yesSelected = this.runConfirmIndex === 0;
    const yes = createPokeRogueText(this.scene, 224, -23, 'Yes', { color: yesSelected ? UI_THEME.css.accent : UI_THEME.css.white });
    const no = createPokeRogueText(this.scene, 268, -23, 'No', { color: !yesSelected ? UI_THEME.css.accent : UI_THEME.css.white });
    const cursor = this.scene.add.image(yesSelected ? 214 : 258, -19, POKEROGUE_UI.cursor);
    this.commandObjects.push(window, title, yes, no, cursor);
    this.container.add(this.commandObjects);
  }

  private addWindow(x: number, y: number, width: number, height: number): Phaser.GameObjects.NineSlice {
    const window = this.scene.add.nineslice(x, y, POKEROGUE_UI.window, undefined, width, height, 8, 8, 8, 8);
    return window;
  }

  private handleActionKeyboard(event: KeyboardEvent, state: BattleState): boolean {
    const delta = this.gridDelta(event);
    if (delta !== 0) {
      this.actionIndex = Phaser.Math.Wrap(this.actionIndex + delta, 0, ACTIONS.length);
      playSoundHook(this.scene, 'ui_move');
      this.render(state);
      return true;
    }
    if (this.isConfirm(event)) {
      const action = ACTIONS[this.actionIndex];
      if (!action) return false;
      playSoundHook(this.scene, 'ui_confirm');
      this.mode = action.mode;
      if (this.mode === 'moves') {
        this.moveIndex = this.defaultMoveIndex(state);
      } else if (this.mode === 'run') {
        this.runConfirmIndex = 1;
      }
      this.render(state);
      return true;
    }
    return false;
  }

  private handleMoveKeyboard(event: KeyboardEvent, state: BattleState): boolean {
    if (this.isBack(event)) {
      playSoundHook(this.scene, 'ui_back');
      this.mode = 'actions';
      this.render(state);
      return true;
    }
    const delta = this.moveMenuDelta(event);
    if (delta !== 0) {
      this.moveIndex = Phaser.Math.Clamp(this.moveIndex + delta, 0, Math.max(0, state.player.moves.length - 1));
      playSoundHook(this.scene, 'ui_move');
      this.render(state);
      return true;
    }
    if (this.isConfirm(event)) {
      const slot = state.player.moves[this.moveIndex];
      if (!slot || slot.currentPp <= 0) return true;
      this.onMove(slot.moveId);
      return true;
    }
    return false;
  }

  private handleRunKeyboard(event: KeyboardEvent, state: BattleState): boolean {
    if (this.isBack(event)) {
      playSoundHook(this.scene, 'ui_back');
      this.mode = 'actions';
      this.render(state);
      return true;
    }
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      this.runConfirmIndex = 0;
      playSoundHook(this.scene, 'ui_move');
      this.render(state);
      return true;
    }
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      this.runConfirmIndex = 1;
      playSoundHook(this.scene, 'ui_move');
      this.render(state);
      return true;
    }
    if (this.isConfirm(event)) {
      if (this.runConfirmIndex === 0) {
        GameState.get().clearRun();
        this.scene.scene.start('MainMenuScene');
      } else {
        playSoundHook(this.scene, 'ui_back');
        this.mode = 'actions';
        this.render(state);
      }
      return true;
    }
    return false;
  }

  private gridDelta(event: KeyboardEvent): number {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') return -1;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') return 1;
    if (event.code === 'ArrowUp' || event.code === 'KeyW') return -2;
    if (event.code === 'ArrowDown' || event.code === 'KeyS') return 2;
    return 0;
  }

  private moveMenuDelta(event: KeyboardEvent): number {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') return -1;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') return 1;
    if (event.code === 'ArrowUp' || event.code === 'KeyW') return -2;
    if (event.code === 'ArrowDown' || event.code === 'KeyS') return 2;
    return 0;
  }

  private isConfirm(event: KeyboardEvent): boolean {
    return event.code === 'Enter' || event.code === 'Space';
  }

  private isBack(event: KeyboardEvent): boolean {
    return event.code === 'Escape' || event.code === 'Backspace';
  }

  private defaultMoveIndex(state: BattleState): number {
    const preferred = PREFERRED_MOVE_IDS
      .map((moveId) => state.player.moves.findIndex((slot) => slot.moveId === moveId && slot.currentPp > 0))
      .find((index) => index !== -1);
    if (preferred !== undefined) return preferred;
    const firstUsable = state.player.moves.findIndex((slot) => slot.currentPp > 0);
    return firstUsable === -1 ? 0 : firstUsable;
  }

  private statusLabel(creature: BattleState['player']): string {
    const statusLabels: Record<string, string> = {
      burn: 'BRN',
      poison: 'PSN',
      paralyze: 'PAR',
      rooted: 'ROOT',
      confuse: 'CONF',
    };
    const statuses = [
      creature.status ? statusLabels[creature.status] ?? creature.status : undefined,
      ...(creature.battleStatuses?.map((status) => statusLabels[status.id] ?? status.id) ?? []),
    ].filter(Boolean);
    return statuses.length > 0 ? statuses.join(',') : 'ok';
  }

  private fitLabel(label: string, maxLength: number): string {
    return label.length > maxLength ? `${label.slice(0, Math.max(0, maxLength - 1))}.` : label;
  }

  private toScreen(x: number, y: number): { x: number; y: number } {
    return {
      x: this.uiOffsetX + x * this.uiScale,
      y: this.uiOffsetY + (BASE_HEIGHT + y) * this.uiScale,
    };
  }

  private clearCommandArea(): void {
    this.commandObjects.forEach((object) => object.destroy());
    this.commandObjects = [];
    this.commandCenters = [];
    this.moveCenters = [];
    this.debugMoveTargets = [];
  }
}
