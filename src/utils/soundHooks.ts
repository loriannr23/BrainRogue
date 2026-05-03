import Phaser from 'phaser';
import { AudioKey, AudioManager } from '../systems/audio/AudioManager';

export type SoundHook = AudioKey;

export const playSoundHook = (scene: Phaser.Scene, key: SoundHook): void => {
  AudioManager.play(scene, key);
};
