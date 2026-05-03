import Phaser from 'phaser';
import { logMissingAsset } from './UiAssetRegistry';

const extractedPath = (path: string): string => `/assets/ui-extracted/${path}`;

export interface ExtractedNineSliceAsset {
  cornerSize: number;
  cornerTl: string;
  cornerTr: string;
  cornerBl: string;
  cornerBr: string;
  edgeTop: string;
  edgeBottom: string;
  edgeLeft: string;
  edgeRight: string;
  center: string;
}

const nineSlice = (id: string, cornerSize: number): ExtractedNineSliceAsset => ({
  cornerSize,
  cornerTl: `ui-extracted:${id}:corner_tl`,
  cornerTr: `ui-extracted:${id}:corner_tr`,
  cornerBl: `ui-extracted:${id}:corner_bl`,
  cornerBr: `ui-extracted:${id}:corner_br`,
  edgeTop: `ui-extracted:${id}:edge_top`,
  edgeBottom: `ui-extracted:${id}:edge_bottom`,
  edgeLeft: `ui-extracted:${id}:edge_left`,
  edgeRight: `ui-extracted:${id}:edge_right`,
  center: `ui-extracted:${id}:center`,
});

export const EXTRACTED_UI = {
  cursor: { key: 'ui-extracted:cursor', path: extractedPath('icons/cursor_e39c642a/icon.png') },
  battleSelect: { key: 'ui-extracted:bmenu_sel', path: extractedPath('icons/bmenu_sel_3cdaec83/icon.png') },
  menuSelect: { key: 'ui-extracted:mmenu_sel', path: extractedPath('icons/mmenu_sel_cf3aa4dc/icon.png') },
  hpOverlay: { key: 'ui-extracted:overlay_hp', path: extractedPath('icons/overlay_hp_0710fad1/icon.png') },
  hpBossOverlay: { key: 'ui-extracted:overlay_hp_boss', path: extractedPath('icons/overlay_hp_boss_b89a87fe/icon.png') },
  expOverlay: { key: 'ui-extracted:overlay_exp', path: extractedPath('icons/overlay_exp_1156cb11/icon.png') },
  frames: {
    message: nineSlice('overlay_message_99ab35a6', 16),
    playerInfo: nineSlice('pbinfo_player_bde6be98', 10),
    enemyInfo: nineSlice('pbinfo_enemy_mini_1a2c2001', 10),
    enemyBossInfo: nineSlice('pbinfo_enemy_boss_8f83e395', 10),
  },
};

export const preloadExtractedUiAssets = (scene: Phaser.Scene): void => {
  const assets = [
    EXTRACTED_UI.cursor,
    EXTRACTED_UI.battleSelect,
    EXTRACTED_UI.menuSelect,
    EXTRACTED_UI.hpOverlay,
    EXTRACTED_UI.hpBossOverlay,
    EXTRACTED_UI.expOverlay,
    ...Object.entries(EXTRACTED_UI.frames).flatMap(([, frame]) => [
      { key: frame.cornerTl, path: extractedPath(`slices/${frameId(frame)}/corner_tl.png`) },
      { key: frame.cornerTr, path: extractedPath(`slices/${frameId(frame)}/corner_tr.png`) },
      { key: frame.cornerBl, path: extractedPath(`slices/${frameId(frame)}/corner_bl.png`) },
      { key: frame.cornerBr, path: extractedPath(`slices/${frameId(frame)}/corner_br.png`) },
      { key: frame.edgeTop, path: extractedPath(`slices/${frameId(frame)}/edge_top.png`) },
      { key: frame.edgeBottom, path: extractedPath(`slices/${frameId(frame)}/edge_bottom.png`) },
      { key: frame.edgeLeft, path: extractedPath(`slices/${frameId(frame)}/edge_left.png`) },
      { key: frame.edgeRight, path: extractedPath(`slices/${frameId(frame)}/edge_right.png`) },
      { key: frame.center, path: extractedPath(`slices/${frameId(frame)}/center.png`) },
    ]),
  ];

  assets.forEach((asset) => {
    if (!scene.textures.exists(asset.key)) {
      scene.load.image(asset.key, asset.path);
    }
  });
};

const frameId = (frame: ExtractedNineSliceAsset): string => {
  const match = frame.center.match(/^ui-extracted:(.+):center$/);
  if (!match) {
    logMissingAsset(frame.center);
    return '';
  }
  return match[1];
};
