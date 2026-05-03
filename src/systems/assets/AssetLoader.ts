import Phaser from 'phaser';
import { CreatureDefinition } from '../../types/creature';
import { preloadCreatureAssets } from './CreatureAssetRegistry';

export class AssetLoader {
  constructor(private readonly scene: Phaser.Scene) {}

  queueCreatureSprites(creatures: CreatureDefinition[]): void {
    preloadCreatureAssets(this.scene, creatures.map((creature) => creature.id));
  }

  queueCreatureSprite(id: string): void {
    preloadCreatureAssets(this.scene, [id]);
  }

  // Later this can be called right before rare encounters or new biomes.
  lazyLoadCreatureSprite(id: string, onComplete?: () => void): void {
    this.queueCreatureSprite(id);
    this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => onComplete?.());
    this.scene.load.start();
  }
}
