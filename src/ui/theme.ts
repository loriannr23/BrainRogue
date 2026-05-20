import Phaser from 'phaser';
import { CreatureType } from '../types/creature';
import { RewardRarity } from '../systems/progression/RewardSystem';

export const UI_THEME = {
  font: 'monospace',
  colors: {
    bg: 0x0b1220,
    bgAlt: 0x1e2a38,
    panel: 0x1e2a38,
    panelDark: 0x0b1220,
    panelLight: 0x2f4159,
    border: 0x2f4159,
    gold: 0xcdd6e0,
    text: 0xcdd6e0,
    white: 0xcdd6e0,
    muted: 0x9fb2d0,
    disabled: 0x5f708a,
    danger: 0x7ee0c6,
    success: 0x7ee0c6,
    warning: 0x2f4159,
    shadow: 0x0b1220,
    accent: 0x7ee0c6,
  },
  panels: {
    fill: 0x1e2a38,
    elevated: 0x1e2a38,
    quiet: 0x1e2a38,
    glass: 0x1e2a38,
  },
  borders: {
    default: 0x2f4159,
    active: 0x7ee0c6,
    subtle: 0x2f4159,
    danger: 0x7ee0c6,
  },
  css: {
    text: '#cdd6e0',
    white: '#cdd6e0',
    muted: '#9fb2d0',
    gold: '#cdd6e0',
    danger: '#7ee0c6',
    accent: '#7ee0c6',
    bg: '#0b1220',
  },
  spacing: {
    xs: 8,
    sm: 16,
    md: 16,
    lg: 24,
    xl: 48,
  },
  icons: {
    type: 16,
    reward: 48,
    cursorWidth: 16,
    cursorHeight: 24,
  },
  selection: {
    fill: 0x2f4159,
    border: 0x7ee0c6,
  },
  fontSizes: {
    tiny: 14,
    small: 14,
    body: 16,
    label: 20,
    title: 32,
    hero: 32,
  },
  depth: {
    background: 0,
    arena: 10,
    creatures: 30,
    ui: 100,
    overlay: 200,
  },
};

export const TYPE_COLORS: Record<CreatureType, number> = {
  meme: 0x7ee0c6,
  sound: 0x7ee0c6,
  chaos: 0x7ee0c6,
  water: 0x7ee0c6,
  fire: 0x7ee0c6,
  earth: 0x7ee0c6,
  air: 0x7ee0c6,
  electric: 0x7ee0c6,
  toxic: 0x7ee0c6,
  metal: 0x7ee0c6,
  psychic: 0x7ee0c6,
  ancient: 0x7ee0c6,
  food: 0x7ee0c6,
  shadow: 0x7ee0c6,
  light: 0x7ee0c6,
};

export const RARITY_COLORS: Record<RewardRarity, number> = {
  common: 0xcdd6e0,
  uncommon: 0xcdd6e0,
  rare: 0xcdd6e0,
  ultra: 0xcdd6e0,
  master: 0xcdd6e0,
};

export const colorToCss = (color: number): string => `#${color.toString(16).padStart(6, '0')}`;

export const textStyle = (
  fontSize: number,
  color = UI_THEME.css.text,
  extra: Phaser.Types.GameObjects.Text.TextStyle = {},
): Phaser.Types.GameObjects.Text.TextStyle => ({
  fontFamily: UI_THEME.font,
  fontSize: `${fontSize}px`,
  color,
  letterSpacing: 0,
  ...extra,
});
