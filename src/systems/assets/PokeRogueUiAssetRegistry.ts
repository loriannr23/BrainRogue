import Phaser from 'phaser';
import { logMissingAsset } from './UiAssetRegistry';

const POKEROGUE_ASSET_ROOT = '/assets/pokerogue/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368/pokerogue-assets-dcb995ad78b738f82da5c9be2f4e771c5afe6368';
const UI_ROOT = `${POKEROGUE_ASSET_ROOT}/images/ui`;

export const POKEROGUE_UI = {
  bg: 'pokerogue:ui:bg',
  cursor: 'pokerogue:ui:cursor',
  window: 'pokerogue:ui:window_1',
  playerInfo: 'pokerogue:ui:pbinfo_player',
  enemyInfo: 'pokerogue:ui:pbinfo_enemy_mini',
  hp: 'pokerogue:ui:overlay_hp',
  exp: 'pokerogue:ui:overlay_exp',
};

const loadImage = (scene: Phaser.Scene, key: string, path: string): void => {
  if (scene.textures.exists(key)) return;
  scene.load.image(key, path);
};

const loadAtlas = (scene: Phaser.Scene, key: string, pathRoot: string): void => {
  if (scene.textures.exists(key)) return;
  scene.load.atlas(key, `${pathRoot}.png`, `${pathRoot}.json`);
};

export const preloadPokeRogueBattleUiAssets = (scene: Phaser.Scene): void => {
  scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
    logMissingAsset(file.src);
  });
  scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
    Object.values(POKEROGUE_UI).forEach((key) => {
      if (scene.textures.exists(key)) {
        scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    });
  });

  loadAtlas(scene, POKEROGUE_UI.bg, `${UI_ROOT}/bg`);
  loadAtlas(scene, POKEROGUE_UI.hp, `${UI_ROOT}/overlay_hp`);
  loadImage(scene, POKEROGUE_UI.cursor, `${UI_ROOT}/cursor.png`);
  loadImage(scene, POKEROGUE_UI.window, `${UI_ROOT}/windows/window_1.png`);
  loadImage(scene, POKEROGUE_UI.playerInfo, `${UI_ROOT}/pbinfo_player.png`);
  loadImage(scene, POKEROGUE_UI.enemyInfo, `${UI_ROOT}/pbinfo_enemy_mini.png`);
  loadImage(scene, POKEROGUE_UI.exp, `${UI_ROOT}/overlay_exp.png`);
};

export const hasPokeRogueBattleUiAssets = (scene: Phaser.Scene): boolean => (
  scene.textures.exists(POKEROGUE_UI.bg)
  && scene.textures.exists(POKEROGUE_UI.cursor)
  && scene.textures.exists(POKEROGUE_UI.window)
  && scene.textures.exists(POKEROGUE_UI.playerInfo)
  && scene.textures.exists(POKEROGUE_UI.enemyInfo)
  && scene.textures.exists(POKEROGUE_UI.hp)
  && scene.textures.exists(POKEROGUE_UI.exp)
);
