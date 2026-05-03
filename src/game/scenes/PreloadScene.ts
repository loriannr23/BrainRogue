import Phaser from 'phaser';
import { biomes } from '../../data/biomes';
import { creatures, getCreature } from '../../data/creatures';
import { starterIds } from '../../data/starters';
import { CreatureType } from '../../types/creature';
import {
  CREATURE_SPRITE_SIZE,
  creatureBackKey,
  creatureFrontKey,
  FALLBACK_BACK_KEY,
  FALLBACK_FRONT_KEY,
} from '../../systems/assets/SpriteSystem';
import { FALLBACK_ICON_KEY, getCreatureIconKey } from '../../systems/assets/CreatureAssetRegistry';
import { AssetLoader } from '../../systems/assets/AssetLoader';
import { createUiDerivedTextures, preloadUiAssets } from '../../systems/assets/UiAssetRegistry';
import { preloadExtractedUiAssets } from '../../systems/assets/ExtractedUiAssetRegistry';
import { preloadPokeRogueBattleUiAssets } from '../../systems/assets/PokeRogueUiAssetRegistry';
import { AudioManager } from '../../systems/audio/AudioManager';
import { TYPE_COLORS, UI_THEME } from '../../ui/theme';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    new AssetLoader(this).queueCreatureSprites(this.getReleaseCreaturePreloadList());
    preloadUiAssets(this);
    preloadExtractedUiAssets(this);
    preloadPokeRogueBattleUiAssets(this);
    AudioManager.preload(this);
  }

  create(): void {
    this.createFallbackTextures();
    createUiDerivedTextures(this);
    creatures.forEach((creature, index) => {
      this.createCreaturePlaceholderIfMissing(creatureFrontKey(creature.id), index, 'front', creature.types);
      this.createCreaturePlaceholderIfMissing(creatureBackKey(creature.id), index, 'back', creature.types);
      this.createCreatureIconPlaceholderIfMissing(getCreatureIconKey(creature.id), index, creature.types);
    });
    this.scene.start('MainMenuScene');
  }

  private createFallbackTextures(): void {
    this.createCreatureTexture(FALLBACK_FRONT_KEY, UI_THEME.colors.accent, 'front', ['meme']);
    this.createCreatureTexture(FALLBACK_BACK_KEY, UI_THEME.colors.border, 'back', ['meme']);
    this.createCreatureIconTexture(FALLBACK_ICON_KEY, UI_THEME.colors.accent, ['meme']);
  }

  private getReleaseCreaturePreloadList() {
    const contentIds = new Set<string>(starterIds);
    biomes.forEach((biome) => {
      biome.enemyPool.forEach((id) => contentIds.add(id));
      biome.bossPool.forEach((id) => contentIds.add(id));
    });
    return [...contentIds].map((id) => getCreature(id));
  }

  private createCreaturePlaceholderIfMissing(key: string, index: number, facing: 'front' | 'back', types: CreatureType[]): void {
    if (this.textures.exists(key)) return;
    const hue = Phaser.Display.Color.HSVColorWheel()[(index * 7) % 360].color;
    this.createCreatureTexture(key, hue, facing, types);
  }

  private createCreatureTexture(key: string, color: number, facing: 'front' | 'back', types: CreatureType[]): void {
    if (this.textures.exists(key)) return;

    const graphics = this.add.graphics();
    const accent = TYPE_COLORS[types[0]] ?? UI_THEME.colors.gold;
    graphics.clear();
    graphics.fillStyle(UI_THEME.colors.bg);
    graphics.fillRect(0, 0, CREATURE_SPRITE_SIZE, CREATURE_SPRITE_SIZE);
    graphics.fillStyle(UI_THEME.colors.border);
    graphics.fillEllipse(50, 82, 58, 14);
    graphics.fillStyle(color);
    graphics.fillRect(26, 26, 44, 38);
    graphics.fillRect(34, 16, 28, 18);
    graphics.fillStyle(accent);
    graphics.fillRect(22, 60, 52, 10);
    graphics.fillRect(facing === 'front' ? 18 : 64, 38, 10, 22);
    graphics.fillStyle(UI_THEME.colors.text);
    if (facing === 'front') {
      graphics.fillRect(38, 34, 7, 7);
      graphics.fillRect(55, 34, 7, 7);
      graphics.fillStyle(UI_THEME.colors.bg);
      graphics.fillRect(39, 35, 3, 3);
      graphics.fillRect(56, 35, 3, 3);
    } else {
      graphics.fillRect(34, 31, 30, 8);
      graphics.fillStyle(UI_THEME.colors.bg);
      graphics.fillRect(40, 34, 18, 4);
    }
    graphics.fillStyle(UI_THEME.colors.muted);
    graphics.fillRect(31, 23, 16, 5);
    graphics.generateTexture(key, CREATURE_SPRITE_SIZE, CREATURE_SPRITE_SIZE);
    graphics.destroy();
  }

  private createCreatureIconPlaceholderIfMissing(key: string, index: number, types: CreatureType[]): void {
    if (this.textures.exists(key)) return;
    const hue = Phaser.Display.Color.HSVColorWheel()[(index * 7) % 360].color;
    this.createCreatureIconTexture(key, hue, types);
  }

  private createCreatureIconTexture(key: string, color: number, types: CreatureType[]): void {
    if (this.textures.exists(key)) return;
    const graphics = this.add.graphics();
    const accent = TYPE_COLORS[types[0]] ?? UI_THEME.colors.gold;
    graphics.fillStyle(UI_THEME.colors.bg);
    graphics.fillRect(0, 0, 48, 48);
    graphics.lineStyle(3, accent);
    graphics.strokeRect(3, 3, 42, 42);
    graphics.fillStyle(color);
    graphics.fillRect(14, 14, 20, 20);
    graphics.fillStyle(UI_THEME.colors.text);
    graphics.fillRect(18, 19, 5, 5);
    graphics.fillRect(28, 19, 5, 5);
    graphics.fillStyle(accent);
    graphics.fillRect(11, 34, 26, 4);
    graphics.generateTexture(key, 48, 48);
    graphics.destroy();
  }
}
