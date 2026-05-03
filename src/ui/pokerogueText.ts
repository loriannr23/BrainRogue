import Phaser from 'phaser';
import { UI_THEME } from './theme';

const POKEROGUE_TEXT_SCALE = 1 / 6;

export const createPokeRogueText = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  content: string,
  options: Phaser.Types.GameObjects.Text.TextStyle = {},
): Phaser.GameObjects.Text => {
  const text = scene.add.text(Math.round(x), Math.round(y), content, {
    fontFamily: 'emerald',
    fontSize: '96px',
    color: UI_THEME.css.white,
    padding: { bottom: 6 },
    letterSpacing: 0,
    ...options,
  });
  text.setResolution(1);
  text.setScale(POKEROGUE_TEXT_SCALE);
  text.setShadow(4, 5, UI_THEME.css.bg);
  if (!options.lineSpacing) {
    text.setLineSpacing(5);
  }
  text.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  return text;
};

export const setPokeRogueTextColor = (text: Phaser.GameObjects.Text, color: string): void => {
  text.setColor(color);
  text.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
};
