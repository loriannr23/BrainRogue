import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    void this.loadFontsAndStart();
  }

  private async loadFontsAndStart(): Promise<void> {
    if (typeof document !== 'undefined') {
      await Promise.allSettled([
        document.fonts.load('96px emerald'),
        document.fonts.load('48px pkmnems'),
      ]);
    }
    this.scene.start('PreloadScene');
  }
}
