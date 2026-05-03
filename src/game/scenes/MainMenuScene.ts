import Phaser from 'phaser';
import { GameState } from '../../systems/GameState';
import { AudioManager } from '../../systems/audio/AudioManager';
import { MENU_BACKGROUND_ASSETS } from '../../systems/assets/UiAssetRegistry';
import { installPointerDebug } from '../../utils/inputDebug';
import { scaleRect, scaleX, scaleY } from '../../utils/layoutScale';
import { PixelPanel } from '../../ui/PixelPanel';
import { textStyle, UI_THEME } from '../../ui/theme';

const RELEASE_VERSION = 'BrainRogue v0.1.0-local';
type MenuEntry = { label: string; action: () => void; disabled: boolean };

export class MainMenuScene extends Phaser.Scene {
  private modal?: Phaser.GameObjects.Container;
  private entries: MenuEntry[] = [];
  private entryLabels: Phaser.GameObjects.Text[] = [];
  private selectionBars: Phaser.GameObjects.Rectangle[] = [];
  private selectedIndex = 0;

  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    this.modal = undefined;
    this.entries = [];
    this.entryLabels = [];
    this.selectionBars = [];
    const { width, height } = this.scale;
    const state = GameState.get();
    installPointerDebug(this);

    this.drawBackground(width, height);
    const titleY = scaleY(104, height);
    this.add.text(width / 2 + 3, titleY + 4, 'BrainRogue', textStyle(78, UI_THEME.css.bg, {
      align: 'center',
      fixedWidth: scaleX(760, width),
    })).setOrigin(0.5).setAlpha(0.82);
    this.add.text(width / 2, titleY + 2, 'BrainRogue', textStyle(78, UI_THEME.css.accent, {
      align: 'center',
      fixedWidth: scaleX(760, width),
    })).setOrigin(0.5).setAlpha(0.22);
    const title = this.add.text(width / 2, titleY, 'BrainRogue', textStyle(78, UI_THEME.css.white, {
      align: 'center',
      fixedWidth: scaleX(760, width),
    })).setOrigin(0.5);
    this.add.text(width / 2, scaleY(166, height), RELEASE_VERSION, textStyle(14, UI_THEME.css.muted, {
      align: 'center',
      fixedWidth: scaleX(320, width),
    })).setOrigin(0.5);

