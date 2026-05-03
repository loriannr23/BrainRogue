import Phaser from 'phaser';
import { ExtractedNineSliceAsset } from '../systems/assets/ExtractedUiAssetRegistry';
import { UI_THEME } from './theme';

export const createPokeRogueFrame = (
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  asset: ExtractedNineSliceAsset,
): Phaser.GameObjects.Container => {
  const container = scene.add.container(Math.round(x), Math.round(y));
  const corner = Math.min(asset.cornerSize, Math.floor(width / 2), Math.floor(height / 2));
  const innerWidth = Math.max(1, Math.round(width - corner * 2));
  const innerHeight = Math.max(1, Math.round(height - corner * 2));

  const fallback = scene.add.rectangle(0, 0, width, height, UI_THEME.colors.panel, 1)
    .setOrigin(0, 0)
    .setStrokeStyle(1, UI_THEME.colors.border);
  container.add(fallback);

  if (!hasFrameTextures(scene, asset)) {
    return container;
  }

  fallback.setVisible(false);
  container.add(scene.add.tileSprite(corner, corner, innerWidth, innerHeight, asset.center).setOrigin(0, 0));
  container.add(scene.add.tileSprite(corner, 0, innerWidth, corner, asset.edgeTop).setOrigin(0, 0));
  container.add(scene.add.tileSprite(corner, height - corner, innerWidth, corner, asset.edgeBottom).setOrigin(0, 0));
  container.add(scene.add.tileSprite(0, corner, corner, innerHeight, asset.edgeLeft).setOrigin(0, 0));
  container.add(scene.add.tileSprite(width - corner, corner, corner, innerHeight, asset.edgeRight).setOrigin(0, 0));
  container.add(scene.add.image(0, 0, asset.cornerTl).setOrigin(0, 0));
  container.add(scene.add.image(width - corner, 0, asset.cornerTr).setOrigin(0, 0));
  container.add(scene.add.image(0, height - corner, asset.cornerBl).setOrigin(0, 0));
  container.add(scene.add.image(width - corner, height - corner, asset.cornerBr).setOrigin(0, 0));
  return container;
};

const hasFrameTextures = (scene: Phaser.Scene, asset: ExtractedNineSliceAsset): boolean => [
  asset.cornerTl,
  asset.cornerTr,
  asset.cornerBl,
  asset.cornerBr,
  asset.edgeTop,
  asset.edgeBottom,
  asset.edgeLeft,
  asset.edgeRight,
  asset.center,
].every((key) => scene.textures.exists(key));
