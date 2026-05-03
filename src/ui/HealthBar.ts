import Phaser from 'phaser';
import { POKEROGUE_UI } from '../systems/assets/PokeRogueUiAssetRegistry';
import { createPokeRogueText } from './pokerogueText';
import { UI_THEME } from './theme';

const HP_FRAME = {
  high: 'high',
  medium: 'medium',
  low: 'low',
} as const;

const HP_DRAIN_MS = 360;

export class HealthBar {
  readonly container: Phaser.GameObjects.Container;
  private readonly hpBar: Phaser.GameObjects.Image;
  private readonly expBar?: Phaser.GameObjects.Image;
  private readonly label: Phaser.GameObjects.Text;
  private readonly hpText: Phaser.GameObjects.Text;
  private readonly scene: Phaser.Scene;
  private lastRatio = 1;

  constructor(scene: Phaser.Scene, _x: number, _y: number, _width: number, label: string, side: 'player' | 'enemy' = 'player') {
    this.scene = scene;

    const isPlayer = side === 'player';
    const pos = isPlayer
      ? { x: 310, y: -72, boxKey: POKEROGUE_UI.playerInfo, nameX: -115, nameY: -15.2, hpX: -61, hpY: -1, hpTextX: -13, hpTextY: 8 }
      : { x: 140, y: -141, boxKey: POKEROGUE_UI.enemyInfo, nameX: -124, nameY: -11.2, hpX: -71, hpY: 4.5, hpTextX: -24, hpTextY: -5 };

    const box = scene.add.image(0, 0, pos.boxKey).setOrigin(1, 0.5);
    box.setTexture(pos.boxKey);

    this.label = createPokeRogueText(scene, pos.nameX, pos.nameY, label, {
      fontSize: '84px',
      color: UI_THEME.css.white,
      fixedWidth: isPlayer ? 864 : 840,
    }).setScale(1 / 12).setOrigin(0, 0);

    const hpBack = scene.add.rectangle(pos.hpX, pos.hpY, 48, 2, UI_THEME.colors.bg, 1).setOrigin(0, 0);
    this.hpBar = scene.add.image(pos.hpX, pos.hpY, POKEROGUE_UI.hp, HP_FRAME.high).setOrigin(0, 0);

    this.expBar = isPlayer
      ? scene.add.image(-98, 18, POKEROGUE_UI.exp).setOrigin(0, 0)
      : undefined;

    this.hpText = createPokeRogueText(scene, pos.hpTextX, pos.hpTextY, '', {
      fontSize: '72px',
      color: UI_THEME.css.white,
      align: 'right',
      fixedWidth: isPlayer ? 276 : 192,
    }).setScale(1 / 12).setOrigin(1, 0);

    const children: Phaser.GameObjects.GameObject[] = [box, hpBack, this.hpBar, this.label, this.hpText];
    if (this.expBar) children.splice(3, 0, this.expBar);
    this.container = scene.add.container(pos.x, pos.y, children);
  }

  setValue(current: number, max: number): Promise<void> {
    const ratio = Phaser.Math.Clamp(current / Math.max(1, max), 0, 1);
    const frame = ratio > 0.5 ? HP_FRAME.high : ratio > 0.25 ? HP_FRAME.medium : HP_FRAME.low;
    this.hpBar.setFrame(frame);
    this.scene.tweens.killTweensOf(this.hpBar);
    const duration = Math.abs(this.lastRatio - ratio) > 0.01 ? HP_DRAIN_MS : 0;
    this.lastRatio = ratio;
    this.hpText.setText(`${Math.max(0, current)}/${max}`);
    this.hpText.setColor(ratio <= 0.25 ? UI_THEME.css.accent : UI_THEME.css.white);
    if (duration === 0) {
      this.hpBar.setScale(ratio, this.hpBar.scaleY);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: this.hpBar,
        scaleX: ratio,
        duration,
        ease: 'Quad.easeOut',
        onComplete: () => resolve(),
      });
    });
  }

  setLabel(text: string): void {
    const compact = text.length > 18;
    this.label.setFontSize(compact ? 72 : 84);
    this.label.setText(this.fitLabel(text, compact ? 22 : 18));
    this.label.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  private fitLabel(text: string, maxLength: number): string {
    return text.length > maxLength ? `${text.slice(0, maxLength - 1)}.` : text;
  }
}
