import Phaser from 'phaser';
import { GameState } from '../GameState';

export type AudioKey =
  | 'ui_move'
  | 'ui_confirm'
  | 'ui_back'
  | 'hit_light'
  | 'hit_heavy'
  | 'crit'
  | 'reward_pick'
  | 'wave_start'
  | 'victory'
  | 'game_over';

const SFX_ROOT = '/assets/audio/sfx';
const missingLogged = new Set<string>();

const audioPaths: Record<AudioKey, string> = {
  ui_move: `${SFX_ROOT}/ui_move.ogg`,
  ui_confirm: `${SFX_ROOT}/ui_confirm.ogg`,
  ui_back: `${SFX_ROOT}/ui_back.ogg`,
  hit_light: `${SFX_ROOT}/hit_light.ogg`,
  hit_heavy: `${SFX_ROOT}/hit_heavy.ogg`,
  crit: `${SFX_ROOT}/crit.ogg`,
  reward_pick: `${SFX_ROOT}/reward_pick.ogg`,
  wave_start: `${SFX_ROOT}/wave_start.ogg`,
  victory: `${SFX_ROOT}/victory.ogg`,
  game_over: `${SFX_ROOT}/game_over.ogg`,
};

export class AudioManager {
  static preload(scene: Phaser.Scene): void {
    scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      const src = file.src;
      if (typeof src === 'string' && src.includes('/assets/audio/')) {
        this.logMissing(src);
      }
    });
  }

  static play(scene: Phaser.Scene, key: AudioKey): void {
    if (!scene.cache.audio.exists(key)) {
      this.logMissing(audioPaths[key]);
      return;
    }

    const settings = GameState.get().save.settings;
    const master = settings.masterVolume ?? 1;
    const sfx = settings.sfxVolume ?? 0.7;
    scene.sound.play(key, { volume: master * sfx });
  }

  private static logMissing(path: string): void {
    if (!isDevMode() || missingLogged.has(path)) return;
    missingLogged.add(path);
    console.warn(`Missing asset: ${path}`);
  }
}

const isDevMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};
