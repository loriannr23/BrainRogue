import Phaser from 'phaser';

export const fitSpriteToBox = (
  sprite: Phaser.GameObjects.Image,
  maxWidth: number,
  maxHeight: number,
  maxScale = Number.POSITIVE_INFINITY,
): number => {
  const frame = sprite.frame;
  const sourceWidth = frame.width || frame.realWidth || 1;
  const sourceHeight = frame.height || frame.realHeight || 1;
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight, maxScale);

  sprite.setOrigin(0.5, 0.5);
  sprite.setScale(scale);

  return scale;
};
