import { RunState, SaveData } from '../types/save';
import { LocalSaveService } from './save/LocalSaveService';

export class GameState {
  private static instance?: GameState;
  private readonly saveService = new LocalSaveService();
  save: SaveData = this.saveService.load();

  static get(): GameState {
    GameState.instance ??= new GameState();
    return GameState.instance;
  }

  startRun(run: RunState): void {
    this.save.runsPlayed += 1;
    this.save.currentRun = run;
    this.persist();
  }

  updateBestWave(wave: number): void {
    this.save.bestWave = Math.max(this.save.bestWave, wave);
    this.persist();
  }

  clearRun(): void {
    delete this.save.currentRun;
    this.persist();
  }

  persist(): void {
    this.saveService.save(this.save);
  }
}
