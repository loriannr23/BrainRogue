import Phaser from 'phaser';
import { gameConfig } from './game/config';
import './styles.css';

const game = new Phaser.Game(gameConfig);

declare global {
  interface Window {
    __BR_GAME__?: Phaser.Game;
  }
}

window.__BR_GAME__ = game;
