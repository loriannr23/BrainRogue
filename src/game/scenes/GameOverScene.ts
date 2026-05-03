import Phaser from 'phaser';
import { GameState } from '../../systems/GameState';
import { AudioManager } from '../../systems/audio/AudioManager';
import { MetaProgressionSystem } from '../../systems/progression/MetaProgressionSystem';
import { installPointerDebug } from '../../utils/inputDebug';
import { PixelButton } from '../../ui/PixelButton';
import { PixelPanel } from '../../ui/PixelPanel';
import { textStyle, UI_THEME } from '../../ui/theme';

export class GameOverScene extends Phaser.Scene {
  private readonly meta = new MetaProgressionSystem();
  private returningToMenu = false;
  private inputReadyAt = 0;

  constructor() {
    super('GameOverScene');
  }

  create(): void {
    const state = GameState.get();
    AudioManager.play(this, 'game_over');
    installPointerDebug(this);
    const run = state.save.currentRun;
    const wave = run?.wave ?? 0;
    const metaMessages = run
      ? this.meta.applyRunEnd(state.save, { wave, starterId: run.starterId, runCurrency: run.currency })
      : [];
    state.clearRun();

    this.add.rectangle(640, 360, 1280, 720, UI_THEME.colors.bg);
    new PixelPanel(this, 390, 170, 500, 330, { stroke: UI_THEME.colors.border, fill: UI_THEME.colors.bgAlt });
    this.add.text(640, 225, 'Game Over', textStyle(62, UI_THEME.css.danger, {
      align: 'center',
      fixedWidth: 460,
    })).setOrigin(0.5);
    this.add.text(640, 305, `Reached Wave ${wave}\nBest Wave ${state.save.bestWave}\nCoins ${state.save.currency}`, textStyle(23, UI_THEME.css.text, {
      align: 'center',
      fixedWidth: 420,
      lineSpacing: 2,
    })).setOrigin(0.5);
    this.add.text(640, 375, metaMessages.join('\n'), textStyle(15, UI_THEME.css.muted, {
      align: 'center',
      fixedWidth: 420,
      lineSpacing: 2,
    })).setOrigin(0.5);

    new PixelButton(this, 490, 430, 300, 58, 'Main Menu', () => this.scene.start('MainMenuScene'), {
      debugLabel: 'gameover:main',
      fontSize: 23,
    });
    this.returningToMenu = false;
    this.input.keyboard?.on('keydown', this.handleKeyboard, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown', this.handleKeyboard, this);
    });
    this.inputReadyAt = this.time.now + 1000;
  }

  private handleKeyboard(event: KeyboardEvent): void {
    if (this.returningToMenu || this.time.now < this.inputReadyAt) return;
    if (event.code === 'Enter' || event.code === 'Space' || event.code === 'Escape' || event.code === 'Backspace') {
      this.returningToMenu = true;
      this.time.delayedCall(0, () => this.scene.start('MainMenuScene'));
    }
  }
}