    this.drawMenuBox(state, width, height);
    this.registerKeyboard();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.handleKeyboard, this);
    });
  }

  private drawMenuBox(state: ReturnType<typeof GameState.get>, width: number, height: number): void {
    const menu = scaleRect({ x: 1160, y: 392, width: 392, height: 376 }, width, height);
    const itemHeight = scaleY(56, height);
    this.entries = [
      { label: 'Continue', action: () => state.save.currentRun && this.scene.start('BattleScene'), disabled: !state.save.currentRun },
      { label: 'New Game', action: () => this.scene.start('StarterSelectScene'), disabled: false },
      { label: 'Load Game', action: () => this.showInfoModal('Load Game', state.save.currentRun ? 'A run save exists. Use Continue to resume it.' : 'No saved run found.'), disabled: false },
      { label: 'Run History', action: () => this.showInfoModal('Run History', `Best Wave: ${state.save.bestWave}\nRuns Played: ${state.save.runsPlayed}`), disabled: false },
      { label: 'Settings', action: () => this.showSettingsModal(state), disabled: false },
    ];
    const shadow = this.add.rectangle(menu.x + 8, menu.y + 8, menu.width, menu.height, UI_THEME.colors.bg, 0.52)
      .setOrigin(0, 0);
    new PixelPanel(this, menu.x, menu.y, menu.width, menu.height, { stroke: UI_THEME.colors.border, fill: UI_THEME.colors.bgAlt });
    this.selectedIndex = this.firstEnabledIndex();

    this.entries.forEach((entry, index) => {
      const y = menu.y + scaleY(44, height) + index * itemHeight;
      const bar = this.add.rectangle(menu.x + scaleX(18, width), y - itemHeight / 2 + scaleY(6, height), menu.width - scaleX(36, width), itemHeight - scaleY(12, height), UI_THEME.selection.fill, 1)
        .setOrigin(0, 0)
        .setStrokeStyle(1, UI_THEME.selection.border, 1)
        .setVisible(false);
      this.selectionBars.push(bar);
      const color = entry.disabled ? UI_THEME.css.muted : UI_THEME.css.white;
      const label = this.add.text(menu.x + scaleX(42, width), y, entry.label, textStyle(22, color, {
        fixedWidth: menu.width - scaleX(84, width),
      })).setOrigin(0, 0.5);
      this.entryLabels.push(label);
    });
    this.updateSelection();
  }

  private showSettingsModal(state: ReturnType<typeof GameState.get>): void {
    const settings = state.save.settings;
    this.showInfoModal(
      'Settings',
      [
        `Master Volume: ${Math.round((settings.masterVolume ?? 1) * 100)}%`,
        `SFX Volume: ${Math.round((settings.sfxVolume ?? 0.7) * 100)}%`,
        `Music Volume: ${Math.round((settings.musicVolume ?? 0.7) * 100)}%`,
        '',
        'Controls:',
        'Arrow keys / WASD: navigate',
        'Enter / Space: confirm',
        'Escape / Backspace: back',
        'Battle: Fight, Ball, Creature, Run',
        'Rewards: Left / Right / Enter',
      ].join('\n'),
    );
  }

  private showInfoModal(title: string, body: string): void {
    this.modal?.destroy(true);
    const { width, height } = this.scale;
    const box = scaleRect({ x: 420, y: 220, width: 760, height: 320 }, width, height);
    const blocker = this.add.rectangle(0, 0, width, height, UI_THEME.colors.bg, 1)
      .setOrigin(0, 0)
      .setAlpha(0.72);
    const panel = new PixelPanel(this, box.x, box.y, box.width, box.height, {
      fill: UI_THEME.colors.panel,
      stroke: UI_THEME.colors.border,
    });
    const titleText = this.add.text(box.x + scaleX(24, width), box.y + scaleY(24, height), title, textStyle(28, UI_THEME.css.white, {
      fixedWidth: box.width - scaleX(48, width),
    }));
    const bodyText = this.add.text(box.x + scaleX(24, width), box.y + scaleY(72, height), body, textStyle(16, UI_THEME.css.text, {
      fixedWidth: box.width - scaleX(48, width),
      wordWrap: { width: box.width - scaleX(48, width) },
      lineSpacing: 4,
    }));
    const back = this.add.text(box.x + scaleX(56, width), box.y + box.height - scaleY(44, height), 'Back', textStyle(18, UI_THEME.css.accent))
      .setOrigin(0, 0.5);
    const bar = this.add.rectangle(box.x + scaleX(24, width), box.y + box.height - scaleY(60, height), scaleX(128, width), scaleY(32, height), UI_THEME.selection.fill, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, UI_THEME.selection.border);
    this.modal = this.add.container(0, 0, [blocker, panel.container, titleText, bodyText, bar, back])
      .setDepth(UI_THEME.depth.overlay);
  }

  private registerKeyboard(): void {
    this.input.keyboard?.on('keydown', this.handleKeyboard, this);
  }

  private handleKeyboard(event: KeyboardEvent): void {
    if (this.modal) {
      if (this.isConfirm(event) || this.isBack(event)) {
        AudioManager.play(this, 'ui_back');
        this.modal.destroy(true);
        this.modal = undefined;
      }
      return;
    }
    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
      this.moveSelection(-1);
    } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      this.moveSelection(1);
    } else if (this.isConfirm(event)) {
      const entry = this.entries[this.selectedIndex];
      if (!entry || entry.disabled) return;
      AudioManager.play(this, 'ui_confirm');
      entry.action();
    }
  }

  private moveSelection(delta: number): void {
    if (this.entries.length === 0) return;
    let next = this.selectedIndex;
    for (let attempts = 0; attempts < this.entries.length; attempts += 1) {
      next = Phaser.Math.Wrap(next + delta, 0, this.entries.length);
      if (!this.entries[next].disabled) {
        this.selectedIndex = next;
        AudioManager.play(this, 'ui_move');
        this.updateSelection();
        return;
      }
    }
  }

  private firstEnabledIndex(): number {
    return Math.max(0, this.entries.findIndex((entry) => !entry.disabled));
  }

  private updateSelection(): void {
    this.entryLabels.forEach((label, index) => {
      const entry = this.entries[index];
      label.setColor(index === this.selectedIndex && !entry.disabled ? UI_THEME.css.accent : entry.disabled ? UI_THEME.css.muted : UI_THEME.css.white);
      this.selectionBars[index]?.setVisible(index === this.selectedIndex && !entry.disabled);
    });
  }

  private isConfirm(event: KeyboardEvent): boolean {
    return event.code === 'Enter' || event.code === 'Space';
  }

  private isBack(event: KeyboardEvent): boolean {
    return event.code === 'Escape' || event.code === 'Backspace';
  }

  private drawBackground(width: number, height: number): void {
    const graphics = this.add.graphics();
    if (this.textures.exists(MENU_BACKGROUND_ASSETS.background.key)) {
      this.add.image(width / 2, height / 2, MENU_BACKGROUND_ASSETS.background.key).setDisplaySize(width, height);
      this.add.rectangle(0, 0, width, height, UI_THEME.colors.bg, 0.22).setOrigin(0, 0);
      if (this.textures.exists(MENU_BACKGROUND_ASSETS.particles.key)) {
        const particles = this.add.tileSprite(0, 0, width, height, MENU_BACKGROUND_ASSETS.particles.key)
          .setOrigin(0, 0)
          .setAlpha(0.55);
        this.tweens.add({
          targets: particles,
          tilePositionX: particles.tilePositionX + 120,
          tilePositionY: particles.tilePositionY - 30,
          duration: 28000,
          repeat: -1,
        });
      }
      this.addTwinkleStars(width, height);
      return;
    }
    graphics.fillStyle(UI_THEME.colors.bg);
    graphics.fillRect(0, 0, width, height);
    graphics.fillStyle(UI_THEME.colors.panel);
    graphics.fillRect(0, Math.round(height * 0.72), width, Math.round(height * 0.28));

    for (let i = 0; i < 70; i += 1) {
      const star = this.add.rectangle((i * 83) % width, 30 + ((i * 47) % 360), i % 3 === 0 ? 3 : 2, 2, UI_THEME.colors.muted, 0.7);
      this.tweens.add({
        targets: star,
        alpha: 0.25,
        duration: 800 + (i % 5) * 240,
        yoyo: true,
        repeat: -1,
      });
    }

    for (let i = 0; i < 5; i += 1) {
      const cloud = this.add.container(-180 + i * 310, 105 + (i % 3) * 54);
      const tint = UI_THEME.colors.border;
      cloud.add([
        this.add.rectangle(0, 0, 160, 18, tint, 1).setOrigin(0, 0),
        this.add.rectangle(34, -10, 94, 16, tint, 1).setOrigin(0, 0),
        this.add.rectangle(118, 7, 70, 12, tint, 1).setOrigin(0, 0),
      ]);
      this.tweens.add({
        targets: cloud,
        x: width + 220,
        duration: 26000 + i * 4200,
        repeat: -1,
        delay: i * 900,
      });
    }
  }

  private addTwinkleStars(width: number, height: number): void {
    for (let i = 0; i < 32; i += 1) {
      const star = this.add.rectangle(
        Math.round((i * 137) % width),
        Math.round(28 + ((i * 71) % Math.max(1, height * 0.58))),
        i % 4 === 0 ? 3 : 2,
        2,
        UI_THEME.colors.text,
        0.18 + (i % 3) * 0.12,
      );
      this.tweens.add({
        targets: star,
        alpha: 0.75,
        duration: 900 + (i % 6) * 180,
        yoyo: true,
        repeat: -1,
        delay: i * 37,
      });
    }
  }
}
