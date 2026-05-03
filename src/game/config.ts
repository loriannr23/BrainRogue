import Phaser from 'phaser';
import { BattleScene } from './scenes/BattleScene';
import { BootScene } from './scenes/BootScene';
import { GameOverScene } from './scenes/GameOverScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { PreloadScene } from './scenes/PreloadScene';
import { RewardScene } from './scenes/RewardScene';
import { StarterSelectScene } from './scenes/StarterSelectScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b1220',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  input: {
    activePointers: 2,
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    StarterSelectScene,
    BattleScene,
    RewardScene,
    GameOverScene,
  ],
};
