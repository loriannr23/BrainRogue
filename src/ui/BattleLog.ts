import Phaser from 'phaser';
import { POKEROGUE_UI } from '../systems/assets/PokeRogueUiAssetRegistry';
import { createPokeRogueText } from './pokerogueText';
import { UI_THEME } from './theme';

export class BattleLog {
  readonly container: Phaser.GameObjects.Container;
  private readonly text: Phaser.GameObjects.Text;
  private readonly maxVisibleLines: number;
  private readonly scene: Phaser.Scene;
  private lastText = '';

  constructor(scene: Phaser.Scene, _x: number, _y: number, _width: number, _height: number, maxVisibleLines = 2) {
    this.scene = scene;
    this.maxVisibleLines = maxVisibleLines;
    const background = scene.add.sprite(0, 0, POKEROGUE_UI.bg, '1').setOrigin(0, 1);
    this.text = createPokeRogueText(scene, 12, -36, '', {
      color: UI_THEME.css.white,
      fontSize: '66px',
      lineSpacing: 0,
      maxLines: maxVisibleLines,
      wordWrap: { width: 1032 },
    }).setOrigin(0, 0);

    this.container = scene.add.container(0, 0, [background, this.text]);
  }

  render(lines: string[]): void {
    const nextText = lines.slice(-this.maxVisibleLines).map((line) => line.trim()).filter(Boolean).join('\n');
    if (nextText === this.lastText) {
      return;
    }

    this.lastText = nextText;
    this.text.setText(nextText);
    this.scene.tweens.killTweensOf(this.text);
    if (!nextText) {
      this.text.setAlpha(1);
      return;
    }
    this.text.setAlpha(0.45);
    this.scene.tweens.add({
      targets: this.text,
      alpha: 1,
      duration: 90,
      ease: 'Quad.easeOut',
    });
  }
}
