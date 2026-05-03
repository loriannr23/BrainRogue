import Phaser from 'phaser';
import { EXTRACTED_UI } from '../../systems/assets/ExtractedUiAssetRegistry';
import { renderIconSafe } from '../../utils/renderIconSafe';

export const createPixelCursor = (
  scene: Phaser.Scene,
  x: number,
  baselineY: number,
): Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle => {
  return renderIconSafe(scene, EXTRACTED_UI.cursor.key, x, baselineY - 8, {
    boxWidth: 16,
    boxHeight: 16,
    maxWidth: 16,
    maxHeight: 16,
    missingAssetPath: EXTRACTED_UI.cursor.path,
    tint: undefined,
  });
};
